---
title: VideoTranscript Backend
sdk: docker
app_port: 7860
---

Deploy these four files at the root of a Docker Hugging Face Space. Set TRANSCRIPT_BACKEND_URL on Vercel to the HTTPS Space origin. No paid API is used. YouTube may block cloud IPs or omit captions; this service does not bypass restrictions. Translation remains local in the browser. Health endpoint: /health.
