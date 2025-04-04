import { Achievement, UserAchievement } from "@/lib/types";

interface AchievementListProps {
  achievements: { achievement: Achievement; userAchievement: UserAchievement }[];
}

const AchievementList = ({ achievements }: AchievementListProps) => {
  if (achievements.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl text-gray-300 mb-4">
          <i className="fas fa-medal"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
        <p className="text-gray-500">
          Start playing matches and participating in tournaments to earn achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {achievements.map(({ achievement, userAchievement }) => (
        <div 
          key={achievement.id} 
          className={`bg-white border rounded-md p-4 transition-all ${
            userAchievement.completed 
              ? 'border-accent shadow-sm' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-start mb-4">
            <div className={`h-12 w-12 rounded-full ${
              userAchievement.completed ? 'bg-primary' : 'bg-gray-200'
            } text-white flex items-center justify-center mr-4`}>
              <i className={achievement.iconClass}></i>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900">{achievement.name}</h3>
              <p className="text-sm text-gray-500">{achievement.description}</p>
            </div>
          </div>
          
          <div className="mt-2">
            {userAchievement.completed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-accent text-sm">
                  <i className="fas fa-check-circle mr-1"></i>
                  <span>Completed</span>
                </div>
                <div className="text-primary text-sm font-medium">
                  +{achievement.xpReward} XP
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-900 font-medium">
                    {userAchievement.progress}/{achievement.requiredValue}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (userAchievement.progress / achievement.requiredValue) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementList;
