// HEAVY MODULE - Only loaded when charts are actually rendered
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
  type: 'bar' | 'pie';
}

interface BarChartProps extends ChartProps {
  valueFormatter?: (value: number) => string;
  type: 'bar';
}

interface PieChartProps extends ChartProps {
  innerRadius?: number;
  outerRadius?: number;
  type: 'pie';
}

type ChartsUnionProps = BarChartProps | PieChartProps;

export default function ChartsCore(props: ChartsUnionProps) {
  if (props.type === 'bar') {
    const { data, title, description, className, valueFormatter = (value: number) => String(value) } = props as BarChartProps;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-4", className)}
      >
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
              formatter={(value: any) => [valueFormatter(value), "Valeur"]}
              labelFormatter={(label) => `Période: ${label}`}
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (props.type === 'pie') {
    const { data, title, description, className, innerRadius = 60, outerRadius = 100 } = props as PieChartProps;
    const [activeIndex, setActiveIndex] = useState<number | undefined>();

    const renderActiveShape = (props: any) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
      const RADIAN = Math.PI / 180;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const sx = cx + (outerRadius + 10) * cos;
      const sy = cy + (outerRadius + 10) * sin;
      const mx = cx + (outerRadius + 30) * cos;
      const my = cy + (outerRadius + 30) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? 'start' : 'end';

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={12} fontWeight="bold">
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
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
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
            {`${value} (${(percent * 100).toFixed(0)}%)`}
          </text>
        </g>
      );
    };

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("space-y-4", className)}
      >
        {title && <h4 className="text-sm font-medium">{title}</h4>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <ResponsiveContainer width="100%" height={350}>
          <RechartsPieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [value, "Valeur"]} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return null;
}