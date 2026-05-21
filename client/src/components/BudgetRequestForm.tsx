import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SelectedToy {
  toyId: number;
  toyName: string;
  quantity: number;
  dailyPrice: number;
}

interface BudgetRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToys: SelectedToy[];
  onSubmitSuccess?: () => void;
}

export function BudgetRequestForm({
  isOpen,
  onClose,
  selectedToys: initialToys,
  onSubmitSuccess,
}: BudgetRequestFormProps) {
  const [selectedToys, setSelectedToys] = useState<SelectedToy[]>(initialToys);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientWhatsapp: "",
    eventDate: "",
    eventEndDate: "",
    location: "",
    additionalNotes: "",
  });

  const createBudgetRequest = trpc.budgetRequests.create.useMutation();

  const handleAddToy = (toy: SelectedToy) => {
    const existing = selectedToys.find((t) => t.toyId === toy.toyId);
    if (existing) {
      setSelectedToys(
        selectedToys.map((t) =>
          t.toyId === toy.toyId ? { ...t, quantity: t.quantity + 1 } : t
        )
      );
    } else {
      setSelectedToys([...selectedToys, toy]);
    }
  };

  const handleRemoveToy = (toyId: number) => {
    setSelectedToys(selectedToys.filter((t) => t.toyId !== toyId));
  };

  const handleUpdateQuantity = (toyId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveToy(toyId);
    } else {
      setSelectedToys(
        selectedToys.map((t) =>
          t.toyId === toyId ? { ...t, quantity } : t
        )
      );
    }
  };

  const totalValue = selectedToys.reduce((sum, toy) => sum + toy.dailyPrice * toy.quantity, 0);

  const handleSubmit = async () => {
    if (!formData.clientName.trim()) {
      toast.error("Digite seu nome");
      return;
    }
    if (!formData.clientEmail.trim()) {
      toast.error("Digite seu email");
      return;
    }
    if (!formData.clientWhatsapp.trim()) {
      toast.error("Digite seu WhatsApp");
      return;
    }
    if (!formData.eventDate) {
      toast.error("Selecione a data do evento");
      return;
    }
    if (selectedToys.length === 0) {
      toast.error("Selecione pelo menos um brinquedo");
      return;
    }

    try {
      await createBudgetRequest.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientWhatsapp: formData.clientWhatsapp,
        eventDate: formData.eventDate,
        eventEndDate: formData.eventEndDate || undefined,
        location: formData.location || undefined,
        selectedToys: selectedToys.map((t) => ({
          toyId: t.toyId,
          quantity: t.quantity,
        })),
        additionalNotes: formData.additionalNotes || undefined,
      });

      toast.success("Solicitação de orçamento enviada com sucesso!");
      
      // Send to WhatsApp
      const message = `Olá! Gostaria de solicitar um orçamento para:\n\n${selectedToys
        .map((t) => `- ${t.toyName} (${t.quantity}x)`)
        .join("\n")}\n\nData do evento: ${formData.eventDate}${
        formData.eventEndDate ? `\nAté: ${formData.eventEndDate}` : ""
      }${formData.location ? `\nLocal: ${formData.location}` : ""}\n\nValor estimado: R$ ${totalValue.toFixed(2)}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        clientWhatsapp: "",
        eventDate: "",
        eventEndDate: "",
        location: "",
        additionalNotes: "",
      });
      setSelectedToys([]);
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Solicitar Orçamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Toys */}
          {selectedToys.length > 0 && (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold">Brinquedos Selecionados</h3>
                <div className="space-y-3">
                  {selectedToys.map((toy) => (
                    <div
                      key={toy.toyId}
                      className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{toy.toyName}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {toy.dailyPrice.toFixed(2)}/dia
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(toy.toyId, toy.quantity - 1)
                          }
                        >
                          −
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {toy.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(toy.toyId, toy.quantity + 1)
                          }
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveToy(toy.toyId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total Estimado:</span>
                    <span className="text-green-600">
                      R$ {totalValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="form-label">Nome Completo *</label>
              <Input
                className="form-input"
                placeholder="Seu nome"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">Email *</label>
                <Input
                  className="form-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">WhatsApp *</label>
                <Input
                  className="form-input"
                  placeholder="(11) 99999-9999"
                  value={formData.clientWhatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientWhatsapp: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">Data do Evento *</label>
                <Input
                  className="form-input"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">Data de Término</label>
                <Input
                  className="form-input"
                  type="date"
                  value={formData.eventEndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventEndDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="form-label">Local do Evento</label>
              <Input
                className="form-input"
                placeholder="Endereço ou local"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="form-label">Observações Adicionais</label>
              <textarea
                className="form-input min-h-24 resize-none"
                placeholder="Informações adicionais sobre seu evento..."
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalNotes: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={createBudgetRequest.isPending}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {createBudgetRequest.isPending
                ? "Enviando..."
                : "Enviar via WhatsApp"}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={onClose}
              disabled={createBudgetRequest.isPending}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
