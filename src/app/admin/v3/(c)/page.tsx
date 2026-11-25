import type { Metadata } from "next";
import { Dashboard } from "../_ui/Dashboard";
import { Gate } from "../_ui/Shell";

export const metadata: Metadata = { title: "Console" };

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
