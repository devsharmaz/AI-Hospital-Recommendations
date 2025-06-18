from dotenv import load_dotenv
from groq import Groq
import os



class GroqManager:
    def __init__(self):
        load_dotenv(override=True)
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )
    
    def get_answer(self, system_prompt:str, input_text: str) -> str:
        """
        Get a response from the Groq model.
        """
        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": input_text,
                }
            ],
            model=os.environ.get("GROQ_MODEL"),    
            )

        return chat_completion.choices[0].message.content