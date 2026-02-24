export default function Custom404() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '16px', color: '#FF0000' }}>404</h1>
            <p style={{ fontSize: '18px', marginBottom: '24px' }}>Page not found</p>
            <a href="/" style={{ color: '#FF0000', textDecoration: 'none', fontSize: '16px' }}>
                ← Go back home
            </a>
        </div>
    )
}
