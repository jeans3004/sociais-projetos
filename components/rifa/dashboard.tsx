"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { CalendarDays, Download, Info, ListFilter, Plus, Sparkles, Ticket } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import * as XLSX from "xlsx";

import { StudentCombobox } from "@/components/StudentCombobox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CreateCampaignInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RaffleCampaign,
  RaffleDonation,
  RaffleDrawResult,
  RaffleTicket,
  RaffleTimelineEntry,
  RegisterRaffleTicketsInput,
  TicketStatus,
  UpdateCampaignInput,
} from "@/lib/rifa/types";
import {
  RaffleFilters,
  subscribeToCampaigns,
  subscribeToDonations,
  subscribeToDraws,
  subscribeToTickets,
} from "@/lib/rifa/data";
import { getStudents } from "@/lib/firebase/students";
import { Student } from "@/types";

interface RifaDashboardProps {
  onCreateCampaign: (
    input: CreateCampaignInput,
    context: RaffleActionContext
  ) => Promise<{ id: string }>;
  onUpdateCampaign: (
    input: UpdateCampaignInput,
    context: RaffleActionContext
  ) => Promise<{ id: string }>;
  onRegisterTickets: (
    input: RegisterRaffleTicketsInput,
    context: RaffleActionContext
  ) => Promise<{ ticketNumbers: number[] }>;
  onRunDraw: (
    input: DeterministicDrawInput,
    context: RaffleActionContext
  ) => Promise<{ draws: { drawId: string; ticketId: string; ticketNumber: number; studentId: string; studentName?: string | null }[] }>;
}

interface FilterState {
  studentQuery: string;
  classQuery: string;
  status: TicketStatus | "all";
  ticketNumber: string;
  startDate: Date | null;
  endDate: Date | null;
}

const BASE_FILTERS: FilterState = {
  studentQuery: "",
  classQuery: "",
  status: "all",
  ticketNumber: "",
  startDate: null,
  endDate: null,
};

function createEmptyFilters(): FilterState {
  return { ...BASE_FILTERS };
}

function toDate(timestamp?: Timestamp | null) {
  if (!timestamp) return undefined;
  try {
    return timestamp.toDate();
  } catch (error) {
    return undefined;
  }
}

function formatTimestamp(value?: Timestamp | Date | null) {
  if (!value) return "";
  const date = value instanceof Timestamp ? value.toDate() : value;
  try {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return "";
  }
}

function isCampaignActive(campaign: RaffleCampaign, reference = new Date()) {
  if (campaign.status !== "active") return false;
  const start = campaign.startDate ? toDate(campaign.startDate)?.getTime() ?? 0 : 0;
  const end = campaign.endDate ? toDate(campaign.endDate)?.getTime() ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
  const ref = reference.getTime();
  return ref >= start && ref <= end;
}

function campaignStatusLabel(campaign: RaffleCampaign) {
  return campaign.status === "active" ? "Ativa" : "Inativa";
}

function formatTicketStatus(status: TicketStatus) {
  switch (status) {
    case "available":
      return "Disponível";
    case "assigned":
      return "Atribuído";
    case "drawn":
      return "Sorteado";
    default:
      return status;
  }
}

const CAMPAIGN_ALL_VALUE = "all";
const REGISTER_CAMPAIGN_PLACEHOLDER = "__register_campaign__";

export function RifaDashboard({
  onCreateCampaign,
  onUpdateCampaign,
  onRegisterTickets,
  onRunDraw,
}: RifaDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<RaffleCampaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const [campaignFilterManuallySet, setCampaignFilterManuallySet] = useState(false);

  const [donations, setDonations] = useState<RaffleDonation[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [draws, setDraws] = useState<RaffleDrawResult[]>([]);
  const [drawsLoading, setDrawsLoading] = useState(true);
  const [drawCampaignId, setDrawCampaignId] = useState<string | undefined>();
  const [drawSeed, setDrawSeed] = useState(() => Date.now().toString());
  const [drawWinnersCount, setDrawWinnersCount] = useState(1);
  const [drawUniverse, setDrawUniverse] = useState<"assigned">("assigned");

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [filtersDraft, setFiltersDraft] = useState<FilterState>(() => createEmptyFilters());
  const [filters, setFilters] = useState<FilterState>(() => createEmptyFilters());

  const [activeTab, setActiveTab] = useState("donations");

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<RaffleCampaign | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerQuantity, setRegisterQuantity] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentClassroom, setStudentClassroom] = useState<string>("");
  const [previewTicketNumbers, setPreviewTicketNumbers] = useState<number[]>([]);

  const [selectedDrawerStudentId, setSelectedDrawerStudentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCampaignLoading(true);
    const unsubscribe = subscribeToCampaigns((items) => {
      setCampaigns(items);
      setCampaignLoading(false);
      setSelectedCampaignId((current) => {
        const exists = current
          ? items.some((item) => item.id === current)
          : false;

        if (campaignFilterManuallySet) {
          if (exists) {
            return current;
          }
          if (!current) {
            return current;
          }
        }

        if (exists) {
          return current;
        }

        if (items.length === 0) {
          return undefined;
        }

        const active = items.find((item) => isCampaignActive(item));
        return active?.id ?? items[0]?.id ?? undefined;
      });
    });
    return unsubscribe;
  }, [campaignFilterManuallySet]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getStudents();
        setStudents(data.filter((student) => student.status === "active"));
      } catch (error) {
        console.error(error);
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    setDonationsLoading(true);
    const raffleFilters: RaffleFilters = {
      campaignId: selectedCampaignId,
      periodStart: filters.startDate,
      periodEnd: filters.endDate,
    };
    const unsubscribe = subscribeToDonations(raffleFilters, (items) => {
      setDonations(items);
      setDonationsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCampaignId, filters.startDate, filters.endDate]);

  useEffect(() => {
    setTicketsLoading(true);
    const unsubscribe = subscribeToTickets({}, (items) => {
      setTickets(items);
      setTicketsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setDrawsLoading(true);
    const unsubscribe = subscribeToDraws(selectedCampaignId, (items) => {
      setDraws(items);
      setDrawsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCampaignId]);

  const activeCampaignOptions = useMemo(
    () => campaigns.filter((campaign) => isCampaignActive(campaign)),
    [campaigns]
  );

  const registerCampaignId = useMemo(() => {
    if (
      selectedCampaignId &&
      activeCampaignOptions.some((campaign) => campaign.id === selectedCampaignId)
    ) {
      return selectedCampaignId;
    }
    return activeCampaignOptions[0]?.id;
  }, [activeCampaignOptions, selectedCampaignId]);

  const ticketsByCampaign = useMemo(() => {
    return tickets.reduce<Record<string, RaffleTicket[]>>((acc, ticket) => {
      const list = acc[ticket.campaignId] ?? [];
      list.push(ticket);
      acc[ticket.campaignId] = list;
      return acc;
    }, {});
  }, [tickets]);

  useEffect(() => {
    if (activeCampaignOptions.length === 0) {
      setDrawCampaignId(undefined);
      return;
    }
    setDrawCampaignId((current) => {
      if (current && activeCampaignOptions.some((campaign) => campaign.id === current)) {
        return current;
      }
      if (registerCampaignId) {
        return registerCampaignId;
      }
      return activeCampaignOptions[0]?.id;
    });
  }, [activeCampaignOptions, registerCampaignId]);

  useEffect(() => {
    setDrawSeed(Date.now().toString());
  }, [drawCampaignId]);

  const selectedCampaignTickets = useMemo(() => {
    if (!selectedCampaignId) return tickets;
    return ticketsByCampaign[selectedCampaignId] ?? [];
  }, [ticketsByCampaign, selectedCampaignId, tickets]);

  const ticketsFiltered = useMemo(() => {
    return selectedCampaignTickets.filter((ticket) => {
      if (filters.status !== "all" && ticket.status !== filters.status) {
        return false;
      }
      if (filters.ticketNumber) {
        const number = Number(filters.ticketNumber);
        if (!Number.isNaN(number) && ticket.ticketNumber !== number) {
          return false;
        }
      }
      if (filters.studentQuery) {
        const query = filters.studentQuery.toLowerCase();
        const matchesId = ticket.studentId?.toLowerCase().includes(query);
        const matchesName = ticket.studentName?.toLowerCase().includes(query);
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      if (filters.classQuery) {
        if (!ticket.studentClass?.toLowerCase().includes(filters.classQuery.toLowerCase())) {
          return false;
        }
      }
      if (filters.startDate || filters.endDate) {
        const created = ticket.createdAt ? toDate(ticket.createdAt) : undefined;
        if (filters.startDate && created && created < filters.startDate) {
          return false;
        }
        if (filters.endDate && created && created > filters.endDate) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCampaignTickets, filters]);

  const participantMap = useMemo(() => {
    const map = new Map<string, { studentName?: string; studentClass?: string; studentGrade?: string; tickets: Record<string, number> }>();
    selectedCampaignTickets.forEach((ticket) => {
      if (!ticket.studentId) return;
      const entry = map.get(ticket.studentId) ?? {
        studentName: ticket.studentName,
        studentClass: ticket.studentClass,
        studentGrade: ticket.studentGrade,
        tickets: {},
      };
      entry.studentName = entry.studentName ?? ticket.studentName;
      entry.studentClass = entry.studentClass ?? ticket.studentClass;
      entry.studentGrade = entry.studentGrade ?? ticket.studentGrade;
      entry.tickets[ticket.campaignId] = (entry.tickets[ticket.campaignId] ?? 0) + 1;
      map.set(ticket.studentId, entry);
    });
    return map;
  }, [selectedCampaignTickets]);

  const filteredParticipantIds = useMemo(() => {
    const ids: string[] = [];
    participantMap.forEach((entry, studentId) => {
      if (filters.studentQuery) {
        const query = filters.studentQuery.toLowerCase();
        const matchesId = studentId.toLowerCase().includes(query);
        const matchesName = entry.studentName?.toLowerCase().includes(query);
        if (!matchesId && !matchesName) {
          return;
        }
      }
      if (filters.classQuery) {
        if (!entry.studentClass?.toLowerCase().includes(filters.classQuery.toLowerCase())) {
          return;
        }
      }
      ids.push(studentId);
    });
    return ids;
  }, [participantMap, filters.studentQuery, filters.classQuery]);

  const filteredDonations = useMemo(() => {
    const allowedStudentIds = new Set(selectedCampaignTickets.map((ticket) => ticket.studentId).filter(Boolean) as string[]);
    return donations.filter((donation) => {
      if (selectedCampaignId && donation.campaignId !== selectedCampaignId) {
        return false;
      }
      if (!allowedStudentIds.has(donation.studentId)) {
        return false;
      }
      if (filters.studentQuery) {
        const query = filters.studentQuery.toLowerCase();
        const matchesId = donation.studentId.toLowerCase().includes(query);
        const matchesName = donation.studentName?.toLowerCase().includes(query);
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      if (filters.classQuery) {
        if (!donation.studentClass?.toLowerCase().includes(filters.classQuery.toLowerCase())) {
          return false;
        }
      }
      if (filters.startDate && donation.createdAt) {
        const created = donation.createdAt.toDate();
        if (created < filters.startDate) {
          return false;
        }
      }
      if (filters.endDate && donation.createdAt) {
        const created = donation.createdAt.toDate();
        if (created > filters.endDate) {
          return false;
        }
      }
      return true;
    });
  }, [donations, selectedCampaignId, selectedCampaignTickets, filters]);

  const filteredDraws = useMemo(() => {
    return draws.filter((draw) => {
      if (selectedCampaignId && draw.campaignId !== selectedCampaignId) {
        return false;
      }
      if (filters.studentQuery) {
        const query = filters.studentQuery.toLowerCase();
        const matchesId = draw.studentId?.toLowerCase().includes(query);
        const matchesName = draw.studentName?.toLowerCase().includes(query);
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      return true;
    });
  }, [draws, selectedCampaignId, filters.studentQuery]);

  const latestDraw = useMemo(() => filteredDraws[0], [filteredDraws]);

  const activeCampaignCount = useMemo(
    () => campaigns.filter((campaign) => isCampaignActive(campaign)).length,
    [campaigns]
  );

  const participantCount = useMemo(() => {
    const studentsWithTickets = new Set(
      tickets
        .filter((ticket) => ticket.status === "assigned" || ticket.status === "drawn")
        .map((ticket) => ticket.studentId)
        .filter(Boolean) as string[]
    );
    return studentsWithTickets.size;
  }, [tickets]);

  const ticketSummary = useMemo(() => {
    const available = tickets.filter((ticket) => ticket.status === "available").length;
    const assigned = tickets.filter((ticket) => ticket.status === "assigned").length;
    const drawn = tickets.filter((ticket) => ticket.status === "drawn").length;
    return { available, assigned, drawn };
  }, [tickets]);

  const setCampaignFocus = useCallback(
    (campaignId: string | undefined) => {
      setCampaignFilterManuallySet(true);
      setSelectedCampaignId(campaignId);
    },
    [setCampaignFilterManuallySet, setSelectedCampaignId]
  );

  const handleCampaignFilterChange = useCallback(
    (value: string) => {
      if (value === CAMPAIGN_ALL_VALUE) {
        setCampaignFocus(undefined);
      } else {
        setCampaignFocus(value);
      }
    },
    [setCampaignFocus]
  );

  const handleOpenCampaignModal = useCallback(() => {
    setEditingCampaign(null);
    setIsCampaignModalOpen(true);
  }, []);

  const scrollToCampaignSection = useCallback(() => {
    if (typeof document === "undefined") return;
    document
      .getElementById("raffle-campaigns-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleEditCampaign = useCallback((campaign: RaffleCampaign) => {
    setEditingCampaign(campaign);
    setIsCampaignModalOpen(true);
  }, []);

  const handleCloseCampaignModal = useCallback(() => {
    setIsCampaignModalOpen(false);
  }, []);

  const handleCampaignSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!user) return;
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") ?? "").trim();
      const status = String(formData.get("status") ?? "active");
      const description = String(formData.get("description") ?? "").trim();
      const startDateValue = formData.get("startDate") as string;
      const endDateValue = formData.get("endDate") as string;
      const goalValue = formData.get("goal") as string;

      if (!name) {
        toast({
          title: "Informe o nome da campanha",
          variant: "destructive",
        });
        return;
      }

      if (!startDateValue || !endDateValue) {
        toast({
          title: "Datas obrigatórias",
          description: "Defina início e término da campanha.",
          variant: "destructive",
        });
        return;
      }

      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);

      if (endDate < startDate) {
        toast({
          title: "Período inválido",
          description: "A data final não pode ser anterior ao início.",
          variant: "destructive",
        });
        return;
      }

      const context: RaffleActionContext = {
        actorId: user.id,
        actorName: user.name,
      };

      const payloadBase = {
        name,
        description: description || undefined,
        startDate,
        endDate,
        status: status === "active" ? "active" : "inactive",
        ticketGoal: goalValue ? Number(goalValue) : undefined,
      } satisfies Omit<CreateCampaignInput, "status"> & { status: "active" | "inactive" };

      if (
        editingCampaign &&
        payloadBase.status === "inactive" &&
        (editingCampaign.ticketsDrawn ?? 0) > 0
      ) {
        const confirmed =
          typeof window === "undefined"
            ? true
            : window.confirm(
                "Esta campanha já possui sorteios realizados. Deseja realmente desativá-la?"
              );
        if (!confirmed) {
          return;
        }
      }

      startTransition(async () => {
        try {
          if (editingCampaign) {
            await onUpdateCampaign(
              {
                id: editingCampaign.id,
                ...payloadBase,
              },
              context
            );
            toast({ title: "Campanha atualizada com sucesso" });
          } else {
            const result = await onCreateCampaign(payloadBase, context);
            toast({
              title: "Campanha criada",
              description: `A campanha ${name} foi registrada.`,
            });
            setSelectedCampaignId((current) => {
              if (current) return current;
              if (campaignFilterManuallySet) return current;
              return result.id;
            });
          }
          setIsCampaignModalOpen(false);
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro ao salvar campanha",
            description: "Revise os dados e tente novamente.",
            variant: "destructive",
          });
        }
      });
    },
    [
      campaignFilterManuallySet,
      editingCampaign,
      onCreateCampaign,
      onUpdateCampaign,
      toast,
      user,
    ]
  );

  const handleOpenRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setPreviewTicketNumbers([]);
    setRegisterQuantity(1);
    setSelectedStudentId("");
    setStudentClassroom("");
  }, []);

  const handleCloseRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const handleStudentChange = useCallback(
    (value: string) => {
      setSelectedStudentId(value);
      const student = students.find((item) => item.id === value);
      setStudentClassroom(student ? student.class : "");
    },
    [students]
  );

  const handleGenerateTickets = useCallback(() => {
    const campaignId = registerCampaignId;
    if (!campaignId) {
      toast({
        title: "Selecione uma campanha",
        description: "Escolha uma campanha ativa para gerar bilhetes.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedStudentId) {
      toast({
        title: "Selecione o aluno",
        description: "Escolha o aluno para vincular os bilhetes.",
        variant: "destructive",
      });
      return;
    }
    const campaignTickets = ticketsByCampaign[campaignId] ?? [];
    const lastNumber = campaignTickets.reduce(
      (max, ticket) => Math.max(max, ticket.ticketNumber ?? ticket.number ?? 0),
      0
    );
    const numbers = Array.from({ length: registerQuantity }, (_, index) => lastNumber + index + 1);
    setPreviewTicketNumbers(numbers);
    setCampaignFocus(campaignId);
  }, [registerCampaignId, registerQuantity, selectedStudentId, ticketsByCampaign, toast, setCampaignFocus]);

  const studentTicketCount = useMemo(() => {
    if (!registerCampaignId || !selectedStudentId) return 0;
    const campaignTickets = ticketsByCampaign[registerCampaignId] ?? [];
    return campaignTickets.filter((ticket) => ticket.studentId === selectedStudentId).length;
  }, [ticketsByCampaign, registerCampaignId, selectedStudentId]);

  const handleRegisterTickets = useCallback(() => {
    const campaignId = registerCampaignId;
    if (!user || !campaignId || !selectedStudentId) return;
    const student = students.find((item) => item.id === selectedStudentId);
    if (!student) {
      toast({
        title: "Aluno não encontrado",
        variant: "destructive",
      });
      return;
    }
    const context: RaffleActionContext = {
      actorId: user.id,
      actorName: user.name,
    };

    startTransition(async () => {
      try {
        const result = await onRegisterTickets(
          {
            campaignId,
            studentId: student.id,
            studentName: student.fullName,
            studentClass: student.class,
            studentGrade: student.grade.toString(),
            quantity: registerQuantity,
          },
          context
        );
        setPreviewTicketNumbers(result.ticketNumbers);
        toast({
          title: "Rifas registradas",
          description: `Rifas registradas para ${student.fullName}.`,
        });
        setCampaignFocus(campaignId);
        setIsRegisterModalOpen(false);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro ao registrar rifas",
          description: "Tente novamente em instantes.",
          variant: "destructive",
        });
      }
    });
  }, [
    user,
    registerCampaignId,
    selectedStudentId,
    registerQuantity,
    onRegisterTickets,
    toast,
    students,
    setCampaignFocus,
  ]);

  const handleRunDraw = useCallback(
    (campaignId: string, seed: string, winnersCount: number) => {
      if (!user) return;
      const context: RaffleActionContext = {
        actorId: user.id,
        actorName: user.name,
      };
      startTransition(async () => {
        try {
          const result = await onRunDraw(
            {
              campaignId,
              seed,
              winnersCount,
            },
            context
          );
          const winner = result.draws[0];
          if (winner) {
            toast({
              title: "Sorteio concluído",
              description: `Bilhete #${winner.ticketNumber} foi sorteado!`,
            });
          }
          setDrawSeed(Date.now().toString());
          setDrawWinnersCount(1);
          setCampaignFocus(campaignId);
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro ao sortear",
            description: "Não foi possível concluir o sorteio.",
            variant: "destructive",
          });
        }
      });
    },
    [onRunDraw, setCampaignFocus, setDrawSeed, setDrawWinnersCount, toast, user]
  );

  const drawCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === drawCampaignId),
    [campaigns, drawCampaignId]
  );

  const drawEligibleTickets = useMemo(() => {
    if (!drawCampaignId) return [];
    return (ticketsByCampaign[drawCampaignId] ?? []).filter(
      (ticket) => ticket.status === "assigned"
    );
  }, [ticketsByCampaign, drawCampaignId]);

  useEffect(() => {
    setDrawWinnersCount((current) => {
      if (drawEligibleTickets.length === 0) {
        return 1;
      }
      return Math.min(current, drawEligibleTickets.length);
    });
  }, [drawEligibleTickets.length]);

  const handleDrawCampaignChange = useCallback(
    (value: string) => {
      if (value === REGISTER_CAMPAIGN_PLACEHOLDER) {
        return;
      }
      setDrawCampaignId(value);
      setCampaignFocus(value);
    },
    [setCampaignFocus]
  );

  const handleDrawSubmit = useCallback(() => {
    if (!drawCampaignId) {
      toast({
        title: "Selecione uma campanha",
        description: "Escolha a campanha para realizar o sorteio.",
        variant: "destructive",
      });
      return;
    }
    if (drawEligibleTickets.length === 0) {
      toast({
        title: "Nenhum bilhete elegível",
        description: "A campanha selecionada não possui bilhetes atribuídos.",
        variant: "destructive",
      });
      return;
    }
    const sanitizedSeed = drawSeed.trim() || Date.now().toString();
    const winners = Math.min(
      Math.max(1, drawWinnersCount),
      drawEligibleTickets.length
    );
    handleRunDraw(drawCampaignId, sanitizedSeed, winners);
  }, [
    drawCampaignId,
    drawEligibleTickets.length,
    drawSeed,
    drawWinnersCount,
    handleRunDraw,
    toast,
  ]);

  const filteredTicketsCount = ticketsFiltered.length;
  const filteredParticipants = filteredParticipantIds.map((id) => ({
    id,
    name: participantMap.get(id)?.studentName,
    className: participantMap.get(id)?.studentClass,
    grade: participantMap.get(id)?.studentGrade,
    campaigns: participantMap.get(id)?.tickets ?? {},
  }));

  const openStudentDrawer = useCallback((studentId: string) => {
    setSelectedDrawerStudentId(studentId);
    setIsDrawerOpen(true);
  }, []);

  const closeStudentDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const drawerTickets = useMemo(() => {
    if (!selectedDrawerStudentId) return [];
    return selectedCampaignTickets
      .filter((ticket) => ticket.studentId === selectedDrawerStudentId)
      .sort((a, b) => a.ticketNumber - b.ticketNumber);
  }, [selectedCampaignTickets, selectedDrawerStudentId]);

  const drawerStudentData = useMemo(() => {
    if (!selectedDrawerStudentId) return null;
    const entry = participantMap.get(selectedDrawerStudentId);
    return entry
      ? {
          name: entry.studentName,
          class: entry.studentClass,
        }
      : null;
  }, [participantMap, selectedDrawerStudentId]);

  const drawerTimeline = useMemo(() => {
    if (!selectedDrawerStudentId) return [];
    const studentDonations = donations.filter(
      (donation) => donation.studentId === selectedDrawerStudentId
    );
    const studentTickets = selectedCampaignTickets.filter(
      (ticket) => ticket.studentId === selectedDrawerStudentId
    );
    const items: RaffleTimelineEntry[] = studentDonations.map((donation) => ({
      id: donation.id,
      type: "donation" as const,
      timestamp: donation.createdAt,
      title: `Doação registrada (${donation.products?.length ?? 0} itens)`
        + (donation.ticketsGranted ? ` - ${donation.ticketsGranted} rifas` : ""),
    }));
    studentTickets.forEach((ticket) => {
      if (ticket.createdAt) {
        items.push({
          id: `${ticket.id}-assigned`,
          type: "assignment" as const,
          timestamp: ticket.createdAt,
          title: `Bilhete #${ticket.ticketNumber} atribuído`,
        });
      }
      if (ticket.drawnAt) {
        items.push({
          id: `${ticket.id}-drawn`,
          type: "redemption" as const,
          timestamp: ticket.drawnAt,
          title: `Bilhete #${ticket.ticketNumber} sorteado`,
        });
      }
    });
    return items.sort((a, b) => {
      const aTime = a.timestamp ? (a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp).getTime()) : 0;
      const bTime = b.timestamp ? (b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime()) : 0;
      return bTime - aTime;
    });
  }, [donations, selectedCampaignTickets, selectedDrawerStudentId]);

  const handleApplyFilters = useCallback(() => {
    setFilters({ ...filtersDraft });
  }, [filtersDraft]);

  const handleClearFilters = useCallback(() => {
    const empty = createEmptyFilters();
    setFiltersDraft(empty);
    setFilters(empty);
  }, []);

  const handleFiltersDraftChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFiltersDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const handleExportExcel = useCallback(() => {
    try {
      const data = filteredDonations.map((donation) => ({
        Campanha: campaigns.find((campaign) => campaign.id === donation.campaignId)?.name ?? "--",
        Aluno: donation.studentName ?? donation.studentId,
        Turma: donation.studentClass ?? "",
        Série: donation.studentGrade ?? "",
        Produtos: donation.products
          ?.map((p) => `${p.product}: ${p.quantity} ${p.unit || ""}`)
          .join(", ") || "N/A",
        "Total de Itens": donation.products?.reduce((sum, p) => sum + p.quantity, 0) ?? 0,
        "Rifas Concedidas": donation.ticketsGranted ?? 0,
        Data: formatTimestamp(donation.createdAt),
        "Registrado por": donation.registeredByName ?? "Sistema",
        Observações: donation.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Doações Rifas");
      XLSX.writeFile(
        wb,
        `rifas_doacoes_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast({
        title: "Exportado com sucesso",
        description: "O relatório de doações foi exportado para Excel.",
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
      });
    }
  }, [filteredDonations, campaigns, toast]);

  const filteredText = useMemo(() => {
    switch (activeTab) {
      case "donations":
        return `Filtrado por ${filteredDonations.length} registros`;
      case "participants":
        return `Filtrado por ${filteredParticipants.length} participantes`;
      case "tickets":
        return `Filtrado por ${filteredTicketsCount} bilhetes`;
      case "draws":
        return `Filtrado por ${filteredDraws.length} sorteios`;
      default:
        return "";
    }
  }, [activeTab, filteredDonations.length, filteredParticipants.length, filteredTicketsCount, filteredDraws.length]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.studentQuery ||
          filters.classQuery ||
          filters.ticketNumber ||
          filters.startDate ||
          filters.endDate ||
          filters.status !== "all"
      ),
    [filters]
  );

  const filtersSummary = hasActiveFilters ? filteredText : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rifas</h1>
          <p className="text-muted-foreground">
            Gerencie campanhas, acompanhe participantes e controle os bilhetes sorteados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleOpenRegisterModal} disabled={activeCampaignOptions.length === 0}>
            <Ticket className="mr-2 h-4 w-4" /> Registrar rifa
          </Button>
          <Button variant="outline" onClick={handleOpenCampaignModal}>
            <Plus className="mr-2 h-4 w-4" /> Criar campanha
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          role="button"
          tabIndex={0}
          onClick={scrollToCampaignSection}
          className="border-primary/20 transition hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignLoading ? "--" : `${activeCampaignCount}/${campaigns.length}`}
            </div>
            <p className="text-xs text-muted-foreground">Campanhas ativas / Total de campanhas</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("donations")}
          className="border-primary/20 transition hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donationsLoading ? "--" : filteredDonations.length}
            </div>
            <p className="text-xs text-muted-foreground">Doações associadas a rifas</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("participants")}
          className="border-primary/20 transition hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsLoading ? "--" : participantCount}
            </div>
            <p className="text-xs text-muted-foreground">Alunos com bilhetes</p>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("tickets")}
          className="border-primary/20 transition hover:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {ticketsLoading ? (
                "Carregando..."
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-foreground">
                    <span>Disponíveis</span>
                    <span className="font-semibold">{ticketSummary.available}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground">
                    <span>Atribuídos</span>
                    <span className="font-semibold">{ticketSummary.assigned}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground">
                    <span>Sorteados</span>
                    <span className="font-semibold">{ticketSummary.drawn}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Disponíveis / Atribuídos / Sorteados</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ListFilter className="h-4 w-4" /> Filtros
        </div>
        <Select
          value={selectedCampaignId ?? CAMPAIGN_ALL_VALUE}
          onValueChange={handleCampaignFilterChange}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar campanha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CAMPAIGN_ALL_VALUE}>Todas as campanhas</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FiltersBar
        filters={filtersDraft}
        onFiltersChange={handleFiltersDraftChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
      {filtersSummary ? (
        <p className="text-xs text-muted-foreground">{filtersSummary}</p>
      ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Doações</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="tickets">Bilhetes</TabsTrigger>
          <TabsTrigger value="draws">Sorteios</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle>Doações relacionadas</CardTitle>
                <CardDescription>
                  Visualize as doações conectadas às rifas dos alunos.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={filteredDonations.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtersSummary ? (
                <div className="text-sm text-muted-foreground">{filtersSummary}</div>
              ) : null}
              {donationsLoading ? (
                <p className="text-sm text-muted-foreground">Carregando doações...</p>
              ) : filteredDonations.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhuma doação associada às rifas. Use a página de Doações para registrar contribuições.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Tipo de item</TableHead>
                      <TableHead>Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => {
                      const totalItems = donation.products?.reduce(
                        (sum, product) => sum + (product.quantity ?? 0),
                        0
                      );
                      return (
                        <TableRow key={donation.id}>
                          <TableCell>{formatTimestamp(donation.createdAt)}</TableCell>
                          <TableCell>
                            {campaigns.find((campaign) => campaign.id === donation.campaignId)?.name ?? "--"}
                          </TableCell>
                          <TableCell>{donation.studentName ?? donation.studentId}</TableCell>
                          <TableCell>{donation.studentClass ?? "--"}</TableCell>
                          <TableCell>{donation.studentGrade ?? "--"}</TableCell>
                          <TableCell>
                            {donation.products?.map((product) => product.product).join(", ") || "--"}
                          </TableCell>
                          <TableCell>{totalItems ?? 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
              <CardDescription>Alunos com rifas vinculadas às campanhas selecionadas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtersSummary ? (
                <div className="text-sm text-muted-foreground">{filtersSummary}</div>
              ) : null}
              {filteredParticipants.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhuma rifa registrada ainda. Use o botão “Registrar rifa” para começar.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Campanhas</TableHead>
                      <TableHead>Total de bilhetes</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => {
                      const campaignsEntries = Object.entries(participant.campaigns);
                      const totalTickets = campaignsEntries.reduce(
                        (sum, [, value]) => sum + value,
                        0
                      );
                      return (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.name ?? participant.id}</TableCell>
                          <TableCell>{participant.className ?? "--"}</TableCell>
                          <TableCell>{participant.grade ?? "--"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {campaignsEntries.map(([campaignId, value]) => (
                                <span key={campaignId} className="text-sm text-muted-foreground">
                                  {campaigns.find((campaign) => campaign.id === campaignId)?.name ?? campaignId} ({value})
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{totalTickets}</span>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => openStudentDrawer(participant.id)}>
                              Ver inventário
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bilhetes</CardTitle>
              <CardDescription>Lista completa dos bilhetes gerados nas campanhas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtersSummary ? (
                <div className="text-sm text-muted-foreground">{filtersSummary}</div>
              ) : null}
              {ticketsLoading ? (
                <p className="text-sm text-muted-foreground">Carregando bilhetes...</p>
              ) : ticketsFiltered.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhuma rifa registrada ainda. Use o botão “Registrar rifa” para começar.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº da rifa</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de criação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsFiltered.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-semibold">#{ticket.ticketNumber}</TableCell>
                        <TableCell>{ticket.studentName ?? ticket.studentId ?? "--"}</TableCell>
                        <TableCell>{ticket.studentClass ?? "--"}</TableCell>
                        <TableCell>{ticket.studentGrade ?? "--"}</TableCell>
                        <TableCell>
                          {campaigns.find((campaign) => campaign.id === ticket.campaignId)?.name ?? ticket.campaignId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === "drawn" ? "secondary" : "outline"}>
                            {formatTicketStatus(ticket.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatTimestamp(ticket.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draws" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executar sorteio</CardTitle>
              <CardDescription>
                Selecione a campanha e gere vencedores com base nos bilhetes elegíveis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Campanha</Label>
                  <Select
                    value={drawCampaignId ?? REGISTER_CAMPAIGN_PLACEHOLDER}
                    onValueChange={handleDrawCampaignChange}
                    disabled={activeCampaignOptions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCampaignOptions.length === 0 ? (
                        <SelectItem value={REGISTER_CAMPAIGN_PLACEHOLDER} disabled>
                          Nenhuma campanha ativa
                        </SelectItem>
                      ) : (
                        activeCampaignOptions.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Universo do sorteio</Label>
                  <Select
                    value={drawUniverse}
                    onValueChange={(value) => setDrawUniverse(value as typeof drawUniverse)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o universo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">
                        Todos os bilhetes atribuídos desta campanha
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="draw-seed">Semente</Label>
                  <Input
                    id="draw-seed"
                    value={drawSeed}
                    onChange={(event) => setDrawSeed(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use uma semente para repetir resultados quando necessário.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draw-winners">Qtd. de vencedores</Label>
                  <Input
                    id="draw-winners"
                    type="number"
                    min={1}
                    value={drawWinnersCount}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setDrawWinnersCount(
                        Number.isNaN(value) ? 1 : Math.max(1, value)
                      );
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Elegíveis: {drawEligibleTickets.length}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {drawCampaign
                    ? `Sorteio entre ${drawEligibleTickets.length} bilhetes atribuídos em ${drawCampaign.name}.`
                    : "Selecione uma campanha ativa para sortear."}
                </p>
                <Button
                  onClick={handleDrawSubmit}
                  disabled={
                    isPending ||
                    !drawCampaignId ||
                    drawEligibleTickets.length === 0 ||
                    activeCampaignOptions.length === 0
                  }
                >
                  Sortear rifa
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sorteios</CardTitle>
              <CardDescription>Registros de sorteios realizados por campanha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtersSummary ? (
                <div className="text-sm text-muted-foreground">{filtersSummary}</div>
              ) : null}
              {latestDraw && !drawsLoading && filteredDraws.length > 0 ? (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Último vencedor</p>
                  <p className="text-lg font-semibold text-foreground">
                    {latestDraw.studentName ?? latestDraw.studentId} • Bilhete #{latestDraw.ticketNumber}
                  </p>
                </div>
              ) : null}
              {drawsLoading ? (
                <p className="text-sm text-muted-foreground">Carregando sorteios...</p>
              ) : filteredDraws.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhum sorteio realizado ainda. Gere bilhetes e execute o sorteio quando estiver pronto.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Bilhete</TableHead>
                      <TableHead>Aluno</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDraws.map((draw) => (
                      <TableRow key={draw.id}>
                        <TableCell>{formatTimestamp(draw.createdAt)}</TableCell>
                        <TableCell>
                          {campaigns.find((campaign) => campaign.id === draw.campaignId)?.name ?? draw.campaignId}
                        </TableCell>
                        <TableCell>#{draw.ticketNumber}</TableCell>
                        <TableCell>{draw.studentName ?? draw.studentId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section id="raffle-campaigns-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Campanhas cadastradas</h2>
          <Button variant="ghost" size="sm" onClick={handleOpenCampaignModal}>
            Nova campanha
          </Button>
        </div>
        {campaigns.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhuma campanha registrada. Utilize o botão “Criar campanha” para iniciar uma nova campanha de rifas.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      <CardDescription>{campaign.description || "Sem descrição"}</CardDescription>
                    </div>
                    <Badge variant={isCampaignActive(campaign) ? "default" : "outline"}>
                      {campaignStatusLabel(campaign)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatTimestamp(campaign.startDate)} - {formatTimestamp(campaign.endDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" /> Meta: {campaign.ticketGoal ?? "Não definida"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Bilhetes sorteados: {campaign.ticketsDrawn ?? 0}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>
                    Editar campanha
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent>
          <form onSubmit={handleCampaignSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Editar campanha" : "Criar campanha"}</DialogTitle>
              <DialogDescription>
                Defina as informações principais da campanha de rifas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nome da campanha</Label>
              <Input
                id="campaign-name"
                name="name"
                defaultValue={editingCampaign?.name}
                placeholder="Campanha de inverno"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Descrição</Label>
              <Textarea
                id="campaign-description"
                name="description"
                defaultValue={editingCampaign?.description ?? ""}
                placeholder="Descrição curta (opcional)"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campaign-start">Data de início</Label>
                <Input
                  id="campaign-start"
                  type="date"
                  name="startDate"
                  defaultValue={
                    editingCampaign?.startDate ?
                      format(toDate(editingCampaign.startDate) ?? new Date(), "yyyy-MM-dd") :
                      ""
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-end">Data de término</Label>
                <Input
                  id="campaign-end"
                  type="date"
                  name="endDate"
                  defaultValue={
                    editingCampaign?.endDate ?
                      format(toDate(editingCampaign.endDate) ?? new Date(), "yyyy-MM-dd") :
                      ""
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campaign-goal">Meta de bilhetes</Label>
                <Input
                  id="campaign-goal"
                  name="goal"
                  type="number"
                  min={0}
                  defaultValue={editingCampaign?.ticketGoal ?? ""}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-status">Status</Label>
                <Select
                  name="status"
                  defaultValue={editingCampaign?.status ?? "active"}
                >
                  <SelectTrigger id="campaign-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseCampaignModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {editingCampaign ? "Salvar alterações" : "Criar campanha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar rifa</DialogTitle>
            <DialogDescription>
              Gere novos bilhetes associados a uma campanha ativa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campanha</Label>
              <Select
                value={registerCampaignId ?? REGISTER_CAMPAIGN_PLACEHOLDER}
                onValueChange={(value) => {
                  if (value === REGISTER_CAMPAIGN_PLACEHOLDER) return;
                  setCampaignFocus(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a campanha" />
                </SelectTrigger>
                <SelectContent>
                  {activeCampaignOptions.length === 0 ? (
                    <SelectItem value={REGISTER_CAMPAIGN_PLACEHOLDER} disabled>
                      Nenhuma campanha ativa
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value={REGISTER_CAMPAIGN_PLACEHOLDER} disabled>
                        Selecione a campanha
                      </SelectItem>
                      {activeCampaignOptions.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aluno</Label>
              <StudentCombobox
                students={students}
                value={selectedStudentId}
                onValueChange={handleStudentChange}
                placeholder={studentsLoading ? "Carregando alunos..." : "Selecione o aluno"}
                disabled={studentsLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Turma</Label>
              <Input value={studentClassroom} readOnly placeholder="Turma do aluno" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-quantity">Quantidade de bilhetes</Label>
              <Input
                id="ticket-quantity"
                type="number"
                min={1}
                value={registerQuantity}
                onChange={(event) => setRegisterQuantity(Math.max(1, Number(event.target.value)))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
              <span>Este aluno já possui {studentTicketCount} bilhetes nesta campanha.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateTickets}
                disabled={!registerCampaignId}
              >
                Gerar bilhetes
              </Button>
            </div>
            {previewTicketNumbers.length > 0 && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-semibold text-foreground">Pré-visualização</p>
                <div className="flex flex-wrap gap-2">
                  {previewTicketNumbers.map((number) => (
                    <Badge key={number} variant="outline">
                      Bilhete #{number.toString().padStart(3, "0")}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Copie estes números e escreva no verso dos bilhetes físicos antes de entregar ao aluno.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={handleCloseRegisterModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterTickets}
              disabled={isPending || !registerCampaignId || !selectedStudentId}
            >
              Registrar rifa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        studentName={drawerStudentData?.name}
        studentClass={drawerStudentData?.class}
        tickets={drawerTickets}
        timeline={drawerTimeline}
      />
    </div>
  );
}
