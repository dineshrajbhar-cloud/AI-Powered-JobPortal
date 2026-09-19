from fastapi import FastAPI, UploadFile, File
from pypdf import PdfReader
from groq_service import GroqService
from job_service import JobService
import json
from models import JobMatchResponse

app = FastAPI()

groq_service = GroqService()
job_service = JobService()


@app.get("/")
def home():
    return {
        "message": "Job Portal AI Service is running"
    }


@app.get("/ai/test")
def test_ai():
    return {
        "message": "AI service connected successfully"
    }


@app.post("/ai/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):

    contents = await file.read()

    with open("temp_resume.pdf", "wb") as f:
        f.write(contents)

    reader = PdfReader("temp_resume.pdf")

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    prompt = f"""
    Analyze the following resume.

    Resume:
    {text}

    Provide:
    1. Professional summary
    2. Technical skills
    3. Education
    4. Projects
    5. Experience
    6. Strengths
    7. Missing or recommended skills
    """

    analysis = groq_service.ask_ai(prompt)

    return {
        "filename": file.filename,
        "analysis": analysis
    }


@app.get("/ai/groq-test")
def groq_test():

    prompt = "Explain what a Job Portal is in one short sentence."

    result = groq_service.ask_ai(prompt)

    return {
        "response": result
    }

@app.get("/ai/jobs")
def get_jobs():

    jobs = job_service.get_jobs()

    return {
        "jobs": jobs
    }

@app.post("/ai/match-jobs", response_model=JobMatchResponse)
async def match_jobs(file: UploadFile = File(...)):

    contents = await file.read()

    with open("temp_resume.pdf", "wb") as f:
        f.write(contents)

    reader = PdfReader("temp_resume.pdf")

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    jobs = job_service.get_jobs()

    prompt = f"""
    Analyze this resume and match it with the available jobs.

    RESUME:
    {text}

    AVAILABLE JOBS:
    {jobs}

    Return the result ONLY as valid JSON.

    JSON format:

    {{
        "matchedJobs": [
            {{
                "jobId": 1,
                "title": "Java Backend Developer",
                "company": "Test Company",
                "location": "Bangalore",
                "salary": 800000,
                "matchPercentage": 88,
                "reason": "Explain why the candidate matches this job."
            }}
        ]
    }}

    Rules:
    - Include only suitable jobs.
    - matchPercentage must be between 0 and 100.
    - jobId must come from the available jobs.
    - Do not return Markdown.
    - Do not return ```json.
    """

    result = groq_service.ask_ai(prompt, json_mode=True)

    result = json.loads(result)

    return {
        "filename": file.filename,
        "matchedJobs": result["matchedJobs"]
    }

