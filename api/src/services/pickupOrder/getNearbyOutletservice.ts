import prisma from "../../prisma";

// Fungsi untuk menghitung jarak antara dua koordinat dengan Haversine formula
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam km
}

// Service untuk mendapatkan outlet terdekat
export const getNearbyOutletsService = async (
  latitude: number,
  longitude: number
) => {
  try {
    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required");
    }

    // Ambil semua outlet yang belum dihapus dari database
    const outlets = await prisma.outlet.findMany({
      where: { isDelete: false },
      include: {
        address: {
          where: { isDelete: false },
          select: { latitude: true, longitude: true },
        },
      },
    });

    // Filter outlet yang berada dalam radius 5km
    const nearbyOutlets = outlets.filter((outlet) => {
      const primaryAddress = outlet.address[0]; // Ambil alamat pertama dari array
      if (
        !primaryAddress ||
        primaryAddress.latitude === null ||
        primaryAddress.longitude === null
      ) {
        console.log(`Skipping outlet ${outlet.id}, invalid coordinates.`);
        return false; // Jika tidak ada alamat atau koordinatnya null, skip outlet ini
      }

      const distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        primaryAddress.latitude,
        primaryAddress.longitude
      );
      console.log(`Outlet ${outlet.id} is ${distance} km away from user`);

      return distance <= 5; // Hanya return outlet yang dalam radius 5km
    });
    console.log("Nearby outlets:", nearbyOutlets);

    return nearbyOutlets; // Return data ke controller
  } catch (error) {
    console.error("Error retrieving nearby outlets:", error);
    throw new Error("Failed to retrieve nearby outlets");
  }
};
