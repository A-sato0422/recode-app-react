import { useState, useEffect, useRef } from "react";

export const useAudioPlayer = (audioUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // timeupdataイベント：再生中に定期的に発火→シークバーを更新することができる
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setIsPlaying(false));

    // アンマウント時に再生を止めてメモリを解放
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  // 再生・一時停止
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

  // seekバーの操作
  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipBackward = () => seek(Math.max(currentTime - 5, 0));
  const skipForward = () => seek(Math.min(currentTime + 5, duration));

  return { isPlaying, currentTime, duration, toggle, seek, skipBackward, skipForward };
};
