import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Récupérer le token d'authentification
  const token = localStorage.getItem("adminToken");
  
  // Préparer les headers
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  // Ajouter le token d'authentification s'il est disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Récupérer le token d'authentification
    const token = localStorage.getItem("adminToken");
    
    // Préparer les headers
    const headers: Record<string, string> = {};
    // Ajouter le token d'authentification s'il est disponible
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Configuration optimisée du QueryClient avec des paramètres pour réduire le nombre de requêtes API inutiles
 * et améliorer les performances de l'interface d'administration.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // Considérer les données valides pendant 1 minute par défaut
      retry: 1, // Limiter les tentatives de nouvelle requête en cas d'échec
      refetchOnMount: false, // Ne pas refetch automatiquement au montage d'un composant
      gcTime: 1000 * 60 * 10 // Garder les données en cache pendant 10 minutes (anciennement cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});
