from dotenv import load_dotenv
from groq import AsyncGroq
import os
import random
import logging
from ai.prompt import get_prompt

load_dotenv(override=True)
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

logger = logging.getLogger(__name__)


async def generate_commentary(results: list):
    styles = ["mommy", "tsun", "yunjin", "yuuka"]
    style = random.choice(styles)
    persona = get_prompt(style)

    blunders = sum(1 for m in results if m['classification'] == 'blunder')
    mistakes = sum(1 for m in results if m['classification'] == 'mistake')
    brilliant = sum(1 for m in results if m['classification'] == 'brilliant')
    great = sum(1 for m in results if m['classification'] == 'great')

    highlighted = [
        (i, m) for i, m in enumerate(results)
        if m['classification'] in ["blunder", "mistake", "brilliant", "great"]
    ]

    moves_text = ""
    for i, move in highlighted:
        eval_data = move['evaluation']
        val = eval_data['value']
        eval_str = f"{val/100:+.2f}" if eval_data['type'] == 'cp' else f"#{abs(val)}"
        best_move = move.get('best_move')
        better_line = f" | Engine's preferred move: {best_move}" if best_move and best_move != move['move'] else ""
        moves_text += f"Move {i+1}: {move['move']} {eval_str} [{move['symbol']}] ({move['classification']}){better_line}\n"

    return await generate_summary(results, persona, moves_text, blunders, mistakes, brilliant, great)


async def generate_summary(results, persona, moves_text, blunders, mistakes, brilliant, great):
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": (
                    f"{persona}\n"
                    "You are a game commentator writing a full post-game analysis report for a chess game.\n"
                    "This is the ONLY commentary the player will see, so be thorough — do not artificially "
                    "limit length. Write as much as the game actually warrants.\n\n"
                    "Structure your report with these sections:\n"
                    "- Opening: brief note on the opening played and how it went\n"
                    "- Critical Moments: walk through EACH flagged critical moment (blunder/mistake/brilliant/great) "
                    "individually, explaining what happened and why it mattered\n"
                    "- Turning Points: identify the moment(s) that decided the game's outcome\n"
                    "- Overall Verdict: closing assessment of the performance\n\n"
                    "Calibrate your tone to the actual stats — do not default to critical or unsatisfied framing. "
                    "If blunders/mistakes are low and brilliant/great moves are present, this was a STRONG game — "
                    "praise it accordingly, don't manufacture nitpicks to sound balanced.\n"
                    "Reference specific moves using the token format {{move:N}} — never plain text move numbers.\n"
                    "Do not pad with generic chess advice unrelated to this specific game."
                )},
                {"role": "user", "content": (
                    f"Game stats: {len(results)} moves, {blunders} blunders, {mistakes} mistakes, "
                    f"{brilliant} brilliant, {great} great moves.\n\n"
                    f"Critical moments:\n{moves_text if moves_text else '(none flagged)'}\n"
                    "Summarize the game, citing specific critical moments with {{move:N}} tokens."
                )}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"SUMMARY ERROR: {type(e).__name__}: {e}")
        return "[Summary unavailable]"