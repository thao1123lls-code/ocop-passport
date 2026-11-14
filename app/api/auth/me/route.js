import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ success: true, user: await currentUser() });
  } catch {
    return NextResponse.json({ success: true, user: null }); // DB chưa sẵn sàng: coi như chưa đăng nhập
  }
}
