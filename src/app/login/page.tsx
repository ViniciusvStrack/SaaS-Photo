"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PHOTO_URLS } from "@/data/mock-data";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "client") {
        router.push("/client/dashboard");
      } else {
        router.push("/app/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      showToast("Login realizado com sucesso!", "success");
    } else {
      showToast(result.error || "Erro ao fazer login", "error");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: "admin" | "photographer" | "client") => {
    const credentials = {
      admin: { email: "admin", password: "admin" },
      photographer: { email: "studio", password: "studio" },
      client: { email: "cliente", password: "cliente" },
    };
    setEmail(credentials[type].email);
    setPassword(credentials[type].password);
    setIsLoading(true);
    await login(credentials[type].email, credentials[type].password);
  };

  return (
    <div className="min-h-screen flex bg-noir-deep">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          src={PHOTO_URLS[2]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-deep via-noir-deep/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-16 left-16 max-w-md"
        >
          <h2 className="text-3xl font-bold mb-3">
            <span className="text-gold">Noir</span>Frame
          </h2>
          <p className="text-noir-400 leading-relaxed">
            Onde a arte encontra a organização. Gerencie sua carreira fotográfica com a elegância que ela merece.
          </p>
        </motion.div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold inline-block mb-2">
              <span className="text-gold">Noir</span>Frame
            </Link>
            <p className="text-noir-500 text-sm">Entre na sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email ou usuário"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-noir-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 accent-gold" />
                Lembrar de mim
              </label>
              <Link href="/forgot-password" className="text-gold hover:text-gold-light transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-noir-deep px-3 text-xs text-noir-600">ou acesse como demo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin("admin")}
              disabled={isLoading}
            >
              Admin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin("photographer")}
              disabled={isLoading}
            >
              Fotógrafo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin("client")}
              disabled={isLoading}
            >
              Cliente
            </Button>
          </div>

          <p className="text-center text-xs text-noir-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
              Criar conta gratuita
            </Link>
          </p>

          <div className="mt-8 p-4 bg-white/[0.02] rounded-lg border border-white/5">
            <p className="text-xs text-noir-500 text-center mb-2">Credenciais de teste:</p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-noir-400">
              <div className="text-center">
                <p className="font-medium text-white">Admin</p>
                <p>admin / admin</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-white">Fotógrafo</p>
                <p>studio / studio</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-white">Cliente</p>
                <p>cliente / cliente</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
