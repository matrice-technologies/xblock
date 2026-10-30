/** Brand marks lucide no longer ships. */

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
    </svg>
  )
}

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" fill="#4285f4" />
      <path d="M12 2a10 10 0 0 1 8.66 5H12z" fill="#ea4335" />
      <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5z" fill="#fbbc04" />
      <path d="M12 22A10 10 0 0 1 3.34 7l4.33 7.5z" fill="#34a853" />
      <path d="M3.34 7A10 10 0 0 1 12 2v5z" fill="#ea4335" />
      <circle cx="12" cy="12" r="4.6" fill="#fff" />
      <circle cx="12" cy="12" r="3.6" fill="#4285f4" />
    </svg>
  )
}

export { ChromeIcon, GitHubIcon }
