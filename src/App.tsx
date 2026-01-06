import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import FunEcosystem from "./pages/FunEcosystem";
import LuatAnhSang from "./pages/LuatAnhSang";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DivineSidebar from "./components/DivineSidebar";
import { AngelCompanion } from "./components/AngelCompanion";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <>
      <AngelCompanion enabled={true} />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DivineSidebar />
        <div className="md:ml-[280px] ml-[70px] transition-all duration-300">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/fun-ecosystem" element={<FunEcosystem />} />
            <Route path="/luat-anh-sang" element={<LuatAnhSang />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
