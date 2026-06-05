export type MusicLinkType = {
  type: "youtube" | "spotify" | "yandex";
  url: string;
};

export type PinType = {
  visibility: "global" | "private" | "following"; // Сразу заложили 3 режима на будущее!

  id: string;

  user_id: string;

  pin_type?: string;
  color?: string; // Hex или rgb код цвета палитры

  song_title: string;
  artist_name: string;
  story: string;
  place_name: string;

  latitude: number;
  longitude: number;

  user_name?: string;
  user_avatar?: string;

  youtube_url?: string;
  spotify_url?: string;
  yandex_url?: string;

  music_links?: MusicLinkType[];

  likes_count?: number;
  liked_by_user?: boolean;
};
