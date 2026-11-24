import { CircleForm } from "@/components/CircleForm";
import { Lotus, Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 9 — Invitation: a card over incense smoke, edged red and white, sealed in red wax. */
export default function Invitation() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070606] px-5 py-20">
      <OptionNav n={9} />
      <Photo p={PHOTOS.smoke} priority className="object-[30%_50%] brightness-125" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#070606_100%)]" />

      <article className="relative w-full max-w-[440px] bg-linen text-night shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex h-1.5">
          <span className="flex-1 bg-rakta" />
          <span className="flex-1 bg-sand" />
        </div>
        <div className="px-8 pb-16 pt-12 md:px-12">
          <Mark className="text-night" />
          <p className="mt-12 text-[11px] tracking-[0.3em] text-rakta">AN INVITATION</p>
          <h1 className="mt-4 font-serif text-[38px] font-light leading-[1.08]">
            to the opening of the Maison.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-walnut">
            Red and white sandalwood, worked by hand in India. Private previews go first to the Santalum Circle.
          </p>
          <CircleForm tone="light" className="mt-10" />
        </div>

        {/* wax seal */}
        <div
          className="absolute -bottom-9 left-1/2 flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #a3402c 0%, #7a2a1c 45%, #4f1810 100%)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.45), inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 3px rgba(255,190,160,0.25)",
            borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
          }}
        >
          <Lotus className="h-7 w-11 text-[#3a120c]/80" />
        </div>
      </article>
    </main>
  );
}
