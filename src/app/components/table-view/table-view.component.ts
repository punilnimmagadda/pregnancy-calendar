import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PregnancyDay, UserPreferences, MonthFilter } from '../../models/pregnancy.models';
import { PregnancyCalculatorService } from '../../services/pregnancy-calculator/pregnancy-calculator.service';

/**
 * Table view component that displays detailed pregnancy calendar
 * Shows all 280 days with filtering by month capability
 */
@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-view" *ngIf="pregnancyDays && pregnancyDays.length > 0">
      <div class="table-view__container">
        <!-- Header Section -->
        <div class="table-view__header">
          <div class="table-view__title-section">
            <h2 class="table-view__title">Pregnancy Calendar</h2>
            <p class="table-view__subtitle">
              Complete 280-day timeline with milestones and appointments
            </p>
          </div>

          <!-- Filter Controls -->
          <div class="table-view__filters">
            <div class="filter-group">
              <label for="monthFilter" class="filter-label">Filter by Month:</label>
              <select
                id="monthFilter"
                class="form-select filter-select"
                [(ngModel)]="selectedMonthFilter"
                (ngModelChange)="onMonthFilterChange()"
                aria-label="Filter pregnancy calendar by month"
              >
                <option value="">All Months ({{ pregnancyDays.length }} days)</option>
                <option *ngFor="let filter of monthFilters" [value]="getFilterKey(filter)">
                  {{ filter.displayLabel }}
                </option>
              </select>
            </div>

            <!-- Filter Info -->
            <div class="filter-info" *ngIf="selectedMonthFilter">
              <span class="filter-info__text">
                Showing {{ filteredDays.length }} days ({{
                  getSelectedMonthInfo()?.startDate | date: 'MMM d'
                }}
                - {{ getSelectedMonthInfo()?.endDate | date: 'MMM d, y' }})
              </span>
              <button
                type="button"
                class="btn btn--ghost btn--small"
                (click)="clearFilter()"
                aria-label="Clear month filter"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="table-view__table-container">
          <div class="table-wrapper">
            <table class="table table--responsive pregnancy-table" role="table">
              <thead class="table__header">
                <tr class="table__row">
                  <th class="table__header-cell table__header-cell--day" scope="col">Day #</th>
                  <th class="table__header-cell table__header-cell--date" scope="col">Date</th>
                  <th class="table__header-cell table__header-cell--week" scope="col">
                    Gestational Age
                  </th>
                  <th class="table__header-cell table__header-cell--trimester" scope="col">
                    Trimester
                  </th>
                  <th class="table__header-cell table__header-cell--development" scope="col">
                    Development & Notes
                  </th>
                  <th class="table__header-cell table__header-cell--stats" scope="col">
                    Fetal Stats
                  </th>
                  <th class="table__header-cell table__header-cell--appointments" scope="col">
                    Appointments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let day of filteredDays; trackBy: trackByDay"
                  class="table__row pregnancy-table__row"
                  [class]="'pregnancy-table__row--' + day.trimester"
                >
                  <!-- Day Number -->
                  <td class="table__cell table__cell--numeric pregnancy-table__day">
                    <span class="pregnancy-table__day-number">{{ day.dayNumber }}</span>
                  </td>

                  <!-- Date -->
                  <td class="table__cell pregnancy-table__date">
                    <div class="pregnancy-table__date-info">
                      <span class="pregnancy-table__date-primary">
                        {{ day.date | date: 'MMM d' }}
                      </span>
                      <span class="pregnancy-table__date-year">
                        {{ day.date | date: 'yyyy' }}
                      </span>
                    </div>
                  </td>

                  <!-- Gestational Age -->
                  <td class="table__cell pregnancy-table__gestational-age">
                    <div class="pregnancy-table__age-info">
                      <span class="pregnancy-table__age-primary">
                        Week {{ day.gestationalWeek }}
                      </span>
                      <span class="pregnancy-table__age-secondary"> Day {{ day.dayOfWeek }} </span>
                    </div>
                  </td>

                  <!-- Trimester -->
                  <td class="table__cell pregnancy-table__trimester">
                    <span
                      class="pregnancy-table__trimester-badge"
                      [class]="'pregnancy-table__trimester-badge--' + day.trimester"
                    >
                      {{ getTrismesterDisplay(day.trimester) }}
                    </span>
                  </td>

                  <!-- Development & Milestones -->
                  <td class="table__cell pregnancy-table__development">
                    <div class="pregnancy-table__development-content">
                      <div *ngIf="day.developmentMilestone" class="pregnancy-table__milestone">
                        <span class="pregnancy-table__milestone-icon" aria-hidden="true">🎯</span>
                        <span class="pregnancy-table__milestone-text">
                          {{ day.developmentMilestone }}
                        </span>
                      </div>

                      <div *ngIf="day.notes && day.notes.length > 0" class="pregnancy-table__notes">
                        <div *ngFor="let note of day.notes" class="pregnancy-table__note">
                          <span class="pregnancy-table__note-icon" aria-hidden="true">💡</span>
                          <span class="pregnancy-table__note-text">{{ note }}</span>
                        </div>
                      </div>

                      <div
                        *ngIf="!day.developmentMilestone && (!day.notes || day.notes.length === 0)"
                        class="pregnancy-table__no-content"
                      >
                        <span class="text--muted">—</span>
                      </div>
                    </div>
                  </td>

                  <!-- Fetal Statistics -->
                  <td class="table__cell pregnancy-table__stats">
                    <div class="pregnancy-table__stats-content">
                      <div *ngIf="day.estimatedFetalWeight" class="pregnancy-table__stat">
                        <span class="pregnancy-table__stat-label">Weight:</span>
                        <span class="pregnancy-table__stat-value">
                          {{ day.estimatedFetalWeight }}g
                        </span>
                      </div>

                      <div *ngIf="day.estimatedFetalLength" class="pregnancy-table__stat">
                        <span class="pregnancy-table__stat-label">Length:</span>
                        <span class="pregnancy-table__stat-value">
                          {{ day.estimatedFetalLength }}cm
                        </span>
                      </div>

                      <div
                        *ngIf="!day.estimatedFetalWeight && !day.estimatedFetalLength"
                        class="pregnancy-table__no-content"
                      >
                        <span class="text--muted">—</span>
                      </div>
                    </div>
                  </td>

                  <!-- Appointments -->
                  <td class="table__cell pregnancy-table__appointments">
                    <div class="pregnancy-table__appointments-content">
                      <div
                        *ngIf="day.appointments && day.appointments.length > 0"
                        class="pregnancy-table__appointment-list"
                      >
                        <div
                          *ngFor="let appointment of day.appointments"
                          class="pregnancy-table__appointment"
                        >
                          <span class="pregnancy-table__appointment-icon" aria-hidden="true"
                            >📅</span
                          >
                          <span class="pregnancy-table__appointment-text">
                            {{ appointment }}
                          </span>
                        </div>
                      </div>

                      <div
                        *ngIf="!day.appointments || day.appointments.length === 0"
                        class="pregnancy-table__no-content"
                      >
                        <span class="text--muted">—</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table Summary -->
        <div class="table-view__summary">
          <div class="table-summary">
            <div class="table-summary__stats">
              <div class="table-summary__stat">
                <span class="table-summary__stat-label">Total Days:</span>
                <span class="table-summary__stat-value">{{ getTotalDaysCount() }}</span>
              </div>
              <div class="table-summary__stat">
                <span class="table-summary__stat-label">Milestones:</span>
                <span class="table-summary__stat-value">{{ getMilestonesCount() }}</span>
              </div>
              <div class="table-summary__stat">
                <span class="table-summary__stat-label">Appointments:</span>
                <span class="table-summary__stat-value">{{ getAppointmentsCount() }}</span>
              </div>
            </div>

            <div class="table-summary__legend">
              <h4 class="table-summary__legend-title">Trimester Legend:</h4>
              <div class="table-summary__legend-items">
                <div class="table-summary__legend-item">
                  <span
                    class="table-summary__legend-color table-summary__legend-color--first"
                  ></span>
                  <span class="table-summary__legend-text">First Trimester (Weeks 1-12)</span>
                </div>
                <div class="table-summary__legend-item">
                  <span
                    class="table-summary__legend-color table-summary__legend-color--second"
                  ></span>
                  <span class="table-summary__legend-text">Second Trimester (Weeks 13-27)</span>
                </div>
                <div class="table-summary__legend-item">
                  <span
                    class="table-summary__legend-color table-summary__legend-color--third"
                  ></span>
                  <span class="table-summary__legend-text">Third Trimester (Weeks 28-40)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="table-view__empty" *ngIf="!pregnancyDays || pregnancyDays.length === 0">
      <div class="empty-state empty-state--large">
        <div class="empty-state__icon" aria-hidden="true">📊</div>
        <h3 class="empty-state__title">No Pregnancy Data Available</h3>
        <p class="empty-state__description">
          Please set up your pregnancy information to view the detailed calendar.
        </p>
      </div>
    </div>
  `,
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
    const lmpDate = new Date(this.preferences.lmpDate);
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
