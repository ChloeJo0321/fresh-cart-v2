import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { validateSignInInput } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Get user info from frontend
    const { email, password } = await request.json();

    // Use helper function to validate sign in input (separation of concerns)
    const isValidInput = validateSignInInput(email, password);

    if (!isValidInput) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 400 },
      );
    }

    // Check if user exists in DB
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT user_id, hashed_password FROM users WHERE email = ?",
      [email],
    );

    // No user found with the email
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Validate if password  === hashed_password
    const hashedPassword = rows[0].hashed_password;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    // No, inform frontend
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Yes, create a sign-in session
    const userId = rows[0].user_id;

    // JWT
    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    // Store JWT in cookies
    const cookieStore = await cookies();

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ message: "Sign in success" }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      {
        message: "User sign in failed",
      },
      { status: 500 },
    );
  }
}
