import { motion } from "framer-motion";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend, Pie, PieChart as RechartsPieChart, Sector } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

const colors = [
  "#33b060", // Vert Enedis principal
  "#2e3d96", // Bleu Enedis principal
  "#78c1a3", // Vert Enedis secondaire
  "#6468a4", // Bleu Enedis secondaire
  "#ff9800", // Orange
  "#4caf50", // Vert
  "#f44336", // Rouge
  "#03a9f4", // Bleu clair
  "#9c27b0", // Violet
];

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

export function BarChart({ data, title, description, className, valueFormatter = (value: number) => String(value) }: BarChartProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h4 className="text-sm font-medium">{title}</h4>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <ResponsiveContainer width="100%" height={350}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={valueFormatter}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {payload[0].name}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {valueFormatter(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Composant pour le secteur actif du PieChart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent, name, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888" fontSize={14}>
        {name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
        {value}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#888" fontSize={14}>
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export function PieChart({ data, title, description, className, innerRadius = 60, outerRadius = 80 }: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h4 className="text-sm font-medium">{title}</h4>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <ResponsiveContainer width="100%" height={350}>
        <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0].name}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}