import {
  CreateCampaignInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RegisterRaffleTicketsInput,
  UpdateCampaignInput,
} from "@/lib/rifa/types";
import {
  createCampaignAction,
  registerRaffleTicketsAction,
  runDeterministicDrawAction,
  updateCampaignAction,
} from "@/server/actions/rifa";
import { RifaDashboard } from "@/components/rifa/dashboard";

export default function RifaPage() {
  async function handleCreateCampaign(
    input: CreateCampaignInput,
    context: RaffleActionContext
  ) {
    "use server";
    return createCampaignAction(input, context);
  }

  async function handleUpdateCampaign(
    input: UpdateCampaignInput,
    context: RaffleActionContext
  ) {
    "use server";
    return updateCampaignAction(input, context);
  }

  async function handleRegisterTickets(
    input: RegisterRaffleTicketsInput,
    context: RaffleActionContext
  ) {
    "use server";
    return registerRaffleTicketsAction(input, context);
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
      onCreateCampaign={handleCreateCampaign}
      onUpdateCampaign={handleUpdateCampaign}
      onRegisterTickets={handleRegisterTickets}
      onRunDraw={handleRunDraw}
    />
  );
}

