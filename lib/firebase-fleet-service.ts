import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  limit,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collection name in Firestore
const FLEET_COLLECTION = 'fleet-inventory';

// Fleet vehicle interface based on the provided schema
export interface FleetVehicle {
  // Document Metadata
  id: string; // Auto-generated document ID
  createdAt: Date; // When record was created
  updatedAt: Date; // Last modification time

  // Owner Information
  ownerUuid: string; // Unique identifier for owner
  ownerName: string; // Owner's full name or company name
  ownerType: 'nacs' | 'partner'; // Whether owned by NACS or partner

  // Car Basic Information
  carDetails: {
    make: string; // Toyota, Honda, etc.
    model: string; // Innova, Navara, etc.
    year: number; // Manufacturing year
    color: string; // Car color
    plateNumber: string; // License plate (unique)
    image?: string; // Car image URL (optional)
  };

  // Car Specifications (from existing car listings)
  specifications: {
    category: string; // SUV, Sedan, MPV, Van, Pickup, Hatchback
    passengers: string; // "5 Seaters", "7 Seaters"
    bags: string; // "5 Luggages", "3 Luggages"
    transmission: string; // "Automatic", "Manual"
    fuelType: string; // "Gasoline", "Diesel", "Hybrid"
    engineSize?: string; // "2.5L", "1.8L"
    features: string[]; // ["Air Conditioning", "GPS", "Bluetooth"]
  };

  // Pricing & Availability
  pricing: {
    dailyRate: number; // Base daily rental rate
    monthlyRate?: number; // Monthly rate (if different)
    currency: string; // "PHP"
  };

  // Operational Status
  status: {
    availability: 'available' | 'rented' | 'reserved' | 'maintenance' | 'retired';
    condition: 'excellent' | 'good' | 'fair' | 'needs_repair'; // Current condition
    notes?: string; // Any special notes
  };

  // Partnership Details (for partner cars)
  partnershipInfo?: {
    contractStartDate: Date; // Partnership start date
    contractEndDate?: Date; // Partnership end date (if applicable)
    paymentTerms: string; // "monthly", "per_booking", etc.
    contractDocument?: string; // URL to contract document
  };
}

// Firebase document interface
interface FleetDocument
  extends Omit<FleetVehicle, 'id' | 'createdAt' | 'updatedAt' | 'partnershipInfo'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  partnershipInfo?: {
    contractStartDate: Timestamp;
    contractEndDate?: Timestamp;
    paymentTerms: string;
    contractDocument?: string;
  };
}

// Convert Firestore document to FleetVehicle
const convertFirestoreDocToFleetVehicle = (doc: any): FleetVehicle => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    partnershipInfo: data.partnershipInfo
      ? {
          ...data.partnershipInfo,
          contractStartDate: data.partnershipInfo.contractStartDate?.toDate() || new Date(),
          contractEndDate: data.partnershipInfo.contractEndDate?.toDate() || undefined,
        }
      : undefined,
  };
};

// Convert FleetVehicle to Firestore document
const convertFleetVehicleToFirestoreDoc = (
  vehicle: Omit<FleetVehicle, 'id'>
): Omit<FleetDocument, 'createdAt' | 'updatedAt'> & {
  createdAt?: FieldValue | Timestamp;
  updatedAt: FieldValue;
} => {
  return {
    ...vehicle,
    createdAt: vehicle.createdAt ? Timestamp.fromDate(vehicle.createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
    partnershipInfo: vehicle.partnershipInfo
      ? {
          ...vehicle.partnershipInfo,
          contractStartDate: Timestamp.fromDate(vehicle.partnershipInfo.contractStartDate),
          contractEndDate: vehicle.partnershipInfo.contractEndDate
            ? Timestamp.fromDate(vehicle.partnershipInfo.contractEndDate)
            : undefined,
        }
      : undefined,
  };
};

export class FleetFirebaseService {
  // Get all fleet vehicles ordered by creation date (newest first)
  static async getAllVehicles(): Promise<FleetVehicle[]> {
    try {
      const q = query(collection(db, FLEET_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToFleetVehicle);
    } catch (error) {
      console.error('Error fetching fleet vehicles:', error);
      throw new Error('Failed to fetch fleet vehicles from database');
    }
  }

  // Get a single vehicle by ID
  static async getVehicleById(id: string): Promise<FleetVehicle | null> {
    try {
      const docRef = doc(db, FLEET_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreDocToFleetVehicle(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw new Error('Failed to fetch vehicle from database');
    }
  }

  // Add a new vehicle
  static async addVehicle(vehicle: Omit<FleetVehicle, 'id'>): Promise<string> {
    try {
      const vehicleDoc = convertFleetVehicleToFirestoreDoc(vehicle);
      const docRef = await addDoc(collection(db, FLEET_COLLECTION), vehicleDoc);

      console.log('Vehicle added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw new Error('Failed to add vehicle to database');
    }
  }

  // Update an existing vehicle
  static async updateVehicle(
    id: string,
    updates: Partial<Omit<FleetVehicle, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, FLEET_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Handle partnershipInfo updates
      if (updates.partnershipInfo) {
        (updateData as any).partnershipInfo = {
          ...updates.partnershipInfo,
          contractStartDate: updates.partnershipInfo.contractStartDate
            ? Timestamp.fromDate(updates.partnershipInfo.contractStartDate)
            : undefined,
          contractEndDate: updates.partnershipInfo.contractEndDate
            ? Timestamp.fromDate(updates.partnershipInfo.contractEndDate)
            : undefined,
        };
      }

      await updateDoc(docRef, updateData);
      console.log('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle in database');
    }
  }

  // Delete a vehicle
  static async deleteVehicle(id: string): Promise<void> {
    try {
      const docRef = doc(db, FLEET_COLLECTION, id);
      await deleteDoc(docRef);

      console.log('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle from database');
    }
  }

  // Delete multiple vehicles
  static async deleteVehicles(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map((id) => this.deleteVehicle(id));
      await Promise.all(deletePromises);

      console.log(`${ids.length} vehicles deleted successfully`);
    } catch (error) {
      console.error('Error deleting vehicles:', error);
      throw new Error('Failed to delete vehicles from database');
    }
  }

  // Search vehicles by make, model, or plate number
  static async searchVehicles(searchTerm: string): Promise<FleetVehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();

      return vehicles.filter(
        (vehicle) =>
          vehicle.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.carDetails.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw new Error('Failed to search vehicles');
    }
  }

  // Get vehicles by owner type
  static async getVehiclesByOwnerType(
    ownerType: 'nacs' | 'partner' | 'all'
  ): Promise<FleetVehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();

      if (ownerType === 'all') {
        return vehicles;
      }

      return vehicles.filter((vehicle) => vehicle.ownerType === ownerType);
    } catch (error) {
      console.error('Error fetching vehicles by owner type:', error);
      throw new Error('Failed to fetch vehicles by owner type');
    }
  }

  // Get vehicles by availability status
  static async getVehiclesByStatus(
    status: FleetVehicle['status']['availability'] | 'all'
  ): Promise<FleetVehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();

      if (status === 'all') {
        return vehicles;
      }

      return vehicles.filter((vehicle) => vehicle.status.availability === status);
    } catch (error) {
      console.error('Error fetching vehicles by status:', error);
      throw new Error('Failed to fetch vehicles by status');
    }
  }

  // Get vehicles by category
  static async getVehiclesByCategory(category: string): Promise<FleetVehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();

      if (category === 'All') {
        return vehicles;
      }

      return vehicles.filter((vehicle) => vehicle.specifications.category === category);
    } catch (error) {
      console.error('Error fetching vehicles by category:', error);
      throw new Error('Failed to fetch vehicles by category');
    }
  }

  // Listen to vehicles changes
  static listenToVehiclesSince(
    lastUpdated: Timestamp | null,
    callback: (vehicles: FleetVehicle[]) => void,
    errorCallback: (error: any) => void
  ): () => void {
    try {
      let q;
      if (lastUpdated) {
        q = query(
          collection(db, FLEET_COLLECTION),
          where('updatedAt', '>', lastUpdated),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(collection(db, FLEET_COLLECTION), orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const vehicles = snapshot.docs.map(convertFirestoreDocToFleetVehicle);
          callback(vehicles);
        },
        errorCallback
      );

      return unsubscribe;
    } catch (error) {
      console.error('Setup vehicles listener error:', error);
      errorCallback(error);
      return () => {};
    }
  }
}
