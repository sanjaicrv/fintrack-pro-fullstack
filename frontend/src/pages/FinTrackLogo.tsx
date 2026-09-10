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

  // Colors based on variant ensuring sharp contrast on both light and dark backgrounds
  const getFinClass = () => {
    if (variant === "white") return "text-white";
    if (variant === "gradient") return "bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent";
    return "text-slate-900 dark:text-white";
  };

  const getTrackClass = () => {
    if (variant === "white") return "text-violet-300";
    if (variant === "gradient") return "text-indigo-600 dark:text-indigo-400";
    return "text-violet-600 dark:text-violet-400";
  };

  const getProClass = () => {
    if (variant === "white") return "text-violet-300";
    if (variant === "gradient") return "text-indigo-500 dark:text-indigo-400";
    return "text-violet-600 dark:text-violet-400";
  };

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
          <span className={`font-black ${textEl} tracking-tight leading-none`}>
            <span className={getFinClass()}>Fin</span>
            <span className={getTrackClass()}>Track</span>
          </span>
          <span className={`text-[10px] align-super font-bold ml-1 leading-none tracking-wider ${getProClass()}`}>
            PRO
          </span>
        </div>
      )}
    </div>
  );
}

