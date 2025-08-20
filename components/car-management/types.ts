import { CarListing } from "@/data/car-listings-data";

export type ViewMode = "table" | "grid";

export interface LoadingStates {
  fetchingCars: boolean;
  addingCar: boolean;
  updatingCar: string | null;
  deletingCars: string[];
}

export interface CarViewProps {
  cars: CarListing[];
  selectedCars: string[];
  onSelectCar: (carId: string) => void;
  onDeleteCar: (carId: string) => void;
  onUpdateCar: (car: CarListing) => void;
  loading: LoadingStates;
}

export interface CarTableViewProps extends CarViewProps {
  onSelectAll: () => void;
}

export interface CarDialogProps {
  car?: CarListing;
  onUpdateCar?: (car: CarListing) => void;
  onAddCar?: (car: Omit<CarListing, 'id'>) => void;
  isLoading?: boolean;
}

export { type CarListing } from "@/data/car-listings-data";
