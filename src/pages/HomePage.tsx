import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { useAuth } from "../features/auth/hooks/useAuth";
import { VoicePage } from "../features/voice-list/components/VoicePage";
import { SATOSHI_USER_ID, MINA_USER_ID } from "../shared/lib/mockData";

export const HomePage = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0); // 0: サトボイス、1: ミナボイス

  const isSatoshi = user?.email === import.meta.env.VITE_SATOSHI_EMAIL;
  const isMina = user?.email === import.meta.env.VITE_MINA_EMAIL;

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentPage(1), // 左スワイプ → ミナボイスへ
    onSwipedRight: () => setCurrentPage(0), // 右スワイプ → サトボイスへ
    preventScrollOnSwipe: true,
    trackMouse: true, // 開発中にPCでも確認できる
  });

  return (
    // overflow-hidden でスクロールバーを隠し、相対配置でドットを重ねる
    <div className="relative h-svh overflow-hidden" {...handlers}>
      {/* 2ページを横並びにしたコンテナ。translateX でスライドさせる */}
      <div className="flex h-full transition-transform duration-300 ease-in-out" style={{ width: "200vw", transform: `translateX(${currentPage === 0 ? "0" : "-100vw"})` }}>
        {/* サトボイスページ */}
        <div className="w-screen h-full overflow-y-auto">
          <VoicePage title="サトボイス" userId={SATOSHI_USER_ID} bgColor="bg-green-50" canRecord={isSatoshi} />
        </div>

        {/* ミナボイスページ */}
        <div className="w-screen h-full overflow-y-auto">
          <VoicePage title="ミナボイス" userId={MINA_USER_ID} bgColor="bg-blue-50" canRecord={isMina} />
        </div>
      </div>

      {/* ページインジケーター（常に画面下部に固定） */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentPage === 0 ? "bg-green-500" : "bg-gray-300"}`} />
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentPage === 1 ? "bg-blue-400" : "bg-gray-300"}`} />
      </div>
    </div>
  );
};
