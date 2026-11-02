import Image from 'next/image';

interface CompanyLogoProps {
  name: string;
  logoUrl: string | null | undefined;
  size: number;
  className?: string;
}

/** Logo da empresa; sem logo, mostra a inicial do nome. */
export function CompanyLogo({ name, logoUrl, size, className = '' }: CompanyLogoProps) {
  const box = `relative shrink-0 overflow-hidden ${className}`;

  if (logoUrl) {
    return (
      <div
        className={`${box} bg-neutral-100 dark:bg-neutral-800`}
        style={{ width: size, height: size }}
      >
        <Image src={logoUrl} alt={name} fill sizes={`${size}px`} className="object-contain p-1" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${box} flex items-center justify-center bg-neutral-800 font-extrabold text-white dark:bg-neutral-200 dark:text-neutral-900`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  );
}
