import { useEffect, useRef, useState } from 'react'
import './Game.css'
import { createBoard } from '../game/GamePrep';
import { playerColor, movePiece, setPassant, castle, boardMap, getPieceChar, registerWindowListeners, setRunning, setTurn, addPosition, resign, drawRequest, reset, setColor } from '../game/GameLogic'
import {socket} from "../game/ServerLogic"
import { Pieces, type Piece } from '../game/Piece';

import drawImg from '../../assets/Draw.png';
import resignImg from '../../assets/Resign.png';
import { leave } from '../../main';

//After castling on white black breaks idk what abt the other color crying rn breh aaaa.

let added = false;

function Game(){
    const boardRef = useRef<HTMLDivElement>(null);
    const htRef = useRef<HTMLDivElement>(null);
    const hbRef = useRef<HTMLDivElement>(null);
    const vlRef = useRef<HTMLDivElement>(null);
    const vrRef = useRef<HTMLDivElement>(null);

    const promoResolver = useRef<((value: Piece) => void) | null>(null);
    const [showPromo, setShowPromo] = useState(false);

    const askUserForPiece = (): Promise<Piece> => {
        setShowPromo(true);
        return new Promise((resolve) => {
            promoResolver.current = resolve;
        });
    };

    const handleSelection = (piece: Piece) => {
        if (promoResolver.current) {
            promoResolver.current(piece);
            promoResolver.current = null;
            setShowPromo(false);
        }
    };

    const endScreenResolver = useRef<((value: string) => void) | null>(null);
    const [showEndScreen, setShowEndScreen] = useState(false);
    const [endScreenTitle, setEndScreenTitle] = useState("");
    const [endScreenMessage, setEndScreenMessage] = useState("");

    const fetchInput = (title: string, message: string): Promise<string> => {
        setEndScreenTitle(title);
        setEndScreenMessage(message);
        setShowEndScreen(true);
        document.getElementsByTagName('body')[0].style.backgroundColor = "#272833";
        return new Promise((resolve) => {
            endScreenResolver.current = resolve;
        });
    };

    const handleEndScreenChoice = (choice: string) => {
        if (endScreenResolver.current) {
            endScreenResolver.current(choice);
            endScreenResolver.current = null;
            setShowEndScreen(false);
        }
    };

    const confirmResolver = useRef<((value: string) => void) | null>(null);
    const [showConfirmDialogue, setShowConfirmDialogue] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const fetchConfirmInput = (message: string): Promise<string> => {
        setConfirmMessage(message);
        setShowConfirmDialogue(true);
        return new Promise((resolve) => {
            confirmResolver.current = resolve;
        });
    };

    const handleConfirmChoice = (choice: string) => {
        if (confirmResolver.current) {
            confirmResolver.current(choice);
            confirmResolver.current = null;
            setShowConfirmDialogue(false);
        }
    };

    useEffect(() => {
        const board = boardRef.current;
        const ht = htRef.current;
        const hb = hbRef.current;
        const vl = vlRef.current;
        const vr = vrRef.current;
        
        if (!board || board.children.length > 0) return;

        if (!socket){
            return () => {
                if (board) board.innerHTML = '';
                if (ht) ht.innerHTML = '';
                if (hb) hb.innerHTML = '';
                if (vl) vl.innerHTML = '';
                if (vr) vr.innerHTML = '';
            };
        }

        socket.on("setColor", (data) => {
            setColor(data.color);
            createBoard(playerColor)
        });

        socket.on("castle", (data) => {
            boardMap.set(data.initCell, 'e')
                        
            if (data.type === "short"){
                boardMap.set("H" + data.initCell.charAt(1), 'e')
                boardMap.set("G" + data.initCell.charAt(1), getPieceChar(Pieces.KING, playerColor === "white" ? "black" : "white"))
                boardMap.set("F" + data.initCell.charAt(1), getPieceChar(Pieces.ROOK, playerColor === "white" ? "black" : "white"))
            }else{
                boardMap.set("A" + data.initCell.charAt(1), 'e')
                boardMap.set("C" + data.initCell.charAt(1), getPieceChar(Pieces.KING, playerColor === "white" ? "black" : "white"))
                boardMap.set("D" + data.initCell.charAt(1), getPieceChar(Pieces.ROOK, playerColor === "white" ? "black" : "white"))
            }

            castle(data.type, data.initCell);

            setTurn(true);
            addPosition();
        });

        socket.on("movePiece", async (data) => {
            await movePiece(data.initCell, data.cell, data.color, data.piece, false, askUserForPiece);
            document.getElementById(data.initCell).innerHTML = '';
            setTurn(true);
            addPosition();
        });

        socket.on("enPassant", (data) => {
            setPassant(data.passant);
        });

        socket.on("drawEndscreen", async (data) => {
            setRunning(true);
            await fetchInput(
                data.title,
                data.message
            )
            setRunning(false);
        })

        socket.on("drawRequest", async () => {
            setRunning(false)
            const reply = await fetchConfirmInput("The other side is offering a draw, accept?")
            setRunning(true)
            if (reply === "Yes"){
                socket.emit("drawEndscreen", {
                    title: "Draw!",
                    message: "By Offer"
                });
                const userChoice = await fetchInput("Draw!", "By Offer");  
            }
        })

        socket.on("rematchRequest", async () => {
            const reply = await fetchConfirmInput("Rematch request! Accept?")
            if (reply === "Yes"){
                socket.emit("rematchReply", {reply: "Yes"});
                
                reset(true);
                setShowEndScreen(false);
            }else{
                leave();
                socket.emit("rematchReply", {reply: "No"});
                socket.disconnect();
            }
        })

        socket.on("rematchReply", (data) => {
            if (data.reply === "Yes"){
                reset(false);
                setShowEndScreen(false);
            }else{
                leave();
                socket.disconnect();
            }
        })

        createBoard(playerColor);
        registerWindowListeners(askUserForPiece, fetchInput);

        if (!added){
            addPosition();
            added = true;
        }

        return () => {
                if (board) board.innerHTML = '';
                if (ht) ht.innerHTML = '';
                if (hb) hb.innerHTML = '';
                if (vl) vl.innerHTML = '';
                if (vr) vr.innerHTML = '';

                socket.off("movePiece");
                socket.off("enPassant");
                socket.off("castle");
                socket.off("drawEndscreen");
                socket.off("drawRequest")
                socket.off("setColor")
                socket.off("rematchRequest")
                socket.off("rematchReply")
            };
    }, []);

    return (
        <>
        {showPromo && (
            <div id="promotion-menu">
                <h3>Promote Your Pawn</h3>
                <div className="promo-options">
                    <img src={Pieces.QUEEN.imgFile} onClick={() => handleSelection(Pieces.QUEEN)}/>
                    <img src={Pieces.ROOK.imgFile} onClick={() => handleSelection(Pieces.ROOK)}/>
                    <img src={Pieces.BISHOP.imgFile} onClick={() => handleSelection(Pieces.BISHOP)}/>
                    <img src={Pieces.KNIGHT.imgFile} onClick={() => handleSelection(Pieces.KNIGHT)}/>
                </div>
            </div>
        )}

        {showEndScreen && (
            <div id="end-screen">
                <h1>{endScreenTitle}</h1>
                <p>{endScreenMessage}</p>
                <div id='buttons'>
                    <div className='confirmButton' onClick={async () => {
                            handleEndScreenChoice("Rematch");
                            socket.emit("rematchRequest");
                        }}>
                        <p>Rematch</p>
                    </div>
                    <div className='confirmButton' onClick={() => {
                        handleEndScreenChoice("Leave");
                        leave();
                        socket.disconnect();
                    }}>
                        <p>Leave</p>
                    </div>
                </div>
            </div>
        )}

        {showConfirmDialogue && (
            <div id="confirm-dialogue">
                <p>{confirmMessage}</p>
                <div id='buttons'>
                    <div className='confirmButton' onClick={() => {handleConfirmChoice("Yes"); setShowConfirmDialogue(false)}}>
                        <p>Yes</p>
                    </div>
                    <div className='confirmButton' onClick={() => {handleConfirmChoice("No"); setShowConfirmDialogue(false)}}>
                        <p>No</p>
                    </div>
                </div>
            </div>
        )}

        <div id = 'boardBorder' draggable="false">
            <div id='HT' ref = {htRef}>

            </div>
            <div id = 'board' ref = {boardRef}>
                
            </div>
            <div id='HB' ref = {hbRef}>

            </div>
            <div id='VL' ref = {vlRef}>

            </div>
            <div id='VR' ref = {vrRef}>

            </div>
        </div>
        <div id="buttonPanel">
            <div id="gameButtons">
                <div className='gameButton' onClick={() => resign(fetchConfirmInput, fetchInput)}>
                    <img src={resignImg}/>
                </div>
                <div className='gameButton' onClick={() => drawRequest(fetchConfirmInput, fetchInput)}>
                    <img src={drawImg}/>
                </div>
            </div>
        </div>
        </>
    )
}

export default Game