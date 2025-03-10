import prisma from "../../prisma";
import { 
  startOfDay, endOfDay, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  subDays, format
} from "date-fns";
import { ReportTimeframe } from "@/types/report";

export async function getOutletComparisonService(timeframe: ReportTimeframe = "monthly") {
  try {
    // Get all active outlets
    const outlets = await prisma.outlet.findMany({
      where: {
        isDelete: false
      },
      select: {
        id: true,
        outletName: true,
        outletType: true
      }
    });

    // Determine date range based on timeframe
    const now = new Date();
    let dateStart: Date;
    let dateEnd = endOfDay(now);
    
    switch (timeframe) {
      case "daily":
        // Today only
        dateStart = startOfDay(now);
        break;
        
      case "weekly":
        // Use last 7 days instead of current week - more likely to have data
        dateStart = startOfDay(subDays(now, 6)); // 6 days ago + today = 7 days
        dateEnd = endOfDay(now);
        break;
        
      case "monthly":
        // Current month
        dateStart = startOfMonth(now);
        dateEnd = endOfMonth(now);
        break;
        
      case "yearly":
        // Current year
        dateStart = startOfYear(now);
        dateEnd = endOfYear(now);
        break;
        
      case "custom":
        // Last 30 days for custom if no specific dates provided
        dateStart = startOfDay(subDays(now, 29));
        break;
        
      default:
        // Default to last 30 days
        dateStart = startOfDay(subDays(now, 29));
    }

    console.log(`Generating outlet comparison for timeframe ${timeframe} from ${format(dateStart, 'yyyy-MM-dd')} to ${format(dateEnd, 'yyyy-MM-dd')}`);

    // Collect metrics for each outlet
    const outletMetrics = await Promise.all(outlets.map(async (outlet) => {
      // Find orders through the Order model directly, filtering by outlet via the pickup order
      const orders = await prisma.order.findMany({
        where: {
          pickupOrder: {
            outletId: outlet.id
          },
          createdAt: {
            gte: dateStart,
            lte: dateEnd
          },
          payment: {
            some: {
              paymentStatus: "SUCCESSED"
            }
          }
        },
        include: {
          payment: {
            where: {
              paymentStatus: "SUCCESSED"
            }
          },
          pickupOrder: true,
          deliveryOrder: true
        }
      });

      console.log(`Found ${orders.length} orders for outlet ${outlet.outletName} in the selected timeframe`);

      // Calculate total revenue
      let revenue = 0;
      
      orders.forEach(order => {
        // Add payment amounts
        revenue += order.payment.reduce(
          (sum: number, payment) => sum + (payment.amount || 0), 
          0
        );
        
        // Add pickup price if exists
        if (order.pickupOrder) {
          revenue += order.pickupOrder.pickupPrice || 0;
        }
        
        // Add delivery price if exists
        if (order.deliveryOrder && order.deliveryOrder.length > 0) {
          revenue += order.deliveryOrder[0].deliveryPrice || 0;
        }
      });

      // Get unique customer IDs from pickup orders
      const customerIds = orders.map(order => order.pickupOrder?.userId).filter(Boolean);
      const uniqueCustomerIds = new Set(customerIds);

      return {
        id: outlet.id,
        name: outlet.outletName,
        type: outlet.outletType,
        revenue: revenue,
        orders: orders.length,
        customers: uniqueCustomerIds.size
      };
    }));

    return {
      outlets: outletMetrics,
      timeframe,
      dateRange: {
        from: dateStart,
        to: dateEnd
      }
    };
  } catch (error: any) {
    console.error("Error in getOutletComparisonService:", error);
    throw new Error(`Error generating outlet comparison: ${error.message}`);
  }
}