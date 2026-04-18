export type Status = "X" | "Pass" | "Fail";

export type EquipmentItem = {
  name: string;
  status: Status;
};

export type Bay = {
  name: string;
  items: EquipmentItem[];
};

export type TruckTemplate = {
  name: string;
  bays: Bay[];
};

// 🚒 TRUCK DEFINITIONS (EDIT THIS TO MATCH YOUR APPARATUS)
export const truckTemplates: Record<string, TruckTemplate> = {
  "Engine 1": {
    name: "Engine 1",
    bays: [
      {
        name: "Front Cab",
        items: [
          { name: "Radio", status: "X" },
          { name: "MDT Tablet", status: "X" }
        ]
      },
      {
        name: "Left Side Compartment",
        items: [
          { name: "Attack Line", status: "X" },
          { name: "Adapters", status: "X" }
        ]
      }
    ]
  },

  "Tanker 1": {
    name: "Tanker 1",
    bays: [
      {
        name: "Cab",
        items: [
          { name: "Radio", status: "X" }
        ]
      },
      {
        name: "Side Storage",
        items: [
          { name: "Large Hose", status: "X" },
          { name: "Dump Controls", status: "X" }
        ]
      }
    ]
  }
};