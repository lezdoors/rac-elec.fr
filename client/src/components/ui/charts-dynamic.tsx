import { Suspense, lazy } from "react";
// No skeleton component needed - using custom loading state

// Dynamic import of the heavy charts library - only loaded when needed
const ChartsCore = lazy(() => import("./charts-core"));

interface ChartProps {
  data: any[];
  title?: string;
  description?: string;
  className?: string;
}

interface BarChartProps extends ChartProps {
  valueFormatter?: (value: number) => string;
}

interface PieChartProps extends ChartProps {
  innerRadius?: number;
  outerRadius?: number;
}

// Chart fallback skeleton
function ChartSkeleton({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="space-y-4">
      {title && <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />}
      {description && <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />}
      <div className="h-[350px] w-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement du graphique...</div>
      </div>
    </div>
  );
}

// Lightweight dynamic bar chart wrapper
export function BarChart(props: BarChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton title={props.title} description={props.description} />}>
      <ChartsCore {...props} type="bar" />
    </Suspense>
  );
}

// Lightweight dynamic pie chart wrapper
export function PieChart(props: PieChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton title={props.title} description={props.description} />}>
      <ChartsCore {...props} type="pie" />
    </Suspense>
  );
}

// Export dynamic versions
export { ChartsCore };
export type { ChartProps, BarChartProps, PieChartProps };