import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Download, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data: reservations = [] } = trpc.reservations.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: toys = [] } = trpc.toys.list.useQuery();
  const { data: income = [] } = trpc.financial.getIncome.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const { data: expenses = [] } = trpc.financial.getExpenses.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Calculate metrics
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").length;
  const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  // Recent reservations
  const recentReservations = reservations.slice(0, 5);

  // Chart data - Revenue by day
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayIncome = income.filter(
      (inc) =>
        new Date(inc.incomeDate).toDateString() === date.toDateString()
    );
    return {
      date: format(date, "dd/MM", { locale: ptBR }),
      revenue: dayIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0),
    };
  });

  // Chart data - Status distribution
  const statusData = [
    {
      name: "Confirmadas",
      value: confirmedReservations,
      color: "#10b981",
    },
    {
      name: "Pendentes",
      value: reservations.filter((r) => r.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Concluídas",
      value: reservations.filter((r) => r.status === "completed").length,
      color: "#3b82f6",
    },
    {
      name: "Canceladas",
      value: reservations.filter((r) => r.status === "cancelled").length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle de aluguel de brinquedos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalReservations}</div>
            <p className="mt-2 text-xs text-green-600">
              +{confirmedReservations} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brinquedos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{toys.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {toys.filter((t) => !t.isUnderMaintenance).length} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {netProfit.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Receita - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita nos Últimos 7 Dias</CardTitle>
            <CardDescription>Evolução diária de receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Reservas por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Reservas Recentes</CardTitle>
          <CardDescription>Últimas reservas cadastradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Data do Evento
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-border hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm text-foreground">#{reservation.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      Cliente {reservation.clientId}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(reservation.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      R$ {parseFloat(reservation.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          reservation.status === "confirmed"
                            ? "default"
                            : reservation.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {reservation.status === "confirmed"
                          ? "Confirmada"
                          : reservation.status === "completed"
                            ? "Concluída"
                            : reservation.status === "pending"
                              ? "Pendente"
                              : "Cancelada"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
