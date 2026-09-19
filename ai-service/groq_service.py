import os
from groq import Groq

from dotenv import load_dotenv

load_dotenv()

class GroqService:

    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY")
        )

    def ask_ai(self, prompt: str, json_mode=False):

        request_data = {
            "model": "openai/gpt-oss-120b",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        if json_mode:
            request_data["response_format"] = {
                "type": "json_object"
            }

        response = self.client.chat.completions.create(
            **request_data
        )

        return response.choices[0].message.content
