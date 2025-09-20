import { FleetVehicle } from '@/lib/firebase-fleet-service';

export type ViewMode = 'table' | 'grid';

export interface LoadingStates {
  fetchingVehicles: boolean;
  addingVehicle: boolean;
  updatingVehicle: string | null;
  deletingVehicles: string[];
}

export interface FleetViewProps {
  vehicles: FleetVehicle[];
  selectedVehicles: string[];
  onSelectVehicle: (vehicleId: string) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onUpdateVehicle: (vehicle: FleetVehicle) => void;
  loading: LoadingStates;
}

export interface FleetTableViewProps extends FleetViewProps {
  onSelectAll: () => void;
}

export interface FleetDialogProps {
  vehicle?: FleetVehicle;
  onUpdateVehicle?: (vehicle: FleetVehicle) => void;
  onAddVehicle?: (vehicle: Omit<FleetVehicle, 'id'>) => void;
  isLoading?: boolean;
}

export { type FleetVehicle } from '@/lib/firebase-fleet-service';
