import './ServerSelector.css'
import { io } from "socket.io-client"
import { setSocket } from '../game/ServerLogic';
import root, { currentLang, leaveFunc, setLang, setLeaveFunc } from "../../main"
import { StrictMode } from 'react';
import Waiting from './Waiting'
import { getLangImg, textFromLang, type Lang } from '../langManager/lang';

let isMenuOpen = false;

function playMultiplayer(){
  setLeaveFunc(playMultiplayer)
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
      <Waiting />
    </StrictMode>
  );
}

function connect(serverIp: string, serverPort: number){
  const socket = io(`http://${serverIp}:${serverPort}`);
  return socket;
}

function ServerSelector(){
    return (
        <>
        <div className='titleDiv'>
        <div className='titleContainer'>
         <h1 className='mainTitle'>BloxxChess</h1>
        </div>
      </div>
      <div className='buttons'>
        <input className='defaultInput' id='ipInput' placeholder={textFromLang(currentLang, "serverIpPlaceholder")}>

        </input>

        <input className='defaultInput' id='portInput' placeholder={textFromLang(currentLang, "serverPortPlaceholder")}>

        </input>

        <div className='defaultBtn' id='defaultUI' onClick={() => {
          const ipInput = document.getElementById('ipInput') as HTMLInputElement;
          const portInput = document.getElementById('portInput') as HTMLInputElement;
          
          const ip = ipInput.value;
          const port = +portInput.value;

          if (port > 1023 && port < 49152) {
            setSocket(connect(ip, port));
            playMultiplayer();
          }
        }}>
          <p>
            {textFromLang(currentLang, "joinButton")}
          </p>
        </div>
      </div>
        </>
    )
}

export default ServerSelector

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