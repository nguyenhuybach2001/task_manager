"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
} from "../../firebase/auth";
import { useToast } from "../../hooks/useToast";
import Image from "next/image";

export default function Login() {
  // const [isRegister, setIsRegister] = useState(false);
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const GoogleIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      addToast("Đăng nhập thành công!", "success");
      router.replace("/");
    } catch (error) {
      addToast("Lỗi đăng nhập: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // const handleEmailSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     if (isRegister) {
  //       await registerWithEmail(email, password, displayName);
  //       addToast("Đăng ký thành công!", "success");
  //     } else {
  //       await signInWithEmail(email, password);
  //       addToast("Đăng nhập thành công!", "success");
  //     }
  //     router.replace("/");
  //   } catch (error) {
  //     const msg =
  //       error.code === "auth/user-not-found"
  //         ? "Email không tồn tại"
  //         : error.code === "auth/wrong-password"
  //           ? "Sai mật khẩu"
  //           : error.code === "auth/email-already-in-use"
  //             ? "Email đã được sử dụng"
  //             : error.code === "auth/weak-password"
  //               ? "Mật khẩu quá yếu (tối thiểu 6 ký tự)"
  //               : error.message;
  //     addToast(msg, "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-parchment animate-fade-in">
      <div className="w-full max-w-md bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-copper/30 m-4 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-copper/30 m-4 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-copper/30 m-4 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-copper/30 m-4 rounded-br-lg pointer-events-none"></div>

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-heading font-bold text-ink mb-2">
            Task Manager
          </h1>
          <p className="text-ink-muted font-typewriter text-sm tracking-widest uppercase">
            Ốc iuuu 😘
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-white text-ink font-medium shadow-sm hover:bg-parchment-dark hover:border-border-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <GoogleIcon />
          Đăng nhập với Google
        </button>

        {/* <div className="relative flex py-4 items-center mb-6">
          <div className="flex-grow border-t border-border-light"></div>
          <span className="flex-shrink-0 mx-4 text-ink-faint font-ui text-sm uppercase tracking-wider">
            hoặc
          </span>
          <div className="flex-grow border-t border-border-light"></div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-ink-light mb-1.5 ml-1">
                Tên hiển thị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required={isRegister}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                  placeholder="Nhập tên của bạn"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-light mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-light mb-1.5 ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-copper hover:bg-copper-dark text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </div>
            ) : isRegister ? (
              "Đăng ký"
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-ink-muted font-ui">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-copper font-semibold hover:text-copper-dark hover:underline transition-all"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </div> */}
      </div>
    </div>
  );
}
