import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  FileText,
  Gift,
  Home,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Wrench,
  X,
  Layers,
  Clock,
  Search,
  HelpCircle,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Brinquedos", href: "/toys", icon: <Gift className="h-5 w-5" /> },
  { label: "Clientes", href: "/clients", icon: <Users className="h-5 w-5" /> },
  { label: "Reservas", href: "/reservations", icon: <Calendar className="h-5 w-5" /> },
  { label: "Orçamentos", href: "/budgets", icon: <FileText className="h-5 w-5" /> },
  { label: "Contratos", href: "/contracts", icon: <FileText className="h-5 w-5" /> },
  { label: "Financeiro", href: "/financial", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Estatísticas", href: "/analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { label: "Manutenção", href: "/maintenance", icon: <Wrench className="h-5 w-5" /> },
  { label: "Catálogo", href: "/catalog", icon: <Layers className="h-5 w-5" /> },
  { label: "Solicitações de Orçamento", href: "/budget-requests", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Disponibilidade", href: "/availability", icon: <Search className="h-5 w-5" /> },
  { label: "Temporizador", href: "/timer", icon: <Clock className="h-5 w-5" /> },
  { label: "Documentação", href: "/documentation", icon: <HelpCircle className="h-5 w-5" /> },
  { label: "Configurações", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground">Toy Rental Manager</h1>
          <p className="mb-8 text-muted-foreground">
            Sistema completo de gestão de aluguel de brinquedos infláveis
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Entrar com Manus</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border p-6">
          <h1 className="text-xl font-bold text-foreground">Toy Rental</h1>
          <p className="text-xs text-muted-foreground">Gestão de Aluguel</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-4 rounded-lg bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Usuário</p>
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header Mobile */}
        <header className="border-b border-border bg-card lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="text-lg font-bold text-foreground">Toy Rental</h1>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  <div className="border-b border-border p-6">
                    <h1 className="text-xl font-bold text-foreground">Toy Rental</h1>
                    <p className="text-xs text-muted-foreground">Gestão de Aluguel</p>
                  </div>

                  <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {NAV_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                            location === item.href
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-border p-4">
                    <div className="mb-4 rounded-lg bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Usuário</p>
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
