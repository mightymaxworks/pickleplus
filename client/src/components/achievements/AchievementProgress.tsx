import { Progress } from "@/components/ui/progress";

interface AchievementProgressProps {
  total: number;
  completed: number;
}

const AchievementProgress = ({ total, completed }: AchievementProgressProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-900">Overall Progress</div>
        <div className="text-primary font-bold">{percentage}%</div>
      </div>
      
      <Progress value={percentage} className="h-3" />
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-accent bg-opacity-10 rounded-md p-4 text-center">
          <div className="text-3xl font-bold text-accent mb-1">{completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="bg-primary bg-opacity-10 rounded-md p-4 text-center">
          <div className="text-3xl font-bold text-primary mb-1">{total - completed}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        
        <div className="bg-secondary bg-opacity-10 rounded-md p-4 text-center">
          <div className="text-3xl font-bold text-secondary mb-1">{total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
      
      {completed > 0 && (
        <div className="mt-6 p-4 bg-accent bg-opacity-10 border border-accent border-opacity-20 rounded-md">
          <div className="flex items-start">
            <div className="text-accent mr-3 text-xl">
              <i className="fas fa-award"></i>
            </div>
            <div>
              <div className="font-medium text-gray-900">Great progress!</div>
              <div className="text-sm text-gray-600">
                You've completed {completed} out of {total} achievements. Keep going to earn more XP and level up!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementProgress;
