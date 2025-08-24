import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collection name in Firestore
const BOOKINGS_COLLECTION = 'bookings';

// Booking interfaces based on user requirements
export interface ExtraCharge {
  label: string;
  type: string;
  amount: number;
}

export interface Discount {
  label: string;
  type: string;
  percent: number;
  amount: number;
  applied: boolean;
}

export interface SelectedVehicle {
  vehicleUrl: string; // Car image URL for better vehicle identification
  name: string;
  basePrice: number;
  pricePerDay: number;
  totalDuration: number;
  extraCharges: ExtraCharge[];
  discounts: Discount[];
  totalAmount: number;
}

export interface AssignedDriver {
  driverId: string;
  name: string;
  contact: string;
}

export interface AssignedVehicle {
  vehicleId: string;
  plateNumber: string;
  name: string;
  driverAssigned?: AssignedDriver;
}

export interface Payment {
  totalAmount: number;
  paid: number;
  balance: number;
  status: 'unpaid' | 'partial' | 'paid' | 'refunded';
}

export interface Extension {
  previousReturnDate: string;
  newReturnDate: string;
  additionalDays: number;
  additionalAmount: number;
  extendedAt: any; // Firestore timestamp
}

export interface BookingData {
  renterId: string;
  driveOption: 'self-drive' | 'with-driver';
  driverPerDay?: number; // Only present for 'with-driver' bookings
  destination: string;
  pickUpAddress: string;
  pickUpDate: string;
  pickUpTime: string;
  returnAddress: string;
  returnDate: string;
  returnTime: string;
  selectedVehicles: SelectedVehicle;
  payment?: Payment; // Payment tracking information
  extensions?: Extension[]; // Array of booking extensions
  status: 'processing' | 'reserved' | 'cancelled' | 'completed' | 'ongoing' | 'refunded';
  assignedVehicle?: AssignedVehicle;
  createdAt?: any;
  updatedAt?: any;
}

// Firebase document interface
interface BookingDocument extends Omit<BookingData, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Convert Firestore document to BookingData
const convertFirestoreDocToBooking = (doc: any): BookingData => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

export class BookingFirebaseService {
  // Test Firebase connection and permissions
  static async testConnection(): Promise<boolean> {
    try {
      // Try to create a test document
      const testDoc = {
        test: true,
        timestamp: serverTimestamp(),
      };
      
      console.log('Testing Firebase connection...');
      const docRef = await addDoc(collection(db, 'test-connection'), testDoc);
      console.log('Test document created with ID:', docRef.id);
      
      // Clean up test document
      await deleteDoc(doc(db, 'test-connection', docRef.id));
      console.log('Test document deleted successfully');
      
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }

  // Create a new booking
  static async createBooking(bookingData: Omit<BookingData, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const bookingDoc = {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingDoc);
      console.log('Booking created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking in database');
    }
  }

  // Get all bookings for a user
  static async getUserBookings(userId: string): Promise<BookingData[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('renterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToBooking);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch user bookings from database');
    }
  }

  // Get a single booking by ID
  static async getBookingById(bookingId: string): Promise<BookingData | null> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreDocToBooking(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking from database');
    }
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    status: BookingData['status'],
    assignedVehicle?: AssignedVehicle
  ): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (assignedVehicle) {
        updateData.assignedVehicle = assignedVehicle;
      }

      await updateDoc(docRef, updateData);
      console.log('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status in database');
    }
  }

  // Get active bookings for a user
  static async getActiveBookings(userId: string): Promise<BookingData[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('renterId', '==', userId),
        where('status', 'in', ['processing', 'reserved', 'ongoing']),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToBooking);
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      throw new Error('Failed to fetch active bookings from database');
    }
  }

  // Delete a booking
  static async deleteBooking(bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await deleteDoc(docRef);
      console.log('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking from database');
    }
  }

  // Get all bookings (admin function)
  static async getAllBookings(): Promise<BookingData[]> {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToBooking);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw new Error('Failed to fetch all bookings from database');
    }
  }

  // Get bookings by status (admin function)
  static async getBookingsByStatus(status: BookingData['status']): Promise<BookingData[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToBooking);
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw new Error('Failed to fetch bookings by status from database');
    }
  }

  // Update payment information
  static async updatePayment(bookingId: string, payment: Payment): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await updateDoc(docRef, {
        payment,
        updatedAt: serverTimestamp(),
      });
      console.log('Payment information updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment information in database');
    }
  }

  // Add booking extension
  static async addExtension(
    bookingId: string, 
    extension: Omit<Extension, 'extendedAt'>,
    newReturnDate: string,
    newReturnTime: string
  ): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const bookingDoc = await getDoc(docRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const currentData = bookingDoc.data();
      const extensionWithTimestamp = {
        ...extension,
        extendedAt: serverTimestamp(),
      };

      const currentExtensions = currentData.extensions || [];
      const updatedExtensions = [...currentExtensions, extensionWithTimestamp];

      await updateDoc(docRef, {
        extensions: updatedExtensions,
        returnDate: newReturnDate,
        returnTime: newReturnTime,
        updatedAt: serverTimestamp(),
      });
      
      console.log('Booking extension added successfully');
    } catch (error) {
      console.error('Error adding booking extension:', error);
      throw new Error('Failed to add booking extension in database');
    }
  }

  // Get booking extensions
  static async getBookingExtensions(bookingId: string): Promise<Extension[]> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.extensions || [];
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.error('Error fetching booking extensions:', error);
      throw new Error('Failed to fetch booking extensions from database');
    }
  }

  // Update booking totals after extension
  static async updateBookingTotals(
    bookingId: string,
    newTotalAmount: number,
    updatedVehicleData?: Partial<SelectedVehicle>
  ): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const bookingDoc = await getDoc(docRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const currentData = bookingDoc.data();
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Update vehicle data if provided
      if (updatedVehicleData) {
        updateData.selectedVehicles = {
          ...currentData.selectedVehicles,
          ...updatedVehicleData,
        };
      }

      // Update payment totals if payment exists
      if (currentData.payment) {
        const currentPayment = currentData.payment;
        updateData.payment = {
          ...currentPayment,
          totalAmount: newTotalAmount,
          balance: newTotalAmount - currentPayment.paid,
        };
      }

      await updateDoc(docRef, updateData);
      console.log('Booking totals updated successfully');
    } catch (error) {
      console.error('Error updating booking totals:', error);
      throw new Error('Failed to update booking totals in database');
    }
  }
}