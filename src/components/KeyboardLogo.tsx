'use client';

function Keycap({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <button type="button" className={`keycap ${className}`}>
      <span className="cuboid">
        <span className="kf kf-base" />
        <span className="kf kf-wallT" />
        <span className="kf kf-wallR" />
        <span className="kf kf-wallL" />
        <span className="kf kf-wallF" />
        <span className="kf kf-cap">{children}</span>
      </span>
    </button>
  );
}

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap className="keycap-main">
        <span className="kc-label">wh4tislove</span>
        <span className="kc-enter" aria-hidden>⏎</span>
      </Keycap>
      <Keycap className="keycap-heart">
        <span className="kc-label">&lt;3</span>
      </Keycap>
    </div>
  );
}
