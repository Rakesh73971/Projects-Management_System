from fastapi import APIRouter,status,HTTPException,Depends,Query
from .. import schemas,models
from sqlalchemy.orm import Session
from ..database import get_db
from typing import List,Optional
from sqlalchemy import asc,desc
from ..oauth2 import get_current_user
import math

router = APIRouter(prefix='/organizations',tags=['Organizations'])


@router.get('/',status_code=status.HTTP_200_OK,response_model=schemas.OrganizationPaginatedResponse)
def get_organizations(db:Session=Depends(get_db),current_user=Depends(get_current_user),limit:int=Query(10,ge=1,le=100),page:int=Query(1,ge=1),search:Optional[str]="",sort_by:str=Query("id"),order:str=Query("asc")):
    sort_feilds = {
        'id':models.Organization.id,
        'name':models.Organization.name,
        'status':models.Organization.status
    }

    query = db.query(models.Organization).filter(models.Organization.name.contains(search))
    total = query.count()
    totalpages = math.ceil(total/limit)
    offset = (page-1) * limit

    sort_column = sort_feilds.get(sort_by,models.Organization.id)

    if order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    organizations = query.limit(limit).offset(offset).all()
    
    return {
        'data':organizations,
        'total':total,
        'page':page,
        'totalPages':totalpages
    }
    

@router.get('/{id}',response_model=schemas.OrganizationResponse)
def get_organization(id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    organization = db.query(models.Organization).filter(models.Organization.id == id).first()
    if organization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'organization with id {id} not found')
    return organization

@router.post('/',status_code=status.HTTP_201_CREATED,response_model=schemas.OrganizationResponse)
def create_organization(organization:schemas.OrganizationCreate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    organization_data = models.Organization(**organization.dict())
    db.add(organization_data)
    db.commit()
    db.refresh(organization_data)
    return organization_data

@router.patch('/{id}',status_code=status.HTTP_202_ACCEPTED,response_model=schemas.OrganizationResponse)
def patch_organization(id:int,organization:schemas.OrganizationUpdate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == id).first()
    if db_org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'organization with id {id} not found')
    
    update_data = organization.dict(exclude_unset=True)

    if "name" in update_data:
        db_org.name = update_data["name"]
    if "status" in update_data:
        db_org.status = update_data["status"]
    if "description" in update_data:
        db_org.description = update_data["description"]

    db.commit()
    db.refresh(db_org)
    return db_org



@router.put('/{id}',status_code=status.HTTP_200_OK,response_model=schemas.OrganizationResponse)
def put_organization(id:int,organization:schemas.OrganizationCreate,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_org = db.query(models.Organization).filter(models.Organization.id == id).first()
    if db_org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'organization with id {id} not found')
    
    db_org.name = organization.name
    db_org.status = organization.status
    db_org.description = organization.description

    db.commit()
    db.refresh(db_org)
    return db_org


@router.delete('/{id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    db_member = db.query(models.Organization).filter(models.Organization.id == id).first()
    if db_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'organization with id {id} not found')
    db.delete(db_member)
    db.commit()
    return None
