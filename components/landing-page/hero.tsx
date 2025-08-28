import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CarImage from '@/public/images/landing-page/car.webp';

const Hero = () => {
  return (
    <section
      className="bg-[url(https://dashboi-one.vercel.app/images/home/hero-bg.png)] bg-cover bg-no-repeat relative mb-10 lg:mb-0"
      id="home"
    >
      <div className="bg-gradient-to-b from-primary/30 to-[#fff] dark:from-primary/20 dark:to-[#0F172A]">
        <div className="container mx-auto min-h-[88vh]">
          <div className="grid lg:grid-cols-2 gap-8 items-center justify-center relative z-10">
            {/* Left Content - Text */}
            <div className="pt-32 md:pt-48 lg:pt-20">
              <h1 className="text-3xl text-center lg:text-left md:text-4xl xl:text-5xl xl:leading-[52px] font-bold text-default-900">
                <p>ACCOMPANY YOUR </p>
                <p>JOURNEY WITH COMFORT </p>
              </h1>
              <p className="text-base text-center lg:text-left leading-7 md:text-lg md:leading-8 text-default-700 mt-5">
                Experience the freedom to explore Pagadian and beyond with{' '}
                <span className="text-primary">Nacs Car Rental.</span> Choose from a wide selection
                of reliable vehicles—perfect for every journey, whether it’s business, adventure, or
                family fun.
              </p>
              <p className="text-base text-center lg:text-left leading-7 md:text-lg md:leading-8 text-default-700 mt-5">
                Discover the wonders of the Philippines at your own pace. With Nacs Car Rental, you
                get unbeatable prices, top-notch service, and the flexibility to travel wherever
                your heart desires.
              </p>
              <p className="text-base text-center lg:text-left leading-7 md:text-lg md:leading-8 text-default-700 mt-5">
                Reserve your car today and make every journey unforgettable!
              </p>
              <div className="flex mt-9 gap-4 lg:gap-8 justify-center lg:justify-start">
                <Button asChild size="xl">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link href="https://dash-tail.vercel.app/docs/introduction" target="_blank">
                    Browse Vehicles
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Car with Blue Background */}
            <div className="relative lg:h-[800px] flex items-center justify-center">
              {/* Custom SVG background shape - adapts to image size */}
              <div className="absolute lg:top-1/4 top-[20%] right-0 lg:w-[100%] w-[100%] lg:h-[60%] h-[80%] transform -rotate-6 scale-x-[-1]">
                <svg
                  fill="none"
                  viewBox="0 0 342 175"
                  className="w-full h-full absolute inset-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="url(#paint0_linear_hero_bg)"
                    d="M0 66.4396C0 31.6455 0 14.2484 11.326 5.24044C22.6519 -3.76754 39.6026 0.147978 73.5041 7.97901L307.903 62.1238C324.259 65.9018 332.436 67.7909 337.218 73.8031C342 79.8154 342 88.2086 342 104.995V131C342 151.742 342 162.113 335.556 168.556C329.113 175 318.742 175 298 175H44C23.2582 175 12.8873 175 6.44365 168.556C0 162.113 0 151.742 0 131V66.4396Z"
                  />
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="128"
                      x2="354.142"
                      y1="128"
                      x1="0"
                      id="paint0_linear_hero_bg"
                    >
                      <stop stopColor="#7B5FCF" stopOpacity="0.6" />
                      <stop stopColor="#5D4E9A" stopOpacity="0.4" offset="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Car Image - much bigger and overflowing the background */}
              <motion.div
                className="relative z-10 w-full max-w-3xl scale-125"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              >
                <Image src={CarImage} alt="carImage" priority={true} className="w-full h-auto" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
