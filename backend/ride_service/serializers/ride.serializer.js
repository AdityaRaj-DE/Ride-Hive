exports.serializeRide = (ride) => {
  if (!ride) return null;

  return {
    rideId: ride._id,

    status: ride.status,

    pickup: ride.pickup
      ? {
          lat: ride.pickup.coordinates[1],
          lng: ride.pickup.coordinates[0],
        }
      : null,

    drop: ride.drop
      ? {
          lat: ride.drop.coordinates[1],
          lng: ride.drop.coordinates[0],
        }
      : null,

    geometry: ride.routeGeometry || null,

    distance: ride.distance ?? null,
    duration: ride.duration ?? null,

    price: ride.priceEstimate ?? null,

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
  };
};