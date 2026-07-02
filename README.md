# Pawnalysis
A chess game analyzer that combines Stockfish engine analysis with AI-generated commentary. Paste a PGN, get move-by-move evaluations with human-readable explanations — delivered by one of several AI coach personalities.
---
## Features
- Move-by-move Stockfish analysis (evaluation, best move, top 3 alternatives)
- AI commentary via Groq — choose from multiple coach personalities (blunt coach, tsundere, Yun Jin, Yuuka, and more)
- PGN parsing with position extraction per move
- FastAPI backend, Next.js frontend
---
## Tech Stack
| Layer         | Tech                                  |
| ------------- | ------------------------------------- |
| Engine        | Stockfish (local binary)              |
| AI Commentary | Groq (llama-3.3-70b-versatile)        |
| Backend       | FastAPI + Python                      |
| Frontend      | Next.js                               |
---
```
Pawnalysis/
├── backend/
│   └── fastapi/
│       ├── main.py
│       ├── models.py
│       ├── chesslib/
│       │   ├── engine.py
│       │   └── parser.py
│       ├── ai/
│       │   ├── llm.py
│       │   └── prompt.py
│       └── stockfish/     # not committed
└── web/
```
---
## Getting Started
### Backend (FastAPI)
```bash
cd backend/fastapi
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python main.py
```
API runs at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`
### Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```
---
### Deactivating the virtual environment
```bash
deactivate
```
## Environment Variables
Create `backend/fastapi/.env`:
```
GROQ_API_KEY=your_key_here
Get a free Groq API key at https://console.groq.com
```
---
## API
### `POST /analyze`
**Request:**
```json
{
  "pgn": "1. e4 e5 2. Nf3 ...",
  "depth": 15
}
```
**Response:**
```json
{
  "status": "ok",
  "analysis": [
    {
      "fen": "...",
      "best_move": "e2e4",
      "evaluation": { "type": "cp", "value": 32 },
      "top_moves": [...],
      "commentary": "White opens with e4, staking a claim in the center..."
    }
  ]
}
```
---
## Notes
- Stockfish binary is not committed. Download from [stockfishchess.org](https://stockfishchess.org) and place in `backend/fastapi/stockfish/`
- Groq free tier has rate limits — commentary may fall back to a placeholder message under heavy use
- `.env` is gitignored — never commit your API key



