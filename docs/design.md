# Design Specification (design.md)

## Landing Page Kemahasiswaan & AIK SiberMu — Lomba 2026

| Metadata | Keterangan |
| --- | --- |
| Sumber kebutuhan | `docs/prd.md` v1.0 (12 Sep 2026) |
| Stack implementasi | Next.js 16.3.5 (App Router) + React 19 + Tailwind CSS v4 + GSAP ScrollTrigger |
| Status | Siap build. Semua aset foto/video disediakan pemilik proyek — **jangan buat/bundle dummy** |

### 1. Keputusan kunci yang sudah dikunci

1. **Warna:** Primary `#1A2A5B` (navy), Secondary `#007CC4` (biru), Tertiary `#086D46` (hijau Muhammadiyah).
2. **Font:** Head serif + body sans. Asli yang diminta `STK Bureau Serif` **tidak dipakai** karena komersial (Smuss Type Kiosk, lisensi berbayar) dan melanggar ketentuan lomba D.1.5. Pengganti bebas lisensi OFL di §3.
3. **Hero:** Frame-sequence JPG scroll-driven milik pemilik proyek (`public/hero/scene1.jpg` dan seterusnya). Tengah bawah **hanya indikator panah scroll**, tanpa tombol ganda, tanpa dummy frame.
4. **Narasi:** Unified + transisi. Satu bahasa visual untuk Kemahasiswaan & AIK, dipisah satu section statement transisi.
5. **Pola layout konten:** Split sticky — kiri teks (diam + crossfade per item), kanan media ganti per item. **Berlaku di desktop dan mobile** (sticky tetap jalan di HP).
6. **Motion:** Ekspresif tapi terkontrol via GSAP ScrollTrigger (pin + scrub + reveal).
7. **Aset:** Semua foto/video dari pemilik proyek. Komponen media hanya berisi slot + empty-state, bukan file dummy.
8. **Splashscreen:** Layar pembuka fullscreen menampilkan tulisan `sibermu`. Detail animasi **ditentukan kemudian oleh pemilik proyek** — `design.md` hanya mengunci struktur, timing, dan kontrak exit agar build tidak terblokir.

### 2. Design tokens

#### 2.1 Warna

| Token (Tailwind v4 `@theme`) | Hex | Pemakaian |
| --- | --- | --- |
| `--color-navy-900` / `primary` | `#1A2A5B` | Nav background solid, footer, overlay video, heading di atas terang |
| `--color-brand-500` / `secondary` | `#007CC4` | Aksen CTA, link, badge aktif, progress scroll, ikon aktif |
| `--color-aik-700` / `tertiary` | `#086D46` | Aksen section AIK (badge, garis, ikon), bukan background penuh |
| `--color-paper` | `#FFFFFF` | Background utama |
| `--color-mist` | `#F4F6F8` | Background section selang-seling, kartu |
| `--color-ink-900` | `#101828` | Teks body di atas terang |
| `--color-ink-500` | `#475467` | Teks sekunder / caption |
| `--color-line` | `#E4E7EC` | Border kartu, divider |

Aturan pakai:
- Rasio utama: 70% netral terang (`paper`/`mist`), 20% navy, 10% aksen biru/hijau. Jangan pakai navy + hijau + biru sekaligus sebagai background penuh dalam satu viewport.
- Scrim hero: `linear-gradient(transparent, rgba(26,42,91,0.55))` setinggi `192px` di bawah, agar label panah scroll putih terbaca di atas frame.
- Pembedaan Kemahasiswaan vs AIK **bukan** ganti background penuh. Bedakan lewat: badge section (`Kemahasiswaan` biru, `AIK` hijau), garis aksen kiri heading, dan ikon. Background tetap satu sistem.
- Fokus keyboard: `outline: 2px solid #007CC4; offset 3px`.

#### 2.2 Tipografi (bebas lisensi, kredit di §9)

- **Head (pengganti STK Bureau Serif):** `Source Serif 4` (Google Fonts, OFL). Alasan: workhorse serif, 6 weights + optical size, mirip karakter Bureau, mendukung Indonesia.
- **Body/UI:** `Plus Jakarta Sans` (Google Fonts, OFL). Alasan: modern, tegas, cocok headline pendukung + body kecil.
- Load via `next/font/google` (bukan `<link>` manual) agar `build` stabil dan subset `latin` otomatis.
- Jangan load STK Bureau Serif tanpa bukti lisensi web.

Skala (clamp agar statement-driven ala zero.university):

| Level | Font | Size | Line-height | Pakai di |
| --- | --- | --- | --- | --- |
| Display | Source Serif 4 600 | `clamp(2.75rem, 6vw, 5.5rem)` | 1.02 | Hero overlay, statement transisi, judul section |
| H2 | Source Serif 4 600 | `clamp(2rem, 4vw, 3.5rem)` | 1.08 | Judul section Kemahasiswaan / AIK |
| H3 | Source Serif 4 600 | `1.5rem–2rem` | 1.15 | Judul item sticky kiri |
| Body | Plus Jakarta Sans 400/500 | `1rem–1.125rem` | 1.7 | Paragraf, list |
| Small/Caption | Plus Jakarta Sans 500 | `0.8125rem–0.875rem` | 1.5 | Badge, caption foto, kredit |
| CTA | Plus Jakarta Sans 600 | `0.9375rem` | 1 | Tombol, nav link |

Aturan: heading tidak lebih dari 12 kata. Body maksimal 3 baris per item sticky (detail panjang masuk ke link/docs, bukan di landing).

#### 2.3 Spacing, radius, shadow, breakpoints

- Section padding: `96–128px` desktop, `64px` mobile. Container: `max-w-7xl`, gutter `24px` mobile / `32px` desktop.
- White space besar antar section (minimal `1x` viewport rhythm di transisi).
- Radius: kartu `20px`, media `24px`, tombol pill `999px`, badge `999px`.
- Shadow: hanya satu level — `0 12px 32px rgba(16,24,40,0.12)` untuk kartu terangkat / navbar solid. Tidak ada shadow dekoratif ganda.
- Breakpoints (mobile-first): `360px` base, `md 768px`, `lg 1024px`, `xl 1440px`.
- Z-index: splash `100`, nav `50`, hero cue `10`, sticky media `10`, overlay mobile menu `60`.

### 3. Informasi arsitektur & anchor

Urutan satu halaman (satu-satunya sumber kebenaran untuk nav):

0. `Splashscreen` — overlay fullscreen `sibermu`, muncul sekali saat load awal, lalu exit ke `#beranda` (bukan anchor nav)
1. `#beranda` — Hero video scroll-driven
2. `#kemahasiswaan` — judul section + 4 blok sticky: `#organisasi`, `#ukm`, `#prestasi`, `#layanan`
3. `#transisi` — statement penghubung (tanpa nav)
4. `#aik` — judul section + 4 blok sticky: `#kegiatan`, `#kajian`, `#syiar`, `#nilai`
5. `#kredit` — kredit aset (tanpa nav, wajib tampil)
6. `#kontak` — footer + CTA penutup

Nav (desktop): logo kiri, link tengah `Kemahasiswaan | AIK | Kontak`, CTA kanan `Daftar / Gabung` (href ke `#kontak`). Nav mobile: logo + tombol hamburger → overlay fullscreen berisi 3 link + CTA, tanpa dropdown.

### 4. Spesifikasi per section

#### 4.0 Splashscreen — overlay `sibermu` (animasi menyusul)

- Komponen `SplashScreen`, `position: fixed; inset: 0; z: 100`, background navy `#1A2A5B`, teks `sibermu` lowercase tengah (font Display `Source Serif 4`, putih, `clamp(3rem, 10vw, 7rem)`).
- Tampil sekali per load awal (bukan per navigasi anchor). Durasi total maksimal `2.5s`: masuk → hold → exit (fade/slide, detail easing **TBD oleh pemilik proyek**).
- Kontrak exit (wajib, agar tidak mengunci halaman): selesai via timer ATAU `window load` + timeout fallback `3.5s`; exit selalu fade `300ms`; setelah exit `display: none` + kembalikan scroll (`overflow` body dikunci selama splash tampil).
- Aksesibilitas: `aria-hidden="true"`, `prefers-reduced-motion` → tampil statis `500ms` lalu langsung fade tanpa animasi teks; jangan blokir keyboard lebih dari durasi splash.
- Jangan taruh CTA, logo gambar, atau video di splash. Satu-satunya slot animasi teks yang boleh diubah kemudian: easing, stagger huruf, dan efek reveal — tanpa mengubah struktur/exit di atas.

#### 4.1 Header/Navbar

- Di atas hero: full-width, transparan, teks putih, blur 0.
- Setelah scrub hero selesai (event `hero:video-ended`) atau halaman sudah melewati section hero: morph menjadi pill mengambang `max-w-5xl rounded-full`, background `rgba(255,255,255,0.95)` + `backdrop-blur`, shadow `0 12px 32px rgba(16,24,40,0.12)`. Teks/logo putih → primary `#1A2A5B`. Tanpa garis/progress bar di bawah navbar. Scroll kembali ke atas me-reset (event `hero:video-reset`) sehingga navbar kembali transparan penuh di awal video.
- Morph memakai transisi `700ms cubic-bezier(0.22,1,0.36,1)` pada `max-width` (`100%` → `64rem`), `border-radius`, `background-color`, dan `box-shadow` agar interpolasi mulus tanpa snap. Tinggi `72px` desktop / `64px` mobile.
- Active link ditandai underline aksen, dihitung dari posisi ScrollTrigger (bukan click saja).

#### 4.2 Hero `#beranda` — frame scrub + panah

Struktur:
- Section setinggi `100 × (1 + N/24)vh` (N = jumlah frame) berisi satu panel sticky `100svh` (pakai `svh` agar benar di mobile), `overflow: clip`. Footage diasumsikan `24fps`: tiap `100vh` scroll ≈ 1 detik animasi (24 frame), sehingga kerapatan scrub konstan berapa pun jumlah frame.
- Layer 1: frame-sequence JPG dari pemilik proyek (`public/hero/scene1.jpg`, `scene2.jpg`, ... — lihat kontrak media §7). Seluruh frame di-decode menjadi `ImageBitmap` saat mount dan digambar ke `<canvas>` full-bleed (cover via `drawImage`) mengikuti indeks scrub — tanpa ganti `src` sehingga tidak ada blank saat scroll cepat. Hero baru ditampilkan setelah semua bitmap siap; jika decode gagal, tampilkan empty-state navy + teks "Slot frame hero" — **bukan gambar dummy**.
- Layer 2: scrim tipis bawah §2.1, hanya agar instruksi scroll terbaca.
- Layer 3 (tengah bawah): satu-satunya CTA adalah indikator panah scroll: ikon panah + label `Gulir untuk menjelajah` + animasi bounce halus. Klik panah → `scrollTo(#kemahasiswaan)`. Cue fade-out mengikuti progres scrub.
- Perilaku scroll (GSAP): indeks frame = `round(progress × (N-1))`; swap `src` langsung via ref (tanpa re-render React). Hormati `prefers-reduced-motion`: tampil frame pertama statis, tidak ada scrub.
- Kinerja: tiap frame `.jpg` ≤300 KB; frame pertama `priority` preload (LCP).

#### 4.3 Section Kemahasiswaan `#kemahasiswaan`

- Pembuka: badge `Kemahasiswaan` (biru) + H2 statement besar + 1 paragraf jembatan (maks 2 kalimat).
- Di bawahnya 4 blok sticky berurutan (`organisasi`, `ukm`, `prestasi`, `layanan`). Setiap blok memakai komponen yang sama `StickySplit` (§5.3) agar konsisten dan hemat kode.
- Isi tiap blok (jumlah item final ikut konten, rekomendasi):
  - Organisasi: 3–4 item (mis. BEM/Ormawa).
  - UKM: 4–6 item.
  - Prestasi: 3–5 item (nama, bidang, tahun).
  - Layanan: 3–4 item (konseling, beasiswa, aspirasi).
- Jika item hanya 1, `StickySplit` otomatis non-sticky (fallback jadi kartu statis) agar tidak ada pin boş.

#### 4.4 Transisi `#transisi`

- Satu viewport, background navy `#1A2A5B`, teks putih Display 1–2 baris (mis. `Organisasi menguatkan. Nilai Islam mengarahkan.`).
- Pattern islami opacity rendah + reveal kata-per-kata (stagger) via ScrollTrigger. Tanpa CTA, tanpa gambar. Ini pemisah visual Kemahasiswaan → AIK.

#### 4.5 Section AIK `#aik`

- Sama seperti §4.3 tapi badge `Al-Islam & Kemuhammadiyahan` (hijau `#086D46`) + garis aksen hijau.
- 4 blok sticky: `kegiatan` (rutin/Ramadhan), `kajian` (jadwal/tema/narasumber — tandai jelas jika data ilustratif), `syiar` (media dakwah), `nilai` (4–5 nilai inti sebagai statement pendek, bukan paragraf panjang).
- Sub-blok Nilai: teks kiri berupa list nilai (mandiri, ikhlas, tajdid, ukhuwah) dengan highlight bergantian; kanan slot grafis/kaligrafi geometris dari pemilik proyek.

#### 4.6 Kredit `#kredit` + Footer `#kontak`

- Kredit wajib (ketentuan D.1.5): list font (`Source Serif 4 OFL`, `Plus Jakarta Sans OFL`), GSAP (lisensi), setiap foto/video (sumber + lisensi + kreator) setelah file final masuk. Selama aset belum ada, tulis `Menunggu aset final dari pemilik proyek — tidak ada aset dummy yang di-bundle`.
- Footer navy, tiga kolom: identitas + alamat kampus, kontak (email humas + WA narahubung lomba bila diizinkan), sosmed (`@sibermu`). Baris bawah: disclaimer karya lomba + copyright + link `#kredit`.
- CTA penutup gaya zero.university di atas footer: Display `Gabung Bersama Kami.` + satu tombol primer `Jelajahi Pendaftaran` (href ikut arahan pemilik, default `#kontak`).

### 5. Komponen (kontrak build)

#### 5.1 Tombol & badge

- Primer: pill navy `#1A2A5B`, teks putih, hover jadi `#007CC4`, `padding 14px 28px`, transisi 200ms. Sekunder: outline putih/navy sesuai background.
- Badge section: pill kecil uppercase `Plus Jakarta Sans 700 12px tracking 0.08em`, varian biru (Kemahasiswaan) dan hijau (AIK).

#### 5.2 Kartu

- Tidak ada kartu generik besar. Kartu hanya dipakai di dalam panel kiri sticky sebagai ringkasan item (judul + 2–3 baris + meta). Hover: `translateY(-4px)` + shadow §2.3. Tidak ada hover 3D berat.

#### 5.3 `StickySplit` (komponen inti, dipakai 8x)

Props: `id`, `eyebrow`, `items: { title, body, meta?, mediaSlot }[]`.

- Desktop (`lg+`): grid 2 kolom (kiri `5/12`, kanan `7/12`, gap `64px`). Kolom kiri `position: sticky; top: 104px`, teks crossfade per item aktif (item aktif opacity 1, lainnya 0.35). Kolom kanan daftar media vertikal, tiap media `aspect 4/3`, `radius 24px`, di-pin bergantian via ScrollTrigger; indikator progres item (titik/nomor) di sisi kanan.
- Mobile (`<lg`): **tetap sticky** sesuai permintaan. Implementasi: media di-pin `top: 64px` setinggi `38svh` di atas, teks berjalan di bawahnya dan crossfade. Tidak diubah jadi tumpukan statis. Pastikan `overflow` tidak pecah dan tinggi pin dihitung dari jumlah item (`pinSpacing: true`).
- Media kosong: render `MediaSlot` empty-state (warna `mist`, garis dashed, label slot + rasio yang diminta). Jangan render `<Image>` tanpa `src` valid, jangan pakai `picsum/unsplash` dummy.
- Aksesibilitas: tiap pergantian item update `aria-live="polite"` pada judul kiri; navigasi keyboard (panah atas/bawah) pindah item.

#### 5.4 Panah scroll hero

- Komponen `ScrollCue`: tombol bulat `48px`, border putih 40%, ikon panah bawah, label kecil di atasnya. Animasi `y` 8px loop 1.6s. Hilang (fade) setelah hero lewat.

#### 5.5 `SplashScreen` (animasi teks TBD)

- Props: `text = "sibermu"`, `onDone?: () => void`. Tidak ada props aset/media.
- Struktur: wrapper fixed fullscreen + inner teks (pecah per huruf `<span>` agar siap untuk stagger/easing susulan tanpa refactor).
- State: `entering → holding → exiting → done`. Transisi state via GSAP timeline tunggal agar mudah diganti easing oleh pemilik proyek nanti.
- Yang boleh diubah kemudian (tanpa mengubah kontrak §4.0): easing, arah masuk huruf, stagger, efek blur/gradient teks. Yang tidak boleh diubah: durasi total >2.5s, z-index, dan mekanisme fallback exit.

### 6. Motion (GSAP ScrollTrigger — ekspresif tapi hemat)

- Satu instance: `gsap.registerPlugin(ScrollTrigger)` di client component (`useLayoutEffect` + `gsap.context` + `revert()` pada unmount; wajib `ScrollTrigger.refresh()` setelah font/video load).
- Pola yang diizinkan: (a) splash timeline §4.0/§5.5 (satu timeline, exit selalu ada), (b) hero frame scrub §4.2, (c) `StickySplit` pin + crossfade §5.3, (d) reveal umum `fade-up 24px, 0.7s, ease power2.out` untuk H2/badge/paragraf, (e) stagger kata di `#transisi`, (f) navbar morph toggle.
- Yang dilarang: parallax multi-layer berat, smooth-scroll hijack (Lenis/Locomotive), cursor custom, animasi infinite selain `ScrollCue`, animasi di atas `#kredit`/footer selain reveal sekali.
- `prefers-reduced-motion: reduce` → matikan scrub/pin/stagger, tampilkan konten final statis. Ini syarat lolos QA juri lintas perangkat.
- Budget: total JS animasi tidak boleh bikin INP >200ms di HP mid-range; kill semua trigger yang off-screen (`toggleActions: "play none none reverse"` untuk reveal).

### 7. Kontrak media (tanpa dummy — pemilik proyek mengisi)

| Slot | Jumlah | Format final | Rasio / ukuran | Catatan |
| --- | --- | --- | --- | --- |
| Hero frames | N (`scene1.jpg`, `scene2.jpg`, ...) | `.jpg` ≤300 KB per frame | full-bleed, `object-cover` | Path: `public/hero/scene<nn>.jpg`. Daftar dibaca server via `lib/hero-frames.ts`, di-pass sebagai props ke `Hero` |
| Sticky media Kemahasiswaan | 4 blok × N item | `.jpg/.webp` ≤300 KB per file | 4/3 | Path: `public/media/kemahasiswaan/<blok>-<nn>.webp` |
| Sticky media AIK | 4 blok × N item | `.jpg/.webp` ≤300 KB per file | 4/3 | Path: `public/media/aik/<blok>-<nn>.webp` |
| Logo SiberMu | 1 SVG | SVG monokrom putih + navy | — | Sederhanakan, jangan stretch |

- Render foto final dengan `next/image` (`sizes`, `lazy` kecuali frame pertama hero yang `priority`). Frame hero di-swap via ref agar scrub 60fps tanpa re-render.
- Ikon UI: inline SVG (Lucide, ISC) — bukan font ikon eksternal, bukan emoji.
- Sampai file final ada, build harus lolos dengan `MediaSlot` kosong (tidak ada 404, tidak ada `next/image` error).

### 8. Responsif, aksesibilitas, performa (persyaratan; angka budget & cara ukur di `trd.md` §8)

- Mobile-first. Viewport acuan: `360×800`, `768×1024`, `1440×900`. Sticky mobile (§5.3) harus benar di Chrome Android + Safari iOS (perilaku `svh` dan pin berbeda).
- Kontras: body ≥4.5:1, Display ≥3:1. Semua media punya `alt` bermakna (bahasa Indonesia). Video hero punya `aria-label` + teks alternatif di bawah cue.
- Keyboard: semua CTA/link focusable, urutan fokus = urutan visual, overlay menu trap fokus + `Esc` menutup.
- SEO dasar: `lang="id"`, satu `h1` (di hero), meta description ID, OG tags, anchor semantik (`header/main/section/footer`).
- Tanpa layout shift yang terlihat saat animasi init (media selalu punya `aspect-ratio`, tinggi pin tetap di awal).

### 9. Kredit sementara (tulis di halaman `#kredit`)

- Font: `Source Serif 4 — SIL Open Font License 1.1`, `Plus Jakarta Sans — SIL Open Font License 1.1` (via Google Fonts / `next/font`).
- Animasi: `GSAP + ScrollTrigger — GSAP Standard License (gratis)`.
- Ikon: `Lucide Icons — ISC License`.
- Foto/Frame: `Frame hero (`public/hero/scene*.jpg`) dan seluruh slot media dari pemilik proyek. Selama aset belum ada, slot kosong dan tidak memakai aset dummy.`
- Catatan STK: `STK Bureau Serif (Smuss Type Kiosk, komersial) dijadikan referensi gaya saja dan tidak di-bundle karena alasan lisensi lomba.`

### 10. Implementasi Next.js + Tailwind v4

Bukan wewenang dokumen ini. Seluruh implementasi (struktur berkas, token `@theme`, font, kontrak komponen, pola GSAP) ada di `docs/trd.md` §3–§6.

### 11. Checklist penerimaan desain (mapping kriteria juri PRD §9; verifikasi build & ukur di `trd.md` §8–§9)

- [ ] Kedua bidang lengkap (8 blok) + transisi naratif, anchor nav bekerja.
- [ ] Splashscreen `sibermu` muncul sekali, exit sesuai kontrak §4.0, tidak mengunci scroll/keyboard, reduced-motion aman.
- [ ] Warna/tipe/spasi sesuai §2, tidak ada dummy visual.
- [ ] Hero frame scrub + panah sesuai §4.2, reduced-motion aman.
- [ ] `StickySplit` sesuai §5.3 di desktop dan HP, keyboard + `aria-live` OK.
- [ ] `#kredit` terisi jujur sesuai §9, tidak ada aset tanpa lisensi.
