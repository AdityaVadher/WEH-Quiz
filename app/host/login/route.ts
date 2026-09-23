import { NextResponse } from "next/server";
import {
  createHostSessionToken,
  getHostPassword,
  HOST_SESSION_COOKIE,
  HOST_SESSION_TTL_SECONDS,
} from "../host-auth";

export async function POST(request: Request) {
  const configuredPassword = getHostPassword();
  if (!configuredPassword) return NextResponse.redirect(new URL("/host?error=config", request.url), 303);

  const formData = await request.formData();
  const suppliedPassword = formData.get("password");
  if (typeof suppliedPassword !== "string" || suppliedPassword !== configuredPassword) {
    return NextResponse.redirect(new URL("/host?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/host", request.url), 303);
  response.cookies.set(HOST_SESSION_COOKIE, await createHostSessionToken(configuredPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/host",
    maxAge: HOST_SESSION_TTL_SECONDS,
  });
  return response;
}
