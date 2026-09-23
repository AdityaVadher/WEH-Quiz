import { NextResponse } from "next/server";
import { HOST_SESSION_COOKIE } from "../host-auth";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/host", request.url), 303);
  response.cookies.set(HOST_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
