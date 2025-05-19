// src/ai/flows/suggest-possible-causes.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting possible causes of out-of-control points on a spectrophotometer control chart.
 *
 * - suggestPossibleCauses - A function that takes spectrophotometer readings and identifies potential causes for deviations.
 * - SuggestPossibleCausesInput - The input type for the suggestPossibleCauses function, including control chart data.
 * - SuggestPossibleCausesOutput - The return type for the suggestPossibleCauses function, providing suggested causes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPossibleCausesInputSchema = z.object({
  controlChartData: z
    .string()
    .describe(
      'Data from the spectrophotometer control chart, including date, time, and readings.'
    ),
  outOfControlPoints: z
    .string()
    .describe(
      'A description of any identified out-of-control points, including the rule violated.'
    ),
});
export type SuggestPossibleCausesInput = z.infer<typeof SuggestPossibleCausesInputSchema>;

const SuggestPossibleCausesOutputSchema = z.object({
  possibleCauses: z
    .string()
    .describe(
      'A list of possible causes for the out-of-control points, based on the data and rules violated.'
    ),
});
export type SuggestPossibleCausesOutput = z.infer<typeof SuggestPossibleCausesOutputSchema>;

export async function suggestPossibleCauses(
  input: SuggestPossibleCausesInput
): Promise<SuggestPossibleCausesOutput> {
  return suggestPossibleCausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPossibleCausesPrompt',
  input: {schema: SuggestPossibleCausesInputSchema},
  output: {schema: SuggestPossibleCausesOutputSchema},
  prompt: `You are a quality control expert for spectrophotometers. Based on the control chart data and identified out-of-control points, provide a list of possible causes for the issues.

Control Chart Data: {{{controlChartData}}}
Out-of-Control Points: {{{outOfControlPoints}}}

Possible Causes:`,
});

const suggestPossibleCausesFlow = ai.defineFlow(
  {
    name: 'suggestPossibleCausesFlow',
    inputSchema: SuggestPossibleCausesInputSchema,
    outputSchema: SuggestPossibleCausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
