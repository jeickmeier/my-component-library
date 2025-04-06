    // Example usage in another component
    import { SparklineHistogram } from "@/components/charts/sparkline-histogram"; // Adjust path as needed

    import { StarRating } from "@/components/ui/star-rating";
    export default function MyDashboard() {
      const recentSales = [12, 5, 22, 15, 8, 19, 10];
      const userActivity = [
        2, 3, 1, 4, 2, 5, 3, 6, 4, 7, 5,  // Original values
        8, 6, 9, 7, 10, 8, 11, 9, 12, 10, // Increasing trend
        9, 7, 8, 6, 7, 5, 6, 4, 5, 3,     // Decreasing trend
        4, 6, 5, 7, 6, 8, 7, 9, 8, 10,    // Oscillating pattern
        9, 11, 10, 12, 11, 13, 12, 14, 13, 15  // Final upward trend
      ];

      return (
        <div>
          <div>
            <h3>Recent Sales</h3>
            <SparklineHistogram 
              data={recentSales} 
              numBins={3}
              height="h-[40px]" 
              width="w-[150px]" 
              barColor="hsl(var(--chart-1))" // Use a Shadcn chart color
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>User Activity</h3>
            <SparklineHistogram 
              data={userActivity} 
              numBins={5}
              height="h-[30px]" 
              width="w-[200px]" 
              barColor="#8884d8" // Or use a specific hex color
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>User Activity</h3>
            <StarRating rating={4.5} />
          </div>
        </div>
      );
    }