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
    <nav className="navbar" aria-label="Main Navigation">
      <div className="container">
        <div className="nav-content">
          <NavLink to="/" className="logo" onClick={closeMenu}>
            <img src="/images/fvh-logo.png" alt="Future Vision Home logo" className="logo-image" />
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
              type="button"
              className={`nav-toggle${menuOpen ? ' active' : ''}`}
              id="navToggle"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="navMenu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
