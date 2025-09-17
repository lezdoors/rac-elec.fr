import { useState, useEffect, Suspense, lazy } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { StripePaymentSync } from "@/components/admin/stripe-payment-sync";

// CRITICAL: Dynamically import heavy recharts components only when dashboard charts are needed
const DashboardCharts = lazy(() => import('./dashboard-charts-core'));

import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Clock, 
  Bolt, 
  Calendar, 
  FileCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown,
  Download,
  Loader2,
  RefreshCw,
  ClipboardCheck, 
  Ban,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  CircleDashed
} from "lucide-react";
import { ServiceRequest, User } from "@shared/schema";
import { cn } from "@/lib/utils";

// Charts loading skeleton
function ChartsLoadingSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement des graphiques...</div>
      </div>
      <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement des statistiques...</div>
      </div>
    </div>
  );
}

// Re-export from original enhanced-dashboard with dynamic chart loading
export { default } from './enhanced-dashboard-core';