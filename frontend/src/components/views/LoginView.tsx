import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  Brain,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface LoginViewProps {
  onLoginSuccess: (
    credentialResponse: any,
    role: "admin" | "patient"
  ) => void;
  onBack?: () => void;
}

export function LoginView({ onLoginSuccess, onBack }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [view, setView] = useState<"login" | "forgot_password" | "register">("login");
  const [role, setRole] = useState<"admin" | "patient">("admin");
  const [fullName, setFullName] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onLoginSuccess({ email, rememberMe }, role);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: fullName.trim(), role } },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    alert("Registration successful! Check your email to confirm your account.");
    setView("login");
    setPassword("");
    setFullName("");
    setError("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetMessage(`Reset instructions sent to ${email}`);
  };

  return (
    <div className="min-h-screen bg-[#e8e8e6] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-[1050px] p-2 flex flex-col md:flex-row overflow-hidden min-h-[700px]">
        
        {/* Left Image Section */}
        <div className="relative hidden md:block w-[45%] rounded-[2.2rem] overflow-hidden bg-[#e0e0e0]">
          <img src="/brain_art.jpg" className="w-full h-full object-cover" alt="NeuroScan AI Brain" />
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-10 relative overflow-y-auto">
          {onBack && (
            <button 
              type="button"
              onClick={() => {
                if (view !== "login") {
                  setView("login");
                  setError("");
                } else {
                  onBack();
                }
              }}
              className="absolute top-6 left-6 md:top-8 md:left-8 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="max-w-[400px] w-full mx-auto mt-4 md:mt-0">
            
            {/* LOGO */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <Brain size={24} className="text-slate-900" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">NeuroScan</span>
            </div>

            {/* ================= LOGIN VIEW ================= */}
            {view === "login" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-[1.75rem] font-bold text-slate-900 mb-2">Login to your account</h2>
                  <p className="text-gray-400 text-sm">Welcome back! Enter your details to log in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col">
                  <div className="mb-5">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Email</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Password</label>
                    <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         placeholder="Enter your Password"
                         className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400 pr-12"
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                         {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                       </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between mb-8 gap-2">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe ? "bg-[#0284c7] border-[#0284c7] text-white" : "border-gray-300 bg-white"}`}>
                          {rememberMe && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-gray-500 text-sm">Remember login</span>
                     </label>
                     <button type="button" className="text-sm font-semibold text-[#0284c7] hover:underline" onClick={() => { setView('forgot_password'); setError(""); }}>
                       Forget Password?
                     </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] flex items-center gap-2 border border-red-100">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-[0.85rem] text-[15px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="relative flex items-center justify-center my-8">
                   <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                   </div>
                   <span className="relative bg-white px-4 text-xs text-gray-400">Or continue with</span>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                   <button type="button" onClick={handleGoogleLogin} className="w-full h-12 flex items-center justify-center gap-3 bg-[#f2f2f2] hover:bg-[#e8e8e8] text-slate-900 rounded-[0.85rem] text-[14px] font-semibold transition-colors">
                      <GoogleIcon />
                      Sign in with Google
                   </button>
                </div>

                <div className="text-center text-sm text-gray-500">
                   New here? <button type="button" className="text-[#0284c7] font-bold hover:underline" onClick={() => { setView('register'); setError(""); }}>Create account</button>
                </div>
              </>
            )}

            {/* ================= REGISTER VIEW ================= */}
            {view === "register" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-[1.75rem] font-bold text-slate-900 mb-2">Create an account</h2>
                  <p className="text-gray-400 text-sm">Join NeuroScan to access AI MRI analysis tools</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col">

                  <div className="mb-4">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Full Name</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Dr. John Doe"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Email</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Password</label>
                    <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         placeholder="Create a Password"
                         className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400 pr-12"
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                         {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                       </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] flex items-center gap-2 border border-red-100">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-[0.85rem] text-[15px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center mb-8"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-500">
                   Already have an account? <button type="button" className="text-[#0284c7] font-bold hover:underline" onClick={() => { setView('login'); setError(""); }}>Sign in</button>
                </div>
              </>
            )}

            {/* ================= FORGOT PASSWORD VIEW ================= */}
            {view === "forgot_password" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-[1.75rem] font-bold text-slate-900 mb-2">Reset Password</h2>
                  <p className="text-gray-400 text-sm">Enter your email and we'll send a reset link</p>
                </div>

                <form onSubmit={handleForgotPassword} className="flex flex-col">
                  <div className="mb-6">
                    <label className="block text-gray-500 text-sm mb-1.5 font-medium">Email</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-50 transition-all text-sm text-slate-900 placeholder:text-gray-400"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[12px] flex items-center gap-2 border border-red-100">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  {resetMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-[12px] flex items-center gap-2 border border-green-100">
                      <Check size={14} />
                      {resetMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full h-12 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-[0.85rem] text-[15px] font-semibold transition-all flex items-center justify-center mb-6"
                  >
                    Send Reset Link
                  </button>

                  <button 
                    type="button" 
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    onClick={() => { setView('login'); setResetMessage(""); setError(""); }}
                  >
                    <ArrowLeft size={16} />
                    Back to login
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginView;