"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Line = {
  id: number;
  name: string;
};

export default function Home() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/lines")
      .then((res) => res.json())
      .then((data) => setLines(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLineClick = (lineId: number) => {
    router.push(`/line/${lineId}`);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a] px-4">
      
      <div className="w-full max-w-md flex flex-col gap-5">
        
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Production Lines
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Choose a line to continue
          </p>
        </div>

        {/* 🔷 LOADING STATE (Shimmer) */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-[#111827] p-5"
            >
              {/* Shimmer Layer */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-700"></div>
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3 bg-gray-700 rounded"></div>
                  <div className="w-20 h-2 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          ))}

        {/* 🔷 ACTUAL DATA */}
        {!loading &&
          lines.map((line, index) => (
            <div
              key={line.id}
              onClick={() => handleLineClick(line.id)}
              className="
                relative group cursor-pointer overflow-hidden
                rounded-2xl p-[1px]
                bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40
                hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
                transition duration-500
              "
            >
              <div
                className="
  relative flex items-center gap-4
  rounded-2xl bg-[#111827]/80 backdrop-blur-xl
  px-5 py-4
  transition-all duration-300
  group-hover:bg-[#111827]/80
  group-hover:brightness-110
  group-hover:scale-[1.02]
"
              >
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition"></div>

                <div className="relative z-10 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {line.name.charAt(0)}
                </div>

                <div className="relative z-10 flex flex-col">
                  <h2 className="text-white font-medium text-base tracking-wide">
                    {line.name}
                  </h2>
                  <span className="text-[11px] text-gray-400">
                    Tap to explore →
                  </span>
                </div>

                <div className="relative z-10 ml-auto text-gray-500 group-hover:text-white transition transform group-hover:translate-x-1">
                  →
                </div>

                <div className="absolute right-4 bottom-2 text-[10px] text-gray-600">
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}

        {/* Empty */}
        {!loading && lines.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-6">
            No production lines available...
          </div>
        )}
      </div>
    </div>
  );
}