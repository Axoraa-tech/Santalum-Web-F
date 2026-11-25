import type { Metadata } from "next";
import { Today } from "../_ui/today";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return <Today />;
}
