import React from "react";
import { IncompleteLeadsTab } from './incomplete-tab';

interface NewLeadsTabProps {
  leadsLoading: boolean;
  newLeadsData: {
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

export function NewLeadsTab({
  leadsLoading,
  newLeadsData,
  currentPage,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  openDetailsDialog,
  openAssignDialog,
}: NewLeadsTabProps) {
  // Réutiliser le composant IncompleteLeadsTab pour l'onglet "Nouveaux"
  return (
    <IncompleteLeadsTab
      leadsLoading={leadsLoading}
      incompleteLeadsData={newLeadsData}
      currentPage={currentPage}
      goToPage={goToPage}
      goToPreviousPage={goToPreviousPage}
      goToNextPage={goToNextPage}
      openDetailsDialog={openDetailsDialog}
      openAssignDialog={openAssignDialog}
      title="Nouveaux leads"
      description="Leads créés dans les dernières 24 heures"
    />
  );
}
