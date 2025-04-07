// Utility function to check if a user is an admin
export const isAdmin = (user: any): boolean => {
  return (user as any)?.role === "admin" || (user as any)?.isAdmin === true;
};