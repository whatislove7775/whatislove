'use client';

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <button type="button" className="keycap keycap-main">
        <span className="keycap-face">
          <span className="keycap-label">wh4tislove</span>
          <span className="keycap-enter" aria-hidden>⏎</span>
        </span>
      </button>
      <button type="button" className="keycap keycap-heart">
        <span className="keycap-face">&lt;3</span>
      </button>
    </div>
  );
}
