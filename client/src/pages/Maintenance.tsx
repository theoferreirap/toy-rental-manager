import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Maintenance() {
  const { data: maintenance = [], refetch } = trpc.maintenance.list.useQuery();
  const { data: toys = [] } = trpc.toys.list.useQuery();
  const createMaintenance = trpc.maintenance.create.useMutation();
  const updateMaintenance = trpc.maintenance.update.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    toyId: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    expectedEndDate: "",
    reason: "",
    description: "",
    cost: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaintenance.mutateAsync({
        toyId: parseInt(formData.toyId),
        startDate: new Date(formData.startDate),
        expectedEndDate: formData.expectedEndDate ? new Date(formData.expectedEndDate) : undefined,
        reason: formData.reason,
        description: formData.description,
        cost: formData.cost,
      });
      toast.success("Manutenção registrada com sucesso!");
      setIsDialogOpen(false);
      setFormData({
        toyId: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        expectedEndDate: "",
        reason: "",
        description: "",
        cost: "0",
      });
      refetch();
    } catch (error) {
      toast.error("Erro ao registrar manutenção");
    }
  };

  const handleCompleteMaintenance = async (id: number) => {
    try {
      await updateMaintenance.mutateAsync({
        id,
        status: "completed",
        actualEndDate: new Date(),
      });
      toast.success("Manutenção concluída!");
      refetch();
    } catch (error) {
      toast.error("Erro ao concluir manutenção");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Agendada",
      in_progress: "Em Progresso",
      completed: "Concluída",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Wrench className="h-5 w-5 text-blue-600" />;
      case "scheduled":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const activeMaintenance = maintenance.filter((m) => m.status !== "completed" && m.status !== "cancelled");
  const completedMaintenance = maintenance.filter((m) => m.status === "completed" || m.status === "cancelled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manutenção</h1>
          <p className="text-muted-foreground">Gerencie a manutenção dos brinquedos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Manutenção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Brinquedo *</label>
                <Select value={formData.toyId} onValueChange={(v) => setFormData({ ...formData, toyId: v })}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Selecione um brinquedo" />
                  </SelectTrigger>
                  <SelectContent>
                    {toys.map((toy) => (
                      <SelectItem key={toy.id} value={toy.id.toString()}>
                        {toy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Data de Início *</label>
                  <Input
                    className="form-input"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Data Prevista de Término</label>
                  <Input
                    className="form-input"
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Motivo da Manutenção *</label>
                <Input
                  className="form-input"
                  placeholder="Ex: Reparo de vazamento"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detalhes da manutenção..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Custo (R$)</label>
                <Input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Registrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Maintenance */}
      {activeMaintenance.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Manutenções Ativas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMaintenance.map((maint) => {
              const toy = toys.find((t) => t.id === maint.toyId);
              return (
                <Card key={maint.id} className="card-elevated">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{toy?.name}</CardTitle>
                        <CardDescription className="mt-1">{maint.reason}</CardDescription>
                      </div>
                      {getStatusIcon(maint.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className={getStatusColor(maint.status)}>
                      {getStatusLabel(maint.status)}
                    </Badge>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Início:</span>
                        <span className="font-medium">
                          {format(new Date(maint.startDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      {maint.expectedEndDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Término Previsto:</span>
                          <span className="font-medium">
                            {format(new Date(maint.expectedEndDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      {maint.cost && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Custo:</span>
                          <span className="font-semibold text-red-600">
                            R$ {parseFloat(maint.cost).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {maint.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {maint.description}
                      </p>
                    )}

                    {maint.status !== "completed" && maint.status !== "cancelled" && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleCompleteMaintenance(maint.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como Concluída
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Maintenance */}
      {completedMaintenance.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Histórico de Manutenção</h2>
          <Card className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brinquedo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Motivo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Período</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Custo</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedMaintenance.map((maint) => {
                    const toy = toys.find((t) => t.id === maint.toyId);
                    return (
                      <tr key={maint.id} className="border-b border-border hover:bg-muted/20">
                        <td className="px-4 py-3 text-sm font-medium">{toy?.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{maint.reason}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(maint.startDate), "dd/MM/yyyy", { locale: ptBR })}
                          {maint.actualEndDate && (
                            <> até {format(new Date(maint.actualEndDate), "dd/MM/yyyy", { locale: ptBR })}</>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          R$ {parseFloat(maint.cost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={getStatusColor(maint.status)}>
                            {getStatusLabel(maint.status)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {maintenance.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma manutenção registrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
