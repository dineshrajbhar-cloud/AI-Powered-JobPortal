import httpx


class JobService:

    def get_jobs(self):

        response = httpx.get(
            "http://localhost:9090/api/ai/jobs"
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