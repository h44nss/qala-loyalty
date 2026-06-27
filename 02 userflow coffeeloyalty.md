# User Flow Document
## Coffee Loyalty — Digital Stamp Loyalty System

| | |
|---|---|
| **Document** | 2 dari 4 Source of Truth |
| **Rujuk juga** | `01-SRS-CoffeeLoyalty.md` (untuk RPC & data model), `03-InformationArchitecture-CoffeeLoyalty.md` (untuk route) |
| **Last Updated** | 27 Juni 2026 |

> **Catatan untuk AI Agent:** Setiap flow di bawah punya label **[Phase X]** — itu acuan kapan flow ini diimplementasikan, sesuai `01-SRS-CoffeeLoyalty.md` section 8. Step bertanda ⚠️ adalah error/edge case yang **wajib** punya UI state sendiri, jangan dibiarkan blank/crash.

### Legend
- `→` lanjut step normal
- `⚠️` error / alternate path
- `(RPC: nama_fungsi)` artinya step ini memanggil Supabase RPC tersebut

---

## 1. Customer Flows

### 1.1 Registrasi & Onboarding `[Phase 2]`
```
Buka Website
→ Tap "Daftar"
→ Input Nomor HP
→ Sistem kirim OTP (Supabase Phone Auth)
→ Input kode OTP
  ⚠️ OTP salah → tampilkan error, izinkan resend setelah cooldown
  ⚠️ OTP expired → tombol "Kirim Ulang"
→ OTP valid, akun auth dibuat
→ Lengkapi Profil: Nama Lengkap, Username Instagram (wajib)
  ⚠️ Username Instagram kosong → blokir submit, tampilkan pesan wajib isi
→ Profil tersimpan (insert ke profiles)
→ Redirect ke /customer/dashboard
```

### 1.2 Login Customer `[Phase 2]`
```
Buka Website
→ Tap "Masuk"
→ Input Nomor HP
→ Input OTP
  ⚠️ Nomor HP belum terdaftar → arahkan ke flow registrasi
→ Redirect ke /customer/dashboard
```

### 1.3 Lihat Loyalty Card / Dashboard `[Phase 3]`
```
Customer login
→ Landing di /customer/dashboard
→ Tampil: current_stamp / stamp_target (visual progress)
→ Tampil: status reward ("Reward Tersedia" jika current_stamp >= stamp_target)
→ Quick Action: tombol besar "Scan QR"
```

### 1.4 Scan QR — Klaim Stempel `[Phase 3, validasi di Phase 5]`
Dua jalur masuk (lihat SRS section 3.3):

**Jalur A — via kamera default HP:**
```
Kasir tampilkan QR di device kasir
→ Customer scan dengan kamera default HP (bukan dari dalam app)
→ Browser buka deep-link: /customer/scan?token=xxx
  ⚠️ Customer belum login → redirect ke login, setelah sukses kembali otomatis ke /customer/scan?token=xxx
→ Sistem tampilkan konfirmasi "Klaim X stempel?"
→ Customer tap "Klaim" (RPC: claim_stamp_token)
```

**Jalur B — scanner in-app:**
```
Customer tap "Scan QR" di dashboard
→ Buka /customer/scan, izinkan akses kamera
→ Arahkan kamera ke QR di device kasir
→ Terdeteksi otomatis → sama seperti Jalur A step konfirmasi
```

**Hasil setelah konfirmasi (RPC: claim_stamp_token):**
```
→ Sukses → current_stamp bertambah, tampilkan animasi/feedback "Stempel Bertambah", redirect ke dashboard
  ⚠️ Token sudah dipakai → tampilkan "QR ini sudah pernah digunakan"
  ⚠️ Token expired → tampilkan "QR sudah kedaluwarsa, minta kasir generate ulang"
  ⚠️ Token tidak ditemukan/invalid → tampilkan "QR tidak valid"
  ⚠️ Tidak ada koneksi internet → tampilkan error koneksi, sediakan tombol retry
```

### 1.5 Lihat Reward `[Phase 3]`
```
Customer buka /customer/rewards
→ Tampil status: "X stempel lagi untuk Free Drink" ATAU "Reward Tersedia! Tunjukkan ke kasir"
→ Tampil riwayat reward yang sudah ditukar (dari reward_redemptions)
```
> Catatan: customer **tidak** bisa self-redeem. Redeem hanya dieksekusi oleh kasir (lihat flow 2.5) setelah customer menunjukkan HP-nya.

### 1.6 Lihat History `[Phase 3]`
```
Customer buka /customer/history
→ Tab "Stamp Timeline" → list stamp_history (type=earn), tanggal & jumlah
→ Tab "Reward Timeline" → list reward_redemptions
```

### 1.7 Edit Profile `[Phase 3]`
```
Customer buka /customer/profile
→ Lihat Nama, No HP (read-only, terikat ke auth), Instagram Username
→ Edit Nama / Instagram Username → Simpan
  ⚠️ Instagram Username dikosongkan → blokir simpan, field wajib
```

---

## 2. Admin / Kasir Flows

### 2.1 Login Admin `[Phase 2]`
```
Buka /admin/login
→ Input email & password
  ⚠️ Kredensial salah → tampilkan error generik (jangan bocorkan email tidak terdaftar vs password salah)
→ Redirect ke /admin/dashboard
```

### 2.2 Dashboard & Statistik `[Phase 4]`
```
Admin login
→ Landing di /admin/dashboard
→ Tampil 4 stat card: Total Member, Total Stamp Given, Total Reward Redeemed, Total QR Generated
→ Tampil Recent Activity (gabungan stamp_history & reward_redemptions terbaru)
```

### 2.3 Generate QR Stempel `[Phase 4]`
```
Admin buka /admin/generate-qr
→ Input jumlah stempel (sesuai jumlah item pembelian)
  ⚠️ Input 0 atau kosong → blokir, minimal 1
→ Tap "Generate" (RPC: generate_stamp_token)
→ Tampilkan QR code + countdown timer sesuai qr_expiration_seconds
→ Customer scan (lihat flow 1.4)
  ⚠️ Countdown habis sebelum di-scan → QR otomatis ditandai expired, tampilkan tombol "Generate Ulang"
→ (Opsional Phase 5, realtime) Layar admin auto-update jadi "Sudah Diklaim" begitu customer scan
```

### 2.4 Kelola Customer `[Phase 4]`
```
Admin buka /admin/customers
→ Lihat list semua customer (nama, no HP, instagram, total stempel)
→ Search by nama/no HP
→ Tap salah satu → /admin/customers/[id]
→ Tampil detail: profil, stamp history, reward history
```

### 2.5 Redeem Reward oleh Kasir `[Phase 4]`
```
Customer datang dengan stempel cukup, tunjukkan HP/nama ke kasir
→ Admin search customer di /admin/rewards (atau dari halaman detail customer)
→ Sistem cek current_stamp >= stamp_target
  ⚠️ Belum cukup → tombol redeem disabled, tampilkan sisa stempel yang dibutuhkan
→ Admin tap "Redeem Reward" (RPC: redeem_reward)
→ Sukses → current_stamp -10, tercatat di reward_redemptions & stamp_history
→ Tampilkan konfirmasi "Reward berhasil ditukar, sisa stempel: X"
```

### 2.6 Atur Settings `[Phase 4]`
```
Admin buka /admin/settings
→ Ubah Stamp Target (default 10)
→ Ubah QR Expiration (default 180 detik)
→ Simpan → update tabel settings
```

---

## 3. Error & Edge Case Matrix (Ringkasan Lintas Flow)

| Skenario | Trigger di | Respon Sistem | UI State |
|---|---|---|---|
| QR sudah digunakan | claim_stamp_token | Tolak, status tetap `used` | Pesan error + tombol kembali ke dashboard |
| QR expired | claim_stamp_token | Update status `expired`, tolak | Pesan "kedaluwarsa" + saran minta QR baru |
| QR tidak ditemukan | claim_stamp_token | Tolak | Pesan "QR tidak valid" |
| Stempel belum cukup saat redeem | redeem_reward | Tolak | Tombol disabled + info sisa stempel dibutuhkan |
| OTP salah/expired | Supabase Auth | Tolak login | Pesan error + tombol kirim ulang |
| Koneksi gagal saat scan | Network | Request gagal | Pesan error + tombol retry (jangan otomatis anggap sukses) |
| Race condition 2 scan bersamaan pada 1 token | claim_stamp_token (transaction) | Hanya 1 yang sukses | Yang kedua dapat pesan "sudah digunakan" |