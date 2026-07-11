export interface Equipment {
  id?: string;

  name: string;
  type: string;

  manufacturer: string;
  model: string;

  serialNumber: string;
  assetNumber: string;

  assignedTo: string;
  location: string;

  status: string;

  inspectionInterval: number;
  inspectionUnit: string;

  notes: string;

lastInspectionDate?: any;
nextDueDate?: any;

  createdAt?: string;
}