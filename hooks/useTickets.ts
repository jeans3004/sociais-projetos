"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket } from "@/types";
import { getTickets } from "@/lib/firebase/tickets";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ticketsData = await getTickets();
      setTickets(ticketsData);
    } catch (err) {
      console.error("useTickets:error", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const ticketsData = await getTickets();
        if (mounted) {
          setTickets(ticketsData);
        }
      } catch (err) {
        console.error("useTickets:error", err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    tickets,
    loading,
    error,
    refresh: loadTickets,
  };
}
