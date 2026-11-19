"use client";
import { useState } from "react";
export default function Newsletter() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (done) return <p className="mt-4 text-[13px]">Thank you — you are on the list.</p>;
  return (
    <form className="mt-4 flex border-b border-ink" onSubmit={(e) => { e.preventDefault(); if (valid) { console.log("newsletter", { email }); setDone(true); } }}>
      <label htmlFor="nl" className="sr-only">Email address</label>
      <input id="nl" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="h-10 flex-1 bg-transparent text-[14px] outline-none placeholder:text-meta" />
      <button className="text-[12px] font-medium disabled:text-meta" disabled={!valid}>Join →</button>
    </form>
  );
}
