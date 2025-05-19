// src/ai/flows/suggest-possible-causes.ts
'use server';

/**
 * @fileOverview Ce fichier définit un flux Genkit pour suggérer les causes possibles des points hors contrôle sur une carte de contrôle de spectrophotomètre.
 *
 * - suggestPossibleCauses - Une fonction qui prend les lectures du spectrophotomètre et identifie les causes potentielles des écarts.
 * - SuggestPossibleCausesInput - Le type d'entrée pour la fonction suggestPossibleCauses, incluant les données de la carte de contrôle.
 * - SuggestPossibleCausesOutput - Le type de retour pour la fonction suggestPossibleCauses, fournissant les causes suggérées.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPossibleCausesInputSchema = z.object({
  controlChartData: z
    .string()
    .describe(
      'Données de la carte de contrôle du spectrophotomètre, incluant date, heure et lectures.'
    ),
  outOfControlPoints: z
    .string()
    .describe(
      'Une description de tous les points hors contrôle identifiés, y compris la règle violée.'
    ),
});
export type SuggestPossibleCausesInput = z.infer<typeof SuggestPossibleCausesInputSchema>;

const SuggestPossibleCausesOutputSchema = z.object({
  possibleCauses: z
    .string()
    .describe(
      'Une liste des causes possibles des points hors contrôle, basée sur les données et les règles violées.'
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
  prompt: `Vous êtes un expert en contrôle qualité pour les spectrophotomètres. En vous basant sur les données de la carte de contrôle et les points hors contrôle identifiés, fournissez une liste des causes possibles des problèmes.

Données de la Carte de Contrôle : {{{controlChartData}}}
Points Hors Contrôle : {{{outOfControlPoints}}}

Causes Possibles :`,
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
