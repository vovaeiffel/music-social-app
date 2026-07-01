"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useCreatePinStore } from "@/app/store/createPinStore";

export default function PinImageUpload() {
  const { setImageFile } = useCreatePinStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5 МБ.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1.5 my-2">
      <span className="text-[11px] font-medium text-white/60 text-left px-1">
        Add photo (max 1, up to 5MB):
      </span>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!imagePreview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-dashed border-white/20 hover:bg-white/10 transition text-xs text-zinc-300"
        >
          <ImagePlus size={16} />
          <span>Select photo</span>
        </button>
      ) : (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 group">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition shadow-md"
            title="Удалить фото"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
