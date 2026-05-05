import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import App from './menu/screens/App.tsx'
import { getLangImg, type Lang } from './menu/langManager/lang.ts'

const root: Root = createRoot(document.getElementById('root')!)

export let currentLang: Lang = "en";

export function setLang(lang: Lang){
  currentLang = lang;
}

let isMenuOpen = false;

export let leaveFunc = leave;

export function setLeaveFunc(func: () => void){
  leaveFunc = func
}

export function leave() {
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

      <App />
    </StrictMode>
  );
}

export default root

leave();

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