import { useEffect, useRef } from 'react';

export default function MapaView({ congregacoes, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapInstance.current || typeof window.L === 'undefined') return;

    mapInstance.current = window.L.map(mapRef.current, {
      center: [-15.8, -47.9],
      zoom: 4,
      zoomControl: false,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || typeof window.L === 'undefined' || !congregacoes?.length) return;

    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    const bounds = [];

    congregacoes.forEach((c) => {
      const coords = {
        SP: [-23.55, -46.63],
        RJ: [-22.91, -43.20],
        MG: [-19.92, -43.94],
        PR: [-25.43, -49.27],
        BA: [-12.97, -38.50],
      }[c.uf] || [-23.55, -46.63];

      const lat = coords[0] + (Math.random() - 0.5) * 2;
      const lng = coords[1] + (Math.random() - 0.5) * 2;

      const marker = window.L.circleMarker([lat, lng], {
        radius: 8 + Math.sqrt(c.membrosCount || 50) / 4,
        fillColor: c.membrosCount > 200 ? '#22c55e' : c.membrosCount > 100 ? '#eab308' : '#ef4444',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      }).addTo(mapInstance.current);

      marker.bindPopup(`<b>${c.nome}</b><br/>Membros: ${c.membrosCount}<br/>${c.cidade}/${c.uf}`);
      marker.on('click', () => onSelect?.(c));
      markersRef.current.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 1) {
      mapInstance.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [congregacoes, onSelect]);

  return <div ref={mapRef} className="h-full w-full rounded-card" style={{ minHeight: 400 }} />;
}
