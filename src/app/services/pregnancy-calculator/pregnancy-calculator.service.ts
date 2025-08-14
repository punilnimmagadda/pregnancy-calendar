import { Injectable } from '@angular/core';
import {
  PregnancyDay,
  PregnancySummary,
  MonthFilter,
  Trimester,
  FetalDevelopment,
  AppointmentSchedule,
} from '../../models/pregnancy.models';

/**
 * Service responsible for all pregnancy-related calculations
 * Based on medical standard of 280 days (40 weeks) from Last Menstrual Period (LMP)
 */
@Injectable({
  providedIn: 'root',
})
export class PregnancyCalculatorService {
  /** Standard pregnancy duration in days */
  private readonly PREGNANCY_DURATION_DAYS = 280;

  /** Standard pregnancy duration in weeks */
  private readonly PREGNANCY_DURATION_WEEKS = 40;

  /** Days per week */
  private readonly DAYS_PER_WEEK = 7;

  /** Month names for display */
  private readonly MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /**
   * Calculates the estimated due date from LMP
   * @param lmpDate - Last Menstrual Period date
   * @returns Estimated due date
   */
  calculateDueDate(lmpDate: Date): Date {
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + this.PREGNANCY_DURATION_DAYS);
    return dueDate;
  }

  /**
   * Calculates gestational age from LMP to a given date
   * @param lmpDate - Last Menstrual Period date
   * @param currentDate - Date to calculate gestational age for (defaults to today)
   * @returns Object containing weeks, days, and formatted string
   */
  calculateGestationalAge(
    lmpDate: Date,
    currentDate: Date = new Date()
  ): {
    weeks: number;
    days: number;
    totalDays: number;
    formatted: string;
  } {
    lmpDate = new Date(lmpDate.getFullYear(), lmpDate.getMonth(), lmpDate.getDate());
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const timeDifference = currentDate.getTime() - lmpDate.getTime();
    const totalDays = Math.round(timeDifference / (1000 * 60 * 60 * 24));

    const weeks = Math.floor(totalDays / this.DAYS_PER_WEEK);
    const days = totalDays % this.DAYS_PER_WEEK;

    const formatted = `${weeks} weeks ${days + 1} days`;

    return { weeks, days, totalDays, formatted };
  }

  /**
   * Determines which trimester based on gestational weeks
   * @param gestationalWeeks - Number of completed gestational weeks
   * @returns Trimester classification
   */
  getTrimester(gestationalWeeks: number): Trimester {
    if (gestationalWeeks < 13) return 'first';
    if (gestationalWeeks < 27) return 'second';
    return 'third';
  }

  /**
   * Generates complete pregnancy calendar data for all 280 days
   * @param lmpDate - Last Menstrual Period date
   * @returns Array of PregnancyDay objects for entire pregnancy
   */
  generatePregnancyCalendar(lmpDate: Date): PregnancyDay[] {
    const pregnancyDays: PregnancyDay[] = [];
    const baseDate = new Date(lmpDate);

    for (let dayNumber = 1; dayNumber <= this.PREGNANCY_DURATION_DAYS; dayNumber++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + dayNumber - 1);

      const gestationalAge = this.calculateGestationalAge(lmpDate, currentDate);
      const gestationalWeek = gestationalAge.weeks + 1; // Week numbering starts at 1
      const dayOfWeek = gestationalAge.days + 1; // Day of week starts at 1
      const trimester = this.getTrimester(gestationalAge.weeks);

      const pregnancyDay: PregnancyDay = {
        dayNumber,
        date: currentDate,
        formattedDate: this.formatDate(currentDate),
        gestationalWeek,
        dayOfWeek,
        gestationalAge: gestationalAge.formatted,
        calendarMonth: currentDate.getMonth() + 1,
        calendarYear: currentDate.getFullYear(),
        monthName: this.MONTH_NAMES[currentDate.getMonth()],
        trimester,
        developmentMilestone: this.getDevelopmentMilestone(gestationalWeek, dayOfWeek),
        estimatedFetalWeight: this.getEstimatedFetalWeight(gestationalWeek),
        estimatedFetalLength: this.getEstimatedFetalLength(gestationalWeek),
        appointments: this.getAppointmentsForWeek(gestationalWeek),
        notes: this.getNotesForWeek(gestationalWeek),
      };

      pregnancyDays.push(pregnancyDay);
    }

    return pregnancyDays;
  }

  /**
   * Generates pregnancy summary for current status
   * @param lmpDate - Last Menstrual Period date
   * @returns PregnancySummary object with current status
   */
  generatePregnancySummary(lmpDate: Date): PregnancySummary {
    const currentDate = new Date();
    const gestationalAge = this.calculateGestationalAge(lmpDate, currentDate);
    const dueDate = this.calculateDueDate(lmpDate);
    const trimester = this.getTrimester(gestationalAge.weeks);

    const daysRemaining = Math.max(
      0,
      Math.floor((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const progressPercentage = Math.min(
      100,
      Math.round((gestationalAge.totalDays / this.PREGNANCY_DURATION_DAYS) * 100)
    );

    return {
      currentGestationalAge: gestationalAge.formatted,
      currentTrimester: trimester,
      daysCompleted: gestationalAge.totalDays,
      daysRemaining,
      progressPercentage,
      estimatedDueDate: dueDate,
      formattedDueDate: this.formatDate(dueDate),
      upcomingMilestones: this.getUpcomingMilestones(gestationalAge.weeks),
      nextAppointments: this.getNextAppointments(gestationalAge.weeks),
    };
  }

  /**
   * Generates month filter options for table view
   * @param lmpDate - Last Menstrual Period date
   * @returns Array of MonthFilter objects
   */
  generateMonthFilters(lmpDate: Date): MonthFilter[] {
    const filters: MonthFilter[] = [];
    const pregnancyDays = this.generatePregnancyCalendar(lmpDate);

    // Group days by month and year
    const monthGroups = new Map<string, PregnancyDay[]>();

    pregnancyDays.forEach(day => {
      const key = `${day.calendarYear}-${day.calendarMonth.toString().padStart(2, '0')}`;
      if (!monthGroups.has(key)) {
        monthGroups.set(key, []);
      }
      monthGroups.get(key)?.push(day);
    });

    // Create filter objects
    monthGroups.forEach((days, key) => {
      const [year, monthStr] = key.split('-');
      const month = parseInt(monthStr, 10);
      const firstDay = days[0];
      const lastDay = days[days.length - 1];

      filters.push({
        month,
        year: parseInt(year, 10),
        monthName: this.MONTH_NAMES[month - 1],
        startDate: firstDay.date,
        endDate: lastDay.date,
        pregnancyDaysCount: days.length,
        displayLabel: `${this.MONTH_NAMES[month - 1]} ${year} (${days.length} days)`,
      });
    });

    // Sort by date
    return filters.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Filters pregnancy days by selected month
   * @param pregnancyDays - All pregnancy days
   * @param monthFilter - Selected month filter
   * @returns Filtered pregnancy days for the selected month
   */
  filterByMonth(pregnancyDays: PregnancyDay[], monthFilter: MonthFilter): PregnancyDay[] {
    return pregnancyDays.filter(
      day => day.calendarMonth === monthFilter.month && day.calendarYear === monthFilter.year
    );
  }

  /**
   * Formats date in MM/DD/YYYY format
   * @param date - Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Gets development milestone for specific gestational week and day
   * @param gestationalWeek - Gestational week number
   * @param dayOfWeek - Day of the week (1-7)
   * @returns Development milestone description or undefined
   */
  private getDevelopmentMilestone(gestationalWeek: number, dayOfWeek: number): string | undefined {
    const developmentData = this.getFetalDevelopmentData();
    const weekData = developmentData.find(data => data.week === gestationalWeek);

    // Return milestone only on first day of the week to avoid repetition
    if (dayOfWeek === 1 && weekData) {
      return weekData.description;
    }

    return undefined;
  }

  /**
   * Gets estimated fetal weight for gestational week
   * @param gestationalWeek - Gestational week number
   * @returns Estimated weight in grams or undefined
   */
  private getEstimatedFetalWeight(gestationalWeek: number): number | undefined {
    const developmentData = this.getFetalDevelopmentData();
    const weekData = developmentData.find(data => data.week === gestationalWeek);

    if (weekData?.weightRange) {
      // Return average of the range
      return Math.round((weekData.weightRange.min + weekData.weightRange.max) / 2);
    }

    return undefined;
  }

  /**
   * Gets estimated fetal length for gestational week
   * @param gestationalWeek - Gestational week number
   * @returns Estimated length in centimeters or undefined
   */
  private getEstimatedFetalLength(gestationalWeek: number): number | undefined {
    const developmentData = this.getFetalDevelopmentData();
    const weekData = developmentData.find(data => data.week === gestationalWeek);

    if (weekData?.lengthRange) {
      // Return average of the range
      return Math.round((weekData.lengthRange.min + weekData.lengthRange.max) / 2);
    }

    return undefined;
  }

  /**
   * Gets appointment recommendations for specific gestational week
   * @param gestationalWeek - Gestational week number
   * @returns Array of appointment descriptions
   */
  private getAppointmentsForWeek(gestationalWeek: number): string[] {
    const appointmentSchedule = this.getAppointmentScheduleData();
    return appointmentSchedule
      .filter(appt => appt.week === gestationalWeek)
      .map(appt => `${appt.appointmentType}: ${appt.description}`);
  }

  /**
   * Gets notes and reminders for specific gestational week
   * @param gestationalWeek - Gestational week number
   * @returns Array of notes
   */
  private getNotesForWeek(gestationalWeek: number): string[] {
    const notes: string[] = [];

    // Add trimester transition notes
    if (gestationalWeek === 13) {
      notes.push('Welcome to the second trimester!');
    } else if (gestationalWeek === 27) {
      notes.push('Welcome to the third trimester!');
    }

    // Add viability milestone
    if (gestationalWeek === 24) {
      notes.push('Viability milestone reached - baby has survival chances if born now');
    }

    // Add term pregnancy note
    if (gestationalWeek === 37) {
      notes.push('Baby is now considered full-term');
    }

    return notes;
  }

  /**
   * Gets upcoming milestones based on current gestational week
   * @param currentWeek - Current gestational week
   * @returns Array of upcoming milestone descriptions
   */
  private getUpcomingMilestones(currentWeek: number): string[] {
    const milestones = [
      { week: 12, description: 'End of first trimester' },
      { week: 20, description: 'Anatomy scan' },
      { week: 24, description: 'Viability milestone' },
      { week: 28, description: 'Third trimester begins' },
      { week: 32, description: 'Rapid brain development' },
      { week: 36, description: 'Baby considered full-term soon' },
      { week: 40, description: 'Due date' },
    ];

    return milestones
      .filter(milestone => milestone.week > currentWeek)
      .slice(0, 3) // Show only next 3 milestones
      .map(milestone => `Week ${milestone.week}: ${milestone.description}`);
  }

  /**
   * Gets next scheduled appointments based on current gestational week
   * @param currentWeek - Current gestational week
   * @returns Array of next appointment descriptions
   */
  private getNextAppointments(currentWeek: number): string[] {
    const appointmentSchedule = this.getAppointmentScheduleData();

    return appointmentSchedule
      .filter(appt => appt.week > currentWeek)
      .slice(0, 2) // Show only next 2 appointments
      .map(appt => `Week ${appt.week}: ${appt.appointmentType}`);
  }

  /**
   * Returns fetal development data by week
   * @returns Array of FetalDevelopment objects
   */
  private getFetalDevelopmentData(): FetalDevelopment[] {
    return [
      {
        week: 4,
        description: 'Embryo implants in uterine wall',
        sizeComparison: 'Poppy seed',
        weightRange: { min: 0, max: 0 },
        lengthRange: { min: 0.1, max: 0.2 },
        keyDevelopments: ['Neural tube formation begins', 'Heart starts to develop'],
      },
      {
        week: 8,
        description: 'All major organs have begun to form',
        sizeComparison: 'Raspberry',
        weightRange: { min: 1, max: 2 },
        lengthRange: { min: 1.6, max: 2.0 },
        keyDevelopments: ['Limb buds appear', 'Facial features developing'],
      },
      {
        week: 12,
        description: 'Fetus can make movements',
        sizeComparison: 'Plum',
        weightRange: { min: 14, max: 20 },
        lengthRange: { min: 5.4, max: 6.5 },
        keyDevelopments: ['Reflexes develop', 'Kidneys start producing urine'],
      },
      {
        week: 16,
        description: 'Baby can hear sounds from outside',
        sizeComparison: 'Avocado',
        weightRange: { min: 100, max: 140 },
        lengthRange: { min: 10.9, max: 12.0 },
        keyDevelopments: ['Hearing develops', 'Limbs are fully formed'],
      },
      {
        week: 20,
        description: 'Halfway point - anatomy scan time',
        sizeComparison: 'Banana',
        weightRange: { min: 260, max: 350 },
        lengthRange: { min: 16.4, max: 18.0 },
        keyDevelopments: ['Sex can be determined', 'Taste buds develop'],
      },
      {
        week: 24,
        description: 'Viability milestone reached',
        sizeComparison: 'Corn on the cob',
        weightRange: { min: 600, max: 750 },
        lengthRange: { min: 21.0, max: 23.0 },
        keyDevelopments: ['Lungs begin producing surfactant', 'Hearing is well developed'],
      },
      {
        week: 28,
        description: 'Third trimester begins',
        sizeComparison: 'Eggplant',
        weightRange: { min: 1000, max: 1200 },
        lengthRange: { min: 25.0, max: 27.0 },
        keyDevelopments: ['Eyes can open', 'Brain tissue increases rapidly'],
      },
      {
        week: 32,
        description: 'Rapid brain development continues',
        sizeComparison: 'Jicama',
        weightRange: { min: 1700, max: 1900 },
        lengthRange: { min: 28.0, max: 30.0 },
        keyDevelopments: ['Bones harden', 'Toenails and fingernails grow'],
      },
      {
        week: 36,
        description: 'Baby is getting ready for birth',
        sizeComparison: 'Romaine lettuce',
        weightRange: { min: 2600, max: 2900 },
        lengthRange: { min: 32.0, max: 34.0 },
        keyDevelopments: ['Immune system develops', 'Fat continues to accumulate'],
      },
      {
        week: 40,
        description: 'Full term - ready for birth',
        sizeComparison: 'Small pumpkin',
        weightRange: { min: 3200, max: 3600 },
        lengthRange: { min: 48.0, max: 52.0 },
        keyDevelopments: ['Fully developed', 'Ready for life outside the womb'],
      },
    ];
  }

  /**
   * Returns appointment schedule data
   * @returns Array of AppointmentSchedule objects
   */
  private getAppointmentScheduleData(): AppointmentSchedule[] {
    return [
      {
        week: 8,
        appointmentType: 'First Prenatal Visit',
        description: 'Confirm pregnancy, medical history, initial tests',
        priority: 'critical',
      },
      {
        week: 12,
        appointmentType: 'First Trimester Screening',
        description: 'NT scan and blood work for genetic screening',
        priority: 'important',
      },
      {
        week: 16,
        appointmentType: 'Routine Checkup',
        description: 'Blood pressure, weight, fundal height measurement',
        priority: 'routine',
      },
      {
        week: 20,
        appointmentType: 'Anatomy Scan',
        description: "Detailed ultrasound to check baby's development",
        priority: 'critical',
      },
      {
        week: 24,
        appointmentType: 'Glucose Screening',
        description: 'Test for gestational diabetes',
        priority: 'important',
      },
      {
        week: 28,
        appointmentType: 'Third Trimester Begin',
        description: 'Routine checkup, discuss birth plan',
        priority: 'important',
      },
      {
        week: 32,
        appointmentType: 'Routine Checkup',
        description: "Monitor baby's growth and position",
        priority: 'routine',
      },
      {
        week: 36,
        appointmentType: 'Group B Strep Test',
        description: 'Screen for Group B Streptococcus bacteria',
        priority: 'important',
      },
      {
        week: 38,
        appointmentType: 'Pre-delivery Checkup',
        description: 'Check cervix, discuss delivery options',
        priority: 'important',
      },
      {
        week: 40,
        appointmentType: 'Due Date Assessment',
        description: 'Evaluate if induction is needed',
        priority: 'critical',
      },
    ];
  }
}
