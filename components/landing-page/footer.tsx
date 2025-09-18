'use client';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { NCRLogo } from '@/components/ui/ncr-logo';

const Footer = () => {
  const services = [
    { name: 'Self Drive Rental', href: '#services' },
    { name: 'With Driver Rental', href: '#services' },
    { name: 'Van Rental', href: '#services' },
    { name: 'SUV Rental', href: '#services' },
    { name: 'MPV Rental', href: '#services' },
    { name: 'Leasing Services', href: '#services' },
  ];

  const quicklinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#whyNacsCarRental' },
    { name: 'Services', href: '#services' },
    { name: 'Fleet', href: '#fleet' },
    { name: 'Contact Us', href: '#contact' },
    { name: 'FAQ', href: '#faq' },
  ];

  const socialLinks = [
    {
      icon: 'ri:whatsapp-fill',
      href: 'https://wa.me/639978219562',
      color: 'hover:text-green-400',
    },
    {
      icon: 'ri:facebook-fill',
      href: 'https://www.facebook.com/NacsCarRentalServices/',
      color: 'hover:text-blue-400',
    },
    {
      icon: 'ri:instagram-fill',
      href: 'https://instagram.com/nacscarrental',
      color: 'hover:text-pink-400',
    },
    {
      icon: 'ri:linkedin-fill',
      href: 'https://linkedin.com/company/nacscarrental',
      color: 'hover:text-blue-500',
    },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <NCRLogo className="h-12 w-auto mb-4" />
              </Link>
              <h3 className="text-xl font-bold text-primary mb-2">NACS CAR RENTAL</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              NACS Car Rental – Pagadian City’s newest and fastest-growing car rental service. We
              provide short & long-term rentals, chauffeured rides, and corporate leasing —
              delivering reliable, affordable, and hassle-free transportation for every need.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  className={`text-gray-400 ${social.color} transition-colors duration-200`}
                >
                  <Icon icon={social.icon} className="w-6 h-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200 hover:underline"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quicklinks Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quicklinks</h4>
            <ul className="space-y-3">
              {quicklinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact</h4>
            <div className="space-y-4">
              {/* Business Hours */}
              <div className="flex items-start space-x-3">
                <Icon
                  icon="heroicons:calendar-days"
                  className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-300 font-medium">Monday - Saturday</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start space-x-3">
                <Icon icon="heroicons:clock" className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">08:00 AM - 5:00 PM</p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="heroicons:phone"
                    className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  />
                  <div>
                    <Link
                      href="tel:+639978219562"
                      className="text-gray-300 hover:text-primary transition-colors duration-200"
                    >
                      +63 997 821 9562
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Icon
                    icon="heroicons:phone"
                    className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  />
                  <div>
                    <Link
                      href="tel:+639194522011"
                      className="text-gray-300 hover:text-primary transition-colors duration-200"
                    >
                      +63 919 452 2011
                    </Link>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <Icon
                  icon="heroicons:map-pin"
                  className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-300">Pagadian City, Zamboanga del Sur, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              Copyright © 2024 NACS Car Rental Services. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-primary text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-primary text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
