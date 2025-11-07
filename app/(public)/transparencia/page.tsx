"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Scale,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDonations } from "@/hooks/useDonations";
import { useTickets } from "@/hooks/useTickets";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { getOrCreateSettings } from "@/lib/firebase/settings";
import { createContestacao } from "@/lib/firebase/contestacoes";
import { ContestacaoFormData, Donation, Settings, Ticket } from "@/types";
import { formatDate } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

interface PublicDonationRow {
  id: string;
  className: string;
  displayName: string;
  searchName: string;
  productSummary: string;
  totalQuantity: number;
  date: Date;
}

interface TicketRow {
  id: string;
  code: string;
  status: string;
  className: string;
}

const UNIT_TO_KG: Record<string, number> = {
  kg: 1,
  lt: 1,
  un: 0.5,
  pacote: 0.8,
};

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("pt-BR", options).format(value);

const anonymizeName = (name?: string) => {
  if (!name) return "Participante reservado";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "Participante reservado";
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]?.toUpperCase()}.` : "";
  return `${firstName} ${lastInitial}`.trim();
};

const toDate = (value: Donation["date"]) => {
  if (!value) return new Date();
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  const possible = value as unknown as { seconds?: number; toDate?: () => Date };
  if (possible?.toDate) {
    return possible.toDate();
  }
  if (typeof possible?.seconds === "number") {
    return new Date((possible.seconds || 0) * 1000);
  }
  return new Date(value as unknown as string);
};

export default function TransparencyPage() {
  const { donations, loading: donationsLoading } = useDonations();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { auditLogs, loading: auditLoading } = useAuditLogs(40);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [ticketQuery, setTicketQuery] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContestacaoFormData>({
    defaultValues: {
      nome: "",
      contato: "",
      codigoRifa: "",
      descricao: "",
    },
  });

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await getOrCreateSettings();
        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("TransparencyPage:settings", error);
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const donationRows = useMemo<PublicDonationRow[]>(() => {
    return donations.map((donation) => {
      const date = toDate(donation.date);
      const totalQuantity = donation.products.reduce((sum, product) => {
        const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
        return sum + quantity;
      }, 0);

      const productSummary = donation.products
        .map((product) => product.product)
        .filter(Boolean)
        .join(", ");

      return {
        id: donation.id,
        className: donation.studentClass || "Não informado",
        displayName: anonymizeName(donation.studentName),
        searchName: donation.studentName?.toLowerCase() || "",
        productSummary,
        totalQuantity,
        date,
      };
    });
  }, [donations]);

  const totalItems = useMemo(() => {
    return donations.reduce((sum, donation) => {
      return (
        sum +
        donation.products.reduce((productSum, product) => {
          const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
          return productSum + quantity;
        }, 0)
      );
    }, 0);
  }, [donations]);

  const estimatedWeight = useMemo(() => {
    return donations.reduce((sum, donation) => {
      return (
        sum +
        donation.products.reduce((productSum, product) => {
          const quantity = typeof product.quantity === "number" ? product.quantity : Number(product.quantity) || 0;
          const unitWeight = UNIT_TO_KG[product.unit] ?? 1;
          return productSum + quantity * unitWeight;
        }, 0)
      );
    }, 0);
  }, [donations]);

  const goalValue = settings?.monthlyGoal ?? 0;
  const goalProgress = goalValue > 0 ? Math.min(100, (totalItems / goalValue) * 100) : 0;
  const remainingGoal = goalValue > 0 ? Math.max(goalValue - totalItems, 0) : 0;

  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    donationRows.forEach((row) => {
      if (row.className) {
        classes.add(row.className);
      }
    });
    return Array.from(classes).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [donationRows]);

  const filteredDonations = useMemo(() => {
    return donationRows
      .filter((row) => {
        if (!searchTerm) return true;
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const display = row.displayName.toLowerCase();
        return display.includes(normalizedSearch) || row.searchName.includes(normalizedSearch);
      })
      .filter((row) => {
        if (selectedClass === "all") return true;
        return row.className === selectedClass;
      });
  }, [donationRows, searchTerm, selectedClass]);

  const donationsByClassData = useMemo(() => {
    const accumulator = new Map<string, number>();
    donationRows.forEach((row) => {
      const key = row.className || "Não informado";
      accumulator.set(key, (accumulator.get(key) ?? 0) + row.totalQuantity);
    });

    return Array.from(accumulator.entries())
      .map(([className, total]) => ({ className, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [donationRows]);

  const ticketRows = useMemo<TicketRow[]>(() => {
    return tickets.map((ticket) => {
      const rawClass =
        ticket.studentClass ||
        (ticket as Ticket & { turma?: string; className?: string }).turma ||
        (ticket as Ticket & { turma?: string; className?: string }).className ||
        "Não informado";

      return {
        id: ticket.id,
        code: ticket.code,
        status: ticket.status,
        className: rawClass,
      };
    });
  }, [tickets]);

  const filteredTicketRows = useMemo(() => {
    if (!ticketQuery.trim()) return [];
    const normalized = ticketQuery.trim().toLowerCase();
    return ticketRows
      .filter((row) => row.code?.toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [ticketRows, ticketQuery]);

  const publicAuditLogs = useMemo(() => {
    return auditLogs
      .filter((log) => !log.sensitive)
      .map((log) => {
        const date = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date();
        return {
          id: log.id,
          action: log.action,
          entity: log.entity,
          timestamp: date,
        };
      });
  }, [auditLogs]);

  const onSubmit = async (data: ContestacaoFormData) => {
    try {
      await createContestacao(data);
      toast({
        title: "Contestação enviada",
        description: "Recebemos a sua solicitação. A coordenação retornará em breve.",
      });
      reset();
    } catch (error) {
      console.error("TransparencyPage:contestacao", error);
      toast({
        variant: "destructive",
        title: "Não foi possível enviar",
        description: "Tente novamente em instantes ou contate a coordenação.",
      });
    }
  };

  const isLoading = donationsLoading || ticketsLoading || auditLoading || settingsLoading;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-6 inline-flex items-center gap-2 border-slate-200 bg-white text-slate-700">
            <ShieldCheck className="h-4 w-4" /> Portal da Transparência
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Acompanhe os resultados da campanha em tempo real
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Visualize doações, monitore códigos de rifas e envie solicitações de revisão em um painel pensado para ser simples e direto.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-slate-700">Carregando informações oficiais...</span>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            <section>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-slate-200 bg-white shadow-none transition hover:border-slate-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Doações registradas</CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(donations.length)}</p>
                    <p className="text-xs text-slate-500">Total consolidado de contribuições lançadas</p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-white shadow-none transition hover:border-slate-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Itens contabilizados</CardTitle>
                    <Search className="h-5 w-5 text-sky-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(totalItems)}</p>
                    <p className="text-xs text-slate-500">Soma de itens registrados em todas as doações</p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-white shadow-none transition hover:border-slate-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Estimativa em kg</CardTitle>
                    <Scale className="h-5 w-5 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-slate-900">{formatNumber(estimatedWeight, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</p>
                    <p className="text-xs text-slate-500">Conversão estimada considerando unidades e pesos médios</p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-white shadow-none transition hover:border-slate-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Meta mensal</CardTitle>
                    <Target className="h-5 w-5 text-rose-500" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-semibold text-slate-900">{formatNumber(goalProgress, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}%</p>
                      <span className="text-xs text-slate-500">de {goalValue ? `${formatNumber(goalValue)} itens` : "meta em configuração"}</span>
                    </div>
                    <Progress value={goalProgress} className="h-2" />
                    {goalValue > 0 && (
                      <p className="text-xs text-slate-500">
                        Restam <span className="font-medium text-slate-700">{formatNumber(remainingGoal)}</span> itens para alcançar a meta do mês.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

              <section className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 border border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle>Como encontrar seu código</CardTitle>
                    <CardDescription>
                      Consulte os comprovantes impressos ou digitais para localizar rapidamente o código do seu bilhete.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-700">Localização do código</p>
                      <p className="mt-2 text-slate-600">
                        O código da rifa fica destacado na parte superior direita do bilhete. Em comprovantes digitais, ele aparece logo após o texto “Código da rifa”.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-700">Prazos para contestação</p>
                      <p className="mt-2 text-slate-600">
                        Envie solicitações de revisão em até 7 dias após a divulgação parcial dos resultados ou até 48 horas antes do sorteio oficial.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-700">Contato da coordenação</p>
                      <p className="mt-2 text-slate-600">
                        Em caso de dúvidas, escreva para <Link href="mailto:coordenacao@christmaster.com.br" className="font-medium text-primary hover:underline">coordenacao@christmaster.com.br</Link> ou envie mensagem para (81) 99999-0000.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle>Distribuição por turma</CardTitle>
                    <CardDescription>Turmas com maior volume de itens registrados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {donationsByClassData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={donationsByClassData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="className" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                            <Tooltip
                              cursor={{ fill: "rgba(59,130,246,0.08)" }}
                              formatter={(value: number) => `${formatNumber(value)} itens`}
                            />
                            <Bar dataKey="total" fill="rgba(59,130,246,0.85)" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Ainda não há dados suficientes para gerar o gráfico.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Doações registradas</h2>
                    <p className="text-sm text-slate-600">Informações pessoais são anonimizadas para preservar a privacidade.</p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative md:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Buscar por participante"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="rounded-full border-slate-200 bg-white pl-9"
                      />
                    </div>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="rounded-full border-slate-200 md:w-48">
                        <SelectValue placeholder="Filtrar por turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as turmas</SelectItem>
                        {classOptions.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Turma/Série</TableHead>
                        <TableHead>Participante</TableHead>
                        <TableHead>Itens registrados</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                            Nenhuma doação encontrada com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDonations.map((donation) => (
                          <TableRow key={donation.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-700">{donation.className}</TableCell>
                            <TableCell className="text-slate-700">{donation.displayName}</TableCell>
                            <TableCell className="text-slate-600">{donation.productSummary || "Itens diversos"}</TableCell>
                            <TableCell className="font-semibold text-slate-700">{formatNumber(donation.totalQuantity)}</TableCell>
                            <TableCell className="text-slate-600">{formatDate(donation.date)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle>Consulta de rifas e bilhetes</CardTitle>
                    <CardDescription>Informe o código do bilhete para verificar o status e a turma vinculada.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        placeholder="Digite o código da rifa"
                        value={ticketQuery}
                        onChange={(event) => setTicketQuery(event.target.value)}
                        className="rounded-full border-slate-200"
                      />
                      <Button variant="secondary" className="gap-2" onClick={() => setTicketQuery(ticketQuery.trim())}>
                        Pesquisar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {ticketQuery.trim() === "" ? (
                        <p className="text-sm text-slate-500">Digite um código válido para visualizar o resultado.</p>
                      ) : filteredTicketRows.length > 0 ? (
                        filteredTicketRows.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-700">Código {ticket.code}</p>
                              <p className="text-xs text-slate-500">Turma associada: {ticket.className}</p>
                            </div>
                            <Badge
                              variant={ticket.status?.toLowerCase() === "confirmado" ? "default" : ticket.status?.toLowerCase() === "pendente" ? "secondary" : "outline"}
                              className="capitalize"
                            >
                              {ticket.status || "Sem status"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                          Nenhum bilhete foi localizado com esse código. Revise os caracteres ou entre em contato com a coordenação.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle>Histórico resumido</CardTitle>
                    <CardDescription>Últimos registros de auditoria não sensíveis do sistema.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {publicAuditLogs.length === 0 ? (
                      <p className="text-sm text-slate-500">Ainda não há registros públicos disponíveis.</p>
                    ) : (
                      <ul className="space-y-3">
                        {publicAuditLogs.map((log) => (
                          <li key={log.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                                <p className="text-xs text-slate-500">Referência: {log.entity}</p>
                              </div>
                              <span className="text-xs font-medium text-slate-500">{formatDate(log.timestamp)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle>Formulário público de contestação</CardTitle>
                    <CardDescription>Encontrou algum dado incorreto? Envie sua contestação e retornaremos com a atualização necessária.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          placeholder="Como deseja ser identificado"
                          className="border-slate-200"
                          {...register("nome", { required: "Informe seu nome" })}
                        />
                        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contato">Contato</Label>
                        <Input
                          id="contato"
                          placeholder="WhatsApp ou e-mail"
                          className="border-slate-200"
                          {...register("contato", { required: "Informe um contato para retorno" })}
                        />
                        {errors.contato && <p className="text-xs text-destructive">{errors.contato.message}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="codigoRifa">Código da rifa/bilhete</Label>
                          <Input
                            id="codigoRifa"
                            placeholder="Ex: CM-1234"
                            className="border-slate-200"
                            {...register("codigoRifa", { required: "Informe o código da rifa" })}
                          />
                          {errors.codigoRifa && <p className="text-xs text-destructive">{errors.codigoRifa.message}</p>}
                        </div>
                        <div className="hidden md:block" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="descricao">Descreva o que aconteceu</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Explique o motivo da contestação com o máximo de detalhes possível"
                          className="min-h-[140px] border-slate-200"
                          {...register("descricao", { required: "Descreva a situação para podermos ajudar" })}
                        />
                        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                          Os dados são enviados diretamente para a coordenação e tratados com confidencialidade.
                        </p>
                        <Button type="submit" className="min-w-[180px] gap-2" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                            </>
                          ) : (
                            <>
                              Enviar contestação <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}
      </div>
    </main>
  );
}
