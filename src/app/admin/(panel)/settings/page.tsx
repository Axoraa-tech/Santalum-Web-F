import type { Metadata } from "next";
import { SettingsView } from "../../_components/Settings";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <Gate>
      <SettingsView />
    </Gate>
  );
}
