"use client";

import { useCallback, useEffect, useState } from "react";
import { AuditLog } from "@/types";
import { getAuditLogs } from "@/lib/firebase/auditLogs";

export function useAuditLogs(limitCount: number = 50) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs(limitCount);
      setAuditLogs(data);
    } catch (err) {
      console.error("useAuditLogs:error", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAuditLogs(limitCount);
        if (mounted) {
          setAuditLogs(data);
        }
      } catch (err) {
        console.error("useAuditLogs:error", err);
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
  }, [limitCount]);

  return {
    auditLogs,
    loading,
    error,
    refresh: loadAuditLogs,
  };
}
