'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { carRentalServices } from './data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const ServiceButtonsPremium = () => {
  const [hoveredService, setHoveredService] = useState<string>(carRentalServices[0].id);

  // Get the current service to display (hovered or default)
  const currentService =
    carRentalServices.find((service) => service.id === hoveredService) || carRentalServices[0];

  return (
    <div className="relative">
      {/* Service Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
        {carRentalServices.map((service) => (
          <div
            key={service.id}
            className="relative group"
            onMouseEnter={() => setHoveredService(service.id)}
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-xl p-4 text-center cursor-pointer transition-all duration-500',
                'bg-gradient-to-br from-background to-background/50 border-2 border-primary/20',
                'hover:border-primary hover:shadow-lg hover:shadow-primary/20',
                'group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-primary/10',
                hoveredService === service.id &&
                  'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
              )}
            >
              {/* Main Icon */}
              <div
                className={cn(
                  'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300',
                  'bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20',
                  'group-hover:from-primary/20 group-hover:to-primary/30 group-hover:border-primary/40'
                )}
              >
                <Icon
                  icon={service.icon}
                  className={cn(
                    'w-6 h-6 text-primary transition-all duration-300',
                    'group-hover:scale-110'
                  )}
                />
              </div>

              {/* Title */}
              <h3
                className={cn(
                  'font-bold text-xs text-default-900 transition-colors duration-300',
                  'group-hover:text-primary'
                )}
              >
                {service.title}
              </h3>

              {/* Hover Indicator */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60 transform scale-x-0 transition-transform duration-300',
                  'group-hover:scale-x-100'
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Display Area - Image Left, Content Right */}
      <Card className="border-2 border-primary/20 shadow-xl bg-background overflow-hidden max-w-7xl mx-auto">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Image Section - Left */}
            <div className="w-full lg:w-2/5 relative overflow-hidden lg:min-h-[400px] bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={currentService.image}
                    alt={`${currentService.title} Service`}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    quality={100}
                    priority={true}
                    unoptimized={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content Section - Right */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-3xl lg:text-4xl font-bold text-default-900">
                      {currentService.title}
                    </h2>
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-2"></div>
                  </div>

                  <p className="text-default-600 text-lg leading-relaxed mb-8">
                    {currentService.description}
                  </p>

                  {/* Features List - 2 Columns */}
                  <div className="mb-8">
                    <div className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-6">
                      Key Features & Benefits
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentService.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center text-default-700"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <Icon icon="heroicons:check" className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-base">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                    >
                      <Icon icon="heroicons:sparkles" className="w-5 h-5 mr-2" />
                      Book {currentService.title} Now
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/5 px-8 text-blue-600 hover:text-blue-600"
                    >
                      <Icon icon="heroicons:information-circle" className="w-5 h-5 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceButtonsPremium;
