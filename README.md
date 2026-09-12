# sibermu — Landing Page Kemahasiswaan & AIK

Karya untuk **Lomba Pembuatan Landing Page SiberMu 2026**: satu halaman (single-page)
terpadu yang menggabungkan **Kemahasiswaan** (ormawa, UKM, prestasi, layanan)
dan **Al-Islam & Kemuhammadiyahan / AIK** (kegiatan, kajian, syiar, nilai)
dalam satu alur navigasi.

- Identitas & konten: [sibermu.ac.id](https://sibermu.ac.id/)
- Acuan visual: [zero.university](https://www.zero.university/) (inspirasi tata letak, bukan salin aset/kode)

## Teknologi

- Next.js 16.3.5 (App Router) + React 19 + Tailwind CSS v4
- GSAP ScrollTrigger (satu-satunya library animasi, hanya di komponen `"use client"`)
- Font OFL via `next/font/google`: `Source Serif 4` + `Plus Jakarta Sans`
- Docker image berbasis Alpine, output Next.js `standalone`

Sumber kebenaran berurutan: `docs/prd.md` → `docs/design.md` (menang jika konflik visual) → `docs/trd.md`.

## Prasyarat

- Node.js 20+ dan npm
- (Opsional) Docker + Docker Compose v2 untuk jalan via kontainer

## Jalankan lokal

```bash
npm ci
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Build produksi lokal:

```bash
npm run build
npm run start
```

## Jalankan dengan Docker

Satu file `docker-compose.yml` berisi dua service:

| Service | File Docker | Kapan dipakai | Alamat |
| --- | --- | --- | --- |
| `sibermu` | `Dockerfile` | Produksi — kode di-*bake* ke image, **wajib `--build` tiap edit kode** | [http://localhost:3000](http://localhost:3000) |
| `sibermu-dev` | `Dockerfile.dev` | Development — kode di-mount dari laptop, **edit langsung reload tanpa build ulang** | [http://localhost:3000](http://localhost:3000) |

Produksi (image ringan Alpine multi-stage, non-root `nextjs`):

```bash
docker compose up --build -d sibermu
docker compose logs -f sibermu
```

Development (bind-mount `.:/app`, hanya build sekali di awal):

```bash
docker compose --profile dev up --build sibermu-dev
```

Lalu edit kode di laptop — browser me-reload sendiri. Rebuild hanya perlu jika
`package.json` / `package-lock.json` berubah (atau `Dockerfile.dev` diubah).

Hentikan:

```bash
docker compose down                      # matikan semua
docker compose --profile dev down        # termasuk dev
```

Detail setup: `Dockerfile`, `Dockerfile.dev`, `docker-compose.yml`, `.dockerignore`.

## Struktur proyek

```text
app/            # layout, page (server component), globals.css (@theme, tanpa tailwind.config.js)
components/     # SplashScreen, Navbar, Hero, StickySplit, Transisi, MediaSlot, Kredit, Footer, ...
lib/            # content.ts (teks ID), site.ts (metadata/kontak), media.ts, hero-frames.ts
public/         # hero/ + media/ — diisi pemilik proyek; kosong = MediaSlot empty-state
docs/           # prd.md, design.md, trd.md
Dockerfile              # produksi: multi-stage node:20-alpine
Dockerfile.dev          # development: Alpine + npm run dev (untuk bind-mount)
docker-compose.yml      # service: sibermu (prod, :3000) + sibermu-dev (dev, :3000, profile dev)
.dockerignore
```

Aturan keras: tanpa aset dummy, tanpa font komersial, tanpa smooth-scroll hijack /
cursor custom / parallax berat, tanpa framework animasi selain GSAP ScrollTrigger.

## Verifikasi

```bash
npm run lint
npm run build
```

Keduanya harus lolos dengan slot media kosong (tanpa 404 / `next/image` error).

## Dokumentasi lomba

- `docs/prd.md` — kebutuhan & cakupan konten
- `docs/design.md` — acuan visual
- `docs/trd.md` — kontrak teknis & QA
- Deliverable (tautan live, repo publik, PDF ≤ 5 halaman, formulir, pernyataan orisinalitas)
  wajib aksesibel minimal s.d. **22 Oktober 2026**.
