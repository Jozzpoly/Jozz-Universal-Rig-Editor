export function MapWorkspace() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#111418',
        color: '#dbe7ff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <section style={{ maxWidth: 560, padding: 32 }}>
        <p style={{ margin: 0, opacity: 0.66, letterSpacing: '0.08em', textTransform: 'uppercase' }}>JURE · Map</p>
        <h1 style={{ margin: '10px 0 12px', fontSize: 30 }}>Map workspace foundation</h1>
        <p style={{ margin: 0, lineHeight: 1.55, color: '#aebbc8' }}>
          This workspace is intentionally isolated from the accepted Rig workspace. The next slice will introduce authored map data before editor or runtime integration.
        </p>
      </section>
    </main>
  );
}
