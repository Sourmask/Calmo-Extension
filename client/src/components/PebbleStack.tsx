export function PebbleStack({ className = '' }: { className?: string }) {
  return (
    <svg className={`pebble-stack ${className}`} viewBox="0 0 78 92" aria-hidden="true">
      <path className="pebble warm" d="M23 22C27 10 51 10 56 22C61 34 47 42 35 39C24 37 18 31 23 22Z" />
      <path className="pebble sage" d="M17 45C25 35 54 35 62 46C70 58 51 66 34 62C18 59 8 55 17 45Z" />
      <path className="pebble blue" d="M21 69C29 59 55 60 61 70C68 82 47 88 31 84C18 81 13 77 21 69Z" />
    </svg>
  )
}

