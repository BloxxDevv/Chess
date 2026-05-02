import './ServerSelector.css'
import { io } from "socket.io-client"
import { setSocket } from '../game/ServerLogic';
import root from "../../main"
import { StrictMode } from 'react';
import Waiting from './Waiting'

function playMultiplayer(){
  root.render(
    <StrictMode>
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
        <input className='defaultInput' id='ipInput' placeholder='Server IP'>

        </input>

        <input className='defaultInput' id='portInput' placeholder='Server Port'>

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
            Join
          </p>
        </div>
      </div>
        </>
    )
}

export default ServerSelector