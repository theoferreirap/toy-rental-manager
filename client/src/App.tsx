import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Toys from "@/pages/Toys";
import Clients from "@/pages/Clients";
import Reservations from "@/pages/Reservations";
import Budgets from "@/pages/Budgets";
import Financial from "@/pages/Financial";
import Analytics from "@/pages/Analytics";
import Maintenance from "@/pages/Maintenance";
import Settings from "@/pages/Settings";
import Contracts from "@/pages/Contracts";
import Catalog from "@/pages/Catalog";
import Timer from "@/pages/Timer";
import Availability from "@/pages/Availability";
import Documentation from "@/pages/Documentation";
import BudgetRequests from "@/pages/BudgetRequests";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/toys">
        {() => (
          <AppLayout>
            <Toys />
          </AppLayout>
        )}
      </Route>
      <Route path="/clients">
        {() => (
          <AppLayout>
            <Clients />
          </AppLayout>
        )}
      </Route>
      <Route path="/reservations">
        {() => (
          <AppLayout>
            <Reservations />
          </AppLayout>
        )}
      </Route>
      <Route path="/budgets">
        {() => (
          <AppLayout>
            <Budgets />
          </AppLayout>
        )}
      </Route>
      <Route path="/financial">
        {() => (
          <AppLayout>
            <Financial />
          </AppLayout>
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          <AppLayout>
            <Analytics />
          </AppLayout>
        )}
      </Route>
      <Route path="/maintenance">
        {() => (
          <AppLayout>
            <Maintenance />
          </AppLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )}
      </Route>
      <Route path="/contracts">
        {() => (
          <AppLayout>
            <Contracts />
          </AppLayout>
        )}
      </Route>
      <Route path="/catalog">
        {() => (
          <AppLayout>
            <Catalog />
          </AppLayout>
        )}
      </Route>
      <Route path="/timer">
        {() => (
          <AppLayout>
            <Timer />
          </AppLayout>
        )}
      </Route>
      <Route path="/availability">
        {() => (
          <AppLayout>
            <Availability />
          </AppLayout>
        )}
      </Route>
      <Route path="/documentation">
        {() => (
          <AppLayout>
            <Documentation />
          </AppLayout>
        )}
      </Route>
      <Route path="/budget-requests">
        {() => (
          <AppLayout>
            <BudgetRequests />
          </AppLayout>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
