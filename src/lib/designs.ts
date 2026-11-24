/** Every design of the Maison website, for the design switcher. Review only; pick one before launch. */
export type Design = { n: string; slug: string; href: string; name: string; idea: string; threeD?: boolean };

export const DESIGNS: Design[] = [
  { n: "00", slug: "maison", href: "/maison", name: "Maison", idea: "Live wood slice, mala string, grain studio" },
  { n: "01", slug: "01", href: "/d/01", name: "Lathe", idea: "A turned wooden object changes shape in 3D as you scroll", threeD: true },
  { n: "02", slug: "02", href: "/d/02", name: "Orbit", idea: "A ring of wooden discs you spin to browse", threeD: true },
  { n: "03", slug: "03", href: "/d/03", name: "Strand", idea: "Fly along a 3D mala of 108 beads", threeD: true },
  { n: "04", slug: "04", href: "/d/04", name: "Corridor", idea: "The whole site is a horizontal museum walk" },
  { n: "05", slug: "05", href: "/d/05", name: "Index", idea: "A Swiss editorial catalogue you read" },
  { n: "06", slug: "06", href: "/d/06", name: "Bento", idea: "Live tiles that open into each piece" },
  { n: "07", slug: "07", href: "/d/07", name: "Stack", idea: "Full-screen cards that stack as you scroll" },
  { n: "08", slug: "08", href: "/d/08", name: "Atlas", idea: "An infinite canvas you explore by dragging" },
  { n: "09", slug: "09", href: "/d/09", name: "Dawn", idea: "A day of rituals, from first light to the evening lamp" },
  { n: "10", slug: "10", href: "/d/10", name: "Kinetic", idea: "Type that stretches, bends and moves" },
];

export function designFor(pathname: string) {
  if (pathname.startsWith("/maison")) return DESIGNS[0];
  const m = pathname.match(/^\/d\/(\d{2})/);
  return DESIGNS.find((d) => d.slug === m?.[1]) ?? null;
}
