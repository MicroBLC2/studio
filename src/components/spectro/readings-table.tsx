
import type { SpectroReading } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";

type ReadingsTableProps = {
  readings: SpectroReading[];
};

export function ReadingsTable({ readings }: ReadingsTableProps) {
  if (readings.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
             <ListOrdered className="mr-2 h-6 w-6 text-primary" />
            Mesures Enregistrées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune mesure enregistrée pour l'instant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ListOrdered className="mr-2 h-6 w-6 text-primary" />
          Mesures Enregistrées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">Indice</TableHead>
                <TableHead>Horodatage</TableHead>
                <TableHead>Opérateur</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading, index) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{reading.timestamp.toLocaleString('fr-FR')}</TableCell>
                  <TableCell>{reading.operatorName}</TableCell>
                  <TableCell className="text-right">{reading.value.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
