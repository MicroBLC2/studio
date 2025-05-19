"use client";

import type { SpectroReading, ControlLimits, ChartDataPoint, OutOfControlPoint } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend, Dot, Scatter } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LineChart as LineChartIcon } from 'lucide-react';

type ControlChartProps = {
  readings: SpectroReading[];
  controlLimits: ControlLimits;
  outOfControlPoints: OutOfControlPoint[];
};

const chartConfigBase = {
  value: { label: "Value", color: "hsl(var(--chart-1))" },
  uclX: { label: "UCL (I)", color: "hsl(var(--destructive))" },
  clX: { label: "CL (I)", color: "hsl(var(--primary))" },
  lclX: { label: "LCL (I)", color: "hsl(var(--destructive))" },
  mr: { label: "MR", color: "hsl(var(--chart-2))" },
  uclMR: { label: "UCL (MR)", color: "hsl(var(--destructive))" },
  clMR: { label: "CL (MR)", color: "hsl(var(--accent))" },
  lclMR: { label: "LCL (MR)", color: "hsl(var(--destructive))" },
  ooc: { label: "Out of Control", color: "hsl(var(--destructive))" },
};

const CustomizedDot = (props: any) => {
  const { cx, cy, stroke, payload, isOutOfControl } = props;
  if (isOutOfControl) {
    return <Dot cx={cx} cy={cy} r={5} fill="hsl(var(--destructive))" stroke={stroke} strokeWidth={2} />;
  }
  return <Dot cx={cx} cy={cy} r={3} fill={stroke} />;
};

export function ControlChart({ readings, controlLimits, outOfControlPoints }: ControlChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const newChartData: ChartDataPoint[] = readings.map((reading, index) => {
      let mrValue: number | undefined = undefined;
      if (index > 0) {
        mrValue = Math.abs(reading.value - readings[index - 1].value);
      }
      const isOocX = outOfControlPoints.some(p => p.index === index && p.type === 'I-Chart');
      const isOocMR = outOfControlPoints.some(p => p.index === index && p.type === 'MR-Chart' && mrValue === p.value);
      
      return {
        name: reading.timestamp.toLocaleTimeString(), // Use time for x-axis, or index
        value: reading.value,
        mr: mrValue,
        uclX: controlLimits.uclX,
        clX: controlLimits.meanX,
        lclX: controlLimits.lclX,
        uclMR: controlLimits.uclMR,
        clMR: controlLimits.meanMR,
        lclMR: controlLimits.lclMR,
        isOutOfControlX: isOocX,
        isOutOfControlMR: isOocMR,
      };
    });
    setChartData(newChartData);
  }, [readings, controlLimits, outOfControlPoints]);

  const oocIData = useMemo(() => chartData.filter(d => d.isOutOfControlX).map(d => ({ ...d, value: d.value! })), [chartData]);
  const oocMRData = useMemo(() => chartData.filter(d => d.isOutOfControlMR && d.mr !== undefined).map(d => ({ ...d, value: d.mr! })), [chartData]);

  if (readings.length < 2) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="mr-2 h-6 w-6 text-primary" />
            Control Charts (I-MR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground h-[300px] flex items-center justify-center">
            At least 2 readings are required to generate control charts.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const yDomainMargin = (dataKey: 'value' | 'mr') => {
    const values = chartData.map(d => d[dataKey]).filter(v => typeof v === 'number') as number[];
    if (values.length === 0) return [0, 1];
    const min = Math.min(...values, dataKey === 'value' ? (controlLimits.lclX ?? 0) : (controlLimits.lclMR ?? 0) );
    const max = Math.max(...values, dataKey === 'value' ? (controlLimits.uclX ?? 1) : (controlLimits.uclMR ?? 1) );
    const range = max - min;
    return [min - range * 0.1, max + range * 0.1];
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
            Individuals (I) Chart
          </CardTitle>
          <CardDescription>Tracks individual measurements over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigBase} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => value.toFixed(3)} domain={yDomainMargin('value')} tick={{ fontSize: 12 }} />
              <Tooltip
                content={<ChartTooltipContent indicator="line" />}
                wrapperStyle={{ outline: "none" }}
                cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1 }}
              />
              {controlLimits.uclX !== undefined && <ReferenceLine y={controlLimits.uclX} label={{ value: "UCL", position: "insideTopRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              {controlLimits.meanX !== undefined && <ReferenceLine y={controlLimits.meanX} label={{ value: "CL", position: "insideTopRight", fill: "hsl(var(--primary))", fontSize: 10 }} stroke="hsl(var(--primary))" strokeDasharray="3 3" />}
              {controlLimits.lclX !== undefined && <ReferenceLine y={controlLimits.lclX} label={{ value: "LCL", position: "insideBottomRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={<CustomizedDot isOutOfControl={false} />} activeDot={{ r: 6 }} name="Value" />
              {oocIData.length > 0 && (
                 <Scatter data={oocIData} fill="hsl(var(--destructive))" shape={<CustomizedDot isOutOfControl={true} />} name="OOC (I)" />
              )}
               <Legend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
            Moving Range (MR) Chart
          </CardTitle>
          <CardDescription>Tracks the variation between consecutive measurements.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigBase} className="h-[300px] w-full">
            <LineChart data={chartData.slice(1)} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* MR chart starts from 2nd point */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => value.toFixed(3)} domain={yDomainMargin('mr')} tick={{ fontSize: 12 }} />
              <Tooltip
                content={<ChartTooltipContent indicator="line" />}
                wrapperStyle={{ outline: "none" }}
                 cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1 }}
              />
              {controlLimits.uclMR !== undefined && <ReferenceLine y={controlLimits.uclMR} label={{ value: "UCL", position: "insideTopRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              {controlLimits.meanMR !== undefined && <ReferenceLine y={controlLimits.meanMR} label={{ value: "CL", position: "insideTopRight", fill: "hsl(var(--accent))", fontSize: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
              {controlLimits.lclMR !== undefined && controlLimits.lclMR > 0 && <ReferenceLine y={controlLimits.lclMR} label={{ value: "LCL", position: "insideBottomRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              <Line type="monotone" dataKey="mr" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={<CustomizedDot isOutOfControl={false}/>} activeDot={{ r: 6 }} name="MR" />
               {oocMRData.length > 0 && (
                 <Scatter data={oocMRData} fill="hsl(var(--destructive))" shape={<CustomizedDot isOutOfControl={true} />} name="OOC (MR)" />
              )}
              <Legend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
       {outOfControlPoints.length > 0 && (
        <Card className="shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Out-of-Control Points Detected!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-destructive">
              {outOfControlPoints.map((p, i) => (
                <li key={i}>
                  Point at {p.timestamp.toLocaleTimeString()} (Index {p.index +1}, Value: {p.value.toFixed(4)}) on {p.type} is {p.limitViolated === 'UCL' ? 'above' : 'below'} {p.limitViolated} ({p.limitValue.toFixed(4)}).
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
