"use client";

import { motion } from "motion/react";
import { switchWood, useWood } from "@/lib/wood";

/** Red / white. The knob is a slice of the wood and rolls across as it changes. */
export function WoodToggle({ className = "" }: { className?: string }) {
  const wood = useWood();
  const white = wood === "white";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={white}
      aria-label="White sandalwood"
      title={white ? "Showing white sandalwood" : "Showing red sandalwood"}
      onClick={() => switchWood(white ? "red" : "white")}
      className={`relative flex h-11 w-[7.5rem] items-center rounded-full border border-hair bg-paper/75 p-1 text-[14px] backdrop-blur-xl transition-colors hover:border-ink/20 ${className}`}
    >
      <motion.span
        aria-hidden
        className="absolute left-1 top-1 size-9 overflow-hidden rounded-full shadow-[0_2px_8px_rgb(23_19_15/0.25),inset_0_0_0_1px_rgb(0_0_0/0.15)]"
        initial={false}
        animate={{ x: white ? 74 : 0, rotate: white ? 240 : 0 }}
        transition={{ type: "spring", stiffness: 230, damping: 24 }}
      >
        <span className={`absolute inset-0 transition-opacity duration-500 ring-red ${white ? "opacity-0" : "opacity-100"}`} />
        <span className={`absolute inset-0 transition-opacity duration-500 ring-white ${white ? "opacity-100" : "opacity-0"}`} />
      </motion.span>
      <span
        className={`absolute right-4 transition-[opacity,transform] duration-500 ease-out-soft ${white ? "translate-x-2 opacity-0" : "opacity-100"}`}
      >
        Red
      </span>
      <span
        className={`absolute left-4 transition-[opacity,transform] duration-500 ease-out-soft ${white ? "opacity-100" : "-translate-x-2 opacity-0"}`}
      >
        White
      </span>
    </button>
  );
}
