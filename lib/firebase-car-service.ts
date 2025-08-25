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
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CarListing } from '@/data/car-listings-data';

// Collection name in Firestore
const CARS_COLLECTION = 'car-listings';

// Firebase document interface
interface CarDocument extends Omit<CarListing, 'id' | 'createdDate' | 'updatedDate'> {
  createdDate: Timestamp;
  updatedDate: Timestamp;
}

// Convert Firestore document to CarListing
const convertFirestoreDocToCarListing = (doc: any): CarListing => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdDate: data.createdDate?.toDate() || new Date(),
    updatedDate: data.updatedDate?.toDate() || new Date(),
  };
};

// Convert CarListing to Firestore document
const convertCarListingToFirestoreDoc = (
  car: Omit<CarListing, 'id'>
): Omit<CarDocument, 'createdDate' | 'updatedDate'> & {
  createdDate?: FieldValue | Timestamp;
  updatedDate: FieldValue;
} => {
  return {
    ...car,
    createdDate: car.createdDate ? Timestamp.fromDate(car.createdDate) : serverTimestamp(),
    updatedDate: serverTimestamp(),
  };
};

export class CarFirebaseService {
  // Get all cars
  static async getAllCars(): Promise<CarListing[]> {
    try {
      const q = query(collection(db, CARS_COLLECTION), orderBy('createdDate', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(convertFirestoreDocToCarListing);
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw new Error('Failed to fetch cars from database');
    }
  }

  // Get a single car by ID
  static async getCarById(id: string): Promise<CarListing | null> {
    try {
      const docRef = doc(db, CARS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreDocToCarListing(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching car:', error);
      throw new Error('Failed to fetch car from database');
    }
  }

  // Add a new car
  static async addCar(car: Omit<CarListing, 'id'>): Promise<string> {
    try {
      const carDoc = convertCarListingToFirestoreDoc(car);
      const docRef = await addDoc(collection(db, CARS_COLLECTION), carDoc);

      console.log('Car added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding car:', error);
      throw new Error('Failed to add car to database');
    }
  }

  // Update an existing car
  static async updateCar(
    id: string,
    updates: Partial<Omit<CarListing, 'id' | 'createdDate'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, CARS_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedDate: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);
      console.log('Car updated successfully');
    } catch (error) {
      console.error('Error updating car:', error);
      throw new Error('Failed to update car in database');
    }
  }

  // Delete a car
  static async deleteCar(id: string): Promise<void> {
    try {
      const docRef = doc(db, CARS_COLLECTION, id);
      await deleteDoc(docRef);

      console.log('Car deleted successfully');
    } catch (error) {
      console.error('Error deleting car:', error);
      throw new Error('Failed to delete car from database');
    }
  }

  // Delete multiple cars
  static async deleteCars(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map((id) => this.deleteCar(id));
      await Promise.all(deletePromises);

      console.log(`${ids.length} cars deleted successfully`);
    } catch (error) {
      console.error('Error deleting cars:', error);
      throw new Error('Failed to delete cars from database');
    }
  }

  // Search cars by name or category
  static async searchCars(searchTerm: string): Promise<CarListing[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation - for production, consider using Algolia or similar
      const cars = await this.getAllCars();

      return cars.filter(
        (car) =>
          car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching cars:', error);
      throw new Error('Failed to search cars');
    }
  }

  // Get cars by category
  static async getCarsByCategory(category: string): Promise<CarListing[]> {
    try {
      const cars = await this.getAllCars();

      if (category === 'All') {
        return cars;
      }

      return cars.filter((car) => car.category === category);
    } catch (error) {
      console.error('Error fetching cars by category:', error);
      throw new Error('Failed to fetch cars by category');
    }
  }

  // Get promotional cars
  static async getPromotionalCars(): Promise<CarListing[]> {
    try {
      const cars = await this.getAllCars();
      return cars.filter((car) => car.isPromo);
    } catch (error) {
      console.error('Error fetching promotional cars:', error);
      throw new Error('Failed to fetch promotional cars');
    }
  }
}
