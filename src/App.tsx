import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./app/ProtectedRoute";

// 後のステップで作るページ（仮置き）
const HomePage = () => <div className="p-4">ホーム画面（ステップ4で実装）</div>;
const PlayerPage = () => <div className="p-4">再生画面（ステップ6で実装）</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ProtectedRoute が1つのマウントで全子ルートを守る */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
