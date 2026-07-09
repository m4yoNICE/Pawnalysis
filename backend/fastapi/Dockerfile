FROM python:3.11-slim

RUN apt-get update && apt-get install -y stockfish && rm -rf 

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV STOCKFISH_PATH=/usr/games/stockfish

EXPOSE 8000

