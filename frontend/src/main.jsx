import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { applyTheme, getTheme } from './theme.js'
import './styles.css'

// Put the saved theme in place before anything renders, so no part of the interface is
// ever painted in the wrong one. The page background can still show light for a frame
// before this runs; see design.md for why that is accepted.
applyTheme(getTheme())

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
