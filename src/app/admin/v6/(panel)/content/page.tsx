import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Content } from "../../_views/Content";

export const metadata: Metadata = { title: "Content" };

export default function Page() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
