"use client";

import { useRouter } from "next/navigation";
import { useState, use } from "react";

type ParamsType = {
  lineId: string;
};

export default function ManualEntryDatePage({ params }: { params: Promise<ParamsType> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const lineId = resolvedParams.lineId;

  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
  if (!date) {
    alert("Please select date");
    return;
  }

  setLoading(true); // ⭐ start loading

  setTimeout(() => {
    router.push(`/manual-entry/${lineId}?date=${date}`);
  }, 500); // small delay for UX
};

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] px-4">
      
      <div className="w-full max-w-md">

        <div className="
          rounded-2xl p-[1px]
          bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-purple-500/40
        ">
          <div className="
            bg-[#111827]/80 backdrop-blur-xl
            rounded-2xl px-6 py-8
            flex flex-col gap-6
          ">

            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Select Date
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Choose a date for manual entry
              </p>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-[#0b1220] text-white
                  border border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  transition
                  [color-scheme:dark]
                "
              />
            </div>

            {/* Button */}
            <button
  onClick={handleContinue}
  disabled={loading}
  className="
    mt-2 py-2.5 rounded-lg
    bg-gradient-to-r from-indigo-500 to-purple-600
    text-white font-medium
    hover:from-indigo-400 hover:to-purple-500
    transition-all duration-300
    active:scale-[0.98]
    flex items-center justify-center gap-2
    disabled:opacity-70 disabled:cursor-not-allowed
  "
>
  {loading ? (
    <>
      {/* Spinner */}
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Loading...
    </>
  ) : (
    "Continue →"
  )}
</button>

          </div>
        </div>

      </div>
    </div>
  );
}