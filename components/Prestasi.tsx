export default function Prestasi() {
  return (
    <section
      id="prestasi"
      aria-labelledby="prestasi-heading"
      className="relative z-10 -mt-px flex min-h-[100svh] w-full bg-primary"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-white/70">
          Prestasi
        </p>
        <h2
          id="prestasi-heading"
          className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
        >
          Prestasi mahasiswa.
        </h2>
      </div>
    </section>
  );
}
