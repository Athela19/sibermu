import Image from "next/image";

type MediaSlotProps = {
  label: string;
  ratio?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
};

export default function MediaSlot({
  label,
  ratio = "16 / 9",
  src,
  alt = "",
  priority = false,
  className = "",
}: MediaSlotProps) {
  if (src) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-mist ${className}`}
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line bg-mist px-6 text-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
        Slot media kosong
      </span>
      <span className="font-sans text-sm text-ink-500">{label}</span>
    </div>
  );
}
