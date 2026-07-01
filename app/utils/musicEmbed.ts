export function getEmbedUrl(type: string, url: string): string | null {
  if (type === "youtube") {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (type === "spotify") {
    const regExp = /track\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    const trackId = match ? match[1] : null;
    return trackId
      ? `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`
      : null;
  }
  if (type === "yandex") {
    const regExp = /album\/(\d+)\/track\/(\d+)/;
    const match = url.match(regExp);
    if (match && match[1] && match[2]) {
      return `https://music.yandex.ru/iframe/#track/${match[2]}/${match[1]}/`;
    }
  }
  return null;
}

export function detectMusicPlatform(url: string) {
  if (!url) return { name: "Link", color: "text-zinc-400", icon: "🔗" };

  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return { name: "YouTube", color: "text-red-500", icon: "📺" };
  }
  if (lowerUrl.includes("spotify.com") || lowerUrl.includes("open.spotify")) {
    return { name: "Spotify", color: "text-green-500", icon: "🎵" };
  }
  if (lowerUrl.includes("yandex.ru") || lowerUrl.includes("music.yandex")) {
    return { name: "Яндекс.Музыка", color: "text-yellow-500", icon: "🎧" };
  }
  return { name: "Link", color: "text-indigo-400", icon: "🔗" };
}
