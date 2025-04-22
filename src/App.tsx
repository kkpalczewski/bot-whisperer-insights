import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DetectionConfigProvider } from "@/contexts/DetectionConfigContext";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => {
  // Force dark mode on the HTML element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <DetectionConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DetectionConfigProvider>
  );
};

export default App;
