import {Pieces, type Piece} from "./Piece";
import { socket } from "./ServerLogic";

let currentPiece: Piece | undefined = undefined;
let currentCloneImg: HTMLImageElement | undefined = undefined;
let currentPieceColor = 'white';
let cellBeingMoved = '';

let kingMoved = false;
let aRookMoved = false;
let hRookMoved = false;

let otherKingMoved = false;
let otherARookMoved = false;
let otherHRookMoved = false;

let turn = false;

let plieCounter = 0;

let bgCol = "#FFFFFF";

let posHistory = new Map<string, number>();

let repetition = false;

export let boardMap = new Map<string, string>();
let boardMapRevert;

export let enPassant = '';

export let playerColor: string;

let running = false;

let ccell1: HTMLDivElement;
let ccell2: HTMLDivElement;

let kingCell: HTMLDivElement;

export function reset(send: boolean){
    currentPiece = undefined;
    currentCloneImg = undefined;
    currentPieceColor = 'white';
    cellBeingMoved = '';
    kingMoved = false;
    aRookMoved = false;
    hRookMoved = false;
    otherKingMoved = false;
    otherARookMoved = false;
    otherHRookMoved = false;
    turn = false;
    plieCounter = 0;
    bgCol = "#272833";
    posHistory = new Map<string, number>();
    repetition = false;
    boardMap = new Map<string, string>();
    boardMapRevert = null;
    enPassant = '';
    running = false;

    for(let node of document.getElementById("boardBorder").children){
        node.innerHTML = '';
    }

    if (send){    
        socket.emit("rollSides");
    }
}

export async function resign(confirmCallback: (message: string) => Promise<string>, fetchInputCallback: (title: string, message: string) => Promise<string>){
    running = true;
    const reply = await confirmCallback("Are you sure, you want to resign?")
    running = false;
    if (reply === "Yes"){
        socket.emit("drawEndscreen", {
            title: (playerColor === "white") ? "Black won!" : "White won!",
            message: "By Resignation"
        });
        await fetchInputCallback((playerColor === "white") ? "Black won!" : "White won!", "By Resignation");  
    }
}

export async function drawRequest(confirmCallback: (message: string) => Promise<string>, fetchInputCallback: (title: string, message: string) => Promise<string>){
    running = true;
    const reply = await confirmCallback("Are you sure, you want to offer a draw?")
    running = false;
    if (reply === "Yes"){
        socket.emit("drawRequest");
    }
}

export function addPosition(){
    const pos = getPosString();

    if (enPassant === ''){
        if (!posHistory.has(pos)){
            posHistory.set(pos, 1);
        }else{
            posHistory.set(pos, Number(posHistory.get(pos)) + 1);
        }
    }

    if(Number(posHistory.get(pos)) >= 3){
        repetition = true;
    }
}

export function getPosString(){
    let c = 0;

    let posStr = "";

    //PIECE CONFIGURATION
    for (let i = 8; i > 0; i--){
        c = 0;

        for(let j = 0; j < 8; j++){
            const square: string = addChar('A', j) + i;

            if (boardMap.get(square) === 'e') {
                c++;
            }else {
                if (c != 0) posStr = posStr + c;
                c = 0;
                posStr = posStr + boardMap.get(square);
            }
        }

        if (c != 0) posStr = posStr + c;
        if (i != 1) posStr = posStr + "/";
    }

    //TURN
    if (turn === true){
        if (playerColor === "white"){
            posStr = posStr + " w";
        }else if (playerColor === "black"){
            posStr = posStr + " b";
        }
    }else{
        if (playerColor === "white"){
            posStr = posStr + " b";
        }else if (playerColor === "black"){
            posStr = posStr + " w";
        }
    }

    posStr = posStr + " "

    //CASTLING
    if (playerColor === "white"){
        if (!kingMoved){
            if (!hRookMoved){
                posStr = posStr + "K";
            }
            if (!aRookMoved){
                posStr = posStr + "Q";
            }
        }
        if (!otherKingMoved){
            if (!otherHRookMoved){
                posStr = posStr + "k";
            }
            if (!otherARookMoved){
                posStr = posStr + "q";
            }
        }
    }else{
        if (!otherKingMoved){
            if (!otherHRookMoved){
                posStr = posStr + "K";
            }
            if (!otherARookMoved){
                posStr = posStr + "Q";
            }
        }
        if (!kingMoved){
            if (!hRookMoved){
                posStr = posStr + "k";
            }
            if (!aRookMoved){
                posStr = posStr + "q";
            }
        }
    }

    if (posStr.endsWith(" ")) posStr = posStr + "-";

    return posStr;
}

export function changeBG(){
    if (bgCol === "#FFFFFF") bgCol = "#272833";
    else if (bgCol === "#272833") bgCol = "#FFFFFF";
}

export function setTurn(t: boolean){
    turn = t;
    changeBG();
    document.getElementsByTagName('body')[0].style.backgroundColor = bgCol;
}

export function setOtherKingMoved(){
    otherKingMoved = true;
}

export function setPassant(square: string) {
    enPassant = square;
}

export function setColor(color: string) {
    playerColor = color;
}

export function setPiece(piece: Piece, cell: string, color: string) {
    const cellDiv = document.getElementById(cell);

    const pieceImg = document.createElement("img");

    pieceImg.src = piece.imgFile;

    if (color === "white"){
        pieceImg.classList.add("pieceImgWhite");
    }else {
        pieceImg.classList.add("pieceImgBlack");
    }

    pieceImg.classList.add("unselectable");
    pieceImg.draggable = false;

    const clonePieceImg = document.createElement("img");

    clonePieceImg.src = piece.imgFile;

    if (color === "white"){
        clonePieceImg.classList.add("cloneImgWhite");
    }else {
        clonePieceImg.classList.add("cloneImgBlack");
    }

    clonePieceImg.style.display = 'none';

    document.getElementById("root")?.appendChild(clonePieceImg);

    pieceImg.addEventListener('mousedown', (e: MouseEvent) => { 
        if (!running && turn && ((color === "white" && playerColor === "white") || (color === "black" && playerColor === "black"))){       
            clonePieceImg.width = pieceImg.width;
            clonePieceImg.height = pieceImg.height;
            
            pieceImg.parentElement?.removeChild(pieceImg);
            
            currentPiece = piece;
            currentCloneImg = clonePieceImg;
            currentPieceColor = color;
            cellBeingMoved = cell;

            updateClonePos(e, currentCloneImg);

            clonePieceImg.style.display = 'inline';
        }
    });

    cellDiv?.appendChild(pieceImg);
}

function mapToStrArr(arr: [string, string][], index: number): string[]{
    let out = []

    for (let i = 0; i < arr.length; i++){
        out[i] = arr[i][index]
    }

    return out
}

function checkInsufficientMaterial(): boolean{
    const whitePieces = mapToStrArr(getAllPieces("white"), 1);
    const blackPieces = mapToStrArr(getAllPieces("black"), 1);

    //KING VS KING
    if (whitePieces.length === 1 && blackPieces.length === 1) return true;

    //KING VS KING + KNIGHT OR BISHOP
    if ((whitePieces.length === 1 && blackPieces.length === 2 && (contains(blackPieces, "n") || contains(blackPieces, "b"))) || 
        (blackPieces.length === 1 && whitePieces.length === 2 && (contains(whitePieces, "N") || contains(whitePieces, "B")))){
            return true;
        }

    //KING VS KING + 2 KNIGHTS
    if ((whitePieces.length === 1 && blackPieces.length === 3 && (contains(blackPieces, "n") && !contains(blackPieces, "b") && !contains(blackPieces, "q") && !contains(blackPieces, "r") && !contains(blackPieces, "p"))) || 
        (blackPieces.length === 1 && whitePieces.length === 3 && (contains(whitePieces, "N") && !contains(whitePieces, "B") && !contains(whitePieces, "Q") && !contains(whitePieces, "R") && !contains(whitePieces, "P")))){
            return true;
        }

    //KING + MINOR PIECE VS KING + MINOR PIECE
    if (whitePieces.length === 2 && blackPieces.length === 2 && (contains(whitePieces, "N") || contains(whitePieces, "B")) && (contains(blackPieces, "n") || contains(blackPieces, "b"))){
        return true;
    }

    return false;
}   

function updateClonePos(e: MouseEvent, clonePieceImg: HTMLImageElement){
    const x = e.clientX - clonePieceImg.width/2;
    const y = e.clientY - clonePieceImg.height/2;

    clonePieceImg.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

export function setRunning(run: boolean){
    running = run;
}

export function registerWindowListeners(promoteCallback: () => Promise<Piece>, fetchInputCallback: (title: string, message: string) => Promise<string>){
    window.addEventListener('mousemove', (e) => {if (currentCloneImg != undefined) updateClonePos(e, currentCloneImg)});

    window.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!running && turn){
            running = true;
            if (currentCloneImg != undefined && currentPiece != undefined){
                currentCloneImg.style.display = 'none';
                
                const cell = findCell(e);
                await movePiece(cellBeingMoved, cell, currentPieceColor, currentPiece, true, promoteCallback);    

                currentCloneImg = undefined;
                currentPiece = undefined;

                if (isStalemate((playerColor === "white") ? "black" : "white")){
                    let title = ""
                    let message = ""
                    if (isCheck((playerColor === "white") ? "black" : "white", boardMap)){
                        //Checkmate
                        const colStr = (playerColor === "white") ? "White" : "Black";
                        title = colStr + " won!"
                        message = "By Checkmate"

                        socket.emit("drawEndscreen", {
                            title: title,
                            message: message
                        });
                    }else{
                        //Stalemate
                        title = "Draw!"
                        message = "By Stalemate"

                        socket.emit("drawEndscreen", {
                            title: title,
                            message: message
                        });
                    }

                    const userChoice = await fetchInputCallback(title, message);
                }

                if (checkInsufficientMaterial()){
                    socket.emit("drawEndscreen", {
                        title: "Draw!",
                        message: "By Insufficient Material"
                    });
                    const userChoice = await fetchInputCallback("Draw!", "By Insufficient Material");
                }

                if (plieCounter >= 100) {
                    socket.emit("drawEndscreen", {
                        title: "Draw!",
                        message: "By 50 Move Rule"
                    });
                    const userChoice = await fetchInputCallback("Draw!", "By 50 Move Rule");   
                }

                if (repetition){
                    socket.emit("drawEndscreen", {
                        title: "Draw!",
                        message: "By Threefold Repetition"
                    });
                    const userChoice = await fetchInputCallback("Draw!", "By Threefold Repetition");   
                }
            }
            running = false;
        }
    });
}

function moveIsCastle(piece: Piece, cell: string): boolean{
    if (piece.type === "KING"){
        if (!kingMoved && (cell.charAt(0) == 'C' || cell.charAt(0) == 'G')){
            return true;
        }
    }

    return false;
}

export function castle(type: string, initCell: string){
    if (kingCell != null){
        kingCell.style = '';
    }

    const col = initCell.charAt(1) == '1' ? "white" : "black"

    document.getElementById(initCell).innerHTML = '';
    if (type === "short"){
        document.getElementById('H' + initCell.charAt(1)).innerHTML = ''; 

        setPiece(Pieces.KING, 'G' + initCell.charAt(1), col);
        setPiece(Pieces.ROOK, 'F' + initCell.charAt(1), col);
    }else{
        document.getElementById('A' + initCell.charAt(1)).innerHTML = ''; 

        setPiece(Pieces.KING, 'C' + initCell.charAt(1), col);
        setPiece(Pieces.ROOK, 'D' + initCell.charAt(1), col);
    }

    if (col != playerColor) { 
        otherKingMoved = true;
    } else{
        kingMoved = true;
    }

    plieCounter = 0;

    drawPreviousMove(initCell, type === "short" ? "G" + initCell.charAt(1) : "C" + initCell.charAt(1));
    drawCheckSquare(col === "white" ? "black " : "white");
}

export function getPieceChar(piece: Piece, color: string): string{
    if (color === "white"){
        if (piece.type === "KNIGHT") return "N";

        return piece.type.charAt(0).toUpperCase();
    }else{
        if (piece.type === "KNIGHT") return "n";

        return piece.type.charAt(0).toLowerCase();
    }
}

function findKingSquare(color: string,  map: Map<string, string>): string{
    if (color === "white"){
        for (const [key, value] of map.entries()){
            if (value === 'K') return key;
        }
    }else{
        for (const [key, value] of map.entries()){
            if (value === 'k') return key;
        }
    }

    return ''
}

function onBoard(cell: string): boolean{
    return ( 
        cell.charCodeAt(0) >= 'A'.charCodeAt(0) && 
        cell.charCodeAt(0) <= 'H'.charCodeAt(0) && 
        cell.charCodeAt(1) >= '1'.charCodeAt(0) && 
        cell.charCodeAt(1) <= '8'.charCodeAt(0)
    );
}

function isLowerCase(str: string): boolean{
    for (let i = 0; i < str.length; i++){
        if (str.charCodeAt(i) < 'a'.charCodeAt(0) || str.charCodeAt(i) > 'z'.charCodeAt(0)) return false; 
    }

    return true;
}

function isUpperCase(str: string): boolean{
    for (let i = 0; i < str.length; i++){
        if (str.charCodeAt(i) < 'A'.charCodeAt(0) || str.charCodeAt(i) > 'Z'.charCodeAt(0)) return false; 
    }

    return true;
}

function getAllPieces(color: string): [string, string][]{
    const arr: [string, string][] = [];

    for (const [cell, piece] of boardMap){
        if (isLowerCase(piece) && color == "black") arr.push([cell, piece]);
        if (isUpperCase(piece) && color == "white") arr.push([cell, piece]);
    }

    return arr;
}

function typeFromLetter(letter: string): string{
    switch(letter.toLowerCase()){
        case 'p': return "PAWN";
        case 'n': return "KNIGHT";
        case 'b': return "BISHOP";
        case 'r': return "ROOK";
        case 'q': return "QUEEN";
        case 'k': return "KING";
    }

    return '';
}

function hasValidMoves(piece: [string, string], color: string): boolean{
    const validMoves = calcValidMoves(piece[0], color, typeFromLetter(piece[1]));

    let simMap = new Map(boardMap);

    for (let i = 0; i < validMoves.length; i++){
        simMap = new Map(boardMap);
        simMap.set(piece[0], 'e')
        simMap.set(validMoves[i], piece[1])


        if (!isCheck(color, simMap)) {
            return true;
        }
    }

    return false;
}

function isStalemate(color: string): boolean{
    const allPieces = (color === "white") ? getAllPieces("white") : getAllPieces("black");

    for (const [square, piece] of allPieces){
        if (hasValidMoves([square, piece], color))
        {
            return false;
        } 
    }

    const backRank = (color === "white") ? 1 : 8;

    if (!otherKingMoved){
        let simMap = new Map(boardMap);
        if (!otherARookMoved && simMap.get("B" + backRank) === 'e' && simMap.get("C" + backRank) === 'e' && simMap.get("D" + backRank) === 'e'){
            simMap.set("E" + backRank, 'e')
            simMap.set("D" + backRank, (color === "white") ? 'K' : 'k')
            
            if (!isCheck(color, simMap)){
                simMap = new Map(boardMap)
                simMap.set("E" + backRank, 'e')
                simMap.set("A" + backRank, 'e')
                simMap.set("C" + backRank, (color === "white") ? 'K' : 'k')
                simMap.set("D" + backRank, (color === "white") ? 'R' : 'r')
                
                if (!isCheck(color, simMap)) {
                    return false;
                }
            }
        }
        if (!otherHRookMoved && simMap.get("G" + backRank) === 'e' && simMap.get("F" + backRank) === 'e'){
            simMap = new Map(boardMap);

            simMap.set("E" + backRank, 'e')
            simMap.set("F" + backRank, (color === "white") ? 'K' : 'k')
            
            if (!isCheck(color, simMap)){
                simMap = new Map(boardMap)
                simMap.set("E" + backRank, 'e')
                simMap.set("H" + backRank, 'e')
                simMap.set("G" + backRank, (color === "white") ? 'K' : 'k')
                simMap.set("F" + backRank, (color === "white") ? 'R' : 'r')

                if (!isCheck(color, simMap)) {
                    return false;
                }
            }
        }
    }

    return true;
}

function isCheck(color: string, map: Map<string, string>): boolean{
    const kingSquare = findKingSquare(color, map);

    const knightOffsets = [
        [-2, 1], [-2, -1], [2, 1], [2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]
    ]

    const rookDir = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    const bishopDir = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    const kingSquares = rookDir.concat(bishopDir);

    if (color === "white"){
        //PAWN
        if (kingSquare.charAt(1) != '8'){
            if (kingSquare.charAt(0) != 'A') {
                if(map.get(addChar(kingSquare.charAt(0), -1) + (Number(kingSquare.charAt(1))+1)) === "p") return true;
            }
            if (kingSquare.charAt(0) != 'H') {
                if(map.get(addChar(kingSquare.charAt(0), 1) + (Number(kingSquare.charAt(1))+1)) === "p") return true;
            }
        }

        //KNIGHT
        for (const [c, i] of knightOffsets){
            const cell = addChar(kingSquare.charAt(0), c) + addChar(kingSquare.charAt(1), i);

            if (onBoard(cell) && map.get(cell) === "n"){
                return true
            }
        }

        //ROOK/QUEEN
        for (const [c, i] of rookDir){
            let square = kingSquare;
            square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            
            while (onBoard(square)){
                const piece = map.get(square);
                if (piece === "r" || piece === "q") return true;
                if (piece != "e") break;

                square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            }
        }

        //BISHOP/QUEEN
        for (const [c, i] of bishopDir){
            let square = kingSquare;
            square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            
            while (onBoard(square)){
                const piece = map.get(square);
                if (piece === "b" || piece === "q") return true;
                if (piece != "e") break;

                square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            }
        }

        //KING
        for (const [c, i] of kingSquares){
            const square = addChar(kingSquare.charAt(0), c) + addChar(kingSquare.charAt(1), i);

            if (onBoard(square) && map.get(square) === "k") return true;
        }
    }else{
        //PAWN
        if (kingSquare.charAt(1) != '1'){
            if (kingSquare.charAt(0) != 'A') {
                if(map.get(addChar(kingSquare.charAt(0), -1) + (Number(kingSquare.charAt(1))-1)) === "P") return true;
            }
            if (kingSquare.charAt(0) != 'H') {
                if(map.get(addChar(kingSquare.charAt(0), 1) + (Number(kingSquare.charAt(1))-1)) === "P") return true;
            }
        }

        //KNIGHT
        for (const [c, i] of knightOffsets){
            const cell = addChar(kingSquare.charAt(0), c) + addChar(kingSquare.charAt(1), i);

            if (onBoard(cell) && map.get(cell) === "N"){
                return true
            }
        }
        
        //ROOK/QUEEN
        for (const [c, i] of rookDir){
            let square = kingSquare;
            square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            
            while (onBoard(square)){
                const piece = map.get(square);
                if (piece === "R" || piece === "Q") return true;
                if (piece != "e") break;

                square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            }
        }

        //BISHOP/QUEEN
        for (const [c, i] of bishopDir){
            let square = kingSquare;
            square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            
            while (onBoard(square)){
                const piece = map.get(square);
                if (piece === "B" || piece === "Q") return true;
                if (piece != "e") break;

                square = addChar(square.charAt(0), c) + addChar(square.charAt(1), i);
            }
        }

        //KING
        for (const [c, i] of kingSquares){
            const square = addChar(kingSquare.charAt(0), c) + addChar(kingSquare.charAt(1), i);

            if (onBoard(square) && map.get(square) === "K") return true;
        }
    }

    return false;
}

export async function movePiece(initCell: string, cell: string, color: string, piece: Piece, send: boolean, promoteCallback: () => Promise<Piece>){
    if (checkMove(initCell, cell, color, piece, send) && initCell != cell){
        if (moveIsCastle(piece, cell) && send){
            const castleType = (cell.charAt(0) == 'C') ? "long" : "short";

            boardMapRevert = new Map(boardMap);

            boardMap.set(initCell, 'e')
            
            if (castleType === "short"){
                boardMap.set("H" + initCell.charAt(1), 'e')
                boardMap.set("G" + initCell.charAt(1), getPieceChar(Pieces.KING, color))
                boardMap.set("F" + initCell.charAt(1), getPieceChar(Pieces.ROOK, color))
            }else{
                boardMap.set("A" + initCell.charAt(1), 'e')
                boardMap.set("C" + initCell.charAt(1), getPieceChar(Pieces.KING, color))
                boardMap.set("D" + initCell.charAt(1), getPieceChar(Pieces.ROOK, color))
            }

            if (!isCheck(color, boardMap) && checkMove(initCell, ((cell.charAt(0) === 'C') ? 'D' : 'F') + cell.charAt(1), color, piece, false) || !send){
                const cellDiv = document.getElementById(cell);
                
                if (cellDiv?.childElementCount > 0) {
                    cellDiv.innerHTML = '';
                }
                
                if (cell === enPassant){
                    let delCell;
                    
                    if (color == "white"){
                        delCell = cell.charAt(0) + (Number(cell.charAt(1)) - 1);
                    }else{
                        delCell = cell.charAt(0) + (Number(cell.charAt(1)) + 1);
                    }
                    
                    document.getElementById(delCell).innerHTML = '';
                }

                if (send){
                    enPassant = '';

                    if (currentPiece?.type == "PAWN" && Math.abs(Number(cell.charAt(1)) - Number(cellBeingMoved.charAt(1))) == 2){
                        enPassant = cell.charAt(0) + (Number(cell.charAt(1)) - ((currentPieceColor == "white") ? 1 : -1));
                    }
                }

                castle(castleType, initCell);

                if (send) {
                    setTurn(false);
                    addPosition();

                    socket.emit("castle", {
                        type: (cell.charAt(0) == 'C') ? "long" : "short",
                        initCell: initCell
                    });

                    kingMoved = true;
                }
            }else{
                boardMap = new Map(boardMapRevert);
                setPiece(piece, initCell, color);
            }
        }else{
            boardMapRevert = new Map(boardMap);

            boardMap.set(initCell, 'e')
            boardMap.set(cell, getPieceChar(piece, color))

            if (!isCheck(color, boardMap) || !send){
                if (kingCell != null){
                    kingCell.style = '';
                }
                
                if (!send){
                    if (piece.type === "KING") otherKingMoved = true;

                    if (piece.type === "ROOK"){
                        if (initCell.charAt(0) === 'A' && otherARookMoved == false) otherARookMoved = true;
                        if (initCell.charAt(0) === 'H' && otherHRookMoved == false) otherHRookMoved = true;
                    }
                }

                const cellDiv = document.getElementById(cell);
                
                if (cellDiv?.childElementCount > 0) {
                    cellDiv.innerHTML = '';
                }
                
                if (boardMap.get(cell) != 'e' || piece.type === "PAWN"){
                    plieCounter = 0;
                }else {
                    plieCounter++;
                }

                if (cell === enPassant){
                    let delCell;
                    
                    if (color == "white"){
                        delCell = cell.charAt(0) + (Number(cell.charAt(1)) - 1);
                    }else{
                        delCell = cell.charAt(0) + (Number(cell.charAt(1)) + 1);
                    }
                    
                    document.getElementById(delCell).innerHTML = '';

                    plieCounter = 0;
                }

                if (send){
                    enPassant = '';

                    if (currentPiece?.type == "PAWN" && Math.abs(Number(cell.charAt(1)) - Number(cellBeingMoved.charAt(1))) == 2){
                        enPassant = cell.charAt(0) + (Number(cell.charAt(1)) - ((currentPieceColor == "white") ? 1 : -1));
                    }
                }
                
                setPiece(piece, cell, color);
                
                if (currentPiece?.type === "KING") {
                    kingMoved = true;
                }

                drawPreviousMove(initCell, cell);

                drawCheckSquare(color === "white" ? "black " : "white");

                if (send){
                    let newPiece: Piece | undefined;
                    if (piece.type === "PAWN" && (cell.charAt(1) == '1' || cell.charAt(1) == '8')){
                        newPiece = await promoteCallback();
                        document.getElementById(cell).innerHTML = '';
                        setPiece(newPiece, cell, color);
                    }

                    if (!aRookMoved && piece.type === "ROOK" && (initCell == "A8" || initCell == "A1")){
                        aRookMoved = true;
                    }else if(!hRookMoved && piece.type === "ROOK" && (initCell == "H8" || initCell == "H1")) {
                        hRookMoved = true;
                    }

                    setTurn(false);
                    addPosition();

                    socket.emit("movePiece", {
                        initCell: cellBeingMoved,
                        cell: cell,
                        color: currentPieceColor,
                        piece: (newPiece != null) ? newPiece : piece
                    });
                    socket.emit("enPassant", {
                        passant: enPassant
                    }) 
                }

                cellBeingMoved = '';
            }else{
                boardMap = new Map(boardMapRevert);
                setPiece(piece, initCell, color);
            }
        }
    }else{
        setPiece(piece, initCell, color);
    }
}

function drawCheckSquare(color: string){
    if (isCheck(color, boardMap)){
        const kingSquare = findKingSquare(color, boardMap);

        const kingDiv = document.getElementById(kingSquare);
        kingDiv.style.backgroundColor = '#960000';

        kingCell = kingDiv;
    }
}

function drawPreviousMove(initCell: string, cell: string) {
    const initDiv = document.getElementById(initCell);
    const cellDiv = document.getElementById(cell);

    if (ccell1 != null){
        ccell1.style = '';
    }
                
    if (ccell2 != null){
        ccell2.style = '';
    }

    initDiv.style.backgroundColor = '#efff62';
    cellDiv.style.backgroundColor = '#efff62';

    ccell1 = initDiv;
    ccell2 = cellDiv;
}

function contains(array: string[], str: string): boolean{
    for (let i = 0; i < array.length; i++){
        if (array[i] === str) return true;
    }

    return false;
}

function checkMove(cellBeingMoved: string, cell: string, color: string, currentPiece: Piece, send: boolean): boolean{
    const validMoves = calcValidMoves(cellBeingMoved, color, currentPiece?.type ?? "");

    if (contains(validMoves, cell)){
        return true;
    }

    return false;
}

function addChar(char: string, num: number): string {
    const charCode = char.charCodeAt(0) + num;
    return String.fromCharCode(charCode);
}

function calcValidMoves(initCell: string, color: string, type: string): string[]{
    const validMoves: string[] = [];

    if (type == "PAWN"){
        if (color === 'white'){
            if (document.getElementById(initCell.charAt(0) + (Number(initCell.charAt(1)) + 1))?.childElementCount == 0){
                validMoves.push(initCell.charAt(0) + (Number(initCell.charAt(1)) + 1));
                if (initCell.charAt(1) === "2" && document.getElementById(initCell.charAt(0) + (Number(initCell.charAt(1)) + 2))?.childElementCount == 0){
                    validMoves.push(initCell.charAt(0) + (Number(initCell.charAt(1)) + 2));
                } 
            }

            if (initCell.charAt(0) != "A"){
                const cellCode = addChar(initCell.charAt(0), -1) + (Number(initCell.charAt(1)) + 1);
                if ((document.getElementById(cellCode)?.childElementCount > 0 && document.getElementById(cellCode)?.firstElementChild?.classList.contains("pieceImgBlack")) || cellCode == enPassant){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(0) != "H"){
                const cellCode = addChar(initCell.charAt(0), +1) + (Number(initCell.charAt(1)) + 1);
                if ((document.getElementById(cellCode)?.childElementCount > 0 && document.getElementById(cellCode)?.firstElementChild?.classList.contains("pieceImgBlack")) || cellCode == enPassant){
                    validMoves.push(cellCode);
                }
            }
        }else if (color === 'black'){
            if (document.getElementById(initCell.charAt(0) + (Number(initCell.charAt(1)) - 1))?.childElementCount == 0){
                validMoves.push(initCell.charAt(0) + (Number(initCell.charAt(1)) - 1));
                if (initCell.charAt(1) === "7" && document.getElementById(initCell.charAt(0) + (Number(initCell.charAt(1)) - 2))?.childElementCount == 0) {
                    validMoves.push(initCell.charAt(0) + (Number(initCell.charAt(1)) - 2));
                }
            }

            if (initCell.charAt(0) != "A"){
                const cellCode = addChar(initCell.charAt(0), -1) + (Number(initCell.charAt(1)) - 1);
                if ((document.getElementById(cellCode)?.childElementCount > 0 && document.getElementById(cellCode)?.firstElementChild?.classList.contains("pieceImgWhite")) || cellCode == enPassant){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(0) != "H"){
                const cellCode = addChar(initCell.charAt(0), +1) + (Number(initCell.charAt(1)) - 1);
                if ((document.getElementById(cellCode)?.childElementCount > 0 && document.getElementById(cellCode)?.firstElementChild?.classList.contains("pieceImgWhite")) || cellCode == enPassant){
                    validMoves.push(cellCode);
                }
            }
        }
    }

    let className = ""
    let oppClassName = ""

    if (color === "white") {
        className = "pieceImgWhite"; 
        oppClassName = "pieceImgBlack";
    }

    if (color === "black"){
        className = "pieceImgBlack"; 
        oppClassName = "pieceImgWhite";
    }

    if (type === "KNIGHT"){
        if (Number(initCell.charAt(1)) > 2){
            if (initCell.charAt(0) != 'A') {
                const cellCode = addChar(initCell.charAt(0), -1) + (Number(initCell.charAt(1)) - 2);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(0) != 'H') {
                const cellCode = addChar(initCell.charAt(0), 1) + (Number(initCell.charAt(1)) - 2);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }
        }

        if (Number(initCell.charAt(1)) < 7){
            if (initCell.charAt(0) != 'A') {
                const cellCode = addChar(initCell.charAt(0), -1) + (Number(initCell.charAt(1)) + 2);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(0) != 'H') {
                const cellCode = addChar(initCell.charAt(0), 1) + (Number(initCell.charAt(1)) + 2);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }
        }

        if (initCell.charAt(0) != 'A' && initCell.charAt(0) != 'B'){
            if (initCell.charAt(1) != '1'){
                const cellCode = addChar(initCell.charAt(0), -2) + (Number(initCell.charAt(1)) - 1);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(1) != '8'){
                const cellCode = addChar(initCell.charAt(0), -2) + (Number(initCell.charAt(1)) + 1);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }
        }

        if (initCell.charAt(0) != 'H' && initCell.charAt(0) != 'G'){
            if (initCell.charAt(1) != '1'){
                const cellCode = addChar(initCell.charAt(0), +2) + (Number(initCell.charAt(1)) - 1);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }

            if (initCell.charAt(1) != '8'){
                const cellCode = addChar(initCell.charAt(0), +2) + (Number(initCell.charAt(1)) + 1);
                if (!document.getElementById(cellCode)?.firstElementChild?.classList.contains(className)){
                    validMoves.push(cellCode);
                }
            }
        }
    }

    if (type === "BISHOP" || type === "QUEEN"){
        let currCell = initCell;
        currCell = addChar(currCell.charAt(0), 1) + (Number(currCell.charAt(1)) + 1);
        
        while (currCell.charAt(0) != addChar('H', 1) && currCell.charAt(1) != '9') {
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), 1) + (Number(currCell.charAt(1)) + 1);
        }

        currCell = initCell;
        currCell = addChar(currCell.charAt(0), -1) + (Number(currCell.charAt(1)) + 1);
        
        while (currCell.charAt(0) != addChar('A', -1) && currCell.charAt(1) != '9') {
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), -1) + (Number(currCell.charAt(1)) + 1);
        }

        currCell = initCell;
        currCell = addChar(currCell.charAt(0), 1) + (Number(currCell.charAt(1)) - 1);
        
        while (currCell.charAt(0) != addChar('H', 1) && currCell.charAt(1) != '0') {
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), 1) + (Number(currCell.charAt(1)) - 1);
        }

        currCell = initCell;
        currCell = addChar(currCell.charAt(0), -1) + (Number(currCell.charAt(1)) - 1);
        
        while (currCell.charAt(0) != addChar('A', -1) && currCell.charAt(1) != '0') {
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), -1) + (Number(currCell.charAt(1)) - 1);
        }
    }

    if (type === "ROOK" || type === "QUEEN"){
        let currCell = initCell;
        currCell = currCell.charAt(0) + (Number(currCell.charAt(1)) + 1);

        while (currCell.charAt(1) != '9'){
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = currCell.charAt(0) + (Number(currCell.charAt(1)) + 1);
        }

        currCell = initCell;
        currCell = currCell.charAt(0) + (Number(currCell.charAt(1)) - 1);

        while (currCell.charAt(1) != '0'){
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = currCell.charAt(0) + (Number(currCell.charAt(1)) - 1);
        }

        currCell = initCell;
        currCell = addChar(currCell.charAt(0), 1) + currCell.charAt(1);

        while (currCell.charAt(0) != addChar('H', 1)){
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), 1) + currCell.charAt(1);
        }

        currCell = initCell;
        currCell = addChar(currCell.charAt(0), -1) + currCell.charAt(1);

        while (currCell.charAt(0) != addChar('A', -1)){
            const currentDiv = document.getElementById(currCell);

            if (currentDiv?.childElementCount > 0){
                if (currentDiv?.firstElementChild?.classList.contains(className)){
                    break;
                }
                if (currentDiv?.firstElementChild?.classList.contains(oppClassName)){
                    validMoves.push(currCell);
                    break;
                }
            }
            
            validMoves.push(currCell);

            currCell = addChar(currCell.charAt(0), -1) + currCell.charAt(1);
        }
    }

    if (type === "KING"){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                const currCell = addChar(initCell.charAt(0), i) + (Number(initCell.charAt(1)) + j);
                const cellDiv = document.getElementById(currCell);

                if (cellDiv != undefined){
                    if (!cellDiv.firstElementChild?.classList.contains(className)){
                        validMoves.push(currCell);
                    } 
                }
            }    
        }

        if (!kingMoved) {
            if (document.getElementById('G' + initCell.charAt(1))?.childElementCount == 0 && document.getElementById('F' + initCell.charAt(1))?.childElementCount == 0 && !hRookMoved){
                validMoves.push('G' + initCell.charAt(1));
            }
            if (document.getElementById('D' + initCell.charAt(1))?.childElementCount == 0 && document.getElementById('C' + initCell.charAt(1))?.childElementCount == 0 && document.getElementById('B' + initCell.charAt(1))?.childElementCount == 0 && !aRookMoved){
                validMoves.push('C' + initCell.charAt(1));
            }
        }
    }

    return validMoves;
}

function findCell(e: MouseEvent): string{
    for (let i = 8; i > 0; i--)
    {
        for (let j = 0; j < 8; j++)
        {
            const startChar = 'A';
            const cellCharCode = startChar.charCodeAt(0) + j;
            const cellChar = String.fromCharCode(cellCharCode);

            if (checkMouseOnCell(cellChar + i, e)) return cellChar + i;
        }
    }

    return ' ';
}

function checkMouseOnCell(cell: string, e: MouseEvent): boolean{
    const cellDiv = document.getElementById(cell);

    const x = cellDiv?.getBoundingClientRect().left;
    const y = cellDiv?.getBoundingClientRect().top;

    if (e.clientX > x && e.clientX < x + cellDiv?.getBoundingClientRect().width && e.clientY > y && e.clientY < y + cellDiv?.getBoundingClientRect().height){
        return true;
    }

    return false;
}