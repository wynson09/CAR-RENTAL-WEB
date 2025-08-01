"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { carRentalServices } from "./data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ServiceButtons = () => {
  const [hoveredService, setHoveredService] = useState(null);

  return (
    <div className="relative">
      {/* Service Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {carRentalServices.map((service) => (
          <div
            key={service.id}
            className="relative"
            onMouseEnter={() => setHoveredService(service.id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "bg-background border-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-6 py-3 rounded-full font-semibold",
                "shadow-lg hover:shadow-xl transform hover:-translate-y-1",
                hoveredService === service.id && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <Icon icon={service.icon} className="w-5 h-5 mr-2" />
              {service.title}
            </Button>

            {/* Hover Card */}
            <AnimatePresence>
              {hoveredService === service.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-50"
                  style={{ minWidth: "400px" }}
                >
                  <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex rounded-lg overflow-hidden">
                        {/* Image Section */}
                        <div className="w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                              <Icon icon={service.icon} className="w-12 h-12 text-primary" />
                            </div>
                            <div className="text-primary font-semibold text-lg">
                              {service.title}
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-1/2 p-6">
                          <h3 className="font-bold text-lg text-default-900 mb-3">
                            {service.title}
                          </h3>
                          <p className="text-default-600 text-sm mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          
                          {/* Features */}
                          <div className="space-y-2">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center text-xs text-default-600">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                {feature}
                              </div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <Button 
                            size="sm" 
                            className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Explore {service.title}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow pointer */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-4 h-4 bg-background border-l-2 border-t-2 border-primary/20 transform rotate-45"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceButtons;