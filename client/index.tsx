import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"

// need to add an event listener for gamepad connection to reference
// gamepads later
window.addEventListener('gamepadconnected', (e) => {
  // const gp = navigator.getGamepads()[e.gamepad.index]
  // console.log('Gamepad connected', gp)
})

const body = document.getElementById('app')
const root = createRoot(body!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
