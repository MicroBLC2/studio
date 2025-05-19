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
          AI-Powered Suggestions
        </CardTitle>
        <CardDescription>
          Potential causes for the identified out-of-control points.
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
          <p className="text-muted-foreground">No suggestions available at the moment.</p>
        )}
         {!isLoading && !suggestions && !hasOutOfControlPoints && (
          <p className="text-muted-foreground">No out-of-control points detected to provide suggestions for.</p>
        )}
      </CardContent>
    </Card>
  );
}
