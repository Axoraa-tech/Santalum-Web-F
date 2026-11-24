import { Collection } from "./_components/cards/Collection";
import { Craft } from "./_components/cards/Craft";
import { FooterCard } from "./_components/cards/FooterCard";
import { Gifting } from "./_components/cards/Gifting";
import { Hero } from "./_components/cards/Hero";
import { Provenance } from "./_components/cards/Provenance";
import { Vault } from "./_components/cards/Vault";
import { Woods } from "./_components/cards/Woods";
import { Deck, Slot } from "./_components/Stack";

const CARDS = 8;

/**
 * Design 07 "Stack". The home page is a deck: every card is sticky, and as the next one slides up over it,
 * the one underneath sinks back, shifts up and dims.
 */
export default function StackHome() {
  return (
    <main>
      <Deck>
        <Slot id="home" label="Santalum Maison" index={1} total={CARDS} tint="#EFE9E0">
          <Hero />
        </Slot>
        <Slot id="woods" label="Two woods" index={2} total={CARDS} tint="#FFFFFF">
          <Woods />
        </Slot>
        <Slot id="pieces" label="The pieces" index={3} total={CARDS} tint="#F1E6DC">
          <Collection />
        </Slot>
        <Slot id="craft" label="How it is made" index={4} total={CARDS} tint="#E4E8E0" extra={3}>
          <Craft />
        </Slot>
        <Slot id="provenance" label="Provenance" index={5} total={CARDS} tint="#E9E5DC">
          <Provenance />
        </Slot>
        <Slot id="vault" label="The 2011 Vault" index={6} total={CARDS} tint="#EFE9E0">
          <Vault />
        </Slot>
        <Slot id="gifting" label="Gifting and the Circle" index={7} total={CARDS} tint="#FFFFFF">
          <Gifting />
        </Slot>
        <Slot id="house" label="The house" index={8} total={CARDS} tint="var(--m-accent-soft)">
          <FooterCard />
        </Slot>
      </Deck>
    </main>
  );
}
