import React from 'react';

/**
 * Badge d'affichage des taux de satisfaction avec un contraste amélioré
 * pour répondre aux exigences d'accessibilité
 */
interface SatisfactionBadgeProps {
  percentage: number;
  className?: string;
}

export const SatisfactionBadge: React.FC<SatisfactionBadgeProps> = ({ 
  percentage, 
  className = '' 
}) => {
  // Calculer la couleur de fond en fonction du pourcentage
  // pour assurer un contraste suffisant (WCAG AA)
  const getBgColor = (value: number): string => {
    if (value >= 95) return '#046C34'; // Vert foncé pour contraste AA+
    if (value >= 90) return '#0A5E30'; // Vert foncé
    if (value >= 80) return '#064E3B'; // Vert-teal foncé
    if (value >= 70) return '#1E40AF'; // Bleu foncé
    return '#1F2937'; // Gris très foncé pour les valeurs basses
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span 
        className="inline-flex justify-center items-center px-2 py-0.5 rounded font-bold text-white" 
        style={{ 
          backgroundColor: getBgColor(percentage),
          minWidth: '3rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
        aria-label={`Taux de satisfaction: ${percentage}%`}
      >
        {percentage}%
      </span>
    </div>
  );
};

export default SatisfactionBadge;