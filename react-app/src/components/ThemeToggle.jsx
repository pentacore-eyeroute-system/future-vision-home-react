import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="theme-icon">
        <img
          src="/images/dark-light.png"
          alt={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="theme-switch-icon"
        />
      </span>
    </button>
  )
}

export default ThemeToggle
