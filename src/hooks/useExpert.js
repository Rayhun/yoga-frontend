import { useContext } from "react";
import { ExpertContext } from "@/context/ExpertProfileContext";

export function useExpertContext() {
    const context = useContext(ExpertContext);
    if (context === undefined) {
      throw new Error('useExpertContext must be used within an ExpertProvider');
    }
    return context;
  }