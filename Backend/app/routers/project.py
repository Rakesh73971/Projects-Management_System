from fastapi import APIRouter,status,HTTPException,Depends,Query
from sqlalchemy import asc,desc
from sqlalchemy.orm import Session
from .. import schemas,models
from ..database import get_db
from typing import List,Optional
from ..oauth2 import get_current_user
import math

router = APIRouter(
    prefix='/projects',
    tags=['Projects']
)

@router.get('/',status_code=status.HTTP_200_OK,response_model=schemas.ProjectPaginatedResponse)
def get_projects(db:Session=Depends(get_db),current_user=Depends(get_current_user),limit:int=Query(10,ge=1,le=10),page:int=Query(1,ge=1),search:Optional[str]="",sort_by:str=Query('id'),order:str=Query('asc')):

    sort_fields = {
        'id':models.Project.id,
        'name':models.Project.name,
        'status':models.Project.status
    }
    query = db.query(models.Project).filter(models.Project.name.contains(search))

    total = query.count()
    total_pages = math.ceil(total/limit)
    offset = (page-1) * limit

    sort_column = sort_fields.get(sort_by,models.Project.id)

    if order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    projects = query.limit(limit).offset(offset).all()

    return {
        'data':projects,
        'total':total,
        'page':page,
        'totalPages':total_pages
    }

@router.get('/{id}',status_code=status.HTTP_200_OK,response_model=schemas.ProjectResponse)
def get_project(id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == id).first()
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'project with id {id} not found')
    return db_project


@router.post('/',status_code=status.HTTP_201_CREATED,response_model=schemas.ProjectResponse)
def create_project(project:schemas.ProjectCreate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    project=models.Project(**project.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.patch('/{id}',status_code=status.HTTP_202_ACCEPTED,response_model=schemas.ProjectResponse)
def update_project(id:int,project:schemas.ProjectUpdate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == id)
    if db_project.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'project with id {id} not found')
    db_project.update(project.dict(exclude_unset=True),synchronize_session=False)
    db.commit()
    return db_project.first()



@router.put('/{id}',status_code=status.HTTP_202_ACCEPTED,response_model=schemas.ProjectResponse)
def update_project(id:int,project:schemas.ProjectCreate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == id)
    if db_project.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'project with id {id} not found')
    db_project.update(project.dict(),synchronize_session=False)
    db.commit()
    return db_project.first()

@router.delete('/{id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_project(id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_project = db.query(models.Project).filter(models.Project.id == id).first()
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'project with id {id} not found')
    db.delete(db_project)
    db.commit()
    return None
