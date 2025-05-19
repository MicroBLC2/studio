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

  const { toast } = useToast();

  const handleAddReading = (value: number) => {
    const newReading: SpectroReading = {
      id: crypto.randomUUID(),
      value,
      timestamp: new Date(),
    };
    setReadings((prevReadings) => [...prevReadings, newReading]);
  };

  const fetchAiSuggestions = useCallback(async (currentReadings: SpectroReading[], oocPoints: OutOfControlPoint[]) => {
    if (oocPoints.length === 0) {
      setAiSuggestions(null);
      return;
    }

    setIsLoadingAiSuggestions(true);
    try {
      const controlChartDataString = JSON.stringify(currentReadings.map(r => ({ value: r.value, timestamp: r.timestamp.toISOString() })));
      const outOfControlPointsString = oocPoints
        .map(p => `Point at index ${p.index + 1} (value: ${p.value.toFixed(4)}) on ${p.type} violated ${p.limitViolated} (${p.limitValue.toFixed(4)}) at ${p.timestamp.toLocaleTimeString()}`)
        .join("\n");

      const result = await suggestPossibleCauses({
        controlChartData: controlChartDataString,
        outOfControlPoints: outOfControlPointsString,
      });
      setAiSuggestions(result.possibleCauses);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setAiSuggestions("Error fetching suggestions. Please try again.");
      toast({
        title: "AI Suggestion Error",
        description: "Could not fetch suggestions from the AI model.",
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
          fetchAiSuggestions(readings, oocPoints);
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
  }, [readings, fetchAiSuggestions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <DataInputForm onAddReading={handleAddReading} disabled={isLoadingAiSuggestions} />
        <ReadingsTable readings={readings} />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <ControlChart 
          readings={readings} 
          controlLimits={controlLimits} 
          outOfControlPoints={outOfControlPoints}
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
