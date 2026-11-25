import { GrainStudio } from "@/components/maison/home/GrainStudio";
import { Hero } from "@/components/maison/home/Hero";
import { MalaString } from "@/components/maison/home/MalaString";
import { Provenance } from "@/components/maison/home/Provenance";
import { TwoWoods } from "@/components/maison/home/TwoWoods";
import { Vault } from "@/components/maison/home/Vault";
import { W } from "@/components/maison/W";

/**
 * The Maison home: one layout, two houses. The red/white switch changes the palette, every line
 * of copy, the featured pieces, the making steps and the edition; the page always stays light.
 * The full catalogue lives in /maison/shop; here the string carries only the featured pieces.
 */
export default function MaisonHome() {
  return (
    <>
      <Hero />
      <TwoWoods />
      <W red={<MalaString wood="red" />} white={<MalaString wood="white" />} />
      <GrainStudio />
      <Provenance />
      <Vault />
    </>
  );
}
