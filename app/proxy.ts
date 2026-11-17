import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAuthed, loginRedirectTarget } from "@/lib/simumed/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }
  if (await isAuthed(request)) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(loginRedirectTarget(request));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*|icons).*)",
  ],
};
