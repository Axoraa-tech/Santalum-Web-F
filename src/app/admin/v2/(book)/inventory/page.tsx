import type { Metadata } from "next";
import { StockBook } from "../../_c/Stock";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Stock" };

export default function Page() {
  return (
    <Gate>
      <StockBook />
    </Gate>
  );
}
