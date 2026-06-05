'use client';
import Keycap from './Keycap';

const NICE_AR = 964 / 443;
const TRY_AR = 737 / 508;

// Две клавиши «nice» / «try.» каскадом по диагонали (как на референсе 404)
export default function NiceTryKeys() {
  return (
    <div className="nicetry">
      <div className="nt-nice">
        <Keycap id="nice" tw={196} th={112} press={false}
                img={{ src: '/keys/nice_src.png', ar: NICE_AR, h: 50 }} />
      </div>
      <div className="nt-try">
        <Keycap id="trydot" tw={150} th={112} press={false}
                img={{ src: '/keys/try_src.png', ar: TRY_AR, h: 60 }} />
      </div>
    </div>
  );
}
