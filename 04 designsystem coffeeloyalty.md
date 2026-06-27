# Design System
## Coffee Loyalty — Digital Stamp Loyalty System

| | |
|---|---|
| **Document** | 4 dari 4 Source of Truth |
| **Framework** | Tailwind CSS (Next.js) |
| **Last Updated** | 27 Juni 2026 |

> **Catatan untuk AI Agent:** `#22C55E` dan `#10B981` itu **persis** sama dengan default Tailwind `green-500` dan `emerald-500`. Jadi **tidak perlu** definisi custom color di `tailwind.config` — langsung pakai utility class `green-*` dan `emerald-*` bawaan Tailwind supaya seluruh tint/shade-nya konsisten otomatis.

---

## 1. Brand Color Palette

### 1.1 Primary — Green
| Token | Hex | Tailwind Class |
|---|---|---|
| Primary 500 (base) | `#22C55E` | `green-500` |
| Primary 600 (hover/active) | `#16A34A` | `green-600` |
| Primary 100 (light bg/badge) | `#DCFCE7` | `green-100` |
| Primary 50 (subtle bg) | `#F0FDF4` | `green-50` |

### 1.2 Secondary/Accent — Emerald
| Token | Hex | Tailwind Class |
|---|---|---|
| Emerald 500 (base) | `#10B981` | `emerald-500` |
| Emerald 600 (hover/active) | `#059669` | `emerald-600` |
| Emerald 100 (light bg) | `#D1FAE5` | `emerald-100` |

### 1.3 Semantic Colors
| Fungsi | Warna | Tailwind Class |
|---|---|---|
| Success | Emerald 500 | `emerald-500` |
| Warning (mis. "stempel hampir expired") | Amber 500 | `amber-500` |
| Error / Destructive | Red 500 | `red-500` |
| Info | Sky 500 | `sky-500` |

### 1.4 Neutral / Text
| Fungsi | Tailwind Class |
|---|---|
| Heading text | `slate-900` |
| Body text | `slate-600` |
| Muted/placeholder text | `slate-400` |
| Border | `slate-200` |
| Page background | `slate-50` / `white` |

### 1.5 Usage Guidance
- **Primary Green** → CTA utama ("Scan QR", "Generate", "Simpan"), nav active state, fill progress bar.
- **Emerald** → status sukses/positif ("Reward Tersedia", badge "Lunas"), gradient kombinasi dengan green di Loyalty Card.
- **Gradient signature:** `from-green-500 to-emerald-600` — dipakai di Loyalty Card & tombol primary besar, jadi identitas visual brand.
- Jangan pakai warna selain di atas untuk elemen UI inti, biar konsisten.

### 1.6 Tailwind Config Snippet
```js
// tailwind.config.ts
// Tidak perlu override colors — green & emerald default Tailwind sudah pas.
// Cukup pastikan content path mencakup app/ & components/.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
};
```

---

## 2. Typography
- **Font:** `Plus Jakarta Sans` via `next/font/google` — clean, modern, ramah dibaca di mobile.
- **Scale:**

| Style | Class | Penggunaan |
|---|---|---|
| H1 | `text-3xl font-bold` | Judul halaman (mis. "Loyalty Card") |
| H2 | `text-xl font-semibold` | Judul section |
| Body | `text-base font-normal` | Teks umum |
| Caption | `text-sm text-slate-500` | Label, timestamp |
| Stat Number | `text-4xl font-bold` | Angka besar di stat card / progress |

---

## 3. Spacing, Sizing & Radius
- **Grid base:** 4px (Tailwind default spacing scale).
- **Card padding:** `p-5` (mobile), `p-6` (desktop).
- **Border radius:** `rounded-2xl` untuk card utama (Loyalty Card, Stat Card), `rounded-xl` untuk button & input, `rounded-full` untuk avatar/icon badge.
- **Max width container:** `max-w-md` untuk halaman customer (mobile-first, tetap center di desktop), `max-w-7xl` untuk halaman admin.

---

## 4. Core UI Components

### 4.1 Button
| Variant | Style |
|---|---|
| Primary | `bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl` |
| Secondary | `bg-emerald-100 text-emerald-700 rounded-xl` |
| Ghost | `text-slate-600 hover:bg-slate-100 rounded-xl` |
| Destructive | `bg-red-500 text-white rounded-xl` |
| Disabled | `opacity-50 cursor-not-allowed` |

### 4.2 Loyalty Card (Signature Component)
- Background gradient `from-green-500 to-emerald-600`, teks putih, `rounded-2xl`, shadow halus.
- Isi: nama customer, jumlah stempel besar (`current_stamp / stamp_target`), elemen `StampProgress` di bawahnya.

### 4.3 Stamp Progress (Signature Component)
- Representasi visual: deretan icon cangkir kopi (`Coffee` dari lucide-react) sejumlah `stamp_target`.
- Terisi (sudah didapat) → `text-white fill-white` (di atas card gradient) atau `text-green-500` (di context lain).
- Belum terisi → `text-white/30` outline.
- Animasi: scale-up + fade singkat saat stempel baru bertambah.

### 4.4 Badge / Chip
| Status | Style |
|---|---|
| Reward Tersedia | `bg-emerald-100 text-emerald-700` |
| Kedaluwarsa | `bg-red-100 text-red-600` |
| Sudah Digunakan | `bg-slate-100 text-slate-500` |
| Menunggu Scan | `bg-amber-100 text-amber-700` |

### 4.5 Input Field
`border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500`

### 4.6 Bottom Navigation (Customer)
- Fixed bottom, `bg-white border-t border-slate-200`.
- Active item: icon + label `text-green-600`. Inactive: `text-slate-400`.
- Tombol "Scan" di tengah: floating circle `bg-gradient-to-r from-green-500 to-emerald-600`, sedikit lebih besar & naik dari baseline nav.

### 4.7 Sidebar Navigation (Admin)
- `bg-white border-r border-slate-200`, lebar `w-64` di desktop, jadi drawer/hamburger di mobile (`< md`).
- Active item: `bg-green-50 text-green-700 rounded-xl`.

### 4.8 QR Display Card (Admin Generate QR)
- QR di tengah card putih `rounded-2xl shadow-md`.
- Ring countdown timer mengelilingi QR atau di bawahnya, warna berubah dari `green-500` → `amber-500` → `red-500` mendekati waktu habis.

### 4.9 QR Scanner Viewport (Customer Scan)
- Frame kamera full-width dengan overlay sudut-sudut `border-green-500` (gaya scanner khas), instruksi teks di bawah: "Arahkan kamera ke QR kasir".

### 4.10 Stat Card (Admin Dashboard)
- `bg-white rounded-2xl p-5 shadow-sm`, icon di kiri atas (lingkaran `bg-green-100 text-green-600`), angka besar, label kecil di bawah.

### 4.11 Table (Admin Customer List)
- Header `bg-slate-50 text-slate-500 text-sm`, row hover `hover:bg-slate-50`, border antar baris `border-b border-slate-100`.

### 4.12 Toast / Alert
| Tipe | Style |
|---|---|
| Success | `bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500` |
| Error | `bg-red-50 text-red-700 border-l-4 border-red-500` |
| Warning | `bg-amber-50 text-amber-700 border-l-4 border-amber-500` |

### 4.13 Empty State
- Icon outline besar (`text-slate-300`) + teks `text-slate-400` + CTA singkat jika relevan.

### 4.14 Loading Skeleton
- `bg-slate-200 animate-pulse rounded-xl` menggantikan bentuk komponen asli saat data dimuat.

---

## 5. Iconography
**Library:** `lucide-react`

| Konteks | Icon |
|---|---|
| Home/Dashboard | `LayoutDashboard` / `Home` |
| Scan | `ScanLine` / `QrCode` |
| Stempel/Stamp | `Coffee` |
| Reward | `Gift` |
| History | `History` |
| Profile | `User` |
| Customers (admin) | `Users` |
| Settings | `Settings` |
| Search | `Search` |
| Success | `CheckCircle2` |
| Error | `XCircle` |
| Warning/Expired | `AlertTriangle` |

---

## 6. Responsive Breakpoints
Pakai breakpoint default Tailwind: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

| Area | Behavior |
|---|---|
| Customer pages | Mobile-first murni, layout tetap nyaman di-`max-w-md` bahkan saat dibuka di desktop (tidak melebar penuh) |
| Admin pages | Mobile: stack + hamburger sidebar. `md` ke atas: sidebar tetap terlihat, konten pakai grid multi-kolom (stat cards, table) |