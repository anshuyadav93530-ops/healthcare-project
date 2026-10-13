import { Patient, SimulationInputs, SimulationResult } from '../types';

export const DEFAULT_SIMULATION_INPUTS: SimulationInputs = {
  sleepHours: 7.5,
  activityMinutes: 30,
  mealRegularity: 3, // scale 1 to 5
};

/**
 * Transparent, deterministic illustrative simulation formula.
 * DISCLAIMER: Illustrative simulation — not a medical prediction.
 *
 * This purely mathematical heuristic computes stylized directional shifts
 * for educational demonstration purposes only:
 * - Sleep: Target window 7-9 hours. Inadequate sleep (<6h) or excess (>10h) applies modest upward pressure on resting HR and BP.
 * - Activity: Moderate daily activity (30-60 mins) applies favorable reduction on resting HR and systolic BP within calibrated ranges.
 * - Meal Regularity: Regular meal schedule (level 4-5) simulates reduced glycemic volatility.
 */
export function runWhatIfSimulation(patient: Patient, inputs: SimulationInputs): SimulationResult {
  // Extract latest baseline readings (fallback to default medians if missing)
  const latest = patient.readings[patient.readings.length - 1];
  const baselineHr = latest?.heartRate ?? 76;
  const baselineBpSys = latest?.bloodPressureSys ?? 128;
  const baselineBpDia = latest?.bloodPressureDia ?? 80;
  const baselineGlucose = latest?.glucose ?? 115;

  // 1. Sleep Heuristic: Deviations from 8.0 hours
  // Delta per hour difference from optimal 8h:
  // e.g., 5h sleep = -3h deficit => ~ +4 bpm HR, +3.5 mmHg Sys BP
  const sleepDeficit = Math.max(0, 7.5 - inputs.sleepHours);
  const sleepExcess = Math.max(0, inputs.sleepHours - 9.5);
  const sleepHrShift = sleepDeficit * 1.5 + sleepExcess * 0.8;
  const sleepBpShift = sleepDeficit * 1.8 + sleepExcess * 0.5;

  // 2. Activity Heuristic:
  // Sedentary (0-15m) vs active (30-60m)
  // Higher consistent routine physical activity models favorable resting tone:
  // Every 20 mins above 15m up to 60m yields -1.5 bpm resting HR, -1.8 mmHg BP Sys
  const effectiveActivity = Math.min(60, inputs.activityMinutes);
  const activityHrDelta = -((effectiveActivity / 20) * 1.4);
  const activityBpDelta = -((effectiveActivity / 20) * 1.6);

  // 3. Meal Regularity Heuristic:
  // Scale 1 (erratic) to 5 (strictly timed)
  // Level 3 is baseline neutral
  const mealVarianceShift = (3 - inputs.mealRegularity) * 6; // mg/dL shift in simulated volatility

  // Calculate simulated outputs (deterministic)
  const simulatedHr = Math.round(Math.max(50, Math.min(130, baselineHr + sleepHrShift + activityHrDelta)));
  const simulatedBpSys = Math.round(Math.max(90, Math.min(180, baselineBpSys + sleepBpShift + activityBpDelta)));
  const simulatedBpDia = Math.round(Math.max(55, Math.min(110, baselineBpDia + (sleepBpShift * 0.5) + (activityBpDelta * 0.4))));
  const simulatedGlucoseVar = Math.round(Math.max(80, Math.min(240, baselineGlucose + mealVarianceShift)));

  const deltaHr = simulatedHr - baselineHr;
  const deltaBpSys = simulatedBpSys - baselineBpSys;
  const deltaBpDia = simulatedBpDia - baselineBpDia;
  const deltaGlucose = simulatedGlucoseVar - baselineGlucose;

  return {
    patientId: patient.id,
    inputs,
    baselineSummary: `Baseline from ${patient.name} (${latest?.timestamp ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'latest sample'})`,
    metrics: [
      {
        metric: 'Resting Heart Rate',
        unit: 'bpm',
        baseline: baselineHr,
        simulated: simulatedHr,
        delta: deltaHr,
        direction: deltaHr < 0 ? 'favorable' : deltaHr > 0 ? 'unfavorable' : 'neutral',
        explanation: deltaHr < 0
          ? `Decreased by ${Math.abs(deltaHr)} bpm due to increased physical activity and restorative sleep.`
          : deltaHr > 0
          ? `Increased by ${deltaHr} bpm reflecting sleep deficit factor (+${sleepHrShift.toFixed(1)} bpm).`
          : 'Remains unchanged relative to baseline.',
      },
      {
        metric: 'Systolic Blood Pressure',
        unit: 'mmHg',
        baseline: baselineBpSys,
        simulated: simulatedBpSys,
        delta: deltaBpSys,
        direction: deltaBpSys < 0 ? 'favorable' : deltaBpSys > 0 ? 'unfavorable' : 'neutral',
        explanation: deltaBpSys < 0
          ? `Reduced by ${Math.abs(deltaBpSys)} mmHg with moderate physical conditioning.`
          : deltaBpSys > 0
          ? `Elevated by ${deltaBpSys} mmHg modeled under sleep deprivation stress formula.`
          : 'Remains within current baseline tolerance.',
      },
      {
        metric: 'Diastolic Blood Pressure',
        unit: 'mmHg',
        baseline: baselineBpDia,
        simulated: simulatedBpDia,
        delta: deltaBpDia,
        direction: deltaBpDia < 0 ? 'favorable' : deltaBpDia > 0 ? 'unfavorable' : 'neutral',
        explanation: `Shifted by ${deltaBpDia > 0 ? `+${deltaBpDia}` : deltaBpDia} mmHg proportional to peripheral vascular resistance heuristic.`,
      },
      {
        metric: 'Estimated Glycemic Volatility',
        unit: 'mg/dL',
        baseline: baselineGlucose,
        simulated: simulatedGlucoseVar,
        delta: deltaGlucose,
        direction: deltaGlucose < 0 ? 'favorable' : deltaGlucose > 0 ? 'unfavorable' : 'neutral',
        explanation: deltaGlucose < 0
          ? `Reduced excursion by ${Math.abs(deltaGlucose)} mg/dL through meal schedule consistency.`
          : deltaGlucose > 0
          ? `Excursion increased by ${deltaGlucose} mg/dL modeled under irregular meal timing.`
          : 'Standard variance curve maintained.',
      },
    ],
    illustrativeScore: Math.round(
      Math.max(30, Math.min(100, 75 - (sleepHrShift * 2) - (activityHrDelta * 2) + (inputs.mealRegularity * 3)))
    ),
    limitations:
      'This calculation uses an educational algebraic heuristic with fixed multipliers. It is not an AI model, does not use clinical training datasets, does not account for pharmacology or patient pathology, and cannot predict actual physiological outcomes.',
  };
}
