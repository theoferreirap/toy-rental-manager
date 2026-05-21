import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, MessageCircle, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Contracts() {
  const { data: contracts = [], refetch } = trpc.contracts.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: reservations = [] } = trpc.reservations.list.useQuery();
  const createContract = trpc.contracts.create.useMutation();
  const updateContract = trpc.contracts.update.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    reservationId: "",
    contractDate: format(new Date(), "yyyy-MM-dd"),
    eventDate: "",
    deliveryAddress: "",
    eventAddress: "",
    totalAmount: "0",
    depositAmount: "0",
    terms: "",
  });

  const filteredContracts = contracts.filter((c) => {
    const client = clients.find((cl) => cl.id === c.clientId);
    return client?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contractNumber = `CONT-${Date.now()}`;
      await createContract.mutateAsync({
        clientId: parseInt(formData.clientId),
        reservationId: formData.reservationId ? parseInt(formData.reservationId) : undefined,
        contractNumber,
        contractDate: new Date(formData.contractDate),
        eventDate: new Date(formData.eventDate),
        deliveryAddress: formData.deliveryAddress,
        eventAddress: formData.eventAddress,
        totalAmount: formData.totalAmount,
        depositAmount: formData.depositAmount,
        terms: formData.terms,
      });
      toast.success("Contrato criado com sucesso!");
      setIsDialogOpen(false);
      setFormData({
        clientId: "",
        reservationId: "",
        contractDate: format(new Date(), "yyyy-MM-dd"),
        eventDate: "",
        deliveryAddress: "",
        eventAddress: "",
        totalAmount: "0",
        depositAmount: "0",
        terms: "",
      });
      refetch();
    } catch (error) {
      toast.error("Erro ao criar contrato");
    }
  };

  const handleSendWhatsApp = (contract: (typeof contracts)[0]) => {
    const client = clients.find((c) => c.id === contract.clientId);
    if (client?.whatsapp) {
      const message = `Olá ${client.name}! Segue seu contrato #${contract.contractNumber} para o evento de ${format(new Date(contract.eventDate), "dd/MM/yyyy", { locale: ptBR })}. Valor total: R$ ${parseFloat(contract.totalAmount).toFixed(2)}`;
      window.open(
        `https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      updateContract.mutate({ id: contract.id, sentViaWhatsapp: true });
    }
  };

  const handleGeneratePDF = (contract: (typeof contracts)[0]) => {
    const client = clients.find((c) => c.id === contract.clientId);
    const pdfContent = `
      CONTRATO DE ALUGUEL DE BRINQUEDOS
      
      Contrato Nº: ${contract.contractNumber}
      Data: ${format(new Date(contract.contractDate), "dd/MM/yyyy", { locale: ptBR })}
      
      CONTRATANTE:
      Nome: ${client?.name}
      Email: ${client?.email}
      Telefone: ${client?.phone}
      Endereço: ${client?.address}
      
      CONTRATADA:
      [Dados da Empresa]
      
      EVENTO:
      Data: ${format(new Date(contract.eventDate), "dd/MM/yyyy", { locale: ptBR })}
      Local: ${contract.eventAddress}
      Endereço de Entrega: ${contract.deliveryAddress}
      
      VALORES:
      Total: R$ ${parseFloat(contract.totalAmount).toFixed(2)}
      Sinal/Depósito: R$ ${parseFloat(contract.depositAmount).toFixed(2)}
      Saldo: R$ ${(parseFloat(contract.totalAmount) - parseFloat(contract.depositAmount)).toFixed(2)}
      
      TERMOS E CONDIÇÕES:
      ${contract.terms}
      
      Assinado digitalmente em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
    `;
    
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${contract.contractNumber}.txt`;
    a.click();
    toast.success("Contrato baixado com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      sent: "Enviado",
      signed: "Assinado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gerencie contratos digitais com assinatura</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Contrato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <label className="form-label">Reserva (Opcional)</label>
                  <Select value={formData.reservationId} onValueChange={(v) => setFormData({ ...formData, reservationId: v })}>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Selecione uma reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservations.map((res) => (
                        <SelectItem key={res.id} value={res.id.toString()}>
                          {format(new Date(res.eventDate), "dd/MM/yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Data do Contrato</label>
                  <Input
                    className="form-input"
                    type="date"
                    value={formData.contractDate}
                    onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <label className="form-label">Endereço de Entrega</label>
                <Input
                  className="form-input"
                  placeholder="Rua, número, complemento"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Local do Evento *</label>
                <Input
                  className="form-input"
                  placeholder="Rua, número, complemento"
                  value={formData.eventAddress}
                  onChange={(e) => setFormData({ ...formData, eventAddress: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="space-y-2">
                <label className="form-label">Termos e Condições</label>
                <textarea
                  className="form-textarea"
                  placeholder="Digite os termos do contrato..."
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Contrato
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

      {/* Contracts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredContracts.map((contract) => {
          const client = clients.find((c) => c.id === contract.clientId);
          return (
            <Card key={contract.id} className="card-elevated flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contract.contractNumber}</CardTitle>
                    <CardDescription className="mt-1">{client?.name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {getStatusLabel(contract.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data do Evento:</span>
                    <span className="font-medium">
                      {format(new Date(contract.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-semibold text-green-600">
                      R$ {parseFloat(contract.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sinal:</span>
                    <span className="font-medium">
                      R$ {parseFloat(contract.depositAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {contract.status === "signed" && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Assinado digitalmente
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  {client?.whatsapp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSendWhatsApp(contract)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleGeneratePDF(contract)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum contrato encontrado" : "Nenhum contrato cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
