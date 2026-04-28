import { useState, useEffect, useRef } from "react";

export const useAudioPlayer = (audioUrl: string, expectedDuration?: number) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // audio.duration が Infinity の場合（iOS mp4）、ended が発火しないことがある
      // expectedDuration を超えたら手動で終了処理を行う
      if (!isFinite(audio.duration) && expectedDuration && audio.currentTime >= expectedDuration) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipBackward = () => seek(Math.max(currentTime - 5, 0));
  const skipForward = () => seek(Math.min(currentTime + 5, duration));

  return { isPlaying, currentTime, duration, toggle, seek, skipBackward, skipForward };
};
