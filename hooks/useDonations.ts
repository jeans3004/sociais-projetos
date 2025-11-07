"use client";

import { useCallback, useEffect, useState } from "react";
import { Donation } from "@/types";
import { getDonations } from "@/lib/firebase/donations";

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const donationsData = await getDonations();
      setDonations(donationsData);
    } catch (err) {
      console.error("useDonations:error", err);
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
        const donationsData = await getDonations();
        if (mounted) {
          setDonations(donationsData);
        }
      } catch (err) {
        console.error("useDonations:error", err);
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
    donations,
    loading,
    error,
    refresh: loadDonations,
  };
}
