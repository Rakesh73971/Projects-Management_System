from fastapi import APIRouter,status,HTTPException,Depends
from sqlalchemy.orm import Session
from .. import schemas,models
from ..database import get_db
from .. import utils

router = APIRouter(
    prefix='/users',
    tags=['Users']
)

@router.get('/{id}',status_code=status.HTTP_200_OK,response_model=schemas.UserResponse)
def get_user(id:int,db:Session=Depends(get_db)):
    user_db = db.query(models.User).filter(models.User.id == id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f'user is with {id} not found')
    return user_db

@router.post('/',status_code=status.HTTP_201_CREATED,response_model=schemas.UserResponse)
def create_user(user:schemas.UserCreate,db:Session=Depends(get_db)):
    hashed_password = utils.hash_password(user.password)
    user.password = hashed_password
    user_data = models.User(**user.dict())
    db.add(user_data)
    db.commit()
    db.refresh(user_data)
    return user_data

