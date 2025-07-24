export interface SignatureWizardProps {
  initialHtml?: string;
  onSave: (html: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export interface EmailSignature {
  id: string;
  userId: number;
  name: string;
  html: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
