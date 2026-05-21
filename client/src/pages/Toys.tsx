import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, List, Plus, Search, Trash2, Edit2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Toys() {
  const { data: toys = [], refetch } = trpc.toys.list.useQuery();
  const createToy = trpc.toys.create.useMutation();
  const updateToy = trpc.toys.update.useMutation();
  const deleteToy = trpc.toys.delete.useMutation();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingToy, setEditingToy] = useState<(typeof toys)[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    quantityAvailable: "0",
    dailyRentalPrice: "0",
  });

  const filteredToys = toys.filter((toy) =>
    toy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingToy) {
        await updateToy.mutateAsync({
          id: editingToy.id,
          ...formData,
        });
        toast.success("Brinquedo atualizado com sucesso!");
      } else {
        await createToy.mutateAsync({
          ...formData,
          quantityAvailable: parseInt(formData.quantityAvailable),
        });
        toast.success("Brinquedo cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        quantityAvailable: "0",
        dailyRentalPrice: "0",
      });
      setEditingToy(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar brinquedo");
    }
  };

  const handleEdit = (toy: (typeof toys)[0]) => {
    setEditingToy(toy);
    setFormData({
      name: toy.name,
      description: toy.description || "",
      category: toy.category || "",
      lengthCm: toy.lengthCm || "",
      widthCm: toy.widthCm || "",
      heightCm: toy.heightCm || "",
      quantityAvailable: toy.quantityAvailable.toString(),
      dailyRentalPrice: toy.dailyRentalPrice,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este brinquedo?")) {
      try {
        await deleteToy.mutateAsync({ id });
        toast.success("Brinquedo deletado com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar brinquedo");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingToy(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      lengthCm: "",
      widthCm: "",
      heightCm: "",
      quantityAvailable: "0",
      dailyRentalPrice: "0",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Brinquedos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de brinquedos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingToy(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Brinquedo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingToy ? "Editar Brinquedo" : "Novo Brinquedo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Nome *</label>
                  <Input
                    className="form-input"
                    placeholder="Ex: Piscina Inflável"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Categoria</label>
                  <Input
                    className="form-input"
                    placeholder="Ex: Aquático"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  placeholder="Descreva o brinquedo..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="form-label">Comprimento (cm)</label>
                  <Input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={formData.lengthCm}
                    onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Largura (cm)</label>
                  <Input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={formData.widthCm}
                    onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Altura (cm)</label>
                  <Input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="form-label">Quantidade Disponível *</label>
                  <Input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={formData.quantityAvailable}
                    onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Preço Diário (R$) *</label>
                  <Input
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.dailyRentalPrice}
                    onChange={(e) => setFormData({ ...formData, dailyRentalPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingToy ? "Atualizar" : "Cadastrar"}
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

      {/* Search and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="form-input pl-10"
            placeholder="Buscar brinquedo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3x3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredToys.map((toy) => (
            <Card key={toy.id} className="card-elevated flex flex-col overflow-hidden">
              {toy.photoUrl && (
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={toy.photoUrl}
                    alt={toy.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{toy.name}</CardTitle>
                    {toy.category && (
                      <CardDescription className="mt-1">{toy.category}</CardDescription>
                    )}
                  </div>
                  {toy.isUnderMaintenance && (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Manutenção
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {toy.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {toy.description}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensões:</span>
                    <span className="font-medium">
                      {toy.lengthCm}x{toy.widthCm}x{toy.heightCm} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponível:</span>
                    <span className="font-medium text-green-600">{toy.quantityAvailable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço/Dia:</span>
                    <span className="font-medium">R$ {toy.dailyRentalPrice}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(toy)}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(toy.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Dimensões</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Disponível</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Preço/Dia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredToys.map((toy) => (
                  <tr key={toy.id} className="border-b border-border hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm font-medium">{toy.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {toy.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {toy.lengthCm}x{toy.widthCm}x{toy.heightCm} cm
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      {toy.quantityAvailable}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      R$ {toy.dailyRentalPrice}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {toy.isUnderMaintenance ? (
                        <Badge variant="destructive" className="justify-center">
                          Manutenção
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="justify-center">
                          Ativo
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(toy)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(toy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredToys.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum brinquedo encontrado" : "Nenhum brinquedo cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
