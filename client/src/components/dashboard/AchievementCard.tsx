import { Achievement, UserAchievement } from "@/lib/types";

interface AchievementCardProps {
  achievements: { achievement: Achievement; userAchievement: UserAchievement }[];
}

const AchievementCard = ({ achievements }: AchievementCardProps) => {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Recent Achievements</h3>
        <a href="/achievements" className="text-secondary text-sm">View All</a>
      </div>
      
      {achievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No achievements yet. Start playing matches to earn achievements!
        </div>
      ) : (
        achievements.map(({ achievement, userAchievement }) => (
          <div key={achievement.id} className="flex items-center p-3 border-b border-gray-100">
            <div className={`h-12 w-12 rounded-full ${userAchievement.completed ? 'bg-primary' : 'bg-gray-300'} text-white flex items-center justify-center mr-3`}>
              <i className={achievement.iconClass}></i>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{achievement.name}</div>
              <div className="text-sm text-gray-500">{achievement.description}</div>
            </div>
            
            {userAchievement.completed ? (
              <div className="text-accent">
                <i className="fas fa-check-circle text-xl"></i>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-500 mb-1">
                  {userAchievement.progress}/{achievement.requiredValue}
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${(userAchievement.progress / achievement.requiredValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AchievementCard;
