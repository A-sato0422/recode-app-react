import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-4">
      <p className="text-6xl">🔍</p>
      <h1 className="text-2xl font-bold text-gray-700">ページが見つかりません</h1>
      <p className="text-gray-400">404 Not Found</p>
      <button onClick={() => navigate("/")} className="mt-4 text-green-500 underline text-sm">
        ホームに戻る
      </button>
    </div>
  );
};
