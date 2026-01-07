import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface EvaluationFormProps {
  onSubmit: (data: {
    trainingRating: number;
    trainingComments?: string;
    trainerRating?: number;
    trainerComments?: string;
  }) => void;
  initialData?: {
    trainingRating?: number;
    trainingComments?: string;
    trainerRating?: number;
    trainerComments?: string;
  };
}

export function EvaluationForm({ onSubmit, initialData }: EvaluationFormProps) {
  const [trainingRating, setTrainingRating] = useState(initialData?.trainingRating || 0);
  const [trainingComments, setTrainingComments] = useState(initialData?.trainingComments || '');
  const [trainerRating, setTrainerRating] = useState(initialData?.trainerRating || 0);
  const [trainerComments, setTrainerComments] = useState(initialData?.trainerComments || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      trainingRating,
      trainingComments: trainingComments || undefined,
      trainerRating: trainerRating || undefined,
      trainerComments: trainerComments || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Training Rating *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setTrainingRating(star)}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={
                  star <= trainingRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400 hover:text-yellow-300"
                }
              />
            </button>
          ))}
          <span className="ml-2">{trainingRating}/5</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainingComments">Training Comments</Label>
        <Textarea
          id="trainingComments"
          value={trainingComments}
          onChange={(e) => setTrainingComments(e.target.value)}
          placeholder="Share your thoughts about the training..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Trainer Rating</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setTrainerRating(star)}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={
                  star <= trainerRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400 hover:text-yellow-300"
                }
              />
            </button>
          ))}
          <span className="ml-2">{trainerRating || 0}/5</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainerComments">Trainer Comments</Label>
        <Textarea
          id="trainerComments"
          value={trainerComments}
          onChange={(e) => setTrainerComments(e.target.value)}
          placeholder="Share your thoughts about the trainer..."
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        Submit Evaluation
      </Button>
    </form>
  );
}

