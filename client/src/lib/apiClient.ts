import { apiRequest } from "./queryClient";
import type { User, Tournament, Achievement, Activity, UserTournament, UserAchievementWithDetails, RegisterFormData, LoginFormData, RedeemCodeFormData } from "@/types";

const API_BASE = "/api";

// Auth endpoints
export const authApi = {
  login: async (data: LoginFormData): Promise<User> => {
    const res = await apiRequest("POST", `${API_BASE}/auth/login`, data);
    return res.json();
  },
  
  register: async (data: RegisterFormData): Promise<User> => {
    const res = await apiRequest("POST", `${API_BASE}/auth/register`, data);
    return res.json();
  },
  
  logout: async (): Promise<void> => {
    await apiRequest("POST", `${API_BASE}/auth/logout`);
  },
  
  getCurrentUser: async (): Promise<User> => {
    const res = await apiRequest("GET", `${API_BASE}/auth/current-user`);
    return res.json();
  }
};

// User endpoints
export const userApi = {
  getUser: async (id: number): Promise<User> => {
    const res = await apiRequest("GET", `${API_BASE}/users/${id}`);
    return res.json();
  },
  
  getUserActivities: async (limit?: number): Promise<Activity[]> => {
    const queryParam = limit ? `?limit=${limit}` : '';
    const res = await apiRequest("GET", `${API_BASE}/user/activities${queryParam}`);
    return res.json();
  }
};

// Tournament endpoints
export const tournamentApi = {
  getAllTournaments: async (): Promise<Tournament[]> => {
    const res = await apiRequest("GET", `${API_BASE}/tournaments`);
    return res.json();
  },
  
  getTournament: async (id: number): Promise<Tournament> => {
    const res = await apiRequest("GET", `${API_BASE}/tournaments/${id}`);
    return res.json();
  },
  
  getUserTournaments: async (): Promise<UserTournament[]> => {
    const res = await apiRequest("GET", `${API_BASE}/user/tournaments`);
    return res.json();
  },
  
  registerForTournament: async (tournamentId: number, division?: string) => {
    const res = await apiRequest("POST", `${API_BASE}/tournament-registrations`, {
      tournamentId,
      division,
      status: "registered"
    });
    return res.json();
  },
  
  checkInToTournament: async (tournamentId: number) => {
    const res = await apiRequest("POST", `${API_BASE}/tournament-check-in`, {
      tournamentId
    });
    return res.json();
  }
};

// Achievement endpoints
export const achievementApi = {
  getAllAchievements: async (): Promise<Achievement[]> => {
    const res = await apiRequest("GET", `${API_BASE}/achievements`);
    return res.json();
  },
  
  getUserAchievements: async (): Promise<UserAchievementWithDetails[]> => {
    const res = await apiRequest("GET", `${API_BASE}/user/achievements`);
    return res.json();
  }
};

// Leaderboard endpoints
export const leaderboardApi = {
  // Get XP-based leaderboard
  getLeaderboard: async (limit?: number): Promise<User[]> => {
    const queryParam = limit ? `?limit=${limit}` : '';
    const res = await apiRequest("GET", `${API_BASE}/leaderboard${queryParam}`);
    return res.json();
  },
  
  // Get ranking points-based leaderboard
  getRankingLeaderboard: async (limit?: number): Promise<User[]> => {
    const queryParam = limit ? `?limit=${limit}` : '';
    const res = await apiRequest("GET", `${API_BASE}/ranking-leaderboard${queryParam}`);
    return res.json();
  },
  
  // Get user's ranking history
  getUserRankingHistory: async (limit?: number): Promise<any[]> => {
    const queryParam = limit ? `?limit=${limit}` : '';
    const res = await apiRequest("GET", `${API_BASE}/user/ranking-history${queryParam}`);
    return res.json();
  }
};

// Code redemption endpoint
export const codeApi = {
  redeemCode: async (data: RedeemCodeFormData) => {
    const res = await apiRequest("POST", `${API_BASE}/redeem-code`, data);
    return res.json();
  }
};
