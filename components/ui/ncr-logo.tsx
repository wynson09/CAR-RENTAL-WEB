import Image from 'next/image';

interface NCRLogoProps {
  className?: string;
  width?: number;
  height?: number;
  type?: 'svg' | 'webp';
}

export function NCRLogo({
  className = 'h-30 w-30',
  width = 100,
  height = 100,
  type = 'svg',
}: NCRLogoProps) {
  if (type === 'webp') {
    return (
      <Image
        src="/images/car-rental/logo/nacs-car-rental-logo.webp"
        alt="Nacs Car Rental Logo"
        width={width}
        height={height}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/images/car-rental/logo/nacs-car-rental-logo.png"
      alt="Nacs Car Rental Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
