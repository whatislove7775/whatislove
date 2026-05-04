'use client';

export default function Loading() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'inherit',
      fontWeight: 800,
      fontSize: '14px',
      backgroundColor: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <span style={{ 
        letterSpacing: '2px', 
        animation: 'pulse 1.5s ease-in-out infinite' 
      }}>
        [ загрузка... ]
      </span>

      {/* Простая CSS-анимация мигания для стиля */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
