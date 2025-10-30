import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Theme configuration
const THEMES = { light: "", dark: ".dark" };

// Create context for chart configuration
const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef(({ 
  id, 
  className, 
  children, 
  config, 
  ...props 
}, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/[^a-zA-Z0-9-]/g, '')}`;
  
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }) => {
  if (!config) return null;
  
  const colorConfig = Object.entries(config).filter(([_, itemConfig]) => 
    itemConfig && (itemConfig.theme || itemConfig.color)
  );
  
  if (!colorConfig.length) {
    return null;
  }

  const styles = Object.entries(THEMES).map(([theme, prefix]) => {
    const themeStyles = colorConfig
      .map(([key, itemConfig]) => {
        const color = itemConfig.theme?.[theme] || itemConfig.color;
        return color ? `  --color-${key}: ${color};` : null;
      })
      .filter(Boolean)
      .join("\n");

    return themeStyles ? `${prefix} [data-chart="${id}"] {\n${themeStyles}\n}` : '';
  }).filter(Boolean).join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
};

// Re-export recharts components with proper display names
const ChartTooltip = RechartsPrimitive.Tooltip;
ChartTooltip.displayName = 'ChartTooltip';

const ChartTooltipContent = React.forwardRef(({ 
  className, 
  hideLabel, 
  ...props 
}, ref) => {
  const { active, payload, label } = props;
  
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {!hideLabel && <div className="font-medium mb-1">{label}</div>}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {item.name}:
            </span>
            <span className="ml-1 font-medium">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

ChartTooltipContent.displayName = 'ChartTooltipContent';

// Export all components
const Chart = {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  // Re-export commonly used Recharts components
  AreaChart: RechartsPrimitive.AreaChart,
  BarChart: RechartsPrimitive.BarChart,
  LineChart: RechartsPrimitive.LineChart,
  PieChart: RechartsPrimitive.PieChart,
  Area: RechartsPrimitive.Area,
  Bar: RechartsPrimitive.Bar,
  Line: RechartsPrimitive.Line,
  XAxis: RechartsPrimitive.XAxis,
  YAxis: RechartsPrimitive.YAxis,
  CartesianGrid: RechartsPrimitive.CartesianGrid,
  Tooltip: RechartsPrimitive.Tooltip,
  Legend: RechartsPrimitive.Legend,
  ResponsiveContainer: RechartsPrimitive.ResponsiveContainer,
  Cell: RechartsPrimitive.Cell,
  Pie: RechartsPrimitive.Pie,
  Sector: RechartsPrimitive.Sector,
  ComposedChart: RechartsPrimitive.ComposedChart,
  Scatter: RechartsPrimitive.Scatter,
  ScatterChart: RechartsPrimitive.ScatterChart,
  ReferenceLine: RechartsPrimitive.ReferenceLine,
  ReferenceArea: RechartsPrimitive.ReferenceArea,
  Label: RechartsPrimitive.Label,
  LabelList: RechartsPrimitive.LabelList,
  PolarGrid: RechartsPrimitive.PolarGrid,
  PolarAngleAxis: RechartsPrimitive.PolarAngleAxis,
  PolarRadiusAxis: RechartsPrimitive.PolarRadiusAxis,
  Radar: RechartsPrimitive.Radar,
  RadarChart: RechartsPrimitive.RadarChart,
  RadialBar: RechartsPrimitive.RadialBar,
  RadialBarChart: RechartsPrimitive.RadialBarChart,
  Treemap: RechartsPrimitive.Treemap,
};

export default Chart;