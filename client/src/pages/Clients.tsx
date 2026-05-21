import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit2, MessageCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Clients() {
  const { data: clients = [], refetch } = trpc.clients.list.useQuery();
  const createClient = trpc.clients.create.useMutation();
  const updateClient = trpc.clients.update.useMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<(typeof clients)[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          ...formData,
        });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createClient.mutateAsync(formData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      });
      setEditingClient(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    }
  };

  const handleEdit = (client: (typeof clients)[0]) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      whatsapp: client.whatsapp || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    });
  };

  const handleExportExcel = () => {
    const headers = ["Nome", "Email", "Telefone", "WhatsApp", "Endereço", "Cidade", "Estado", "CEP", "Total Gasto", "Reservas"];
    const rows = clients.map((client) => [
      client.name,
      client.email || "",
      client.phone || "",
      client.whatsapp || "",
      client.address || "",
      client.city || "",
      client.state || "",
      client.zipCode || "",
      parseFloat(client.totalSpent).toFixed(2),
      client.totalReservations,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Clientes exportados com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e histórico de reservas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="form-label">Nome *</label>
                    <Input
                      className="form-input"
                      placeholder="Ex: João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Email</label>
                    <Input
                      className="form-input"
                      type="email"
                      placeholder="joao@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="form-label">Telefone</label>
                    <Input
                      className="form-input"
                      placeholder="(11) 9999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">WhatsApp</label>
                    <Input
                      className="form-input"
                      placeholder="(11) 9999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="form-label">Endereço</label>
                  <Input
                    className="form-input"
                    placeholder="Rua, número, complemento"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="form-label">Cidade</label>
                    <Input
                      className="form-input"
                      placeholder="São Paulo"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Estado</label>
                    <Input
                      className="form-input"
                      placeholder="SP"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">CEP</label>
                    <Input
                      className="form-input"
                      placeholder="01310-100"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
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
                    {editingClient ? "Atualizar" : "Cadastrar"}
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
      </div>

      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="form-input pl-10"
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients Table */}
      <Card className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contato</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cidade</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Reservas</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total Gasto</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.email && (
                      <div className="truncate">{client.email}</div>
                    )}
                    {client.phone && (
                      <div className="truncate text-xs">{client.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {client.city || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {client.totalReservations}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    R$ {parseFloat(client.totalSpent).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      {client.whatsapp && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Contatar via WhatsApp"
                          onClick={() => {
                            const message = `Olá ${client.name}!`;
                            window.open(
                              `https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
                              "_blank"
                            );
                          }}
                        >
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredClients.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
