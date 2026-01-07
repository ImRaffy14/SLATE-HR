import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface EmployeePerformanceRatingFormProps {
  onSubmit: (data: {
    employeePerformanceRating: number;
    employeeImprovementComments?: string;
  }) => void;
  initialData?: {
    employeePerformanceRating?: number;
    employeeImprovementComments?: string;
  };
  employeeName: string;
}

export function EmployeePerformanceRatingForm({ 
  onSubmit, 
  initialData,
  employeeName 
}: EmployeePerformanceRatingFormProps) {
  const [performanceRating, setPerformanceRating] = useState(initialData?.employeePerformanceRating || 0);
  const [improvementComments, setImprovementComments] = useState(initialData?.employeeImprovementComments || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (performanceRating === 0) {
      alert("Please select a performance rating");
      return;
    }
    onSubmit({
      employeePerformanceRating: performanceRating,
      employeeImprovementComments: improvementComments || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Employee Performance Rating *</Label>
        <p className="text-sm text-gray-600">Rate {employeeName}'s performance and improvement during this training</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPerformanceRating(star)}
              className="focus:outline-none"
            >
              <Star
                size={28}
                className={
                  star <= performanceRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400 hover:text-yellow-300"
                }
              />
            </button>
          ))}
          <span className="ml-2 text-lg font-medium">{performanceRating}/5</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          <div>1 = Poor - No improvement observed</div>
          <div>2 = Below Average - Minimal improvement</div>
          <div>3 = Average - Moderate improvement</div>
          <div>4 = Good - Significant improvement</div>
          <div>5 = Excellent - Outstanding improvement</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="improvementComments">Improvement Comments</Label>
        <Textarea
          id="improvementComments"
          value={improvementComments}
          onChange={(e) => setImprovementComments(e.target.value)}
          placeholder="Describe the employee's improvement, strengths, areas for further development, etc..."
          rows={6}
        />
        <p className="text-xs text-gray-500">
          This feedback will be reflected in the employee's competency records and training reports.
        </p>
      </div>

      <Button type="submit" className="w-full">
        {initialData?.employeePerformanceRating ? 'Update Rating' : 'Submit Rating'}
      </Button>
    </form>
  );
}

