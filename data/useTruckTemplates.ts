"use client";

import { useEffect, useState } from "react";

export type Status = "X" | "Pass" | "Fail";

export type EquipmentItem = {
  name: string;
};

export type Bay = {
  name: string;
  items: EquipmentItem[];
};

export type TruckTemplate = {
  name: string;
  bays: Bay[];
};

const defaultTemplates: Record<string, TruckTemplate> = {
  "Engine 1": {
    name: "Engine 1",
    bays: [
      {
        name: "Cab",
        items: [{ name: "Radio" }, { name: "MDT" }]
      }
    ]
  }
};

export function useTruckTemplates() {
  const [templates, setTemplates] = useState<Record<string, TruckTemplate>>({});

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("truckTemplates");
    if (saved) {
      setTemplates(JSON.parse(saved));
    } else {
      setTemplates(defaultTemplates);
    }
  }, []);

  // SAVE
  const save = (data: Record<string, TruckTemplate>) => {
    setTemplates(data);
    localStorage.setItem("truckTemplates", JSON.stringify(data));
  };

  return { templates, setTemplates: save };
}