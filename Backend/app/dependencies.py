from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from . import models

def get_current_admin(
    user_id: int,
    organization_id: int,
    db: Session = Depends(get_db)
):

    member = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.user_id == user_id,
        models.OrganizationMember.organization_id == organization_id
    ).first()

    if not member or member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins are allowed"
        )

    return True