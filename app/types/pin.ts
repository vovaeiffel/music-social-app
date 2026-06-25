import { FieldValue } from "firebase/firestore";

export type MusicLinkType = {
  type: "youtube" | "spotify" | "yandex";
  url: string;
};

export type PinType = {
  id: string;
  visibility: "global" | "private" | "following";
  user_id: string;
  pin_type?: string;
  color?: string;
  song_title: string;
  artist_name: string;
  story: string;
  place_name: string;
  links?: string[]; // Исправили ошибку Property 'links'
  music_links?: MusicLinkType[];
  latitude: number;
  longitude: number;
  user_name?: string;
  user_avatar?: string;
  youtube_url?: string;
  spotify_url?: string;
  yandex_url?: string;
  likes_count?: number;
  liked_by_user?: boolean;
  image_url?: string;
  // Используем Timestamp из firebase для корректной работы с Firestore
  created_at?: FieldValue | number;
};
