import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

const body = document.getElementById('app')
const root = createRoot(body!)
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
