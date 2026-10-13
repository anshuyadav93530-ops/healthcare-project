import { DemoScenarioConfig, VitalReading } from '../types';

export const DEMO_SCENARIO_CONFIGS: DemoScenarioConfig[] = [
  {
    id: 'scenarioA',
    title: 'Scenario A: Normal Stream Readings',
    description: 'Deterministic 5-step playback of nominal vital signs confirming stable recovery telemetry.',
    targetPatientId: 'HG-706', // James Thorne
    badge: 'Nominal Vitals',
  },
  {
    id: 'scenarioB',
    title: 'Scenario B: Missing & Stale Telemetry Stream',
    description: 'Stream with null sensor packets and stale timestamps (>12h old) showing explicit data-gap handling.',
    targetPatientId: 'HG-708', // Robert Garcia
    badge: 'Missing/Stale Telemetry',
  },
  {
    id: 'scenarioC',
    title: 'Scenario C: Unusual Reading Requiring Review',
    description: 'Acute telemetry excursion triggering demo rule HR-TACHY (124 bpm) and sending patient to review queue.',
    targetPatientId: 'HG-704', // David Chen
    badge: 'Rule Review Trigger',
  },
];

export const SCENARIO_A_READINGS: VitalReading[] = [
  {
    id: 'scA-1',
    timestamp: '2026-10-13T09:00:00Z',
    heartRate: 72,
    bloodPressureSys: 118,
    bloodPressureDia: 76,
    spO2: 98,
    temperature: 98.4,
    glucose: 104,
    sampleStatus: 'normal',
  },
  {
    id: 'scA-2',
    timestamp: '2026-10-13T09:15:00Z',
    heartRate: 71,
    bloodPressureSys: 119,
    bloodPressureDia: 77,
    spO2: 99,
    temperature: 98.5,
    glucose: 106,
    sampleStatus: 'normal',
  },
  {
    id: 'scA-3',
    timestamp: '2026-10-13T09:30:00Z',
    heartRate: 70,
    bloodPressureSys: 117,
    bloodPressureDia: 75,
    spO2: 98,
    temperature: 98.4,
    glucose: 102,
    sampleStatus: 'normal',
  },
  {
    id: 'scA-4',
    timestamp: '2026-10-13T09:45:00Z',
    heartRate: 73,
    bloodPressureSys: 120,
    bloodPressureDia: 78,
    spO2: 99,
    temperature: 98.6,
    glucose: 108,
    sampleStatus: 'normal',
  },
  {
    id: 'scA-5',
    timestamp: '2026-10-13T10:00:00Z',
    heartRate: 69,
    bloodPressureSys: 118,
    bloodPressureDia: 76,
    spO2: 99,
    temperature: 98.4,
    glucose: 105,
    sampleStatus: 'normal',
  },
];

export const SCENARIO_B_READINGS: VitalReading[] = [
  {
    id: 'scB-1',
    timestamp: '2026-10-12T16:00:00Z', // 19 hours old (explicitly stale)
    heartRate: 88,
    bloodPressureSys: 136,
    bloodPressureDia: 84,
    spO2: 95,
    temperature: 98.6,
    glucose: 120,
    isStale: true,
    sampleStatus: 'normal',
  },
  {
    id: 'scB-2',
    timestamp: '2026-10-12T20:00:00Z', // 15 hours old (stale)
    heartRate: 92,
    bloodPressureSys: 138,
    bloodPressureDia: 86,
    spO2: 94,
    temperature: 98.7,
    glucose: 126,
    isStale: true,
    sampleStatus: 'normal',
  },
  {
    id: 'scB-3',
    timestamp: '2026-10-13T01:00:00Z',
    heartRate: null, // explicitly missing sensor packet!
    bloodPressureSys: 140,
    bloodPressureDia: 88,
    spO2: null, // explicitly missing
    temperature: 98.8,
    glucose: null,
    sampleStatus: 'missing',
  },
  {
    id: 'scB-4',
    timestamp: '2026-10-13T05:00:00Z',
    heartRate: null, // explicitly missing
    bloodPressureSys: null, // missing cuff reading
    bloodPressureDia: null,
    spO2: 93,
    temperature: 98.9,
    glucose: null,
    sampleStatus: 'missing',
  },
  {
    id: 'scB-5',
    timestamp: '2026-10-13T09:30:00Z',
    heartRate: 104,
    bloodPressureSys: 144,
    bloodPressureDia: 90,
    spO2: 92,
    temperature: 99.1,
    glucose: 132,
    sampleStatus: 'unusual',
  },
];

export const SCENARIO_C_READINGS: VitalReading[] = [
  {
    id: 'scC-1',
    timestamp: '2026-10-13T07:00:00Z',
    heartRate: 72,
    bloodPressureSys: 118,
    bloodPressureDia: 74,
    spO2: 99,
    temperature: 98.4,
    glucose: 95,
    sampleStatus: 'normal',
  },
  {
    id: 'scC-2',
    timestamp: '2026-10-13T07:45:00Z',
    heartRate: 84,
    bloodPressureSys: 122,
    bloodPressureDia: 78,
    spO2: 98,
    temperature: 98.6,
    glucose: 102,
    sampleStatus: 'normal',
  },
  {
    id: 'scC-3',
    timestamp: '2026-10-13T08:30:00Z',
    heartRate: 98,
    bloodPressureSys: 132,
    bloodPressureDia: 82,
    spO2: 97,
    temperature: 98.8,
    glucose: 110,
    sampleStatus: 'unusual',
  },
  {
    id: 'scC-4',
    timestamp: '2026-10-13T09:15:00Z',
    heartRate: 112,
    bloodPressureSys: 142,
    bloodPressureDia: 88,
    spO2: 95,
    temperature: 99.1,
    glucose: 118,
    sampleStatus: 'unusual',
  },
  {
    id: 'scC-5',
    timestamp: '2026-10-13T10:00:00Z',
    heartRate: 124, // triggers HR-TACHY rule >= 120 bpm!
    bloodPressureSys: 154,
    bloodPressureDia: 92,
    spO2: 94,
    temperature: 99.4,
    glucose: 125,
    sampleStatus: 'unusual',
  },
];
