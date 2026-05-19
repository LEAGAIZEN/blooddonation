"""
routes/chat.py — AI-powered chatbot for the Blood Donation Management System.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest, ChatMessage

# IMPORTANT:
# This creates all routes under /chat
router = APIRouter(prefix="/chat", tags=["AI Chat"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"

SYSTEM_PROMPT = """
You are a helpful assistant for a Blood Donation Management System (BDMS).

Your role is to help users with:
- Blood donation eligibility
- Blood group compatibility
- Donation guidance
- Blood request guidance
- Donation camp information
- General blood donation FAQs

Keep answers concise, accurate, and compassionate.
"""


# ─────────────────────────────────────────────────────────────
# SIMPLE LOCAL CHAT ENDPOINT
# Frontend calls: POST /chat
# ─────────────────────────────────────────────────────────────

@router.post("")
async def chat_endpoint():

    return {
        "reply": "Hello! I am HemaAssist AI. How can I help you today?"
    }


# ─────────────────────────────────────────────────────────────
# OPTIONAL REAL AI ENDPOINT
# Frontend can later call: POST /chat/message
# ─────────────────────────────────────────────────────────────

@router.post("/message")
async def chat_message(request: ChatRequest):

    if not ANTHROPIC_API_KEY:
        return {
            "reply": "AI service is not configured yet."
        }

    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.history
    ]

    messages.append({
        "role": "user",
        "content": request.message
    })

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": MODEL,
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": messages,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                ANTHROPIC_API_URL,
                json=payload,
                headers=headers
            )

            resp.raise_for_status()
            data = resp.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI API error: {e.response.text}"
        )

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach AI service: {str(e)}"
        )

    reply = data["content"][0]["text"]

    updated_history = request.history + [
        ChatMessage(role="user", content=request.message),
        ChatMessage(role="assistant", content=reply),
    ]

    return {
        "reply": reply,
        "history": updated_history,
    }