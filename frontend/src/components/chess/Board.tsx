"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { BoardProps } from "@/lib/Types";
import { createCustomPieces } from "@/lib/utils/piece";
import type { Square } from "chess.js";

const customPieces = createCustomPieces("/pieces/yun.png");

type PromotionChoice = "q" | "r" | "b" | "n";

const PROMOTION_PIECES: { value: PromotionChoice; label: string }[] = [
  { value: "q", label: "Q" },
  { value: "r", label: "R" },
  { value: "b", label: "B" },
  { value: "n", label: "N" },
];

export default function Board({ fen, onMove }: BoardProps) {
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  const turn = new Chess(fen).turn();

  function isPromotionMove(
    sourceSquare: string,
    targetSquare: string,
  ): boolean {
    const chess = new Chess(fen);
    const piece = chess.get(sourceSquare as Square);
    if (!piece || piece.type !== "p") return false;

    const targetRank = targetSquare[1];
    return (
      (piece.color === "w" && targetRank === "8") ||
      (piece.color === "b" && targetRank === "1")
    );
  }

  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
  ): boolean => {
    if (sourceSquare === targetSquare) return false;

    if (isPromotionMove(sourceSquare, targetSquare)) {
      setPendingPromotion({
        from: sourceSquare as Square,
        to: targetSquare as Square,
      });
      return false;
    }

    return onMove({
      from: sourceSquare as Square,
      to: targetSquare as Square,
    });
  };

  function resolvePromotion(promotion: PromotionChoice) {
    if (!pendingPromotion) return;
    onMove({ ...pendingPromotion, promotion });
    setPendingPromotion(null);
  }

  return (
    <div className="w-full max-w-[560px] mx-auto relative">
      <Chessboard
        options={{
          id: "BasicBoard",
          position: fen,
          allowDragging: true,
          lightSquareStyle: { backgroundColor: "#F3EFFE" },
          darkSquareStyle: { backgroundColor: "#7B6FA0" },
          canDragPiece: ({ piece }) => piece.pieceType[0] === turn,
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            return handlePieceDrop(sourceSquare, targetSquare);
          },
        }}
      />

      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg shadow-lg p-4 flex gap-2">
            {PROMOTION_PIECES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => resolvePromotion(value)}
                className="w-12 h-12 rounded bg-[#F3EFFE] hover:bg-[#E1D8EF] font-bold text-lg text-[#1A1A1A]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}