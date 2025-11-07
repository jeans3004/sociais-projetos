"use client";

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
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

const donationEntries = [
  {
    id: "#1287",
    student: "Maria Fernanda Lima",
    className: "6º Ano B",
    tickets: 12,
    status: "Confirmada",
  },
  {
    id: "#1286",
    student: "Pedro Henrique Souza",
    className: "5º Ano A",
    tickets: 8,
    status: "Confirmada",
  },
  {
    id: "#1285",
    student: "Ana Clara Moretti",
    className: "6º Ano A",
    tickets: 10,
    status: "Pendente",
  },
  {
    id: "#1284",
    student: "Lívia Barros",
    className: "7º Ano C",
    tickets: 6,
    status: "Confirmada",
  },
];

const summaryCards = [
  {
    title: "Doações confirmadas",
    value: "128",
    description: "12 novas na última semana",
    icon: Ticket,
  },
  {
    title: "Participantes únicos",
    value: "87",
    description: "Metade da meta alcançada",
    icon: Users,
  },
  {
    title: "Campanha ativa",
    value: "Rifa de Inverno",
    description: "Sorteio agendado para 30/06",
    icon: Sparkles,
  },
];

const campaignHistory = [
  {
    title: "Campanha de Páscoa",
    date: "Março 2024",
    result: "Arrecadado R$ 6.530",
  },
  {
    title: "Volta às Aulas",
    date: "Fevereiro 2024",
    result: "Arrecadado R$ 5.890",
  },
  {
    title: "Natal Solidário",
    date: "Dezembro 2023",
    result: "Arrecadado R$ 7.120",
  },
];

const activeCampaigns = [
  {
    name: "Rifa de Inverno",
    progress: "68% das metas alcançadas",
    tickets: "842 rifas vendidas",
  },
  {
    name: "Campanha Beneficente do 5º Ano",
    progress: "Em fase de divulgação",
    tickets: "Planejamento de 500 rifas",
  },
];

const masterEntries = [
  {
    title: "Planilha geral",
    description: "Resumo atualizado das rifas distribuídas por turma",
  },
  {
    title: "Comprovantes",
    description: "Uploads pendentes para conferência",
  },
];

const drawEntries = [
  {
    title: "Campanha de Páscoa",
    date: "Sorteio realizado em 31/03",
    winner: "Ganhador: Família Silva",
  },
  {
    title: "Natal Solidário",
    date: "Sorteio realizado em 22/12",
    winner: "Ganhador: Família Costa",
  },
];

export default function RifaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Rifa — Controle de Participações e Sorteio
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe as doações registradas, distribua rifas e organize os
            sorteios de cada campanha.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="gap-2">
            <ArrowUpRight className="h-4 w-4" /> Ver ranking
          </Button>
          <Button className="gap-2">
            <Ticket className="h-4 w-4" /> Registrar doação
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-dashed">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
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

      <Card>
        <CardHeader className="space-y-4 md:flex md:items-start md:justify-between md:space-y-0">
          <div>
            <CardTitle>Doações realizadas</CardTitle>
            <CardDescription>
              Relatório completo das participações registradas na campanha atual.
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
          <Tabs defaultValue="doacoes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="doacoes">Doações realizadas</TabsTrigger>
              <TabsTrigger value="lista">Lista mestre de rifas</TabsTrigger>
              <TabsTrigger value="sorteios">Sorteios realizados</TabsTrigger>
            </TabsList>
            <TabsContent value="doacoes" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">ID</TableHead>
                      <TableHead className="whitespace-nowrap">Aluno</TableHead>
                      <TableHead className="whitespace-nowrap">Turma</TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        Qtd. Rifas
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donationEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.student}</TableCell>
                        <TableCell>{entry.className}</TableCell>
                        <TableCell className="text-right">{entry.tickets}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.status === "Confirmada" ? "secondary" : "outline"
                            }
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="lista" className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Confira a consolidação das rifas distribuídas por turma e
                responsável. Atualize a planilha a cada nova confirmação.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {masterEntries.map((entry) => (
                  <div
                    key={entry.title}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {entry.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="sorteios" className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Histórico dos sorteios concluídos, com registro dos ganhadores e
                datas de realização.
              </div>
              <div className="space-y-3">
                {drawEntries.map((entry) => (
                  <div
                    key={entry.title}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                      <p className="text-sm text-muted-foreground">{entry.winner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de campanhas</CardTitle>
            <CardDescription>
              Resultados alcançados nas campanhas anteriores com registro das
              arrecadações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignHistory.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-muted/30 p-4 text-sm"
              >
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-muted-foreground">{item.date}</p>
                <p className="text-muted-foreground">{item.result}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanhas em andamento</CardTitle>
            <CardDescription>
              Status resumido das campanhas que estão recebendo doações no momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {campaign.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {campaign.progress}
                  </p>
                  <p className="text-sm text-muted-foreground">{campaign.tickets}</p>
                </div>
                <Badge variant="secondary">Ativa</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
