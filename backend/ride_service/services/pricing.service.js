exports.calculatePrice = ({ distance, duration, passengers = 1 }) => {
    const baseFare = 20;
    const perKm = 10;
    const perMin = 1;
  
    const distanceKm = distance / 1000;
    const durationMin = duration / 60;
  
    let price =
      baseFare +
      distanceKm * perKm +
      durationMin * perMin;
    
    // Add multiplier for multi-passengers (10% extra per passenger after the first)
    if (passengers > 1) {
        price = price * (1 + (passengers - 1) * 0.1);
    }
  
    return Math.round(price);
  };
  