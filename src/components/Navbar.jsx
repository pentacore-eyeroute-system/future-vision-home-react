import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/our-work', label: 'Our Work' },
  { to: '/our-partners', label: 'Our Partners' },
  { to: '/eye-route', label: 'EyeRoute' },
  { to: '/donate', label: 'Donate', className: 'nav-donate' },
  { to: '/contact', label: 'Contact Us' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <NavLink to="/" className="logo" onClick={closeMenu}>
            <img src="/images/fvh-logo.png" alt="Future Vision Home" className="logo-image" />
            <div className="logo-text-wrapper">
              <span className="logo-text">Future Vision Home</span>
              <span className="logo-subtext">Future Vision Sighted-Blind, Inc.</span>
            </div>
          </NavLink>

          <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="navMenu">
            {navLinks.map(({ to, label, className }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${className || ''} ${isActive ? 'active' : ''}`.trim()
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <ThemeToggle />
            <button
              className={`nav-toggle${menuOpen ? ' active' : ''}`}
              id="navToggle"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
