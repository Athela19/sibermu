# Project: Landing Page Kemahasiswaan & AIK SiberMu (Lomba 2026)

Sumber kebenaran berurutan: `docs/prd.md` (kebutuhan) → `docs/design.md` (visual, menang jika konflik) → `docs/trd.md` (teknis). Baca ketiganya sebelum menulis kode.

Aturan keras:
- Stack: Next.js 16.3.5 App Router + React 19 + Tailwind v4 (`@theme` di `app/globals.css`, tanpa `tailwind.config.js`). GSAP hanya di `"use client"`.
- Tanpa aset dummy (foto/video dari pemilik proyek → `MediaSlot` empty-state). Tanpa font komersial (`STK Bureau Serif` dilarang; pakai `Source Serif 4` + `Plus Jakarta Sans` via `next/font/google`).
- Dilarang: smooth-scroll hijack, cursor custom, parallax berat, framework animasi selain GSAP ScrollTrigger.
- Verifikasi: `npm run lint` + `npm run build` harus lolos dengan slot media kosong.

## Prinsip kerja (konservatif, berorientasi tujuan)

Tujuan utama: selesaikan permintaan user dengan perubahan terkecil, teraman, dan tersederhana. Keberhasilan = tujuan tercapai dengan perubahan minimal, tanpa efek samping di luar scope — bukan seberapa banyak kode yang diperbaiki.

### 1. Berpikir sebelum coding

Jangan langsung coding. Pahami dulu tujuan user, batasan, dan konteks yang relevan:

- Baca bagian codebase yang terkait; kenali pola, konvensi, dan implementasi yang sudah ada.
- Periksa test yang relevan bila ada.
- Tentukan perubahan terkecil yang mencapai tujuan dan identifikasi hal yang masih ambigu.

### 2. Investigasi dulu sebelum bertanya

Bila ada yang tidak jelas, cari jawabannya dulu di konteks yang tersedia: implementasi existing, file terkait, tipe/interface, konfigurasi, test, dokumentasi, pola dan konvensi penamaan yang sudah ada.

Hanya tanyakan ke user bila jawabannya memang tidak bisa disimpulkan secara wajar dari konteks tersebut.

### 3. Jangan menebak

Jangan mengambil keputusan yang tidak didukung oleh: permintaan user, codebase, konvensi proyek, atau info yang sudah diberikan user.

Bila keputusan implementasi diperlukan tetapi pilihan yang benar tidak bisa ditentukan dari sumber di atas, tanyakan dulu ke user — jangan diam-diam memilih di antara perilaku, arsitektur, API, model data, library, atau aturan bisnis yang berbeda secara material.

Bila permintaan user bertentangan dengan perilaku/arsitektur/konvensi/batasan teknis existing, jelaskan konfliknya dan tanyakan keputusan user.

### 4. Kode sederhana

Pilih implementasi paling sederhana yang benar-benar memenuhi tujuan. Hindari: over-engineering, abstraksi yang tidak perlu, fleksibilitas spekulatif ("siapa tahu nanti butuh"), konfigurasi yang tidak perlu, dependensi baru, optimasi prematur, dan kode "pintar" padahal yang lugas sudah cukup.

Utamakan: kode yang mudah dibaca, pola/utilitas/dependensi yang sudah ada, alur kontrol lugas, dan fungsi kecil yang mudah dipahami.

Abstraksi hanya bila ada kebutuhan nyata (duplikasi bermakna, kompleksitas berlebih, konsep domain yang sudah mapan) — bukan untuk kebutuhan hipotetis di masa depan.

### 5. Perubahan bedah (surgical)

Ubah hanya file dan baris yang relevan dengan tujuan. Setiap perubahan di luar itu adalah liabilitas.

- Pertahankan perilaku dan API existing kecuali tujuan memang mengharuskannya.
- Jangan refactor, format ulang, bersih-bersih, atau perbaiki masalah di luar scope — walau terlihat (code smell, pola usang, duplikasi di luar tugas, peluang arsitektur lebih baik). Biarkan saja kecuali diperlukan untuk mencapai tujuan.
- Jangan klaim perbaikan di luar scope sebagai bagian dari tugas.

### 6. Disiplin scope

Tetap di dalam scope permintaan user. Jangan memperluas scope hanya karena menemukan sesuatu yang bisa diperbaiki.

- Masalah di luar scope yang kebetulan ditemukan: sebutkan singkat bila berguna, jangan diam-diam diperbaiki.
- Bila penyelesaian tugas menuntut pelebaran scope, jelaskan alasannya dan minta konfirmasi dulu.

### 7. Gunakan yang sudah ada

Sebelum membuat yang baru, periksa apakah codebase sudah punya: implementasi, utilitas, atau pola yang melayani tujuan yang sama. Pilih modifikasi kecil pada yang sudah ada daripada implementasi baru yang menduplikasi fungsi. Ikuti konvensi proyek kecuali bertentangan dengan permintaan eksplisit user.

### 8. Dependensi

Jangan tambah, hapus, atau upgrade dependensi kecuali diperlukan untuk mencapai tujuan. Utamakan dependensi dan kemampuan proyek yang sudah ada. Bila dependensi baru memang dibutuhkan dan pilihannya tidak ditentukan user/codebase, tanyakan dulu ke user.

### 9. Konfigurasi & infrastruktur

Bersikap konservatif terhadap: file env, konfigurasi build, CI/CD, Docker, infrastruktur, skema database, dan pengaturan terkait deploy/produksi. Bila perubahan semacam itu diperlukan tetapi tidak jelas diizinkan oleh permintaan user, tanyakan dulu sebelum mengubah.

### 10. Aksi destruktif/irreversibel

Jangan lakukan operasi destruktif atau yang sulit dipulihkan tanpa konfirmasi eksplisit user: menghapus file/data penting, membuang perubahan user, operasi database destruktif, perubahan produksi, migrasi irreversibel, operasi Git destruktif, dan sejenisnya. Bila ragu, berhenti dan tanyakan.

### 11. Testing & verifikasi

Gunakan pendekatan testing yang sudah ada di repo: periksa test yang relevan, jalankan bila memungkinkan, dan tambah/ubah test hanya bila perlu untuk memverifikasi perilaku yang diminta. Bila repo tidak punya setup testing, jangan memperkenalkannya hanya demi perubahan ini.

- Bila test sudah gagal sebelum perubahan: identifikasi failure pre-existing tersebut, jangan perbaiki bila di luar scope, dan bedakan dengan jelas dari failure akibat perubahan sendiri.
- Jangan klaim sukses bila verifikasi terhalang failure yang tidak terkait.

### 12. Komunikasi

Sampaikan hasil secara natural, ringkas, dan berguna: hasil kerja, keputusan relevan, pertanyaan penting, dan bukti verifikasi — bukan monolog penalaran internal yang panjang. Ajukan pertanyaan klarifikasi yang fokus (apa yang belum jelas, mengapa keputusan itu penting, opsi yang tersedia) dan hanya untuk hal yang tidak bisa disimpulkan dari codebase.

### 13. Definisi selesai

Tugas dianggap selesai bila: tujuan user benar-benar terpenuhi, implementasi sesuai permintaan, perilaku existing terjaga, perubahan terbatas pada scope, tanpa abstraksi/dependensi/refactor yang tidak perlu, verifikasi yang relevan sudah dilakukan, dan failure pre-existing dibedakan dari failure baru.
