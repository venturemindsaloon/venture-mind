/**
 * Animated background for the home page hero: drifting glows, rising gold sparkles
 * and floating lotus petals. Pure CSS (see globals.css), so it costs almost nothing.
 * Animation turns off for visitors who set "reduce motion" on their device.
 */

// Fixed positions so the server and browser render the same thing.
const sparkles = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  duration: 9 + ((i * 13) % 10),
  delay: -((i * 17) % 18),
  drift: ((i * 29) % 60) - 30,
}));

const petals = Array.from({ length: 9 }, (_, i) => ({
  left: (i * 23 + 5) % 100,
  size: 14 + ((i * 11) % 14),
  duration: 16 + ((i * 7) % 12),
  delay: -((i * 19) % 26),
  drift: ((i * 41) % 120) - 60,
  pink: i % 3 !== 0,
}));

export default function HeroBackground() {
  return (
    <div className="hero-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Soft moving glows */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Slowly rotating gold rings, echoing the round logo */}
      <div className="hero-ring" style={{ width: 640, height: 640, right: -160, top: -120 }} />
      <div className="hero-ring hero-ring-reverse" style={{ width: 420, height: 420, left: -140, bottom: -160 }} />

      {sparkles.map((s, i) => (
        <span
          key={`s${i}`}
          className="hero-sparkle"
          style={
            {
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s, ${2 + (i % 3)}s`,
              animationDelay: `${s.delay}s, ${-(i % 5) * 0.4}s`,
              "--drift": `${s.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}

      {petals.map((p, i) => (
        <svg
          key={`p${i}`}
          className="hero-petal"
          viewBox="0 0 20 32"
          width={p.size}
          height={p.size * 1.6}
          style={
            {
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        >
          <path
            d="M10 1C3 9 2 20 10 31C18 20 17 9 10 1Z"
            fill={p.pink ? "#f3d3d6" : "#d4ae6a"}
            fillOpacity={p.pink ? 0.55 : 0.35}
            stroke="#ecd3a0"
            strokeOpacity="0.5"
            strokeWidth="0.8"
          />
          <path d="M10 4V28" stroke="#ecd3a0" strokeOpacity="0.35" strokeWidth="0.6" />
        </svg>
      ))}

      {/* Fade the bottom edge into the page */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}
