import { useEffect } from 'react';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Cette page redirige vers /admin/emails tout en maintenant 
 * le label 'Mail' dans la navigation pour plus de cohérence
 */
export default function MailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <Redirect to="/admin/emails" />
    </div>
  );
}