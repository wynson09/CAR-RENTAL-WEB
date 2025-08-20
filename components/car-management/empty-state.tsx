import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface EmptyStateProps {
  searchTerm: string;
  selectedCategory: string;
  onClearFilters: () => void;
  onAddCar?: () => void;
}

export const EmptyState = ({ 
  searchTerm, 
  selectedCategory, 
  onClearFilters,
  onAddCar
}: EmptyStateProps) => {
  const hasFilters = searchTerm || selectedCategory !== "All";
  
  return (
    <div className="p-12 text-center">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon icon="heroicons:car" className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl font-semibold">
          {hasFilters ? "No cars found" : "No cars added yet"}
        </h3>
        <p className="text-muted-foreground">
          {hasFilters 
            ? "Try adjusting your search criteria or filters to find cars."
            : "Get started by adding your first car to the inventory."
          }
        </p>
      </div>
      <div className="flex gap-2 justify-center mt-6">
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
        <Button onClick={onAddCar}>
          <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
          Add First Car
        </Button>
      </div>
    </div>
  );
};
