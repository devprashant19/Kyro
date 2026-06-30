import React from "react";
import { cn } from "../lib/utils";

interface GridBackgroundProps {
  children: React.ReactNode;
}

export default function GridBackground({ children }: GridBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">

      {/* Grid Background */}
      <div
        className={cn(
          "absolute inset-0 z-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
        )}
      />

      {/* Radial Fade Effect */}
      <div
        className="
        pointer-events-none
        absolute inset-0 z-0
        flex items-center justify-center
        bg-slate-950
        [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]
        "
      />

      {/* Page Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>

    </div>
  );
}
