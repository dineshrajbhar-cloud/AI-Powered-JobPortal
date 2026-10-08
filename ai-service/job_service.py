import os
import httpx


class JobService:

    def get_jobs(self):

        backend_url = os.getenv(
            "BACKEND_URL",
            "http://localhost:9090"
        )

        response = httpx.get(
            f"{backend_url}/api/ai/jobs"
        )

        response.raise_for_status()

        jobs = response.json()

        return [
            {
                "id": job["id"],
                "title": job["title"],
                "description": job["description"],
                "company": job["company"],
                "location": job["location"],
                "salary": job["salary"]
            }
            for job in jobs
        ]