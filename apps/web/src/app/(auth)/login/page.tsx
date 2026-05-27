"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Kairos</h1>
          <p className="mt-2 text-muted-foreground">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="pastor@igreja.com"
              className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Cadastre sua igreja
          </Link>
        </p>
      </div>
    </div>
  );
}
