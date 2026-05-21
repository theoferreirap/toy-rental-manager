import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, MessageCircle, Filter, Grid, List, Gift, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BudgetRequestForm } from "@/components/BudgetRequestForm";

export default function Catalog() {
  const { data: toys = [] } = trpc.toys.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [selectedToysForBudget, setSelectedToysForBudget] = useState<
    Array<{ toyId: number; toyName: string; quantity: number; dailyPrice: number }>
  >([]);

  const categories = Array.from(new Set(toys.map((t) => t.category).filter(Boolean)));

  const filteredToys = toys.filter((toy) => {
    const matchesSearch = toy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toy.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || toy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleShare = () => {
    const baseUrl = window.location.origin;
    const catalogUrl = `${baseUrl}/catalog?shared=true`;
    setShareUrl(catalogUrl);
    setIsShareDialogOpen(true);
  };

  const handleShareViaWhatsApp = () => {
    const message = `Confira nosso catálogo de brinquedos infláveis! ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleAddToBudget = (toy: typeof toys[0]) => {
    const existing = selectedToysForBudget.find((t) => t.toyId === toy.id);
    if (existing) {
      setSelectedToysForBudget(
        selectedToysForBudget.map((t) =>
          t.toyId === toy.id ? { ...t, quantity: t.quantity + 1 } : t
        )
      );
    } else {
      setSelectedToysForBudget([
        ...selectedToysForBudget,
        {
          toyId: toy.id,
          toyName: toy.name,
          quantity: 1,
          dailyPrice: parseFloat(toy.dailyRentalPrice),
        },
      ]);
    }
    toast.success(`${toy.name} adicionado ao orçamento!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo Digital</h1>
          <p className="text-muted-foreground">Visualize e compartilhe nossos brinquedos</p>
        </div>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartilhar Catálogo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Link do Catálogo</label>
                <div className="flex gap-2">
                  <Input
                    className="form-input"
                    value={shareUrl}
                    readOnly
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleShareViaWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Compartilhar via WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <Input
                className="form-input"
                placeholder="Buscar brinquedos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <CardTitle className="text-lg line-clamp-2">{toy.name}</CardTitle>
                {toy.category && (
                  <Badge variant="outline" className="w-fit">
                    {toy.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {toy.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {toy.description}
                  </p>
                )}
                <div className="space-y-1 text-sm">
                  {toy.lengthCm && toy.widthCm && (
                    <div className="text-muted-foreground">
                      Dimensões: {toy.lengthCm}cm × {toy.widthCm}cm
                    </div>
                  )}
                  <div className="font-semibold text-green-600">
                    R$ {parseFloat(toy.dailyRentalPrice).toFixed(2)}/dia
                  </div>
                </div>
                <Button className="w-full" size="sm" onClick={() => handleAddToBudget(toy)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Adicionar ao Orçamento
                </Button>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">Brinquedo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Dimensões</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Preço/Dia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredToys.map((toy) => (
                  <tr key={toy.id} className="border-b border-border hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {toy.photoUrl && (
                          <img
                            src={toy.photoUrl}
                            alt={toy.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{toy.name}</p>
                          {toy.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {toy.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {toy.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {toy.lengthCm && toy.widthCm
                        ? `${toy.lengthCm}cm × ${toy.widthCm}cm`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      R$ {parseFloat(toy.dailyRentalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToBudget(toy)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
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
              {searchQuery || selectedCategory
                ? "Nenhum brinquedo encontrado"
                : "Nenhum brinquedo cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}

      {selectedToysForBudget.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="gap-2 rounded-full shadow-lg hover:shadow-xl"
            onClick={() => setIsBudgetFormOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            Orcamento ({selectedToysForBudget.length})
          </Button>
        </div>
      )}

      <BudgetRequestForm
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
        selectedToys={selectedToysForBudget}
        onSubmitSuccess={() => setSelectedToysForBudget([])}
      />
    </div>
  );
}
