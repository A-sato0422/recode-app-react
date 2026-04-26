import { useState } from "react";

export const useThumbnailUpload = () => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  const selectThumbnail = (file: File) => {
    setThumbnailFile(file);

    // 前のURLが残っていたら、リセット
    if (thumbnailPreviewUrl !== null) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  };

  const clearThumbnail = () => {
    if (thumbnailPreviewUrl !== null) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
  };

  return { thumbnailFile, thumbnailPreviewUrl, selectThumbnail, clearThumbnail };
};
