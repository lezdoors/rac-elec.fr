import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { Filter, Check, X, ChevronDown, SearchIcon, CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "select" | "date" | "range" | "search";
  options?: { value: string; label: string }[];
  value?: string | string[] | [number, number] | Date | null;
  placeholder?: string;
  icon?: ReactNode;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface ResponsiveFiltersProps {
  groups: FilterGroup[];
  onFilterChange: (
    groupId: string,
    filterId: string,
    value: string | string[] | [number, number] | Date | null
  ) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  className?: string;
  mobileTitle?: string;
  countBadge?: number;
  loading?: boolean;
}

/**
 * Composant de filtres adaptatif qui s'ajuste automatiquement selon l'écran
 * Sur desktop: panneau latéral fixe
 * Sur mobile: tiroir latéral avec mode plein écran
 */
export function ResponsiveFilters({
  groups,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  className,
  mobileTitle = "Filtres",
  countBadge,
  loading = false
}: ResponsiveFiltersProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    groups
      .filter(group => !group.defaultCollapsed)
      .map(group => group.id)
  );

  // Compte le nombre total de filtres actifs
  const countActiveFilters = () => {
    let count = 0;
    groups.forEach(group => {
      group.options.forEach(option => {
        if (
          (Array.isArray(option.value) && option.value.length > 0) ||
          (typeof option.value === "string" && option.value) ||
          (option.value instanceof Date)
        ) {
          count++;
        }
      });
    });
    return count;
  };

  const activeFiltersCount = countBadge ?? countActiveFilters();

  // Bascule l'état d'expansion d'un groupe
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Vérifie si un groupe est actuellement développé
  const isGroupExpanded = (groupId: string) => {
    return expandedGroups.includes(groupId);
  };

  // Rendu d'une option de filtre
  const renderFilterOption = (group: FilterGroup, option: FilterOption) => {
    const handleChange = (value: any) => {
      onFilterChange(group.id, option.id, value);
    };

    switch (option.type) {
      case "checkbox":
        return (
          <div className="space-y-2">
            {option.options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors",
                    Array.isArray(option.value) && option.value.includes(opt.value)
                      ? "bg-primary border-primary text-white"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  onClick={() => {
                    const values = Array.isArray(option.value) ? [...option.value] : [];
                    if (values.includes(opt.value)) {
                      handleChange(values.filter(v => v !== opt.value));
                    } else {
                      handleChange([...values, opt.value]);
                    }
                  }}
                >
                  {Array.isArray(option.value) && option.value.includes(opt.value) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {option.options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer",
                    option.value === opt.value
                      ? "border-primary"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  onClick={() => handleChange(opt.value)}
                >
                  {option.value === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        );

      case "select":
        return (
          <Select
            value={option.value as string || ""}
            onValueChange={handleChange}
          >
            <SelectTrigger className={cn(
              "w-full",
              isMobile ? "h-9" : ""
            )}>
              <SelectValue placeholder={option.placeholder || "Sélectionner..."} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "search":
        return (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={option.value as string || ""}
              onChange={e => handleChange(e.target.value)}
              placeholder={option.placeholder || "Rechercher..."}
              className="pl-9"
            />
            {option.value && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => handleChange("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Contenu du filtre (partagé entre mobile et desktop)
  const FilterContent = () => (
    <div className="space-y-6">
      {groups.map(group => (
        <div key={group.id} className="space-y-2">
          {/* En-tête du groupe avec option de repliage */}
          <div
            className={cn(
              "flex items-center justify-between",
              group.collapsible && "cursor-pointer"
            )}
            onClick={() => group.collapsible && toggleGroup(group.id)}
          >
            <h3 className="font-medium text-sm">{group.label}</h3>
            {group.collapsible && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  isGroupExpanded(group.id) && "rotate-180"
                )}
              />
            )}
          </div>

          {/* Contenu du groupe avec animation */}
          <AnimatePresence initial={false}>
            {(!group.collapsible || isGroupExpanded(group.id)) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-1 pb-2">
                  {group.options.map(option => (
                    <div key={option.id} className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {option.label}
                      </label>
                      {renderFilterOption(group, option)}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-b border-border/30 pt-2" />
        </div>
      ))}
    </div>
  );

  // Version mobile avec tiroir latéral
  if (isMobile) {
    return (
      <div className={className}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              <span>Filtrer</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 h-5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">{mobileTitle}</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Effacer
                </Button>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 px-4 py-6">
              <FilterContent />
            </ScrollArea>

            <SheetFooter className="p-4 border-t border-border/30">
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    onApplyFilters?.();
                    setIsOpen(false);
                  }}
                >
                  Appliquer
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Affichage des filtres actifs (chips) */}
        {activeFiltersCount > 0 && (
          <ScrollArea
            className="w-full mt-3"
            orientation="horizontal"
            scrollHideDelay={0}
          >
            <div className="flex gap-2 py-1">
              {groups.map(group =>
                group.options
                  .filter(option => {
                    const hasValue =
                      (Array.isArray(option.value) && option.value.length > 0) ||
                      (typeof option.value === "string" && option.value) ||
                      (option.value instanceof Date);
                    return hasValue;
                  })
                  .map(option => {
                    let label = option.label;

                    // Pour les options de type select, afficher la valeur sélectionnée
                    if (option.type === "select" && typeof option.value === "string") {
                      const selectedOption = option.options?.find(
                        opt => opt.value === option.value
                      );
                      if (selectedOption) {
                        label = `${option.label}: ${selectedOption.label}`;
                      }
                    }

                    // Pour les recherches, afficher la valeur
                    if (option.type === "search" && typeof option.value === "string") {
                      label = `${option.label}: ${option.value}`;
                    }

                    return (
                      <Badge
                        key={`${group.id}-${option.id}`}
                        variant="outline"
                        className="pl-2 py-1 h-7 gap-1"
                      >
                        {label}
                        <button
                          className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                          onClick={() => onFilterChange(group.id, option.id, null)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  // Version desktop avec panneau latéral
  return (
    <div
      className={cn(
        "border rounded-md divide-y bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          disabled={activeFiltersCount === 0}
          className="h-7 px-2 text-xs"
        >
          Effacer tout
        </Button>
      </div>

      <div className="p-4">
        <FilterContent />
      </div>

      {onApplyFilters && (
        <div className="p-4">
          <Button
            className="w-full"
            size="sm"
            onClick={onApplyFilters}
          >
            Appliquer les filtres
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuickFilterProps {
  filters: {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    value: string;
  }[];
  onFilterChange: (filterId: string, value: string) => void;
  className?: string;
}

/**
 * Filtres rapides en ligne adaptés au mobile
 */
export function QuickFilter({
  filters,
  onFilterChange,
  className
}: QuickFilterProps) {
  const isMobile = useIsMobile();

  // Sur mobile: utiliser des popovers pour économiser de l'espace
  if (isMobile) {
    return (
      <ScrollArea
        className={cn("w-full", className)}
        orientation="horizontal"
        scrollHideDelay={0}
      >
        <div className="flex gap-2 py-1">
          {filters.map(filter => (
            <Popover key={filter.id}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex gap-1 h-8 whitespace-nowrap"
                >
                  {filter.label}
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-0" align="start">
                <div className="py-1">
                  {filter.options.map(option => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full px-3 py-1.5 text-left text-sm transition-colors",
                        filter.value === option.value
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => onFilterChange(filter.id, option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {filter.value === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </ScrollArea>
    );
  }

  // Sur desktop: sélecteurs en ligne
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {filters.map(filter => (
        <Select
          key={filter.id}
          value={filter.value}
          onValueChange={value => onFilterChange(filter.id, value)}
        >
          <SelectTrigger className="w-auto min-w-28 h-9">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{filter.label}:</span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filter.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}