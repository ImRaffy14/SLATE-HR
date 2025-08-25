import { Button } from '@/components/ui/button';
import { PaginationControlsProps } from '@/types';

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  previousLabel = "Previous",
  nextLabel = "Next",
}: PaginationControlsProps) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="text-sm text-gray-500 mr-2">
        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
      </div>
      <div className="space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {previousLabel}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;