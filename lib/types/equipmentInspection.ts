export interface EquipmentInspection {
  id?: string;

  equipmentId: string;

  inspectionDate: any;

  inspector: string;

  result: "Pass" | "Fail";

  notes: string;

  nextDueDate: any;

  createdAt?: any;
}