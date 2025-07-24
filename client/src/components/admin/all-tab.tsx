import React from "react";
import { IncompleteLeadsTab } from './incomplete-tab';

interface AllLeadsTabProps {
  leadsLoading: boolean;
  allLeadsData: {
    success: boolean;
    leads: any[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  } | undefined;
  currentPage: number;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  openDetailsDialog: (leadId: number) => void;
  openAssignDialog: (leadId: number) => void;
}

export function AllLeadsTab({
  leadsLoading,
  allLeadsData,
  currentPage,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  openDetailsDialog,
  openAssignDialog,
}: AllLeadsTabProps) {
  // Réutiliser le composant IncompleteLeadsTab pour l'onglet "Tous"
  return (
    <IncompleteLeadsTab
      leadsLoading={leadsLoading}
      incompleteLeadsData={allLeadsData}
      currentPage={currentPage}
      goToPage={goToPage}
      goToPreviousPage={goToPreviousPage}
      goToNextPage={goToNextPage}
      openDetailsDialog={openDetailsDialog}
      openAssignDialog={openAssignDialog}
      title="Tous les leads"
      description="Liste complète de tous les leads du système"
    />
  );
}
