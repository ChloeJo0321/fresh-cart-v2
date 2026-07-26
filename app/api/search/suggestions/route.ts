import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

type ProductSuggestion = RowDataPacket & {
  searchKeyword: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typedWord = searchParams.get("q")?.trim();

    // typed word exists?
    // N => Return empty array
    if (!typedWord) {
      return NextResponse.json([], { status: 200 });
    }

    // Find suggestions for the typed word
    const [rows] = await db.query<ProductSuggestion[]>(
      `SELECT DISTINCT
      search_keyword AS searchKeyword
      FROM products
      WHERE search_keyword
      LIKE ?`,
      [`${typedWord}%`],
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}