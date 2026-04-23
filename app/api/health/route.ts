import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: process.env.NEXT_PUBLIC_APP_NAME ?? "Acrely",
    time: new Date().toISOString(),
  });
}
