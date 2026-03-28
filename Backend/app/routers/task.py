from fastapi import HTTPException,status,Depends,APIRouter,Query
from sqlalchemy import asc,desc
from sqlalchemy.orm import Session
from .. import models,schemas
from ..database import get_db
from ..oauth2 import get_current_user
from app.dependencies import get_current_admin
from typing import List,Optional
import math

router = APIRouter(
    prefix='/tasks',
    tags=['Tasks']
)

@router.get('/', status_code=status.HTTP_200_OK, response_model=schemas.TaskPaginatedResponse)
def get_tasks(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=10),
    page: int = Query(1, ge=1),
    search: Optional[str] = "",
    sort_by: str = Query('id'),
    order: str = Query('asc')
):

    sort_fields = {
        'id': models.Task.id,
        'title': models.Task.title,
        'status': models.Task.status,
        'priority': models.Task.priority
    }
    
    member = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins are allowed"
        )

    
    get_current_admin(
        user_id=current_user.id,
        organization_id=member.organization_id,
        db=db
    )
    query = db.query(models.Task).join(
        models.Project, models.Task.project_id == models.Project.id
    ).filter(
        models.Project.organizationId == member.organization_id,
        models.Task.title.contains(search)
    )
    total = query.count()
    total_pages = math.ceil(total / limit)
    offset = (page - 1) * limit

    sort_column = sort_fields.get(sort_by, models.Task.id)

    if order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    tasks = query.limit(limit).offset(offset).all()
    return {
        "data": tasks,
        "total": total,
        "page": page,
        "totalPages": total_pages
    }

@router.get('/{id}',status_code=status.HTTP_200_OK,response_model=schemas.TaskResponse)
def get_tasks(id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'task with id {id} not found')
    
    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )
    return task

@router.post('/', status_code=status.HTTP_201_CREATED, response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    
    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    
    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )

    
    new_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        project_id=task.project_id,
        assigned_to=task.assigned_to
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@router.put('/{id}', status_code=status.HTTP_202_ACCEPTED, response_model=schemas.TaskResponse)
def update_task(
    id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    db_task = db.query(models.Task).filter(models.Task.id == id).first()

    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'task with id {id} not found'
        )

    project = db.query(models.Project).filter(
        models.Project.id == db_task.project_id
    ).first()

    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )

    db.query(models.Task).filter(models.Task.id == id).update(
        task.dict(),
        synchronize_session=False
    )
    db.commit()

    return db.query(models.Task).filter(models.Task.id == id).first()

@router.patch('/{id}', status_code=status.HTTP_202_ACCEPTED, response_model=schemas.TaskResponse)
def update_task(
    id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    db_task = db.query(models.Task).filter(models.Task.id == id).first()

    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'task with id {id} not found'
        )
    
    project = db.query(models.Project).filter(
        models.Project.id == db_task.project_id
    ).first()
    
    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )
    db.query(models.Task).filter(models.Task.id == id).update(
        task.dict(exclude_unset=True),
        synchronize_session=False
    )
    db.commit()
    return db.query(models.Task).filter(models.Task.id == id).first()

@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == id).first()

    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'task with id {id} not found'
        )
    
    project = db.query(models.Project).filter(
        models.Project.id == db_task.project_id
    ).first()

    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )

    db.delete(db_task)
    db.commit()

    return None