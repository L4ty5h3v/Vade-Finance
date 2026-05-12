export type AppView = "Marketplace" | "Portfolio" | "History" | "Verification" | "Settings";
export type UserRole = "Exporter" | "Investor" | "Verifier";

export type WalletProfile = {
  role: UserRole;
  displayName: string;
};
