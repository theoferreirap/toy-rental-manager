import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, AlertCircle, Gift } from "lucide-react";
import { useState } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Availability() {
  const { data: toys = [] } = trpc.toys.list.useQuery();
  const { data: reservations = [] } = trpc.reservations.list.useQuery();

  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: number;
      name: string;
      category: string;
      available: number;
      quantityAvailable: number;
      dailyRentalPrice: string;
      photoUrl?: string;
    }>
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = Array.from(new Set(toys.map((t) => t.category).filter(Boolean)));

  const handleSearch = () => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const results = toys
      .filter((toy) => !selectedCategory || toy.category === selectedCategory)
      .map((toy) => {
        // Count reservations that overlap with the selected period
        const conflictingReservations = reservations.filter((res) => {
          const resStart = parseISO(res.eventDate.toString());
          const resEnd = new Date(resStart.getTime() + 24 * 60 * 60 * 1000); // Assume 1-day event
          return (
            isWithinInterval(resStart, { start, end }) ||
            isWithinInterval(resEnd, { start, end }) ||
            (resStart < start && resEnd > end)
          );
        });

        const availableQuantity = Math.max(
          0,
          toy.quantityAvailable - conflictingReservations.length
        );

        return {
          id: toy.id,
          name: toy.name,
          category: toy.category || "Sem categoria",
          available: availableQuantity,
          quantityAvailable: toy.quantityAvailable,
          dailyRentalPrice: toy.dailyRentalPrice,
          photoUrl: toy.photoUrl,
        };
      });

    setSearchResults(results);
    setHasSearched(true);
  };

  const availableToys = searchResults.filter((toy) => toy.available > 0);
  const unavailableToys = searchResults.filter((toy) => toy.available === 0);

  const totalDays = Math.ceil(
    (parseISO(endDate).getTime() - parseISO(startDate).getTime()) / (24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Buscar Disponibilidade</h1>
        <p className="text-muted-foreground">Verifique quais brinquedos estão disponíveis no período</p>
      </div>

      {/* Search Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="form-label">Data de Início *</label>
              <Input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Data de Término *</label>
              <Input
                className="form-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Todas" />
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
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>

          {hasSearched && (
            <div className="flex gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Período: {format(parseISO(startDate), "dd/MM/yyyy", { locale: ptBR })} a{" "}
                  {format(parseISO(endDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Total de {totalDays} dia(s)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Available Toys */}
          {availableToys.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold text-foreground">
                  Disponíveis ({availableToys.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableToys.map((toy) => (
                  <Card key={toy.id} className="card-elevated flex flex-col">
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
                      <CardTitle className="text-lg">{toy.name}</CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {toy.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disponível:</span>
                          <span className="font-semibold text-green-600">
                            {toy.available} de {toy.quantityAvailable}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preço/Dia:</span>
                          <span className="font-semibold">
                            R$ {parseFloat(toy.dailyRentalPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total ({totalDays} dias):</span>
                          <span className="font-bold text-green-600">
                            R$ {(parseFloat(toy.dailyRentalPrice) * totalDays).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full" size="sm">
                        Solicitar Orçamento
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Toys */}
          {unavailableToys.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-bold text-foreground">
                  Indisponíveis ({unavailableToys.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unavailableToys.map((toy) => (
                  <Card key={toy.id} className="card-elevated opacity-60">
                    {toy.photoUrl && (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={toy.photoUrl}
                          alt={toy.name}
                          className="h-full w-full object-cover grayscale"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{toy.name}</CardTitle>
                      <Badge variant="outline" className="w-fit bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Indisponível
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Todas as {toy.quantityAvailable} unidade(s) estão reservadas neste período.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {selectedCategory
                    ? "Nenhum brinquedo encontrado nesta categoria"
                    : "Nenhum brinquedo cadastrado"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!hasSearched && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Defina um período e clique em "Buscar" para ver a disponibilidade
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
