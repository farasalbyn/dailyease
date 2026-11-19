
"use client";

import { useCallback, useEffect, useState } from "react";

const categoryStyles = {
  Sekolah: { icon: "▤", color: "#F3E5E9" },
  Pribadi: { icon: "♙", color: "#F4EBDD" },
  Rumah: { icon: "⌂", color: "#E9EDE5" },
};

async function request(url, method = "GET", data = null) {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    ...(data && { body: JSON.stringify(data) }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Permintaan gagal.");
  return result;
}

export default function Home() {
  const [needs, setNeeds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({ name: "", category_id: "", quantity: 1 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [needData, categoryData] = await Promise.all([
        request("/api/needs"),
        request("/api/categories"),
      ]);

      setNeeds(needData);
      setCategories(categoryData);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completed = needs.filter((item) => item.status === "Sudah").length;
  const pending = needs.length - completed;
  const progress = needs.length ? Math.round((completed / needs.length) * 100) : 0;

  const filteredNeeds = needs.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "Semua" || item.category === filter)
  );

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function openAdd() {
    setEditing(null);
    setForm({ name: "", category_id: categories[0]?.id || "", quantity: 1 });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({
      name: item.name,
      category_id: item.category_id,
      quantity: item.quantity,
    });
    setShowForm(true);
  }

  async function saveNeed(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.category_id || Number(form.quantity) < 1) {
      return;
    }

    const existing = needs.find((item) => item.id === editing);
    const payload = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      quantity: Number(form.quantity),
      status: existing?.status || "Belum",
    };

    try {
      setErrorMessage("");
      await request(
        "/api/needs",
        editing !== null ? "PUT" : "POST",
        editing !== null ? { id: editing, ...payload } : payload
      );

      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function deleteNeed(id) {
    if (!window.confirm("Apakah kamu yakin ingin menghapus kebutuhan ini?")) {
      return;
    }

    try {
      setErrorMessage("");
      await request("/api/needs", "DELETE", { id });
      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function toggleStatus(item) {
    try {
      setErrorMessage("");
      await request("/api/needs", "PUT", {
        id: item.id,
        name: item.name,
        category_id: item.category_id,
        quantity: item.quantity,
        status: item.status === "Sudah" ? "Belum" : "Sudah",
      });
      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F1E9] text-[#30232B] md:flex">
      <aside className="flex w-full flex-col justify-between bg-white px-5 py-7 md:fixed md:inset-y-0 md:w-[230px]">
        <div>
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#641E32] text-xl text-white">D</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DailyEase</h1>
              <p className="text-[10px] tracking-widest text-[#A18C91]">DAILY NEEDS MANAGER</p>
            </div>
          </div>

          <p className="mb-3 text-[10px] font-bold tracking-[2px] text-[#A18C91]">MENU UTAMA</p>
          <nav className="space-y-2">
            <a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-[#641E32] px-4 py-3 text-sm font-semibold text-white shadow-md">
              <span>⌂</span> Dashboard
            </a>
            <a href="#kebutuhan" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#75656B] transition hover:bg-[#F5EBEE] hover:text-[#641E32]">
              <span>▤</span> Daftar Kebutuhan
            </a>
            <a href="#kategori" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#75656B] transition hover:bg-[#F5EBEE] hover:text-[#641E32]">
              <span>▦</span> Kategori
            </a>
          </nav>
        </div>

        <div className="hidden rounded-2xl bg-gradient-to-br from-[#78334C] to-[#351522] p-4 text-white md:block">
          <div className="mb-3 text-2xl">✦</div>
          <h3 className="font-semibold">Hidup lebih teratur.</h3>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            Catat kebutuhanmu dan kelola semuanya dalam satu tempat.
          </p>
          <p className="mt-6 text-[10px] text-white/50">DailyEase © 2026</p>
        </div>
      </aside>

      <section id="dashboard" className="min-w-0 flex-1 p-5 md:ml-[230px] md:p-9 lg:p-10">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-[470px]">
            <span className="absolute left-4 top-3 text-[#A18C91]">⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kebutuhan..."
              className="w-full rounded-xl border border-[#EDE4D9] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#641E32]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Pengguna DailyEase</p>
              <p className="text-xs text-[#A18C91]">Personal workspace</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#641E32] font-semibold text-white">D</div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[3px] text-[#987C83]">{today}</p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Dash<span className="font-serif italic text-[#74334E]">board.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-[#887980]">
              Atur kebutuhan harianmu, tetap terorganisir, dan selesaikan semuanya dengan lebih mudah.
            </p>
          </div>

          <button
            onClick={openAdd}
            disabled={!categories.length}
            className="rounded-xl bg-[#641E32] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#641E32]/15 transition hover:bg-[#7C3049] disabled:opacity-50"
          >
            + Tambah Kebutuhan
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
            <button onClick={() => setErrorMessage("")} className="ml-3 font-semibold underline">Tutup</button>
          </div>
        )}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-[#51243D] p-6 text-white shadow-sm">
            <p className="text-sm text-white/65">Total Kebutuhan</p>
            <h3 className="mt-4 font-serif text-5xl">{needs.length}</h3>
            <p className="mt-3 text-xs text-white/65">Seluruh data kebutuhan</p>
          </div>

          <div className="rounded-2xl border border-[#EEE5DA] bg-white p-6">
            <p className="text-sm text-[#887980]">Sudah Terpenuhi</p>
            <h3 className="mt-4 font-serif text-5xl text-[#557D5B]">{completed}</h3>
            <p className="mt-3 text-xs text-[#A18C91]">Kebutuhan telah selesai</p>
          </div>

          <div className="rounded-2xl border border-[#EEE5DA] bg-white p-6">
            <p className="text-sm text-[#887980]">Belum Terpenuhi</p>
            <h3 className="mt-4 font-serif text-5xl text-[#A34E5E]">{pending}</h3>
            <p className="mt-3 text-xs text-[#A18C91]">Masih perlu diperhatikan</p>
          </div>

          <div className="rounded-2xl border border-[#EEE5DA] bg-white p-6">
            <p className="text-sm text-[#887980]">Progress</p>
            <h3 className="mt-4 font-serif text-5xl text-[#641E32]">{progress}%</h3>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#F0E8DF]">
              <div className="h-full rounded-full bg-[#641E32] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <section id="kategori" className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[2px] text-[#A18C91]">ORGANISASI</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold">Kategori Kebutuhan</h3>
            </div>
            <button onClick={() => setFilter("Semua")} className="text-xs font-semibold text-[#641E32] hover:underline">
              Lihat semua
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((cat) => {
              const style = categoryStyles[cat.name] || { icon: "▤", color: "#F3E5E9" };
              const count = needs.filter((item) => item.category === cat.name).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(filter === cat.name ? "Semua" : cat.name)}
                  className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                    filter === cat.name ? "border-[#641E32] bg-[#F4E9ED]" : "border-[#EEE5DA] bg-white"
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span style={{ backgroundColor: style.color }} className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-[#641E32]">
                      {style.icon}
                    </span>
                    <span className="text-sm text-[#A18C91]">↗</span>
                  </div>
                  <h4 className="font-semibold">{cat.name}</h4>
                  <p className="mt-1 text-xs text-[#A18C91]">{cat.description}</p>
                  <p className="mt-4 text-xs font-semibold text-[#641E32]">{count} kebutuhan</p>
                </button>
              );
            })}
          </div>
        </section>

        <section id="kebutuhan" className="rounded-2xl border border-[#EEE5DA] bg-white p-5 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[2px] text-[#A18C91]">DAFTAR AKTIVITAS</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold">Kebutuhan Saya</h3>
              <p className="mt-1 text-xs text-[#A18C91]">Kelola semua kebutuhan sehari-hari.</p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-[#EDE4D9] bg-white px-3 py-2 text-sm outline-none focus:border-[#641E32]"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0E9E0] text-xs text-[#A18C91]">
                  <th className="pb-4 font-medium">NAMA KEBUTUHAN</th>
                  <th className="pb-4 font-medium">KATEGORI</th>
                  <th className="pb-4 font-medium">JUMLAH</th>
                  <th className="pb-4 font-medium">STATUS</th>
                  <th className="pb-4 font-medium">TINDAKAN</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-[#A18C91]">Memuat data dari database...</td></tr>
                ) : filteredNeeds.length ? (
                  filteredNeeds.map((item) => (
                    <tr key={item.id} className="border-b border-[#F5EFE8] last:border-0">
                      <td className="py-5 font-semibold">{item.name}</td>
                      <td className="py-5 text-[#887980]">{item.category}</td>
                      <td className="py-5 text-[#887980]">{item.quantity}</td>
                      <td className="py-5">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            item.status === "Sudah" ? "bg-[#E8F0E5] text-[#557D5B]" : "bg-[#F8E8E8] text-[#A34E5E]"
                          }`}
                        >
                          {item.status === "Sudah" ? "✓ Terpenuhi" : "○ Belum"}
                        </button>
                      </td>
                      <td className="py-5">
                        <div className="flex gap-4">
                          <button onClick={() => openEdit(item)} className="font-medium text-[#641E32] hover:underline">Edit</button>
                          <button onClick={() => deleteNeed(item.id)} className="font-medium text-[#B44E5C] hover:underline">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-12 text-center text-[#A18C91]">Tidak ada kebutuhan yang ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="py-7 text-center text-xs text-[#A18C91]">
          DailyEase © 2026 · Manage your daily needs with ease.
        </footer>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24141D]/50 p-4">
          <form onSubmit={saveNeed} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[2px] text-[#A18C91]">DAILYEASE FORM</p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#641E32]">
                  {editing !== null ? "Edit Kebutuhan" : "Tambah Kebutuhan"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-xl text-[#887980]">×</button>
            </div>

            <label className="mb-2 block text-sm font-medium">Nama kebutuhan</label>
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masukkan nama kebutuhan"
              className="mb-5 w-full rounded-xl border border-[#EDE4D9] p-3 text-sm outline-none focus:border-[#641E32]"
            />

            <label className="mb-2 block text-sm font-medium">Kategori</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mb-5 w-full rounded-xl border border-[#EDE4D9] bg-white p-3 text-sm outline-none focus:border-[#641E32]"
            >
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>

            <label className="mb-2 block text-sm font-medium">Jumlah</label>
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mb-7 w-full rounded-xl border border-[#EDE4D9] p-3 text-sm outline-none focus:border-[#641E32]"
            />

            <button type="submit" className="w-full rounded-xl bg-[#641E32] py-3 text-sm font-semibold text-white transition hover:bg-[#7C3049]">
              {editing !== null ? "Simpan Perubahan" : "Simpan Kebutuhan"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
