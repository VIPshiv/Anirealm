'use client';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: 'black', color: 'white' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
          <p style={{ color: '#A0AEC0', marginBottom: '2rem' }}>We apologize for the inconvenience.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#D53F8C',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
