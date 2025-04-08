/**
 * User SDK
 * 
 * Functions for interacting with user data
 */

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isFoundingMember: boolean;
  created: string;
  profileImageUrl: string;
  bio: string;
  location: string;
  rating: number;
}

/**
 * Get the current authenticated user
 * 
 * @returns Promise with user data
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch('/api/auth/current-user');
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return await response.json();
}

/**
 * Get a user by ID
 * 
 * @param userId User ID
 * @returns Promise with user data
 */
export async function getUserById(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${userId}`);
  }
  return await response.json();
}

/**
 * Search users by username
 * 
 * @param query Search query
 * @param limit Maximum number of results (default: 10)
 * @returns Promise with array of users
 */
export async function searchUsers(query: string, limit = 10): Promise<User[]> {
  const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to search users');
  }
  return await response.json();
}