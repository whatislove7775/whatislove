'use client';
import { useState } from 'react';
import CollabModal from './CollabModal';

export default function CollabButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', textTransform: 'lowercase',
          padding: '10px 18px', border: '2px solid #000', background: '#fff', color: '#000',
          cursor: 'pointer', alignSelf: 'flex-start', lineHeight: 1.3,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
      >
        + предложить свой товар в коллаборацию
      </button>
      {open && <CollabModal onClose={() => setOpen(false)} />}
    </>
  );
}
