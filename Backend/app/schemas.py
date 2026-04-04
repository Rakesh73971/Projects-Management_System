from pydantic import BaseModel,EmailStr, Field
from typing import Optional,List
from datetime import datetime
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    designation: str
    tech_stack: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    designation: str
    tech_stack: str

    class Config:
        from_attributes = True

class OrganizationMemberCreate(BaseModel):
    user_id : int
    organization_id : int
    role : str

class OrganizationMemberUpdate(BaseModel):
    organization_id : Optional[str] = None
    role:Optional[str] = None

class OrganizationMemberResponse(OrganizationMemberCreate):
    id : int
    class Config:
        from_attributes = True

class OrganizationMemberResponseWithUser(BaseModel):
    id : int
    user_id : int
    organization_id : int
    role : str
    user: UserResponse
    
    class Config:
        from_attributes = True

class OrganizationCreate(BaseModel):
    name: str
    status: str
    description: str

class OrganizationUpdate(BaseModel):
    name:Optional[str] = None
    status:Optional[str] = None
    description:Optional[str] = None

class OrganizationResponse(OrganizationCreate):
    id : int
    createdAt : datetime
    updatedAt : datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name : str
    organizationId : int
    status : str
    description: str

class ProjectUpdate(BaseModel):
    name : Optional[str] = None
    organizationId : Optional[int] = None
    status : Optional[str] = None
    description: Optional[str] = None
class ProjectResponse(ProjectCreate):
    id : int
    createdAt : datetime
    updatedAt : datetime

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    id : Optional[int] = None
    

class TaskCreate(BaseModel):
    title : str
    project_id : int
    assigned_to : Optional[int] = None
    status : str
    priority : str
    description: str

class TaskUpdate(BaseModel):
    title : Optional[str] = None
    project_id : Optional[int] = None
    assigned_to : Optional[int] = None
    status : Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None

class TaskResponse(TaskCreate):
    id : int
    createdAt : datetime
    updatedAt : datetime

    class Config:
        from_attributes = True

class OrganizationPaginatedResponse(BaseModel):
    data : List[OrganizationResponse]
    total : int
    page : int
    totalPages : int
    class Config:
        from_attributes = True
class ProjectPaginatedResponse(BaseModel):
    data : List[ProjectResponse]
    total : int
    page : int
    totalPages : int

    class Config:
        from_attributes = True
class TaskPaginatedResponse(BaseModel):
    data : List[TaskResponse]
    total : int
    page : int
    totalPages : int

    class Config:
        from_attributes = True

class AIGeneratedTask(BaseModel):
    title: str = Field(..., description="A short, clear title for the task")
    description: str = Field(..., description="Detailed explanation of what needs to be done")
    priority: str = Field(..., description="Must be 'low', 'medium', or 'high'")
    reasoning: str = Field(..., description="Explain why this user is the best fit.")
    assigned_to: Optional[int] = Field(None)

class AIPlannerRequest(BaseModel):
    prompt: str = Field(..., example="We need to build a Stripe checkout page with webhooks.")

class TaskCreateRequest(BaseModel):
    title: str = Field(..., example="Create Postgres Database Tables")
    description: str = Field(..., example="Write SQLAlchemy models for User and Projects and run Alembic migrations.")
    priority: str = Field(default="medium", example="high")

# What we force the AI to return
class AIAssignmentResponse(BaseModel):
    assigned_to: int
    reason: str