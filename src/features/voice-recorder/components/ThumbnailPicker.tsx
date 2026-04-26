import { useRef } from "react";

type Props = {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
};

export const ThumbnailPicker = ({ previewUrl, onSelect, onClear }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="relative w-16 h-16">
          <img src={previewUrl} className="w-16 h-16 object-cover rounded-lg" />
          <button
            onClick={onClear}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white rounded-full text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center"
        >
          画像
        </button>
      )}
    </div>
  );
};
