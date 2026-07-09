export type UserRole =
  | "Admin"
  | "Officer"
  | "Member";

export function canEdit(role?: string) {
  return (
    role === "Admin" ||
    role === "Officer" ||
    role === "Member"
  );
}

export function isAdmin(role?: string) {
  return role === "Admin";
}

export function canAccessAdmin(role?: string) {
  return role === "Admin";
}