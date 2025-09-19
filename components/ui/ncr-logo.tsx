import Image from 'next/image';

interface NCRLogoProps {
  className?: string;
  width?: number;
  height?: number;
  type?: 'svg' | 'webp';
}

export function NCRLogo({
  className = 'h-auto w-30',
  width = 90,
  height = 50,
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
        style={{ width: 'auto', height: 'auto' }}
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
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  );
}
