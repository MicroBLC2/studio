
"use client";

import { useState, useEffect, useCallback } from "react";
import type { SpectroReading, ControlLimits, OutOfControlPoint } from "@/types";
import { DataInputForm } from "@/components/spectro/data-input-form";
import { ReadingsTable } from "@/components/spectro/readings-table";
import { ControlChart } from "@/components/spectro/control-chart";
import { AiSuggestions } from "@/components/spectro/ai-suggestions";
import { calculateIMRControlLimits, detectOutOfControlPoints } from "@/lib/chart-utils";
import { suggestPossibleCauses } from "@/ai/flows/suggest-possible-causes";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function SpectroControlPage() {
  const [readings, setReadings] = useState<SpectroReading[]>([]);
  const [controlLimits, setControlLimits] = useState<ControlLimits>({});
  const [outOfControlPoints, setOutOfControlPoints] = useState<OutOfControlPoint[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [targetValue, setTargetValue] = useState<number | null>(null);

  const { toast } = useToast();

  const handleAddReading = (value: number) => {
    const newReading: SpectroReading = {
      id: crypto.randomUUID(),
      value,
      timestamp: new Date(),
    };
    setReadings((prevReadings) => [...prevReadings, newReading]);
  };

  const handleSetTargetValue = (value: number | null) => {
    setTargetValue(value);
  };

  const fetchAiSuggestions = useCallback(async (currentReadings: SpectroReading[], oocPoints: OutOfControlPoint[], currentTargetValue: number | null) => {
    if (oocPoints.length === 0) {
      setAiSuggestions(null);
      return;
    }

    setIsLoadingAiSuggestions(true);
    try {
      const controlChartDataString = JSON.stringify(currentReadings.map(r => ({ value: r.value, timestamp: r.timestamp.toISOString() })));
      const outOfControlPointsString = oocPoints
        .map(p => `Point à l'indice ${p.index + 1} (valeur: ${p.value.toFixed(4)}) sur ${p.type} a violé ${p.limitViolated} (${p.limitValue.toFixed(4)}) à ${p.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`)
        .join("\n");

      const input: Parameters<typeof suggestPossibleCauses>[0] = {
        controlChartData: controlChartDataString,
        outOfControlPoints: outOfControlPointsString,
      };
      if (currentTargetValue !== null) {
        input.targetValue = currentTargetValue;
      }

      const result = await suggestPossibleCauses(input);
      setAiSuggestions(result.possibleCauses);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions IA:", error);
      setAiSuggestions("Erreur lors de la récupération des suggestions. Veuillez réessayer.");
      toast({
        title: "Erreur de Suggestion IA",
        description: "Impossible de récupérer les suggestions du modèle IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  }, [toast]);


  useEffect(() => {
    if (readings.length > 0) {
      const limits = calculateIMRControlLimits(readings);
      setControlLimits(limits);
      
      if (Object.keys(limits).length > 0) { // Check if limits are actually calculated
        const oocPoints = detectOutOfControlPoints(readings, limits);
        setOutOfControlPoints(oocPoints);
        
        if (oocPoints.length > 0) {
          fetchAiSuggestions(readings, oocPoints, targetValue);
        } else {
          setAiSuggestions(null); // Clear suggestions if no OOC points
        }
      } else {
        setOutOfControlPoints([]);
        setAiSuggestions(null);
      }
    } else {
        // Reset states if no readings
        setControlLimits({});
        setOutOfControlPoints([]);
        setAiSuggestions(null);
    }
  }, [readings, fetchAiSuggestions, targetValue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <DataInputForm 
          onAddReading={handleAddReading} 
          currentTargetValue={targetValue}
          onSetTargetValue={handleSetTargetValue}
          disabled={isLoadingAiSuggestions} 
        />
        <ReadingsTable readings={readings} />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <ControlChart 
          readings={readings} 
          controlLimits={controlLimits} 
          outOfControlPoints={outOfControlPoints}
          targetValue={targetValue}
        />
        <AiSuggestions 
          suggestions={aiSuggestions} 
          isLoading={isLoadingAiSuggestions} 
          hasOutOfControlPoints={outOfControlPoints.length > 0}
        />
      </div>
    </div>
  );
}
