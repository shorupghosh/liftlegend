import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, ChevronRight, Store, CreditCard, UserPlus, Fingerprint, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export default function SetupWizard() {
  const { gymId, setOnboardingCompleted } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Step 1: Gym Info
  const [gymInfo, setGymInfo] = useState({ name: '', phone: '', address: '' });
  // Step 2: Plan Info
  const [planData, setPlanData] = useState({ name: 'Monthly Basic', duration_days: 30, price: 5000, description: 'Standard gym access' });
  // Step 3: Member Info
  const [memberData, setMemberData] = useState({ name: '', phone: '', email: '', plan_id: '' });
  // Step 4: Attendance State
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchState() {
      if (!gymId || gymId === 'demo-gym-id') {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('gyms')
          .select('name, contact_phone, branding, onboarding_step, onboarding_completed')
          .eq('id', gymId)
          .single();

        if (error) throw error;

        if (data?.onboarding_completed) {
          navigate('/admin');
          return;
        }

        setGymInfo({
          name: data.name || '',
          phone: data.contact_phone || '',
          address: (data.branding as any)?.address || ''
        });
        setCurrentStep(data.onboarding_step || 1);
      } catch (err) {
        console.error('Error fetching gym setup state:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [gymId, navigate]);

  const saveProgress = async (step: number, markCompleted = false) => {
    if (!gymId || gymId === 'demo-gym-id') {
      if (markCompleted) {
        setOnboardingCompleted(true);
      }
      return;
    }
    try {
      await supabase.from('gyms').update({
        onboarding_step: step,
        ...(markCompleted && { onboarding_completed: true })
      }).eq('id', gymId);
      
      if (markCompleted) {
        setOnboardingCompleted(true);
      }
    } catch (e) {
      console.error('Failed saving progress', e);
    }
  };

  const handleSkip = async () => {
    if (confirm('Are you sure you want to skip the setup? You can complete it later from the dashboard.')) {
        await saveProgress(currentStep, true); // Mark as completed so they don't get forced back
        navigate('/admin');
    }
  };

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (gymId && gymId !== 'demo-gym-id') {
        const { data: currentGym } = await supabase.from('gyms').select('branding').eq('id', gymId).single();
        const currentBranding = (currentGym?.branding as Record<string, any>) || {};

        await supabase.from('gyms').update({
          name: gymInfo.name,
          contact_phone: gymInfo.phone,
          branding: { ...currentBranding, address: gymInfo.address }
        }).eq('id', gymId);
      }
      
      await saveProgress(2);
      setCurrentStep(2);
      showToast('Gym profile saved successfully.', 'success');
    } catch (err) {
      showToast('Failed to save gym details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let planId = 'demo-plan-id';
      
      if (gymId && gymId !== 'demo-gym-id') {
        const { data, error } = await supabase.from('plans').insert({
          gym_id: gymId,
          name: planData.name,
          duration_days: planData.duration_days,
          duration_type: 'DAYS',
          price: planData.price,
          description: planData.description || null
        }).select().single();

        if (error) throw error;
        planId = data.id;
      }

      setMemberData(prev => ({ ...prev, plan_id: planId }));
      await saveProgress(3);
      setCurrentStep(3);
      showToast(`Plan "${planData.name}" created.`, 'success');
    } catch (err) {
      showToast('Failed to create plan. You might already have a plan with this name.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberData.plan_id) {
       showToast('No plan selected for the member.', 'error');
       return;
    }
    setSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planData.duration_days);

      if (gymId && gymId !== 'demo-gym-id') {
        const { data, error } = await supabase.from('members').insert({
          gym_id: gymId,
          full_name: memberData.name,
          phone: memberData.phone,
          email: memberData.email || null,
          plan_id: memberData.plan_id,
          join_date: startDate.toISOString().split('T')[0],
          expiry_date: endDate.toISOString().split('T')[0],
          status: 'ACTIVE'
        }).select().single();

        if (error) throw error;
        setCreatedMemberId(data.id);
      } else {
        setCreatedMemberId('demo-member-id');
      }
      
      await saveProgress(4);
      setCurrentStep(4);
      showToast(`Member "${memberData.name}" added successfully.`, 'success');
    } catch (err) {
      showToast('Failed to add member.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep4 = async () => {
    setSubmitting(true);
    try {
      if (gymId && gymId !== 'demo-gym-id' && createdMemberId) {
        await supabase.from('attendance').insert({
            gym_id: gymId,
            member_id: createdMemberId,
            check_in_time: new Date().toISOString(),
            method: 'MANUAL',
        });
      }
      await saveProgress(4, true);
      setIsCompleted(true);
      showToast('First check-in recorded! Setup complete.', 'success');
    } catch (err) {
      showToast('Failed to record check-in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary-default" />
      </div>
    );
  }

  // Success Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full text-center shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
           <div className="size-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
             <CheckCircle2 className="size-10" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Your gym is ready</h2>
           <p className="text-slate-500 mb-8 font-medium">You can now manage members, payments, attendance, and view powerful analytics.</p>
           
           <div className="space-y-3">
             <button onClick={() => navigate('/admin')} className="w-full flex items-center justify-center gap-2 py-4 bg-primary-default hover:bg-primary-dark text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
               Go to Dashboard <ArrowRight className="size-5" />
             </button>
             <button onClick={() => navigate('/admin/members')} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all active:scale-95">
               Explore Members
             </button>
           </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Gym Info', icon: Store, pct: 25 },
    { id: 2, title: 'Pricing Plan', icon: CreditCard, pct: 50 },
    { id: 3, title: 'Add Your First Member', icon: UserPlus, pct: 75 },
    { id: 4, title: 'Try Your First Check-In', icon: Fingerprint, pct: 100 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
       {/* Top Nav / Progress */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Quick Setup Wizard</h1>
                <p className="text-sm text-slate-500">Step {currentStep} of 4</p>
             </div>
             <div className="w-full md:w-64">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                   <span>Setup Progress</span>
                   <span className="text-primary-default">{currentStep * 25}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-primary-default transition-all duration-700 ease-out" 
                     style={{ width: `${currentStep * 25}%` }} 
                   />
                </div>
             </div>
             <button onClick={handleSkip} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4">
               Skip for now
             </button>
          </div>
       </div>

       <div className="max-w-4xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
         {/* Sidebar Navigation */}
         <div className="hidden lg:block w-64 shrink-0 border-r border-transparent">
            <div className="sticky top-32 space-y-2">
              {steps.map(step => {
                const isActive = step.id === currentStep;
                const isPast = step.id < currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800' : 'opacity-60'}`}>
                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isPast ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary-default/10 text-primary-default' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {isPast ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-primary-default' : 'text-slate-600 dark:text-slate-400'}`}>{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
         </div>

         {/* Main Form Content */}
         <div className="flex-1 max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[32px] p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-8 duration-500">
            {currentStep === 1 && (
              <form onSubmit={submitStep1} className="space-y-6">
                 <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Tell us about your gym</h2>
                    <p className="text-slate-500 text-sm">Let users know who they're working out with. You can update these details later.</p>
                 </div>
                 <div className="space-y-4">
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gym Name <span className="text-red-500">*</span></label>
                     <input required autoFocus type="text" value={gymInfo.name} onChange={e => setGymInfo({...gymInfo, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="E.g. Iron Forge Fitness" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Phone <span className="text-red-500">*</span></label>
                     <input required type="tel" value={gymInfo.phone} onChange={e => setGymInfo({...gymInfo, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="+1234567890" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Physical Address</label>
                     <textarea value={gymInfo.address} onChange={e => setGymInfo({...gymInfo, address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all resize-none h-24 dark:text-white" placeholder="Gym HQ, Street 1, City Area" />
                   </div>
                 </div>
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button type="submit" disabled={submitting} className="flex items-center gap-2 ml-auto py-3 px-8 bg-primary-default hover:bg-primary-dark disabled:opacity-70 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-default/20">
                      Save & Continue <ChevronRight className="size-4" />
                    </button>
                 </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={submitStep2} className="space-y-6">
                 <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Create your first Membership Plan</h2>
                    <p className="text-slate-500 text-sm">Define what you charge for a standard membership. You can set up packages, tiers, and classes later.</p>
                 </div>
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan Name <span className="text-red-500">*</span></label>
                       <input required autoFocus type="text" value={planData.name} onChange={e => setPlanData({...planData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="E.g. Standard Monthly" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration (in days) <span className="text-red-500">*</span></label>
                       <input required type="number" min="1" value={planData.duration_days} onChange={e => setPlanData({...planData, duration_days: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price <span className="text-slate-400 font-normal">(BDT)</span> <span className="text-red-500">*</span></label>
                     <input required type="number" min="0" value={planData.price} onChange={e => setPlanData({...planData, price: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all font-mono font-bold dark:text-white" placeholder="5000" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Short Description (Optional)</label>
                     <textarea value={planData.description} onChange={e => setPlanData({...planData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all resize-none h-20 dark:text-white" placeholder="Includes full gym access and locker room use." />
                   </div>
                 </div>
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Back</button>
                    <button type="submit" disabled={submitting} className="flex items-center gap-2 py-3 px-8 bg-primary-default hover:bg-primary-dark disabled:opacity-70 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-default/20">
                      Save & Continue <ChevronRight className="size-4" />
                    </button>
                 </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={submitStep3} className="space-y-6">
                 <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Add your First Member</h2>
                    <p className="text-slate-500 text-sm">Let's register someone to the system using the plan you just created.</p>
                 </div>
                 
                 <div className="p-4 rounded-xl bg-primary-default/5 border border-primary-default/10 flex items-center gap-4">
                   <div className="size-10 rounded-full bg-primary-default/20 text-primary-default flex items-center justify-center shrink-0">
                     <CreditCard className="size-5" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-primary-default uppercase tracking-widest leading-none mb-1">Selected Plan</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{planData.name} ({planData.duration_days} Days)</p>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Member Full Name <span className="text-red-500">*</span></label>
                     <input required autoFocus type="text" value={memberData.name} onChange={e => setMemberData({...memberData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="John Doe" />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                       <input required type="tel" value={memberData.phone} onChange={e => setMemberData({...memberData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="+12345678" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                       <input type="email" value={memberData.email} onChange={e => setMemberData({...memberData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all dark:text-white" placeholder="john@example.com" />
                     </div>
                   </div>
                 </div>
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Back</button>
                    <button type="submit" disabled={submitting} className="flex items-center gap-2 py-3 px-8 bg-primary-default hover:bg-primary-dark disabled:opacity-70 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-default/20">
                      Save & Continue <ChevronRight className="size-4" />
                    </button>
                 </div>
              </form>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center pt-4">
                 <div className="size-24 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6 relative">
                   <Fingerprint className="size-10" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500 to-transparent opacity-20 rounded-b-full pointer-events-none" />
                 </div>
                 
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Time for a Check-in</h2>
                 <p className="text-slate-500 text-sm max-w-sm mx-auto">
                   When members visit your gym, you can verify their QR codes or manually check them in.
                   Let's simulate the first check-in for <strong>{memberData.name}</strong>.
                 </p>

                 <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={submitStep4} disabled={submitting} className="w-full sm:w-auto flex justify-center items-center gap-2 py-4 px-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                      {submitting ? <Loader2 className="size-5 animate-spin" /> : 'Log First Attendance'}
                    </button>
                 </div>
                 
                 <button onClick={async () => { await saveProgress(4, true); setIsCompleted(true); }} className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 block w-full">Ask me later, just take me to the dashboard</button>
              </div>
            )}
         </div>
       </div>
    </div>
  );
}
