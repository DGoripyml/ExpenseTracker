import { NavLink, Route, Routes } from 'react-router-dom'

import Categories from './pages/Categories.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <div className="layout">
      {/* NavLink adds an "active" class to the current page's link. */}
      <nav>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
