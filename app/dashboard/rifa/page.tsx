import {
  AssignTicketsInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RegisterDonationInput,
} from "@/lib/rifa/types";
import {
  assignTicketsAction,
  registerDonationAction,
  runDeterministicDrawAction,
} from "@/server/actions/rifa";
import { RifaDashboard } from "@/components/rifa/dashboard";

export default function RifaPage() {
  async function handleRegisterDonation(
    input: RegisterDonationInput,
    context: RaffleActionContext
  ) {
    "use server";
    return registerDonationAction(input, context);
  }

  async function handleAssignTickets(
    input: AssignTicketsInput,
    context: RaffleActionContext
  ) {
    "use server";
    return assignTicketsAction(input, context);
  }

  async function handleRunDraw(
    input: DeterministicDrawInput,
    context: RaffleActionContext
  ) {
    "use server";
    return runDeterministicDrawAction(input, context);
  }

  return (
    <RifaDashboard
      onRegisterDonation={handleRegisterDonation}
      onAssignTickets={handleAssignTickets}
      onRunDraw={handleRunDraw}
    />
  );
}

