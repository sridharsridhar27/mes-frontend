"use client";

import { useRouter } from "next/navigation";
import { use } from "react";

type ParamsType = {
  lineId: string;
};

export default function LineDashboard({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  const router = useRouter();

  const resolvedParams = use(params);
  const lineId = resolvedParams.lineId;

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] px-4">
      
      <div className="w-full max-w-md flex flex-col gap-5">

        {/* 🔷 Header */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Line Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Select an action to continue
          </p>
        </div>

        {/* 🔷 MANUAL ENTRY */}
        <div
          onClick={() => router.push(`/line/${lineId}/manual-entry-date`)}
          className="
            group cursor-pointer rounded-2xl p-[1px]
            bg-gradient-to-r from-blue-500/40 to-indigo-500/40
            hover:from-blue-500 hover:to-indigo-500
            transition duration-300
          "
        >
          <div className="
            flex items-center gap-4
            bg-[#111827]/80 backdrop-blur-xl
            px-5 py-5 rounded-2xl
            transition-all duration-300
            group-hover:brightness-110 group-hover:scale-[1.02]
          ">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              M
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-medium">Manual Entry</h2>
              <span className="text-xs text-gray-400">Add new production data</span>
            </div>
            <div className="ml-auto text-gray-500 group-hover:text-white transition">
              →
            </div>
          </div>
        </div>

        {/* 🔷 VIEW EXISTING */}
        <div
          onClick={() => router.push(`/line/${lineId}/view-date`)}
          className="
            group cursor-pointer rounded-2xl p-[1px]
            bg-gradient-to-r from-purple-500/40 to-pink-500/40
            hover:from-purple-500 hover:to-pink-500
            transition duration-300
          "
        >
          <div className="
            flex items-center gap-4
            bg-[#111827]/80 backdrop-blur-xl
            px-5 py-5 rounded-2xl
            transition-all duration-300
            group-hover:brightness-110 group-hover:scale-[1.02]
          ">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              V
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-medium">View Existing</h2>
              <span className="text-xs text-gray-400">Check saved records</span>
            </div>
            <div className="ml-auto text-gray-500 group-hover:text-white transition">
              →
            </div>
          </div>
        </div>

        {/* 🔷 ANALYTICS */}
        <div
          onClick={() => router.push(`/analytics/${lineId}`)}
          className="
            group cursor-pointer rounded-2xl p-[1px]
            bg-gradient-to-r from-emerald-500/40 to-teal-500/40
            hover:from-emerald-500 hover:to-teal-500
            transition duration-300
          "
        >
          <div className="
            flex items-center gap-4
            bg-[#111827]/80 backdrop-blur-xl
            px-5 py-5 rounded-2xl
            transition-all duration-300
            group-hover:brightness-110 group-hover:scale-[1.02]
          ">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              A
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-medium">Analytics</h2>
              <span className="text-xs text-gray-400">View insights & reports</span>
            </div>
            <div className="ml-auto text-gray-500 group-hover:text-white transition">
              →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}