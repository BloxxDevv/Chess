import { StrictMode, useEffect, useState } from "react";
import {socket} from "../game/ServerLogic"
import "./Waiting.css"
import {setColor} from "../game/GameLogic"
import root, { currentLang, leaveFunc, setLang, setLeaveFunc } from "../../main"
import Game from "./Game";
import { getLangImg, textFromLang, type Lang } from "../langManager/lang";

let isMenuOpen = false;

function startGame(){
    setLeaveFunc(startGame)
  root.render(
    <StrictMode>
        <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 9999 }}>
                <img 
                  id="selectLang"
                  src={getLangImg(currentLang)}
                  style={{ width: '48px', borderRadius: '10px', cursor: 'pointer' }} 
                />
        
                {isMenuOpen && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    marginTop: '8px',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '8px',
                    borderRadius: '12px',
                    border: "#b3ffc6 3px solid",
                    backdropFilter: 'blur(10px)'
                  }}>
                    {(['en', 'de', 'ru'] as Lang[]).map((lang) => (
                      <img 
                        key={lang}
                        data-lang={lang}
                        src={getLangImg(lang)}
                        style={{ 
                          width: '40px', 
                          cursor: 'pointer',
                          outline: currentLang === lang ? '2px solid white' : 'none'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
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
            <h1 id="pCountLbl">{textFromLang(currentLang, "waitingLabel")} ({count}/2)</h1>
        </div>
        </>
    );
}

export default Waiting;

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  
  if (target.id === 'selectLang') {
    isMenuOpen = !isMenuOpen;
    leaveFunc();
    return;
  }

  if (target.dataset.lang) {
    setLang(target.dataset.lang as Lang);
    isMenuOpen = false;
    leaveFunc();
    return;
  }

  if (isMenuOpen) {
    isMenuOpen = false;
    leaveFunc();
  }
});