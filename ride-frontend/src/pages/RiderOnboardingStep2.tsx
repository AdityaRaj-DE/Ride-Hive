import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateRiderProfile } from "../store/riderSlice";
import { useNavigate } from "react-router-dom";

export default function RiderOnboardingStep2() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    gender: "",
    dob: "",
    ecName: "",
    ecPhone: "",
    ecRelation: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      gender: form.gender,
      dob: form.dob,
      emergencyContact: {
        name: form.ecName,
        phone: form.ecPhone,
        relation: form.ecRelation,
      },
    };

    await dispatch(updateRiderProfile(payload));
    navigate("/dashboard");
  };

  const skip = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">

        <h2 className="text-xl font-semibold">Complete your profile</h2>
        <p className="text-xs text-neutral-400">
          Optional — but recommended for safety & personalization.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <select
            className="w-full rounded-xl bg-black/60 px-4 py-3"
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>

          <input
            type="date"
            className="w-full rounded-xl bg-black/60 px-4 py-3"
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <input placeholder="Emergency contact name" className="input" 
            onChange={(e)=>setForm({...form, ecName:e.target.value})}/>

          <input placeholder="Emergency contact phone" className="input"
            onChange={(e)=>setForm({...form, ecPhone:e.target.value})}/>

          <input placeholder="Relation" className="input"
            onChange={(e)=>setForm({...form, ecRelation:e.target.value})}/>

          <button className="w-full rounded-full bg-neutral-900 py-3">
            Save & Continue
          </button>

          <button type="button" onClick={skip}
            className="w-full text-xs text-neutral-400 underline">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
