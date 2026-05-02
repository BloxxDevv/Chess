import { StrictMode, useEffect, useState } from "react";
import {socket} from "../game/ServerLogic"
import "./Waiting.css"
import {setColor} from "../game/GameLogic"
import root from "../../main"
import Game from "./Game";

function startGame(){
  root.render(
    <StrictMode>
      <Game />
    </StrictMode>
  );
}

function Waiting(){
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!socket) return;

        socket.on("playerCountUpdate", (data) => {
            console.log("Received count:", data.count);
            setCount(data.count); 
        });

        socket.on("setColor", (data) => {
            setColor(data.color);
            startGame();
        });

        return () => {
            socket.off("playerCountUpdate");
            socket.off("setColor");
        };
    }, []);

    return (
        <>
        <div className="waiting" id="root">
            <h1 id="pCountLbl">Waiting for players... ({count}/2)</h1>
        </div>
        </>
    );
}

export default Waiting;