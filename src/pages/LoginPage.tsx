import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-green-50 px-6">
      <h1 className="text-2xl font-bold text-green-600 mb-8">おかえり 🎙️</h1>
      <LoginForm />
    </div>
  );
};
