import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, MessageCircle, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reservations() {
  const { data: reservations = [], refetch } = trpc.reservations.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createReservation = trpc.reservations.create.useMutation();
  const updateReservation = trpc.reservations.update.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<(typeof reservations)[0] | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    eventDate: "",
    eventTime: "",
    eventAddress: "",
    eventCity: "",
    deliveryFee: "0",
    totalAmount: "0",
    depositAmount: "0",
    remainingAmount: "0",
    notes: "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((r) => {
      const resDate = new Date(r.eventDate);
      return resDate.toDateString() === day.toDateString();
    });
  };

  const filteredReservations = reservations.filter((r) => {
    const client = clients.find((c) => c.id === r.clientId);
    return client?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReservation) {
        await updateReservation.mutateAsync({
          id: editingReservation.id,
          notes: formData.notes,
        });
        toast.success("Reserva atualizada com sucesso!");
      } else {
        await createReservation.mutateAsync({
          clientId: parseInt(formData.clientId),
          eventDate: new Date(formData.eventDate),
          eventTime: formData.eventTime,
          eventAddress: formData.eventAddress,
          eventCity: formData.eventCity,
          deliveryFee: formData.deliveryFee,
          totalAmount: formData.totalAmount,
          depositAmount: formData.depositAmount,
          remainingAmount: formData.remainingAmount,
          notes: formData.notes,
        });
        toast.success("Reserva criada com sucesso!");
      }
      setIsDialogOpen(false);
      setFormData({
        clientId: "",
        eventDate: "",
        eventTime: "",
        eventAddress: "",
        eventCity: "",
        deliveryFee: "0",
        totalAmount: "0",
        depositAmount: "0",
        remainingAmount: "0",
        notes: "",
      });
      setEditingReservation(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar reserva");
    }
  };

  const handleEdit = (reservation: (typeof reservations)[0]) => {
    setEditingReservation(reservation);
    setFormData({
      clientId: reservation.clientId.toString(),
      eventDate: reservation.eventDate.toString(),
      eventTime: reservation.eventTime || "",
      eventAddress: reservation.eventAddress || "",
      eventCity: reservation.eventCity || "",
      deliveryFee: reservation.deliveryFee,
      totalAmount: reservation.totalAmount,
      depositAmount: reservation.depositAmount,
      remainingAmount: reservation.remainingAmount,
      notes: reservation.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReservation(null);
    setFormData({
      clientId: "",
      eventDate: "",
      eventTime: "",
      eventAddress: "",
      eventCity: "",
      deliveryFee: "0",
      totalAmount: "0",
      depositAmount: "0",
      remainingAmount: "0",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: "Confirmada",
      completed: "Concluída",
      pending: "Pendente",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground">Gerencie suas reservas e agendamentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingReservation(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? "Editar Reserva" : "Nova Reserva"}
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
                  <label className="form-label">Hora</label>
                  <Input
                    className="form-input"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Endereço do Evento</label>
                <Input
                  className="form-input"
                  placeholder="Rua, número, complemento"
                  value={formData.eventAddress}
                  onChange={(e) => setFormData({ ...formData, eventAddress: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Cidade</label>
                <Input
                  className="form-input"
                  placeholder="São Paulo"
                  value={formData.eventCity}
                  onChange={(e) => setFormData({ ...formData, eventCity: e.target.value })}
                />
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Sinal/Depósito (R$)</label>
                  <Input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Valor Restante (R$)</label>
                  <Input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={formData.remainingAmount}
                    onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
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
                  {editingReservation ? "Atualizar" : "Criar"}
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

      {/* Calendar and List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="card-elevated lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Calendário</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  →
                </Button>
              </div>
            </div>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {daysInMonth.map((day) => {
                const dayReservations = getReservationsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-lg border p-2 text-sm ${
                      isCurrentMonth ? "border-border bg-card" : "border-border/30 bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <div className="font-semibold">{format(day, "dd")}</div>
                    {dayReservations.length > 0 && (
                      <div className="mt-1 text-xs font-medium text-accent">
                        {dayReservations.length} reserva{dayReservations.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="form-input pl-10"
              placeholder="Buscar reserva..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Reservations */}
          <div className="space-y-3">
            {filteredReservations.map((reservation) => {
              const client = clients.find((c) => c.id === reservation.clientId);
              return (
                <Card key={reservation.id} className="card-elevated">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{client?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reservation.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                            {reservation.eventTime && ` às ${reservation.eventTime}`}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold">R$ {parseFloat(reservation.totalAmount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sinal</p>
                          <p className="font-semibold">R$ {parseFloat(reservation.depositAmount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Restante</p>
                          <p className="font-semibold">R$ {parseFloat(reservation.remainingAmount).toFixed(2)}</p>
                        </div>
                      </div>

                      {reservation.eventAddress && (
                        <p className="text-sm text-muted-foreground">
                          📍 {reservation.eventAddress}, {reservation.eventCity}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        {client?.whatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const message = `Olá ${client.name}! Confirmo sua reserva para ${format(new Date(reservation.eventDate), "dd/MM/yyyy")}.`;
                              window.open(
                                `https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
                                "_blank"
                              );
                            }}
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            WhatsApp
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(reservation)}
                        >
                          <Edit2 className="mr-1 h-4 w-4" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredReservations.length === 0 && (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? "Nenhuma reserva encontrada" : "Nenhuma reserva cadastrada"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
