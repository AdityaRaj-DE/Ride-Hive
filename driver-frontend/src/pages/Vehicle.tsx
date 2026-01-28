import { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardVehicle } from "../store/slices/driverSlice";
import { useNavigate } from "react-router-dom";

export default function Vehicle() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [model, setModel] = useState("");
  const [plateNumber, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();

    const res = await dispatch(
      onboardVehicle({ model, plateNumber, color, type })
    );

    if (onboardVehicle.fulfilled.match(res)) {
      navigate("/driver/onboarding/documents");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h2 className="text-xl">Vehicle Info</h2>

        <input placeholder="Model" onChange={e => setModel(e.target.value)} className="input" />
        <input placeholder="Plate Number" onChange={e => setPlate(e.target.value)} className="input" />
        <input placeholder="Color" onChange={e => setColor(e.target.value)} className="input" />
        <input placeholder="Type" onChange={e => setType(e.target.value)} className="input" />

        <button className="btn">Continue</button>
      </form>
    </div>
  );
}
