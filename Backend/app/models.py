from .database import Base
from sqlalchemy import Column,Integer,String,Text,TIMESTAMP,ForeignKey
from sqlalchemy import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    email = Column(String,unique=True,nullable=False)
    password = Column(String,nullable=False)
    designation = Column(String, nullable=True) 
    tech_stack = Column(String, nullable=True)

class Organization(Base):
    __tablename__="organizations"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,unique=True,nullable=False)
    status = Column(String,server_default="active",nullable=False)
    description = Column(Text)
    createdAt = Column(TIMESTAMP(timezone=True),server_default=func.now(),nullable=False)
    updatedAt = Column(TIMESTAMP(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)
class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String, server_default="member")



class Project(Base):
    __tablename__="projects"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    organizationId = Column(Integer,ForeignKey("organizations.id"),nullable=False)
    status = Column(String,server_default='planned',nullable=False)
    description = Column(Text)
    createdAt = Column(TIMESTAMP(timezone=True),server_default=func.now(),nullable=False)
    updatedAt = Column(TIMESTAMP(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)



class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    status = Column(String, server_default="in-progress", nullable=False)
    priority = Column(String, server_default="medium", nullable=False)

    description = Column(Text)

    createdAt = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

