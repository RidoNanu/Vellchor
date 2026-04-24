import { useEffect, useRef } from 'react'

export default function ToolbarDropdown({
  label,
  value,
  options,
  onChange,
  dropdownKey,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) {
  const containerRef = useRef(null)
  const activeOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    if (activeMenu === dropdownKey) {
      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activeMenu, dropdownKey, setActiveMenu])

  return (
    <div className={`poems-dropdown ${disabled ? 'is-disabled' : ''}`} ref={containerRef}>
      <span>{label}</span>
      <button
        type="button"
        className="poems-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={activeMenu === dropdownKey}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => {
          if (!disabled) {
            setActiveMenu((current) => (current === dropdownKey ? null : dropdownKey))
          }
        }}
      >
        <span>{activeOption.label}</span>
      </button>
      {activeMenu === dropdownKey && !disabled ? (
        <ul className="poems-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={option.value === value ? 'is-active' : ''}
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setActiveMenu(null)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
