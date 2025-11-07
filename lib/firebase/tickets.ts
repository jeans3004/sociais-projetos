import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import { Ticket } from "@/types";

const COLLECTION_NAME = "tickets";

export async function getTickets(): Promise<Ticket[]> {
  try {
    const ticketsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(ticketsRef);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Ticket[];
  } catch (error) {
    console.error("Error getting tickets:", error);
    throw error;
  }
}
