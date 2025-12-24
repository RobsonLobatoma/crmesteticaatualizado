export interface InventoryKpiSummary {
  belowMinimum: number;
  nearExpiration: number;
  monthlyConsumption: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  minimum: number;
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: "entrada" | "saida";
  productName: string;
  quantity: number;
  user: string;
}

export interface InventoryLot {
  id: string;
  productName: string;
  lot: string;
  expiration: string;
}
