from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        video_id = parse_qs(urlparse(self.path).query).get("id", [""])[0]
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            return self.respond(400, {"error": "invalid_id"})
        try:
            tracks = YouTubeTranscriptApi().list(video_id)
            track = tracks.find_transcript(["en", "en-US", "en-GB"])
            text = " ".join(s.text for s in track.fetch())
            if not text.strip():
                return self.respond(422, {"error": "empty_transcript"})
            self.respond(200, {"text": text})
        except Exception as exc:
            self.respond(422, {"error": type(exc).__name__})

    def respond(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
