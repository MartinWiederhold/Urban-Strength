'use client'

const ITEMS = [
  'Personal Training',
  'Muskelaufbau',
  'Fettabbau',
  'Kraft & Kondition',
  '1:1 Coaching',
  'Zürich',
  'Probetraining gratis',
]

export default function Marquee() {
  // Duplicate the sequence so the -50% translate loops seamlessly.
  const loop = [...ITEMS, ...ITEMS]

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink py-5 md:py-6">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.2em] text-white md:text-[15px]">
              {item}
            </span>
            <span className="mx-6 text-flame md:mx-9" aria-hidden>✳</span>
          </span>
        ))}
      </div>
    </div>
  )
}
