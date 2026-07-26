import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  // Check if the current user is authenticated
  // Get JWT (auth_token) from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token"); // cookies object

  // Token exists?
  // N: Return 401 Unauthorized
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Verify the JWT(token signature and expiration)
  // Token valid?
  try {
    const verifiedToken = jwt.verify(token.value, process.env.JWT_SECRET!);

    // Type narrowing required => verifiedToken: string | jwt.JwtPayload
    if (typeof verifiedToken !== "object") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get userId from the verified token payload
    const userId = verifiedToken.userId;

    // Validate userId type
    if (typeof userId !== "number") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Look up current user in the database
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
      users.email,
      users.joined_date AS joinedDate,
      addresses.address_line1 AS addressLine1
      FROM users
      LEFT JOIN addresses
      ON users.user_id = addresses.user_id
      WHERE users.user_id = ?`,
      [userId],
    );
    // User exists?
    // N: Return 401 Unauthorized
    if (rows.length === 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Y: Return user info
    const currentUser = rows[0];
    return NextResponse.json(currentUser);
  } catch (err: unknown) {
    console.error(err);
    // N: Expired, invalid token -> Return 401 Unauthorized
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
