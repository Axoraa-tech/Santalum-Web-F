import type { Metadata } from "next";
import { Dashboard } from "../_components/Dashboard";
import { Gate } from "../_components/Shell";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
