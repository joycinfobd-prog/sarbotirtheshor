"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-paper-deep bg-paper">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-soft">
              <ImagePlus size={20} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            className="field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/....jpg অথবা https://..."
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost px-3 py-1.5 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              ছবি আপলোড
            </button>
            {value ? (
              <button type="button" className="text-xs text-alert hover:underline" onClick={() => onChange("")}>
                সরান
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          {error ? <div className="mt-1 text-xs text-alert">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
