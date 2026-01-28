import { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardBasic } from "../store/slices/driverSlice";
import { useNavigate } from "react-router-dom";

export default function Basic() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [firstname, setFirst] = useState("");
  const [lastname, setLast] = useState("");
  const [licenseNumber, setLicense] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();

    const res = await dispatch(
      onboardBasic({ firstname, lastname, licenseNumber })
    );

    if (onboardBasic.fulfilled.match(res)) {
      navigate("/driver/onboarding/vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h2 className="text-xl">Basic Details</h2>

        <input placeholder="First name" onChange={e => setFirst(e.target.value)} className="input" />
        <input placeholder="Last name" onChange={e => setLast(e.target.value)} className="input" />
        <input placeholder="License number" onChange={e => setLicense(e.target.value)} className="input" />

        <button className="btn">Continue</button>
      </form>
    </div>
  );
}
