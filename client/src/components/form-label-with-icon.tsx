import React from "react";
import { FormLabel } from "@/components/ui/form";

/**
 * Composant réutilisable pour les labels de formulaire avec icône
 * Assure l'alignement cohérent de l'icône et du texte
 */
interface FormLabelWithIconProps {
  icon: React.ReactNode;
  text: string;
  required?: boolean;
  tooltip?: string;
}

export const FormLabelWithIcon: React.FC<FormLabelWithIconProps> = ({
  icon,
  text,
  required = false,
  tooltip,
}) => {
  return (
    <FormLabel className="flex flex-row items-center gap-2 font-medium mb-1.5 whitespace-nowrap">
      <span className="inline-flex flex-shrink-0">{icon}</span>
      <span className="inline-flex items-center">
        {text} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <span
            className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
            title={tooltip}
          >
            ?
          </span>
        )}
      </span>
    </FormLabel>
  );
};