import './App.css'
import { StrictMode } from 'react';
import ServerSelector  from './ServerSelector';
import root from '../../main'
import { Pieces } from '../game/Piece';

function openServerSelector(){
  root.render(
    <StrictMode>
      <ServerSelector />
    </StrictMode>
  );
}

async function preloadImg(){
  new Image().src = Pieces.PAWN.imgFile;
  new Image().src = Pieces.KNIGHT.imgFile;
  new Image().src = Pieces.BISHOP.imgFile;
  new Image().src = Pieces.ROOK.imgFile;
  new Image().src = Pieces.QUEEN.imgFile;
  new Image().src = Pieces.KING.imgFile;
}

function App() {
  preloadImg();

  return (
    <>
      <div className='titleDiv'>
        <div className='titleContainer'>
         <h1 className='mainTitle'>BloxxChess</h1>
        </div>
      </div>
      <div className='buttons'>
        <div className='defaultBtn' id='defaultUI' onClick={ openServerSelector }>
          <p>
            Join Server
          </p>
        </div>
      </div>
    </>
  )
}

export default App
