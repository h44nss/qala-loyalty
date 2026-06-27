# Software Requirements Specification (SRS)
## Coffee Loyalty — Digital Stamp Loyalty System

| | |
|---|---|
| **Document** | 1 dari 4 Source of Truth (SRS → User Flow → IA → Design System) |
| **Tech Stack** | Next.js 14+ (App Router, TypeScript) + Supabase (Auth, Postgres, RLS, Realtime) |
| **Styling** | Tailwind CSS — lihat `04-DesignSystem-CoffeeLoyalty.md` |
| **Last Updated** | 27 Juni 2026 |

> **Catatan untuk AI Agent:** Dokumen ini adalah rujukan utama (master reference) untuk scope, data model, dan urutan pengerjaan (Phases). Jangan menambahkan fitur, tabel, atau halaman yang tidak disebutkan di 4 dokumen SOT ini. Kalau ada requirement yang ambigu, ikuti keputusan di section 3 (Assumptions & Design Decisions), jangan berasumsi sendiri.

---

## 1. Pendahuluan

### 1.1 Purpose
Coffee Loyalty adalah sistem loyalty digital berbasis QR Code untuk satu outlet coffee shop. Sistem berdiri sendiri (tidak terintegrasi POS), menggantikan kartu stempel fisik dengan stempel digital yang tercatat di database.

### 1.2 Scope
Aplikasi web (mobile-first) dengan 2 sisi:
- **Customer App** — registrasi, lihat loyalty card, scan QR, lihat reward & history.
- **Admin/Kasir App** — generate QR stempel, kelola customer, verifikasi redeem reward, dashboard, settings.

### 1.3 Referensi
- PRD: `Coffee Loyalty – Digital Stamp Loyalty System for Coffee Shop`
- `02-UserFlow-CoffeeLoyalty.md`
- `03-InformationArchitecture-CoffeeLoyalty.md`
- `04-DesignSystem-CoffeeLoyalty.md`

---

## 2. Tech Stack & Arsitektur

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | Next.js 14+ App Router, TypeScript, Tailwind CSS | Mobile-first |
| Auth | Supabase Auth | Phone OTP (customer), Email/Password (admin) |
| Database | Supabase Postgres | Row Level Security (RLS) aktif di semua tabel |
| Business Logic | Supabase RPC (Postgres Function, `SECURITY DEFINER`) | Semua operasi kritikal (klaim stempel, redeem reward) **wajib** lewat RPC, atomic, anti race-condition |
| Orchestration | Next.js Server Actions | Pemanggil RPC dari frontend, tidak menyimpan business logic sendiri |
| Realtime (opsional, Phase 5) | Supabase Realtime | Update live di dashboard admin & loyalty card customer |
| QR Generation | npm package `qrcode` | Encode deep-link URL, bukan string token mentah |
| QR Scanning | npm package `@yudiel/react-qr-scanner` | Komponen kamera in-app |
| Icon | `lucide-react` | Lihat Design System |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) | |

**Prinsip arsitektur:** Database = source of truth & penjaga konsistensi data (lewat RPC + RLS). Next.js = presentation layer + orchestration. Tidak ada logic stempel/redeem yang boleh dihitung di client-side.

---

## 3. Assumptions & Design Decisions

Bagian ini mengisi gap dari PRD yang tidak detail teknis. **Wajib diikuti**, jangan diubah tanpa konfirmasi user.

1. **Auth Customer:** Supabase Phone OTP. Nomor HP = identitas login utama, tidak perlu password.
2. **Auth Admin/Kasir:** Email + Password. Akun admin dibuat manual oleh owner (tidak ada self-registration admin).
3. **Mekanisme QR:**
   - QR yang digenerate kasir berisi deep-link: `{APP_URL}/customer/scan?token=<token_code>`.
   - Customer bisa scan dengan kamera default HP (akan membuka link di atas), **atau** pakai scanner in-app di halaman `/customer/scan`.
   - Token tidak terikat ke customer tertentu — siapa pun yang scan & sedang login, dialah yang klaim ("first claim wins").
4. **Instagram Username:** hanya text field wajib saat registrasi, tidak ada validasi/verifikasi follow ke akun IG manapun.
5. **Single outlet** — tidak ada konsep cabang/multi-tenant/multi-admin-group.
6. **Reward tunggal:** 10 stempel = 1 free drink. Tidak ada tier reward lain di scope ini.
7. **Redeem reward dilakukan oleh kasir** (bukan self-redeem oleh customer) — customer cuma menunjukkan progress di HP-nya, kasir yang verifikasi & eksekusi potong stempel di sistem.

---

## 4. Data Model (Supabase Postgres)

### 4.1 Entity Overview
```
profiles (extends auth.users)
  └─< stamp_tokens (generated_by, used_by)
  └─< stamp_history (customer_id, related_token_id, related_redemption_id)
  └─< reward_redemptions (customer_id, verified_by)
settings (singleton key-value)
```

### 4.2 Tabel: `profiles`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, = auth.users.id) | |
| role | text | `'admin'` \| `'customer'`, default `'customer'` |
| full_name | text | not null |
| phone_number | text | unique, not null |
| instagram_username | text | wajib jika role = customer |
| current_stamp | integer | default 0, hanya relevan untuk customer |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### 4.3 Tabel: `stamp_tokens`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| token_code | text | unique, not null (nanoid, dipakai di deep-link) |
| stamp_amount | integer | not null, check > 0 |
| status | text | `'unused'` \| `'used'` \| `'expired'`, default `'unused'` |
| generated_by | uuid (FK → profiles.id) | admin yang generate |
| used_by | uuid (FK → profiles.id), nullable | customer yang klaim |
| expires_at | timestamptz | not null = created_at + qr_expiration_seconds |
| used_at | timestamptz | nullable |
| created_at | timestamptz | default now() |

### 4.4 Tabel: `stamp_history`
Ledger lengkap untuk fitur "Stamp Timeline" & audit trail.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| customer_id | uuid (FK → profiles.id) | not null |
| type | text | `'earn'` \| `'redeem'` |
| amount | integer | positif untuk earn, negatif untuk redeem (mis. -10) |
| balance_after | integer | snapshot current_stamp setelah transaksi |
| related_token_id | uuid (FK → stamp_tokens.id), nullable | diisi jika type = earn |
| related_redemption_id | uuid (FK → reward_redemptions.id), nullable | diisi jika type = redeem |
| created_at | timestamptz | default now() |

### 4.5 Tabel: `reward_redemptions`
Untuk fitur "Reward Timeline" & redeem management admin.
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| customer_id | uuid (FK → profiles.id) | not null |
| stamps_used | integer | default 10 |
| verified_by | uuid (FK → profiles.id) | kasir yang verifikasi |
| redeemed_at | timestamptz | default now() |

### 4.6 Tabel: `settings` (singleton key-value)
| key | value | default |
|---|---|---|
| stamp_target | text (numeric string) | `'10'` |
| qr_expiration_seconds | text (numeric string) | `'180'` |

### 4.7 RPC Functions (wajib `SECURITY DEFINER`, atomic)

**`generate_stamp_token(p_admin_id uuid, p_stamp_amount int) → stamp_tokens row`**
- Insert row baru ke `stamp_tokens` dengan `expires_at = now() + qr_expiration_seconds` (dari `settings`).

**`claim_stamp_token(p_token_code text, p_customer_id uuid) → { success, message, new_balance }`**
- Validasi: token ada, `status = 'unused'`, `expires_at > now()`.
- Jika expired → update status `'expired'`, return error `"QR sudah kedaluwarsa"`.
- Jika valid → update token (`status='used'`, `used_by`, `used_at`), update `profiles.current_stamp += stamp_amount`, insert ke `stamp_history` (type='earn'). Semua dalam satu transaksi.
- Jika sudah `'used'` → return error `"QR sudah pernah digunakan"`.

**`redeem_reward(p_customer_id uuid, p_admin_id uuid) → { success, message, new_balance }`**
- Validasi: `current_stamp >= stamp_target` (dari `settings`).
- Jika kurang → return error `"Stempel belum cukup"`.
- Jika cukup → `current_stamp -= 10`, insert `reward_redemptions`, insert `stamp_history` (type='redeem').

### 4.8 Row Level Security (RLS) — wajib aktif di semua tabel
| Tabel | Customer | Admin |
|---|---|---|
| profiles | SELECT/UPDATE baris sendiri saja | SELECT semua, UPDATE semua |
| stamp_tokens | tidak ada akses langsung (hanya lewat RPC) | SELECT/INSERT semua |
| stamp_history | SELECT baris milik sendiri | SELECT semua |
| reward_redemptions | SELECT baris milik sendiri | SELECT/INSERT semua |
| settings | tidak ada akses | SELECT/UPDATE |

---

## 5. Functional Requirements

> Penomoran mengikuti PRD asli (FR-01 s/d FR-09), ditambah detail implementasi.

### FR-01 — Dashboard (Admin)
Statistik: Total Member, Total Stamp Given, Total Reward Redeemed, Total QR Generated. Sumber data: aggregate query ke `profiles`, `stamp_history`, `reward_redemptions`, `stamp_tokens`.

### FR-02 — Customer Registration
Form: Nama Lengkap, Nomor HP (jadi login via OTP), Username Instagram (wajib). Setelah OTP terverifikasi, insert ke `profiles`.

### FR-03 — Generate Stamp QR (Admin)
Input jumlah stempel → panggil RPC `generate_stamp_token` → render QR (lib `qrcode`) berisi deep-link token → tampilkan countdown sesuai `qr_expiration_seconds`.

### FR-04 — QR Validation
Ditangani sepenuhnya di RPC `claim_stamp_token` (single-use + expiry check, lihat 4.7). Tidak boleh ada validasi duplikat di client.

### FR-05 — Scan QR (Customer)
Dua jalur masuk: (a) buka deep-link langsung dari kamera HP, (b) scanner in-app di `/customer/scan`. Keduanya memanggil RPC yang sama.

### FR-06 — Loyalty Card
Tampilkan `current_stamp / stamp_target` dengan visual progress (lihat Design System — Stamp Progress component).

### FR-07 — Reward Management
Cek `current_stamp >= stamp_target` → tombol redeem aktif untuk kasir → panggil RPC `redeem_reward`.

### FR-08 — Stamp History
Query `stamp_history` (filter `type='earn'` untuk Stamp Timeline) dan `reward_redemptions` (untuk Reward Timeline), filter by `customer_id`.

### FR-09 — Customer Management (Admin)
List + search `profiles` (role=customer), detail page menampilkan `stamp_history` & `reward_redemptions` milik customer tersebut.

---

## 6. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | Page load < 3s, proses scan QR (RPC round-trip) < 2s |
| Security | RLS aktif semua tabel, RPC pakai `SECURITY DEFINER`, token QR unik (nanoid), validasi expiry server-side (bukan client-side) |
| Responsiveness | Mobile-first wajib untuk semua halaman customer; admin perlu layout desktop/tablet yang nyaman (sidebar) |
| Reliability | RPC harus atomic (pakai transaction Postgres) untuk hindari race condition saat 2 scan bersamaan |

---

## 7. Out of Scope
Eksplisit **TIDAK** termasuk di versi ini — jangan ditambahkan tanpa instruksi baru:
- Integrasi POS atau payment gateway apapun.
- Verifikasi otomatis follow Instagram (hanya text field).
- Multi-cabang / multi-tenant / multi-grup admin.
- Notifikasi push atau WhatsApp otomatis.
- Tier reward bertingkat (hanya 1 jenis reward: 10 stempel = 1 free drink).
- Dark mode (default light theme sesuai Design System).
- PWA / offline-first capability.
- Role tambahan selain `admin` dan `customer`.

---

## 8. Development Phases

> Setiap phase mencakup **Database + Backend (RPC/RLS) + Frontend**. Kerjakan berurutan — jangan mulai phase berikutnya sebelum Definition of Done phase sebelumnya terpenuhi.

### Phase 0 — Project Setup & Foundation
- Init Next.js 14 (App Router, TypeScript, Tailwind).
- Setup Supabase project, environment variables (`.env.local`), Supabase client (browser + server, pakai `@supabase/ssr`).
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `qrcode`, `@yudiel/react-qr-scanner`, `lucide-react`.
- Setup folder structure sesuai `03-InformationArchitecture-CoffeeLoyalty.md`.
- **DoD:** Project running locally, terkoneksi ke Supabase, Tailwind config sudah pakai token warna dari Design System.

### Phase 1 — Database Schema & Backend Foundation
- Buat semua tabel (section 4.2–4.6) + RLS policies (4.8).
- Buat RPC functions (4.7).
- Buat trigger `handle_new_user` (on insert ke `auth.users` → insert row `profiles`).
- Seed `settings` default (`stamp_target=10`, `qr_expiration_seconds=180`).
- Enable provider Phone OTP & Email/Password di Supabase Auth dashboard.
- **DoD:** Semua tabel + RPC bisa dites manual lewat Supabase SQL editor, RLS terverifikasi (customer tidak bisa baca data customer lain).

### Phase 2 — Authentication & Role-Based Routing
- Halaman `/login`, `/register` (flow OTP customer), `/admin/login` (email/password).
- `middleware.ts` untuk proteksi route berdasarkan role & session.
- Step lengkapi profil setelah OTP pertama kali (nama, instagram username).
- **DoD:** Customer & admin bisa login/logout, redirect otomatis sesuai role, route terlindungi.

### Phase 3 — Customer Core Features
- `/customer/dashboard` (loyalty card + progress).
- `/customer/scan` (scanner in-app + handle deep-link token dari query param).
- `/customer/rewards` (status reward + riwayat redeem).
- `/customer/history` (stamp timeline + reward timeline).
- `/customer/profile` (lihat & edit profil).
- **DoD:** Customer bisa scan QR valid → stempel bertambah real (lewat RPC), semua state (loading/empty/error) ada.

### Phase 4 — Admin Core Features
- `/admin/dashboard` (statistik + recent activity).
- `/admin/generate-qr` (input jumlah, generate QR, countdown expiry).
- `/admin/customers` + `/admin/customers/[id]`.
- `/admin/rewards` (search customer → verifikasi → redeem).
- `/admin/settings` (ubah stamp_target & qr_expiration_seconds).
- **DoD:** Kasir bisa generate QR, customer klaim, kasir bisa redeem reward customer yang sudah cukup stempel.

### Phase 5 — Edge Cases, Validation & Realtime
- Pastikan semua error state RPC tertangani di UI (token used/expired/invalid, stempel kurang, dst — lihat `02-UserFlow-CoffeeLoyalty.md` section 4).
- (Opsional) Supabase Realtime: loyalty card customer auto-update setelah scan, dashboard admin auto-refresh.
- **DoD:** Tidak ada error state yang menampilkan raw error/blank screen.

### Phase 6 — Polish, Responsiveness & QA
- Review mobile-first di semua halaman customer.
- Review layout admin di tablet/desktop.
- Accessibility check (kontras warna sesuai Design System).
- Manual QA full flow: registrasi → generate QR → scan → cukup 10 stempel → redeem.
- Deploy ke Vercel + set environment variables production.
- **DoD:** Semua user flow di `02-UserFlow-CoffeeLoyalty.md` bisa dijalankan tanpa bug blocking.