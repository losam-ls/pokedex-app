import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { databaseService } from "../services/db";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initDB = async () => {
      try {
        await databaseService.initDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
