"use client";

import { Chessboard } from "react-chessboard";
import { BoardProps } from "@/lib/Types";
import { createCustomPieces } from "@/lib/utils/piece";
import type { Square } from "chess.js";

const customPieces = createCustomPieces("/pieces/yun.png");

export default function Board({ fen, onMove }: BoardProps) {
  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
  ): boolean => {
    return onMove({
      from: sourceSquare as Square,
      to: targetSquare as Square,
    });
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <Chessboard
        options={{
          id: "BasicBoard",
          position: fen,
          allowDragging: true,
          lightSquareStyle: {
            backgroundColor: "#F3EFFE",
          },
          darkSquareStyle: {
            backgroundColor: "#7B6FA0",
          },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;

            return handlePieceDrop(sourceSquare, targetSquare);
          },
        }}
      />
    </div>
  );
}
