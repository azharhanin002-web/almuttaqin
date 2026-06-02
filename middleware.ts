import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  // ============================
  // HALAMAN ADMIN YANG BOLEH TANPA LOGIN
  // ============================

  const publicAdminRoutes = [
    "/admin/login",
    "/admin/request", // sementara untuk testing dashboard request
  ];

  if (publicAdminRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ============================
  // PROTEKSI HALAMAN ADMIN LAIN
  // ============================

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);

      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "rsm-secret-key-123"
      );

      await jwtVerify(token, secret);

      return NextResponse.next();
    } catch (error) {
      console.error(
        "💥 Token admin tidak valid:",
        error
      );

      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );

      response.cookies.delete("admin_session");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};