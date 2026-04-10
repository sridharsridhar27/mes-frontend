"use client";

import { useEffect, useState, use } from "react";
import TrendChart from "@/components/TrendChart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ParamsType = {
  lineId: string;
};

export default function AnalyticsPage({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  const resolvedParams = use(params);
  const lineId = resolvedParams.lineId;

  const [structure, setStructure] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<number | null>(null);

  // LOAD STRUCTURE
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/master/structure?lineId=${lineId}`
    )
      .then((res) => res.json())
      .then((data) => setStructure(data));
  }, [lineId]);

  // LOAD RANGE DATA
  useEffect(() => {
    if (!startDate || !endDate) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entries/by-range?lineId=${lineId}&startDate=${startDate}&endDate=${endDate}`
    )
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }, [startDate, endDate, lineId]);

  // FILTER
  const getFilteredEntries = () => {
    if (!selectedProcess || !selectedParameter) return [];

    return entries.filter(
      (e: any) =>
        e.processId === selectedProcess &&
        e.parameterId === selectedParameter
    );
  };

  // BUILD GRAPH DATA
  const buildChartData = (entries: any[]) => {
    const TIME_ORDER = ["9AM", "11:30AM", "2PM", "4PM"];

    const filtered = entries.filter(
      (e) => e.value !== null && e.value !== ""
    );

    const sorted = filtered.sort((a, b) => {
      const d1 = new Date(a.entryDate).getTime();
      const d2 = new Date(b.entryDate).getTime();

      if (d1 !== d2) {
        return d1 - d2;
      }

      return (
        TIME_ORDER.indexOf(a.timeSlot) -
        TIME_ORDER.indexOf(b.timeSlot)
      );
    });

    const map: any = {};

    sorted.forEach((e) => {
      const dateObj = new Date(e.entryDate);

const day   = String(dateObj.getDate()).padStart(2, "0");
const month = String(dateObj.getMonth() + 1).padStart(2, "0");
const year  = dateObj.getFullYear();

// ✅ FINAL LABEL
const label = `${day}/${month}/${year} ${e.timeSlot}`;

      if (!map[label]) {
        map[label] = { label };
      }

      const key = e.subParameterId
        ? `sub_${e.subParameterId}`
        : "main";

      map[label][key] = Number(e.value);
    });

    return Object.values(map);
  };

  const chartData = buildChartData(getFilteredEntries());

  // ⭐ SUB PARAM MAP (UPDATED WITH FALLBACK)
  const subParamMap: any = {};
  
  const selectedParamObj = structure
    .find((p: any) => p.id === selectedProcess)
    ?.parameters.find((p: any) => p.id === selectedParameter);

  // CASE 1: Sub Parameters
  if (selectedParamObj?.subParameters?.length > 0) {
    selectedParamObj.subParameters.forEach(
      (sub: any, index: number) => {
        const colors = [
          "#8884d8",
          "#82ca9d",
          "#ff7300",
          "#ff0000",
        ];

        subParamMap[`sub_${sub.id}`] = {
          name: sub.name,
          color: colors[index % colors.length],
        };
      }
    );
  }
  // CASE 2: Single Parameter
  else if (selectedParamObj) {
    subParamMap["main"] = {
      name: selectedParamObj.name,
      color: "#8884d8",
    };
  }

  const exportToExcel = () => {
  if (!chartData.length) return;

  // Build sheet data
  const sheetData = chartData.map((row: any) => {
    const formatted: any = {
      "Date-Time": row.label,
    };

    Object.keys(subParamMap).forEach((key) => {
      const name = subParamMap[key].name;
      formatted[name] = row[key] ?? "";
    });

    return formatted;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sheetData);

  // ⭐ Add column width (AUTO SIZE)
  const colWidths = Object.keys(sheetData[0] || {}).map(
    (key) => ({
      wch: key.length + 5,
    })
  );
  worksheet["!cols"] = colWidths;

  // ⭐ Add bold header (basic)
  const range = XLSX.utils.decode_range(
    worksheet["!ref"] || ""
  );

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({
      r: 0,
      c: C,
    });

    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
    };
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // ⭐ Sheet name dynamic
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    selectedParamObj?.name || "Analytics"
  );

  // Write file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // ⭐ Better file name
  const fileName = `${
    selectedParamObj?.name || "analytics"
  }_${startDate}_to_${endDate}.xlsx`;

  saveAs(blob, fileName);
};

  return (
  <div className="min-h-screen bg-gray-100 p-6">
    {/* HEADER */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">
        📊 Analytics Dashboard
      </h1>
      <p className="text-gray-500 text-sm">
        Monitor trends, analyze parameters, and export insights
      </p>
    </div>

    {/* FILTER CARD */}
<div
  className="
    bg-white p-4 rounded-xl shadow-md mb-6
    flex flex-wrap gap-4 items-end
  "
>
  {/* DATE INPUT */}
  <input
    type="date"
    className="
      border border-gray-400
      bg-white text-gray-800
      px-3 py-2 rounded-md
      shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition
    "
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />

  <input
  type="date"
  className="
    border border-gray-400
    bg-white text-black
    px-3 py-2 rounded-md
    shadow-sm
    focus:outline-none
    focus:ring-2 focus:ring-blue-500
    [color-scheme:light]
  "
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />

  {/* PROCESS SELECT */}
  <select
    className="
      border border-gray-400
      bg-white text-gray-800
      px-3 py-2 rounded-md
      shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition
    "
    onChange={(e) => {
      const val = e.target.value;
      setSelectedProcess(val ? Number(val) : null);
      setSelectedParameter(null);
    }}
  >
    <option value="">Select Process</option>
    {structure.map((p: any) => (
      <option key={p.id} value={p.id}>
        {p.name}
      </option>
    ))}
  </select>

  {/* PARAMETER SELECT */}
  <select
    className="
      border border-gray-400
      bg-white text-gray-800
      px-3 py-2 rounded-md
      shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition
      disabled:bg-gray-100 disabled:text-gray-400
    "
    disabled={!selectedProcess}
    onChange={(e) => {
      const val = e.target.value;
      setSelectedParameter(val ? Number(val) : null);
    }}
  >
    <option value="">Select Parameter</option>
    {structure
      .find((p: any) => p.id === selectedProcess)
      ?.parameters.map((param: any) => (
        <option key={param.id} value={param.id}>
          {param.name}
        </option>
      ))}
  </select>

  {/* EXPORT BUTTON */}
  <button
    onClick={exportToExcel}
    className="
      bg-green-600 hover:bg-green-700
      text-white px-5 py-2 rounded-lg
      shadow-md transition
    "
  >
    Export to Excel
  </button>
</div>

    {/* GRAPH CARD */}
    {selectedProcess &&
      selectedParameter &&
      chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            📈 Trend Analysis
          </h2>

          <TrendChart
            data={chartData}
            parameterName={selectedParamObj?.name}
            subParamMap={subParamMap}
            specMin={selectedParamObj?.specMin}
            specMax={selectedParamObj?.specMax}
          />
        </div>
      )}

    {/* EMPTY STATE */}
    {selectedProcess &&
      selectedParameter &&
      chartData.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No data available for selected range
        </div>
      )}
  </div>
);
}