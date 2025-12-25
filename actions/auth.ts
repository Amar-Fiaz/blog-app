"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/schema";

export async function register(data: RegisterInput) {
  try {
    // Validate input
    const validated = registerSchema.safeParse(data);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An error occurred during registration",
    };
  }
}
