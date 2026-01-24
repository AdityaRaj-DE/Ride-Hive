import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { completeRiderOnboarding } from "../store/riderSlice";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

export default function RiderOnboarding() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.rider);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: {
        first: form.firstname,
        last: form.lastname,
      },
      email: form.email,
    };

    const result = await dispatch(completeRiderOnboarding(payload));
    if (completeRiderOnboarding.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex-1 flex flex-col px-5 pt-10 pb-4">
        <header className="mb-10">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
            Rider
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Complete your profile</h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-md">
            This helps us personalize your ride experience.
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-6">

              <form onSubmit={submit} className="space-y-4">
                <input
                  placeholder="First name"
                  className="w-full rounded-xl bg-black/60 px-4 py-3"
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Last name (optional)"
                  className="w-full rounded-xl bg-black/60 px-4 py-3"
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                />

                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="w-full rounded-xl bg-black/60 px-4 py-3"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold"
                >
                  {loading ? "Saving..." : "Continue"}
                </button>
              </form>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
