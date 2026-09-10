import { useState, type FormEvent } from "react";
import { useData } from "../context/DataContext";

export function AuthPage() {
  const { login, register } = useData();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isRegister && name.trim().length < 2) {
      setError("Vui lòng nhập tên có ít nhất 2 ký tự.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu cần có ít nhất 6 ký tự.");
      return;
    }

    const result = isRegister
      ? await register(name, email, password)
      : await login(email, password);
    if (result.error) setError(result.error);
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-panel card animate-fade-in" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-mark">3D</span>
          <div>
            <p className="auth-kicker">3D Print Cost</p>
            <h1 id="auth-title">{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h1>
          </div>
        </div>
        <p className="auth-copy">
          {isRegister
            ? "Lưu báo giá và quản lý danh sách sản phẩm in của bạn."
            : "Đăng nhập để tiếp tục quản lý báo giá sản phẩm in 3D."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Xác thực">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Đăng nhập</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Đăng ký</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="field">
              <span>Họ và tên</span>
              <input className="input-field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label className="field">
            <span>Mật khẩu</span>
            <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} required />
          </label>
          {error && <div className="error-box" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary auth-submit">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
