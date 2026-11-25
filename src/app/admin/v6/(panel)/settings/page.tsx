import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Settings } from "../../_views/Settings";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Gate>
      <Settings />
    </Gate>
  );
}
