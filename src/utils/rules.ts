import { Priority, VitalReading } from '../types';

/**
 * Standard simulated current reference date for the hackathon dataset.
 * Defaults to current system time if valid, or Oct 13, 2026.
 */
export const SIMULATED_NOW = new Date('2026-10-13T11:00:00Z');

/**
 * Stale reading threshold: readings older than 12 hours from current reference time.
 */
export const STALE_THRESHOLD_HOURS = 12;

/**
 * Dynamic calculation of admission duration from admission date string.
 * Never hardcoded. Calculates elapsed days and hours.
 */
export function calculateAdmissionDuration(admissionDateStr: string, referenceDate: Date = SIMULATED_NOW): string {
  try {
    const admissionDate = new Date(admissionDateStr);
    if (isNaN(admissionDate.getTime())) return 'Unknown duration';

    const diffMs = referenceDate.getTime() - admissionDate.getTime();
    if (diffMs < 0) return 'Just admitted';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (days === 0) {
      return `${remainingHours} hr${remainingHours === 1 ? '' : 's'}`;
    }
    if (remainingHours === 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    return `${days}d ${remainingHours}h`;
  } catch {
    return 'Unknown duration';
  }
}

/**
 * Physiologically impossible boundary validation (Data Quality Rule 1).
 */
export function validateVitalReading(reading: Partial<VitalReading>): { isValid: boolean; error?: string } {
  if (reading.heartRate !== null && reading.heartRate !== undefined) {
    if (reading.heartRate < 30 || reading.heartRate > 240) {
      return { isValid: false, error: `HR ${reading.heartRate} bpm exceeds physiological sanity limit [30-240 bpm]` };
    }
  }

  if (reading.spO2 !== null && reading.spO2 !== undefined) {
    if (reading.spO2 < 40 || reading.spO2 > 100) {
      return { isValid: false, error: `SpO2 ${reading.spO2}% out of bounds [40-100%]` };
    }
  }

  if (reading.bloodPressureSys !== null && reading.bloodPressureSys !== undefined) {
    if (reading.bloodPressureSys < 50 || reading.bloodPressureSys > 260) {
      return { isValid: false, error: `Systolic BP ${reading.bloodPressureSys} mmHg out of physiological bounds [50-260]` };
    }
  }

  if (reading.bloodPressureDia !== null && reading.bloodPressureDia !== undefined) {
    if (reading.bloodPressureDia < 30 || reading.bloodPressureDia > 160) {
      return { isValid: false, error: `Diastolic BP ${reading.bloodPressureDia} mmHg out of bounds [30-160]` };
    }
  }

  if (reading.temperature !== null && reading.temperature !== undefined) {
    if (reading.temperature < 92 || reading.temperature > 108) {
      return { isValid: false, error: `Temperature ${reading.temperature}°F out of bounds [92-108°F]` };
    }
  }

  if (reading.glucose !== null && reading.glucose !== undefined) {
    if (reading.glucose < 25 || reading.glucose > 650) {
      return { isValid: false, error: `Glucose ${reading.glucose} mg/dL out of bounds [25-650]` };
    }
  }

  return { isValid: true };
}

/**
 * Check if a timestamp is stale based on the 12-hour demo threshold.
 */
export function isReadingStale(timestampStr: string, referenceDate: Date = SIMULATED_NOW): boolean {
  try {
    const readingDate = new Date(timestampStr);
    if (isNaN(readingDate.getTime())) return true;
    const diffHours = (referenceDate.getTime() - readingDate.getTime()) / (1000 * 60 * 60);
    return diffHours > STALE_THRESHOLD_HOURS;
  } catch {
    return true;
  }
}

/**
 * Transparent, configurable demo rule for determining priority from latest reading.
 * Note: Explains why a patient has a given priority. Not a clinical diagnosis.
 */
export function evaluateDemoPriority(latest: VitalReading | undefined): { priority: Priority; reason: string } {
  if (!latest) {
    return {
      priority: 'routine',
      reason: 'No telemetry readings logged yet. Default routine triage queue.',
    };
  }

  // Check physiological validity first
  const validation = validateVitalReading(latest);
  if (!validation.isValid) {
    return {
      priority: 'high',
      reason: `Data Quality Alert: ${validation.error}. Requires device calibration & nurse review.`,
    };
  }

  // High Priority Rule checks
  if (latest.spO2 !== null && latest.spO2 < 93) {
    return {
      priority: 'high',
      reason: `Rule SPO2-CRIT: SpO2 reading of ${latest.spO2}% is below 93% threshold. Prompt clinical review recommended.`,
    };
  }
  if (latest.bloodPressureSys !== null && latest.bloodPressureSys >= 155) {
    return {
      priority: 'high',
      reason: `Rule BP-HYPER: Systolic BP ${latest.bloodPressureSys} mmHg exceeds 155 mmHg threshold.`,
    };
  }
  if (latest.heartRate !== null && latest.heartRate >= 120) {
    return {
      priority: 'high',
      reason: `Rule HR-TACHY: Tachycardic sample reading of ${latest.heartRate} bpm (threshold >= 120 bpm).`,
    };
  }
  if (latest.glucose !== null && latest.glucose >= 250) {
    return {
      priority: 'high',
      reason: `Rule GLU-ELEV: Blood glucose reading of ${latest.glucose} mg/dL exceeds 250 mg/dL threshold.`,
    };
  }

  // Medium Priority Rule checks
  if (latest.bloodPressureSys !== null && latest.bloodPressureSys >= 135) {
    return {
      priority: 'medium',
      reason: `Rule BP-ELEV: Systolic BP ${latest.bloodPressureSys} mmHg falls within pre-hypertensive window (135–154 mmHg).`,
    };
  }
  if (latest.heartRate !== null && (latest.heartRate > 100 || latest.heartRate < 55)) {
    return {
      priority: 'medium',
      reason: `Rule HR-BORDER: Heart rate ${latest.heartRate} bpm outside nominal baseline window (55–100 bpm).`,
    };
  }
  if (latest.spO2 !== null && latest.spO2 >= 93 && latest.spO2 <= 95) {
    return {
      priority: 'medium',
      reason: `Rule SPO2-BORDER: SpO2 reading of ${latest.spO2}% in borderline sample range (93–95%).`,
    };
  }
  if (latest.glucose !== null && latest.glucose >= 160) {
    return {
      priority: 'medium',
      reason: `Rule GLU-BORDER: Glucose ${latest.glucose} mg/dL moderately elevated above postprandial window (160–249 mg/dL).`,
    };
  }

  // Routine Priority
  return {
    priority: 'routine',
    reason: 'Rule NOMINAL-ALL: All recorded sample vitals remain within designated nominal reference bounds.',
  };
}

/**
 * Format relative or absolute timestamp nicely.
 */
export function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}

export function formatDateOnly(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
}
