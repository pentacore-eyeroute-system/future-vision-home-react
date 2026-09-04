import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-icon">
        <img
          src="/images/dark-light.png"
          alt=""
          aria-hidden="true"
          className="theme-switch-icon"
        />
      </span>
    </button>
  )
}

export default ThemeToggle
