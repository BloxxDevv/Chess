import './App.css'
import { StrictMode } from 'react';
import ServerSelector  from './ServerSelector';
import root, { currentLang, leaveFunc, setLang, setLeaveFunc } from '../../main'
import { Pieces } from '../game/Piece';
import { getLangImg, textFromLang, type Lang } from '../langManager/lang';

let isMenuOpen = false;

function openServerSelector(){
  setLeaveFunc(openServerSelector)
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
            {textFromLang(currentLang, "joinServerButton")}
          </p>
        </div>
      </div>
    </>
  )
}

export default App

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