"use client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { errMessage, notify } from "@/lib/notify";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        // Every failed query/mutation surfaces as a toast with the real reason.
        queryCache: new QueryCache({ onError: (e) => notify(errMessage(e), "error") }),
        mutationCache: new MutationCache({ onError: (e) => notify(errMessage(e), "error") }),
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
