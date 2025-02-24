from fastapi import FastAPI, HTTPException, Depends
import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import List, Dict, Optional
from google import genai
from datetime import date

load_dotenv()

ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
PAGE_ID = "145247595328632"

GEMINI_API_KEY = os.getenv("GOOGEL_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)


class Message(BaseModel):
    user_id: str
    created_time: str
    message: str
    sender: str

class Conversation(BaseModel):
    conversation_id: str
    conversation_name: str
    subscription_date: Optional[str]
    messages: list[Message]

class FormattedResponse(BaseModel):
    conversations: list[Conversation]

class MessageInput(BaseModel):
    message: str
    sender: str
    created_time: str

class ConversationInput(BaseModel):
    conversation_id: str
    messages: list[MessageInput]


class ConversationAnalysis(BaseModel):
    analysis: str



@app.get("/fb/")
def get_facebook_messages():
    if not ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Missing Facebook Access Token")
    
    url = f"https://graph.facebook.com/v22.0/{PAGE_ID}/conversations?fields=messages{{message,from,created_time}}&access_token={ACCESS_TOKEN}"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    
    
    data = response.json()

    formatted_conversations = []
    page_owner = "Ai Egypt"
    subscription_keyword = "وصل"
    
    for conversation in data.get("data", []):
        messages = []
        conversation_name = None
        subscription_date = None
        
        for msg in conversation.get("messages", {}).get("data", []):
            sender = msg["from"]["name"]
            user_id = msg["from"]["id"]
            if sender != page_owner and conversation_name is None:
                conversation_name = sender
            if subscription_keyword in msg["message"].lower():
                subscription_date = msg["created_time"]
            messages.append(
                Message(
                    message=msg["message"],
                    sender=sender,
                    created_time=msg["created_time"],
                    user_id=user_id
                )
            )
        
        formatted_conversations.append(
            Conversation(
                conversation_id=conversation["id"],
                conversation_name=conversation_name if conversation_name else "Unknown",
                subscription_date=subscription_date,
                messages=messages
            )
        )
    
    return FormattedResponse(conversations=formatted_conversations)





@app.post("/analyze-messages", response_model=ConversationAnalysis)
async def analyze_messages(conversation: ConversationInput):
    try:
        conversation_text = conversation

        today_date = date.today().strftime("%Y-%m-%d")
        prompt = f"""أنت مساعد مبيعات شاطر. حلّل المحادثة وطلع لنا فقرة قصيرة بس دسمة، فيها:  

1. هل الزبون اشترك؟ (دقق في كلمة "وصل" أو أي نية واضحة) وخد بالك من وقت الاشتراك عشان نعرف هل هو خلص ولا لسه مستمر  
2. إيه اهتماماته أو مخاوفه الأساسية؟  
3. لو اشترك: إزاي نبيع له أكتر؟  
4. لو لسه: إزاي نقنعه يشترك؟  
5. الخطوة اللي لازم وكيل المبيعات يعملها بعد كده  
6. رسالة تبدأ بيها الكلام مع الزبون (حطها في سطر لوحدها)  

اكتب بالعامية، خلي أسلوبك سلس ومبدع، وخد بالك من توقيت الرسائل عشان نوصل في الوقت الصح.

تاريخ النهاردة : {today_date}
        المحادثة:
        {conversation_text}
        """

        client = genai.Client(api_key=GEMINI_API_KEY)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt])
        
        return ConversationAnalysis(analysis=response.text)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing messages: {str(e)}"
        )