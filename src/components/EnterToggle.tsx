"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** A slim switch on the coming-soon pages. Flip it to enter the Maison website. */
export function EnterToggle() {
  const router = useRouter();
  const [on, setOn] = useState(false);

  useEffect(() => {
    router.prefetch("/maison");
  }, [router]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Enter the Maison website"
      onClick={() => {
        if (on) return;
        setOn(true);
        window.setTimeout(() => router.push("/maison"), 520);
      }}
      className="group fixed right-3 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4 rounded-full border border-linen/15 bg-night/75 px-2.5 py-5 text-linen shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:bg-night/90 md:right-5"
    >
      <span className="rotate-180 text-[10px] tracking-[0.32em] text-pale/85 [writing-mode:vertical-rl]">ENTER THE MAISON</span>
      <span className="relative block h-14 w-7 rounded-full border border-linen/30 p-[3px]">
        <span
          className="block h-5 w-5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-1"
          style={{
            transform: on ? "translateY(28px)" : undefined,
            background: "linear-gradient(135deg, #c8603f 0%, #8b2f1d 49%, #e3d3b3 51%, #b89a66 100%)",
          }}
        />
      </span>
    </button>
  );
}
