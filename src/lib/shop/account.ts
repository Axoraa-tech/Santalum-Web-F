import { useMemo } from "react";
import { createStore } from "./store";

/**
 * Customer accounts: sign up, sign in, profile, saved addresses and the wishlist.
 *
 * PREVIEW ONLY. Until the Santalum-B backend exists, accounts live in this browser's localStorage,
 * with passwords stored as salted SHA-256 hashes. This lets every design show the real flows
 * (sign up → checkout → orders → tracking) but it is not authentication. Replace these functions
 * with API calls when the backend is ready; the signatures are written to make that swap easy.
 */

export type Address = {
  id: string;
  label: string; // "Home", "Office"
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
  isDefault?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number;
  addresses: Address[];
  wishlist: string[];
  newsletter: boolean;
};

type StoredUser = User & { salt: string; hash: string };

const users = createStore<StoredUser[]>("santalum-users", [], (r) => (Array.isArray(r) ? (r as StoredUser[]) : []));
const session = createStore<{ userId: string } | null>("santalum-session", null);
const guestWishlist = createStore<string[]>("santalum-wishlist", [], (r) => (Array.isArray(r) ? (r as string[]) : []));

const strip = (u: StoredUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  createdAt: u.createdAt,
  addresses: u.addresses,
  wishlist: u.wishlist,
  newsletter: u.newsletter,
});

function uid(prefix: string) {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return prefix + a[0].toString(36) + a[1].toString(36);
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- validation, shared so every form says the same thing ---------- */
export const validate = {
  name: (v: string) => (v.trim().length >= 2 ? null : "Please enter your name."),
  email: (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Please enter a valid email address."),
  phone: (v: string) => (/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, "")) ? null : "Please enter a 10-digit Indian mobile number."),
  password: (v: string) => (v.length >= 8 ? null : "Use at least 8 characters."),
  pin: (v: string) => (/^[1-9]\d{5}$/.test(v.trim()) ? null : "Please enter a 6-digit PIN code."),
};

export type Result = { ok: true; user: User } | { ok: false; error: string; field?: "name" | "email" | "phone" | "password" };

/* ---------- session ---------- */
function currentStored(): StoredUser | undefined {
  const s = session.get();
  return s ? users.get().find((u) => u.id === s.userId) : undefined;
}

/** The signed-in customer, or null. Always null during server render and hydration. */
export function useUser(): User | null {
  const s = session.use();
  const all = users.use();
  return useMemo(() => {
    const u = s ? all.find((x) => x.id === s.userId) : undefined;
    return u ? strip(u) : null;
  }, [s, all]);
}

export function getUser(): User | null {
  const u = currentStored();
  return u ? strip(u) : null;
}

export async function signUp(input: { name: string; email: string; phone: string; password: string; newsletter?: boolean }): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  for (const f of ["name", "email", "phone", "password"] as const) {
    const err = validate[f](input[f]);
    if (err) return { ok: false, error: err, field: f };
  }
  if (users.get().some((u) => u.email === email)) return { ok: false, error: "An account with this email already exists. Sign in instead.", field: "email" };
  const salt = uid("s");
  const user: StoredUser = {
    id: uid("u"),
    name: input.name.trim(),
    email,
    phone: input.phone.replace(/\s/g, ""),
    createdAt: Date.now(),
    addresses: [],
    wishlist: [...guestWishlist.get()],
    newsletter: !!input.newsletter,
    salt,
    hash: await hashPassword(input.password, salt),
  };
  users.set((all) => [...all, user]);
  session.set({ userId: user.id });
  guestWishlist.set([]);
  return { ok: true, user: strip(user) };
}

export async function signIn(input: { email: string; password: string }): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  const u = users.get().find((x) => x.email === email);
  if (!u || (await hashPassword(input.password, u.salt)) !== u.hash) return { ok: false, error: "That email and password don't match." };
  // carry over anything saved while signed out
  const merged = Array.from(new Set([...u.wishlist, ...guestWishlist.get()]));
  users.set((all) => all.map((x) => (x.id === u.id ? { ...x, wishlist: merged } : x)));
  guestWishlist.set([]);
  session.set({ userId: u.id });
  return { ok: true, user: strip({ ...u, wishlist: merged }) };
}

export function signOut() {
  session.set(null);
}

function patchUser(fn: (u: StoredUser) => StoredUser) {
  const s = session.get();
  if (!s) return;
  users.set((all) => all.map((u) => (u.id === s.userId ? fn(u) : u)));
}

export function updateProfile(patch: Partial<Pick<User, "name" | "phone" | "newsletter">>) {
  patchUser((u) => ({ ...u, ...patch }));
}

export function saveAddress(a: Omit<Address, "id"> & { id?: string }): Address {
  const addr: Address = { ...a, id: a.id ?? uid("a") };
  patchUser((u) => {
    let list = u.addresses.some((x) => x.id === addr.id) ? u.addresses.map((x) => (x.id === addr.id ? addr : x)) : [...u.addresses, addr];
    if (addr.isDefault || list.length === 1) list = list.map((x) => ({ ...x, isDefault: x.id === addr.id }));
    return { ...u, addresses: list };
  });
  return addr;
}

export function removeAddress(id: string) {
  patchUser((u) => {
    const list = u.addresses.filter((x) => x.id !== id);
    if (list.length && !list.some((x) => x.isDefault)) list[0] = { ...list[0], isDefault: true };
    return { ...u, addresses: list };
  });
}

/* ---------- wishlist: works signed in or out ---------- */
export function useWishlist(): string[] {
  const user = useUser();
  const guest = guestWishlist.use();
  return user ? user.wishlist : guest;
}

export function toggleWishlist(slug: string) {
  if (session.get()) patchUser((u) => ({ ...u, wishlist: u.wishlist.includes(slug) ? u.wishlist.filter((s) => s !== slug) : [...u.wishlist, slug] }));
  else guestWishlist.set((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
}

/** Indian states and union territories, for address forms. */
export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];
