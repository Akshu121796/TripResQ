import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Check,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecoveryPrioritySelector from './RecoveryPrioritySelector';
import RecoveryPlanCard from './RecoveryPlanCard';
import RecoveryPlanComparison from './RecoveryPlanComparison';
import FamilyFractureRescue from './FamilyFractureRescue';
import './recovery.css';
import { apiFetch } from '../../services/api';

export default function RecoveryControl({
  tripId,
  _currentTrip = [],
  _disruptionState = 'disrupted',
  onPlanApplied,
  onBackToTimeline
}) {
  const [priority, setPriority] = useState('FASTEST');
  const [plans, setPlans] = useState([]);
  const [recommendedPlanId, setRecommendedPlanId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [applySuccessData, setApplySuccessData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [rejectedPlans, setRejectedPlans] = useState([]);
  const [simulationData, setSimulationData] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [hasFractureDemo, setHasFractureDemo] = useState(false);
  const [activeMode, setActiveMode] = useState('preferences'); // 'preferences' | 'fracture'
  const [scenarioAddedToast, setScenarioAddedToast] = useState(false);

  // Fetch recovery plans ranked for the given priority from backend
  const fetchRecoveryOptions = useCallback(async (prio) => {
    if (!tripId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Primary Person 2 recovery-options endpoint
      let res = await apiFetch(`/trips/${tripId}/recovery-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: prio, include_simulated_split: true })
      });

      // Resilient fallback to /recovery or /recover if needed
      if (!res.ok) {
        res = await apiFetch(`/trips/${tripId}/recovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: prio })
        });
      }
      if (!res.ok) {
        res = await apiFetch(`/trips/${tripId}/recover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: prio })
        });
      }

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const planList = data.plans || [];

      setPlans(planList);
      if (data.cohort) setCohortData(data.cohort);
      if (data.rejected_plans) setRejectedPlans(data.rejected_plans);

      if (planList.length > 0) {
        // Find recommended plan from backend flag or rank 1
        const recPlan = planList.find(p => p.recommended) || planList[0];
        setRecommendedPlanId(recPlan.id);
        setSelectedPlanId(recPlan.id);
      } else {
        setRecommendedPlanId(null);
        setSelectedPlanId(null);
      }
    } catch (err) {
      console.error('Error fetching recovery options:', err);
      setErrorMessage("Unable to calculate recovery options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  // Load recovery options on mount and priority change
  useEffect(() => {
    fetchRecoveryOptions(priority);
  }, [priority, fetchRecoveryOptions]);

  // Handle priority selector change
  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  // Add Family Fracture Demo scenario dynamically from backend
  const handleAddFamilyFractureDemo = async () => {
    if (!tripId) return;
    setIsLoadingDemo(true);
    setErrorMessage(null);

    try {
      // 1. Seed demo cohort in backend for this trip
      const cohortRes = await apiFetch(`/trips/${tripId}/cohort/demo`, {
        method: 'POST'
      });
      if (!cohortRes.ok) {
        throw new Error(`Failed to seed demo cohort: ${cohortRes.status}`);
      }
      const cohortJson = await cohortRes.json();
      setCohortData(cohortJson);

      // 2. Fetch deterministic fracture simulation data directly from backend
      const simRes = await apiFetch(`/trips/${tripId}/cohort/fracture-simulation`);
      if (simRes.ok) {
        const simJson = await simRes.json();
        setSimulationData(simJson);
      }

      // 3. Fetch recovery options including simulated split
      const recRes = await apiFetch(`/trips/${tripId}/recovery-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority, include_simulated_split: true })
      });
      if (recRes.ok) {
        const recJson = await recRes.json();
        if (recJson.plans) setPlans(recJson.plans);
        if (recJson.rejected_plans) setRejectedPlans(recJson.rejected_plans);
      }

      // 4. Mark fracture demo as active & switch into fracture view
      setHasFractureDemo(true);
      setActiveMode('fracture');
      setScenarioAddedToast(true);
      setTimeout(() => setScenarioAddedToast(false), 4500);
    } catch (err) {
      console.error('Error adding family fracture demo:', err);
      setErrorMessage('Unable to add family fracture demo from backend.');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Reset Demo to initial state
  const handleResetDemo = () => {
    setHasFractureDemo(false);
    setSimulationData(null);
    setScenarioAddedToast(false);
  };

  // Handle Apply Recovery for selected plan
  const handleApplyPlan = async (planToApply) => {
    const plan = planToApply || plans.find(p => p.id === selectedPlanId) || plans[0];
    if (!plan) return;

    setIsApplying(true);
    try {
      // Call backend with selected plan's proposals and plan metadata
      const res = await apiFetch(`/trips/${tripId}/apply-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposals: plan.proposals || [],
          plan: plan
        })
      });

      if (!res.ok) {
        throw new Error(`Apply recovery failed with status ${res.status}`);
      }

      const data = await res.json();

      setApplySuccessData({
        planTitle: plan.title,
        priority: plan.priority,
        action: plan.action,
        estimatedCost: plan.estimated_cost,
        estimatedRefund: plan.estimated_refund,
        timeSaved: plan.time_saved_minutes,
        updatedGraph: data.updated_graph
      });

      // Notify parent after success display
      setTimeout(() => {
        if (onPlanApplied) {
          onPlanApplied(data.updated_graph, plan, data);
        }
      }, 1500);

    } catch (err) {
      console.error('Error applying selected recovery plan:', err);
      setErrorMessage("Failed to apply recovery plan. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const recommendedPlan = plans.find(p => p.id === recommendedPlanId) || plans[0];
  const alternativePlans = plans.filter(p => p.id !== recommendedPlan?.id);

  return (
    <div className="recovery-control-container max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 text-left">
      {/* Recovery Control Header Alert Banner */}
      <div className="p-6 rounded-2xl bg-[#FF7700] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-24 h-24 rounded-full bg-white/5 blur-lg pointer-events-none" />

        <div className="z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white mb-2 tracking-wider uppercase font-mono">
            🛡️ 🎛️ RECOVERY CONTROL • Personalized Recovery Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-serif">
            Recovery Control
          </h1>
          <p className="text-white/95 text-xs sm:text-sm leading-relaxed">
            Your journey was disrupted. Tell TripResQ what matters most to you, and our scoring engine will dynamically re-rank optimal recovery alternatives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={handleAddFamilyFractureDemo}
            disabled={isLoadingDemo}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
          >
            <Users className="w-4 h-4 text-slate-950" />
            <span>{isLoadingDemo ? 'Adding Scenario...' : '👨‍👩‍👦 Add Family Fracture Demo'}</span>
          </button>

          {onBackToTimeline && (
            <button
              type="button"
              onClick={onBackToTimeline}
              className="px-4 py-2.5 bg-white text-[#FF7700] font-extrabold hover:bg-slate-50 text-xs rounded-xl transition shrink-0 shadow-sm cursor-pointer w-full md:w-auto text-center"
            >
              Back to Timeline
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher: Family Fracture Rescue vs Standard Preferences */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('fracture')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'fracture'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            <span>🚨 Family Fracture Rescue</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${activeMode === 'fracture' ? 'bg-red-950/40 text-amber-200' : 'bg-red-100 text-red-700'}`}>
              3 PNRs Split
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('preferences')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'preferences'
                ? 'bg-[#287DFA] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🎛️ Standard Recovery Control</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${activeMode === 'preferences' ? 'bg-blue-950/40 text-white' : 'bg-blue-50 text-[#287DFA]'}`}>
              4 Priorities
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddFamilyFractureDemo}
            disabled={isLoadingDemo}
            className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-amber-300/60"
          >
            <Users className="w-3.5 h-3.5 text-amber-800" />
            <span>{isLoadingDemo ? 'Adding Scenario...' : '👨‍👩‍👦 Add Family Fracture Demo'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Confirmation Toast: Family Fracture Scenario Gets Added */}
      <AnimatePresence>
        {scenarioAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-md border border-emerald-400/40"
          >
            <div className="flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-200 shrink-0" />
              <div>
                <div className="font-bold text-xs sm:text-sm">
                  Family Fracture scenario gets added from backend!
                </div>
                <div className="text-[11px] text-emerald-100 font-mono">
                  COHORT-001 seeded with Rahul (PNR-A123), Priya (PNR-B456), Aarav (PNR-C789)
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase bg-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-200 shrink-0 border border-emerald-400/30">
              Live Backend Synced
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {activeMode === 'fracture' ? (
        <FamilyFractureRescue
          cohort={cohortData}
          simulationData={simulationData}
          rejectedPlans={rejectedPlans}
          unifiedPlan={recommendedPlan}
          onApplyGroupRecovery={() => handleApplyPlan(recommendedPlan)}
          isApplying={isApplying}
          isLoadedFromBackend={Boolean(simulationData || cohortData)}
          hasFractureDemo={hasFractureDemo}
          onAddDemo={handleAddFamilyFractureDemo}
          isLoadingDemo={isLoadingDemo}
          onResetDemo={handleResetDemo}
        />
      ) : (
        <>
          {/* Promo Callout Card to Add Family Fracture Demo from Standard View */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-300/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                👨‍👩‍👦
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                  <Users className="w-3 h-3" />
                  <span>Interactive Split-Party Demo</span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-serif">
                  Test Family Fracture & Cohort Protection
                </h4>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  Simulate an airline rebooking separating a family of 3 on separate PNRs (<code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PNR-A123</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PNR-B456</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PNR-C789</code>).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddFamilyFractureDemo}
              disabled={isLoadingDemo}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>{isLoadingDemo ? 'Adding Scenario...' : '👨‍👩‍👦 Add Family Fracture Demo'}</span>
            </button>
          </div>

          {/* Priority Selector Component */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <RecoveryPrioritySelector
              selectedPriority={priority}
              onSelectPriority={handlePriorityChange}
              disabled={isLoading || isApplying}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <Clock className="w-8 h-8 text-[#287DFA] animate-spin" />
              <h3 className="font-extrabold text-base text-slate-800 font-serif">
                Finding the best recovery options...
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Evaluating travel constraints, operator cutoffs, and cost-benefit trade-offs for {priority} preference
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm font-serif">{errorMessage}</h4>
                  <p className="text-xs text-red-500 mt-0.5">
                    Ensure the backend is running and reachable.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchRecoveryOptions(priority)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !errorMessage && plans.length === 0 && (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-4 shadow-sm mt-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 font-serif mb-1">
                  No recovery options needed
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your itinerary is secure! No broken connections require dynamic rebooking for this priority. 
                  Try selecting a different priority above, or use the <b>Reset Demo</b> button to start over.
                </p>
              </div>
            </div>
          )}

          {/* Available Plans Section */}
          {!isLoading && !errorMessage && plans.length > 0 && (
            <div className="flex flex-col gap-6">
              {/* Section Heading */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#287DFA] tracking-wider block">
                    Ranked for {priority.replace('_', ' ')}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-serif">
                    🏆 Recommended For You
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {plans.length} alternative recovery plans generated
                </span>
              </div>

              {/* Prominent Recommended Plan Card */}
              {recommendedPlan && (
                <RecoveryPlanCard
                  plan={recommendedPlan}
                  isRecommended={true}
                  isSelected={selectedPlanId === recommendedPlan.id}
                  onSelect={() => setSelectedPlanId(recommendedPlan.id)}
                  onApply={handleApplyPlan}
                  isApplying={isApplying}
                />
              )}

              {/* Alternative Plans Underneath */}
              {alternativePlans.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Other Recovery Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {alternativePlans.map((altPlan) => (
                      <RecoveryPlanCard
                        key={altPlan.id}
                        plan={altPlan}
                        isRecommended={false}
                        isSelected={selectedPlanId === altPlan.id}
                        onSelect={() => setSelectedPlanId(altPlan.id)}
                        onApply={handleApplyPlan}
                        isApplying={isApplying}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Matrix Component */}
              <div className="mt-2">
                <RecoveryPlanComparison
                  plans={plans}
                  recommendedPlanId={recommendedPlan?.id}
                  onApplyPlan={handleApplyPlan}
                  isApplying={isApplying}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Success Modal Animation */}
      <AnimatePresence>
        {applySuccessData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-100 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                ✓ Recovery plan applied
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your selected recovery plan has been applied to the travel graph. Node schedules and dependency buffers have been updated.
              </p>

              <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Plan:</span>
                  <span className="font-bold text-slate-800">{applySuccessData.planTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Action:</span>
                  <span className="text-[#287DFA] font-semibold">{applySuccessData.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Added Cost:</span>
                  <span className="font-bold text-emerald-600">
                    {applySuccessData.estimatedCost === 0 ? 'FREE (₹0)' : `₹${applySuccessData.estimatedCost.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono tracking-wider animate-pulse">
                Fetching updated journey graph...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
