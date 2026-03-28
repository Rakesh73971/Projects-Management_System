from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models,schemas
from app.dependencies import get_current_admin
from ..oauth2 import get_current_user
from .ai_service import generate_project_summary,generate_project_tasks,assign_task_with_ai


router = APIRouter(
    prefix="/ai",
    tags=["AI Planner"]
)


@router.get("/project-report/{project_id}")
async def project_report(project_id: int, db: Session = Depends(get_db)):
    
    
    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this project")

    total_tasks = len(tasks)
    completed = len([t for t in tasks if t.status == "completed"])
    in_progress = len([t for t in tasks if t.status == "in-progress"])
    pending = len([t for t in tasks if t.status == "pending"])
    
    
    progress = int((completed / total_tasks) * 100) if total_tasks > 0 else 0

    
    task_list = "\n".join([
        f"- [{task.priority.upper()}] {task.title} (Status: {task.status})" 
        for task in tasks[:50]
    ])

    ai_summary = await generate_project_summary(
        total_tasks,
        completed,
        in_progress,
        pending,
        task_list
    )

    return {
        "project_id": project_id,
        "metrics": {
            "total_tasks": total_tasks,
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "progress_percentage": progress
        },
        "ai_summary": ai_summary
    }



@router.post("/projects/{project_id}/auto-plan", status_code=status.HTTP_201_CREATED)
async def auto_plan_project(
    project_id: int,
    request: schemas.AIPlannerRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):


    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    
    get_current_admin(
        db=db,
        user_id=current_user.id,
        organization_id=project.organizationId
    )

    
    org_members = db.query(models.User).join(
        models.OrganizationMember,
        models.User.id == models.OrganizationMember.user_id
    ).filter(
        models.OrganizationMember.organization_id == project.organizationId
    ).all()

    if not org_members:
        raise HTTPException(
            status_code=400,
            detail="No users found in this organization to assign tasks to."
        )

    users_context = "\n".join([
        f"ID: {user.id} | Name: {user.name} | Role: {user.designation} | Skills: {user.tech_stack}"
        for user in org_members
    ])

    generated_tasks = await generate_project_tasks(request.prompt, users_context)

    if not generated_tasks:
        raise HTTPException(
            status_code=503,
            detail="Failed to generate tasks"
        )

    new_db_tasks = []

    for task_data in generated_tasks:
        validated_task = schemas.AIGeneratedTask(**task_data)

        new_task = models.Task(
            title=validated_task.title,
            description=validated_task.description,
            priority=validated_task.priority,
            status="planned",
            project_id=project_id,
            assigned_to=validated_task.assigned_to
        )

        new_db_tasks.append(new_task)

    db.add_all(new_db_tasks)
    db.commit()

    for task in new_db_tasks:
        db.refresh(task)

    return {
        "message": "Success",
        "tasks_created": new_db_tasks
    }

@router.post("/{project_id}/tasks/smart-create", status_code=status.HTTP_201_CREATED)
async def smart_create_task(
    project_id: int,
    request: schemas.TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    
    get_current_admin(
        user_id=current_user.id,
        organization_id=project.organizationId,
        db=db
    )

    org_members = db.query(models.User).join(
        models.OrganizationMember,
        models.User.id == models.OrganizationMember.user_id
    ).filter(
        models.OrganizationMember.organization_id == project.organizationId
    ).all()

    if not org_members:
        raise HTTPException(status_code=400, detail="No users available in this organization.")

    valid_user_ids = [u.id for u in org_members]

    
    users_context = "\n".join([
        f"ID: {u.id} | Name: {u.name} | Role: {u.designation} | Skills: {u.tech_stack}"
        for u in org_members
    ])

    ai_decision = await assign_task_with_ai(
        request.title,
        request.description,
        users_context
    )

    if not ai_decision or "assigned_to" not in ai_decision:
        raise HTTPException(
            status_code=503,
            detail="AI Routing failed to provide a valid assignment."
        )

    
    chosen_id = ai_decision.get("assigned_to")
    if chosen_id not in valid_user_ids:
        chosen_id = None

    new_task = models.Task(
        title=request.title,
        description=request.description,
        priority=request.priority,
        project_id=project_id,
        status="planned",
        assigned_to=chosen_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created and smartly routed.",
        "task": new_task,
        "ai_insight": {
            "assigned_user_id": chosen_id,
            "routing_reason": ai_decision.get("reason", "No reason provided by AI.")
        }
    }