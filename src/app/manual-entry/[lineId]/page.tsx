"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";

type ParamsType = {
  lineId: string;
};

const TIME_SLOTS = ["9AM", "11:30AM", "2PM", "4PM"];

export default function ManualEntryPage({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  const resolvedParams = use(params);
  const lineId = resolvedParams.lineId;

  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [structure, setStructure] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [localValues, setLocalValues] = useState<any>({});
  

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

  
  // FIND VALUE
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

    return entry?.value || "";
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

  console.log("META ENTRY FOUND:", entry);

  return entry?.[field] || "";
};
  // LOCAL STATE CHANGE
  const handleChange = (key: string, value: string) => {
    setLocalValues((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // OUT OF SPEC
  const getCellStyle = (param: any, value: string) => {
    const num = Number(value);

    if (!value || isNaN(num)) return "";

    if (param.specMin != null && param.specMax != null) {
      if (num < param.specMin || num > param.specMax) {
        return "bg-red-200 border-red-500";
      }
    }

    return "";
  };

  // SPEC FORMAT
  const renderSpec = (param: any) => {
    const { specMin, specMax, specText } = param;

    if (specMin != null && specMax != null) {
      return `${specMin} - ${specMax}${
        specText ? ` ${specText}` : ""
      }`;
    }

    if (specMin != null) {
      return `${specMin}${specText ? ` ${specText}` : ""}`;
    }

    if (specText) return specText;

    return "-";
  };
const handleAutoSave = async ({
  processId,
  parameterId,
  subParameterId = null,
  specRowId = null,
  timeSlot,
  value,
  customer,
  partNo,
  remark,
  
}: any) => {
  try {
    

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entries/upsert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineId,
          processId,
          parameterId,
          subParameterId,
          specRowId,
          entryDate: date,
          timeSlot,
          value,
          customer,
          partNo,
          remark,
          
        }),
      }
    );

    // ⭐ EXISTING
    const savedData = await res.json();

    
      setEntries((prev: any[]) => {
  const index = prev.findIndex(
    (e) =>
      e.processId === savedData.processId &&
      e.parameterId === savedData.parameterId &&
      e.subParameterId === savedData.subParameterId &&
      e.specRowId === savedData.specRowId &&
      e.timeSlot === savedData.timeSlot
  );

  if (index !== -1) {
    const updated = [...prev];
    updated[index] = savedData;
    return updated;
  }

  return [...prev, savedData];
});
      

    // ⭐ NEW (VERY IMPORTANT FIX)
    setLocalValues((prev: any) => {
      const newState = { ...prev };

      delete newState[`customer-${processId}-${parameterId}`];
      delete newState[`partNo-${processId}-${parameterId}`];
      delete newState[`remark-${processId}-${parameterId}`];
      

      return newState;
    });
    // ⭐ END

   
  } catch (error) {
    console.error("Auto save failed", error);
    
  }
};
 return (
  <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
    
    {/* Header */}
    <h1 className="text-2xl font-semibold mb-4 tracking-tight">
      Manual Entry — <span className="text-indigo-600">{date}</span>
    </h1>

   

    {structure.map((process: any) => (
      <div key={process.id} className="mb-10">

        {/* Process Header */}
        <h2 className="text-lg font-semibold bg-white px-4 py-2 rounded-t-lg border border-gray-300">
          {process.name}
        </h2>

        <div className="overflow-x-auto border border-gray-300 rounded-b-lg bg-white">
          <table className="w-full border-collapse text-sm">

            {/* THEAD */}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-700">
                <th className="border border-gray-300 px-3 py-2 text-left">Parameter</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Spec</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Position</th>

                {TIME_SLOTS.map((t) => (
                  <th key={t} className="border border-gray-300 px-3 py-2 text-center">
                    {t}
                  </th>
                ))}

                <th className="border border-gray-300 px-3 py-2 text-left whitespace-nowrap">
                  Customer
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left whitespace-nowrap">
                  Part No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left whitespace-nowrap">
                  Remark
                </th>
               
              </tr>
            </thead>

           {/* TBODY */}
<tbody>
  {process.parameters.map((param: any) => {

    // QUALITATIVE
if (param.type === "QUALITATIVE" && param.specRows?.length > 0) {
  return param.specRows.map((row: any) => (
    <tr key={row.id} className="hover:bg-gray-50 transition">
      <td className="border border-gray-300 px-3 py-2">
        {param.name}
      </td>
      <td className="border border-gray-300 px-3 py-2">
        {row.name}
      </td>
      <td className="border border-gray-300 px-3 py-2">
        Status
      </td>

      {TIME_SLOTS.map((time) => (
        <td
          key={time}
          className="border border-gray-300 px-2 py-2 text-center"
        >
          <select
            className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 focus:ring-1 focus:ring-indigo-500"
            value={findValue({
              processId: process.id,
              parameterId: param.id,
              specRowId: row.id,
              timeSlot: time,
            })}
            onChange={(e) =>
              handleAutoSave({
                processId: process.id,
                parameterId: param.id,
                specRowId: row.id,
                timeSlot: time,
                value: e.target.value,
              })
            }
          >
            <option value="">Select</option>
            <option>OK</option>
            <option>NOT OK</option>
          </select>
        </td>
      ))}

      {/* ✅ FIXED META FIELDS (ONLY 3 COLUMNS) */}
      {["customer", "partNo", "remark"].map((field, i) => {
        const key = `${field}-${process.id}-${param.id}-${row.id}`;

        return (
          <td
            key={i}
            className="border border-gray-300 px-2 py-2"
          >
            <input
              className="border-b border-gray-400 focus:outline-none focus:border-indigo-500 w-auto min-w-[120px] bg-transparent"
              value={
                localValues[key] ??
                findMetaValue({
                  processId: process.id,
                  parameterId: param.id,
                  specRowId: row.id,
                  field,
                })
              }
              onChange={(e) =>
                setLocalValues((prev: any) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              onBlur={(e) =>
                handleAutoSave({
                  processId: process.id,
                  parameterId: param.id,
                  specRowId: row.id,
                  timeSlot: "GENERAL",
                  value: "",
                  customer:
                    field === "customer"
                      ? e.target.value
                      : undefined,
                  partNo:
                    field === "partNo"
                      ? e.target.value
                      : undefined,
                  remark:
                    field === "remark"
                      ? e.target.value
                      : undefined,
                })
              }
            />
          </td>
        );
      })}
    </tr>
  ));
}

 // SUB PARAMETERS
if (param.subParameters?.length > 0) {
  return param.subParameters.map((sub: any) => (
    <tr key={sub.id} className="hover:bg-gray-50 transition">
      <td className="border border-gray-300 px-3 py-2">
        {param.name}
      </td>
      <td className="border border-gray-300 px-3 py-2">
        {renderSpec(param)}
      </td>
      <td className="border border-gray-300 px-3 py-2">
        {sub.name}
      </td>

      {TIME_SLOTS.map((time) => {
        const key = `${process.id}-${param.id}-${sub.id}-${time}`;

        const dbVal = findValue({
          processId: process.id,
          parameterId: param.id,
          subParameterId: sub.id,
          timeSlot: time,
        });

        const value = localValues[key] ?? dbVal;

        return (
          <td
            key={time}
            className="border border-gray-300 px-2 py-2 text-center"
          >
            <input
              type="text"
              className={`border border-gray-300 rounded px-2 py-1 w-20 focus:ring-1 focus:ring-indigo-500 ${getCellStyle(
                param,
                value
              )}`}
              value={value}
              onChange={(e) =>
                handleChange(key, e.target.value)
              }
              onBlur={(e) =>
                handleAutoSave({
                  processId: process.id,
                  parameterId: param.id,
                  subParameterId: sub.id,
                  timeSlot: time,
                  value: e.target.value,
                })
              }
            />
          </td>
        );
      })}

      {/* ✅ FIXED META FIELDS */}
      {["customer", "partNo", "remark", ].map(
        (field, i) => {
          const key = `${field}-${process.id}-${param.id}-${sub.id}`;

          return (
            <td
              key={i}
              className="border border-gray-300 px-2 py-2"
            >
              <input
                className="border-b border-gray-400 focus:outline-none focus:border-indigo-500 w-auto min-w-[120px] bg-transparent"
                value={
                  localValues[key] ??
                  findMetaValue({
                    processId: process.id,
                    parameterId: param.id,
                    subParameterId: sub.id,
                    field,
                  })
                }
                onChange={(e) =>
                  setLocalValues((prev: any) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                onBlur={(e) =>
                  handleAutoSave({
                    processId: process.id,
                    parameterId: param.id,
                    subParameterId: sub.id,
                    timeSlot: "GENERAL",
                    value: "",
                    customer:
                      field === "customer"
                        ? e.target.value
                        : undefined,
                    partNo:
                      field === "partNo"
                        ? e.target.value
                        : undefined,
                    remark:
                      field === "remark"
                        ? e.target.value
                        : undefined,
                    
                  })
                }
              />
            </td>
          );
        }
      )}
    </tr>
  ));
}

   // SINGLE PARAM
return (
  <tr key={param.id} className="hover:bg-gray-50 transition">
    <td className="border border-gray-300 px-3 py-2">
      {param.name}
    </td>
    <td className="border border-gray-300 px-3 py-2">
      {renderSpec(param)}
    </td>
    <td className="border border-gray-300 px-3 py-2">
      Value
    </td>

    {TIME_SLOTS.map((time) => {
      const key = `${process.id}-${param.id}-main-${time}`;

      const dbVal = findValue({
        processId: process.id,
        parameterId: param.id,
        timeSlot: time,
      });

      const value = localValues[key] ?? dbVal;

      return (
        <td
          key={time}
          className="border border-gray-300 px-2 py-2 text-center"
        >
          <input
            type="text"
            className={`border border-gray-300 rounded px-2 py-1 w-20 focus:ring-1 focus:ring-indigo-500 ${getCellStyle(
              param,
              value
            )}`}
            value={value}
            onChange={(e) =>
              handleChange(key, e.target.value)
            }
            onBlur={(e) =>
              handleAutoSave({
                processId: process.id,
                parameterId: param.id,
                timeSlot: time,
                value: e.target.value,
              })
            }
          />
        </td>
      );
    })}

    {/* ✅ FIXED META FIELDS */}
    {["customer", "partNo", "remark", ].map(
      (field, i) => {
        const key = `${field}-${process.id}-${param.id}`;

        return (
          <td
            key={i}
            className="border border-gray-300 px-2 py-2"
          >
            <input
              className="border-b border-gray-400 focus:outline-none focus:border-indigo-500 w-auto min-w-[120px] bg-transparent"
              value={
                localValues[key] ??
                findMetaValue({
                  processId: process.id,
                  parameterId: param.id,
                  field,
                })
              }
              onChange={(e) =>
                setLocalValues((prev: any) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              onBlur={(e) =>
                handleAutoSave({
                  processId: process.id,
                  parameterId: param.id,
                  timeSlot: "GENERAL",
                  value: "",
                  customer:
                    field === "customer"
                      ? e.target.value
                      : undefined,
                  partNo:
                    field === "partNo"
                      ? e.target.value
                      : undefined,
                  remark:
                    field === "remark"
                      ? e.target.value
                      : undefined,
                  
                })
              }
            />
          </td>
        );
      }
    )}
  </tr>
);
  })}
</tbody>

          </table>
        </div>
      </div>
    ))}
  </div>
)};