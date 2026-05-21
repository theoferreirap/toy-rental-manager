import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, MessageCircle, Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Budgets() {
  const { data: budgets = [], refetch } = trpc.budgets.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createBudget = trpc.budgets.create.useMutation();
  const updateBudget = trpc.budgets.update.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<(typeof budgets)[0] | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    eventDate: "",
    deliveryFee: "0",
    totalAmount: "0",
    validUntil: "",
    notes: "",
  });

  const filteredBudgets = budgets.filter((b) => {
    const client = clients.find((c) => c.id === b.clientId);
    return client?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetNumber = `ORC-${Date.now()}`;
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget.id,
          notes: formData.notes,
        });
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await createBudget.mutateAsync({
          clientId: parseInt(formData.clientId),
          budgetNumber,
          eventDate: new Date(formData.eventDate),
          deliveryFee: formData.deliveryFee,
          totalAmount: formData.totalAmount,
          validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
          notes: formData.notes,
        });
        toast.success("Orçamento criado com sucesso!");
      }
      setIsDialogOpen(false);
      setFormData({
        clientId: "",
        eventDate: "",
        deliveryFee: "0",
        totalAmount: "0",
        validUntil: "",
        notes: "",
      });
      setEditingBudget(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
    }
  };

  const handleEdit = (budget: (typeof budgets)[0]) => {
    setEditingBudget(budget);
    setFormData({
      clientId: budget.clientId.toString(),
      eventDate: budget.eventDate.toString(),
      deliveryFee: budget.deliveryFee,
      totalAmount: budget.totalAmount,
      validUntil: budget.validUntil?.toString() || "",
      notes: budget.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBudget(null);
    setFormData({
      clientId: "",
      eventDate: "",
      deliveryFee: "0",
      totalAmount: "0",
      validUntil: "",
      notes: "",
    });
  };

  const handleSendWhatsApp = (budget: (typeof budgets)[0]) => {
    const client = clients.find((c) => c.id === budget.clientId);
    if (client?.whatsapp) {
      const message = `Olá ${client.name}! Segue seu orçamento #${budget.budgetNumber} para o evento de ${format(new Date(budget.eventDate), "dd/MM/yyyy", { locale: ptBR })}. Valor total: R$ ${parseFloat(budget.totalAmount).toFixed(2)}`;
      window.open(
        `https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      updateBudget.mutate({ id: budget.id, sentViaWhatsapp: true });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "expired":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      sent: "Enviado",
      accepted: "Aceito",
      rejected: "Rejeitado",
      expired: "Expirado",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Crie e gerencie propostas de aluguel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBudget(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Cliente *</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Data do Evento *</label>
                  <Input
                    className="form-input"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Válido Até</label>
                  <Input
                    className="form-input"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Taxa de Entrega (R$)</label>
                  <Input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Valor Total (R$) *</label>
                  <Input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-textarea"
                  placeholder="Informações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingBudget ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="form-input pl-10"
          placeholder="Buscar orçamento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBudgets.map((budget) => {
          const client = clients.find((c) => c.id === budget.clientId);
          return (
            <Card key={budget.id} className="card-elevated flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{budget.budgetNumber}</CardTitle>
                    <CardDescription className="mt-1">{client?.name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(budget.status)}>
                    {getStatusLabel(budget.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data do Evento:</span>
                    <span className="font-medium">
                      {format(new Date(budget.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-semibold text-green-600">
                      R$ {parseFloat(budget.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  {budget.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Válido Até:</span>
                      <span className="font-medium">
                        {format(new Date(budget.validUntil), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3">
                  {client?.whatsapp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSendWhatsApp(budget)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(budget)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum orçamento encontrado" : "Nenhum orçamento cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
