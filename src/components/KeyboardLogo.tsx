'use client';
import Keycap from './Keycap';

const MAIN_AR = 1627 / 222;   // wh4tislove + стрелка
const HEART_AR = 311 / 216;   // <3

export default function KeyboardLogo() {
  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap id="main" tw={470} th={112} className="keycap-main"
              img={{ src: '/keys/wh4tislove_src.png', ar: MAIN_AR, h: 50 }} />
      <Keycap id="heart" tw={128} th={112} className="keycap-heart"
              img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 58 }} />
    </div>
  );
}
