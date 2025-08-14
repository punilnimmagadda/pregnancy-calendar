import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PregnancyDay, UserPreferences, MonthFilter } from '../../models/pregnancy.models';
import { PregnancyCalculatorService } from '../../services/pregnancy-calculator/pregnancy-calculator.service';
import { parseLocalDate } from '../../utilities/parse-date';

/**
 * Table view component that displays detailed pregnancy calendar
 * Shows all 280 days with filtering by month capability
 */
@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
})
export class TableViewComponent implements OnInit, OnChanges {
  @Input() pregnancyDays: PregnancyDay[] | null = null;
  @Input() preferences: UserPreferences | null = null;

  monthFilters: MonthFilter[] = [];
  selectedMonthFilter: string = '';
  filteredDays: PregnancyDay[] = [];

  constructor(private pregnancyCalculatorService: PregnancyCalculatorService) {}

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pregnancyDays']) {
      this.initializeData();
    }
  }

  /**
   * Initializes component data when pregnancy days are available
   * @private
   */
  private initializeData(): void {
    if (!this.pregnancyDays || !this.preferences?.lmpDate) {
      this.monthFilters = [];
      this.filteredDays = [];
      return;
    }

    // Generate month filters
    const lmpDate = parseLocalDate(this.preferences.lmpDate);
    this.monthFilters = this.pregnancyCalculatorService.generateMonthFilters(lmpDate);

    // Initialize filtered days
    this.filteredDays = [...this.pregnancyDays];
  }

  /**
   * Handles month filter change
   */
  onMonthFilterChange(): void {
    if (!this.pregnancyDays) return;

    if (!this.selectedMonthFilter) {
      this.filteredDays = [...this.pregnancyDays];
    } else {
      const selectedFilter = this.getSelectedMonthInfo();
      if (selectedFilter) {
        this.filteredDays = this.pregnancyCalculatorService.filterByMonth(
          this.pregnancyDays,
          selectedFilter
        );
      }
    }
  }

  /**
   * Clears the month filter
   */
  clearFilter(): void {
    this.selectedMonthFilter = '';
    this.onMonthFilterChange();
  }

  /**
   * Gets the currently selected month filter info
   * @returns Selected MonthFilter or undefined
   */
  getSelectedMonthInfo(): MonthFilter | undefined {
    if (!this.selectedMonthFilter) return undefined;
    return this.monthFilters.find(filter => this.getFilterKey(filter) === this.selectedMonthFilter);
  }

  /**
   * Generates a unique key for month filter
   * @param filter - MonthFilter object
   * @returns Unique filter key
   */
  getFilterKey(filter: MonthFilter): string {
    return `${filter.year}-${filter.month.toString().padStart(2, '0')}`;
  }

  /**
   * Gets display-friendly trimester name
   * @param trimester - Trimester identifier
   * @returns Formatted trimester name
   */
  getTrismesterDisplay(trimester: string): string {
    const trimesterMap: { [key: string]: string } = {
      first: '1st',
      second: '2nd',
      third: '3rd',
    };
    return trimesterMap[trimester] || '—';
  }

  /**
   * Gets total count of days being displayed
   * @returns Number of days
   */
  getTotalDaysCount(): number {
    return this.filteredDays.length;
  }

  /**
   * Gets count of days with milestones
   * @returns Number of milestone days
   */
  getMilestonesCount(): number {
    return this.filteredDays.filter(day => day.developmentMilestone).length;
  }

  /**
   * Gets count of days with appointments
   * @returns Number of appointment days
   */
  getAppointmentsCount(): number {
    return this.filteredDays.filter(day => day.appointments && day.appointments.length > 0).length;
  }

  /**
   * Track by function for pregnancy days
   * @param index - Array index
   * @param day - PregnancyDay object
   * @returns Unique identifier
   */
  trackByDay(index: number, day: PregnancyDay): number {
    return day.dayNumber;
  }

  /**
   * Track by function for month filters
   * @param index - Array index
   * @param filter - MonthFilter object
   * @returns Unique identifier
   */
  trackByMonthFilter(index: number, filter: MonthFilter): string {
    return this.getFilterKey(filter);
  }
}
