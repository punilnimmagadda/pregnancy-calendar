/**
 * Core interfaces and types for the pregnancy calendar application
 * All medical calculations are based on Last Menstrual Period (LMP) date
 */

/** Theme color options for the application */
export type ThemeColor = 'neutral' | 'boy' | 'girl';

/** View modes for the application */
export type ViewMode = 'summary' | 'table';

/** Export format options */
export type ExportFormat = 'pdf' | 'excel';

/** Trimester classification based on gestational age */
export type Trimester = 'first' | 'second' | 'third';

/**
 * User preferences stored in localStorage
 */
export interface UserPreferences {
  /** Last Menstrual Period date - basis for all calculations */
  lmpDate: string; // ISO date string
  /** Selected theme color */
  themeColor: ThemeColor;
  /** Preferred view mode */
  viewMode: ViewMode;
  /** Date format preference (future enhancement) */
  dateFormat?: string;
}

/**
 * Comprehensive pregnancy day data structure
 * Contains all calculated information for a specific day in pregnancy
 */
export interface PregnancyDay {
  /** Absolute day number (1-280) */
  dayNumber: number;
  /** Calendar date for this pregnancy day */
  date: Date;
  /** Formatted date string (MM/DD/YYYY) */
  formattedDate: string;
  /** Gestational week (1-40) */
  gestationalWeek: number;
  /** Day within the gestational week (1-7) */
  dayOfWeek: number;
  /** Gestational age in format "X weeks Y days" */
  gestationalAge: string;
  /** Calendar month (1-12) */
  calendarMonth: number;
  /** Calendar year */
  calendarYear: number;
  /** Month name */
  monthName: string;
  /** Trimester classification */
  trimester: Trimester;
  /** Fetal development milestone for this day (if any) */
  developmentMilestone?: string;
  /** Estimated fetal weight in grams */
  estimatedFetalWeight?: number;
  /** Estimated fetal length in centimeters */
  estimatedFetalLength?: number;
  /** Recommended appointments or checkups */
  appointments?: string[];
  /** Important notes or reminders */
  notes?: string[];
}

/**
 * Summary information about the current pregnancy status
 */
export interface PregnancySummary {
  /** Current gestational age in weeks and days */
  currentGestationalAge: string;
  /** Current trimester */
  currentTrimester: Trimester;
  /** Days completed in pregnancy */
  daysCompleted: number;
  /** Days remaining until due date */
  daysRemaining: number;
  /** Percentage of pregnancy completed */
  progressPercentage: number;
  /** Estimated due date */
  estimatedDueDate: Date;
  /** Formatted estimated due date */
  formattedDueDate: string;
  /** Key upcoming milestones */
  upcomingMilestones: string[];
  /** Next scheduled appointments */
  nextAppointments: string[];
}

/**
 * Monthly filter data for table view
 */
export interface MonthFilter {
  /** Month number (1-12) */
  month: number;
  /** Year */
  year: number;
  /** Month name */
  monthName: string;
  /** Start date of the month */
  startDate: Date;
  /** End date of the month */
  endDate: Date;
  /** Number of pregnancy days in this month */
  pregnancyDaysCount: number;
  /** Display label for the filter */
  displayLabel: string;
}

/**
 * Fetal development data structure
 * Contains week-by-week development information
 */
export interface FetalDevelopment {
  /** Gestational week */
  week: number;
  /** Development description */
  description: string;
  /** Estimated size comparison */
  sizeComparison?: string;
  /** Estimated weight range in grams */
  weightRange?: { min: number; max: number };
  /** Estimated length range in centimeters */
  lengthRange?: { min: number; max: number };
  /** Key developments for this week */
  keyDevelopments: string[];
}

/**
 * Appointment schedule data
 */
export interface AppointmentSchedule {
  /** Gestational week for the appointment */
  week: number;
  /** Type of appointment */
  appointmentType: string;
  /** Description of what happens during appointment */
  description: string;
  /** Priority level */
  priority: 'routine' | 'important' | 'critical';
}

/**
 * Export data structure for PDF/Excel generation
 */
export interface ExportData {
  /** User preferences at time of export */
  userPreferences: UserPreferences;
  /** Pregnancy summary */
  summary: PregnancySummary;
  /** All pregnancy days data */
  pregnancyDays: PregnancyDay[];
  /** Export timestamp */
  exportTimestamp: Date;
  /** Export format */
  format: ExportFormat;
}

/**
 * Application state interface for managing global state
 */
export interface AppState {
  /** User preferences */
  preferences: UserPreferences | null;
  /** Current view mode */
  currentView: ViewMode;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether data has been initialized */
  isInitialized: boolean;
}
