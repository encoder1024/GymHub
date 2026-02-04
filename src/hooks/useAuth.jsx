import { useContext } from "react";
import { FullContext } from "../contexts/FullContext";

export const useAuth = () => {
  const context = useContext(FullContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
