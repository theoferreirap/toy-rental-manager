import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Timer {
  id: string;
  toyName: string;
  duration: number;
  elapsed: number;
  isRunning: boolean;
  createdAt: Date;
}

export default function Timer() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    toyName: "",
    hours: "0",
    minutes: "30",
    seconds: "0",
  });

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.isRunning && timer.elapsed < timer.duration) {
            return { ...timer, elapsed: timer.elapsed + 1 };
          }
          if (timer.isRunning && timer.elapsed >= timer.duration) {
            toast.error(`Tempo de ${timer.toyName} expirou!`);
            return { ...timer, isRunning: false };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddTimer = () => {
    const totalSeconds =
      parseInt(formData.hours) * 3600 +
      parseInt(formData.minutes) * 60 +
      parseInt(formData.seconds);

    if (totalSeconds === 0) {
      toast.error("Defina um tempo válido");
      return;
    }

    if (!formData.toyName.trim()) {
      toast.error("Digite o nome do brinquedo");
      return;
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      toyName: formData.toyName,
      duration: totalSeconds,
      elapsed: 0,
      isRunning: false,
      createdAt: new Date(),
    };

    setTimers([...timers, newTimer]);
    setFormData({ toyName: "", hours: "0", minutes: "30", seconds: "0" });
    setIsDialogOpen(false);
    toast.success("Temporizador adicionado!");
  };

  const toggleTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id ? { ...timer, elapsed: 0, isRunning: false } : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getProgressPercentage = (timer: Timer) => {
    return (timer.elapsed / timer.duration) * 100;
  };

  const isTimeExpired = (timer: Timer) => {
    return timer.elapsed >= timer.duration;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Temporizador</h1>
          <p className="text-muted-foreground">Controle o tempo de uso dos brinquedos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Temporizador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Temporizador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Nome do Brinquedo *</label>
                <Input
                  className="form-input"
                  placeholder="Ex: Piscina Inflável"
                  value={formData.toyName}
                  onChange={(e) => setFormData({ ...formData, toyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Duração</label>
                <div className="grid gap-2 grid-cols-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Horas</label>
                    <Input
                      className="form-input"
                      type="number"
                      min="0"
                      max="23"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Minutos</label>
                    <Input
                      className="form-input"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.minutes}
                      onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Segundos</label>
                    <Input
                      className="form-input"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.seconds}
                      onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleAddTimer}>
                  Adicionar
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {timers.map((timer) => {
          const isExpired = isTimeExpired(timer);
          const progress = getProgressPercentage(timer);

          return (
            <Card
              key={timer.id}
              className={`card-elevated flex flex-col ${isExpired ? "border-red-200 dark:border-red-900/50" : ""}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{timer.toyName}</CardTitle>
                <CardDescription>
                  Iniciado em {timer.createdAt.toLocaleTimeString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Timer Display */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className={`text-5xl font-bold font-mono ${isExpired ? "text-red-600" : "text-accent"}`}>
                    {formatTime(timer.elapsed)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    de {formatTime(timer.duration)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isExpired ? "bg-red-500" : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {/* Status */}
                {isExpired && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">
                      Tempo expirado!
                    </span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleTimer(timer.id)}
                    disabled={isExpired}
                  >
                    {timer.isRunning ? (
                      <>
                        <Pause className="mr-1 h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-4 w-4" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetTimer(timer.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeTimer(timer.id)}
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {timers.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum temporizador ativo</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
