/**
 * App Root Component
 * 
 * Sets up providers and routing for the HereNow app.
 * Wraps the app with ServiceProvider for dependency injection.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServiceProvider } from "@/contexts/ServiceContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/** Query client for data fetching */
const queryClient = new QueryClient();

/**
 * Main App Component
 * 
 * Configures all providers and defines routes.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ServiceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Index />} />
            <Route path="/profile" element={<Index />} />
            <Route path="/settings" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ServiceProvider>
  </QueryClientProvider>
);

export default App;
