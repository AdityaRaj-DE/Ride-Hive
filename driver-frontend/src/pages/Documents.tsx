import { useState } from "react";
import { useDispatch } from "react-redux";
import { onboardDocuments } from "../store/slices/driverSlice";
import { useNavigate } from "react-router-dom";

export default function Documents() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [dl, setDl] = useState("");
  const [rc, setRc] = useState("");
  const [ins, setIns] = useState("");
  const [photo, setPhoto] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();

    const res = await dispatch(
      onboardDocuments({
        drivingLicenseUrl: dl,
        rcBookUrl: rc,
        insuranceUrl: ins,
        profilePhotoUrl: photo,
      })
    );

    if (onboardDocuments.fulfilled.match(res)) {
      navigate("/driver/onboarding/pending");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h2 className="text-xl">Documents</h2>

        <input placeholder="DL URL" onChange={e => setDl(e.target.value)} className="input" />
        <input placeholder="RC URL" onChange={e => setRc(e.target.value)} className="input" />
        <input placeholder="Insurance URL" onChange={e => setIns(e.target.value)} className="input" />
        <input placeholder="Profile Photo URL" onChange={e => setPhoto(e.target.value)} className="input" />

        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
