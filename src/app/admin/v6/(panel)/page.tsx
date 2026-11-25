import type { Metadata } from "next";
import { Gate } from "../_ui/Shell";
import { Dashboard } from "../_views/Dashboard";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
