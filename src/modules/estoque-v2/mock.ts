import {
  InventoryKpiSummary,
  InventoryLot,
  InventoryMovement,
  InventoryProduct,
} from "./types";

export const INVENTORY_KPIS: InventoryKpiSummary = {
  belowMinimum: 0,
  nearExpiration: 0,
  monthlyConsumption: 0,
};

export const INVENTORY_PRODUCTS: InventoryProduct[] = [];

export const INVENTORY_MOVEMENTS: InventoryMovement[] = [];

export const INVENTORY_LOTS: InventoryLot[] = [];
