"use client";

import { useEffect, useState } from "react";

// Components
import Board from "@/components/chess/Board";
import MoveList from "@/components/chess/MoveList";
import PgnInput from "@/components/chess/PgnInput";
import Summary from "@/components/chess/Summary";
import Commentary from "@/components/chess/Commentary";

// Types & Utils
import { parsePgn, getMoves, getFens } from "@/lib/utils/pgn";
import Api from "@/lib/services/Api";
import { AnalyzeResponse } from "@/lib/Types";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function GamePage() {
  const [pgn, setPgn] = useState("");
  const [cleanPgn, setCleanPgn] = useState("");
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [fens, setFens] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //update game state as PGN is edited, to allow mid-paste analysis
  function handlePgnChange(value: string) {
    setPgn(value);
    if (!value.trim()) return;
    try {
      setFens(getFens(value));
      setMoves(getMoves(value));
    } catch {
      // invalid PGN mid-paste, ignore
    }
  }

  async function handleAnalyze() {
    try {
      const formatted = parsePgn(pgn);
      setCleanPgn(formatted);
      setFens(getFens(pgn));
      setMoves(getMoves(pgn));

      setIsLoading(true);
      const result = await Api.analyzeGame(formatted);
      setAnalysis(result);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-8">
      <div className="flex gap-8 w-full max-w-5xl">
        {/* Left — Board + Input */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="rounded-lg overflow-hidden shadow-md">
            <Board fen={fens[currentMoveIndex] ?? DEFAULT_FEN} />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 rounded-lg">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm font-semibold">Analyzing...</p>
              </div>
            )}
          </div>
          <PgnInput
            pgn={pgn}
            onChange={handlePgnChange}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {/* Right — Move List */}
        <div className="flex flex-col flex-1 gap-3">
          <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-widest">
            Moves
          </h2>
          <div className="flex-1 rounded-lg overflow-hidden border border-[#E5E5E5] bg-white shadow-sm">
            <MoveList
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={setCurrentMoveIndex}
              analysis={analysis?.analysis}
            />
          </div>

          {analysis?.analysis[currentMoveIndex]?.commentary && (
            <Commentary
              commentary={analysis.analysis[currentMoveIndex].commentary}
            />
          )}

          {analysis?.summary && <Summary summary={analysis.summary} />}
        </div>
      </div>
    </main>
  );
}
