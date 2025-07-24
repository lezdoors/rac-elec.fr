
import React from 'react';
import { MultiStepForm } from './multi-step-form';

// Mobile-optimized version of the multi-step form
export const MultiStepFormMobile: React.FC = () => {
  return (
    <div className="mobile-form-container">
      <MultiStepForm />
    </div>
  );
};

export default MultiStepFormMobile;
