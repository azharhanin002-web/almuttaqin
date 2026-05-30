import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  // 🟢 AMAN GOLONGAN 1: Jika yang diakses adalah halaman login admin itu sendiri,
  // JANGAN intercept, jangan cek database. Langsung loloskan murni 100% agar halaman formulir muncul!
  if (pathname === "/admin/login") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || "rsm-secret-key-123"
        );
        await jwtVerify(token, secret);
        // Jika token terbukti sah, langsung alihkan ke dashboard internal
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } catch {
        // Jika token di cookies ternyata palsu/expired, biarkan tetap di halaman login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 🟢 AMAN GOLONGAN 2: Proteksi seluruh halaman internal admin selain /admin/login
  if (pathname.startsWith("/admin")) {
    // Jika jemaah/admin belum login (tidak punya cookie token)
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika kedapatan memiliki token cookie, verifikasi keasliannya lewat jose
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "rsm-secret-key-123"
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.error("💥 Token admin kedaluwarsa atau dimanipulasi:", error);
      // Bersihkan cookie palsu tersebut, lalu tendang kembali ke gerbang login depan
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  // 3. HALAMAN LAIN (Masyarakat/Pembaca) TETAP BEBAS BERKELANA
  return NextResponse.next();
}

// Konfigurasi matcher resmi Next.js
export const config = {
  // Hanya memantau rute admin, namun dengan penanganan aman di dalam fungsi utama
  matcher: ["/admin/:path*"],
};