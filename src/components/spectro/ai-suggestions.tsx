"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react"; // Or Wand2, Sparkles

type AiSuggestionsProps = {
  suggestions: string | null;
  isLoading: boolean;
  hasOutOfControlPoints: boolean;
};

export function AiSuggestions({ suggestions, isLoading, hasOutOfControlPoints }: AiSuggestionsProps) {
  if (!hasOutOfControlPoints && !isLoading) {
    return null; // Don't show if no OOC points and not loading initial suggestions
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          Suggestions de l'IA
        </CardTitle>
        <CardDescription>
          Causes potentielles des points hors contrôle identifiés.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        )}
        {!isLoading && suggestions && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {suggestions.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
        {!isLoading && !suggestions && hasOutOfControlPoints && (
          <p className="text-muted-foreground">Aucune suggestion disponible pour le moment.</p>
        )}
         {!isLoading && !suggestions && !hasOutOfControlPoints && (
          <p className="text-muted-foreground">Aucun point hors contrôle détecté pour fournir des suggestions.</p>
        )}
      </CardContent>
    </Card>
  );
}
