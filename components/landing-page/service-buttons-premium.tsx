"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { carRentalServices } from "./data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ServiceButtonsPremium = () => {
  const [hoveredService, setHoveredService] = useState<string>(carRentalServices[0].id);

  // Get the current service to display (hovered or default)
  const currentService = carRentalServices.find(service => service.id === hoveredService) || carRentalServices[0];

  return (
    <div className="relative">
      {/* Service Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {carRentalServices.map((service) => (
          <div
            key={service.id}
            className="relative group"
            onMouseEnter={() => setHoveredService(service.id)}
            onMouseLeave={() => setHoveredService(carRentalServices[0].id)}
          >
            <div className={cn(
              "relative overflow-hidden rounded-2xl p-6 text-center cursor-pointer transition-all duration-500",
              "bg-gradient-to-br from-background to-background/50 border-2 border-primary/20",
              "hover:border-primary hover:shadow-2xl hover:shadow-primary/20",
              "group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-primary/10",
              hoveredService === service.id && "border-primary bg-gradient-to-br from-primary/10 to-primary/5"
            )}>
              {/* Main Icon */}
              <div className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20",
                "group-hover:from-primary/20 group-hover:to-primary/30 group-hover:border-primary/40"
              )}>
                <Icon 
                  icon={service.icon} 
                  className={cn(
                    "w-8 h-8 text-primary transition-all duration-300",
                    "group-hover:scale-110"
                  )} 
                />
              </div>

              {/* Title */}
              <h3 className={cn(
                "font-bold text-sm text-default-900 transition-colors duration-300",
                "group-hover:text-primary"
              )}>
                {service.title}
              </h3>

              {/* Hover Indicator */}
              <div className={cn(
                "absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60 transform scale-x-0 transition-transform duration-300",
                "group-hover:scale-x-100"
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* Display Area - Image Left, Content Right */}
      <Card className="border-2 border-primary/20 shadow-xl bg-background overflow-hidden max-w-6xl">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Image Section - Left */}
            <div className="w-full lg:w-2/5 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden min-h-[300px] lg:min-h-[400px]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentService.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 h-full flex flex-col items-center justify-center p-8"
                >
                  {/* Large Service Icon */}
                  <motion.div 
                    className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon icon={currentService.icon} className="w-16 h-16 text-primary" />
                  </motion.div>
                  
                  <div className="text-center">
                    <h3 className="text-primary font-bold text-2xl lg:text-3xl mb-2">
                      {currentService.title}
                    </h3>
                    <div className="text-primary/70 text-sm font-medium">
                      Premium Car Rental Service
                    </div>
                  </div>
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
                  
                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-4">
                      Key Features & Benefits
                    </div>
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
                      className="border-primary/30 text-primary hover:bg-primary/5 px-8"
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