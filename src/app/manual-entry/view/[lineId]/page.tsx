"use client";

import { useEffect, useState, use, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ParamsType = {
  lineId: string;
};

const TIME_SLOTS = ["9AM", "11:30AM", "2PM", "4PM"];

export default function ViewEntryPage({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  // =========================
  // 🔹 PARAMS & ROUTER
  // =========================
  const resolvedParams = use(params);
  const lineId = resolvedParams.lineId;

  const lineMap: any = {
  1: "OLP",
  2: "SES",
};

const lineName = lineMap[lineId] || `Line ${lineId}`;

  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  // =========================
  // 🔹 STATE
  // =========================
  const [structure, setStructure] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pdfRef = useRef<HTMLDivElement>(null);

  // =========================
  // 🔹 FETCH DATA
  // =========================
  useEffect(() => {
    if (!date) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/master/structure?lineId=${lineId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStructure(data);
        setLoading(false);
      });

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entries/by-date?lineId=${lineId}&date=${date}`
    )
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }, [date, lineId]);

  if (!date) return <div>Please select date</div>;
  if (loading) return <div>Loading Table...</div>;

  // =========================
  // 🔹 HELPERS
  // =========================
  const findValue = ({
    processId,
    parameterId,
    subParameterId,
    specRowId,
    timeSlot,
  }: any) => {
    const entry = entries.find(
      (e: any) =>
        e.processId === processId &&
        e.parameterId === parameterId &&
        (e.subParameterId || null) === (subParameterId || null) &&
        (e.specRowId || null) === (specRowId || null) &&
        e.timeSlot === timeSlot
    );

    return entry?.value || "-";
  };

  const findMetaValue = ({
  processId,
  parameterId,
  subParameterId,
  specRowId,
  field,
}: any) => {
  const entry = entries.find(
    (e: any) =>
      e.processId === processId &&
      e.parameterId === parameterId &&
      (e.subParameterId || null) === (subParameterId || null) &&
      (e.specRowId || null) === (specRowId || null) &&
      e.timeSlot === "GENERAL"
  );

  return entry?.[field] || "-";
};



  const getCellStyle = (param: any, value: string) => {
    const num = Number(value);

    if (!value || isNaN(num)) return {};

    if (param.specMin != null && param.specMax != null) {
      if (num < param.specMin || num > param.specMax) {
        return {
          backgroundColor: "#fecaca",
          border: "1px solid #f87171",
        };
      }
    }

    return {};
  };

  const renderSpec = (param: any) => {
    const { specMin, specMax, specText } = param;

    if (specMin != null && specMax != null) {
      return `${specMin} - ${specMax}${specText ? ` ${specText}` : ""}`;
    }

    if (specMin != null) {
      return `${specMin}${specText ? ` ${specText}` : ""}`;
    }

    if (specText) return specText;

    return "-";
  };

  // =========================
  // 🔹 PDF DOWNLOAD
  // =========================
  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // FIRST PAGE
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

    // EXTRA PAGES
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;
    }

    pdf.save(`report_${date}.pdf`);
  };

  // =========================
// 🔹 WORD DOWNLOAD
// =========================
const downloadWord = () => {
  if (!pdfRef.current) return;

  const content = pdfRef.current.innerHTML;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Report</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th,
          td {
            border: 1px solid black;
            padding: 5px;
            text-align: center;
          }
          h2 {
            background: #e5e7eb;
            padding: 5px;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/msword",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `report_${date}.doc`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

           

  // =========================
  // 🔹 UI
  // =========================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          View Entries — {date}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/manual-entry/${lineId}?date=${date}`)
            }
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit This Data
          </button>

          <button
            onClick={downloadPDF}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>
          <button
  onClick={downloadWord}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Download Word
</button>
        </div>
      </div>

      {/* PDF CONTENT */}
      <div
        ref={pdfRef}
        className="p-4"
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
      {/* 🏢 COMPANY HEADER */}
<div
  style={{
    marginBottom: "20px",
    borderBottom: "2px solid #000",
    paddingBottom: "10px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* LOGO */}
    <img
      src="/ACLOGO.png"
      alt="Company Logo"
      style={{
        width: "70px",
        height: "70px",
        objectFit: "contain",
      }}
    />

    {/* COMPANY INFO */}
   {/* COMPANY INFO */}
<div style={{ textAlign: "center", flex: 1 }}>
  <h1
  style={{
    fontSize: "35px",
    fontWeight: "bold",
    margin: 0,
  }}
>
  {lineName}
</h1>
</div>

    {/* RIGHT SIDE EMPTY (FOR BALANCE) */}
    <div style={{ width: "70px" }} />
  </div>
</div>

        {structure.map((process: any) => (
          <div key={process.id} className="mb-10">
            <h2
              className="text-xl font-semibold p-2"
              style={{ backgroundColor: "#e5e7eb" }}
            >
              {process.name}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th className="border p-2">Parameter</th>
                    <th className="border p-2">Spec</th>
                    <th className="border p-2">Position</th>

                    {TIME_SLOTS.map((t) => (
                      <th key={t} className="border p-2">
                        {t}
                      </th>
                    ))}

                    <th className="border p-2">Customer</th>
                    <th className="border p-2">Part No</th>
                    <th className="border p-2">Remark</th>
                  </tr>
                </thead>

                <tbody>
                  {process.parameters.map((param: any) => {
                   // =========================
// QUALITATIVE
// =========================
if (
  param.type === "QUALITATIVE" &&
  param.specRows?.length > 0
) {
  return param.specRows.map((row: any) => (
    <tr key={row.id}>
      <td className="border p-2">
        {param.name}
      </td>
      <td className="border p-2">
        {row.name}
      </td>
      <td className="border p-2">
        Status
      </td>

      {TIME_SLOTS.map((time) => {
        const val = findValue({
          processId: process.id,
          parameterId: param.id,
          specRowId: row.id,
          timeSlot: time,
        });

        return (
          <td
            key={time}
            className="border p-2 text-center"
          >
            {val}
          </td>
        );
      })}

      {/* ✅ FIXED META FIELDS */}
      {["customer", "partNo", "remark", ].map(
        (field, i) => (
          <td key={i} className="border p-2 text-center">
            {findMetaValue({
              processId: process.id,
              parameterId: param.id,
              specRowId: row.id, // ⭐ ONLY THIS (NO sub)
              field,
            })}
          </td>
        )
      )}
    </tr>
  ));
}
                    // =========================
                    // SUB PARAMETERS
                    // =========================
                    if (param.subParameters?.length > 0) {
                      return param.subParameters.map((sub: any) => (
                        <tr key={sub.id}>
                          <td className="border p-2">{param.name}</td>
                          <td className="border p-2">
                            {renderSpec(param)}
                          </td>
                          <td className="border p-2">{sub.name}</td>

                          {TIME_SLOTS.map((time) => {
                            const val = findValue({
                              processId: process.id,
                              parameterId: param.id,
                              subParameterId: sub.id,
                              timeSlot: time,
                            });

                            return (
                              <td
                                key={time}
                                className="border p-2 text-center"
                                style={getCellStyle(param, val)}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {["customer", "partNo", "remark", ].map(
  (field, i) => (
    <td key={i} className="border p-2 text-center">
      {findMetaValue({
        processId: process.id,
        parameterId: param.id,
        subParameterId: sub.id, // ⭐ IMPORTANT
        field,
      })}
    </td>
  )
)}
                        </tr>
                      ));
                    }

                    // =========================
                    // SINGLE PARAM
                    // =========================
                    return (
                      <tr key={param.id}>
                        <td className="border p-2">{param.name}</td>
                        <td className="border p-2">
                          {renderSpec(param)}
                        </td>
                        <td className="border p-2">Value</td>

                        {TIME_SLOTS.map((time) => {
                          const val = findValue({
                            processId: process.id,
                            parameterId: param.id,
                            timeSlot: time,
                          });

                          return (
                            <td
                              key={time}
                              className="border p-2 text-center"
                              style={getCellStyle(param, val)}
                            >
                              {val}
                            </td>
                          );
                        })}

                        {["customer", "partNo", "remark", ].map(
  (field, i) => (
    <td key={i} className="border p-2 text-center">
      {findMetaValue({
        processId: process.id,
        parameterId: param.id,
        field, // ⭐ no sub / specRow here
      })}
    </td>
  )
)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
{/* ========================= */}
{/* 🔻 SIGNATURE SECTION */}
{/* ========================= */}
<div
  style={{
    marginTop: "60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  }}
>
  {/* LEFT SIGN */}
  <div style={{ textAlign: "center" }}>
    <div
      style={{
       
        width: "150px",
        margin: "0 auto",
        marginBottom: "5px",
      }}
    />
    <p style={{ margin: 0, fontWeight: "bold" }}>
      QE Sign
    </p>
  </div>

  {/* RIGHT SIGN */}
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        
        width: "150px",
        margin: "0 auto",
        marginBottom: "5px",
      }}
    />
    <p style={{ margin: 0, fontWeight: "bold" }}>
      QE Manager Sign
    </p>
  </div>
</div>
      </div>
    </div>
  );
}