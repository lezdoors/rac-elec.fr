import { ReactNode } from 'react';
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/lib/mobile-optimizations";

interface IconInputProps {
  icon: ReactNode;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Composant d'input avec une icône positionnée correctement, optimisé pour mobile
 */
export function IconInput({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  required,
  className,
  disabled,
  ...props
}: IconInputProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative w-full">
      <div className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 ${isMobile ? 'text-sm' : ''}`}>
        {icon}
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        className={`pl-9 ${className || ''}`}
        {...props}
      />
    </div>
  );
}