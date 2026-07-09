// Tiny pub/sub for toast notifications — no dependency. Any layer can call
// notify(); the <Toaster/> renders them.
export type ToastType = "error" | "success" | "info";
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();
let counter = 0;

export function notify(message: string, type: ToastType = "info") {
  counter += 1;
  const toast: Toast = { id: counter, message, type };
  listeners.forEach((l) => l(toast));
}

export function subscribeToasts(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const errMessage = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === "string" ? e : "Erreur inconnue";
