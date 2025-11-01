import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SharedConversation from "./pages/SharedConversation";
import AppCreator from "./pages/AppCreator";
import AIEcosystem from "./pages/AIEcosystem";
import EdgeComputing from "./pages/EdgeComputing";
import BlackSultanOS from "./pages/BlackSultanOS";
import CollectiveMind from "./pages/CollectiveMind";
import SolutionForge from "./pages/SolutionForge";
import CreatorChat from "./pages/CreatorChat";
import UsageDashboard from "./pages/UsageDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/usage" element={<UsageDashboard />} />
            <Route path="/shared/:token" element={<SharedConversation />} />
            <Route path="/app-creator" element={<AppCreator />} />
            <Route path="/ai-ecosystem" element={<AIEcosystem />} />
            <Route path="/edge-computing" element={<EdgeComputing />} />
            <Route path="/black-sultan" element={<BlackSultanOS />} />
            <Route path="/collective-mind" element={<CollectiveMind />} />
            <Route path="/solution-forge" element={<SolutionForge />} />
            <Route path="/creator-chat" element={<CreatorChat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
