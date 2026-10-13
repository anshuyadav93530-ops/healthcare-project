import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Patient,
  ReviewStatus,
  NavigationPage,
  DemoScenarioId,
  DataQualitySummary,
  VitalReading,
  ReviewLog,
  PatientHistoryEvent,
} from '../types';
import { SEED_PATIENTS } from '../data/seedPatients';
import {
  evaluateDemoPriority,
  isReadingStale,
  validateVitalReading,
  SIMULATED_NOW,
} from '../utils/rules';
import {
  SCENARIO_A_READINGS,
  SCENARIO_B_READINGS,
  SCENARIO_C_READINGS,
} from '../data/demoScenarios';

interface HealthGuardContextType {
  patients: Patient[];
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  selectedPatient: Patient | undefined;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Doctor Review actions
  updatePatientReview: (patientId: string, status: ReviewStatus, notes: string) => void;
  
  // Demo Mode state & controls
  activeScenario: DemoScenarioId;
  playbackStep: number;
  maxPlaybackSteps: number;
  isPlaying: boolean;
  loadDemoScenario: (scenarioId: DemoScenarioId) => void;
  startPlayback: () => void;
  pausePlayback: () => void;
  stepForward: () => void;
  resetCurrentScenario: () => void;
  returnToDefaultDataset: () => void;
  isDemoModeModalOpen: boolean;
  setIsDemoModeModalOpen: (open: boolean) => void;
  
  // Computed summaries
  dataQualitySummary: DataQualitySummary;
  totalPatientsCount: number;
  pendingReviewsCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  routinePriorityCount: number;

  // Active Toast / Alert Banner
  activeToast: { message: string; type: 'info' | 'success' | 'warning' | 'alert'; actionLabel?: string; onAction?: () => void } | null;
  dismissToast: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'alert', actionLabel?: string, onAction?: () => void) => void;
}

const HealthGuardContext = createContext<HealthGuardContextType | undefined>(undefined);

const LOCAL_STORAGE_REVIEWS_KEY = 'healthguard_demo_reviews_v1';
const LOCAL_STORAGE_THEME_KEY = 'healthguard_theme_v1';

export const HealthGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Default clean clinical light theme
    } catch {
      return 'light';
    }
  });

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    } catch {
      // ignore localstorage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation state
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('HG-701');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast notifications
  const [activeToast, setActiveToast] = useState<{
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info', actionLabel?: string, onAction?: () => void) => {
      setActiveToast({ message, type, actionLabel, onAction });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Persistent Doctor Reviews map
  const [savedReviews, setSavedReviews] = useState<Record<string, {
    status: ReviewStatus;
    notes: string;
    lastReviewedAt: string | null;
    logs: ReviewLog[];
  }>>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {};
  });

  // Demo Mode state
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('default');
  const [playbackStep, setPlaybackStep] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDemoModeModalOpen, setIsDemoModeModalOpen] = useState<boolean>(false);
  const playbackTimerRef = useRef<number | null>(null);

  // Base patients initialized from SEED_PATIENTS, merged with saved reviews
  const [basePatients, setBasePatients] = useState<Patient[]>(() => {
    return SEED_PATIENTS.map((p) => {
      const saved = savedReviews[p.id];
      if (saved) {
        return {
          ...p,
          reviewStatus: saved.status,
          reviewNotes: saved.notes,
          lastReviewedAt: saved.lastReviewedAt,
          reviewLogs: saved.logs.length > 0 ? saved.logs : p.reviewLogs,
        };
      }
      return p;
    });
  });

  // Keep basePatients in sync if savedReviews changes
  useEffect(() => {
    setBasePatients((prev) =>
      prev.map((p) => {
        const saved = savedReviews[p.id];
        if (saved) {
          return {
            ...p,
            reviewStatus: saved.status,
            reviewNotes: saved.notes,
            lastReviewedAt: saved.lastReviewedAt,
            reviewLogs: saved.logs.length > 0 ? saved.logs : p.reviewLogs,
          };
        }
        return p;
      })
    );
  }, [savedReviews]);

  // Derived current patients taking active scenario & playback step into account
  const patients = useMemo(() => {
    if (activeScenario === 'default') {
      return basePatients;
    }

    return basePatients.map((p) => {
      if (activeScenario === 'scenarioA' && p.id === 'HG-706') {
        const streamReadings = SCENARIO_A_READINGS.slice(0, playbackStep);
        const latest = streamReadings[streamReadings.length - 1];
        const { priority, reason } = evaluateDemoPriority(latest);
        return {
          ...p,
          readings: streamReadings,
          priority,
          priorityReason: reason,
        };
      }

      if (activeScenario === 'scenarioB' && p.id === 'HG-708') {
        const streamReadings = SCENARIO_B_READINGS.slice(0, playbackStep);
        const latest = streamReadings[streamReadings.length - 1];
        const { priority, reason } = evaluateDemoPriority(latest);
        return {
          ...p,
          readings: streamReadings,
          priority,
          priorityReason: reason,
        };
      }

      if (activeScenario === 'scenarioC' && p.id === 'HG-704') {
        const streamReadings = SCENARIO_C_READINGS.slice(0, playbackStep);
        const latest = streamReadings[streamReadings.length - 1];
        const { priority, reason } = evaluateDemoPriority(latest);

        // If step >= 5, acute review trigger rule is satisfied
        const triggerPending = playbackStep >= 5;

        return {
          ...p,
          readings: streamReadings,
          priority,
          priorityReason: reason,
          reviewStatus: triggerPending && p.reviewStatus !== 'reviewed' ? 'pending' : p.reviewStatus,
          reviewTriggerRule: triggerPending ? 'Rule HR-TACHY (Heart Rate >= 120 bpm)' : p.reviewTriggerRule,
        };
      }

      return p;
    });
  }, [basePatients, activeScenario, playbackStep]);

  // Currently selected patient object
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Doctor Review Update handler
  const updatePatientReview = useCallback((patientId: string, status: ReviewStatus, notes: string) => {
    const timestamp = new Date().toISOString();
    const newLog: ReviewLog = {
      id: `log-${Date.now()}`,
      timestamp,
      reviewer: 'Dr. Priya Sharma, MD',
      status,
      notes,
    };

    const newHistoryEvent: PatientHistoryEvent = {
      id: `he-${Date.now()}`,
      patientId,
      timestamp,
      type: 'review_status',
      title: `Status Changed to ${status.toUpperCase()}`,
      description: notes || `Review status updated by Dr. Priya Sharma.`,
      actor: 'Dr. Priya Sharma, MD',
    };

    setSavedReviews((prev) => {
      const existingLogs = prev[patientId]?.logs || [];
      const updated = {
        ...prev,
        [patientId]: {
          status,
          notes,
          lastReviewedAt: timestamp,
          logs: [newLog, ...existingLogs],
        },
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Also append history event into basePatients
    setBasePatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            reviewStatus: status,
            reviewNotes: notes,
            lastReviewedAt: timestamp,
            historyEvents: [newHistoryEvent, ...p.historyEvents],
            reviewLogs: [newLog, ...p.reviewLogs],
          };
        }
        return p;
      })
    );

    showToast(`Saved review for patient ${patientId} as "${status.toUpperCase()}"`, 'success');
  }, [showToast]);

  // Demo playback controls
  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current !== null) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    clearPlaybackTimer();
  }, [clearPlaybackTimer]);

  const stepForward = useCallback(() => {
    setPlaybackStep((prev) => {
      if (prev < 5) {
        return prev + 1;
      }
      // Reached end of sequence
      setIsPlaying(false);
      clearPlaybackTimer();
      return prev;
    });
  }, [clearPlaybackTimer]);

  const startPlayback = useCallback(() => {
    clearPlaybackTimer();
    setIsPlaying(true);

    // If already at end, rewind to step 1
    if (playbackStep >= 5) {
      setPlaybackStep(1);
    }

    playbackTimerRef.current = window.setInterval(() => {
      setPlaybackStep((prev) => {
        if (prev < 5) {
          const next = prev + 1;
          if (next === 5 && activeScenario === 'scenarioC') {
            showToast(
              'Scenario C Alert: Acute Tachycardia Rule Triggered! (HR 124 bpm)',
              'alert',
              'Open Doctor Review',
              () => {
                setSelectedPatientId('HG-704');
                setActivePage('review');
              }
            );
          }
          return next;
        } else {
          setIsPlaying(false);
          clearPlaybackTimer();
          return 5;
        }
      });
    }, 2200);
  }, [clearPlaybackTimer, playbackStep, activeScenario, showToast]);

  // Load a specific scenario
  const loadDemoScenario = useCallback((scenarioId: DemoScenarioId) => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setActiveScenario(scenarioId);
    setPlaybackStep(1);

    if (scenarioId === 'scenarioA') {
      setSelectedPatientId('HG-706');
      showToast('Loaded Scenario A: Normal Readings Stream', 'info');
    } else if (scenarioId === 'scenarioB') {
      setSelectedPatientId('HG-708');
      showToast('Loaded Scenario B: Missing & Stale Telemetry Stream', 'warning');
    } else if (scenarioId === 'scenarioC') {
      setSelectedPatientId('HG-704');
      showToast('Loaded Scenario C: Unusual Reading Requiring Review', 'alert');
    } else {
      showToast('Returned to default demo dataset', 'info');
    }
  }, [clearPlaybackTimer, showToast]);

  // Reset current scenario to step 1 (without erasing doctor reviews or patient records)
  const resetCurrentScenario = useCallback(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setPlaybackStep(1);
    showToast('Reset current scenario playback to step 1', 'info');
  }, [clearPlaybackTimer, showToast]);

  // Return to default dataset
  const returnToDefaultDataset = useCallback(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setActiveScenario('default');
    setPlaybackStep(5);
    showToast('Restored default demo dataset', 'info');
  }, [clearPlaybackTimer, showToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearPlaybackTimer();
    };
  }, [clearPlaybackTimer]);

  // Computed summary metrics
  const totalPatientsCount = patients.length;
  const pendingReviewsCount = patients.filter((p) => p.reviewStatus === 'pending').length;
  const highPriorityCount = patients.filter((p) => p.priority === 'high').length;
  const mediumPriorityCount = patients.filter((p) => p.priority === 'medium').length;
  const routinePriorityCount = patients.filter((p) => p.priority === 'routine').length;

  // Real computed Data Quality Summary
  const dataQualitySummary = useMemo<DataQualitySummary>(() => {
    let totalReadingsCount = 0;
    let missingReadingsCount = 0;
    let availableReadingsCount = 0;
    let invalidReadingsCount = 0;
    let staleReadingsCount = 0;
    let maxTimestamp: string | null = null;
    const issuesList: DataQualitySummary['issuesList'] = [];

    patients.forEach((patient) => {
      patient.readings.forEach((r) => {
        totalReadingsCount++;

        // Track timestamp
        if (!maxTimestamp || new Date(r.timestamp) > new Date(maxTimestamp)) {
          maxTimestamp = r.timestamp;
        }

        // Available vs missing
        const hasAnyValue =
          r.heartRate !== null ||
          r.bloodPressureSys !== null ||
          r.spO2 !== null ||
          r.temperature !== null ||
          r.glucose !== null;

        if (hasAnyValue) {
          availableReadingsCount++;
        }

        // Count missing individual packets
        if (r.heartRate === null || r.spO2 === null || r.bloodPressureSys === null) {
          missingReadingsCount++;
          issuesList.push({
            patientId: patient.id,
            patientName: patient.name,
            issueType: 'missing',
            details: `Null telemetry values in sample record: ${r.heartRate === null ? 'Heart Rate missing. ' : ''}${r.spO2 === null ? 'SpO2 sensor missing. ' : ''}${r.bloodPressureSys === null ? 'BP missing.' : ''}`,
            timestamp: r.timestamp,
          });
        }

        // Validate bounds
        const validation = validateVitalReading(r);
        if (!validation.isValid) {
          invalidReadingsCount++;
          issuesList.push({
            patientId: patient.id,
            patientName: patient.name,
            issueType: 'invalid',
            details: validation.error || 'Out of physiological bounds',
            timestamp: r.timestamp,
          });
        }

        // Stale detection
        if (r.isStale || isReadingStale(r.timestamp, SIMULATED_NOW)) {
          staleReadingsCount++;
          issuesList.push({
            patientId: patient.id,
            patientName: patient.name,
            issueType: 'stale',
            details: `Sample reading is older than the 12-hour freshness threshold (>12h).`,
            timestamp: r.timestamp,
          });
        }
      });
    });

    return {
      totalRecords: totalReadingsCount,
      availableReadings: availableReadingsCount,
      missingReadings: missingReadingsCount,
      invalidReadings: invalidReadingsCount,
      staleReadings: staleReadingsCount,
      lastUpdateTime: maxTimestamp,
      dataSourceDescription: 'Local In-Memory Seed Dataset & Browser LocalStorage',
      modelStatus: 'No trained prediction model connected.',
      issuesList,
    };
  }, [patients]);

  return (
    <HealthGuardContext.Provider
      value={{
        patients,
        activePage,
        setActivePage,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme,
        updatePatientReview,
        activeScenario,
        playbackStep,
        maxPlaybackSteps: 5,
        isPlaying,
        loadDemoScenario,
        startPlayback,
        pausePlayback,
        stepForward,
        resetCurrentScenario,
        returnToDefaultDataset,
        isDemoModeModalOpen,
        setIsDemoModeModalOpen,
        dataQualitySummary,
        totalPatientsCount,
        pendingReviewsCount,
        highPriorityCount,
        mediumPriorityCount,
        routinePriorityCount,
        activeToast,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </HealthGuardContext.Provider>
  );
};

export const useHealthGuard = () => {
  const context = useContext(HealthGuardContext);
  if (!context) {
    throw new Error('useHealthGuard must be used within a HealthGuardProvider');
  }
  return context;
};
