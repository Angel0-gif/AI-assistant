"""
Petit client pour l'API Gemini (Google AI Studio) — utilisé uniquement côté
serveur, la clé API ne doit JAMAIS être envoyée à l'application mobile.
"""
import requests
from django.conf import settings

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


class GeminiError(Exception):
    pass


def ask_gemini(history: list[dict], user_message: str) -> str:
    """
    history: liste de dicts {"role": "user"|"assistant", "content": str}
    Retourne le texte de la réponse de Gemini.
    """
    if not settings.GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY manquante dans les variables d'environnement.")

    contents = []
    for msg in history:
        gemini_role = "model" if msg["role"] == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": msg["content"]}]})
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    url = GEMINI_ENDPOINT.format(model=settings.GEMINI_MODEL)
    resp = requests.post(
        url,
        params={"key": settings.GEMINI_API_KEY},
        json={
            "contents": contents,
            "systemInstruction": {
                "parts": [{
                    "text": (
                        "Tu es un assistant personnel utile et concis, intégré à une "
                        "application de gestion de tâches. Réponds en français par défaut, "
                        "sauf si l'utilisateur écrit dans une autre langue."
                    )
                }]
            },
        },
        timeout=30,
    )

    if resp.status_code != 200:
        raise GeminiError(f"Erreur Gemini ({resp.status_code}): {resp.text}")

    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise GeminiError(f"Réponse Gemini inattendue: {data}")

