import { createContext, ReactNode, useEffect, useState } from "react";
import { getActiveSnippetsForPage, GoogleSnippet } from "@/lib/google-snippets";

// Contexte pour les snippets Google
interface GoogleSnippetsContextType {
  // L'objet contient les snippets par page
  snippets: {
    [page: string]: GoogleSnippet[];
  };
  refreshSnippets: (page: string) => Promise<void>;
  loading: boolean;
}

export const GoogleSnippetsContext = createContext<GoogleSnippetsContextType>({
  snippets: {},
  refreshSnippets: async () => {},
  loading: false,
});

interface GoogleSnippetsProviderProps {
  children: ReactNode;
}

/**
 * Composant qui initialise les Google Snippets sur chaque page
 */
export function GoogleSnippetsProvider({ children }: GoogleSnippetsProviderProps) {
  const [snippets, setSnippets] = useState<{ [page: string]: GoogleSnippet[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  
  // Function disabled - ready for your working snippets
  const refreshSnippets = async (page: string) => {
    console.log("Google Snippets API disabled, ready for new implementation");
  };
  
  // Google Snippets system disabled - ready for your working snippets
  // No initialization needed
  
  return (
    <GoogleSnippetsContext.Provider value={{ snippets, refreshSnippets, loading }}>
      {children}
    </GoogleSnippetsContext.Provider>
  );
}