import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiltersBar } from "@/components/rifa/filters-bar";
import { StudentDrawer } from "@/components/rifa/student-drawer";
import {
  AssignTicketsInput,
  DeterministicDrawInput,
  RaffleCampaign,
  RaffleDonation,
  RaffleDrawResult,
  RaffleTicket,
  RaffleTimelineEntry,
  RaffleActionContext,
  RegisterDonationInput,
  StudentCampaignStats,
  TicketStatus,
} from "@/lib/rifa/types";
import {
  RaffleFilters,
  getTicketByNumber,
  subscribeToCampaigns,
  subscribeToDonations,
  subscribeToDraws,
  subscribeToStudentStats,
  subscribeToTickets,
} from "@/lib/rifa/data";
import {
  registerDonationAction,
  assignTicketsAction,
  runDeterministicDrawAction,
} from "@/server/actions/rifa";
import { DonationForm } from "@/components/forms/DonationForm";
import { DonationFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Timestamp } from "firebase/firestore";

function formatTimestamp(timestamp?: Timestamp) {
  if (!timestamp) return "";
  try {
    return format(timestamp.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    return "";
  }
}

interface RifaPageContentProps {
  onRegisterDonation: (
    input: RegisterDonationInput,
    context: RaffleActionContext
  ) => Promise<{ donationId: string; ticketsGranted: number }>;
  onAssignTickets: (
    input: AssignTicketsInput,
    context: RaffleActionContext
  ) => Promise<{ ticketIds: string[]; ticketNumbers: number[] }>;
  onRunDraw: (
    input: DeterministicDrawInput,
    context: RaffleActionContext
  ) => Promise<{ drawId: string; winners: string[]; integrityHash: string }>;
}

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
    <RifaPageContent
      onRegisterDonation={handleRegisterDonation}
      onAssignTickets={handleAssignTickets}
      onRunDraw={handleRunDraw}
    />
  );
}

function RifaPageContent({
  onRegisterDonation,
  onAssignTickets,
  onRunDraw,
}: RifaPageContentProps) {
  "use client";
  const { toast } = useToast();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<RaffleCampaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

  const [donations, setDonations] = useState<RaffleDonation[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [participantStats, setParticipantStats] = useState<StudentCampaignStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [draws, setDraws] = useState<RaffleDrawResult[]>([]);
  const [drawsLoading, setDrawsLoading] = useState(false);

  const [studentQuery, setStudentQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [ticketNumberFilter, setTicketNumberFilter] = useState("");
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [drawSeed, setDrawSeed] = useState("");
  const [drawWinnersCount, setDrawWinnersCount] = useState("1");

  useEffect(() => {
    setCampaignLoading(true);
    const unsubscribe = subscribeToCampaigns((items) => {
      setCampaigns(items);
      setCampaignLoading(false);
      setSelectedCampaignId((current) => {
        if (current) return current;
        const active = items.find((item) => item.status === "active");
        return active?.id ?? items[0]?.id;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) {
      setDonations([]);
      return;
    }
    setDonationsLoading(true);
    const donationFilters: RaffleFilters = {
      campaignId: selectedCampaignId,
      periodStart,
      periodEnd,
    };
    const unsubscribe = subscribeToDonations(donationFilters, (items) => {
      setDonations(items);
      setDonationsLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, [selectedCampaignId, periodStart, periodEnd]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setTickets([]);
      return;
    }
    setTicketsLoading(true);
    const unsubscribe = subscribeToTickets(
      { campaignId: selectedCampaignId },
      (items) => {
        setTickets(items);
        setTicketsLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setParticipantStats([]);
      return;
    }
    setStatsLoading(true);
    const unsubscribe = subscribeToStudentStats(
      { campaignId: selectedCampaignId },
      (items) => {
        setParticipantStats(items);
        setStatsLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [selectedCampaignId]);

  useEffect(() => {
    setDrawsLoading(true);
    const unsubscribe = subscribeToDraws(selectedCampaignId, (items) => {
      setDraws(items);
      setDrawsLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, [selectedCampaignId]);

  const campaign = useMemo(
    () => campaigns.find((item) => item.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );

  const studentMetadata = useMemo(() => {
    const map = new Map<
      string,
      { name?: string | null; className?: string | null }
    >();
    donations.forEach((donation) => {
      map.set(donation.studentId, {
        name: donation.studentName,
        className: donation.studentClass,
      });
    });
    tickets.forEach((ticket) => {
      if (!ticket.studentId) return;
      const current = map.get(ticket.studentId) ?? {};
      map.set(ticket.studentId, {
        name: current.name,
        className: current.className,
      });
    });
    return map;
  }, [donations, tickets]);

  const filteredDonations = useMemo(() => {
    let list = donations;
    if (studentQuery) {
      const queryLower = studentQuery.toLowerCase();
      list = list.filter((donation) =>
        donation.studentName?.toLowerCase().includes(queryLower) ||
        donation.studentId.includes(studentQuery)
      );
    }
    if (classQuery) {
      const classLower = classQuery.toLowerCase();
      list = list.filter((donation) =>
        donation.studentClass?.toLowerCase().includes(classLower)
      );
    }
    return list;
  }, [donations, studentQuery, classQuery]);

  const filteredParticipants = useMemo(() => {
    let list = participantStats;
    if (studentQuery) {
      const queryLower = studentQuery.toLowerCase();
      list = list.filter((stat) => {
        const metadata = studentMetadata.get(stat.studentId);
        return (
          stat.studentId.includes(studentQuery) ||
          metadata?.name?.toLowerCase().includes(queryLower)
        );
      });
    }
    if (classQuery) {
      const classLower = classQuery.toLowerCase();
      list = list.filter((stat) => {
        const metadata = studentMetadata.get(stat.studentId);
        return metadata?.className?.toLowerCase().includes(classLower);
      });
    }
    return list;
  }, [participantStats, studentQuery, classQuery, studentMetadata]);

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (statusFilter !== "all") {
      list = list.filter((ticket) => ticket.status === statusFilter);
    }
    if (ticketNumberFilter) {
      list = list.filter((ticket) =>
        ticket.number.toString().includes(ticketNumberFilter)
      );
    }
    if (studentQuery) {
      const queryLower = studentQuery.toLowerCase();
      list = list.filter((ticket) => {
        if (!ticket.studentId) return false;
        const metadata = studentMetadata.get(ticket.studentId);
        return (
          ticket.studentId.includes(studentQuery) ||
          metadata?.name?.toLowerCase().includes(queryLower)
        );
      });
    }
    if (classQuery) {
      const classLower = classQuery.toLowerCase();
      list = list.filter((ticket) => {
        if (!ticket.studentId) return false;
        const metadata = studentMetadata.get(ticket.studentId);
        return metadata?.className?.toLowerCase().includes(classLower);
      });
    }
    return list;
  }, [tickets, statusFilter, ticketNumberFilter, studentQuery, classQuery, studentMetadata]);

  const studentTickets = useMemo(() => {
    if (!selectedStudentId) return [] as RaffleTicket[];
    return tickets.filter(
      (ticket) =>
        ticket.studentId === selectedStudentId &&
        (!selectedCampaignId || ticket.campaignId === selectedCampaignId)
    );
  }, [selectedStudentId, tickets, selectedCampaignId]);

  const selectedStudentStats = useMemo(() => {
    if (!selectedStudentId) return null;
    return participantStats.find((stat) => stat.studentId === selectedStudentId) ?? null;
  }, [participantStats, selectedStudentId]);

  const studentTimeline = useMemo(() => {
    if (!selectedStudentId || !selectedCampaignId) return [] as RaffleTimelineEntry[];

    const entries: RaffleTimelineEntry[] = [];

    donations
      .filter(
        (donation) =>
          donation.studentId === selectedStudentId &&
          donation.campaignId === selectedCampaignId
      )
      .forEach((donation) => {
        const relatedTickets = tickets
          .filter((ticket) => ticket.donationId === donation.id)
          .map((ticket) => ticket.number);
        entries.push({
          id: `donation-${donation.id}`,
          type: "donation",
          title: "Doação registrada",
          subtitle: donation.ticketsGranted
            ? `${donation.ticketsGranted} rifas concedidas`
            : undefined,
          ticketNumbers: relatedTickets,
          timestamp: donation.createdAt,
        });
      });

    tickets
      .filter(
        (ticket) =>
          ticket.studentId === selectedStudentId &&
          ticket.campaignId === selectedCampaignId
      )
      .forEach((ticket) => {
        if (ticket.assignedAt) {
          entries.push({
            id: `assigned-${ticket.id}`,
            type: "assignment",
            title: `Rifa #${ticket.number} atribuída`,
            timestamp: ticket.assignedAt,
            ticketNumbers: [ticket.number],
          });
        }
        if (ticket.redeemedAt) {
          entries.push({
            id: `redeemed-${ticket.id}`,
            type: "redemption",
            title: `Rifa #${ticket.number} resgatada`,
            timestamp: ticket.redeemedAt,
            ticketNumbers: [ticket.number],
          });
        }
      });

    return entries.sort((a, b) => {
      const aTime = a.timestamp instanceof Timestamp ? a.timestamp.seconds : 0;
      const bTime = b.timestamp instanceof Timestamp ? b.timestamp.seconds : 0;
      return bTime - aTime;
    });
  }, [donations, tickets, selectedStudentId, selectedCampaignId]);

  const lastDonation = useMemo(() => {
    if (donations.length === 0) return null;
    return donations.reduce((latest, current) =>
      current.createdAt?.toMillis?.() > latest.createdAt?.toMillis?.()
        ? current
        : latest
    );
  }, [donations]);

  const totalParticipants = filteredParticipants.length;
  const totalDonations = filteredDonations.length;
  const totalTicketsAssigned = tickets.filter((ticket) => ticket.status === "assigned").length;

  const summaryCards = [
    {
      title: "Doações confirmadas",
      value: totalDonations,
      description: lastDonation
        ? `Última em ${format(lastDonation.createdAt.toDate(), "dd/MM", {
            locale: ptBR,
          })}`
        : "Sem registros",
      icon: Ticket,
      onClick: () => {
        setStatusFilter("all");
        setStudentQuery("");
        setClassQuery("");
      },
    },
    {
      title: "Participantes únicos",
      value: totalParticipants,
      description: `${totalTicketsAssigned} rifas em circulação`,
      icon: Users,
      onClick: () => {
        setStatusFilter("assigned");
      },
    },
    {
      title: "Campanha ativa",
      value: campaign?.name ?? "Sem campanha",
      description: campaign?.status === "active"
        ? "Distribuição em andamento"
        : "Selecione uma campanha",
      icon: Sparkles,
      onClick: () => {
        setTicketNumberFilter("");
        setPeriodStart(null);
        setPeriodEnd(null);
      },
    },
  ];

  const handleClearFilters = () => {
    setStudentQuery("");
    setClassQuery("");
    setStatusFilter("all");
    setTicketNumberFilter("");
    setPeriodStart(null);
    setPeriodEnd(null);
  };

  const handleDonationSubmit = useCallback(
    async (data: DonationFormData) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Acesso necessário",
          description: "Faça login novamente para registrar a doação.",
        });
        return;
      }
      if (!selectedCampaignId) {
        toast({
          variant: "destructive",
          title: "Campanha não selecionada",
          description: "Escolha uma campanha para vincular a doação.",
        });
        return;
      }
      const input = {
        campaignId: selectedCampaignId,
        studentId: data.studentId,
        products: data.products.map((product) => ({
          product: product.product,
          quantity: product.quantity,
          unit: product.unit,
        })),
        notes: data.notes,
        donationDate: data.date,
      };

      try {
        await onRegisterDonation(input, {
          actorId: user.id,
          actorName: user.name ?? undefined,
        });
        toast({
          title: "Doação registrada",
          description: "As rifas foram atribuídas automaticamente ao aluno.",
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erro ao registrar",
          description: "Não foi possível registrar a doação. Tente novamente.",
        });
        throw error;
      }
    },
    [onRegisterDonation, selectedCampaignId, toast, user]
  );

  const handleAssignTickets = useCallback(
    async (input: AssignTicketsInput) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Acesso necessário",
          description: "Faça login novamente para continuar.",
        });
        return;
      }
      if (!input.campaignId) {
        toast({
          variant: "destructive",
          title: "Campanha obrigatória",
          description: "Informe a campanha para concluir a atribuição.",
        });
        return;
      }
      try {
        await onAssignTickets(input, {
          actorId: user.id,
          actorName: user.name ?? undefined,
        });
        toast({
          title: "Rifas atribuídas",
          description: `${input.quantity} rifas foram alocadas para o aluno.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erro na atribuição",
          description: "Não foi possível atribuir as rifas solicitadas.",
        });
      }
    },
    [onAssignTickets, toast, user]
  );

  const handleRunDraw = useCallback(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Acesso necessário",
        description: "Faça login novamente para realizar o sorteio.",
      });
      return;
    }
    if (!selectedCampaignId) {
      toast({
        variant: "destructive",
        title: "Campanha não selecionada",
        description: "Escolha uma campanha para gerar o sorteio.",
      });
      return;
    }
    if (!drawSeed || !drawWinnersCount) {
      toast({
        variant: "destructive",
        title: "Preencha os dados",
        description: "Informe a seed e o número de ganhadores.",
      });
      return;
    }
    const winnersCount = Number(drawWinnersCount);
    if (Number.isNaN(winnersCount) || winnersCount <= 0) {
      toast({
        variant: "destructive",
        title: "Quantidade inválida",
        description: "Informe um número válido de ganhadores.",
      });
      return;
    }

    startTransition(async () => {
      try {
        await onRunDraw(
          {
            campaignId: selectedCampaignId,
            seed: drawSeed,
            winnersCount,
          },
          {
            actorId: user.id,
            actorName: user.name ?? undefined,
          }
        );
        toast({
          title: "Sorteio registrado",
          description: "Os ganhadores foram salvos com sucesso.",
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erro ao sortear",
          description: "Não foi possível concluir o sorteio.",
        });
      }
    });
  }, [
    drawSeed,
    drawWinnersCount,
    onRunDraw,
    selectedCampaignId,
    startTransition,
    toast,
    user,
  ]);

  const handleSearchTicket = useCallback(async () => {
    if (!selectedCampaignId) return;
    if (!ticketNumberFilter) return;
    const ticketNumber = Number(ticketNumberFilter);
    if (Number.isNaN(ticketNumber)) return;

    try {
      const ticket = await getTicketByNumber(selectedCampaignId, ticketNumber);
      if (ticket) {
        if (ticket.studentId) {
          setSelectedStudentId(ticket.studentId);
          setIsDrawerOpen(true);
        }
        toast({
          title: "Rifa encontrada",
          description: `Número ${ticketNumber} localizado na campanha.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Rifa não encontrada",
          description: "Nenhum registro com esse número foi localizado.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Busca indisponível",
        description: "Não foi possível buscar pelo número informado.",
      });
    }
  }, [selectedCampaignId, ticketNumberFilter, toast]);

  const skeleton = (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-2/3 rounded bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Rifa — Controle de Participações e Sorteio
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe as doações registradas, distribua rifas e organize os sorteios de cada campanha.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setStatusFilter("assigned");
            }}
          >
            <ArrowUpRight className="h-4 w-4" /> Ver ranking
          </Button>
          <Button className="gap-2" onClick={() => setIsDonationFormOpen(true)}>
            <Ticket className="h-4 w-4" /> Registrar doação
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Label htmlFor="campaign-select">Campanha</Label>
          <Select
            value={selectedCampaignId}
            onValueChange={(value) => setSelectedCampaignId(value)}
            disabled={campaignLoading || campaigns.length === 0}
          >
            <SelectTrigger id="campaign-select" className="w-full md:w-80">
              <SelectValue placeholder="Selecione a campanha" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 items-end justify-end gap-2">
          <Input
            placeholder="Buscar nº da rifa"
            value={ticketNumberFilter}
            onChange={(event) => setTicketNumberFilter(event.target.value.replace(/[^0-9]/g, ""))}
            className="w-40"
          />
          <Button variant="outline" onClick={handleSearchTicket}>
            Buscar
          </Button>
        </div>
      </div>

      <FiltersBar
        studentQuery={studentQuery}
        onStudentQueryChange={setStudentQuery}
        classQuery={classQuery}
        onClassQueryChange={setClassQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        ticketNumber={ticketNumberFilter}
        onTicketNumberChange={setTicketNumberFilter}
        startDate={periodStart}
        endDate={periodEnd}
        onStartDateChange={setPeriodStart}
        onEndDateChange={setPeriodEnd}
        onClear={handleClearFilters}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="border-dashed transition hover:border-primary/50"
              role="button"
              tabIndex={0}
              onClick={card.onClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  card.onClick();
                }
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value || card.value === 0 ? card.value : "—"}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-4 md:flex md:items-start md:justify-between md:space-y-0">
            <div>
              <CardTitle>Operações da campanha</CardTitle>
              <CardDescription>
                Acompanhe as doações registradas, inventário de rifas e registros de sorteios.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Exportar XLSX
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="donations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="donations">Doações realizadas</TabsTrigger>
                <TabsTrigger value="tickets">Lista mestre de rifas</TabsTrigger>
                <TabsTrigger value="draws">Sorteios registrados</TabsTrigger>
              </TabsList>

              <TabsContent value="donations" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ID</TableHead>
                        <TableHead className="whitespace-nowrap">Aluno</TableHead>
                        <TableHead className="whitespace-nowrap">Turma</TableHead>
                        <TableHead className="whitespace-nowrap">Tickets</TableHead>
                        <TableHead className="whitespace-nowrap">Data</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donationsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6}>{skeleton}</TableCell>
                        </TableRow>
                      ) : filteredDonations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                            Nenhuma doação encontrada para os filtros atuais.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">#{donation.id.slice(-6)}</TableCell>
                            <TableCell>{donation.studentName ?? donation.studentId}</TableCell>
                            <TableCell>{donation.studentClass ?? "—"}</TableCell>
                            <TableCell>{donation.ticketsGranted ?? "—"}</TableCell>
                            <TableCell>
                              {donation.createdAt ?
                                format(donation.createdAt.toDate(), "dd/MM/yyyy") :
                                "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {donation.status === "pending" ? "Pendente" : "Confirmada"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Doação origem</TableHead>
                        <TableHead>Atribuída em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5}>{skeleton}</TableCell>
                        </TableRow>
                      ) : filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum ticket disponível para a campanha selecionada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => {
                          const metadata = ticket.studentId
                            ? studentMetadata.get(ticket.studentId)
                            : undefined;
                          return (
                            <TableRow key={ticket.id}>
                              <TableCell>#{ticket.number}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    ticket.status === "redeemed"
                                      ? "secondary"
                                      : ticket.status === "assigned"
                                      ? "outline"
                                      : "default"
                                  }
                                >
                                  {ticket.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{metadata?.name ?? ticket.studentId ?? "—"}</TableCell>
                              <TableCell>{ticket.donationId ? `#${ticket.donationId.slice(-6)}` : "—"}</TableCell>
                              <TableCell>
                                {ticket.assignedAt ? formatTimestamp(ticket.assignedAt) : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="draws" className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="draw-seed">Seed</Label>
                      <Input
                        id="draw-seed"
                        value={drawSeed}
                        onChange={(event) => setDrawSeed(event.target.value)}
                        placeholder="Ex: campanha-inverno"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draw-winners">Ganhadores</Label>
                      <Input
                        id="draw-winners"
                        value={drawWinnersCount}
                        onChange={(event) =>
                          setDrawWinnersCount(event.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder="Quantidade"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleRunDraw} disabled={isPending} className="w-full">
                        Registrar sorteio
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {drawsLoading ? (
                    skeleton
                  ) : draws.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Nenhum sorteio registrado para esta campanha.
                    </div>
                  ) : (
                    draws.map((draw) => (
                      <div key={draw.id} className="rounded-lg border bg-muted/20 p-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-foreground">
                            Seed: <span className="font-mono">{draw.seed}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Registrado em {draw.createdAt ? format(draw.createdAt.toDate(), "dd/MM/yyyy HH:mm") : "—"}
                          </p>
                          <p className="text-muted-foreground">
                            Hash: <span className="font-mono break-all">{draw.integrityHash}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {draw.winners.map((winnerId, index) => (
                              <Badge key={winnerId} variant="outline">
                                #{index + 1}: {winnerId.slice(-6)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participantes</CardTitle>
            <CardDescription>
              Inventário consolidado por aluno na campanha selecionada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              skeleton
            ) : filteredParticipants.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Nenhum aluno encontrado com os filtros atuais.
              </div>
            ) : (
              filteredParticipants.map((stat) => {
                const metadata = studentMetadata.get(stat.studentId);
                return (
                  <button
                    type="button"
                    key={stat.id}
                    className="flex w-full flex-col items-start gap-1 rounded-lg border bg-background p-3 text-left shadow-sm transition hover:border-primary/50"
                    onClick={() => {
                      setSelectedStudentId(stat.studentId);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <span className="font-semibold text-foreground">
                      {metadata?.name ?? stat.studentId}
                    </span>
                    {metadata?.className ? (
                      <span className="text-xs text-muted-foreground">
                        Turma {metadata.className}
                      </span>
                    ) : null}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{stat.ticketsAssigned} atribuídas</span>
                      <span>{stat.ticketsRedeemed} resgatadas</span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas disponíveis</CardTitle>
          <CardDescription>
            Dados consolidados das campanhas cadastradas para distribuição de rifas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {campaignLoading ? (
            skeleton
          ) : campaigns.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Nenhuma campanha cadastrada.
            </div>
          ) : (
            campaigns.map((item) => (
              <div key={item.id} className="rounded-lg border bg-muted/20 p-4 text-sm">
                <p className="text-base font-semibold text-foreground">{item.name}</p>
                <p className="text-muted-foreground">
                  Status: {item.status === "active" ? "Ativa" : item.status === "closed" ? "Encerrada" : "Rascunho"}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>Total: {item.ticketsTotal ?? "—"}</span>
                  <span>Atribuídas: {item.ticketsAssigned ?? "—"}</span>
                  <span>Disponíveis: {item.ticketsAvailable ?? "—"}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <DonationForm
        open={isDonationFormOpen}
        onClose={() => setIsDonationFormOpen(false)}
        onSubmit={handleDonationSubmit}
      />

      <StudentDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setSelectedStudentId(null);
          }
        }}
        campaignId={selectedCampaignId}
        studentName={
          selectedStudentId ? studentMetadata.get(selectedStudentId)?.name ?? selectedStudentId : undefined
        }
        studentClass={
          selectedStudentId ? studentMetadata.get(selectedStudentId)?.className ?? undefined : undefined
        }
        stats={selectedStudentStats}
        tickets={studentTickets}
        timeline={studentTimeline}
        onAssignTickets={(input) => handleAssignTickets(input)}
        onTransferTickets={() =>
          toast({
            title: "Transferência em breve",
            description: "Funcionalidade será disponibilizada nas próximas versões.",
          })
        }
        onPrintInventory={() =>
          toast({
            title: "Exportação em breve",
            description: "Impressão do inventário será disponibilizada nas próximas versões.",
          })
        }
      />
    </div>
  );
}
