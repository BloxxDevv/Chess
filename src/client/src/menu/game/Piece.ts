import pawnImg from "../../assets/pieces/Pawn.png";
import knightImg from "../../assets/pieces/Knight.png";
import bishopImg from "../../assets/pieces/Bishop.png";
import rookImg from "../../assets/pieces/Rook.png";
import kingImg from "../../assets/pieces/King.png";
import queenImg from "../../assets/pieces/Queen.png";

export interface Piece {
    readonly type: 'PAWN' | 'KNIGHT' | 'BISHOP' | 'ROOK' | 'KING' | 'QUEEN';
    readonly imgFile: string;
}

const PAWN: Piece = { type: 'PAWN', imgFile: pawnImg };
const KNIGHT: Piece = { type: 'KNIGHT', imgFile: knightImg };
const BISHOP: Piece = { type: 'BISHOP', imgFile: bishopImg };
const ROOK: Piece = { type: 'ROOK', imgFile: rookImg };
const KING: Piece = { type: 'KING', imgFile: kingImg };
const QUEEN: Piece = { type: 'QUEEN', imgFile: queenImg };

export const Pieces = {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  KING,
  QUEEN
} as const;