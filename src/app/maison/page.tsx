import { GrainStudio } from "@/components/maison/home/GrainStudio";
import { Hero } from "@/components/maison/home/Hero";
import { MalaString } from "@/components/maison/home/MalaString";
import { Provenance } from "@/components/maison/home/Provenance";
import { TwoWoods } from "@/components/maison/home/TwoWoods";
import { Vault } from "@/components/maison/home/Vault";

/**
 * The Maison home. White throughout; the red/white switch changes the wood itself
 * (the live slice, the photographs, the accent), never the page.
 */
export default function MaisonHome() {
  return (
    <>
      <Hero />
      <TwoWoods />
      <MalaString />
      <GrainStudio />
      <Provenance />
      <Vault />
    </>
  );
}
