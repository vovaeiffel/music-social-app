import { Timestamp } from "firebase/firestore";

export type CommentType = {
  id: string;
  pinId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: Timestamp | null; // Теперь это строгий тип из Firebase
};
