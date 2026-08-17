import type { GatewayState } from "@/lib/use-gateway";
import { cn } from "@/lib/utils";

/* The Gateway Wall, Monolith edition. One standing stone, a living sigil, a
   fissure that draws itself when breached. Composed for a tall frame. */

export function GatewayWallArt({
  state,
  className,
}: {
  state: GatewayState;
  className?: string;
}) {
  const cracked = state === "cracked";
  const unhealthy = state !== "healthy";

  const sigil = cracked ? "#ef4444" : unhealthy ? "#eab308" : "#00deff";
  const sigilGlow = cracked
    ? "rgba(239,68,68,0.9)"
    : unhealthy
      ? "rgba(234,179,8,0.85)"
      : "rgba(0,222,255,0.9)";
  const edgeLight = cracked
    ? "rgba(239,68,68,0.5)"
    : unhealthy
      ? "rgba(234,179,8,0.45)"
      : "rgba(0,222,255,0.6)";

  return (
    <svg
      viewBox="0 0 320 420"
      className={cn("h-auto w-full select-none", className)}
      role="img"
      aria-label={
        cracked
          ? "Gateway wall breached by the usage limit"
          : unhealthy
            ? "Gateway wall status unknown"
            : "Gateway wall standing strong"
      }
    >
      <style>{`
        .mo-sigil { transform-origin: 160px 216px; animation: moPulse 2.2s ease-in-out infinite; }
        .mo-orbit { transform-origin: 160px 216px; animation: moOrbit 3.4s linear infinite; }
        .mo-mote { transform-origin: 160px 48px; animation: moPulse 2.2s ease-in-out infinite; }
        .mo-moon { animation: moMoon 6s ease-in-out infinite; }
        .mo-flicker { animation: moFlicker 0.45s steps(2) infinite; }
        .mo-draw { stroke-dasharray: 300; stroke-dashoffset: 300; animation: moDraw 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s forwards; }
        .mo-spark { animation: moSpark 1.4s cubic-bezier(0.4,0,0.2,1) infinite; }
        .mo-spark-2 { animation: moSpark 1.4s cubic-bezier(0.4,0,0.2,1) 0.5s infinite; }
        @keyframes moPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.88; } }
        @keyframes moOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes moMoon { 0%,100% { opacity: 0.75; } 50% { opacity: 1; } }
        @keyframes moFlicker { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes moDraw { to { stroke-dashoffset: 0; } }
        @keyframes moSpark { 0% { opacity: 0; transform: translateY(0); } 25% { opacity: 1; } 100% { opacity: 0; transform: translateY(-26px); } }
        @media (prefers-reduced-motion: reduce) {
          .mo-sigil, .mo-orbit, .mo-mote, .mo-moon, .mo-flicker, .mo-draw, .mo-spark, .mo-spark-2 { animation: none !important; }
          .mo-draw { stroke-dashoffset: 0; }
        }
      `}</style>

      <defs>
        <radialGradient id="moBg" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0%" stopColor="#0a2b3c" />
          <stop offset="100%" stopColor="#04141f" />
        </radialGradient>
        <radialGradient id="moMoonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(0,222,255,0.16)" />
          <stop offset="100%" stopColor="rgba(0,222,255,0)" />
        </radialGradient>
        <linearGradient id="moStone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d3040" />
          <stop offset="42%" stopColor="#123f56" />
          <stop offset="100%" stopColor="#0a2b3c" />
        </linearGradient>
        <linearGradient id="moFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,222,255,0.07)" />
          <stop offset="100%" stopColor="rgba(0,222,255,0)" />
        </linearGradient>
      </defs>

      {/* void */}
      <rect width="320" height="420" fill="url(#moBg)" />

      {/* moon + stars */}
      <circle cx="66" cy="70" r="42" fill="url(#moMoonGlow)" className="mo-moon" />
      <circle cx="66" cy="70" r="10" fill="rgba(0,222,255,0.1)" stroke="rgba(0,222,255,0.25)" strokeWidth="1" />
      {[
        [110, 48], [172, 66], [238, 40], [284, 74], [298, 120], [92, 108], [150, 30], [262, 106],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.24)" />
      ))}

      {/* floor */}
      <rect x="0" y="356" width="320" height="64" fill="url(#moFloor)" />
      <line x1="34" y1="356" x2="286" y2="356" stroke="rgba(0,222,255,0.12)" strokeWidth="1" />

      {/* reflected stone */}
      <rect x="110" y="356" width="100" height="26" rx="3" fill="url(#moFloor)" opacity="0.5" />

      {/* the monolith */}
      <g>
        <rect x="110" y="88" width="100" height="268" rx="6" fill="url(#moStone)" stroke={edgeLight} strokeWidth="1.3" />
        {/* bevel highlights */}
        <rect x="110" y="88" width="2.5" height="268" rx="1.2" fill={edgeLight} opacity="0.7" />
        <rect x="207" y="88" width="2.5" height="268" rx="1.2" fill="rgba(255,255,255,0.05)" />
        {/* top cap */}
        <rect x="106" y="84" width="108" height="7" rx="2.5" fill="#1b4a63" stroke={edgeLight} strokeWidth="0.8" />
      </g>

      {/* sigil */}
      <g className={unhealthy ? "mo-flicker" : ""}>
        <g className="mo-sigil">
          <circle
            cx="160"
            cy="216"
            r="30"
            fill="none"
            stroke={sigil}
            strokeWidth="1.6"
            opacity="0.85"
            style={{ filter: `drop-shadow(0 0 8px ${sigilGlow})` }}
          />
          <circle
            cx="160"
            cy="216"
            r="30"
            fill="none"
            stroke={sigil}
            strokeWidth="10"
            opacity="0.12"
          />
          <circle cx="160" cy="216" r="7" fill={sigil} style={{ filter: `drop-shadow(0 0 10px ${sigilGlow})` }} />
          {/* orbit */}
          <g className="mo-orbit">
            <circle cx="160" cy="186" r="2.4" fill={sigil} style={{ filter: `drop-shadow(0 0 5px ${sigilGlow})` }} />
          </g>
        </g>
      </g>

      {/* fissure: draws itself on breach */}
      {cracked && (
        <g>
          <path
            className="mo-draw"
            d="M160 84 L155 112 L173 140 L157 168 L175 196 L161 224 L177 252 L163 280 L169 356"
            fill="none"
            stroke="#eab308"
            strokeWidth="2.2"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.95))" }}
          />
          <path
            className="mo-draw"
            d="M157 168 L135 186 L139 208"
            fill="none"
            stroke="#eab308"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 5px rgba(239,68,68,0.85))" }}
          />
          {/* dark inner fissure */}
          <path
            d="M160 86 L155 112 L172 140 L157 167 L174 196 L162 223 L176 252 L164 279 L167 354"
            fill="none"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* sparks from the seam */}
          <circle cx="157" cy="196" r="2" fill="#ef4444" className="mo-spark" style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.9))" }} />
          <circle cx="174" cy="252" r="1.6" fill="#dc751e" className="mo-spark-2" style={{ filter: "drop-shadow(0 0 5px rgba(239,68,68,0.8))" }} />
          <circle cx="170" cy="140" r="1.4" fill="#eab308" className="mo-spark" style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.8))" }} />
        </g>
      )}

      {/* status mote above the cap */}
      <circle
        cx="160"
        cy="48"
        r="4"
        className="mo-mote"
        fill={cracked ? "#ef4444" : unhealthy ? "#eab308" : "#22c55e"}
        style={{
          filter: `drop-shadow(0 0 7px ${cracked ? "rgba(239,68,68,0.95)" : unhealthy ? "rgba(234,179,8,0.9)" : "rgba(34,197,94,0.9)"})`,
        }}
      />
    </svg>
  );
}
