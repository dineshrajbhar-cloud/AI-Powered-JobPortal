from pydantic import BaseModel, Field


class MatchedJob(BaseModel):
    jobId: int
    title: str
    company: str
    location: str
    salary: float
    matchPercentage: int = Field(ge=0, le=100)
    reason: str


class JobMatchResponse(BaseModel):
    matchedJobs: list[MatchedJob]