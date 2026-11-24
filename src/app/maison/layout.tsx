import type { Metadata } from "next";
import { BodyBackground } from "@/components/BodyBackground";
import { DesignSwitcher } from "@/components/DesignSwitcher";
import { BagIsland } from "@/components/maison/BagIsland";
import { Footer } from "@/components/maison/Footer";
import { Nav } from "@/components/maison/Nav";
import { SmoothScroll } from "@/components/maison/SmoothScroll";
import { WoodSync } from "@/components/maison/WoodSync";

export const metadata: Metadata = {
  title: { default: "Santalum Maison — Red and white sandalwood from India", template: "%s · Santalum Maison" },
  description:
    "Beads, objects, powders, oils and jewellery in red and white sandalwood. Every piece numbered and documented.",
};

export default function MaisonLayout({ children }: LayoutProps<"/maison">) {
  return (
    <div className="maison min-h-svh">
      <BodyBackground color="#f6f4f0" />
      <WoodSync />
      <SmoothScroll />
      <Nav />
      <main>{children}</main>
      <Footer />
      <BagIsland />
      <DesignSwitcher />
    </div>
  );
}
