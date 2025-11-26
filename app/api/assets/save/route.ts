// app/api/assets/save/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect"; // Adjust path if your file is named dbconnect.ts
import Asset from "@/models/Asset";

export async function POST(req: Request) {
  try {
    // 1. Connect to Database
    await dbConnect();

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    // 3. Validation
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Asset name is required" },
        { status: 400 }
      );
    }

    // 4. Convert File to Buffer
    // Next.js/Web API 'File' needs to be converted to ArrayBuffer, then to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Create and Save Document
    const newAsset = await Asset.create({
      name: name,
      type: type || "unknown",
      contentType: file.type, // e.g. "image/png"
      size: file.size,
      data: buffer,
    });

    console.log(`Asset saved: ${newAsset._id}`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Asset saved successfully", 
        assetId: newAsset._id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}