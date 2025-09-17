// Lightweight chart alternatives - NO HEAVY DEPENDENCIES!
// Replaces recharts (60KB+) with simple CSS-based visualizations

interface ChartData {
  name: string;
  value: number;
}

// Lightweight pie chart using CSS only
export function LightweightPieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-xs text-gray-500">{item.value} ({percentage}%)</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lightweight line chart using CSS gradients
export function LightweightLineChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end h-32 space-x-1">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-1">
              <div className="text-xs font-medium text-blue-600">{item.value}€</div>
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-500 rotate-45 origin-left">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lightweight bar chart using CSS flexbox
export function LightweightBarChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-32 text-sm font-medium truncate" title={item.name}>
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${width}%` }}
              >
                <span className="text-white text-xs font-medium">{item.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}