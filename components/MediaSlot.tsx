import Image from "next/image";

type MediaSlotProps = {
  label: string;
  ratio?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
  objectPosition?: "top" | "center" | "bottom" | "left" | "right";
};

const POSITION_CLASSES = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
} as const;

export default function MediaSlot({
  label,
  ratio = "16 / 9",
  src,
  alt = "",
  priority = false,
  className = "",
  objectFit = "cover",
  objectPosition = "center",
}: MediaSlotProps) {
  return (
    <div
      role={src ? undefined : "status"}
      aria-label={src ? undefined : label}
      style={{ aspectRatio: ratio }}
      className={
        src
          ? `relative w-full overflow-hidden bg-mist ${className}`
          : `flex w-full flex-col items-center justify-center gap-2 border-2 border-gray-300 bg-mist px-6 text-center ${className}`
      }
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className={`${
            objectFit === "contain" ? "object-contain" : "object-cover"
          } ${POSITION_CLASSES[objectPosition] ?? "object-center"}`}
        />
      ) : (
        <>
          <span className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-ink-500">
            Slot media kosong
          </span>
          <span className="font-sans text-sm text-ink-500">{label}</span>
        </>
      )}
    </div>
  );
}
