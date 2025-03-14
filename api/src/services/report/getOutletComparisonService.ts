import prisma from "../../prisma";
import { 
  startOfDay, endOfDay, 
  subDays,
  format, parseISO
} from "date-fns";
import { ReportTimeframe } from "@/types/report";

export async function getOutletComparisonService(
  timeframe: ReportTimeframe = "monthly",
  startDateParam?: string,
  endDateParam?: string
) {
  try {
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

    const now = new Date();
    let dateStart: Date;
    let dateEnd = endOfDay(now);
    
    if (timeframe === "custom" && startDateParam && endDateParam) {
      try {
        dateStart = startOfDay(parseISO(startDateParam));
        dateEnd = endOfDay(parseISO(endDateParam));
        
        console.log(`Custom date range parsed successfully: ${format(dateStart, 'yyyy-MM-dd')} to ${format(dateEnd, 'yyyy-MM-dd')}`);
      } catch (error) {
        console.error("Error parsing custom date parameters:", error);
        
        try {
          dateStart = new Date(startDateParam);
          dateEnd = new Date(endDateParam);
          
          dateStart.setHours(0, 0, 0, 0);
          dateEnd.setHours(23, 59, 59, 999);
          
        } catch (fallbackError) {
          console.error("Fallback date parsing also failed:", fallbackError);
          dateStart = startOfDay(subDays(now, 30));
          console.log(`Falling back to last 30 days: ${format(dateStart, 'yyyy-MM-dd')} to ${format(dateEnd, 'yyyy-MM-dd')}`);
        }
      }
    } else {
      switch (timeframe) {
        case "daily":
          dateStart = startOfDay(now);
          dateEnd = endOfDay(now);
          break;
          
        case "weekly":
          dateStart = startOfDay(subDays(now, 6)); 
          dateEnd = endOfDay(now);
          break;
          
        case "monthly":
          dateStart = startOfDay(subDays(now, 29)); 
          dateEnd = endOfDay(now);
          break;
          
        case "yearly":
          dateStart = startOfDay(subDays(now, 364));
          dateEnd = endOfDay(now);
          break;
          
        default:
          dateStart = startOfDay(subDays(now, 29));
          dateEnd = endOfDay(now);
      }
    }

    const outletMetrics = await Promise.all(outlets.map(async (outlet) => {
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


      let revenue = 0;
      
      orders.forEach(order => {
        revenue += order.payment.reduce(
          (sum: number, payment) => sum + (payment.amount || 0), 
          0
        );
        
        if (order.pickupOrder) {
          revenue += order.pickupOrder.pickupPrice || 0;
        }
        
        if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
          revenue += order.deliveryOrder[0].deliveryPrice || 0;
        } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
          const delivery = order.deliveryOrder as any;
          revenue += Number(delivery.deliveryPrice) || 0;
        }
      });

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