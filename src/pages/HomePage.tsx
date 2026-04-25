import { useAuth } from "../features/auth/hooks/useAuth";
import { VoicePage } from "../features/voice-list/components/VoicePage";
import { SATOSHI_USER_ID, MINA_USER_ID } from "../shared/lib/mockData";

export const HomePage = () => {
  const { user } = useAuth();

  const isSatoshi = user?.email === import.meta.env.VITE_SATOSHI_EMAIL;
  const isMina = user?.email === import.meta.env.VITE_MINA_EMAIL;

  return (
    // ステップ5で横スクロール2画面に切り替える
    <VoicePage
      title={isSatoshi ? "サトボイス" : "ミナボイス"}
      userId={isSatoshi ? SATOSHI_USER_ID : MINA_USER_ID}
      bgColor={isSatoshi ? "bg-green-50" : "bg-blue-50"}
      canRecord={isSatoshi || isMina}
    />
  );
};
