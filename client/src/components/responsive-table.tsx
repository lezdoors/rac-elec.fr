import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { ChevronDown, Info, Eye, Filter, Download, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  hideOnMobile?: boolean;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface Action<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  idField?: keyof T;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  className?: string;
  cardView?: boolean;
  getRowClassName?: (row: T) => string;
  enableExport?: boolean;
}

/**
 * Tableau de données responsive qui s'adapte aux écrans mobiles
 */
export function ResponsiveTable<T>({
  data,
  columns,
  actions,
  idField = "id" as keyof T,
  emptyMessage = "Aucune donnée disponible",
  pagination,
  search,
  onRowClick,
  isLoading = false,
  className,
  cardView = false,
  getRowClassName,
  enableExport = false,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Initialiser les colonnes visibles
  useEffect(() => {
    setVisibleColumns(
      columns
        .filter(col => !col.hideOnMobile || !isMobile)
        .map(col => col.key)
    );
  }, [columns, isMobile]);

  // Fonction de tri
  const sortedData = [...data].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    
    // Si ce sont des chaînes, les comparer sans tenir compte de la casse
    if (typeof a[key] === "string" && typeof b[key] === "string") {
      return direction * a[key].localeCompare(b[key]);
    }
    
    // Pour les autres types
    if (a[key] < b[key]) return -1 * direction;
    if (a[key] > b[key]) return 1 * direction;
    return 0;
  });

  // Gestion du clic d'en-tête pour trier
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === "asc" 
          ? { key, direction: "desc" } 
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  // Voir les détails d'une ligne sur mobile
  const handleShowDetails = (row: T) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  // Exportation des données en CSV
  const handleExport = () => {
    if (data.length === 0) return;
    
    // Construire les en-têtes
    const headers = columns.map(col => col.header).join(",");
    
    // Construire les lignes
    const rows = data.map(row => {
      return columns
        .map(col => {
          let cellData = "";
          if (col.render) {
            // Pour les cellules avec rendu personnalisé, essayer d'obtenir la valeur brute
            cellData = String((row as any)[col.key] || "");
          } else {
            cellData = String((row as any)[col.key] || "");
          }
          // Échapper les virgules et les guillemets
          if (cellData.includes(",") || cellData.includes('"')) {
            cellData = `"${cellData.replace(/"/g, '""')}"`;
          }
          return cellData;
        })
        .join(",");
    }).join("\n");
    
    // Combiner le tout
    const csv = `${headers}\n${rows}`;
    
    // Créer et télécharger le fichier
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "export-donnees.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Vue en mode carte pour mobile
  if (isMobile && cardView) {
    return (
      <div className={cn("space-y-4", className)}>
        {search && (
          <div className="relative mb-4">
            <Input
              placeholder={search.placeholder || "Rechercher..."}
              value={search.value}
              onChange={e => search.onChange(e.target.value)}
              className="pl-9"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {search.value && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => search.onChange("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
        
        {enableExport && data.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 animate-pulse h-28 rounded-lg"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sortedData.map(row => (
                <div
                  key={String(row[idField])}
                  className={cn(
                    "border border-border/40 rounded-lg bg-white dark:bg-gray-900 shadow-sm p-4",
                    getRowClassName && getRowClassName(row),
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <div className="flex justify-between items-start mb-2">
                    {/* Affiche la première colonne en titre */}
                    <div className="font-medium">
                      {columns[0].render
                        ? columns[0].render(row)
                        : String((row as any)[columns[0].key] || "")}
                    </div>
                    
                    {/* Menu d'actions */}
                    {actions && actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, idx) => 
                            action.hidden && action.hidden(row) ? null : (
                              <DropdownMenuItem
                                key={idx}
                                onClick={e => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                              >
                                {action.icon && (
                                  <span className="mr-2">{action.icon}</span>
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {/* Affiche quelques colonnes importantes */}
                  <div className="space-y-2">
                    {columns.slice(1, 4).map((column, idx) => 
                      column.hideOnMobile ? null : (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {column.header}:
                          </span>
                          <span>
                            {column.render
                              ? column.render(row)
                              : String((row as any)[column.key] || "")}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  
                  {/* Bouton pour voir tous les détails */}
                  {columns.length > 4 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        handleShowDetails(row);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir tous les détails
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  
                  <div className="px-3 py-1 border rounded-md flex items-center text-sm">
                    {pagination.currentPage} sur {pagination.totalPages}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
            
            {/* Dialogue de détails pour mobile */}
            {selectedRow && (
              <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {columns[0].render
                        ? columns[0].render(selectedRow)
                        : String((selectedRow as any)[columns[0].key] || "")}
                    </DialogTitle>
                    <DialogDescription>
                      Détails complets
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-3 py-2">
                      {columns.map((column, idx) => (
                        <div key={idx} className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {column.header}
                          </span>
                          <div className="text-sm">
                            {column.render
                              ? column.render(selectedRow)
                              : String((selectedRow as any)[column.key] || "")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <DialogFooter>
                    {actions && actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {actions.map((action, idx) => 
                          action.hidden && action.hidden(selectedRow) ? null : (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                action.onClick(selectedRow);
                                setDetailOpen(false);
                              }}
                            >
                              {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                              )}
                              {action.label}
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    );
  }
  
  // Vue tableau standard (desktop ou mobile sans cardView)
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {search && (
          <div className="relative">
            <Input
              placeholder={search.placeholder || "Rechercher..."}
              value={search.value}
              onChange={e => search.onChange(e.target.value)}
              className={cn("pl-9", isMobile ? "w-full" : "w-64")}
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {search.value && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => search.onChange("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
        
        <div className="flex gap-2 ml-auto">
          {enableExport && data.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
          
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Colonnes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Afficher/masquer</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns.includes(column.key)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setVisibleColumns(prev => [...prev, column.key]);
                      } else {
                        setVisibleColumns(prev => 
                          prev.filter(key => key !== column.key)
                        );
                      }
                    }}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <ScrollArea className={cn(isMobile ? "max-h-[60vh]" : "max-h-[70vh]")}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => 
                  visibleColumns.includes(column.key) ? (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.width && column.width,
                        column.sortable && "cursor-pointer select-none",
                        sortConfig?.key === column.key && 
                          (sortConfig.direction === "asc" 
                            ? "text-primary" 
                            : "text-primary")
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        {column.header}
                        {sortConfig?.key === column.key && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ) : null
                )}
                {actions && actions.length > 0 && (
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column, colIndex) => 
                      visibleColumns.includes(column.key) ? (
                        <TableCell key={colIndex} className="py-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </TableCell>
                      ) : null
                    )}
                    {actions && actions.length > 0 && (
                      <TableCell />
                    )}
                  </TableRow>
                ))
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (actions && actions.length > 0 ? 1 : 0)}
                    className="text-center h-32 text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map(row => (
                  <TableRow
                    key={String(row[idField])}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                      getRowClassName && getRowClassName(row)
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column, colIndex) => 
                      visibleColumns.includes(column.key) ? (
                        <TableCell 
                          key={colIndex}
                          className={cn(
                            "py-2",
                            isMobile && "whitespace-nowrap"
                          )}
                        >
                          {column.render
                            ? column.render(row)
                            : String((row as any)[column.key] || "")}
                        </TableCell>
                      ) : null
                    )}
                    {actions && actions.length > 0 && (
                      <TableCell className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          {actions.map((action, actionIndex) =>
                            action.hidden && action.hidden(row) ? null : (
                              <Button
                                key={actionIndex}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={e => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                title={action.label}
                              >
                                {action.icon || <Info className="h-4 w-4" />}
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Précédent
            </Button>
            
            {/* Affichage des numéros de page */}
            {!isMobile && (
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                  let pageNum;
                  
                  // Logique pour afficher les pages pertinentes autour de la page actuelle
                  if (pagination.totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + idx;
                  } else {
                    pageNum = pagination.currentPage - 2 + idx;
                  }
                  
                  return (
                    <Button
                      key={idx}
                      variant={pageNum === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => pagination.onPageChange(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
            )}
            
            {isMobile && (
              <div className="px-3 py-1 border rounded-md flex items-center text-sm">
                {pagination.currentPage} sur {pagination.totalPages}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export des composants complémentaires pour les tableaux
export function ResponsiveTableBadge({ 
  children, 
  variant = "default" 
}: { 
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "success";
}) {
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {children}
    </Badge>
  );
}