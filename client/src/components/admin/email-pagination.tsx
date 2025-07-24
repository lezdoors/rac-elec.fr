import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPaginationProps {
  currentPage: number;
  totalPages: number;
  totalEmails: number;
  indexOfFirstEmail: number;
  indexOfLastEmail: number;
  onPageChange: (page: number) => void;
}

export function EmailPagination({
  currentPage,
  totalPages,
  totalEmails,
  indexOfFirstEmail,
  indexOfLastEmail,
  onPageChange
}: EmailPaginationProps) {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="text-sm text-muted-foreground">
        Affichage de {indexOfFirstEmail + 1} à {Math.min(indexOfLastEmail, totalEmails)} sur {totalEmails} emails
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Afficher au maximum 5 pages autour de la page actuelle
          let pageNumber = 0;
          if (totalPages <= 5) {
            // Moins de 5 pages au total, on les affiche toutes
            pageNumber = i + 1;
          } else if (currentPage <= 3) {
            // Proche du début, on affiche les pages 1 à 5
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            // Proche de la fin, on affiche les 5 dernières pages
            pageNumber = totalPages - 4 + i;
          } else {
            // Au milieu, on affiche 2 pages avant et 2 pages après
            pageNumber = currentPage - 2 + i;
          }
          
          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="w-8 h-8 p-0"
            >
              {pageNumber}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}