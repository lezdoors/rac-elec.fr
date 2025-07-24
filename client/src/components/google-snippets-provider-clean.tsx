import { createContext, ReactNode } from "react";

// Clean Google Snippets context - ready for your working snippets
interface GoogleSnippetsContextType {
  snippets: { [page: string]: any[] };
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

export function GoogleSnippetsProvider({ children }: GoogleSnippetsProviderProps) {
  const snippets = {};
  const loading = false;
  
  const refreshSnippets = async (page: string) => {
    console.log("Ready for your working Google snippets!");
  };
  
  return (
    <GoogleSnippetsContext.Provider value={{ snippets, refreshSnippets, loading }}>
      {children}
    </GoogleSnippetsContext.Provider>
  );
}