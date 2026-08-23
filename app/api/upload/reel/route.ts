import { NextResponse } from "next/server";
import { getDatabaseServerClient } from "@/lib/database-server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;

    if (!file || !fileName) {
      return NextResponse.json({ error: "Missing file or fileName" }, { status: 400 });
    }

    const dbClient = await getDatabaseServerClient();
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { data, error } = await dbClient.storage.from("reels").upload(fileName, buffer);

    if (error) throw error;

    const { data: urlData } = dbClient.storage.from("reels").getPublicUrl(fileName);
    return NextResponse.json({ publicUrl: urlData.publicUrl, path: data?.path });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
