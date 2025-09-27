'use client';

import { useState, useCallback } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { toast } from 'sonner';

interface ValidationData {
  destination: string;
  pickUpAddress: string;
  pickupPagadianDetails: string;
  pickupTime: string;
  returnAddress: string;
  returnPagadianDetails: string;
  returnTime: string;
  pickupDate: Date;
  returnDate: Date;
  userUid?: string;
}

export const useBookingValidation = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const hasFieldError = useCallback(
    (fieldName: string) => {
      return validationErrors.includes(fieldName);
    },
    [validationErrors]
  );

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors((prev) => prev.filter((error) => error !== fieldName));
  }, []);

  const validateBookingForm = useCallback((data: ValidationData): boolean => {
    const fieldErrors: string[] = [];
    const messages: string[] = [];

    // Destination validation
    if (!data.destination.trim()) {
      fieldErrors.push('destination');
      messages.push('Destination is required');
    }

    // Pickup address validation
    if (!data.pickUpAddress) {
      fieldErrors.push('pickUpAddress');
      messages.push('Pickup address is required');
    }

    // Pagadian area details validation for pickup
    if (data.pickUpAddress === 'pagadian-area' && !data.pickupPagadianDetails.trim()) {
      fieldErrors.push('pickupPagadianDetails');
      messages.push('Please specify the pickup location within Pagadian area');
    }

    // Pickup time validation
    if (!data.pickupTime) {
      fieldErrors.push('pickupTime');
      messages.push('Pickup time is required');
    }

    // Return address validation
    if (!data.returnAddress) {
      fieldErrors.push('returnAddress');
      messages.push('Return address is required');
    }

    // Pagadian area details validation for return
    if (data.returnAddress === 'pagadian-area' && !data.returnPagadianDetails.trim()) {
      fieldErrors.push('returnPagadianDetails');
      messages.push('Please specify the return location within Pagadian area');
    }

    // Return time validation
    if (!data.returnTime) {
      fieldErrors.push('returnTime');
      messages.push('Return time is required');
    }

    // User authentication validation
    if (!data.userUid) {
      messages.push('Please sign in to make a booking');
    }

    // Date validation
    if (differenceInCalendarDays(data.returnDate, data.pickupDate) < 1) {
      messages.push('Return date must be at least 1 day after pickup date');
    }

    // Handle validation results
    if (messages.length > 0) {
      setValidationErrors(fieldErrors);
      messages.forEach((message) => toast.error(message));

      // Scroll to first missing field
      if (fieldErrors.length > 0) {
        scrollToFirstError(fieldErrors[0]);
      }

      return false;
    }

    // Clear validation errors if all fields are valid
    setValidationErrors([]);
    return true;
  }, []);

  const scrollToFirstError = useCallback((fieldName: string) => {
    // Map field names to their element IDs or selectors
    const fieldSelectors: Record<string, string> = {
      destination: '#destination',
      pickUpAddress: '[data-field="pickUpAddress"]',
      pickupPagadianDetails: '[data-field="pickupPagadianDetails"]',
      pickupTime: '[data-field="pickupTime"]',
      returnAddress: '[data-field="returnAddress"]',
      returnPagadianDetails: '[data-field="returnPagadianDetails"]',
      returnTime: '[data-field="returnTime"]',
    };

    const selector = fieldSelectors[fieldName];
    if (selector) {
      // Use setTimeout to ensure the error state is rendered first
      setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }, 100);
    }
  }, []);

  return {
    validationErrors,
    hasFieldError,
    clearFieldError,
    validateBookingForm,
  };
};
