import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import App from './menu/screens/App.tsx'


const root: Root = createRoot(document.getElementById('root')!)

export function leave() {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

export default root

leave();