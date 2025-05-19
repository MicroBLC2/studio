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
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  value: z.coerce.number().min(-10000, "Value too small").max(10000, "Value too large"), // Adjust min/max as needed
});

type DataInputFormProps = {
  onAddReading: (value: number) => void;
  disabled?: boolean;
};

export function DataInputForm({ onAddReading, disabled }: DataInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined, // So placeholder shows
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddReading(values.value);
    form.reset(); // Reset form after submission
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <PlusCircle className="mr-2 h-6 w-6 text-primary" />
          Add New Reading
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spectrophotometer Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter reading" {...field} step="any" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Reading
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
