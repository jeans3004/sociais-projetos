import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "./config";
import { AuditLog } from "@/types";

const COLLECTION_NAME = "auditLogs";

export async function getAuditLogs(limitCount: number = 50): Promise<AuditLog[]> {
  try {
    const auditLogsRef = collection(db, COLLECTION_NAME);
    const q = query(auditLogsRef, orderBy("timestamp", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AuditLog[];
  } catch (error) {
    console.error("Error getting audit logs:", error);
    throw error;
  }
}
