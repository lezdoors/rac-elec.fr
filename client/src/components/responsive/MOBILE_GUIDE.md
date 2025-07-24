# Guide d'optimisation mobile

Ce guide explique comment intégrer et utiliser efficacement les composants responsifs pour créer une expérience utilisateur optimale sur mobile.

## Principes fondamentaux

### 1. Philosophie d'adaptation mobile

L'approche recommandée combine ces stratégies :
- **Mobile-first** : Concevoir d'abord pour mobile, puis enrichir pour desktop
- **Adaptation intelligente** : Modifier le comportement et l'apparence selon le contexte d'utilisation
- **Performance optimisée** : Réduire la complexité sur les appareils moins puissants

### 2. Implémentation technique

Pour appliquer les optimisations mobiles automatiquement :

```tsx
// Dans App.tsx ou votre composant racine
import { useApplyMobileOptimizations } from "@/lib/applyMobileOptimizations";

export default function App() {
  // Applique toutes les optimisations automatiquement
  useApplyMobileOptimizations();
  
  return (
    // Votre application
  );
}
```

## Adaptation des composants

### Formulaires

Le formulaire multi-étapes adaptatif est particulièrement important pour l'application de raccordement Enedis :

```tsx
import { ResponsiveMultiStepForm } from "@/components/responsive";

function LeadForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  return (
    <ResponsiveMultiStepForm
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={handleSubmit}
      stepTitles={["Informations personnelles", "Raccordement", "Confirmation"]}
    >
      <PersonalInfoStep />
      <ConnectionDetailsStep />
      <ConfirmationStep />
    </ResponsiveMultiStepForm>
  );
}
```

### Navigation

Pour une navigation adaptative :

```tsx
import { MobileNavigation } from "@/components/responsive";
import { Home, Users, Settings } from "lucide-react";

function Layout({ children }) {
  const { MobileSidebar, DesktopSidebar, MainContainer } = MobileNavigation({
    items: [
      { href: "/", label: "Accueil", icon: <Home className="h-5 w-5" /> },
      { href: "/demandes", label: "Demandes", icon: <FileText className="h-5 w-5" /> },
      { href: "/admin", label: "Administration", icon: <Settings className="h-5 w-5" /> }
    ],
    onLogout: handleLogout
  });
  
  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
      <MainContainer>
        {children}
      </MainContainer>
    </>
  );
}
```

### Tableaux de données

Pour les écrans d'administration, utiliser les tableaux adaptifs :

```tsx
import { ResponsiveTable, ResponsiveTableBadge } from "@/components/responsive";

function LeadsTable() {
  return (
    <ResponsiveTable
      data={leads}
      columns={[
        { key: "reference", header: "Référence" },
        { key: "name", header: "Nom" },
        { key: "status", header: "Statut", render: (row) => (
          <ResponsiveTableBadge 
            variant={row.status === "pending" ? "warning" : "success"}
          >
            {row.statusLabel}
          </ResponsiveTableBadge>
        )}
      ]}
      actions={[
        { label: "Voir", icon: <Eye />, onClick: (row) => viewLead(row.id) },
        { label: "Modifier", icon: <Edit />, onClick: (row) => editLead(row.id) }
      ]}
      cardView={true} // Vue en carte sur mobile
    />
  );
}
```

### En-têtes et pieds de page

```tsx
import { MobileHeader, MobileFooterButtons } from "@/components/responsive";

function LeadDetailPage() {
  return (
    <>
      <MobileHeader
        title="Détail de la demande"
        showBackButton
        backTo="/demandes"
      />
      
      <main className="p-4">
        {/* Contenu principal */}
      </main>
      
      <MobileFooterButtons
        primaryAction={{ 
          label: "Valider", 
          onClick: handleApprove 
        }}
        secondaryAction={{ 
          label: "Refuser", 
          onClick: handleReject 
        }}
      />
    </>
  );
}
```

### Notifications

```tsx
import { ResponsiveNotification } from "@/components/responsive";

function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>Raccordement Enedis</h1>
      
      <ResponsiveNotification
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </header>
  );
}
```

### Filtres

```tsx
import { ResponsiveFilters } from "@/components/responsive";

function LeadsFiltering() {
  return (
    <ResponsiveFilters
      groups={[
        {
          id: "status",
          label: "Statut",
          options: [
            {
              id: "status",
              label: "Statut",
              type: "select",
              options: [
                { value: "pending", label: "En attente" },
                { value: "approved", label: "Approuvé" },
                { value: "rejected", label: "Rejeté" }
              ],
              value: filters.status
            }
          ]
        }
      ]}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
    />
  );
}
```

## Interfaces d'administration

### Tableaux de bord

```tsx
import { 
  ResponsiveDashboardCard, 
  ResponsiveDashboardGrid, 
  ResponsiveDashboardSection 
} from "@/components/responsive";

function AdminDashboard() {
  return (
    <div className="p-4">
      <ResponsiveDashboardSection 
        title="Vue d'ensemble" 
        description="Statistiques principales"
      >
        <ResponsiveDashboardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
          <ResponsiveDashboardCard
            title="Demandes"
            value={stats.totalLeads}
            icon={<FileText />}
            trend={{ value: stats.leadsTrendPercentage, isPositive: stats.leadsTrendPercentage > 0 }}
            trendLabel="vs mois dernier"
          />
          
          <ResponsiveDashboardCard
            title="Taux de conversion"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp />}
            trend={{ value: stats.conversionTrendPercentage, isPositive: stats.conversionTrendPercentage > 0 }}
            trendLabel="vs mois dernier"
          />
        </ResponsiveDashboardGrid>
      </ResponsiveDashboardSection>
    </div>
  );
}
```

### Formulaires d'édition

```tsx
import { 
  ResponsiveFormField, 
  ResponsiveInput, 
  ResponsiveSelect, 
  MobileFormContainer
} from "@/components/responsive";

function EditLeadForm() {
  return (
    <MobileFormContainer>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4">Modifier la demande</h2>
        
        <div className="space-y-4">
          <ResponsiveInput
            label="Référence"
            value={lead.reference}
            onChange={e => updateField('reference', e.target.value)}
            readOnly
          />
          
          <ResponsiveSelect
            label="Statut"
            options={[
              { value: "pending", label: "En attente" },
              { value: "processing", label: "En cours" },
              { value: "completed", label: "Terminé" },
              { value: "rejected", label: "Rejeté" }
            ]}
            value={lead.status}
            onChange={value => updateField('status', value)}
          />
          
          <ResponsiveInput
            label="Date de livraison prévue"
            type="date"
            value={lead.expectedDeliveryDate}
            onChange={e => updateField('expectedDeliveryDate', e.target.value)}
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCancel}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </MobileFormContainer>
  );
}
```

## Étapes pratiques pour la migration

1. **Analyser les points critiques** : Identifier les pages et fonctionnalités qui posent des problèmes sur mobile
2. **Remplacer progressivement** : Commencer par les éléments les plus problématiques
3. **Tester sur plusieurs appareils** : Utiliser le simulateur de device fourni pour tester sur différentes tailles d'écran
4. **Mesurer les améliorations** : Comparer les performances avant/après

## Bonnes pratiques

- **Taille des zones tactiles** : Maintenir une taille minimale de 44px × 44px pour tous les éléments interactifs
- **Typographie** : Utiliser une taille de texte minimale de 16px pour le texte principal, 14px pour le texte secondaire
- **Espacement** : Augmenter les marges entre les éléments interactifs sur mobile
- **Simplification** : Réduire la complexité des interfaces sur petit écran
- **Contenu prioritaire** : Présenter d'abord le contenu le plus important sur mobile

## Accessibilité mobile

- **Contrastes** : Maintenir un ratio de contraste d'au moins 4.5:1
- **Focus visible** : S'assurer que l'état de focus est clairement visible
- **Texte alternatif** : Fournir des descriptions pour toutes les images
- **Pas de dépendance à la couleur** : Utiliser d'autres indicateurs en plus de la couleur
- **Tailles adaptatives** : Autoriser le redimensionnement du texte sans perte de contenu

## Conclusion

Ces composants et bonnes pratiques vous permettent de créer une expérience utilisateur cohérente et optimisée sur tous les appareils, des smartphones aux grands écrans. Commencez par intégrer les composants les plus critiques pour votre application et continuez progressivement jusqu'à une couverture complète.