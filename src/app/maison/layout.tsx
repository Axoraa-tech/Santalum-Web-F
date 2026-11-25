import type { Metadata } from "next";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { BagIsland } from "@/components/maison/BagIsland";
import { Footer } from "@/components/maison/Footer";
import { MaisonBody } from "@/components/maison/MaisonBody";
import { Nav } from "@/components/maison/Nav";
import { SmoothScroll } from "@/components/maison/SmoothScroll";
import { TurnVeil } from "@/components/maison/TurnVeil";
import { WoodSync } from "@/components/maison/WoodSync";
import "./maison.css";

export const metadata: Metadata = {
  title: { default: "Santalum Maison — Red and white sandalwood from India", template: "%s · Santalum Maison" },
  description:
    "Red sandalwood beads, objects and jewellery; white sandalwood oil, attar, chandan and Mysuru carving. Every piece carries its batch record.",
};

export default function MaisonLayout({ children }: LayoutProps<"/maison">) {
  return (
    <div className="maison min-h-svh">
      <MaisonBody />
      <WoodSync />
      <SmoothScroll />
      <Nav />
      <main>{children}</main>
      <Footer />
      <TurnVeil />
      <BagIsland />
      {/* the review tool's switcher, folded into a slice of the wood (see maison.css) */}
      <div className="mz-switch">
        <DesignSwitcher />
      </div>
    </div>
  );
}
