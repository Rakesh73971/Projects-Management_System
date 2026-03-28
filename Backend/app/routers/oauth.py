from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter,HTTPException,status,Depends
from .. import models,database,utils,oauth2
from sqlalchemy.orm import Session

router = APIRouter(
    prefix='/login',
    tags=['Authentication']
)

@router.post('/')
def user_login(user_crdentials:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_crdentials.username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail='Invalid Credentials')
    if not utils.verify_password(user_crdentials.password,user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail='Invalid Crednetials')
    access_token = oauth2.create_access_token(data={'user_id':user.id})
    return {'acess_token':access_token,'token_type':'bearer'}
    
