"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { subscribeToasts, type Toast } from "@/lib/notify";
import { cn } from "@/lib/utils";

const ICON = { error: AlertCircle, success: CheckCircle2, info: Info };
const STYLE = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-zinc-200 bg-white text-zinc-800",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      subscribeToasts((t) => {
        setToasts((cur) => [...cur, t]);
        setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== t.id)), 7000);
      }),
    [],
  );

  const dismiss = (id: number) => setToasts((cur) => cur.filter((x) => x.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICON[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-md",
              STYLE[t.type],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1 break-words">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
