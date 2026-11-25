import type { Metadata } from "next";
import { Content } from "../../_ui/Content";
import { Gate } from "../../_ui/Shell";

export const metadata: Metadata = { title: "Content" };

export default function Page() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
