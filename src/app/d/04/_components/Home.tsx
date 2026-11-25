"use client";

import { Corridor } from "./Corridor";
import { Collection, Entrance, TwoWoods, WallText } from "./RoomsA";
import { Exit, Gifting, Making, Provenance, Vault } from "./RoomsB";
import { ROOMS } from "./store";

/** The home page: one walk through nine rooms, hung for red or for white. */
export function Home() {
  return (
    <Corridor rooms={ROOMS} register label="Santalum Maison, a walk through nine rooms">
      <Entrance />
      <WallText />
      <TwoWoods />
      <Collection />
      <Making />
      <Provenance />
      <Vault />
      <Gifting />
      <Exit />
    </Corridor>
  );
}
