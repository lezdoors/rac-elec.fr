# Guide d'utilisation des composants responsifs

Ce document explique comment utiliser efficacement les composants responsifs pour créer une expérience utilisateur optimale sur tous les appareils.

## Table des matières

- [Installation](#installation)
- [Principes de base](#principes-de-base)
- [Composants de formulaire](#composants-de-formulaire)
- [Composants de navigation](#composants-de-navigation)
- [Composants de tableau de bord](#composants-de-tableau-de-bord)
- [Tableaux de données](#tableaux-de-données)
- [Cartes et accordéons](#cartes-et-accordéons)
- [Notifications](#notifications)
- [Utilitaires](#utilitaires)

## Installation

Tous les composants sont accessibles via l'importation depuis le dossier `responsive` :

```tsx
import { 
  ResponsiveMultiStepForm, 
  ResponsiveInput, 
  ResponsiveTable,
  useIsMobile 
} from "@/components/responsive";
```

## Principes de base

Les composants responsifs suivent ces principes :

1. **Adaptation automatique** : Tous les composants détectent automatiquement la taille de l'écran et s'adaptent en conséquence.
2. **Cohérence** : L'expérience reste cohérente entre mobile et desktop, mais optimisée pour chaque dispositif.
3. **Performance** : Les animations et effets complexes sont automatiquement réduits sur mobile.

Le hook `useIsMobile()` est la base de l'adaptation mobile :

```tsx
import { useIsMobile } from "@/components/responsive";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
      {isMobile ? "Version mobile" : "Version desktop"}
    </div>
  );
}
```

## Composants de formulaire

### Formulaire multi-étapes

Le formulaire multi-étapes s'adapte à la taille de l'écran et change son apparence en conséquence.

```tsx
import { ResponsiveMultiStepForm, MultiStepProgress } from "@/components/responsive";

function MyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  return (
    <ResponsiveMultiStepForm
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={handleSubmit}
      stepTitles={["Informations", "Détails", "Confirmation"]}
    >
      <Step1Content />
      <Step2Content />
      <Step3Content />
    </ResponsiveMultiStepForm>
  );
}
```

### Éléments de formulaire

Les éléments de formulaire responsifs s'adaptent à la taille de l'écran, notamment en augmentant la surface tactile sur mobile.

```tsx
import { 
  ResponsiveFormField, 
  ResponsiveInput, 
  ResponsiveSelect 
} from "@/components/responsive";

function MyInputs() {
  return (
    <div className="space-y-4">
      <ResponsiveInput 
        label="Nom"
        placeholder="Entrez votre nom"
        required
        tooltip="Votre nom complet"
      />
      
      <ResponsiveSelect
        label="Type de raccordement"
        options={[
          { value: "new", label: "Nouveau" },
          { value: "temp", label: "Provisoire" }
        ]}
        value={type}
        onChange={setType}
      />
    </div>
  );
}
```

### Sélecteurs de date

Les sélecteurs de date utilisent des interfaces distinctes sur mobile et desktop :
- Sur desktop : Popover
- Sur mobile : Sheet (tiroir)

```tsx
import { ResponsiveDatePicker, ResponsiveDateRangePicker } from "@/components/responsive";

function MyDatePickers() {
  const [date, setDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  
  return (
    <div className="space-y-4">
      <ResponsiveDatePicker
        label="Date de démarrage"
        date={date}
        onDateChange={setDate}
      />
      
      <ResponsiveDateRangePicker
        label="Période de raccordement"
        startDate={dateRange.from}
        endDate={dateRange.to}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
}
```

## Composants de navigation

### Navigation mobile

Le composant `MobileNavigation` adapte automatiquement la navigation en fonction de la taille de l'écran :
- Sur desktop : Barre latérale fixe
- Sur mobile : Menu hamburger + barre de navigation inférieure

```tsx
import { MobileNavigation } from "@/components/responsive";
import { Home, Users, Settings } from "lucide-react";

function MyLayout({ children }) {
  const { MobileSidebar, DesktopSidebar, MainContainer } = MobileNavigation({
    items: [
      { 
        href: "/", 
        label: "Accueil", 
        icon: <Home className="h-5 w-5" /> 
      },
      { 
        href: "/users", 
        label: "Utilisateurs", 
        icon: <Users className="h-5 w-5" />,
        badge: 5
      }
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

## Composants de tableau de bord

Ces composants sont optimisés pour afficher des métriques et des statistiques de manière responsive.

```tsx
import { 
  ResponsiveDashboardCard, 
  ResponsiveDashboardGrid, 
  ResponsiveDashboardSection 
} from "@/components/responsive";
import { Users, TrendingUp } from "lucide-react";

function Dashboard() {
  return (
    <div className="p-4">
      <ResponsiveDashboardSection 
        title="Vue d'ensemble" 
        description="Statistiques principales"
      >
        <ResponsiveDashboardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
          <ResponsiveDashboardCard
            title="Utilisateurs"
            value="1,234"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            trendLabel="vs mois dernier"
          />
          
          <ResponsiveDashboardCard
            title="Demandes"
            value="867"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: 3, isPositive: false }}
            trendLabel="vs mois dernier"
          />
        </ResponsiveDashboardGrid>
      </ResponsiveDashboardSection>
    </div>
  );
}
```

## Tableaux de données

Le composant `ResponsiveTable` adapte automatiquement l'affichage des données :
- Sur desktop : Tableau classique
- Sur mobile : Vue en carte ou tableau optimisé

```tsx
import { ResponsiveTable, ResponsiveTableBadge } from "@/components/responsive";
import { Eye, Edit, Trash } from "lucide-react";

function UsersTable() {
  const [users, setUsers] = useState([/* données */]);
  
  return (
    <ResponsiveTable
      data={users}
      columns={[
        { key: "name", header: "Nom" },
        { key: "email", header: "Email" },
        { key: "role", header: "Rôle", render: (row) => (
          <ResponsiveTableBadge variant={row.role === "admin" ? "destructive" : "default"}>
            {row.role}
          </ResponsiveTableBadge>
        )}
      ]}
      actions={[
        { label: "Voir", icon: <Eye className="h-4 w-4" />, onClick: handleView },
        { label: "Modifier", icon: <Edit className="h-4 w-4" />, onClick: handleEdit },
        { label: "Supprimer", icon: <Trash className="h-4 w-4" />, onClick: handleDelete }
      ]}
      pagination={{
        currentPage: 1,
        totalPages: 10,
        onPageChange: setPage
      }}
      search={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Rechercher un utilisateur..."
      }}
      cardView={true} // Vue en carte sur mobile
    />
  );
}
```

## Cartes et accordéons

Les cartes et accordéons s'adaptent également à la taille de l'écran.

```tsx
import { ResponsiveCard, CollapsibleSection, AccordionCard } from "@/components/responsive";
import { Info } from "lucide-react";

function MyCards() {
  return (
    <div className="space-y-4">
      <ResponsiveCard
        title="Informations importantes"
        icon={<Info className="h-5 w-5 text-blue-500" />}
        badge="Nouveau"
        collapsible
        defaultCollapsed={true}
      >
        <p>Contenu de la carte qui sera masqué par défaut sur mobile.</p>
      </ResponsiveCard>
      
      <CollapsibleSection
        title="Section dépliable"
        icon={<Info className="h-5 w-5 text-blue-500" />}
      >
        <p>Contenu qui peut être plié/déplié.</p>
      </CollapsibleSection>
      
      <AccordionCard
        items={[
          { id: "1", title: "Section 1", content: <p>Contenu 1</p> },
          { id: "2", title: "Section 2", content: <p>Contenu 2</p> },
        ]}
      />
    </div>
  );
}
```

## Notifications

Le système de notification s'adapte aux appareils mobiles :
- Sur desktop : Dropdown
- Sur mobile : Tiroir latéral

```tsx
import { 
  ResponsiveNotification, 
  ResponsiveToastNotification, 
  type Notification 
} from "@/components/responsive";

function MyHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: "1", 
      title: "Nouvelle demande", 
      message: "Un client a soumis une nouvelle demande de raccordement.", 
      timestamp: new Date(), 
      read: false,
      type: "info" 
    }
  ]);
  
  return (
    <header className="flex justify-between p-4">
      <h1>Mon Application</h1>
      
      <ResponsiveNotification
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
      
      {/* Pour les notifications toast */}
      <ResponsiveToastNotification
        notification={notification}
        onClose={handleClose}
        position="top-right"
        duration={5000}
      />
    </header>
  );
}
```

## Filtres

Les filtres sont optimisés pour l'utilisation mobile et desktop :

```tsx
import { ResponsiveFilters, QuickFilter } from "@/components/responsive";

function FilteredContent() {
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    period: { from: null, to: null }
  });
  
  const handleFilterChange = (groupId, filterId, value) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <ResponsiveFilters
        groups={[
          {
            id: "general",
            label: "Filtres généraux",
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
      
      <div className="flex-1">
        {/* Contenu filtré */}
      </div>
    </div>
  );
}
```

## Utilitaires

Plusieurs fonctions utilitaires sont disponibles pour optimiser l'expérience mobile :

```tsx
import { 
  useIsMobile, 
  useWindowSize, 
  useScaleFactor, 
  getMobileClasses 
} from "@/components/responsive";

function MyComponent() {
  const isMobile = useIsMobile();
  const { width, height } = useWindowSize();
  const scaleFactor = useScaleFactor();
  const mobileClasses = getMobileClasses(isMobile);
  
  return (
    <div className={mobileClasses.container}>
      <div className={mobileClasses.card}>
        <h2 className={mobileClasses.heading}>
          Titre adaptatif
        </h2>
        <p className={mobileClasses.paragraph}>
          Ce texte s'adapte automatiquement à la taille de l'écran.
        </p>
      </div>
    </div>
  );
}
```

## Conclusion

Ces composants responsifs vous permettent de créer une interface utilisateur qui s'adapte parfaitement à tous les appareils, des smartphones aux grands écrans. Utilisez-les de manière cohérente dans votre application pour offrir une expérience utilisateur optimale.