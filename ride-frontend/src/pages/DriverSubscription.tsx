import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { RootState } from '../store';
import api from '../api/axios';

const PLANS = [
  { id: 'daily', name: 'Daily Pass', durationDays: 1, price: 50, color: 'from-blue-400 to-blue-600', popular: false },
  { id: 'weekly', name: 'Weekly Pass', durationDays: 7, price: 300, color: 'from-indigo-500 to-purple-600', popular: true },
  { id: 'monthly', name: 'Monthly Pro', durationDays: 30, price: 1000, color: 'from-slate-800 to-black', popular: false }
];

export default function DriverSubscription() {
  const { user } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch current subscription status
    const fetchStatus = async () => {
      try {
        const res = await api.get('/driver/subscription/status');
        if (res.data && res.data.isActive) {
          setActivePlan(res.data.subscription);
        }
      } catch (err) {
        console.log("Not a driver or failed to fetch subscription", err);
      }
    };
    fetchStatus();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create order
      const { data: orderData } = await api.post('http://localhost:3005/subscription/create-order', {
        driverId: user.id,
        plan,
        amount: plan.price
      });

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_StAVEAuzNPsZoY', // Test key for frontend
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Ride-Hive',
        description: `Subscription for ${plan.name}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await api.post('http://localhost:3005/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              driverId: user.id,
              plan,
              durationDays: plan.durationDays
            });

            if (verifyRes.data.success) {
              alert('Subscription Activated Successfully!');
              window.location.reload();
            } else {
              alert('Payment Verification Failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          contact: user.mobile,
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error('Subscription error:', err);
      alert('Error initiating subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 text-primary bg-gradient-to-b from-background to-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest mb-6">
            <Star className="w-4 h-4 fill-current" /> Premium Driver Access
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Drive More, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Earn More.</span>
          </h1>
          <p className="text-secondary max-w-2xl mx-auto text-lg sm:text-xl font-medium opacity-80">
            Get unlimited ride requests and 0% commission on cash rides with our direct subscription plans.
          </p>
        </div>

        {/* Active Subscription Banner */}
        {activePlan && (
          <div className="mb-12 glass-card p-6 rounded-2xl border-green-500/30 bg-green-500/5 flex flex-col sm:flex-row items-center justify-between animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-primary">Active Subscription: {activePlan.plan?.name}</h3>
                <p className="text-sm font-medium text-secondary">Expires on {new Date(activePlan.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 px-6 py-2 rounded-full bg-green-500/10 text-green-500 font-bold text-sm tracking-widest uppercase">
              Active
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <div 
              key={plan.id}
              className={`relative glass-card rounded-[2rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${plan.popular ? 'border-accent/50 shadow-accent/20 scale-105 z-10' : 'border-border opacity-90'}`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-accent to-purple-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter">₹{plan.price}</span>
                  <span className="text-secondary font-medium text-sm uppercase tracking-widest">/ {plan.durationDays} Days</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="Unlimited Ride Requests" />
                <FeatureItem text="0% Commission on Cash Rides" />
                <FeatureItem text="Priority Support" />
                {plan.durationDays > 1 && <FeatureItem text="Advanced Route Analytics" />}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-gradient-to-r ${plan.color} hover:opacity-90 disabled:opacity-50`}
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap justify-center gap-8 sm:gap-16 opacity-50">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5" /> Secure Payments by Razorpay
          </div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            <Zap className="w-5 h-5" /> Instant Activation
          </div>
        </div>
        
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
        <CheckCircle2 className="w-3 h-3" />
      </div>
      <span className="text-sm font-semibold text-secondary">{text}</span>
    </div>
  );
}
