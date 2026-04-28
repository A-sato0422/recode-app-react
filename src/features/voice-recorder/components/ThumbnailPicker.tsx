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
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-400">サムネイル（任意）</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="relative w-20 h-20">
          <img src={previewUrl} className="w-20 h-20 object-cover rounded-xl" />
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
          className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center"
        >
          ＋ 追加
        </button>
      )}
    </div>
  );
};
