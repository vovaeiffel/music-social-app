import { useState } from "react";
import { Search } from "lucide-react";

interface PhotonFeature {
  properties: {
    osm_id: number;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
}

export default function SearchBar({
  onSelectLocation,
}: {
  onSelectLocation: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState("");
  // 2. Используем созданный интерфейс вместо any
  const [results, setResults] = useState<
    { id: number; name: string; desc: string; lat: number; lon: number }[]
  >([]);

  const handleSearch = async () => {
    if (!query.trim()) return; // Проверка на пустую строку

    try {
      // Убираем limit и оставляем только самое необходимое
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        console.error("Ошибка ответа API:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Успешный ответ от Photon:", data);

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const formattedResults = data.features.map((f: PhotonFeature) => ({
          id: f.properties.osm_id,
          name: f.properties.name || "Без названия",
          desc: [f.properties.city, f.properties.state, f.properties.country]
            .filter(Boolean)
            .join(", "),
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
        console.log("Результатов не найдено");
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  };

  return (
    <div className="z-[2000] w-[300px]">
      <div className="flex gap-2">
        <input
          className="w-full p-2 rounded-xl bg-zinc-900 text-white border border-white/10"
          placeholder="Поиск места..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} className="p-2 bg-white rounded-xl">
          <Search size={20} className="text-black" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {results.map((res) => (
            <button
              key={res.id}
              className="block w-full p-3 text-left hover:bg-white/10"
              onClick={() => {
                onSelectLocation(res.lat, res.lon);
                setResults([]); // Скрываем список после выбора
              }}
            >
              <div className="text-sm font-bold text-white">{res.name}</div>
              <div className="text-[10px] text-zinc-400">{res.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
