
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY id ASC"
    );

    return Response.json(rows);
  } catch (error) {
    console.error("ERROR CATEGORIES:", error);

    return Response.json(
      { message: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}
