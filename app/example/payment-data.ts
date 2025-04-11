import { Payment } from "./columns";

export const paymentData = Array.from({ length: 50000 }, (_, i) => {
  // Generate random hex ID (8 characters)
  const id = Math.random().toString(16).substring(2, 10);

  // Random amount between 10 and 1000
  const amount = Math.floor(Math.random() * 990) + 10;

  // Random status with proper typing
  const statuses = ["pending", "processing", "success", "failed"] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Email based on index
  const email = `user${i + 1}@example.com`;

  return { id, amount, status, email };
}) as Payment[];
