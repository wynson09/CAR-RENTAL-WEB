import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
// React Icons
import {
  FaUsers,
  FaTag,
  FaCar,
  FaTruck,
  FaRoute,
  FaCreditCard,
  FaHeadset,
  FaMousePointer,
  FaClock,
  FaWrench,
  FaPercent,
  FaTrophy,
} from 'react-icons/fa';
const AboutDashtail = () => {
  const data = [
    {
      id: 1,
      title: 'Outstanding Service',
      desc: 'Dedicated to providing safe, comfortable, and hassle-free travel experiences.',
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 2,
      title: 'Dynamic Pricing',
      desc: 'Enjoy affordable adventures with our dynamic, early-booking savings.',
      icon: FaTag,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 3,
      title: 'Quality Vehicles',
      desc: 'Only the best quality vehicle brands on our fleet.',
      icon: FaCar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 4,
      title: 'Door-to-Door Service',
      desc: 'Convenient pick-up and drop-off at your preferred location.',
      icon: FaTruck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 5,
      title: 'Unlimited Mileage',
      desc: 'Unlock the road with Unlimited Mileage.',
      icon: FaRoute,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      featured: true,
    },
    {
      id: 6,
      title: 'Multiple Payment Options',
      desc: 'Cash, Credit Card, and Money Transfer',
      icon: FaCreditCard,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      id: 7,
      title: '24/7 Customer Support',
      desc: 'Round-the-clock assistance for all your travel needs and emergencies.',
      icon: FaHeadset,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      id: 8,
      title: 'Easy Booking Process',
      desc: 'Quick and hassle-free online reservation system with instant confirmation.',
      icon: FaMousePointer,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      id: 9,
      title: 'Flexible Rental Terms',
      desc: 'Short-term and long-term rental options to suit your travel plans.',
      icon: FaClock,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
    {
      id: 10,
      title: 'Well Maintained Fleet',
      desc: 'Regular vehicle maintenance and safety inspections to ensure optimal performance and reliability.',
      icon: FaWrench,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 11,
      title: 'Exclusive Discounts',
      desc: 'Enjoy special deals and promotions for loyal customers and early bookings.',
      icon: FaPercent,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 12,
      title: 'Trusted by Thousands',
      desc: 'Join thousands of satisfied customers who trust us for their transportation needs throughout the Philippines.',
      icon: FaTrophy,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
  ];
  return (
    <section
      className="py-16 2xl:py-[120px] bg-gradient-to-br from-background to-background/50"
      id="whyNacsCarRental"
    >
      <div className="container">
        {/* Header Section */}
        <motion.div
          className="max-w-[670px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-center text-2xl xl:text-4xl xl:leading-[52px] font-bold text-default-900 mb-4">
            Why choose{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Nacs Car Rental
            </span>
          </h2>
          <p className="text-lg xl:leading-8 text-center text-default-600 max-w-2xl mx-auto">
            At Nacs Car Rental, we don't just rent cars — we deliver peace of mind, comfort, and
            value every time you travel.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mt-16 lg:mt-20">
          {data.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={`about-feature-${item.id}`}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10',
                  item.featured
                    ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary'
                    : `${item.borderColor} ${item.bgColor} hover:border-primary/50`,
                  'hover:-translate-y-1'
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Feature Badge for Featured Item */}
                {item.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 lg:p-8 text-center">
                  {/* Icon Container */}
                  <div className="mx-auto mb-6 w-16 h-16 lg:w-20 lg:h-20 relative">
                    <div
                      className={cn(
                        'w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110',
                        `bg-gradient-to-br ${item.color} shadow-lg`
                      )}
                    >
                      <IconComponent className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    {/* Glow Effect */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300',
                        `bg-gradient-to-br ${item.color} blur-xl scale-110`
                      )}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg lg:text-xl font-bold text-default-900 mb-3 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-full px-6 py-3">
            <FaTrophy className="w-5 h-5 text-primary mr-3" />
            <span className="text-primary font-semibold">Join 1,000+ satisfied customers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutDashtail;
