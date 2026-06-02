export type PinType = {
  id: string;

  user_id: string;

  pin_type?: string;

  song_title: string;
  artist_name: string;
  story: string;
  place_name: string;

  latitude: number;
  longitude: number;

  user_name?: string;
  user_avatar?: string;

  music_url?: string;
  music_platform?: "youtube" | "spotify" | "yandex";

  likes_count?: number;
  liked_by_user?: boolean;
};
