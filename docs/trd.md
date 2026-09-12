# Technical Requirements Document (TRD)

## Landing Page Kemahasiswaan & AIK SiberMu — Lomba 2026

| Metadata | Keterangan |
| --- | --- |
| Sumber kebutuhan | `docs/prd.md` v1.0 |
| Sumber desain | `docs/design.md` (satu-satunya acuan visual; jika bertentangan, `design.md` menang atas asumsi di TRD ini) |
| Stack | Next.js 16.3.5 (App Router) + React 19.2.8 + Tailwind CSS v4 + GSAP ScrollTrigger |
| Status | Siap build |

### 1. Kunci teknis (non-negotiable; nilai visual di `design.md` §1–§2, jangan diduplikasi di sini)

1. **Tanpa aset dummy** — slot kosong me-render `MediaSlot` empty-state; nol 404, nol `next/image` error (slot: `design.md` §7).
2. **Tanpa font komersial** — hanya font OFL `design.md` §2.2 via `next/font/google`.
3. **Animasi hanya GSAP ScrollTrigger** — larangan: smooth-scroll hijack, cursor custom, parallax berat, framework animasi lain (pola: §6).
4. **Mobile-first, sticky juga di HP** — perilaku pin: `design.md` §5.3.
5. **Bahasa Indonesia** — `lang="id"`, satu `h1`, konten statis di `lib/content.ts`.

### 2. Dependensi

Terkunci di `package.json` (jangan downgrade):

- `next@16.3.5`, `react@19.2.8`, `react-dom@19.2.8`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `typescript@^5`, `eslint@^9`, `eslint-config-next@16.3.5`.

Yang harus ditambahkan sekali saat mulai build:

```bash
npm i gsap lucide-react
npm i -D @types/gsap
```

Dilarang menambah: framework animasi lain, lib smooth-scroll, font-icon kit, CSS-in-JS runtime, image placeholder service.

### 3. Struktur berkas target

```text
app/
  layout.tsx          # font, lang="id", metadata, SplashScreen mount
  page.tsx            # komposisi section (server component, tanpa logika animasi)
  globals.css         # @import "tailwindcss" + @theme tokens (design.md §2)
components/
  SplashScreen.tsx    # "use client" — timeline GSAP tunggal, kontrak design.md §5.5
  Navbar.tsx          # "use client" — solid toggle + progress + overlay mobile
  Hero.tsx            # "use client" — video scrub + ScrollCue
  StickySplit.tsx     # "use client" — dipakai 8x, pin + crossfade, design.md §5.3
  Transisi.tsx        # "use client" — stagger kata
  Kredit.tsx          # server — list statis dari konstanta
  Footer.tsx          # server — CTA penutup + kontak + disclaimer
  ScrollCue.tsx       # "use client" — tombol panah, loop y 8px
  MediaSlot.tsx       # server — empty-state / next/image jika src valid
lib/
  content.ts          # teks ID semua section + anchor (sumber kebenaran konten)
  media.ts            # event scrub hero + konstanta HERO_FPS
  hero-frames.ts      # server-only: daftar public/hero/scene*.jpg terurut
  site.ts             # metadata, kontak, sosmed, link pendaftaran
public/
  hero/
    scene1.jpg, scene2.jpg, ... (frame hero, milik pemilik proyek)
  media/
    kemahasiswaan/<blok>-<nn>.webp
    aik/<blok>-<nn>.webp
```

Aturan: `page.tsx` tetap server component; semua GSAP hanya di komponen `"use client"`. Tidak ada fetch data eksternal — seluruh konten statis dari `lib/`.

### 4. Implementasi token & font

- `app/globals.css`: definisikan `@theme` persis dari `design.md` §2 — `design.md` satu-satunya sumber angka, jangan salin nilai ke sini. Jangan buat `tailwind.config.js`.
- `app/layout.tsx`: ganti `Geist` → `Source_Serif_4` + `Plus_Jakarta_Sans` via `next/font/google` (`subsets: ["latin"]`, `display: "swap"`), set `lang="id"`, metadata lomba (title, description ID, OG).
- `next.config.ts`: biarkan default. Optimasi gambar default `next/image` sudah cukup; ubah hanya jika deploy target non-Vercel memerlukannya (catat alasannya di sini).

### 5. Kontrak komponen (teknis saja; nilai visual di `design.md` §4–§5)

| Komponen | Tipe | Props inti | Perilaku kode wajib |
| --- | --- | --- | --- |
| `SplashScreen` | client | `text="sibermu"`, `onDone?` | Timeline GSAP tunggal; kontrak waktu & exit: `design.md` §5.5; kunci `body overflow` selama tampil; `aria-hidden`; reduced-motion → statis + fade |
| `Navbar` | client | — | Solid toggle + overlay mobile; ambang & warna: `design.md` §4.1; overlay trap fokus + `Esc` |
| `Hero` | client | `frames: string[]` | Scrub via indeks frame + `drawImage` `ImageBitmap` ke `<canvas>`; decode semua frame dulu; gagal → `MediaSlot`; dimensi & scrim: `design.md` §4.2 |
| `StickySplit` | client | `id`, `eyebrow`, `items[]` | Pin + crossfade; `pinSpacing:true`; `aria-live="polite"`; 1 item → statis; grid & dimensi: `design.md` §5.3 |
| `Transisi` | client | `text` | Stagger kata; teks dari `lib/content.ts` |
| `ScrollCue` | client | `target="#kemahasiswaan"` | Loop + fade setelah hero lewat; ukuran & label: `design.md` §5.4 |
| `MediaSlot` | server | `label`, `ratio`, `src?`, `alt` | `src` valid → `next/image` (`sizes`, lazy kecuali hero poster); kosong → empty-state tanpa error |
| `Kredit`/`Footer` | server | — | Render dari `lib/`; isi: `design.md` §4.6 |

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

- `prefers-reduced-motion: reduce` → skip scrub/pin/stagger, render state akhir statis (cek via `matchMedia` di tiap komponen animasi).
- Reveal umum: `fade-up 24px, 0.7s, power2.out`, `toggleActions: "play none none reverse"`.
- Larangan trigger di atas `#kredit`/footer selain reveal sekali; tidak ada animasi infinite selain `ScrollCue`.

### 7. Media & konten (slot, format, dan path: `design.md` §7 — jangan diduplikasi di sini)

- `lib/hero-frames.ts` satu-satunya sumber daftar frame hero; komponen tidak hardcode URL. `lib/content.ts` satu-satunya sumber teks (8 blok + headline hero + statement transisi); item `kajian` yang ilustratif wajib `ilustratif: true` + label tampil "Jadwal ilustratif".
- Render: foto final via `next/image` (`sizes` benar, `priority` untuk frame pertama hero). Daftar frame hero dari `lib/hero-frames.ts`. `MediaSlot` kosong tidak boleh error build maupun 404 runtime.

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
```

- [ ] `lint` bersih, `build` lolos **dengan slot media kosong**.
- [ ] Manual: splash exit sesuai kontrak (`design.md` §4.0); hero scrub + panah; 8 `StickySplit` pin desktop & HP; nav active state; overlay mobile `Esc`.
- [ ] Viewport: `360×800`, `768×1024`, `1440×900` — tanpa overflow horizontal (Chrome Android + Safari iOS untuk `svh`/pin).
- [ ] Reduced-motion: semua animasi non-essential mati, konten tetap lengkap.
- [ ] Lighthouse mobile: Performance ≥85, Accessibility ≥95, nol error console.
- [ ] `#kredit` jujur (font OFL, GSAP, Lucide ISC, status aset final).

### 10. Deploy & deliverable lomba (ikut PRD §8)

- Hosting publik tanpa login (rekomendasi Vercel). Repo publik. Keduanya tetap aksesibel minimal s.d. **22 Oktober 2026**.
- Dokumentasi PDF ≤5 halaman + formulir + pernyataan orisinalitas disiapkan terpisah (di luar repo kode).

### 11. Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Pin `StickySplit` jank di HP | `pinSpacing:true`, tinggi pin tetap di awal, uji Safari iOS; fallback statis jika 1 item |
| Frame hero berat → LCP jebol | Tiap frame `.jpg` ≤300 KB, frame pertama `priority`, preload sisanya, scrub non-aktif saat reduced-motion |
| Splash mengunci halaman jika JS error | Exit timer + `window load` fallback 3.5s; logika exit tanpa dependensi video |
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
Setiap perubahan visual wajib ubah `design.md` dulu, lalu sesuaikan TRD; jangan tembak langsung ke kode.
