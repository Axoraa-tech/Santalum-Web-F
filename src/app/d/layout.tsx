import type { ReactNode } from "react";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { WoodSync } from "@/components/maison/WoodSync";

/** Shared shell for the alternative designs: keeps the wood choice in sync and shows the design switcher. */
export default function DesignsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WoodSync />
      {children}
      <DesignSwitcher />
    </>
  );
}
