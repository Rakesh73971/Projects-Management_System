import logging
import google.generativeai as genai
from app.config import settings
import json


genai.configure(api_key=settings.gemini_api_key)

model = genai.GenerativeModel("gemini-2.5-flash")


async def generate_project_summary(total_tasks, completed, in_progress, pending, task_list):
    prompt = f"""
    You are an expert technical project manager analyzing a project's health.
    
    Project metrics:
    - Total: {total_tasks} | Completed: {completed} | In Progress: {in_progress} | Pending: {pending}
    
    Recent/Active Tasks Context:
    {task_list}
    
    Task: Write a concise executive summary (maximum 3 sentences). 
    Focus on the overall progress, highlight any high-priority tasks that are pending or stuck, and suggest a quick next step.
    """
    
    try:
        
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        
        logging.error(f"Failed to generate AI summary: {str(e)}")
        return "AI summary is currently unavailable. Please refer to the raw metrics."
    

async def generate_project_tasks(project_prompt: str, available_users: str):
    prompt = f"""
    You are an expert Technical Project Manager.
    A user wants to add this feature: "{project_prompt}"
    
    Break this down into 3 to 6 actionable tasks.
    
    AVAILABLE TEAM MEMBERS & SKILLS:
    {available_users}
    
    RULES:
    1. Respond STRICTLY with a valid JSON array of objects. Do NOT use markdown code blocks.
    2. INTELLIGENT ROUTING: Assign each task to the team member whose Role and Skills best match the technical requirements of the task.
    3. Each task must have EXACTLY ONE owner.
    4. Each object MUST have these exact keys: 
       - "title" (string)
       - "description" (string)
       - "priority" ("low", "medium", or "high")
       - "reasoning" (string - briefly explain why this user's tech stack is a match BEFORE giving the ID).
       - "assigned_to" (integer - MUST be one of the IDs from the team members list above). """
    
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
             raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        return json.loads(raw_text.strip())
        
    except json.JSONDecodeError as e:
        print(f"\n--- AI JSON ERROR ---\n{response.text}\n---------------------\n")
        logging.error(f"AI returned invalid JSON: {e}")
        return None
    except Exception as e:
        logging.error(f"AI generation failed: {str(e)}")
        return None
    
async def assign_task_with_ai(task_title: str, task_desc: str, users_context: str):
    prompt = f"""
    You are an intelligent Engineering Manager routing tasks to the best team member.
    
    TASK TO ASSIGN:
    Title: {task_title}
    Description: {task_desc}
    
    AVAILABLE TEAM MEMBERS:
    {users_context}
    
    RULES:
    1. Analyze the task and match it to the team member whose "Role" and "Skills" best fit.
    2. Respond STRICTLY with a valid JSON object. No markdown code blocks.
    3. The JSON MUST contain exactly:
       - "assigned_to": (integer) The ID of the chosen member.
       - "reason": (string) A 1-sentence explanation of why they match.
    """
    
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("```").replace("json", "", 1).strip()
        
        data = json.loads(raw_text)
        
    
        return data
        
    except Exception as e:
        logging.error(f"AI task routing failed: {str(e)}")
        return None