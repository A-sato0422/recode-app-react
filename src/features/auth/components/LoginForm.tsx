import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FormField } from "../../../shared/components/ui/FormField";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg("メールアドレスまたはパスワードが違います");
      setIsSubmitting(false);
    } else {
      navigate("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <FormField label="メールアドレス" type="email" value={email} onChange={setEmail} placeholder="example@ex.com" required />
      <FormField label="パスワード" type="password" value={password} onChange={setPassword} placeholder="1234" required />

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button type="submit" disabled={isSubmitting} className="bg-green-400 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors">
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
};
