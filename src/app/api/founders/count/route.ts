import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const count = await prisma.user.count();

    return NextResponse.json(
      { count, total: 100 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error counting founders:", error);
    return NextResponse.json({ count: 0, total: 100 }, { status: 500 });
  }
}
