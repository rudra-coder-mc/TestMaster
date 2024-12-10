import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const url = req.nextUrl.clone();
  const path = req.nextUrl.pathname;

  // Check if the request is for static files, public assets, or API routes
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.startsWith("/api");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // If the user is not authenticated and tries to access login or signup
  if (!accessToken && (path === "/login" || path === "/signup")) {
    return NextResponse.next(); // Allow access
  }

  // Redirect unauthenticated users trying to access other routes
  if (!accessToken && path !== "/login" && path !== "/signup") {
    url.pathname = "/login"; // Redirect to login
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access login or signup
  if (accessToken && (path === "/login" || path === "/signup")) {
    url.pathname = "/"; // Redirect to the home page or dashboard
    return NextResponse.redirect(url);
  }

  // Allow authenticated users to access other routes
  return NextResponse.next();
}

// Define the routes that middleware should process
export const config = {
  matcher: ["/:path*"], // Match all routes, you can fine-tune this if necessary
};
