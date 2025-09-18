import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const Contact = () => {
  const contactMethods = [
    {
      icon: 'logos:facebook',
      title: 'Facebook Page',
      description: 'Connect with us on Facebook for updates, promotions, and customer support.',
      action: 'Visit Our Page',
      href: 'https://www.facebook.com/NacsCarRentalServices/', // Replace with your actual Facebook page
      color: 'bg-blue-500 hover:bg-blue-600',
      delay: 0.1,
    },
    {
      icon: 'heroicons:chat-bubble-left-right',
      title: 'Live Chat Support',
      description: 'Login to our website and use our real-time chat system for instant assistance.',
      action: 'Start Live Chat',
      href: '/dashboard', // This will redirect to your dashboard with chat
      color: 'bg-primary hover:bg-primary/80',
      delay: 0.2,
    },
    {
      icon: 'heroicons:phone',
      title: 'Call Us Directly',
      description: 'Speak with our team directly for bookings, inquiries, or emergency support.',
      action: 'View Phone Numbers',
      href: '#phone-numbers',
      color: 'bg-green-500 hover:bg-green-600',
      delay: 0.3,
    },
  ];

  const phoneNumbers = [
    {
      label: 'Main Office',
      number: '+63 997 821 9562',
      description: 'Business hours: 8:00 AM - 6:00 PM',
    },
    {
      label: '24/7 Emergency',
      number: '+63 919 452 2011',
      description: 'Available anytime for urgent assistance',
    },
    {
      label: 'Booking Hotline',
      number: '+63 997 821 9562',
      description: 'Dedicated line for reservations',
    },
  ];

  return (
    <section
      className="py-16 2xl:py-[120px] bg-gradient-to-br from-primary/5 to-secondary/5"
      id="contact"
    >
      <div className="container">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-default-900 mb-6">
            Get In Touch With Us
          </h2>
          <p className="text-lg text-default-600 max-w-3xl mx-auto leading-relaxed">
            Ready to book your next adventure? We're here to help! Choose the most convenient way to
            reach out to our friendly team.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: method.delay }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon icon={method.icon} className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-default-900 mb-3">{method.title}</h3>
                    <p className="text-default-600 leading-relaxed">{method.description}</p>
                  </div>
                  <Button asChild className={`w-full ${method.color} text-white border-0`}>
                    <Link
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : '_self'}
                    >
                      <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-2" />
                      {method.action}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Phone Numbers Section */}
        <motion.div
          id="phone-numbers"
          className="bg-white dark:bg-card rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <Icon icon="heroicons:phone" className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-default-900 mb-3">
              Call Us Anytime
            </h3>
            <p className="text-default-600">
              Our team is ready to assist you with any questions or booking needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phoneNumbers.map((phone, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <h4 className="font-semibold text-default-900 mb-2">{phone.label}</h4>
                <Link
                  href={`tel:${phone.number.replace(/\s/g, '')}`}
                  className="text-xl font-bold text-primary hover:text-primary/80 transition-colors duration-200 block mb-2"
                >
                  {phone.number}
                </Link>
                <p className="text-sm text-default-600">{phone.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
            <Icon icon="heroicons:clock" className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-default-900 mb-2">Response Times</h4>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-default-600">
              <div className="flex items-center gap-2">
                <Icon icon="logos:facebook" className="w-4 h-4" />
                <span>Facebook: Within 1-2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 text-primary" />
                <span>Live Chat: Instant response</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="heroicons:phone" className="w-4 h-4 text-green-500" />
                <span>Phone: Immediate assistance</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
