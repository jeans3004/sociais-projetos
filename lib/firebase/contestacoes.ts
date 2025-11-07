import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { ContestacaoFormData } from "@/types";

const COLLECTION_NAME = "contestacoes";

export async function createContestacao(data: ContestacaoFormData) {
  try {
    const contestacoesRef = collection(db, COLLECTION_NAME);
    const payload = {
      nome: data.nome,
      contato: data.contato,
      referencia: data.referencia ?? null,
      descricao: data.descricao,
      createdAt: Timestamp.now(),
    };

    await addDoc(contestacoesRef, payload);
  } catch (error) {
    console.error("Error creating contestacao:", error);
    throw error;
  }
}
