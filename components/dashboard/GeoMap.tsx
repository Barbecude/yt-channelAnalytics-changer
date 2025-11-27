"use client";

import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

// URL GeoJSON
const GEO_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

interface GeoMapProps {
  data: { id: string; value: number }[];
}

export default function GeoMap({ data }: GeoMapProps) {
  // Ubah state ini untuk menyimpan posisi (x, y) dan teks
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  const colorScale = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.value), 0);
    return scaleLinear<string>()
      .domain([0, maxVal])
      // --- PERUBAHAN WARNA 1 (Logic Peta) ---
      // Dari warna merah sangat pudar (#ffe5e5) ke Merah YouTube (#FF0000)
      .range(["#ffe5e5", "#FF0000"]);
  }, [data]);

  const findData = (geoId: string | undefined, geoName: string | undefined) => {
    if (!geoId) return undefined;
    let found = data.find((d) => d.id === geoId);
    if (!found) {
       const mapIso: Record<string, string> = {
        "IDN": "ID", "USA": "US", "GBR": "UK", "JPN": "JP", "KOR": "KR"
      };
      const code2 = mapIso[geoId] || geoId.substring(0, 2).toUpperCase();
      found = data.find((d) => d.id === code2);
    }
    return found;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-200 rounded-xl h-[400px] w-full relative bg-slate-50 overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs z-0">
          Coded By Muhammad Zevaldo Trijialghi
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button 
            onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(4, p.zoom * 1.2) }))}
            className="bg-white hover:bg-gray-100 shadow-xs rounded w-8 h-8 font-bold text-gray-600"
          >+</button>
          <button 
            onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(1, p.zoom / 1.2) }))}
            className="bg-white hover:bg-gray-100 shadow-xs rounded w-8 h-8 font-bold text-gray-600"
          >-</button>
          <button 
            onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
            className="bg-white hover:bg-gray-100 shadow-xs rounded w-8 h-8 font-bold text-gray-600 text-xs"
          >R</button>
        </div>

        {/* --- FLOATING TOOLTIP --- */}
        {tooltip && (
           <div 
             className="fixed bg-black/90 text-white text-xs px-3 py-2 rounded pointer-events-none z-[9999] shadow-lg whitespace-nowrap border border-white/20"
             style={{ 
               left: tooltip.x + 15,
               top: tooltip.y + 15
             }}
           >
             {tooltip.content}
           </div>
        )}

        <ComposableMap 
            projection="geoMercator" 
            projectionConfig={{ scale: 100 }} 
            className="w-full h-full relative z-1"
        >
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates as [number, number]} 
            onMoveEnd={(pos) => setPosition(pos)}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoId = geo.id || geo.properties?.iso_a3 || geo.properties?.ISO_A3;
                  const geoName = geo.properties?.name || "Unknown";
                  const cur = findData(geoId, geoName);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      // Warna di sini otomatis mengikuti colorScale yang sudah diubah ke merah youtube
                      fill={cur ? colorScale(cur.value) : "#EEE"}
                      stroke="#D6D6DA"
                      strokeWidth={0.5}
                      
                      onMouseEnter={(event) => {
                        const val = cur ? cur.value.toLocaleString() : 0;
                        setTooltip({
                          x: event.clientX,
                          y: event.clientY,
                          content: `${geoName}: ${val} Views`
                        });
                      }}

                      onMouseMove={(event) => {
                        setTooltip((prev) => prev ? { 
                          ...prev, 
                          x: event.clientX, 
                          y: event.clientY 
                        } : null);
                      }}

                      onMouseLeave={() => {
                        setTooltip(null);
                      }}

                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#333", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 px-2">
        <span>Low Views</span>
        
        {/* --- PERUBAHAN WARNA 2 (Visual Legenda) --- */}
        {/* Menggunakan hex yang sama dengan scale: #ffe5e5 ke #FF0000 */}
        <div className="w-32 h-3 bg-gradient-to-r from-[#ffe5e5] to-[#FF0000] rounded-full shadow-inner"></div>
        
        <span>High Views</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        {data.slice(0, 4).map((c) => (
          <div key={c.id} className="flex justify-between border-b py-1 border-gray-100">
            <span className="font-medium text-gray-700">{c.id}</span>
            <span className="text-gray-500">{c.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}