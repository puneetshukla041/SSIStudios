import { NextRequest, NextResponse } from "next/server";
import FormDataNode from "form-data"; // This is for Node.js
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Get file from frontend
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Prepare FormData to send to remove.bg
    const form = new FormDataNode();
    form.append("image_file", buffer, { filename: "image.png" });

    // Call remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY || "",
      },
      body: form as any,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("remove.bg error:", text);
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(resultBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
