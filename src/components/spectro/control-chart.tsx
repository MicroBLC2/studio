
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
  targetValue?: number | null;
};

const chartConfigBase = {
  value: { label: "Valeur", color: "hsl(var(--chart-1))" },
  uclX: { label: "LSC (I)", color: "hsl(var(--destructive))" },
  clX: { label: "LC (I)", color: "hsl(var(--primary))" },
  lclX: { label: "LIC (I)", color: "hsl(var(--destructive))" },
  mr: { label: "EM", color: "hsl(var(--chart-2))" }, 
  uclMR: { label: "LSC (EM)", color: "hsl(var(--destructive))" },
  clMR: { label: "LC (EM)", color: "hsl(var(--accent))" },
  lclMR: { label: "LIC (EM)", color: "hsl(var(--destructive))" },
  ooc: { label: "Hors Contrôle", color: "hsl(var(--destructive))" },
  target: { label: "Cible", color: "hsl(var(--chart-3))" },
};

const CustomizedDot = (props: any) => {
  const { cx, cy, stroke, payload, isOutOfControl } = props;
  if (isOutOfControl) {
    return <Dot cx={cx} cy={cy} r={5} fill="hsl(var(--destructive))" stroke={stroke} strokeWidth={2} />;
  }
  return <Dot cx={cx} cy={cy} r={3} fill={stroke} />;
};

export function ControlChart({ readings, controlLimits, outOfControlPoints, targetValue }: ControlChartProps) {
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
        name: reading.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

  if (readings.length < 2 && readings.length === 0) { // Show message if no readings, or only 1 reading for MR
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="mr-2 h-6 w-6 text-primary" />
            Cartes de Contrôle (I-EM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground h-[300px] flex items-center justify-center">
            Au moins 1 mesure est nécessaire pour la carte I et 2 mesures pour la carte EM.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const yDomainMargin = (dataKey: 'value' | 'mr', currentTargetValue?: number | null) => {
    const values = chartData.map(d => d[dataKey]).filter(v => typeof v === 'number') as number[];
    if (currentTargetValue !== null && currentTargetValue !== undefined && dataKey === 'value') {
        values.push(currentTargetValue);
    }
    if (values.length === 0) return [0, 1];

    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);

    if (dataKey === 'value') {
        if (controlLimits.lclX !== undefined) minVal = Math.min(minVal, controlLimits.lclX);
        if (controlLimits.uclX !== undefined) maxVal = Math.max(maxVal, controlLimits.uclX);
    } else if (dataKey === 'mr') {
        if (controlLimits.lclMR !== undefined) minVal = Math.min(minVal, controlLimits.lclMR);
        if (controlLimits.uclMR !== undefined) maxVal = Math.max(maxVal, controlLimits.uclMR);
    }
    
    const range = maxVal - minVal;
    const margin = range === 0 ? 0.5 : range * 0.1; // Add a small margin if range is 0
    return [minVal - margin, maxVal + margin];
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
            Carte des Individuels (I)
          </CardTitle>
          <CardDescription>Suit les mesures individuelles au fil du temps. {targetValue !== null ? `Cible : ${targetValue.toFixed(4)}` : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigBase} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => value.toFixed(3)} domain={yDomainMargin('value', targetValue)} tick={{ fontSize: 12 }} />
              <Tooltip
                content={<ChartTooltipContent indicator="line" />}
                wrapperStyle={{ outline: "none" }}
                cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1 }}
              />
              {targetValue !== null && targetValue !== undefined && (
                <ReferenceLine 
                  y={targetValue} 
                  label={{ value: "Cible", position: "insideTopLeft", fill: "hsl(var(--chart-3))", fontSize: 10 }} 
                  stroke="hsl(var(--chart-3))" 
                  strokeDasharray="4 4" 
                />
              )}
              {controlLimits.uclX !== undefined && <ReferenceLine y={controlLimits.uclX} label={{ value: "LSC", position: "insideTopRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              {controlLimits.meanX !== undefined && <ReferenceLine y={controlLimits.meanX} label={{ value: "LC", position: "insideTopRight", fill: "hsl(var(--primary))", fontSize: 10 }} stroke="hsl(var(--primary))" strokeDasharray="3 3" />}
              {controlLimits.lclX !== undefined && <ReferenceLine y={controlLimits.lclX} label={{ value: "LIC", position: "insideBottomRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
              
              <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={<CustomizedDot isOutOfControl={false} />} activeDot={{ r: 6 }} name="Valeur" />
              {oocIData.length > 0 && (
                 <Scatter data={oocIData} fill="hsl(var(--destructive))" shape={<CustomizedDot isOutOfControl={true} />} name="HC (I)" />
              )}
               <Legend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {readings.length >= 2 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
              Carte de l'Étendue Mobile (EM)
            </CardTitle>
            <CardDescription>Suit la variation entre les mesures consécutives.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigBase} className="h-[300px] w-full">
              <LineChart data={chartData.slice(1)} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}> {/* MR chart starts from 2nd point */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => value.toFixed(3)} domain={yDomainMargin('mr')} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={<ChartTooltipContent indicator="line" />}
                  wrapperStyle={{ outline: "none" }}
                   cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1 }}
                />
                {controlLimits.uclMR !== undefined && <ReferenceLine y={controlLimits.uclMR} label={{ value: "LSC", position: "insideTopRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
                {controlLimits.meanMR !== undefined && <ReferenceLine y={controlLimits.meanMR} label={{ value: "LC", position: "insideTopRight", fill: "hsl(var(--accent))", fontSize: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
                {controlLimits.lclMR !== undefined && controlLimits.lclMR > 0 && <ReferenceLine y={controlLimits.lclMR} label={{ value: "LIC", position: "insideBottomRight", fill: "hsl(var(--destructive))", fontSize: 10 }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />}
                <Line type="monotone" dataKey="mr" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={<CustomizedDot isOutOfControl={false}/>} activeDot={{ r: 6 }} name="EM" />
                 {oocMRData.length > 0 && (
                   <Scatter data={oocMRData} fill="hsl(var(--destructive))" shape={<CustomizedDot isOutOfControl={true} />} name="HC (EM)" />
                )}
                <Legend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
       {outOfControlPoints.length > 0 && (
        <Card className="shadow-lg border-destructive">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Points Hors Contrôle Détectés !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-destructive">
              {outOfControlPoints.map((p, i) => (
                <li key={i}>
                  Point à {p.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (Indice {p.index +1}, Valeur: {p.value.toFixed(4)}) sur {p.type === 'I-Chart' ? 'Carte I' : 'Carte EM'} est {p.limitViolated === 'UCL' ? 'au-dessus' : 'en dessous'} de {p.limitViolated} ({p.limitValue.toFixed(4)}).
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
