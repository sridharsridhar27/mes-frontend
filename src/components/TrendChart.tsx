"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

export default function TrendChart({
  data,
  parameterName,
  subParamMap,
  specMin,
  specMax,
}: any) {
  const chartRef = useRef<HTMLDivElement>(null);

  // ⭐ DOWNLOAD FUNCTION
  const downloadPNG = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `${parameterName || "chart"}.png`;
    link.click();
  };

  return (
    <div>
      {/* ⭐ BUTTON */}
      <div className="mb-4">
        <button
          onClick={downloadPNG}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Download Graph (PNG)
        </button>
      </div>

      {/* ⭐ GRAPH WRAPPER */}
      <div ref={chartRef}>
        <LineChart width={950} height={420} data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
  dataKey="label"
  label={{
    value: "Date & Time",
    position: "insideBottom",
    offset: -5,
  }}
/>

          <YAxis
            label={{
              value: parameterName || "Value",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip />
          <Legend />

        {/* ✅ MIN SPEC */}
{specMin !== null && specMin !== undefined && (
  <ReferenceLine
    y={specMin}
    stroke="red"
    strokeDasharray="5 5"
    label={{
      value: `Min (${specMin})`,
      position: "insideTopLeft",
      fill: "red",
      fontSize: 12,
    }}
  />
)}

{/* ✅ MAX SPEC */}
{specMax !== null && specMax !== undefined && (
  <ReferenceLine
    y={specMax}
    stroke="green"
    strokeDasharray="5 5"
    label={{
      value: `Max (${specMax})`,
      position: "insideTopLeft",
      fill: "green",
      fontSize: 12,
    }}
  />
)}

          {/* DYNAMIC LINES */}
          {Object.entries(subParamMap).map(
            ([key, config]: any) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config.color}
                name={config.name}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )
          )}
        </LineChart>
      </div>
    </div>
  );
}