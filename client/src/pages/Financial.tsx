import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Financial() {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data: income = [], refetch: refetchIncome } = trpc.financial.getIncome.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const { data: expenses = [], refetch: refetchExpenses } = trpc.financial.getExpenses.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const createIncome = trpc.financial.createIncome.useMutation();
  const createExpense = trpc.financial.createExpense.useMutation();

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    description: "",
    amount: "",
    incomeDate: format(new Date(), "yyyy-MM-dd"),
    category: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    expenseDate: format(new Date(), "yyyy-MM-dd"),
    category: "",
    paymentMethod: "",
  });

  const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncome.mutateAsync({
        description: incomeForm.description,
        amount: incomeForm.amount,
        incomeDate: new Date(incomeForm.incomeDate),
        category: incomeForm.category,
      });
      toast.success("Receita adicionada com sucesso!");
      setIsIncomeDialogOpen(false);
      setIncomeForm({
        description: "",
        amount: "",
        incomeDate: format(new Date(), "yyyy-MM-dd"),
        category: "",
      });
      refetchIncome();
    } catch (error) {
      toast.error("Erro ao adicionar receita");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense.mutateAsync({
        description: expenseForm.description,
        amount: expenseForm.amount,
        expenseDate: new Date(expenseForm.expenseDate),
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod,
      });
      toast.success("Despesa adicionada com sucesso!");
      setIsExpenseDialogOpen(false);
      setExpenseForm({
        description: "",
        amount: "",
        expenseDate: format(new Date(), "yyyy-MM-dd"),
        category: "",
        paymentMethod: "",
      });
      refetchExpenses();
    } catch (error) {
      toast.error("Erro ao adicionar despesa");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
        <p className="text-muted-foreground">Controle suas receitas e despesas</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
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
              {income.length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesa Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {totalExpenses.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {expenses.length} lançamentos
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
              Período: {format(dateRange.start, "dd/MM", { locale: ptBR })} - {format(dateRange.end, "dd/MM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
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
          <Button variant="outline">Aplicar Filtro</Button>
        </CardContent>
      </Card>

      {/* Income and Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Receitas</h2>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Receita</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="space-y-2">
                    <label className="form-label">Descrição *</label>
                    <Input
                      className="form-input"
                      placeholder="Ex: Aluguel de brinquedos"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Valor (R$) *</label>
                    <Input
                      className="form-input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Data</label>
                    <Input
                      className="form-input"
                      type="date"
                      value={incomeForm.incomeDate}
                      onChange={(e) => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Categoria</label>
                    <Input
                      className="form-input"
                      placeholder="Ex: Aluguel"
                      value={incomeForm.category}
                      onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsIncomeDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {income.length > 0 ? (
              income.map((inc) => (
                <Card key={inc.id} className="card-elevated">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <p className="font-medium text-foreground">{inc.description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(inc.incomeDate), "dd/MM/yyyy", { locale: ptBR })}
                          {inc.category && ` • ${inc.category}`}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        R$ {parseFloat(inc.amount).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma receita cadastrada
              </p>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Despesas</h2>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Despesa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <label className="form-label">Descrição *</label>
                    <Input
                      className="form-input"
                      placeholder="Ex: Manutenção de brinquedos"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Valor (R$) *</label>
                    <Input
                      className="form-input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Data</label>
                    <Input
                      className="form-input"
                      type="date"
                      value={expenseForm.expenseDate}
                      onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="form-label">Categoria</label>
                      <Input
                        className="form-input"
                        placeholder="Ex: Manutenção"
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">Método de Pagamento</label>
                      <Input
                        className="form-input"
                        placeholder="Ex: Cartão"
                        value={expenseForm.paymentMethod}
                        onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsExpenseDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <Card key={exp.id} className="card-elevated">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <p className="font-medium text-foreground">{exp.description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(exp.expenseDate), "dd/MM/yyyy", { locale: ptBR })}
                          {exp.category && ` • ${exp.category}`}
                        </p>
                      </div>
                      <p className="font-semibold text-red-600">
                        R$ {parseFloat(exp.amount).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma despesa cadastrada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
