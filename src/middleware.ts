import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PUBLIC_PATHS = ["/", "/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("is_admin, profile_id, profiles:profile_id(role)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!session) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("session_token");
    return response;
  }

  const isAdmin = session.is_admin;
  const role = (session.profiles as { role?: string } | null)?.role;

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAdmin && pathname === "/comprador" && role !== "comprador") {
    return NextResponse.redirect(new URL("/aguardando", request.url));
  }

  if (!isAdmin && pathname === "/vendedor" && role !== "vendedor") {
    return NextResponse.redirect(new URL("/aguardando", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
