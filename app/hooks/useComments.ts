import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CommentType } from "@/app/types/comment";

export function useComments(pinId: string | undefined) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pinId) return;

    const q = query(
      collection(db, "comments"),
      where("pinId", "==", pinId),
      orderBy("createdAt", "asc"),
    );

    return onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pinId: data.pinId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          text: data.text,
          createdAt: data.createdAt as Timestamp,
        } as CommentType;
      });

      setComments(loadedComments);
    });
  }, [pinId]);

  const addComment = async (
    text: string,
    user: { id: string; name: string; avatar: string },
  ) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        pinId,
        userId: user.id,
        userName: user.name || "Гость",
        userAvatar: user.avatar || "",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  return {
    comments,
    isSubmitting,
    addComment,
    deleteComment,
  };
}
