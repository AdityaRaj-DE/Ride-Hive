import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import MapPreview from "../components/MapPreview";
import { emitCreateRide } from "../sockets/rideSocket";
type LocationType = {
    lat: number;
    lng: number;
    label?: string;
};

export default function BookRide() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as any;

    const [pickup, setPickup] = useState<LocationType | null>(null);
    const [drop, setDrop] = useState<LocationType | null>(null);

    const [estimate, setEstimate] = useState<any>(null);
    const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);

    /* -----------------------------
       1. Read data returned from MapPicker
    ------------------------------*/
    useEffect(() => {
        if (state?.pickup) {
            setPickup({
                ...state.pickup,
                label: "Selected Pickup",
            });
            setUsingCurrentLocation(false);
        }

        if (state?.drop) {
            setDrop({
                ...state.drop,
                label: "Selected Drop",
            });
        }
    }, [state]);

    /* -----------------------------
       2. Fetch browser current location
    ------------------------------*/
    useEffect(() => {
        if (pickup) return; // do not override map selection

        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                setPickup({
                    lat: latitude,
                    lng: longitude,
                    label: "Current Location",
                });

                setUsingCurrentLocation(true);
            },
            (err) => {
                console.log(err);
            }
        );
    }, [pickup]);

    /* -----------------------------
       3. Fetch ride estimate
    ------------------------------*/
    useEffect(() => {
        if (!pickup || !drop) return;

        const fetchEstimate = async () => {
            try {
                const res = await api.post("/ride/estimate", {
                    pickup: { lat: pickup.lat, lng: pickup.lng },
                    drop: { lat: drop.lat, lng: drop.lng },
                });

                setEstimate(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchEstimate();
    }, [pickup, drop]);

    /* -----------------------------
       Navigation to MapPicker
    ------------------------------*/

    const openPickupMap = () => {
        navigate("/map-picker?type=pickup", {
            state: { pickup, drop },
        });
    };

    const openDropMap = () => {
        navigate("/map-picker?type=drop", {
            state: { pickup, drop },
        });
    };

    const resetCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;

            setPickup({
                lat: latitude,
                lng: longitude,
                label: "Current Location",
            });

            setUsingCurrentLocation(true);
        });
    };
    const bookRide = () => {
        emitCreateRide({
            pickup,
            drop,
        });

        navigate("/ride");
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Book Ride</h1>

            {/* Pickup */}
            <div style={{ marginTop: 20 }}>
                <h3>Pickup</h3>

                <div>
                    {pickup
                        ? `${pickup.label} (${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(
                            4
                        )})`
                        : "Select Pickup"}
                </div>

                <button onClick={openPickupMap}>Select Pickup on Map</button>

                {!usingCurrentLocation && (
                    <button onClick={resetCurrentLocation}>
                        Use Current Location
                    </button>
                )}
            </div>

            {/* Drop */}
            <div style={{ marginTop: 20 }}>
                <h3>Drop</h3>

                <div>
                    {drop
                        ? `Drop Location (${drop.lat.toFixed(4)}, ${drop.lng.toFixed(4)})`
                        : "Select Drop Location"}
                </div>

                <button onClick={openDropMap}>Select Drop on Map</button>
            </div>
            <MapPreview pickup={pickup} drop={drop} />
            {/* Estimate */}
            {estimate && (
                <div style={{ marginTop: 30 }}>
                    <h2>Estimated Ride</h2>

                    <p>Price: ₹{estimate.price}</p>
                    <p>Distance: {(estimate.distance / 1000).toFixed(2)} km</p>
                    <p>ETA: {(estimate.duration / 60).toFixed(0)} mins</p>

                    <button onClick={bookRide} style={{ marginTop: 10 }}>Book Ride</button>
                </div>
            )}
        </div>
    );
}