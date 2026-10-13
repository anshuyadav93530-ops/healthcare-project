/**
 * HealthGuard Application Data Types
 * All data in HealthGuard represents simulated demo data for educational/hackathon demonstration.
 */

export type Priority = 'high' | 'medium' | 'routine';

export type ReviewStatus = 'pending' | 'reviewed' | 'followup';

export type VitalMetricType = 'heartRate' | 'bloodPressure' | 'spO2' | 'temperature' | 'glucose';

export interface VitalReading {
  id: string;
  timestamp: string; // ISO string e.g. "2026-10-13T09:30:00Z"
  heartRate: number | null; // bpm (normal ~60-100)
  bloodPressureSys: number | null; // mmHg (normal <120)
  bloodPressureDia: number | null; // mmHg (normal <80)
  spO2: number | null; // % (normal 95-100)
  temperature: number | null; // °F (normal 97.8-99.1)
  glucose: number | null; // mg/dL (normal 70-140)
  isStale?: boolean;
  isInvalid?: boolean;
  validationError?: string;
  sampleStatus: 'normal' | 'unusual' | 'missing' | 'invalid';
}

export interface PatientHistoryEvent {
  id: string;
  patientId: string;
  timestamp: string;
  type: 'admission' | 'vital_reading' | 'review_status' | 'alert' | 'note';
  title: string;
  description: string;
  badgeText?: string;
  actor?: string; // e.g., "Automated Demo Rule", "Dr. Priya Sharma"
}

export interface ReviewLog {
  id: string;
  timestamp: string;
  reviewer: string;
  status: ReviewStatus;
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  admissionDate: string; // ISO string e.g. "2026-10-09T08:00:00Z"
  room: string;
  primaryCondition: string;
  priority: Priority;
  priorityReason: string; // Transparent rule explanation
  reviewStatus: ReviewStatus;
  reviewNotes: string;
  reviewTriggerRule?: string;
  lastReviewedAt: string | null;
  assignedReviewer: string;
  readings: VitalReading[];
  historyEvents: PatientHistoryEvent[];
  reviewLogs: ReviewLog[];
}

export type DemoScenarioId = 'default' | 'scenarioA' | 'scenarioB' | 'scenarioC';

export interface DemoScenarioConfig {
  id: DemoScenarioId;
  title: string;
  description: string;
  targetPatientId: string;
  badge: string;
}

export interface SimulationInputs {
  sleepHours: number; // 4 to 11
  activityMinutes: number; // 0 to 120
  mealRegularity: number; // 1 to 5 scale
}

export interface SimulationMetricResult {
  metric: string;
  unit: string;
  baseline: number;
  simulated: number;
  delta: number;
  direction: 'favorable' | 'unfavorable' | 'neutral';
  explanation: string;
}

export interface SimulationResult {
  patientId: string;
  inputs: SimulationInputs;
  baselineSummary: string;
  metrics: SimulationMetricResult[];
  illustrativeScore: number;
  limitations: string;
}

export interface DataQualitySummary {
  totalRecords: number;
  availableReadings: number;
  missingReadings: number;
  invalidReadings: number;
  staleReadings: number;
  lastUpdateTime: string | null;
  dataSourceDescription: string;
  modelStatus: string;
  issuesList: Array<{
    patientId: string;
    patientName: string;
    issueType: 'missing' | 'stale' | 'invalid';
    details: string;
    timestamp: string;
  }>;
}

export type NavigationPage = 
  | 'dashboard'
  | 'patients'
  | 'monitoring'
  | 'history'
  | 'review'
  | 'simulator'
  | 'status';
