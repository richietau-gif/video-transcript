import re
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
app = FastAPI()
@app.get("/health")
def health():
    return {"ok": True}
@app.get("/transcript")
def transcript(id: str):
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", id):
        raise HTTPException(400, "Invalid video ID")
    try:
        tracks = YouTubeTranscriptApi().list(id)
        track = tracks.find_transcript(["en", "en-US", "en-GB"])
        text = " ".join(segment.text for segment in track.fetch())
        if not text.strip():
            raise HTTPException(422, "Empty transcript")
        return {"text": text}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(422, type(exc).__name__) from None
