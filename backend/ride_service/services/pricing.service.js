exports.calculatePrice = ({ distance, duration }) => {
    const baseFare = 50;
    const perKm = 10;
    const perMin = 1;
  
    const distanceKm = distance / 1000;
    const durationMin = duration / 60;
  
    const price =
      baseFare +
      distanceKm * perKm +
      durationMin * perMin;
  
    return Math.round(price);
  };
  