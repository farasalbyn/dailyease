
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT n.*, c.name AS category
      FROM needs n
      JOIN categories c ON n.category_id = c.id
      ORDER BY n.id DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("ERROR NEEDS GET:", error);
    return Response.json(
      { message: "Gagal mengambil kebutuhan" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, category_id, quantity, status } =
      await request.json();

    if (
      !name?.trim() ||
      !Number.isInteger(Number(category_id)) ||
      Number(category_id) < 1 ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      !["Belum", "Sudah"].includes(status || "Belum")
    ) {
      return Response.json(
        { message: "Data tidak valid" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO needs (name, category_id, quantity, status)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        Number(category_id),
        Number(quantity),
        status || "Belum",
      ]
    );

    return Response.json(
      { message: "Kebutuhan berhasil ditambahkan", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR NEEDS POST:", error);
    return Response.json(
      { message: "Gagal menambahkan kebutuhan" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name, category_id, quantity, status } =
      await request.json();

    if (
      !Number.isInteger(Number(id)) ||
      Number(id) < 1 ||
      !name?.trim() ||
      !Number.isInteger(Number(category_id)) ||
      Number(category_id) < 1 ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      !["Belum", "Sudah"].includes(status)
    ) {
      return Response.json(
        { message: "Data tidak valid" },
        { status: 400 }
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM needs WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return Response.json(
        { message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.query(
      `UPDATE needs
       SET name = ?, category_id = ?, quantity = ?, status = ?
       WHERE id = ?`,
      [name.trim(), Number(category_id), Number(quantity), status, id]
    );

    return Response.json({
      message: "Kebutuhan berhasil diperbarui",
    });
  } catch (error) {
    console.error("ERROR NEEDS PUT:", error);
    return Response.json(
      { message: "Gagal memperbarui kebutuhan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return Response.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "DELETE FROM needs WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return Response.json(
        { message: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Kebutuhan berhasil dihapus",
    });
  } catch (error) {
    console.error("ERROR NEEDS DELETE:", error);
    return Response.json(
      { message: "Gagal menghapus kebutuhan" },
      { status: 500 }
    );
  }
}
