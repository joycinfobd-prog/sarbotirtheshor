"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ImageField } from "@/components/admin/ImageField";
import { DEFAULT_SETTINGS, SETTINGS_FIELDS, type SettingsMap } from "@/lib/site";

type User = { id: number; name: string; phone: string; role: string; isActive: boolean };
type Review = {
  id: number;
  name: string;
  role: string | null;
  rating: number;
  text: string | null;
  isActive: boolean;
};

const TABS = [
  { key: "site", label: "সাইট সেটিংস" },
  { key: "account", label: "আমার পাসওয়ার্ড" },
  { key: "users", label: "ব্যবহারকারী ও অ্যাক্সেস" },
  { key: "reviews", label: "গ্রাহক মতামত" },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("site");
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULT_SETTINGS });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({ id: 0, name: "", phone: "", password: "", role: "admin" });
  const [me, setMe] = useState<{ id: number; name: string; phone: string; role: string } | null>(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ id: 0, name: "", role: "", rating: "5", text: "" });

  async function loadAll() {
    const [sRes, uRes, rRes, aRes] = await Promise.all([
      fetch("/api/settings"),
      fetch("/api/users"),
      fetch("/api/reviews"),
      fetch("/api/account"),
    ]);
    const sData = await sRes.json();
    const uData = await uRes.json();
    const rData = await rRes.json();
    const aData = await aRes.json();
    if (sData.ok) {
      const merged: SettingsMap = { ...DEFAULT_SETTINGS };
      for (const row of sData.settings) merged[row.key] = row.value ?? "";
      setSettings(merged);
    }
    if (uData.ok) setUsers(uData.users);
    if (rData.ok) setReviews(rData.reviews);
    if (aData.ok) setMe(aData.user);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMsg("সব পরিবর্তন সংরক্ষিত হয়েছে ✓");
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/users", {
      method: userForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userForm.id,
        name: userForm.name,
        phone: userForm.phone,
        password: userForm.password,
        role: userForm.role,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "সংরক্ষণ করা যায়নি।");
      return;
    }
    setUserForm({ id: 0, name: "", phone: "", password: "", role: "admin" });
    setMsg("ব্যবহারকারী সংরক্ষিত হয়েছে ✓");
    loadAll();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pwForm.newPassword !== pwForm.confirm) {
      setMsg("নতুন পাসওয়ার্ড দুইবার একইভাবে লিখুন।");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (!res.ok) {
      setMsg(data.error || "পাসওয়ার্ড বদলানো যায়নি।");
      return;
    }
    setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    setMsg("পাসওয়ার্ড সফলভাবে বদলে গেছে ✓");
  }

  async function toggleUser(u: User) {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    });
    loadAll();
  }

  async function deleteUser(u: User) {
    if (!window.confirm(`${u.name} কে মুছে ফেলতে চান?`)) return;
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || "মুছতে পারা যায়নি।");
    loadAll();
  }

  async function saveReview(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: reviewForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: reviewForm.id,
        name: reviewForm.name,
        role: reviewForm.role,
        rating: Number(reviewForm.rating),
        text: reviewForm.text,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "সংরক্ষণ করা যায়নি।");
      return;
    }
    setReviewForm({ id: 0, name: "", role: "", rating: "5", text: "" });
    setMsg("মতামত সংরক্ষিত হয়েছে ✓");
    loadAll();
  }

  const groups = Array.from(new Set(SETTINGS_FIELDS.map((f) => f.group)));

  return (
    <div>
      <div>
        <h1 className="section-title text-2xl text-navy sm:text-3xl">সেটিংস ও ব্যবহারকারী</h1>
        <p className="mt-1 text-sm text-ink-soft">লোগো, লেখা, নাম্বার, অ্যাক্সেস ও গ্রাহক মতামত — সবকিছু এখান থেকে</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              tab === t.key ? "border-navy bg-navy text-white" : "border-paper-deep bg-white text-navy hover:border-navy-mid"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-wa/40 bg-wa/10 px-4 py-3 text-sm text-wa-deep">{msg}</div>
      ) : null}

      {tab === "site" ? (
        <form onSubmit={saveSettings} className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group} className="rounded-2xl border border-paper-deep bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">{group}</h2>
              <div className="gold-rule mt-2 w-16" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {SETTINGS_FIELDS.filter((f) => f.group === group).map((f) =>
                  f.type === "image" ? (
                    <div key={f.key} className="sm:col-span-2">
                      <ImageField
                        label={f.label}
                        value={settings[f.key] ?? ""}
                        onChange={(url) => setSettings({ ...settings, [f.key]: url })}
                      />
                    </div>
                  ) : (
                  <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-sm font-medium text-navy">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea
                        className="field min-h-[92px]"
                        value={settings[f.key] ?? ""}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="field"
                        value={settings[f.key] ?? ""}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      />
                    )}
                  </div>
                  ),
                )}
                {group === "ব্র্যান্ডিং" ? (
                  <div className="sm:col-span-2">
                    <ImageField
                      label="লোগো আপলোড করুন"
                      value={settings.logo_image ?? ""}
                      onChange={(url) => setSettings({ ...settings, logo_image: url })}
                    />
                  </div>
                ) : null}
                {group === "পরিচিতি" ? (
                  <div className="sm:col-span-2">
                    <ImageField
                      label="পরিচিতি ছবি আপলোড করুন"
                      value={settings.about_image ?? ""}
                      onChange={(url) => setSettings({ ...settings, about_image: url })}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <button type="submit" disabled={saving} className="btn btn-navy disabled:opacity-60">
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            সব পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      ) : null}

      {tab === "account" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="font-display text-lg font-bold text-navy">আমার অ্যাকাউন্ট</h2>
            <div className="gold-rule mt-2 w-16" />
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">নাম</dt>
                <dd className="font-semibold text-navy">{me?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">মোবাইল</dt>
                <dd className="tnum font-semibold text-navy">{me?.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">ভূমিকা</dt>
                <dd className="font-semibold text-navy">{me?.role === "owner" ? "মালিক" : "অ্যাডমিন"}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-xl bg-paper p-4 text-xs leading-relaxed text-ink-soft">
              নিরাপত্তার জন্য শক্তিশালী পাসওয়ার্ড ব্যবহার করুন — কমপক্ষে ৮ অক্ষর, অন্য কোথাও ব্যবহার করেননি এমন।
            </p>
          </div>

          <form onSubmit={savePassword} className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="font-display text-lg font-bold text-navy">পাসওয়ার্ড পরিবর্তন</h2>
            <div className="gold-rule mt-2 w-16" />
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  className="field"
                  required
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</label>
                <input
                  type="password"
                  className="field"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">নতুন পাসওয়ার্ড আবার লিখুন</label>
                <input
                  type="password"
                  className="field"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                />
              </div>
              <button type="submit" disabled={pwSaving} className="btn btn-navy w-full disabled:opacity-60">
                {pwSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                পাসওয়ার্ড বদলান
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {tab === "users" ? (
        !me || me.role !== "owner" ? (
          <div className="mt-6 rounded-2xl border border-alert/30 bg-alert/5 p-8 text-center">
            <div className="font-display text-lg font-bold text-navy">শুধুমাত্র মালিকের জন্য</div>
            <p className="mt-2 text-sm text-ink-soft">
              ব্যবহারকারী যোগ, বাদ বা অ্যাক্সেস পরিবর্তন শুধুমাত্র মালিক (owner) করতে পারবেন।
              নিজের পাসওয়ার্ড বদলাতে “আমার পাসওয়ার্ড” ট্যাব ব্যবহার করুন।
            </p>
          </div>
        ) : (
        <div id="users" className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-paper-deep bg-white">
            <div className="border-b border-paper-deep px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy">ব্যবহারকারী তালিকা</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-deep text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="px-5 py-3">নাম</th>
                  <th className="px-5 py-3">মোবাইল</th>
                  <th className="px-5 py-3">ভূমিকা</th>
                  <th className="px-5 py-3">অবস্থা</th>
                  <th className="px-5 py-3 text-right">কাজ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-paper-deep/70 last:border-0">
                    <td className="px-5 py-3 font-semibold text-navy">{u.name}</td>
                    <td className="tnum px-5 py-3 text-ink-soft">{u.phone}</td>
                    <td className="px-5 py-3 text-ink-soft">{u.role === "owner" ? "মালিক" : "অ্যাডমিন"}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleUser(u)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          u.isActive ? "border-wa/40 bg-wa/15 text-wa-deep" : "border-paper-deep bg-paper text-ink-soft"
                        }`}
                      >
                        {u.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setUserForm({ id: u.id, name: u.name, phone: u.phone, password: "", role: u.role })
                          }
                          className="rounded-lg border border-paper-deep p-2 text-navy"
                          aria-label="সম্পাদনা"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="rounded-lg border border-paper-deep p-2 text-alert"
                          aria-label="মুছুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={saveUser} className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="font-display text-lg font-bold text-navy">
              {userForm.id ? "ব্যবহারকারী সম্পাদনা" : "নতুন ব্যবহারকারী যোগ করুন"}
            </h2>
            <div className="gold-rule mt-2 w-16" />
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">নাম</label>
                <input className="field" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">মোবাইল নম্বর</label>
                <input className="field" required value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) {userForm.id ? "(বদলাতে চাইলে লিখুন)" : ""}
                </label>
                <input
                  type="password"
                  className="field"
                  required={!userForm.id}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">ভূমিকা</label>
                <select className="field" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="admin">অ্যাডমিন</option>
                  <option value="owner">মালিক (সব অনুমতি)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-navy flex-1">
                  <Plus size={16} /> {userForm.id ? "আপডেট করুন" : "যোগ করুন"}
                </button>
                {userForm.id ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setUserForm({ id: 0, name: "", phone: "", password: "", role: "admin" })}
                  >
                    <X size={16} /> বাতিল
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-ink-soft">
                নতুন ব্যবহারকারী এই মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে /admin/login থেকে ঢুকতে পারবেন।
              </p>
            </div>
          </form>
        </div>
        )
      ) : null}

      {tab === "reviews" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-paper-deep bg-white">
            <div className="border-b border-paper-deep px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy">গ্রাহক মতামত</h2>
            </div>
            <ul className="divide-y divide-paper-deep">
              {reviews.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-gold">
                    {r.name.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy">{r.name}</span>
                      <span className="text-xs text-ink-soft">{r.role}</span>
                      <span className="text-xs text-gold">{"★".repeat(r.rating)}</span>
                      <button
                        onClick={async () => {
                          await fetch("/api/reviews", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: r.id, isActive: !r.isActive }),
                          });
                          loadAll();
                        }}
                        className={`ml-auto rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          r.isActive ? "border-wa/40 bg-wa/15 text-wa-deep" : "border-paper-deep bg-paper text-ink-soft"
                        }`}
                      >
                        {r.isActive ? "প্রকাশিত" : "লুকানো"}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{r.text}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/reviews", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: r.id }),
                      });
                      loadAll();
                    }}
                    className="rounded-lg border border-paper-deep p-2 text-alert"
                    aria-label="মুছুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={saveReview} className="h-fit rounded-2xl border border-paper-deep bg-white p-6">
            <h2 className="font-display text-lg font-bold text-navy">
              {reviewForm.id ? "মতামত সম্পাদনা" : "নতুন মতামত যোগ করুন"}
            </h2>
            <div className="gold-rule mt-2 w-16" />
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">গ্রাহকের নাম</label>
                <input className="field" required value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">পরিচয়</label>
                <input className="field" value={reviewForm.role} onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })} placeholder="ঢাকা" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">রেটিং</label>
                <select className="field" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  {["5", "4", "3", "2", "1"].map((v) => (
                    <option key={v} value={v}>{v} স্টার</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">মতামত</label>
                <textarea className="field min-h-[96px]" value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-navy flex-1">
                  <Plus size={16} /> {reviewForm.id ? "আপডেট করুন" : "যোগ করুন"}
                </button>
                {reviewForm.id ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReviewForm({ id: 0, name: "", role: "", rating: "5", text: "" })}
                  >
                    <X size={16} /> বাতিল
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
