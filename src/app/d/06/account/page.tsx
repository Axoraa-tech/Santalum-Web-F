import type { Metadata } from "next";
import { AccountBento } from "../_components/AccountBento";
import { s } from "../_components/cls";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <div className={s.page}>
      <AccountBento />
    </div>
  );
}
