# Information Architecture (IA)
## Coffee Loyalty — Digital Stamp Loyalty System

| | |
|---|---|
| **Document** | 3 dari 4 Source of Truth |
| **Rujuk juga** | `01-SRS-CoffeeLoyalty.md`, `02-UserFlow-CoffeeLoyalty.md` |
| **Last Updated** | 27 Juni 2026 |

> **Catatan untuk AI Agent:** Pakai struktur folder & nama route di bawah **persis seperti ini**. Jangan ganti nama folder/route sendiri (mis. jangan pakai `/scan-qr` kalau di sini disebut `/scan`) — supaya konsisten dengan link deep-link QR yang sudah didefinisikan di SRS.

---

## 1. Sitemap

| Route | Akses | Phase | Deskripsi |
|---|---|---|---|
| `/` | Public | 0 | Landing / redirect ke login sesuai session |
| `/login` | Public | 2 | Login customer (Phone OTP) |
| `/register` | Public | 2 | Registrasi customer |
| `/admin/login` | Public | 2 | Login admin/kasir (email+password) |
| `/customer/dashboard` | Customer | 3 | Loyalty card, progress, quick action scan |
| `/customer/scan` | Customer | 3 | Scanner kamera in-app + handle `?token=` dari deep-link |
| `/customer/rewards` | Customer | 3 | Status reward tersedia + riwayat redeem |
| `/customer/history` | Customer | 3 | Stamp timeline + reward timeline |
| `/customer/profile` | Customer | 3 | Lihat & edit profil |
| `/admin/dashboard` | Admin | 4 | Statistik + recent activity |
| `/admin/generate-qr` | Admin | 4 | Input jumlah stempel, generate & tampilkan QR |
| `/admin/customers` | Admin | 4 | List + search customer |
| `/admin/customers/[id]` | Admin | 4 | Detail customer: profil, stamp history, reward history |
| `/admin/rewards` | Admin | 4 | Search customer → verifikasi → redeem reward |
| `/admin/settings` | Admin | 4 | Atur stamp_target & qr_expiration_seconds |

---

## 2. Next.js App Router — Folder Structure

```
app/
├── layout.tsx                     # Root layout, font, ThemeProvider
├── page.tsx                       # "/" → redirect by session/role
├── globals.css                    # Tailwind base + design tokens
│
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── admin/login/page.tsx
│
├── (customer)/
│   ├── layout.tsx                 # Layout + Bottom Nav (customer)
│   ├── customer/
│   │   ├── dashboard/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── rewards/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│
├── (admin)/
│   ├── layout.tsx                 # Layout + Sidebar (admin)
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── generate-qr/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── rewards/page.tsx
│   │   └── settings/page.tsx
│
├── actions/                       # Server Actions (panggil Supabase RPC)
│   ├── auth.ts
│   ├── stamp.ts                   # claim_stamp_token, generate_stamp_token
│   ├── reward.ts                  # redeem_reward
│   └── settings.ts
│
└── middleware.ts                  # Role-based route protection

lib/
├── supabase/
│   ├── client.ts                  # Browser client
│   ├── server.ts                  # Server client (SSR)
│   └── types.ts                   # Generated DB types
└── utils.ts

components/
├── ui/                            # Button, Card, Input, Badge, dst (lihat Design System)
├── customer/                      # LoyaltyCard, StampProgress, QRScanner
└── admin/                         # StatCard, QRDisplay, CustomerTable
```

---

## 3. Navigation Pattern

### Customer — Bottom Tab Navigation (mobile-first, fixed bottom)
| Icon | Label | Route |
|---|---|---|
| Home | Home | `/customer/dashboard` |
| QrCode (floating, ditonjolkan) | Scan | `/customer/scan` |
| Gift | Rewards | `/customer/rewards` |
| History | Riwayat | `/customer/history` |
| User | Profil | `/customer/profile` |

> "Scan" jadi tombol yang paling ditonjolkan (floating action button di tengah nav) karena ini aksi utama yang paling sering dipakai.

### Admin — Sidebar Navigation (collapsible/hamburger di mobile, fixed sidebar di tablet/desktop ≥ `md`)
| Icon | Label | Route |
|---|---|---|
| LayoutDashboard | Dashboard | `/admin/dashboard` |
| QrCode | Generate QR | `/admin/generate-qr` |
| Users | Customers | `/admin/customers` |
| Gift | Rewards | `/admin/rewards` |
| Settings | Settings | `/admin/settings` |

---

## 4. Data Dependency Map (Halaman ↔ DB/RPC)

| Halaman | Tabel/RPC yang dipakai |
|---|---|
| `/customer/dashboard` | SELECT `profiles` (current_stamp), `settings` (stamp_target) |
| `/customer/scan` | RPC `claim_stamp_token` |
| `/customer/rewards` | SELECT `profiles`, `settings`, `reward_redemptions` |
| `/customer/history` | SELECT `stamp_history`, `reward_redemptions` |
| `/customer/profile` | SELECT/UPDATE `profiles` |
| `/admin/dashboard` | Aggregate `profiles`, `stamp_history`, `reward_redemptions`, `stamp_tokens` |
| `/admin/generate-qr` | RPC `generate_stamp_token`, SELECT `settings` |
| `/admin/customers` | SELECT `profiles` (role=customer) |
| `/admin/customers/[id]` | SELECT `profiles`, `stamp_history`, `reward_redemptions` (filter by customer_id) |
| `/admin/rewards` | SELECT `profiles`, RPC `redeem_reward` |
| `/admin/settings` | SELECT/UPDATE `settings` |

---

## 5. Component Inventory per Halaman
> Detail visual tiap komponen ada di `04-DesignSystem-CoffeeLoyalty.md`.

| Halaman | Komponen Utama |
|---|---|
| Customer Dashboard | `LoyaltyCard`, `StampProgress`, `Button` (Scan QR), `Badge` (status reward) |
| Customer Scan | `QRScannerView`, `ConfirmModal`, `ToastError` |
| Customer Rewards | `RewardStatusCard`, `RewardHistoryList` |
| Customer History | `Tabs`, `TimelineItem` |
| Customer Profile | `Input`, `Button` |
| Admin Dashboard | `StatCard` (×4), `ActivityFeed` |
| Admin Generate QR | `Input` (jumlah), `QRDisplayCard`, `CountdownRing` |
| Admin Customers | `SearchBar`, `DataTable` |
| Admin Customer Detail | `ProfileSummary`, `TimelineItem` |
| Admin Rewards | `SearchBar`, `CustomerResultCard`, `Button` (Redeem) |
| Admin Settings | `Input`, `Button` (Save) |