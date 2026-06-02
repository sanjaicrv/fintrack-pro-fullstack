import { BarChart3 } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
  variant?: "default" | "white" | "gradient";
  size?: "sm" | "md" | "lg";
}

/**
 * FinTrack Pro Logo — drop this anywhere in your sidebar or navbar.
 *
 * Props:
 *   collapsed  — sidebar collapsed state; shows only the icon
 *   variant    — "default" (violet gradient) | "white" | "gradient" (full color)
 *   size       — "sm" | "md" | "lg"
 */
export default function FinTrackLogo({
  collapsed = false,
  variant = "default",
  size = "md",
}: LogoProps) {
  const iconSizes = { sm: 14, md: 18, lg: 24 };
  const boxSizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-12 h-12" };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  const roundeds = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl" };

  const iconEl = iconSizes[size];
  const boxEl = boxSizes[size];
  const textEl = textSizes[size];
  const roundEl = roundeds[size];

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Icon Box */}
      <div className={`relative ${boxEl} flex-shrink-0`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 ${roundEl} 
          group-hover:from-violet-400 group-hover:to-indigo-500 transition-all duration-300
          group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-violet-900/50`}
        />
        {/* Inner glow */}
        <div className={`absolute inset-0 ${roundEl} opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <BarChart3 size={iconEl} className="text-white" />
        </div>
      </div>

      {/* Text — hidden when collapsed */}
      {!collapsed && (
        <div className="flex items-baseline overflow-hidden">
          <span className={`font-black ${textEl} tracking-tight leading-none`}
            style={{ color: variant === "white" ? "white" : variant === "gradient" ? undefined : "#f1f5f9" }}>
            {variant === "gradient" ? (
              <>
                <span className="text-violet-400">Fin</span>
                <span className="text-white">Track</span>
              </>
            ) : (
              <>
                <span>Fin</span>
                <span className="text-violet-400">Track</span>
              </>
            )}
          </span>
          <span className={`text-[9px] align-super font-bold ml-0.5 text-violet-300 leading-none`}>
            PRO
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Usage example (paste into your sidebar) ─────────────────────────────
//
// import FinTrackLogo from "@/components/FinTrackLogo";
//
// // In your sidebar component:
// <div className="px-4 py-5 border-b border-white/5">
//   <FinTrackLogo collapsed={sidebarCollapsed} />
// </div>
//
// ─────────────────────────────────────────────────────────────────────────
