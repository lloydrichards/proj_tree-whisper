"use client";

import type { Species } from "@repo/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export const columns: ColumnDef<Species>[] = [
  {
    accessorKey: "scientificName",
    header: "Scientific Name",
  },
  {
    accessorKey: "commonName",
    header: "Common Name",
  },
  {
    accessorKey: "family",
    header: "Family",
  },
  {
    accessorKey: "genus",
    header: "Genus",
  },
  {
    accessorKey: "growthHabit",
    header: "Growth Habit",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.growthHabit?.map((habit: string) => (
          <Badge key={habit}>{habit}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "growthRate",
    header: "Growth Rate",
    cell: ({ row }) =>
      row.original.growthRate ? <Badge>{row.original.growthRate}</Badge> : null,
  },
  {
    accessorKey: "light",
    header: "Light",
    cell: ({ row }) =>
      row.original.light != null ? (
        <Progress max={10} value={row.original.light} />
      ) : null,
  },
  {
    accessorKey: "humidity",
    header: "Humidity",
    cell: ({ row }) =>
      row.original.humidity != null ? (
        <Progress max={10} value={row.original.humidity} />
      ) : null,
  },
  {
    accessorKey: "soilPh",
    header: "Soil pH Range",
    cell: ({ row }) => {
      const { soilPhMin, soilPhMax } = row.original;
      if (soilPhMin != null && soilPhMax != null) {
        return (
          <Slider
            className="w-24"
            disabled
            max={14}
            min={0}
            thumbsDisabled
            value={[soilPhMin, soilPhMax]}
          />
        );
      }
      return null;
    },
  },
  {
    accessorKey: "soilNutriments",
    header: "Soil Nutriments",
    cell: ({ row }) =>
      row.original.soilNutriments != null ? (
        <Progress max={10} value={row.original.soilNutriments} />
      ) : null,
  },
  {
    accessorKey: "soilSalinity",
    header: "Soil Salinity",
    cell: ({ row }) =>
      row.original.soilSalinity != null ? (
        <Progress max={10} value={row.original.soilSalinity} />
      ) : null,
  },
  {
    accessorKey: "soilTexture",
    header: "Soil Texture",
    cell: ({ row }) =>
      row.original.soilTexture != null ? (
        <Progress max={10} value={row.original.soilTexture} />
      ) : null,
  },
  {
    accessorKey: "soilHumidity",
    header: "Soil Humidity",
    cell: ({ row }) =>
      row.original.soilHumidity != null ? (
        <Progress max={10} value={row.original.soilHumidity} />
      ) : null,
  },
];

interface SpeciesTableProps {
  data: typeof Species.Array.Type;
}

export function SpeciesTable({ data }: SpeciesTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}

// Duplicate columns removed
