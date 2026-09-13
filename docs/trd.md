# Technical Requirements Document (TRD)

## Landing Page Kemahasiswaan & AIK SiberMu — Lomba 2026

| Metadata | Keterangan |
| --- | --- |
| Sumber kebutuhan | `docs/prd.md` v1.0 |
| Sumber desain | `docs/design.md` (satu-satunya acuan visual; jika bertentangan, `design.md` menang atas asumsi di TRD ini) |
| Stack | Next.js 16.3.5 (App Router) + React 19.2.8 + Tailwind CSS v4 + GSAP ScrollTrigger |
| Status | Audit 13 Sep 2026: fondasi terbangun, belum fitur-penuh. `Transisi`/`Kredit`/`Footer` belum ada; `page.tsx` baru 1× `StickySplit`. Detail gap: §9 + `design.md` §12 |

### 1. Kunci teknis (non-negotiable; nilai visual di `design.md` §1–§2, jangan diduplikasi di sini)

1. **Tanpa aset dummy** — slot kosong me-render `MediaSlot` empty-state; nol 404, nol `next/image` error (slot: `design.md` §7).
2. **Tanpa font komersial** — hanya font OFL `design.md` §2.2 via `next/font/google`.
3. **Animasi hanya GSAP ScrollTrigger** — larangan: smooth-scroll hijack, cursor custom, parallax berat, framework animasi lain (pola: §6).
4. **Mobile-first, sticky juga di HP** — perilaku pin: `design.md` §5.3.
5. **Bahasa Indonesia** — `lang="id"`, satu `h1`, konten statis di `lib/content.ts`.

### 2. Dependensi

Terkunci di `package.json` (jangan downgrade):

- `next@16.3.5`, `react@19.2.8`, `react-dom@19.2.8`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `typescript@^5`, `eslint@^9`, `eslint-config-next@16.3.5`.

Yang harus ditambahkan sekali saat mulai build (aktual 13 Sep 2026: sudah terpasang — `gsap@3.15.0`, `lucide-react@1.45.0` terverifikasi ada di registry, `@types/gsap@1.20.2`):

```bash
npm i gsap lucide-react
npm i -D @types/gsap
```

Dilarang menambah: framework animasi lain, lib smooth-scroll, font-icon kit, CSS-in-JS runtime, image placeholder service.

### 3. Struktur berkas target

```text
app/
  layout.tsx          # font, lang="id", metadata + preload 6 frame hero (SplashScreen TIDAK di sini — aktual di-mount di Hero.tsx, digate ready && introDone; serif hanya weight 600; JSON-LD via tag script biasa)
  page.tsx            # komposisi section (server component, tanpa logika animasi) — aktual MVP: Navbar + Hero + 1× StickySplit + placeholder AIK/kontak; target penuh: 8× StickySplit + Transisi + Kredit + Footer (belum)
  globals.css         # @import "tailwindcss" + @theme tokens (design.md §2)
  sitemap.ts, robots.ts, favicon.ico  # tambahan aktual di luar kontrak (pakai SITE.url, tidak melanggar)
components/
  SplashScreen.tsx    # "use client" — timeline GSAP tunggal, kontrak design.md §5.5 (fallback 4s)
  Navbar.tsx          # "use client" — solid toggle (TANPA progress bar, sesuai design.md §4.1) + overlay mobile
  Hero.tsx            # "use client" — frame scrub canvas + ScrollCue + mount SplashScreen
  StickySplit.tsx     # "use client" — dipakai 1× (target 8×), CSS-sticky + ScrollTrigger.create onToggle (BUKAN pin/pinSpacing), design.md §5.3
  Transisi.tsx        # "use client" — stagger kata — BELUM ADA (wajib sebelum submit)
  RevealText.tsx      # "use client" — teks reveal blur→jelas per kata (dipakai di H2/teks lain)
  Kredit.tsx          # server — list statis dari konstanta — BELUM ADA (wajib D.1.5)
  Footer.tsx          # server — CTA penutup + kontak + disclaimer — BELUM ADA (aktual hanya H2 di page.tsx)
  ScrollCue.tsx       # "use client" — pil indikator scroll (lingkaran + label), loop y dot
  MediaSlot.tsx       # server — empty-state / next/image jika src valid
lib/
  content.ts          # teks ID semua section + anchor (sumber kebenaran konten) — aktual baru NAV/HERO/KEGIATAN_MAHASISWA; 7 blok + teks transisi + flag ilustratif kajian BELUM
  media.ts            # event scrub hero + konstanta HERO_FPS
  hero-frames.ts      # server-only: daftar public/hero/scene*.webp terurut (aktual 60 frame; tanpa import server-only — tambahkan saat sentuh file ini)
  reveal-text.ts      # util reveal teks: split kata + createTextReveal (set + to, anti snap-hide; stagger 0.04, toggleActions play none none none karena once:true)
  site.ts             # metadata, kontak, sosmed, link pendaftaran (aktual logo .webp — design.md §7 mengizinkan png/webp)
public/
  hero/
    scene1.webp, scene2.webp, ... (frame hero, milik pemilik proyek)
  media/
    kemahasiswaan/<blok>-<nn>.webp
    aik/<blok>-<nn>.webp
root (deploy & docs):
  Dockerfile          # produksi: multi-stage node:20-alpine → runner non-root, serve .next/standalone
  Dockerfile.dev      # development: Alpine + `npm run dev`, kode via bind-mount (tanpa build ulang)
  docker-compose.yml  # service `sibermu` (prod, 3000:3000) + `sibermu-dev` (dev, 3000:3000, profile `dev`)
  .dockerignore       # jaga konteks build tetap kecil
  README.md           # cara jalan lokal + Docker
```

Aturan: `page.tsx` tetap server component; semua GSAP hanya di komponen `"use client"`. Tidak ada fetch data eksternal — seluruh konten statis dari `lib/`.

### 4. Implementasi token & font

- `app/globals.css`: definisikan `@theme` persis dari `design.md` §2 — `design.md` satu-satunya sumber angka, jangan salin nilai ke sini. Jangan buat `tailwind.config.js`.
- `app/layout.tsx`: ganti `Geist` → `Source_Serif_4` + `Plus_Jakarta_Sans` via `next/font/google` (`subsets: ["latin"]`, `display: "swap"`), set `lang="id"`, metadata lomba (title, description ID, OG). Aktual: serif hanya `weight: ["600"]` (satu-satunya yang dipakai); 6 frame hero awal di-`preload` via `<link>` di `<head>`; JSON-LD via tag `<script>` biasa (tanpa `next/script`).
- `next.config.ts`: `output: "standalone"` — alasan tercatat: stage `runner` di `Dockerfile`
  (Alpine) hanya menyalin `.next/standalone` + `.next/static` + `public` agar image
  produksi ringan. Optimasi gambar default `next/image` tetap dipakai; jangan ubah
  opsi lain kecuali ada kebutuhan deploy spesifik (catat alasannya di sini).

### 5. Kontrak komponen (teknis saja; nilai visual di `design.md` §4–§5)

| Komponen | Tipe | Props inti | Perilaku kode wajib |
| --- | --- | --- | --- |
| `SplashScreen` | client | `onIntroDone?` | Timeline intro + unmount; kontrak: `design.md` §5.5; `aria-hidden`; reduced-motion → statis + fade; fallback `4s` |
| `Navbar` | client | — | Solid toggle TANPA progress bar + overlay mobile; ambang & warna: `design.md` §4.1; overlay `Esc` + kembalikan fokus (focus-trap penuh BELUM — lihat §9); active-link underline ScrollTrigger BELUM |
| `Hero` | client | `frames: string[]` | Scrub via indeks frame + `drawImage` `ImageBitmap` ke `<canvas>`; frame pertama dulu untuk cat awal, sisa di latar (concurrency 6, skip saat reduced-motion); decode ber-window (5+2) ≤2048px + evict (`close()`); gagal → `MediaSlot`; dimensi & scrim: `design.md` §4.2 |
| `StickySplit` | client | `id`, `eyebrow`, `items[]` | CSS-sticky + `ScrollTrigger.create onToggle` penentu item aktif + crossfade kata; `aria-live="polite"`; 1 item → statis; grid & dimensi: `design.md` §5.3 (sengaja BUKAN `pin/pinSpacing`) |
| `Transisi` | client | `text` | Stagger kata; teks dari `lib/content.ts` — BELUM ADA |
| `ScrollCue` | client | `target="#kemahasiswaan"` | Pil lingkaran + label (`HERO.scrollLabel` = `Gulir`); loop dot `y ±4px` + fade setelah hero lewat; detail: `design.md` §5.4 |
| `RevealText` | client | `text`, `as`, `mode`, `split` | Blur→jelas per kata via `set` + `to` (tanpa snap-hide); default visual: `design.md` §6 (`stagger 0.04`, `toggleActions "play none none none"` karena `once: true`); reduced-motion → statis |
| `MediaSlot` | server | `label`, `ratio`, `src?`, `alt` | `src` valid → `next/image` (`sizes` aktual generik `100vw` — sempurnakan saat aset final); kosong → empty-state `mist` solid tanpa error |
| `Kredit`/`Footer` | server | — | Render dari `lib/`; isi: `design.md` §4.6 — BELUM ADA |

### 6. Pola GSAP baku (wajib diikuti semua komponen client)

```tsx
"use client";
useLayoutEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => { /* trigger di sini */ }, ref);
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  return () => { window.removeEventListener("load", onLoad); ctx.revert(); };
}, []);
```

- `prefers-reduced-motion: reduce` → skip scrub/pin/stagger, render state akhir statis (cek via `matchMedia` di tiap komponen animasi). `StickySplit` memakai `gsap.matchMedia` + `mm.revert()` (setara pola baku `gsap.context` + `revert` untuk kasus multi-breakpoint ini).
- Reveal umum: `fade-up 24px, 0.7s, power2.out`, `toggleActions: "play none none reverse"` untuk reveal berulang; `RevealText` memakai `"play none none none"` karena `once: true` (benar).
- Larangan trigger di atas `#kredit`/footer selain reveal sekali; tidak ada animasi infinite selain `ScrollCue`.

### 7. Media & konten (slot, format, dan path: `design.md` §7 — jangan diduplikasi di sini)

- `lib/hero-frames.ts` satu-satunya sumber daftar frame hero; komponen tidak hardcode URL. `lib/content.ts` satu-satunya sumber teks (target 8 blok + headline hero + statement transisi; aktual baru 1 blok — 7 blok + teks transisi menyusul); item `kajian` yang ilustratif wajib `ilustratif: true` + label tampil "Jadwal ilustratif" (belum ada karena blok kajian belum dibangun).
- Render: foto final via `next/image` (`sizes` benar). Frame hero bukan `next/image`: 6 awal di-`preload` via `<link>`, daftar frame dari `lib/hero-frames.ts`. `MediaSlot` kosong tidak boleh error build maupun 404 runtime.

### 8. Budget & cara ukur (persyaratan yang diukur ada di `design.md` §8)

| Metrik | Budget | Cara ukur |
| --- | --- | --- |
| LCP mobile | <2.5s | Lighthouse mobile, throttling default (poster hero + subset font) |
| CLS | <0.1 | Semua media punya `aspect-ratio`; tinggi pin tetap di awal |
| INP HP mid-range | <200ms | Kill trigger off-screen; profil Chrome DevTools |
| Performance | Lighthouse ≥85 | Video ≤ budget `design.md` §7; `sizes` benar |
| Accessibility | Lighthouse ≥95 | Kontras, `alt`, fokus, dan keyboard sesuai `design.md` §8 |

### 9. Verifikasi & QA (wajib sebelum submit lomba)

```bash
npm run lint
npm run build
docker compose config --services
docker compose --profile dev config --services
```

- [ ] `lint` bersih, `build` lolos **dengan slot media kosong**.
- [ ] Status audit 13 Sep 2026 (wajib dilengkapi sebelum submit lomba): `Transisi`/`Kredit`/`Footer` belum ada; `page.tsx` baru 1× `StickySplit` (`kegiatan-mahasiswa`, ID interim — ganti ke 8 ID kontrak saat bangun penuh); `#aik`/`#kontak` masih placeholder; indikator progres + active-link ScrollTrigger + focus-trap penuh belum; `sizes` MediaSlot masih generik; `public/media/` belum ada.
- [x] Temuan lint 13 Sep 2026 (sudah diperbaiki): `npm run lint` penuh sempat gagal pada 15 error di skrip helper `.opencode/skills/**` (di luar scope aplikasi). Perbaikan: `.opencode/**` ditambahkan ke `globalIgnores` di `eslint.config.mjs`; kini `npm run lint` bersih dan `npm run build` lolos.
- [x] Audit memori Hero 14 Sep 2026 (sudah dilakukan): Chrome headless di build production — renderer ~261 MB (dari ~1,85 GB), heap stabil, 60/60 frame OK, scrub 8/8 berganti, nol error console. Detail: `design.md` §12 (catatan 14 Sep 2026).
- [ ] `docker compose config --services` mencetak `sibermu` (produksi:
  `image: sibermu:latest`, `container_name: sibermu`). Catatan port aktual: prod `3322:3000`, dev `3000:3000` — QA manual prod via `http://localhost:3322`, dev via `http://localhost:3000`.
- [ ] `docker compose --profile dev config --services` mencetak `sibermu` + `sibermu-dev`
  (dev: `Dockerfile.dev`, bind-mount `.:/app`, `3000:3000`).
- [ ] Manual: splash exit sesuai kontrak (`design.md` §4.0); hero scrub + pil scroll; 8 `StickySplit` pin desktop & HP; nav active state; overlay mobile `Esc`.
- [ ] Viewport: `360×800`, `768×1024`, `1440×900` — tanpa overflow horizontal (Chrome Android + Safari iOS untuk `svh`/pin).
- [ ] Reduced-motion: semua animasi non-essential mati, konten tetap lengkap.
- [ ] Lighthouse mobile: Performance ≥85, Accessibility ≥95, nol error console.
- [ ] `#kredit` jujur (font OFL, GSAP, Lucide ISC, status aset final).

### 10. Deploy & deliverable lomba (ikut PRD §8)

- Hosting publik tanpa login (rekomendasi Vercel). Repo publik. Keduanya tetap aksesibel minimal s.d. **22 Oktober 2026**.
- Alternatif reproducible-build via Docker (Alpine): `docker compose up --build -d` menjalankan
  service `sibermu` di `http://localhost:3322` (prod memetakan `3322:3000`; dev `sibermu-dev` di `http://localhost:3000`). Image memakai base `node:20-alpine` +
  `libc6-compat` (untuk SWC), user non-root `nextjs`, dan hanya berisi output `standalone`.
- Development via Docker (tanpa build ulang tiap edit): `docker compose --profile dev up --build sibermu-dev`
  menjalankan `http://localhost:3000` dengan bind-mount `.:/app` (`Dockerfile.dev` + `WATCHPACK_POLLING=true`
  agar hot-reload jalan di bind-mount Windows). Volume anonim `/app/node_modules` dan `/app/.next`
  menjaga biner Linux milik container. Rebuild dev hanya perlu saat `package*.json` berubah.
  Catatan: kontainer lokal bukan tautan publik lomba — untuk submit tetap butuh hosting publik.
- Dokumentasi PDF ≤5 halaman + formulir + pernyataan orisinalitas disiapkan terpisah (di luar repo kode).

### 11. Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Pin `StickySplit` jank di HP | CSS-sticky aktual (bukan pin GSAP); driver `min-h-[70svh]` per item; uji Safari iOS; fallback statis jika 1 item |
| Frame hero berat → LCP jebol | 60 frame WebP terukur ≤300 KB/frame; 6 awal di-`preload` via `<link>`; decode ber-window (5+2) ≤2048px; scrub non-aktif saat reduced-motion. Hasil audit 14 Sep 2026 (headless, produksi, 1920×1080 dpr2): renderer ~261 MB, heap 4 MB stabil, 8/8 scrub OK, nol error console |
| Konten baru 1 dari 8 blok + Transisi/Kredit/Footer hilang | Bangun 7 blok + 3 komponen sebelum submit; ganti ID interim `kegiatan-mahasiswa` ke 8 ID kontrak; isi `public/media/` atau biarkan `MediaSlot` kosong |
| Splash mengunci halaman jika JS error | Exit timer + `window load` fallback 4s; logika exit tanpa dependensi video |
| Font/GSAP gagal load (offline) | System-serif/sans fallback di `@theme`; konten tetap terbaca tanpa animasi |
| Aset final terlambat | Build/Deploy tetap jalan dengan `MediaSlot`; kredit tulis status menunggu |

### 12. Non-goals (di luar TRD ini)

- CMS, auth, i18n, dark-mode toggle, halaman tambahan di luar satu landing page.
- Pembuatan/pengadaan foto & video (milik pemilik proyek).
- Finalisasi easing splash `sibermu` (TBD pemilik proyek; kontrak di `design.md` §4.0/§5.5 tidak berubah).

### 13. Traceability

`prd.md` §5–§6 (cakupan & sitemap) → `design.md` §3–§4 (anchor & section) → TRD §3–§7 (komponen & kontrak).
`prd.md` §7/§9 (teknis & kriteria juri) → `design.md` §6/§8 (motion & persyaratan) → TRD §6/§8 (pola & budget ukur).
Checklist desain `design.md` §11 diverifikasi oleh QA TRD §9.
`Dockerfile` + `docker-compose.yml` + `output: "standalone"` → TRD §3/§4 (struktur & config) → TRD §9/§10 (verifikasi & deploy).
Setiap perubahan visual wajib ubah `design.md` dulu, lalu sesuaikan TRD; jangan tembak langsung ke kode.
