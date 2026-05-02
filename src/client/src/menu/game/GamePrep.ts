import { Pieces } from "./Piece";
import { setPiece, boardMap, setTurn, getPosString, addPosition } from "./GameLogic";

export function createBoard(color: string){
        const board = document.getElementById('board');   
        
        const ht = document.getElementById('HT');
        const hb = document.getElementById('HB');
        const vl = document.getElementById('VL');
        const vr = document.getElementById('VR');

        if (ht != null){
            ht.draggable = false;
            ht.classList.add("unselectable");
        }   

        if (hb != null){
            hb.draggable = false;
            hb.classList.add("unselectable");
        }  

        if (vl != null){
            vl.draggable = false;
            vl.classList.add("unselectable");
        }

        if (vr != null){
            vr.draggable = false;
            vr.classList.add("unselectable");
        }

        if (board != null){
            board.draggable = false;
            board.classList.add("unselectable");
        }

        if (color === "white"){ 
            for (let i = 8; i > 0; i--)
            {
                for (let j = 0; j < 8; j++)
                {
                    const startChar = 'A';
                    const cellCharCode = startChar.charCodeAt(0) + j;
                    const cellChar = String.fromCharCode(cellCharCode);

                    const cell = document.createElement('div');
                    
                    const classStr = (((cellCharCode+i) % 2) == 0) ? 'BCell' : 'WCell';

                    cell.setAttribute('class', classStr);
                    cell.setAttribute('id', cellChar + i);

                    cell.draggable = false;

                    board?.appendChild(cell);
                    boardMap.set(cellChar + i, 'e');
                }
            }

            for (let i = 0; i < 8; i++){
                const startChar = 'A';
                const cellCharCode = startChar.charCodeAt(0) + i;
                const cellChar = String.fromCharCode(cellCharCode);

                const cell = document.createElement('div');
                const classStr = "HCellDesc";

                cell.setAttribute("class", classStr);

                const lbl = document.createElement('p');
                const classStrLbl = "cellLabel";

                lbl.setAttribute("class", classStrLbl);

                lbl.append(cellChar);

                cell.append(lbl);

                ht?.append(cell);
                hb?.append(cell.cloneNode(true));
            }

            for (let i = 8; i > 0; i--){
                const cell = document.createElement('div');
                const classStr = "VCellDesc";

                cell.setAttribute("class", classStr);

                const lbl = document.createElement('p');
                const classStrLbl = "cellLabel";

                lbl.setAttribute("class", classStrLbl);

                lbl.append(`${i}`);

                cell.append(lbl);

                vl?.append(cell);
                vr?.append(cell.cloneNode(true));
            }

            setTurn(true);
        }else{
            for (let i = 1; i <= 8; i++)
            {
                for (let j = 7; j >= 0; j--)
                {
                    const startChar = 'A';
                    const cellCharCode = startChar.charCodeAt(0) + j;
                    const cellChar = String.fromCharCode(cellCharCode);

                    const cell = document.createElement('div');
                        
                    const classStr = (((cellCharCode+i) % 2) == 0) ? 'BCell' : 'WCell';

                    cell.setAttribute('class', classStr);
                    cell.setAttribute('id', cellChar + i);

                    cell.draggable = false;

                    board?.appendChild(cell);
                    boardMap.set(cellChar + i, 'e');
                }
            }

            for (let i = 7; i >= 0; i--){
                const startChar = 'A';
                const cellCharCode = startChar.charCodeAt(0) + i;
                const cellChar = String.fromCharCode(cellCharCode);

                const cell = document.createElement('div');
                const classStr = "HCellDesc";

                cell.setAttribute("class", classStr);

                const lbl = document.createElement('p');
                const classStrLbl = "cellLabel";

                lbl.setAttribute("class", classStrLbl);

                lbl.append(cellChar);

                cell.append(lbl);

                ht?.append(cell);
                hb?.append(cell.cloneNode(true));
            }

            for (let i = 1; i <= 8; i++){
                const cell = document.createElement('div');
                const classStr = "VCellDesc";

                cell.setAttribute("class", classStr);

                const lbl = document.createElement('p');
                const classStrLbl = "cellLabel";

                lbl.setAttribute("class", classStrLbl);

                lbl.append(`${i}`);

                cell.append(lbl);

                vl?.append(cell);
                vr?.append(cell.cloneNode(true));
            }

            setTurn(false);
        }

        setPieces();
}

function setPieces(){
    for(let i = 0; i < 8; i++){
        const startChar = 'A';
        const cellCharCode = startChar.charCodeAt(0) + i;
        const cellChar = String.fromCharCode(cellCharCode);

        boardMap.set(cellChar + 2, "P");
        setPiece(Pieces.PAWN, `${cellChar}2`, "white");
    }
    
    boardMap.set("B1", "N");
    boardMap.set("G1", "N");
    boardMap.set("C1", "B");
    boardMap.set("F1", "B");
    boardMap.set("A1", "R");
    boardMap.set("H1", "R");
    boardMap.set("D1", "Q");
    boardMap.set("E1", "K");
    setPiece(Pieces.KNIGHT, "B1", "white");
    setPiece(Pieces.KNIGHT, "G1", "white");
    setPiece(Pieces.BISHOP, "C1", "white");
    setPiece(Pieces.BISHOP, "F1", "white");
    setPiece(Pieces.ROOK, "A1", "white");
    setPiece(Pieces.ROOK, "H1", "white");
    setPiece(Pieces.QUEEN, "D1", "white");
    setPiece(Pieces.KING, "E1", "white");

    for(let i = 0; i < 8; i++){
        const startChar = 'A';
        const cellCharCode = startChar.charCodeAt(0) + i;
        const cellChar = String.fromCharCode(cellCharCode);

        boardMap.set(cellChar + 7, "p");
        setPiece(Pieces.PAWN, `${cellChar}7`, "black");
    }

    boardMap.set("B8", "n");
    boardMap.set("G8", "n");
    boardMap.set("C8", "b");
    boardMap.set("F8", "b");
    boardMap.set("A8", "r");
    boardMap.set("H8", "r");
    boardMap.set("D8", "q");
    boardMap.set("E8", "k");
    setPiece(Pieces.KNIGHT, "B8", "black");
    setPiece(Pieces.KNIGHT, "G8", "black");
    setPiece(Pieces.BISHOP, "C8", "black");
    setPiece(Pieces.BISHOP, "F8", "black");
    setPiece(Pieces.ROOK, "A8", "black");
    setPiece(Pieces.ROOK, "H8", "black");
    setPiece(Pieces.QUEEN, "D8", "black");
    setPiece(Pieces.KING, "E8", "black");
}