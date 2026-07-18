import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/shared/Logo";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!supabase) {
      setError("Supabase n'est pas configuré.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect");
      setIsLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-10 mb-2" />
          <p className="text-sm text-slate-500 mt-2 text-center">
            Connectez-vous pour accéder à la gestion de stock.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="password">Mot de passe</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-10"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
