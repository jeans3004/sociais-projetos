"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
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
import { Timestamp } from "firebase/firestore";

import { DonationForm } from "@/components/forms/DonationForm";
import { FiltersBar } from "@/components/rifa/filters-bar";
import { StudentDrawer } from "@/components/rifa/student-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AssignTicketsInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RaffleCampaign,
  RaffleDonation,
  RaffleDrawResult,
  RaffleTicket,
  RaffleTimelineEntry,
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

import { DonationFormData } from "@/types";

interface RifaDashboardProps {
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

function formatTimestamp(timestamp?: Timestamp) {
  if (!timestamp) return "";
  try {
    return format(timestamp.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    return "";
  }
}

export function RifaDashboard({
  onRegisterDonation,
  onAssignTickets,
  onRunDraw,
}: RifaDashboardProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<RaffleCampaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] =
    useState<string | undefined>();

  const [donations, setDonations] = useState<RaffleDonation[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [participantStats, setParticipantStats] = useState<
    StudentCampaignStats[]
  >([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [draws, setDraws] = useState<RaffleDrawResult[]>([]);
  const [drawsLoading, setDrawsLoading] = useState(false);

  const [studentQuery, setStudentQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">(
    "all"
  );
  const [ticketNumberFilter, setTicketNumberFilter] = useState("");
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
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
  }, [participantStats, studentMetadata, studentQuery, classQuery]);

  const filteredTickets = useMemo(() => {
    let list = tickets.filter((ticket) => ticket.status !== "canceled");
    if (statusFilter !== "all") {
      list = list.filter((ticket) => ticket.status === statusFilter);
    }
    if (ticketNumberFilter) {
      const number = Number(ticketNumberFilter);
      if (!Number.isNaN(number)) {
        list = list.filter((ticket) => ticket.number === number);
      }
    }
    if (studentQuery) {
      const queryLower = studentQuery.toLowerCase();
      list = list.filter((ticket) => {
        const metadata = ticket.studentId
          ? studentMetadata.get(ticket.studentId)
          : undefined;
        return (
          ticket.studentId?.includes(studentQuery) ||
          metadata?.name?.toLowerCase().includes(queryLower)
        );
      });
    }
    if (classQuery) {
      const classLower = classQuery.toLowerCase();
      list = list.filter((ticket) => {
        const metadata = ticket.studentId
          ? studentMetadata.get(ticket.studentId)
          : undefined;
        return metadata?.className?.toLowerCase().includes(classLower);
      });
    }
    return list;
  }, [
    tickets,
    statusFilter,
    ticketNumberFilter,
    studentQuery,
    classQuery,
    studentMetadata,
  ]);

  const studentTimeline = useMemo(() => {
    if (!selectedStudentId) return [];
    const items: RaffleTimelineEntry[] = [];
    donations
      .filter((donation) => donation.studentId === selectedStudentId)
      .forEach((donation) => {
        const totalItems = donation.products?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;
        items.push({
          id: donation.id,
          type: "donation",
          timestamp: donation.createdAt,
          title: `Doação de ${totalItems} itens - ${donation.ticketsGranted ?? 0} rifas concedidas`,
        });
      });
    tickets
      .filter((ticket) => ticket.studentId === selectedStudentId)
      .forEach((ticket) => {
        if (ticket.assignedAt) {
          items.push({
            id: `${ticket.id}-assigned`,
            type: "assignment",
            timestamp: ticket.assignedAt,
            title: `Bilhete #${ticket.number} atribuído`,
          });
        }
        if (ticket.redeemedAt) {
          items.push({
            id: `${ticket.id}-redeemed`,
            type: "redemption",
            timestamp: ticket.redeemedAt,
            title: `Bilhete #${ticket.number} resgatado`,
          });
        }
      });
    return items.sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() ?? 0;
      const bTime = b.timestamp?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  }, [donations, tickets, selectedStudentId]);

  const studentInventory = useMemo(() => {
    if (!selectedStudentId) return [];
    return tickets
      .filter(
        (ticket) =>
          ticket.studentId === selectedStudentId &&
          (ticket.status === "assigned" || ticket.status === "redeemed")
      )
      .sort((a, b) => a.number - b.number);
  }, [tickets, selectedStudentId]);

  const selectedStudentData = useMemo(() => {
    if (!selectedStudentId) return null;
    const donation = donations.find(d => d.studentId === selectedStudentId);
    return donation
      ? {
          name: donation.studentName,
          class: donation.studentClass,
        }
      : null;
  }, [selectedStudentId, donations]);

  const campaignSummary = useMemo(() => {
    if (!selectedCampaignId) {
      return {
        donations: 0,
        participants: 0,
        tickets: 0,
      };
    }
    return {
      donations: donations.length,
      participants: participantStats.length,
      tickets: tickets.length,
    };
  }, [selectedCampaignId, donations.length, participantStats.length, tickets.length]);

  const openStudentDrawer = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDrawerOpen(true);
  }, []);

  const closeStudentDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleDonationSubmit = useCallback(
    async (data: DonationFormData) => {
      if (!selectedCampaignId || !user) return;
      const context: RaffleActionContext = {
        actorId: user.id,
        actorName: user.name,
      };
      startTransition(async () => {
        try {
          const { donationId, ticketsGranted } = await onRegisterDonation(
            {
              campaignId: selectedCampaignId,
              studentId: data.studentId,
              products: data.products.map(p => ({
                product: p.product,
                quantity: p.quantity,
                unit: p.unit,
              })),
              notes: data.notes,
              receiptUrl: data.receiptUrl,
              donationDate: data.date,
            },
            context
          );
          toast({
            title: "Doação registrada",
            description: `#${donationId} gerou ${ticketsGranted} bilhetes`,
          });
          setIsDonationFormOpen(false);
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro ao registrar",
            description: "Tente novamente em instantes.",
            variant: "destructive",
          });
        }
      });
    },
    [
      selectedCampaignId,
      user,
      onRegisterDonation,
      toast,
      startTransition,
    ]
  );

  const handleAssignTickets = useCallback(
    (input: AssignTicketsInput) => {
      if (!user) return;
      const context: RaffleActionContext = {
        actorId: user.id,
        actorName: user.name,
      };
      startTransition(async () => {
        try {
          const { ticketNumbers } = await onAssignTickets(input, context);
          toast({
            title: "Rifas atribuídas",
            description: `Bilhetes ${ticketNumbers.join(", ")} agora são do aluno`,
          });
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro ao atribuir",
            description: "Não foi possível completar a ação.",
            variant: "destructive",
          });
        }
      });
    },
    [user, onAssignTickets, toast]
  );

  const handleRunDraw = useCallback(
    async (seed: string, winnersCount: number) => {
      if (!selectedCampaignId || !user) return;
      const context: RaffleActionContext = {
        actorId: user.id,
        actorName: user.name,
      };
      try {
        const { winners } = await onRunDraw(
          {
            campaignId: selectedCampaignId,
            seed,
            winnersCount,
          },
          context
        );
        toast({
          title: "Sorteio concluído",
          description: `Vencedores: ${winners.join(", ")}`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro no sorteio",
          description: "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      }
    },
    [selectedCampaignId, user, onRunDraw, toast]
  );

  const handleTicketSearch = useCallback(async () => {
    if (!selectedCampaignId || !ticketNumberFilter) return;
    const number = Number(ticketNumberFilter);
    if (Number.isNaN(number)) {
      toast({
        title: "Número inválido",
        description: "Informe apenas números para buscar rifas.",
        variant: "destructive",
      });
      return;
    }
    try {
      const ticket = await getTicketByNumber(selectedCampaignId, number);
      if (!ticket) {
        toast({
          title: "Bilhete não encontrado",
          description: "Verifique o número informado.",
        });
        return;
      }
      if (ticket.studentId) {
        openStudentDrawer(ticket.studentId);
      } else {
        toast({
          title: "Bilhete disponível",
          description: `#${ticket.number} ainda não foi atribuído.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na busca",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  }, [
    selectedCampaignId,
    ticketNumberFilter,
    toast,
    openStudentDrawer,
  ]);

  const resetFilters = useCallback(() => {
    setStudentQuery("");
    setClassQuery("");
    setStatusFilter("all");
    setTicketNumberFilter("");
    setPeriodStart(null);
    setPeriodEnd(null);
  }, []);

  const activeDonations = filteredDonations.slice(0, 5);
  const activeParticipants = filteredParticipants.slice(0, 5);
  const activeTickets = filteredTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rifas</h1>
          <p className="text-muted-foreground">
            Controle campanhas, doações e sorteios em um só lugar.
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setIsDonationFormOpen(true)}>
            Registrar doação
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir relatório
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setSelectedCampaignId(undefined)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setSelectedCampaignId(undefined);
            }
          }}
          className="border-primary/20 hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaignLoading ? "Carregando..." : "Ativas e finalizadas"}
            </p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setPeriodStart(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setPeriodStart(null);
              setPeriodEnd(null);
            }
          }}
          className="border-primary/20 hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignSummary.donations}
            </div>
            <p className="text-xs text-muted-foreground">
              {donationsLoading
                ? "Carregando..."
                : "Registradas no período"}
            </p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setStudentQuery("")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setStudentQuery("");
            }
          }}
          className="border-primary/20 hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignSummary.participants}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading
                ? "Carregando..."
                : "Alunos com rifas atribuídas"}
            </p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter("all")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setStatusFilter("all");
            }
          }}
          className="border-primary/20 hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSummary.tickets}</div>
            <p className="text-xs text-muted-foreground">
              {ticketsLoading ? "Carregando..." : "Disponíveis e atribuídos"}
            </p>
          </CardContent>
        </Card>
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
        onClear={resetFilters}
      />

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Doações</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="tickets">Bilhetes</TabsTrigger>
          <TabsTrigger value="draws">Sorteios</TabsTrigger>
        </TabsList>
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doações recentes</CardTitle>
              <CardDescription>
                Acompanhe as contribuições e seus bilhetes gerados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Filtrado por {filteredDonations.length} registros
                </div>
                <Button variant="outline" onClick={handleTicketSearch}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
              </div>
              <div className="space-y-2">
                {activeDonations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma doação encontrada com os filtros atuais.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Rifas</TableHead>
                        <TableHead>Registrado por</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeDonations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div>{donation.studentName ?? donation.studentId}</div>
                              {donation.studentClass && (
                                <div className="text-xs text-muted-foreground">
                                  {donation.studentClass}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {donation.products?.length
                              ? `${donation.products.length} produto(s)`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{donation.ticketsGranted ?? 0} rifas</TableCell>
                          <TableCell>{donation.registeredByName ?? "Sistema"}</TableCell>
                          <TableCell>{formatTimestamp(donation.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alunos com rifas</CardTitle>
              <CardDescription>
                Veja o desempenho por participante e acesse ações rápidas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredParticipants.length} participantes encontrados
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCampaignId(selectedCampaignId)}
                >
                  Atualizar
                </Button>
              </div>
              <div className="space-y-2">
                {activeParticipants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum aluno encontrado com os filtros atuais.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Rifas atribuídas</TableHead>
                        <TableHead>Última movimentação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeParticipants.map((participant) => {
                        const metadata = studentMetadata.get(
                          participant.studentId
                        );
                        return (
                          <TableRow key={participant.studentId}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {metadata?.name ?? participant.studentId}
                                </div>
                                {metadata?.className && (
                                  <div className="text-xs text-muted-foreground">
                                    {metadata.className}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{participant.ticketsAssigned}</TableCell>
                            <TableCell>
                              {participant.updatedAt
                                ? formatTimestamp(participant.updatedAt)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStudentDrawer(participant.studentId)}
                              >
                                Ver detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bilhetes</CardTitle>
              <CardDescription>
                Consulte o inventário completo e transfira rapidamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredTickets.length} bilhetes encontrados
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Número da rifa"
                    value={ticketNumberFilter}
                    onChange={(event) =>
                      setTicketNumberFilter(event.target.value)
                    }
                    className="w-[160px]"
                  />
                  <Button variant="secondary" onClick={handleTicketSearch}>
                    Buscar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {activeTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum bilhete encontrado com os filtros atuais.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Atribuído em</TableHead>
                        <TableHead>Resgatado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeTickets.map((ticket) => {
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
                                    ? "default"
                                    : ticket.status === "assigned"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {ticket.status === "available"
                                  ? "Disponível"
                                  : ticket.status === "assigned"
                                  ? "Atribuído"
                                  : ticket.status === "redeemed"
                                  ? "Resgatado"
                                  : "Cancelado"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {metadata?.name ?? ticket.studentId ?? "-"}
                            </TableCell>
                            <TableCell>{formatTimestamp(ticket.assignedAt)}</TableCell>
                            <TableCell>{formatTimestamp(ticket.redeemedAt)}</TableCell>
                            <TableCell className="text-right">
                              {ticket.studentId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openStudentDrawer(ticket.studentId!)}
                                >
                                  Ver aluno
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (!studentQuery) {
                                      toast({
                                        title: "Filtre por aluno",
                                        description:
                                          "Busque o aluno antes de atribuir o bilhete.",
                                      });
                                      return;
                                    }
                                    const metadata = [...studentMetadata.entries()].find(
                                      ([, value]) =>
                                        value.name?.toLowerCase() ===
                                        studentQuery.toLowerCase()
                                    );
                                    if (metadata) {
                                      openStudentDrawer(metadata[0]);
                                    } else {
                                      toast({
                                        title: "Aluno não encontrado",
                                        description:
                                          "Selecione o aluno nos filtros antes de atribuir.",
                                      });
                                    }
                                  }}
                                >
                                  Atribuir
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draws" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sorteios</CardTitle>
              <CardDescription>
                Registre sorteios determinísticos e audite resultados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="draw-seed">Seed do sorteio</Label>
                  <Input
                    id="draw-seed"
                    placeholder="Ex: festa-junina-2024"
                    value={drawSeed}
                    onChange={(event) => setDrawSeed(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draw-winners">Quantidade de vencedores</Label>
                  <Input
                    id="draw-winners"
                    type="number"
                    min={1}
                    value={drawWinnersCount}
                    onChange={(event) => setDrawWinnersCount(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => {
                    const quantity = Number(drawWinnersCount);
                    if (!drawSeed || Number.isNaN(quantity) || quantity <= 0) {
                      toast({
                        title: "Dados inválidos",
                        description: "Informe seed e quantidade válidas.",
                        variant: "destructive",
                      });
                      return;
                    }
                    handleRunDraw(drawSeed, quantity);
                  }}
                  disabled={isPending}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Realizar sorteio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDrawSeed("");
                    setDrawWinnersCount("1");
                  }}
                >
                  Limpar
                </Button>
              </div>
              <div className="space-y-2">
                {drawsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando sorteios...
                  </p>
                ) : draws.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum sorteio registrado ainda.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seed</TableHead>
                        <TableHead>Vencedores</TableHead>
                        <TableHead>Hash de integridade</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draws.map((draw) => (
                        <TableRow key={draw.id}>
                          <TableCell>{draw.seed}</TableCell>
                          <TableCell>{draw.winners.join(", ")}</TableCell>
                          <TableCell>
                            <code className="text-xs">{draw.integrityHash}</code>
                          </TableCell>
                          <TableCell>{formatTimestamp(draw.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>
            Selecione a campanha para aplicar os filtros e registrar ações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCampaignId(item.id)}
                className={`rounded-lg border p-4 text-left transition hover:border-primary ${
                  selectedCampaignId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description ?? "Sem descrição"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === "active"
                        ? "default"
                        : item.status === "closed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {item.status === "active"
                      ? "Ativa"
                      : item.status === "closed"
                      ? "Encerrada"
                      : "Rascunho"}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Início</p>
                    <p>{formatTimestamp(item.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fim</p>
                    <p>{formatTimestamp(item.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total de Rifas</p>
                    <p>{item.ticketsTotal ?? "-"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <DonationForm
        open={isDonationFormOpen}
        onClose={() => setIsDonationFormOpen(false)}
        onSubmit={handleDonationSubmit}
      />

      <StudentDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        studentName={selectedStudentData?.name}
        studentClass={selectedStudentData?.class}
        campaignId={selectedCampaignId}
        tickets={studentInventory}
        timeline={studentTimeline}
        onAssignTickets={handleAssignTickets}
      />
    </div>
  );
}

