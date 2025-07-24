import { useState, useEffect } from "react";
import { format, isValid, isToday, isSameDay, isSameMonth, addMonths, subMonths, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { DayPicker } from "react-day-picker";

interface ResponsiveDatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showClearButton?: boolean;
  inputClassName?: string;
  format?: string;
  title?: string;
}

/**
 * Sélecteur de date adaptif qui s'ajuste automatiquement à la taille de l'écran
 * Sur desktop: popover
 * Sur mobile: sheet
 */
export function ResponsiveDatePicker({
  date,
  onDateChange,
  label,
  placeholder = "Sélectionner une date",
  disabled = false,
  disabledDates = [],
  minDate,
  maxDate,
  className,
  showClearButton = true,
  inputClassName,
  format: formatStr = "dd/MM/yyyy",
  title = "Sélectionner une date"
}: ResponsiveDatePickerProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  
  // Mettre à jour la valeur d'entrée lors du changement de date
  useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, formatStr, { locale: fr }));
    } else {
      setInputValue("");
    }
  }, [date, formatStr]);
  
  // Gérer le changement manuel dans l'entrée
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    try {
      // Essayer de parser la date selon différents formats
      const dateParts = value.split(/[./-]/);
      
      if (dateParts.length === 3) {
        let day, month, year;
        
        // Format fr (jour/mois/année)
        if (formatStr.startsWith("dd")) {
          [day, month, year] = dateParts;
        }
        // Format en (mois/jour/année)
        else if (formatStr.startsWith("MM")) {
          [month, day, year] = dateParts;
        }
        // Format ISO (année-mois-jour)
        else {
          [year, month, day] = dateParts;
        }
        
        // Ajouter le préfixe du siècle si l'année a 2 chiffres
        if (year && year.length === 2) {
          year = `20${year}`;
        }
        
        // Créer une date valide
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        
        if (isValid(parsedDate)) {
          onDateChange(parsedDate);
        }
      }
    } catch (error) {
      // Ignorer les erreurs de parsing
    }
  };
  
  // Contenu du calendrier
  const CalendarContent = () => (
    <div className={isMobile ? "px-0" : ""}>
      <DayPicker
        mode="single"
        locale={fr}
        selected={date || undefined}
        onSelect={onDateChange}
        disabled={[
          ...(disabledDates || []),
          ...(minDate ? [{ before: minDate }] : []),
          ...(maxDate ? [{ after: maxDate }] : [])
        ]}
        modifiers={{
          today: date => isToday(date)
        }}
        modifiersClassNames={{
          selected: "bg-primary text-primary-foreground",
          today: "bg-accent text-accent-foreground",
          disabled: "text-muted-foreground opacity-50"
        }}
        className={cn(
          isMobile && "py-3 [&_.rdp-caption]:pb-3 [&_.rdp-head_th]:text-xs"
        )}
      />
    </div>
  );
  
  // Version mobile avec sheet
  if (isMobile) {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </div>
        )}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Input
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "pr-10",
                  inputClassName
                )}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[420px] pb-0">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            
            <div className="flex items-center justify-center py-4">
              <CalendarContent />
            </div>
            
            <SheetFooter className="flex p-4 border-t border-border/30">
              {showClearButton && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onDateChange(null);
                    setIsOpen(false);
                  }}
                >
                  Effacer
                </Button>
              )}
              
              <SheetClose asChild>
                <Button className="w-full">Confirmer</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // Version desktop avec popover
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
      )}
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={e => handleInputChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pr-10",
                inputClassName
              )}
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <CalendarContent />
            
            {showClearButton && date && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDateChange(null)}
                >
                  Effacer
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ResponsiveDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  inputClassName?: string;
  format?: string;
  title?: string;
}

/**
 * Sélecteur de plage de dates adaptif qui s'ajuste automatiquement selon l'écran
 */
export function ResponsiveDateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  label,
  placeholder = "Sélectionner une période",
  disabled = false,
  disabledDates = [],
  minDate,
  maxDate,
  className,
  inputClassName,
  format: formatStr = "dd/MM/yyyy",
  title = "Sélectionner une période"
}: ResponsiveDateRangePickerProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [month, setMonth] = useState<Date>(new Date());
  
  // Mettre à jour la valeur d'entrée lors du changement de dates
  useEffect(() => {
    if (startDate || endDate) {
      const formattedStart = startDate 
        ? format(startDate, formatStr, { locale: fr }) 
        : "";
      const formattedEnd = endDate 
        ? format(endDate, formatStr, { locale: fr }) 
        : "";
      
      if (startDate && endDate) {
        setInputValue(`${formattedStart} - ${formattedEnd}`);
      } else if (startDate) {
        setInputValue(`${formattedStart} - ...`);
      } else if (endDate) {
        setInputValue(`... - ${formattedEnd}`);
      }
      
      // Mettre à jour le mois affiché sur le calendrier
      if (startDate) {
        setMonth(startDate);
      } else if (endDate) {
        setMonth(endDate);
      }
    } else {
      setInputValue("");
    }
  }, [startDate, endDate, formatStr]);
  
  // Navigation des mois
  const goToPreviousMonth = () => setMonth(subMonths(month, 1));
  const goToNextMonth = () => setMonth(addMonths(month, 1));
  
  // Contenu du calendrier
  const CalendarContent = () => (
    <div className="space-y-4">
      {/* En-tête de navigation des mois */}
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          disabled={minDate && month <= minDate}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-medium">
          {format(month, "MMMM yyyy", { locale: fr })}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          disabled={maxDate && month >= maxDate}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendrier */}
      <DayPicker
        mode="range"
        locale={fr}
        selected={{
          from: startDate || undefined,
          to: endDate || undefined
        }}
        onSelect={range => 
          onDateRangeChange({ 
            from: range?.from || null, 
            to: range?.to || null 
          })
        }
        month={month}
        disabled={[
          ...(disabledDates || []),
          ...(minDate ? [{ before: minDate }] : []),
          ...(maxDate ? [{ after: maxDate }] : [])
        ]}
        modifiers={{
          today: date => isToday(date)
        }}
        modifiersClassNames={{
          selected: "bg-primary text-primary-foreground",
          today: "bg-accent text-accent-foreground",
          disabled: "text-muted-foreground opacity-50"
        }}
        className={cn(
          isMobile && "py-2 [&_.rdp-caption]:hidden [&_.rdp-head_th]:text-xs"
        )}
      />
    </div>
  );
  
  // Version mobile avec sheet
  if (isMobile) {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </div>
        )}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Input
                value={inputValue}
                readOnly
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "pr-10",
                  inputClassName
                )}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[460px] pb-0">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            
            <div className="flex items-center justify-center py-4">
              <CalendarContent />
            </div>
            
            <SheetFooter className="flex p-4 border-t border-border/30">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onDateRangeChange({ from: null, to: null });
                  setIsOpen(false);
                }}
              >
                Effacer
              </Button>
              
              <SheetClose asChild>
                <Button className="w-full">Confirmer</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // Version desktop avec popover
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
      )}
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              readOnly
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pr-10",
                inputClassName
              )}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <CalendarContent />
          
          <div className="flex justify-center mt-3 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateRangeChange({ from: null, to: null })}
            >
              Effacer
            </Button>
            
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Appliquer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}