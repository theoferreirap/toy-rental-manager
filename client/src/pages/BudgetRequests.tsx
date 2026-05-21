import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Mail, MapPin, Calendar, DollarSign, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BudgetRequests() {
  const { data: budgetRequests = [], refetch } = trpc.budgetRequests.list.useQuery();
  const deleteMutation = trpc.budgetRequests.delete.useMutation();
  const updateMutation = trpc.budgetRequests.update.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<(typeof budgetRequests)[0] | null>(null);

  const filteredRequests = budgetRequests.filter((req) => {
    const matchesSearch =
      req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta solicitação?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Solicitação deletada com sucesso");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar solicitação");
      }
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        status: status as any,
      });
      toast.success("Status atualizado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleContactViaWhatsApp = (request: (typeof budgetRequests)[0]) => {
    const selectedToys = JSON.parse(request.selectedToys as string);
    const message = `Olá ${request.clientName}! Recebemos sua solicitação de orçamento para:\n\n${selectedToys
      .map((t: any) => `- Brinquedo ID ${t.toyId} (${t.quantity}x)`)
      .join("\n")}\n\nData do evento: ${request.eventDate}\nValor estimado: R$ ${request.totalEstimatedValue}\n\nEm breve entraremos em contato com detalhes!`;

    window.open(`https://wa.me/${request.clientWhatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    contacted: "bg-blue-100 text-blue-800",
    quoted: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    contacted: "Contatado",
    quoted: "Orçado",
    accepted: "Aceito",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Solicitações de Orçamento</h1>
        <p className="text-muted-foreground">
          Gerencie todas as solicitações de orçamento dos clientes
        </p>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="form-label">Buscar por Nome ou Email</label>
              <Input
                className="form-input"
                placeholder="Digite o nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Filtrar por Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="quoted">Orçado</SelectItem>
                  <SelectItem value="accepted">Aceito</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter
                  ? "Nenhuma solicitação encontrada"
                  : "Nenhuma solicitação de orçamento"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="card-elevated">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Client Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">{request.clientName}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {request.clientEmail}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {request.clientWhatsapp}
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Evento</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.eventDate).toLocaleDateString("pt-BR")}
                      </div>
                      {request.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {request.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Value & Status */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Valor</div>
                    <div className="text-lg font-bold text-green-600">
                      R$ {parseFloat(request.totalEstimatedValue || "0").toFixed(2)}
                    </div>
                    <Badge className={statusColors[request.status] || ""}>
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      {selectedRequest?.id === request.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes da Solicitação</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Cliente</h4>
                              <p>{selectedRequest.clientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedRequest.clientEmail}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Evento</h4>
                              <p>
                                {new Date(selectedRequest.eventDate).toLocaleDateString("pt-BR")}
                                {selectedRequest.eventEndDate &&
                                  ` até ${new Date(
                                    selectedRequest.eventEndDate
                                  ).toLocaleDateString("pt-BR")}`}
                              </p>
                              {selectedRequest.location && (
                                <p className="text-sm text-muted-foreground">
                                  {selectedRequest.location}
                                </p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">Brinquedos Solicitados</h4>
                              <ul className="space-y-1 text-sm">
                                {JSON.parse(selectedRequest.selectedToys as string).map(
                                  (toy: any, idx: number) => (
                                    <li key={idx}>
                                      - Brinquedo ID {toy.toyId} ({toy.quantity}x)
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            {selectedRequest.additionalNotes && (
                              <div>
                                <h4 className="font-semibold">Observações</h4>
                                <p className="text-sm">{selectedRequest.additionalNotes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactViaWhatsApp(request)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>

                    <Select
                      value={request.status}
                      onValueChange={(value) => handleUpdateStatus(request.id, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="contacted">Contatado</SelectItem>
                        <SelectItem value="quoted">Orçado</SelectItem>
                        <SelectItem value="accepted">Aceito</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
