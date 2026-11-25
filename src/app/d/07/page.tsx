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
 * the one underneath sinks back, shifts up and dims. Every card renders in both woods; CSS shows the current one.
 */
export default function StackHome() {
  return (
    <main>
      <Deck>
        <Slot id="home" label="Santalum Maison" index={1} total={CARDS} tint="var(--s7-sand)">
          <Hero />
        </Slot>
        <Slot id="woods" label="Two woods" caption={{ red: "A different tree", white: "The temple wood" }} index={2} total={CARDS} tint="var(--s7-surface)">
          <Woods />
        </Slot>
        <Slot id="pieces" label="The pieces" caption={{ red: "Heavy in the hand", white: "Scent you can hold" }} index={3} total={CARDS} tint="var(--s7-clay)">
          <Collection />
        </Slot>
        <Slot id="craft" label="How it is made" caption={{ red: "How it is turned", white: "How it is distilled" }} index={4} total={CARDS} tint="var(--s7-sage)" extra={3}>
          <Craft />
        </Slot>
        <Slot id="provenance" label="Provenance" caption={{ red: "The batch record", white: "The lot record" }} index={5} total={CARDS} tint="var(--s7-stone)">
          <Provenance />
        </Slot>
        <Slot id="vault" label="The 2011 edition" caption={{ red: "The 2011 Vault", white: "The 2011 Reserve" }} index={6} total={CARDS} tint="var(--s7-sand)">
          <Vault />
        </Slot>
        <Slot id="gifting" label="Gifting and the Circle" caption={{ red: "A gift with weight", white: "A gift that fills the room" }} index={7} total={CARDS} tint="var(--s7-surface)">
          <Gifting />
        </Slot>
        <Slot id="house" label="The house" caption={{ red: "Shop, orders and help", white: "Orders, care and help" }} index={8} total={CARDS} tint="var(--s7-accent-soft)">
          <FooterCard />
        </Slot>
      </Deck>
    </main>
  );
}
