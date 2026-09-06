import React, { useState, useEffect, useCallback, useRef } from 'react';
import RiskBanner from './RiskBanner';
import RiskConnectionCard from './RiskConnectionCard';
import { apiFetch } from '../../services/api';

/**
 * Self-contained, isolated Risk Radar feature module.
 *
 * Usage:
 *   <RiskRadar tripId={tripId} />
 *
 * Props:
 *   - tripId (string, required): ID of the trip to monitor.
 *   - onPlanApplied (function, optional): Callback invoked when a buffer plan is successfully applied.
 *   - pollIntervalMs (number, optional): Polling interval in ms. Defaults to 25000 (25s).
 */
export default function RiskRadar({
  tripId,
  onPlanApplied,
  pollIntervalMs = 25000,
  className = ''
}) {
  const [riskRadar, setRiskRadar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buffer plan states keyed by edgeId
  const [bufferPlans, setBufferPlans] = useState({});
  const [planLoadingId, setPlanLoadingId] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch Risk Radar report
  const fetchRiskRadar = useCallback(async (force = false) => {
    if (!tripId) return;
    try {
      if (force) setLoading(true);
      const endpoint = `/trips/${tripId}/risk-radar${force ? '?refresh=true' : ''}`;
      const res = await apiFetch(endpoint);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (isMountedRef.current) {
        setRiskRadar(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[RiskRadar] fetch error:', err);
        setError(err.message || 'Failed to load Risk Radar');
      }
    } finally {
      if (isMountedRef.current && force) {
        setLoading(false);
      }
    }
  }, [tripId]);

  // Initial load and periodic background polling
  useEffect(() => {
    if (!tripId) return;
    fetchRiskRadar(false);

    const interval = setInterval(() => {
      fetchRiskRadar(false);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [tripId, fetchRiskRadar, pollIntervalMs]);

  // Pre-compute buffer plan (Read-Only)
  const handlePrecompute = async (edgeId) => {
    if (!tripId || !edgeId) return;
    try {
      setPlanLoadingId(edgeId);
      const endpoint = `/trips/${tripId}/connections/${edgeId}/buffer-plan`;
      const res = await apiFetch(endpoint, { method: 'POST' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const plan = await res.json();
      if (isMountedRef.current) {
        setBufferPlans(prev => ({ ...prev, [edgeId]: plan }));
      }
    } catch (err) {
      console.error('[RiskRadar] precompute plan error:', err);
    } finally {
      if (isMountedRef.current) {
        setPlanLoadingId(null);
      }
    }
  };

  // Apply buffer plan (Mutating shiftable node)
  const handleApplyPlan = async (edgeId) => {
    if (!tripId || !edgeId) return;
    try {
      setApplyingId(edgeId);
      const endpoint = `/trips/${tripId}/connections/${edgeId}/buffer-plan/apply`;
      const res = await apiFetch(endpoint, { method: 'POST' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const applyResult = await res.json();

      if (isMountedRef.current) {
        setBufferPlans(prev => ({
          ...prev,
          [edgeId]: {
            ...(prev[edgeId] || {}),
            applyResult,
          },
        }));
      }

      // Refresh Risk Radar immediately after applying
      await fetchRiskRadar(true);

      if (onPlanApplied) {
        onPlanApplied(applyResult);
      }
    } catch (err) {
      console.error('[RiskRadar] apply plan error:', err);
    } finally {
      if (isMountedRef.current) {
        setApplyingId(null);
      }
    }
  };

  if (!tripId) {
    return null;
  }

  const connections = riskRadar?.connections || [];

  return (
    <div className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4 ${className}`}>
      {/* 1. Trip-Level Compact Banner */}
      <RiskBanner
        riskRadar={riskRadar}
        loading={loading}
        onRefresh={() => fetchRiskRadar(true)}
      />

      {/* 2. Loading / Empty States */}
      {!riskRadar && !error && (
        <p className="text-xs text-slate-400 py-2">Scanning connections for proactive risk before anything goes wrong…</p>
      )}

      {error && (
        <p className="text-xs text-red-500 py-1">{error}</p>
      )}

      {riskRadar && connections.length === 0 && (
        <p className="text-xs text-slate-400 py-2">
          Add at least two connected legs to your itinerary to see proactive connection risk scoring.
        </p>
      )}

      {/* 3. List of Compact Connection Cards */}
      {connections.length > 0 && (
        <div className="flex flex-col gap-3">
          {connections.map((conn) => {
            const edgeId = conn.edge_id;
            return (
              <RiskConnectionCard
                key={conn.target_node_id || edgeId}
                conn={conn}
                plan={bufferPlans[edgeId]}
                planLoading={planLoadingId === edgeId}
                applying={applyingId === edgeId}
                onPrecompute={() => handlePrecompute(edgeId)}
                onApply={() => handleApplyPlan(edgeId)}
              />
            );
          })}
        </div>
      )}

      {/* 4. Footer info */}
      {riskRadar && (riskRadar.last_evaluated_at || riskRadar.generated_at) && (
        <p className="text-[10px] text-slate-400 font-mono pt-1">
          Background model last evaluated {new Date(riskRadar.last_evaluated_at || riskRadar.generated_at).toLocaleTimeString()} · re-scans automatically every 45s
        </p>
      )}
    </div>
  );
}
