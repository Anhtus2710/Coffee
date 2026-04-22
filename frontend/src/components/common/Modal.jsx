import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isFullscreen = size === 'fullscreen';
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(15,23,42,0.40)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`relative animate-glassIn ${isFullscreen ? '' : sizes[size]}`}
        style={isFullscreen ? {
          inset: 0,
          width: '100%',
          height: '100%',
          borderRadius: 0,
          background: '#F1F5F9',
          border: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        } : {
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid rgba(148,163,184,0.20)',
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.80)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            borderBottom: '1px solid rgba(148,163,184,0.18)',
            padding: isFullscreen ? '16px 32px' : '16px 24px',
          }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: '1rem', color: '#1E293B', letterSpacing: '-0.01em' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#F1F5F9',
              border: '1px solid rgba(148,163,184,0.20)',
              color: '#64748B', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div
          className="overflow-y-auto flex-1"
          style={{
            minHeight: 0,
            padding: isFullscreen ? '24px 32px' : '20px 24px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}