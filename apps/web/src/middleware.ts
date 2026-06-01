import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas de autenticacao (nao precisam de sessao, mas se logado vai pro dashboard)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
            cookies: {
                      getAll: () => request.cookies.getAll(),
                      setAll: (cookiesToSet) => {
                                  cookiesToSet.forEach(({ name, value }) =>
                                                request.cookies.set(name, value)
                                                                 );
                                  supabaseResponse = NextResponse.next({ request });
                                  cookiesToSet.forEach(({ name, value, options }) =>
                                                supabaseResponse.cookies.set(name, value, options)
                                                                 );
                      },
            },
    }
      );

  const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

  // Landing page "/" sempre acessivel para todos (logado ou nao)
  if (pathname === "/") {
        return supabaseResponse;
  }

  // Rotas de auth: se ja logado, redireciona pro dashboard
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
    if (user && isAuthRoute) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
    }

  // Rotas privadas: se nao logado, redireciona pro login
  if (!user && !isAuthRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
    matcher: [
          "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
        ],
};
