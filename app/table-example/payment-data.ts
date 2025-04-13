import { Payment } from "@/app/table-example/columns"

/**
 * Generates a random number from a normal distribution
 * @param mean The mean of the distribution
 * @param stdDev The standard deviation of the distribution
 * @returns A random number from the normal distribution
 */
function generateNormalRandom(mean: number, stdDev: number): number {
  // Box-Muller transform to generate normally distributed random numbers
  let u1 = 0, u2 = 0;
  // Ensure we don't get 0 from Math.random() which would cause -Infinity in log
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  // Return both values to get a more accurate normal distribution
  return z0 * stdDev + mean;
}

export const paymentData = Array.from({ length: 50000 }, (_, i) => {
  // Generate random hex ID (8 characters)
  const id = Math.random().toString(16).substring(2, 10);

  // Random amount between 0 and 2 billion
  const amount = generateNormalRandom(1_000_000_000, 500_000_000);


  // Random status with proper typing
  const statuses = ["pending", "processing", "success", "failed"] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Random category
  const categories = ["retail", "corporate", "investment", "treasury"];
  const category = categories[Math.floor(Math.random() * categories.length)];

  // Email based on index
  const email = `user${i + 1}@example.com`;

  // Review rating between 1 and 5
  const reviewRating = Math.floor(Math.random() * 5) + 1;

  // Random review date within the last year
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const reviewDate = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));

  return { id, amount, status, category, email, reviewRating, reviewDate };
}) as Payment[];
