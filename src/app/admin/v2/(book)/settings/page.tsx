import type { Metadata } from "next";
import { SettingsBook } from "../../_c/Settings";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Gate>
      <SettingsBook />
    </Gate>
  );
}
