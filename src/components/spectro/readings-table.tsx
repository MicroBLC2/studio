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
            Recorded Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No readings entered yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ListOrdered className="mr-2 h-6 w-6 text-primary" />
          Recorded Readings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[100px]">Index</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading, index) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{reading.timestamp.toLocaleString()}</TableCell>
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
