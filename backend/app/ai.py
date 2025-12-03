import os
from typing import List, Dict

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None


def format_logs_for_prompt(
    health_logs: List[Dict], meal_logs: List[Dict]
) -> str:
    """Turn raw log rows into a readable text block for the LLM."""
    lines = []

    lines.append("Health logs (last 7 days):")
    if not health_logs:
        lines.append("  - No health logs available.")
    else:
        for log in health_logs:
            lines.append(
                f"  - {log['log_date']}: sleep={log.get('sleep_hours')}, "
                f"water={log.get('water_glasses')} glasses, "
                f"steps={log.get('steps')}, mood={log.get('mood_score')}, "
                f"weight={log.get('weight')}, notes={log.get('notes')}"
            )

    lines.append("")
    lines.append("Meal logs (last 7 days):")
    if not meal_logs:
        lines.append("  - No meal logs available.")
    else:
        for meal in meal_logs:
            lines.append(
                f"  - {meal['log_date']} {meal['meal_type']}: "
                f"{meal['meal_name']} "
                f"(cal={meal.get('calories')}, "
                f"P={meal.get('protein_grams')}g, "
                f"C={meal.get('carbs_grams')}g, "
                f"F={meal.get('fat_grams')}g), notes={meal.get('notes')}"
            )

    return "\n".join(lines)


def generate_coach_summary(
    health_logs: List[Dict], meal_logs: List[Dict]
) -> str:
    """Call Google Gemini to generate a short, practical coach summary."""

    if model is None:
        return (
            "AI coach is not configured yet. Please set GEMINI_API_KEY "
            "in the backend .env file."
        )

    context_block = format_logs_for_prompt(health_logs, meal_logs)

    prompt = (
        "You are a friendly health coach. You will receive 7 days of health and meal logs.\n"
        "Your output MUST be short (5–7 sentences maximum), direct, and practical.\n\n"
        "Write the summary in this structure:\n"
        "1) One brief sentence summarizing overall patterns.\n"
        "2) 2–3 observations (sleep, hydration, steps, mood, meals).\n"
        "3) 2–3 concrete suggestions (simple, actionable, no medical advice).\n\n"
        "DO NOT use emojis. DO NOT write long paragraphs. DO NOT repeat data.\n"
        "Keep it crisp, helpful, and only a few lines.\n\n"
        f"Here are the logs:\n\n{context_block}\n\n"
        "Now generate a short summary based on the instructions."
    )

    response = model.generate_content(prompt)

    # For Gemini, the main text is in response.text
    return response.text or "No response from AI."
