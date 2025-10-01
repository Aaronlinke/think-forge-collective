import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppCreator from "./pages/AppCreator";
import AIEcosystem from "./pages/AIEcosystem";
import EdgeComputing from "./pages/EdgeComputing";
import BlackSultanOS from "./pages/BlackSultanOS";
import CollectiveMind from "./pages/CollectiveMind";
import SolutionForge from "./pages/SolutionForge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app-creator" element={<AppCreator />} />
          <Route path="/ai-ecosystem" element={<AIEcosystem />} />
          <Route path="/edge-computing" element={<EdgeComputing />} />
          <Route path="/black-sultan-os" element={<BlackSultanOS />} />
          <Route path="/collective-mind" element={<CollectiveMind />} />
          <Route path="/solution-forge" element={<SolutionForge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
