export interface IDashboard {
  id: number;
  name: string;
  description?: string;
  timescaleIdentifier: string;
  createdAt: string; // or Date, if you plan to convert it
  updatedAt: string; // or Date
  workspaceId: number;
}
