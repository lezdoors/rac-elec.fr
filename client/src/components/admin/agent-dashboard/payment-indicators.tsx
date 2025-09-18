import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentIndicators() {
  const { data, isLoading, error } = useQuery<{ 
    success: boolean; 
    totalAmount: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
  }>({
    queryKey: ["/api/payments/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="p-4 rounded-md bg-gray-100">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200 mb-6">
        <div className="flex items-center gap-2 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Impossible de charger les indicateurs de paiement</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Indicateur de paiements réussis */}
      <div className="p-4 rounded-md bg-green-50 border border-green-100">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div className="text-2xl font-bold text-center">{data.successCount}</div>
          <div className="text-sm text-green-600 text-center">Paiements réussis</div>
        </div>
      </div>

      {/* Indicateur de paiements en cours */}
      <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <div className="text-2xl font-bold text-center">{data.pendingCount}</div>
          <div className="text-sm text-amber-600 text-center">En cours</div>
        </div>
      </div>

      {/* Indicateur de paiements échoués */}
      <div className="p-4 rounded-md bg-red-50 border border-red-100">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div className="text-2xl font-bold text-center">{data.failedCount}</div>
          <div className="text-sm text-red-600 text-center">Échoués/Abandonnés</div>
        </div>
      </div>
    </div>
  );
}