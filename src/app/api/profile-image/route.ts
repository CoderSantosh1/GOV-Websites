import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    // Create a unique filename
    const ext = file.name.split(".").pop();
    const filename = `${userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/profile/${filename}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
} 