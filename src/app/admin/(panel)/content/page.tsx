import type { Metadata } from "next";
import { ContentView } from "../../_components/Content";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Storefront content" };

export default function Page() {
  return (
    <Gate>
      <ContentView />
    </Gate>
  );
}
