import React from 'react'

export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const text = tone === 'light' ? 'text-white' : 'text-ocean'
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden>
        <rect width="36" height="36" rx="9" fill="#087E8B" />
        <path d="M9 17c2.6-4 6-6 9.5-6 3 0 5.4 1.4 7.5 3.6l3-2.1v8l-3-2.1C23.9 20.6 21.5 22 18.5 22 15 22 11.6 20 9 17Z" fill="#fff" />
        <circle cx="13.6" cy="16.2" r="1.1" fill="#087E8B" />
        <path d="M7 27c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0 4 1.6 4 1.6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className={`text-xl font-extrabold tracking-tight ${text}`}>
        Jala<span className={tone === 'light' ? 'text-[#5FD0DA]' : 'text-teal'}>Laot</span>
      </span>
    </span>
  )
}
