import Image from "next/image";

const allPieces = [
  "wP",
  "wN",
  "wB",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bN",
  "bB",
  "bR",
  "bQ",
  "bK",
];

export function createCustomPieces(imagePath: string) {
  return Object.fromEntries(
    allPieces.map((piece) => [
      piece,
      () => <Image src={imagePath} width={64} height={64} alt={piece} />,
    ]),
  );
}
