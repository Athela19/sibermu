# Project: Landing Page Kemahasiswaan & AIK SiberMu (Lomba 2026)

Sumber kebenaran berurutan: `docs/prd.md` (kebutuhan) → `docs/design.md` (visual, menang jika konflik) → `docs/trd.md` (teknis). Baca ketiganya sebelum menulis kode.

Aturan keras:
- Stack: Next.js 16.3.5 App Router + React 19 + Tailwind v4 (`@theme` di `app/globals.css`, tanpa `tailwind.config.js`). GSAP hanya di `"use client"`.
- Tanpa aset dummy (foto/video dari pemilik proyek → `MediaSlot` empty-state). Tanpa font komersial (`STK Bureau Serif` dilarang; pakai `Source Serif 4` + `Plus Jakarta Sans` via `next/font/google`).
- Dilarang: smooth-scroll hijack, cursor custom, parallax berat, framework animasi selain GSAP ScrollTrigger.
- Verifikasi: `npm run lint` + `npm run build` harus lolos dengan slot media kosong.
