import type { Metadata } from "next";
import { SettingsView } from "../../_ui/Settings";
import { Gate } from "../../_ui/Shell";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Gate>
      <SettingsView />
    </Gate>
  );
}
