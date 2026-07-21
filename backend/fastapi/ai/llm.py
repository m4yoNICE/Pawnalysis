from dotenv import load_dotenv
from groq import Groq
import os
import random
import json
from ai.prompt import get_prompt

load_dotenv(override=True)
api_key = os.getenv("GROQ_API_KEY")
print(f"KEY LOADED: {api_key[:4]}...{api_key[-4:]}")
client = Groq(api_key=api_key)

def generate_commentary(results: list):
    styles = ["mommy", "tsun", "yunjin", "yuuka"]
    style = random.choice(styles)
    persona = get_prompt(style)

    # 1. Calculate the counters to fix the NameError
    blunders = sum(1 for m in results if m['classification'] == 'blunder')
    mistakes = sum(1 for m in results if m['classification'] == 'mistake')
    brilliant = sum(1 for m in results if m['classification'] == 'brilliant')

    # Filter only highlighted moves
    highlighted = [
        (i, m) for i, m in enumerate(results)
        if m['classification'] in ["blunder", "mistake", "brilliant", "great"]
    ]

    commentaries = [""] * len(results)

    if highlighted:
        moves_text = ""
        for i, move in highlighted:
            eval_data = move['evaluation']
            val = eval_data['value']
            eval_str = f"+{val/100:.2f}" if eval_data['type'] == 'cp' else f"#{abs(val)}"
            moves_text += f"Move {i+1}: {move['move']} {eval_str} [{move['symbol']}] ({move['classification']})\n"

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}, # Forces Llama to reply in valid JSON
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"{persona}\n"
                            f"You are a game commentator analyzing a chess game. You are not a player.\n"
                            "Analyze the highlighted moves provided by the user. These are critical moments.\n"
                            "For each move, explain WHY it was a blunder/mistake/brilliant/great move based on the evaluation.\n"
                            "Keep it to 2-3 sentences max per move: Tactical idea + consequence + coaching tip.\n"
                            "Return RAW JSON ONLY. An object with move numbers as string keys (e.g., '14'). Do not include markdown backticks."
                        )
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Game stats: {len(results)} total moves, {blunders} blunders, "
                            f"{mistakes} mistakes, {brilliant} brilliant moves.\n\n"
                            f"Moves to analyze:\n{moves_text}\n" # <-- INJECTED MISSING MOVES TEXT HERE
                            "Provide the step-by-step move commentary matching the JSON schema requested."
                        )
                    }
                ]
            )
            text = response.choices[0].message.content.strip()
            
            # Clean out markdown formatting if the model slipped up and added them anyway
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                    
            parsed = json.loads(text.strip())
            for i, _ in highlighted:
                commentaries[i] = parsed.get(str(i + 1), "[Commentary unavailable]")
        except Exception as e:
            print(f"COMMENTARY ERROR: {e}")

    # generate overall summary
    summary = generate_summary(results, persona)
    return commentaries, summary


def generate_summary(results: list, persona: str):
    blunders = sum(1 for m in results if m['classification'] == 'blunder')
    mistakes = sum(1 for m in results if m['classification'] == 'mistake')
    brilliant = sum(1 for m in results if m['classification'] == 'brilliant')

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"{persona}\nWrite a snappy 3-4 sentence overall game summary. Be honest about performance."
                },
                {
                    "role": "user",
                    "content": f"Game stats: {len(results)} moves, {blunders} blunders, {mistakes} mistakes, {brilliant} brilliant moves. Summarize the game."
                }
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"SUMMARY ERROR: {e}")
        return "[Summary unavailable]"