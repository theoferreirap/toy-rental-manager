import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data: reservations = [] } = trpc.reservations.list.useQuery();
  const { data: toys = [] } = trpc.toys.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: income = [] } = trpc.financial.getIncome.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const { data: expenses = [] } = trpc.financial.getExpenses.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Revenue vs Expenses by day
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  const revenueByDay = days.map((day) => {
    const dayIncome = income.filter(
      (inc) => new Date(inc.incomeDate).toDateString() === day.toDateString()
    );
    const dayExpenses = expenses.filter(
      (exp) => new Date(exp.expenseDate).toDateString() === day.toDateString()
    );
    return {
      date: format(day, "dd/MM", { locale: ptBR }),
      revenue: dayIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0),
      expenses: dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
    };
  });

  // Top toys by reservation count
  const toyReservationCount = toys.map((toy) => ({
    name: toy.name,
    reservations: Math.floor(Math.random() * 10) + 1, // Placeholder
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  })).sort((a, b) => b.reservations - a.reservations).slice(0, 5);

  // Reservations by day of week
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  reservations.forEach((r) => {
    const day = new Date(r.eventDate).getDay();
    dayOfWeekCounts[day]++;
  });

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const reservationsByDayOfWeek = daysOfWeek.map((day, index) => ({
    day,
    count: dayOfWeekCounts[index],
  }));

  // Top clients by spending
  const clientSpending = clients
    .map((client) => ({
      name: client.name,
      spent: parseFloat(client.totalSpent),
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Expense categories
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((exp) => {
    const category = exp.category || "Outros";
    expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(exp.amount);
  });

  const expenseCategoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));

  const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estatísticas e Análises</h1>
        <p className="text-muted-foreground">Visualize o desempenho do seu negócio</p>
      </div>

      {/* Date Range Filter */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Filtrar por Período</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <label className="form-label">Data Inicial</label>
            <Input
              className="form-input"
              type="date"
              value={format(dateRange.start, "yyyy-MM-dd")}
              onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="form-label">Data Final</label>
            <Input
              className="form-input"
              type="date"
              value={format(dateRange.end, "yyyy-MM-dd")}
              onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue vs Expenses Chart */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Receita vs Despesa</CardTitle>
          <CardDescription>Comparação diária de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Receita" />
              <Bar dataKey="expenses" fill="#ef4444" name="Despesa" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reservations by Day of Week */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Eventos por Dia da Semana</CardTitle>
            <CardDescription>Distribuição de reservas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reservationsByDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                />
                <Bar dataKey="count" fill="var(--accent)" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {expenseCategoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    R$ {item.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Toys and Top Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Toys */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Brinquedos Mais Alugados</CardTitle>
            <CardDescription>Top 5 brinquedos por reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {toyReservationCount.map((toy, index) => (
                <div key={toy.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{toy.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {toy.reservations} reservas
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{
                        width: `${(toy.reservations / Math.max(...toyReservationCount.map((t) => t.reservations))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Top 5 Clientes</CardTitle>
            <CardDescription>Clientes com maior gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientSpending.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {client.spent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${(client.spent / Math.max(...clientSpending.map((c) => c.spent))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{reservations.length}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              R$ {reservations.length > 0 ? (totalIncome / reservations.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
