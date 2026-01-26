import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp, fetchMe } from "../store/authSlice";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { loading, error, otpSent, token, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const submitMobile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendOtp(mobile));
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const result = await dispatch(verifyOtp({ mobile, otp }));
  
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(fetchMe());
    }
  };
  // useEffect(() => {
  //   console.log("LOGIN USER:", user);
  
  //   if (user) {
  //     if (!user.onboarding?.rider) {
  //       console.log("GOING TO ONBOARDING");
  //       navigate("/onboarding");
  //     } else {
  //       console.log("GOING TO DASHBOARD");
  //       navigate("/dashboard");
  //     }
  //   }
  // }, [user]);
  
  

  useEffect(() => {
    if (user) {
      if (!user.onboarding?.rider) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex-1 flex flex-col px-5 pt-10 pb-4">
        <header className="mb-10">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
            Rider
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-md">
            Sign in using your mobile number.
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.85)] p-6 md:p-8 space-y-6">

              {!otpSent ? (
                <form onSubmit={submitMobile} className="space-y-4">
                  <label className="text-xs font-medium text-neutral-300">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm"
                    onChange={(e) => setMobile(e.target.value)}
                  />

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button
                    disabled={loading}
                    className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={submitOtp} className="space-y-4">
                  <label className="text-xs font-medium text-neutral-300">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm"
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button
                    disabled={loading}
                    className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
