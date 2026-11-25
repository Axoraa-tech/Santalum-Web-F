import { FooterCard } from "./cards/FooterCard";

/** The deck's last card, closing every page that is not the home deck. */
export function PageFooter() {
  return (
    <div className="px-2 pb-2 pt-3 md:px-3 md:pb-3 lg:px-[14px] lg:pb-[14px] lg:pt-[14px]">
      <div className="overflow-hidden rounded-[28px] bg-(--s7-accent-soft) md:rounded-[40px] lg:rounded-[48px]">
        <FooterCard />
      </div>
    </div>
  );
}
