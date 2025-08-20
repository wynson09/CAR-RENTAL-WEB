import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import CarImage from '@/public/images/landing-page/car.webp';

const HeroEnhanced = () => {
  const trustStats = [
    { icon: 'heroicons:users', value: '5,000+', label: 'Happy Customers' },
    { icon: 'heroicons:truck', value: '150+', label: 'Vehicles Available' },
    { icon: 'heroicons:star', value: '4.9', label: 'Customer Rating' },
    { icon: 'heroicons:clock', value: '24/7', label: 'Support' },
  ];

  const keyFeatures = [
    {
      icon: 'fluent:calendar-chat-24-regular',
      title: 'Easy Booking',
      desc: 'Fast and simple process',
    },
    { icon: 'heroicons:banknotes', title: 'Budget Friendly', desc: 'Affordable, premium service' },
    { icon: 'heroicons:hand-thumb-up', title: 'Clean Cars', desc: 'Always fresh, always clean' },
  ];

  return (
    <section
      className="bg-[url(https://dashboi-one.vercel.app/images/home/hero-bg.png)] bg-cover bg-no-repeat relative mb-10 lg:mb-0"
      id="home"
    >
      <div className="bg-gradient-to-b from-primary/30 to-[#fff] dark:from-primary/20 dark:to-[#0F172A]">
        <div className="container mx-auto min-h-[88vh]">
          <div className="grid lg:grid-cols-2 gap-8 items-center justify-center relative z-10">
            {/* Left Content - Enhanced */}
            <motion.div
              className="pt-32 md:pt-48 lg:pt-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Icon icon="heroicons:star" className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Trusted by 5,000+ customers
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      icon="heroicons:star"
                      className="w-3 h-3 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Title with Gradient */}
              <motion.h1
                className="text-3xl text-center lg:text-left md:text-4xl xl:text-6xl xl:leading-[1.1] font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="block text-default-900">ACCOMPANY YOUR</span>
                <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  JOURNEY WITH COMFORT
                </span>
              </motion.h1>

              {/* Improved Description */}
              <motion.p
                className="text-lg text-center lg:text-left leading-relaxed text-default-600 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Experience premium car rental services in the Philippines. Choose from our fleet of
                <span className="text-primary font-semibold"> reliable vehicles</span> and explore
                with confidence, comfort, and unbeatable value.
              </motion.p>

              {/* Key Features - Floating Cards */}
              <motion.div
                className="grid grid-cols-3 gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {keyFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="h-full"
                  >
                    <Card className="border border-primary/20 bg-background/80 backdrop-blur-sm hover:border-primary/40 transition-colors h-full">
                      <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Icon
                              icon={feature.icon}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                            />
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm text-default-900 mb-1 leading-tight">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-default-600 leading-tight flex-1 flex items-center">
                            {feature.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  asChild
                  size="xl"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/dashboard" className="flex items-center">
                    <Icon icon="heroicons:rocket-launch" className="w-5 h-5 mr-2" />
                    Get Started Today
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="border-primary/30 text-primary hover:bg-primary/5 shadow-md"
                >
                  <Link href="#" className="flex items-center">
                    <Icon icon="heroicons:eye" className="w-5 h-5 mr-2" />
                    Browse Vehicles
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Stats */}
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {trustStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center lg:text-left"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                      <Icon icon={stat.icon} className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">{stat.value}</span>
                    </div>
                    <p className="text-sm text-default-600">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Enhanced Car Section */}
            <motion.div
              className="relative lg:h-[800px] flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Floating Elements */}
              <motion.div
                className="absolute sm:top-32 top-0 sm:left-5 left-0 bg-white/90 backdrop-blur-sm rounded-2xl sm:p-4 p-2 shadow-xl border border-primary/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center sm:gap-2 gap-1">
                  <Icon icon="heroicons:gift" className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Promo</p>
                    <p className="text-xs text-default-600">Special offers</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute sm:bottom-32 bottom-[-40px] sm:right-5 right-0 bg-white/90 backdrop-blur-sm rounded-2xl sm:p-4 p-2 shadow-xl border border-primary/20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center sm:gap-2 gap-1">
                  <Icon icon="heroicons:receipt-percent" className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Discounts</p>
                    <p className="text-xs text-default-600">Great savings</p>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Background Shape */}
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
                      <stop stopColor="#7B5FCF" stopOpacity="0.7" />
                      <stop stopColor="#5D4E9A" stopOpacity="0.5" offset="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Enhanced Car Image */}
              <motion.div
                className="relative z-10 w-full max-w-[20rem] sm:max-w-2xl"
                initial={{ scale: 1.1 }}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  y: {
                    duration: 3,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatDelay: 0,
                  },
                  scale: {
                    duration: 0.6,
                    ease: 'easeOut',
                  },
                }}
                whileHover={{
                  scale: 1.3,
                  transition: { duration: 0.6, ease: 'easeOut' },
                }}
              >
                <Image
                  src={CarImage}
                  alt="Premium Car Rental Vehicle"
                  priority={true}
                  className="w-full h-auto drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroEnhanced;
