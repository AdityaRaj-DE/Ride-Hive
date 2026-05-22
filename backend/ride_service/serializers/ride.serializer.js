exports.serializeRide = (ride) => {
  if (!ride) return null;

  return {
    rideId: ride._id,
    _id: ride._id,

    status: ride.status,

    pickup: ride.pickup
      ? {
          lat: ride.pickup.coordinates[1],
          lng: ride.pickup.coordinates[0],
          label: ride.pickup.label,
        }
      : (ride.riders && ride.riders.length > 0)
      ? {
          lat: ride.riders[0].pickup.coordinates[1],
          lng: ride.riders[0].pickup.coordinates[0],
          label: ride.riders[0].pickup.label,
        }
      : null,

    drop: ride.drop
      ? {
          lat: ride.drop.coordinates[1],
          lng: ride.drop.coordinates[0],
          label: ride.drop.label,
        }
      : (ride.riders && ride.riders.length > 0)
      ? {
          lat: ride.riders[0].drop.coordinates[1],
          lng: ride.riders[0].drop.coordinates[0],
          label: ride.riders[0].drop.label,
        }
      : null,

    geometry: ride.routeGeometry || null,
    route: ride.route || null,

    distance: ride.distance ?? null,
    duration: ride.duration ?? null,

    price: ride.price ?? ride.priceEstimate ?? null,
    passengers: ride.passengers ?? 1,
    finalPrice: ride.finalPrice ?? null,
    isReduced: !!(ride.finalPrice && ride.finalPrice < ride.priceEstimate),
    paymentMethod: ride.paymentMethod ?? "WALLET",

    rideType: ride.rideType ?? "NORMAL",
    riders: ride.riders ?? null,
    riderName: ride.riderName ?? "Passenger",

    riderId: ride.riderId ?? null,
    driverId: ride.driverId ?? null,

    rideStartOtp: ride.rideStartOtp
      ? {
          code: ride.rideStartOtp.code,
        }
      : null,

    requestedAt: ride.requestedAt ?? null,
    assignedAt: ride.assignedAt ?? null,
    startedAt: ride.startedAt ?? null,
    completedAt: ride.completedAt ?? null,
    createdAt: ride.createdAt ?? null,
  };
};