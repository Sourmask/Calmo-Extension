export function LineIcon({ name }: { name: string }) {
  return (
    <svg className="line-icon" viewBox="0 0 32 32" aria-hidden="true">
      {name === 'wave' && <path d="M5 17C9 12 12 22 16 17S23 12 27 17" />}
      {name === 'wave-tab' && (
        <>
          <path d="M5 11C10 7 14 15 19 11S24 7 28 11" />
          <path d="M5 17C10 13 14 21 19 17S24 13 28 17" />
          <path d="M5 23C10 19 14 27 19 23S24 19 28 23" />
        </>
      )}
      {name === 'tilt' && <path d="M9 23L23 9" />}
      {name === 'circle' && <circle cx="16" cy="16" r="8" />}
      {name === 'small-circle' && <circle cx="16" cy="16" r="5" />}
      {name === 'body' && <rect x="8" y="12" width="16" height="8" rx="4" />}
      {name === 'layers' && (
        <>
          <path d="M9 11H23" />
          <path d="M7 16H25" />
          <path d="M10 21H22" />
        </>
      )}
      {name === 'home' && (
        <>
          <circle cx="16" cy="16" r="10" />
          <path d="M12 17L16 13L20 17V21H12Z" />
        </>
      )}
      {name === 'rings' && (
        <>
          <circle cx="16" cy="16" r="4" />
          <circle cx="16" cy="16" r="8" />
          <circle cx="16" cy="16" r="12" />
        </>
      )}
      {name === 'leaf' && <path d="M9 23C19 23 24 16 23 8C15 7 9 13 9 23ZM10 22L20 12" />}
      {name === 'person' && (
        <>
          <circle cx="16" cy="12" r="4" />
          <path d="M8 25C10 20 22 20 24 25" />
        </>
      )}
      {name === 'moon' && <path d="M21 24C14 24 9 19 9 12C9 9 10 6 12 4C12 13 18 19 27 19C25 22 23 24 21 24Z" />}
      {name === 'arrow' && <path d="M10 16H22M17 11L22 16L17 21" />}
      {name === 'timer' && (
        <>
          <circle cx="16" cy="17" r="9" />
          <path d="M16 17V12" />
          <path d="M16 17L20 20" />
          <path d="M13 5H19" />
        </>
      )}
    </svg>
  )
}
