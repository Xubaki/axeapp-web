"use client";

import { useEffect, useRef, useState } from "react";
import type { Terreiro } from "@/lib/types/router";
import { planoBadge } from "@/lib/terreiros";

interface Props {
  terreiros: Terreiro[];
  height?: string;
  selectedId?: number | null;
  onSelect?: (terreiro: Terreiro) => void;
}

export function MapaTerreiros({
  terreiros,
  height = "500px",
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Terreiros com coordenadas válidas
  const terreirosMapa = terreiros.filter(
    (t) =>
      t.latitude &&
      t.longitude &&
      !isNaN(parseFloat(t.latitude)) &&
      !isNaN(parseFloat(t.longitude))
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Importar Leaflet dinamicamente (evita SSR issues)
    import("leaflet").then((L) => {
      // Fix para ícones do Leaflet no Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Centro padrão: Brasil
      const center: [number, number] =
        terreirosMapa.length > 0
          ? [
              parseFloat(terreirosMapa[0].latitude!),
              parseFloat(terreirosMapa[0].longitude!),
            ]
          : [-15.7801, -47.9292];

      const map = L.map(mapRef.current!, {
        center,
        zoom: terreirosMapa.length > 0 ? 12 : 5,
        zoomControl: true,
      });

      // OpenStreetMap tile layer (mesmo do app mobile v1.1.6)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualizar marcadores quando terreiros mudam
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Limpar marcadores anteriores
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      terreirosMapa.forEach((terreiro) => {
        const lat = parseFloat(terreiro.latitude!);
        const lng = parseFloat(terreiro.longitude!);
        const badge = planoBadge(terreiro.plano);
        const isSelected = terreiro.id === selectedId;

        // Ícone customizado baseado no plano
        const iconColor =
          terreiro.plano === "diamante"
            ? "#3B82F6"
            : terreiro.plano === "ouro"
            ? "#D4AF37"
            : terreiro.plano === "prata"
            ? "#9CA3AF"
            : "#8B4513";

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              width: ${isSelected ? "40px" : "32px"};
              height: ${isSelected ? "40px" : "32px"};
              background: ${iconColor};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${isSelected ? "18px" : "14px"};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.2s;
              cursor: pointer;
            ">🔥</div>
          `,
          iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
          iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `
            <div style="min-width: 200px; font-family: system-ui, sans-serif;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1A1A1A;">
                ${terreiro.nome}
              </div>
              <div style="color: #8B4513; font-size: 12px; margin-bottom: 4px;">
                ${terreiro.tradicao}
              </div>
              <div style="color: #6B7280; font-size: 12px; margin-bottom: 8px;">
                📍 ${terreiro.cidade}, ${terreiro.estado}
              </div>
              ${
                terreiro.isVerified
                  ? '<div style="color: #22C55E; font-size: 11px; margin-bottom: 8px;">✓ Verificado</div>'
                  : ""
              }
              <a href="/terreiros/${terreiro.id}" 
                 style="display: inline-block; background: #8B4513; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: 600;">
                Ver detalhes →
              </a>
            </div>
          `,
            { maxWidth: 260 }
          );

        marker.on("click", () => {
          onSelect?.(terreiro);
        });

        markersRef.current.push(marker);
      });

      // Ajustar bounds se há múltiplos terreiros
      if (terreirosMapa.length > 1 && !selectedId) {
        const bounds = L.latLngBounds(
          terreirosMapa.map((t) => [
            parseFloat(t.latitude!),
            parseFloat(t.longitude!),
          ])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [mapReady, terreirosMapa, selectedId, onSelect]);

  // Centralizar no terreiro selecionado
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedId) return;
    const terreiro = terreirosMapa.find((t) => t.id === selectedId);
    if (terreiro?.latitude && terreiro?.longitude) {
      mapInstanceRef.current.setView(
        [parseFloat(terreiro.latitude), parseFloat(terreiro.longitude)],
        15,
        { animate: true }
      );
    }
  }, [selectedId, mapReady, terreirosMapa]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapRef} style={{ height, width: "100%" }} />
      {/* Atribuição OSM obrigatória */}
      {terreirosMapa.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-muted text-sm">
          Nenhum terreiro com localização disponível
        </div>
      )}
    </div>
  );
}
