"""
SequenceMe - FastAPI Backend
"""

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from analysis import create_job, run_analysis_async, jobs, STEPS

app = FastAPI(title="SequenceMe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(tempfile.gettempdir()) / "sequenceme_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...), name: str = Form(default="")):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    job_id = create_job()
    dest = UPLOAD_DIR / f"{job_id}_genome.txt"
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    run_analysis_async(job_id, dest, name or None)
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
async def status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    j = jobs[job_id]
    return {
        "status": j["status"],
        "step": j["step"],
        "steps_completed": j["steps_completed"],
        "steps_total": STEPS,
        "progress": j["progress"],
        "error": j["error"],
    }


@app.get("/api/results/{job_id}")
async def results(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    j = jobs[job_id]
    if j["status"] != "complete":
        raise HTTPException(400, f"Job not complete (status: {j['status']})")
    return j["results"]
