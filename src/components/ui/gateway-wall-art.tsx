import type { GatewayState } from "@/lib/use-gateway";

export function GatewayWallArt({ state }: { state: GatewayState }) {
  const cracked = state === "cracked";
  const unhealthy = state !== "healthy";

  return (
    <svg
      viewBox="0 0 400 240"
      className="h-auto w-full select-none"
      role="img"
      aria-label={
        cracked
          ? "Gateway wall breached by the usage limit"
          : unhealthy
            ? "Gateway wall status unknown"
            : "Gateway wall standing strong"
      }
    >
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f3a4f" />
          <stop offset="100%" stopColor="#0a2536" />
        </linearGradient>
        <linearGradient id="brickGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123f56" />
          <stop offset="100%" stopColor="#0d3040" />
        </linearGradient>
        <pattern
          id="bricks"
          width="40"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <rect width="40" height="20" fill="none" />
          <rect
            x="0"
            y="0"
            width="40"
            height="18"
            rx="1"
            fill="url(#brickGrad)"
          />
          <rect
            x="-20"
            y="20"
            width="40"
            height="18"
            rx="1"
            fill="url(#brickGrad)"
          />
        </pattern>
      </defs>

      {/* backdrop glow */}
      <rect
        width="400"
        height="240"
        fill="transparent"
        className="transition-colors duration-700"
      />

      {/* ground shadow */}
      <ellipse cx="200" cy="228" rx="150" ry="10" fill="rgba(0,0,0,0.3)" />

      {/* merlons (crenellations) */}
      <g
        className={cracked ? "gateway-wall-shake" : ""}
        style={{ transformOrigin: "200px 200px" }}
      >
        {[72, 116, 160, 204, 248, 292].map((x) => (
          <rect
            key={x}
            x={x}
            y="40"
            width="36"
            height="40"
            fill="url(#wallGrad)"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        {/* wall body */}
        <rect
          x="60"
          y="80"
          width="280"
          height="130"
          fill="url(#wallGrad)"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />

        {/* brick layer over the wall body */}
        <rect x="60" y="80" width="280" height="130" fill="url(#bricks)" />

        {/* top edge highlight */}
        <rect
          x="60"
          y="78"
          width="280"
          height="3"
          className="transition-colors duration-700"
          fill={unhealthy ? "rgba(239,68,68,0.65)" : "rgba(0,222,255,0.7)"}
          style={{
            filter: unhealthy
              ? "drop-shadow(0 0 6px rgba(239,68,68,0.8))"
              : "drop-shadow(0 0 6px rgba(0,222,255,0.8))",
          }}
        />
      </g>

      {/* cracks: only when the wall is not healthy */}
      {unhealthy && (
        <g className="gateway-crack-in">
          <path
            d="M200 44 L194 78 L212 104 L195 132 L214 158 L197 188 L206 210"
            fill="none"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 5px rgba(239,68,68,0.9))" }}
          />
          <path
            d="M195 132 L168 152 L170 180"
            fill="none"
            stroke="#eab308"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.8))" }}
          />
          <path
            d="M194 78 L176 96 L178 122"
            fill="none"
            stroke="#eab308"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.7))" }}
          />
          <path
            d="M212 104 L234 122 L230 148"
            fill="none"
            stroke="#eab308"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.7))" }}
          />
          {/* dark inner fissure */}
          <path
            d="M200 48 L195 78 L211 104 L195 132 L213 158 L198 188 L205 208"
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* crumbling chips */}
      {unhealthy && (
        <g className="gateway-chip-fall">
          <polygon points="200,212 208,218 199,220" fill="#dc751e" opacity="0.9" />
          <polygon points="172,182 178,188 170,190" fill="#eab308" opacity="0.85" />
          <polygon points="230,150 237,156 228,159" fill="#dc751e" opacity="0.8" />
          <polygon points="206,214 213,220 205,223" fill="#123f56" opacity="0.9" />
        </g>
      )}

      {/* beacon */}
      <circle
        cx="200"
        cy="26"
        r="5"
        className={
          cracked
            ? "gateway-beacon gateway-beacon-bad"
            : unhealthy
              ? "gateway-beacon gateway-beacon-unknown"
              : "gateway-beacon gateway-beacon-good"
        }
      />
    </svg>
  );
}
