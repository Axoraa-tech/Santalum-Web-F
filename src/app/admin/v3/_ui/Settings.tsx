"use client";

import { useEffect, useRef, useState } from "react";
import { resetAdminData, saveSettings, useSettings } from "../../_data/store";
import type { Settings, Staff, StaffRole } from "../../_data/types";
import { Box, Btn, F, Head, Seg, say, Toggle } from "./kit";

type Sec = "store" | "shipping" | "payments" | "notifications" | "staff" | "data";
const words = (k: string) => k.replace(/([A-Z])/g, " $1").toLowerCase();
const HELP: Record<string, string> = {
  gstRate: "fallback % when a category has none",
  codLimit: "max order value for pay on delivery, ₹",
  keyId: "razorpay key id (rzp_test_… in test mode)",
  recipients: "comma separated",
  processingDays: "working days before dispatch",
};

export function SettingsView() {
  const s = useSettings();
  const [sec, setSec] = useState<Sec>("store");
  return (
    <div className="a3-page">
      <Head path="~/settings" title="settings" meta="saved per section · ⌘S" />
      <Seg
        value={sec}
        onChange={setSec}
        label="Section"
        items={(["store", "shipping", "payments", "notifications", "staff", "data"] as const).map((x) => ({ id: x, label: x }))}
      />
      <div className="a3-gap" />
      {sec === "staff" ? (
        <StaffBox key={JSON.stringify(s.staff)} init={s.staff} />
      ) : sec === "data" ? (
        <Box title="preview data">
          <p className="a3-small">Clears every change made in this browser (orders, products, stock, reviews, coupons, content, settings). Sign-in stays.</p>
          <div className="a3-gap" />
          <Btn
            kind="danger"
            onClick={() => {
              if (window.confirm("Reset all admin preview data in this browser?")) resetAdminData();
            }}
          >
            reset preview data
          </Btn>
        </Box>
      ) : (
        <Section key={sec + JSON.stringify(s[sec])} k={sec} init={s[sec]} />
      )}
    </div>
  );
}

type Obj = Record<string, string | number | boolean>;

function Section<K extends "store" | "shipping" | "payments" | "notifications">({ k, init }: { k: K; init: Settings[K] }) {
  const [d, setD] = useState<Obj>(init as unknown as Obj);
  const dirty = JSON.stringify(d) !== JSON.stringify(init);
  const save = () => {
    saveSettings(k, d as unknown as Settings[K]);
    say(`${k} saved`);
  };
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const entries = Object.entries(d);
  return (
    <Box title={k} meta={dirty ? "unsaved" : "saved"}>
      <div className="a3-form">
        {entries
          .filter(([, v]) => typeof v !== "boolean")
          .map(([key, v]) =>
            key === "provider" ? (
              <F key={key} label="provider">
                <input value={String(v)} disabled />
              </F>
            ) : key === "mode" ? (
              <F key={key} label="mode">
                <select value={String(v)} onChange={(e) => setD({ ...d, mode: e.target.value })}>
                  <option value="test">test</option>
                  <option value="live">live</option>
                </select>
              </F>
            ) : (
              <F key={key} label={words(key) + (HELP[key] ? ` · ${HELP[key]}` : "")} wide={typeof v === "string" && (key === "address" || key === "recipients" || key === "legalName")}>
                <input
                  className={typeof v === "number" || /gstin|pan|hsn|pin|keyId/i.test(key) ? "a3-mono" : undefined}
                  inputMode={typeof v === "number" ? "decimal" : undefined}
                  value={String(v)}
                  onChange={(e) => setD({ ...d, [key]: typeof v === "number" ? Number(e.target.value.replace(/[^\d.]/g, "")) || 0 : e.target.value })}
                />
              </F>
            ),
          )}
        {entries
          .filter(([, v]) => typeof v === "boolean")
          .map(([key, v]) => (
            <Toggle key={key} checked={v as boolean} onChange={(x) => setD({ ...d, [key]: x })} label={words(key)} />
          ))}
      </div>
      <div className="a3-actions">
        <Btn kind="primary" hint="⌘S" onClick={save} disabled={!dirty}>
          save {k}
        </Btn>
        {dirty && (
          <Btn kind="ghost" onClick={() => setD(init as unknown as Obj)}>
            discard
          </Btn>
        )}
      </div>
    </Box>
  );
}

const ROLES: StaffRole[] = ["Owner", "Manager", "Fulfilment", "Support"];

function StaffBox({ init }: { init: Staff[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Fulfilment");
  const save = (list: Staff[], msg: string) => {
    saveSettings("staff", list);
    say(msg);
  };
  return (
    <Box title={`staff · ${init.length}`} flush>
      <table className="a3-t">
        <thead>
          <tr>
            <th>name</th>
            <th className="a3-hide-sm">email</th>
            <th>role</th>
            <th className="a3-hide-sm">last active</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {init.map((s) => (
            <tr key={s.id}>
              <td>
                {s.name}
                {s.invited && <span className="a3-tag">invited</span>}
              </td>
              <td className="a3-mono a3-dim a3-hide-sm">{s.email}</td>
              <td>
                <select aria-label={`Role for ${s.name}`} value={s.role} onChange={(e) => save(init.map((x) => (x.id === s.id ? { ...x, role: e.target.value as StaffRole } : x)), `${s.name}: ${e.target.value}`)}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="a3-dim a3-hide-sm">{s.lastActive}</td>
              <td className="r">
                <button type="button" className="a3-x" aria-label={`Remove ${s.name}`} onClick={() => window.confirm(`Remove ${s.name}?`) && save(init.filter((x) => x.id !== s.id), `${s.name} removed`)}>
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="a3-cmdline"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return say("name and email needed");
          save([...init, { id: `s${init.length + 1}-${email}`, name: name.trim(), email: email.trim(), role, lastActive: "Invited", invited: true }], `invite sent to ${email}`);
          setName("");
          setEmail("");
        }}
      >
        <span className="a3-cmdline-p">invite&gt;</span>
        <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
        <input aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="a3-mono" />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <Btn type="submit" kind="primary" hint="↵">
          invite
        </Btn>
      </form>
    </Box>
  );
}
