
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Target, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  value: z.coerce.number().min(-10000, "Valeur trop petite").max(10000, "Valeur trop grande"),
  operatorName: z.string().min(1, "Le nom de l'opérateur est requis.").max(50, "Le nom de l'opérateur est trop long."),
});

type DataInputFormProps = {
  onAddReading: (data: { value: number; operatorName: string }) => void;
  currentTargetValue: number | null;
  onSetTargetValue: (value: number | null) => void;
  disabled?: boolean;
};

export function DataInputForm({ onAddReading, currentTargetValue, onSetTargetValue, disabled }: DataInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      operatorName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddReading({ value: values.value, operatorName: values.operatorName });
    form.resetField("value"); 
    // Ne pas réinitialiser le nom de l'opérateur pour faciliter les saisies multiples par le même opérateur
  }

  const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      onSetTargetValue(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onSetTargetValue(numValue);
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Target className="mr-2 h-6 w-6 text-primary" />
          Définir la Valeur Cible
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="targetValue">Valeur Cible (Optionnel)</Label>
          <Input
            id="targetValue"
            type="number"
            placeholder="Entrez la valeur cible"
            value={currentTargetValue === null ? "" : currentTargetValue.toString()}
            onChange={handleTargetChange}
            step="any"
            disabled={disabled}
            className="text-base md:text-sm"
          />
        </div>
      </CardContent>
      
      <Separator className="my-4" />

      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <PlusCircle className="mr-2 h-6 w-6 text-primary" />
          Ajouter une Nouvelle Mesure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="operatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Nom de l'Opérateur
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom de l'opérateur" {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valeur du Spectrophotomètre</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Entrez la mesure" {...field} step="any" disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter la Mesure
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
