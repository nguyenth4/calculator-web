import type { Plastic, Printer } from "../types";

export const initialPlastics: Plastic[] = [
  {
    id: "abs-01",
    name: "ABS Pro",
    type: "ABS",
    pricePerKg: 450000,
    color: "#64748b",
    manufacturer: "Creality",
    description: "Chịu nhiệt tốt, dùng cho các bộ phận chức năng ngoài trời.",
    status: "active",
    createdAt: "2025-02-02",
  },
  {
    id: "tpu-01",
    name: "TPU Flex 95A",
    type: "TPU",
    pricePerKg: 500000,
    color: "#22c55e",
    manufacturer: "eSUN",
    description: "Nhựa dẻo, đàn hồi tốt, dùng cho case điện thoại, đế giày.",
    status: "active",
    createdAt: "2025-02-20",
  },
];

export const initialPrinters: Printer[] = [
  {
    id: "printer-a1",
    name: "Bambu Lab A1",
    powerKw: 0.095,
    purchasePrice: 10590000,
    lifetimeHours: 4000,
    createdAt: "2025-01-05",
  },
  {
    id: "printer-ender3",
    name: "Creality Ender 3 V3",
    powerKw: 0.27,
    purchasePrice: 4500000,
    lifetimeHours: 3000,
    createdAt: "2025-01-08",
  },
  {
    id: "printer-p1s",
    name: "Bambu Lab P1S",
    powerKw: 0.09,
    purchasePrice: 11000000,
    lifetimeHours: 5000,
    createdAt: "2025-02-11",
  },
  {
    id: "printer-saturn",
    name: "Elegoo Saturn 3",
    powerKw: 0.12,
    purchasePrice: 9000000,
    lifetimeHours: 3000,
    createdAt: "2025-03-01",
  },
];
