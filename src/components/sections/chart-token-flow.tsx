"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyPoint } from "@/lib/types";

const chartConfig = {
  input: {
    label: "Input",
    color: "var(--chart-1)",
  },
  output: {
    label: "Output",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ChartTokenFlow({ daily }: { daily: DailyPoint[] }) {
  const data = daily.map((d) => ({
    date: d.label,
    input: d.tokensInput,
    output: d.tokensOutput,
  }));

  return (
    <Card className="animate__animated animate__fadeInUp animate-delay-2">
      <CardHeader>
        <CardTitle>Token flow</CardTitle>
        <CardDescription className="mt-1">
          New tokens per day, input and output
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="output"
              type="natural"
              fill="var(--color-output)"
              fillOpacity={0.4}
              stroke="var(--color-output)"
              stackId="a"
            />
            <Area
              dataKey="input"
              type="natural"
              fill="var(--color-input)"
              fillOpacity={0.4}
              stroke="var(--color-input)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
