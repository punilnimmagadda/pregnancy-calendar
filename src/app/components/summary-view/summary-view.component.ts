import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PregnancySummary, UserPreferences } from '../../models/pregnancy.models';

/**
 * Summary view component that displays pregnancy overview
 * Shows current status, progress, key milestones, and upcoming appointments
 */
@Component({
  selector: 'app-summary-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-view" *ngIf="summary">
      <div class="summary-view__container">
        <!-- Header Section -->
        <div class="summary-view__header">
          <h2 class="summary-view__title">Your Pregnancy Journey</h2>
          <p class="summary-view__subtitle">Track your progress and important milestones</p>
        </div>

        <!-- Progress Card -->
        <div class="card card--elevated summary-view__progress-card">
          <div class="card__header">
            <h3 class="card__title">Current Status</h3>
          </div>
          <div class="card__body">
            <div class="progress-overview">
              <!-- Gestational Age -->
              <div class="progress-overview__item progress-overview__item--primary">
                <div class="progress-overview__label">Current Age</div>
                <div class="progress-overview__value">{{ summary.currentGestationalAge }}</div>
              </div>

              <!-- Trimester -->
              <div class="progress-overview__item">
                <div class="progress-overview__label">Trimester</div>
                <div class="progress-overview__value progress-overview__value--trimester">
                  {{ getTrismesterDisplay(summary.currentTrimester) }}
                </div>
              </div>

              <!-- Due Date -->
              <div class="progress-overview__item">
                <div class="progress-overview__label">Due Date</div>
                <div class="progress-overview__value">{{ summary.formattedDueDate }}</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-container">
              <div class="progress-bar-label">
                <span>Pregnancy Progress</span>
                <span class="progress-percentage">{{ summary.progressPercentage }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-bar__fill"
                  [style.width.%]="summary.progressPercentage"
                  [attr.aria-valuenow]="summary.progressPercentage"
                  [attr.aria-valuemin]="0"
                  [attr.aria-valuemax]="100"
                  role="progressbar"
                  [attr.aria-label]="
                    'Pregnancy progress: ' + summary.progressPercentage + ' percent complete'
                  "
                ></div>
              </div>
              <div class="progress-bar-info">
                <span>{{ summary.daysCompleted }} days completed</span>
                <span>{{ summary.daysRemaining }} days remaining</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Two Column Layout for Tablets and Desktop -->
        <div class="summary-view__columns">
          <!-- Upcoming Milestones -->
          <div class="card card--elevated summary-view__milestones-card">
            <div class="card__header">
              <h3 class="card__title">
                <span class="card__title-icon" aria-hidden="true">🎯</span>
                Upcoming Milestones
              </h3>
            </div>
            <div class="card__body">
              <div
                class="milestones-list"
                *ngIf="summary.upcomingMilestones.length > 0; else noMilestones"
              >
                <div
                  *ngFor="let milestone of summary.upcomingMilestones; trackBy: trackByMilestone"
                  class="milestone-item"
                >
                  <div class="milestone-item__marker" aria-hidden="true"></div>
                  <div class="milestone-item__content">
                    <p class="milestone-item__text">{{ milestone }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noMilestones>
                <div class="empty-state">
                  <div class="empty-state__icon" aria-hidden="true">🎉</div>
                  <p class="empty-state__text">
                    You're near the end of your pregnancy journey! No major milestones remaining.
                  </p>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Next Appointments -->
          <div class="card card--elevated summary-view__appointments-card">
            <div class="card__header">
              <h3 class="card__title">
                <span class="card__title-icon" aria-hidden="true">📅</span>
                Next Appointments
              </h3>
            </div>
            <div class="card__body">
              <div
                class="appointments-list"
                *ngIf="summary.nextAppointments.length > 0; else noAppointments"
              >
                <div
                  *ngFor="let appointment of summary.nextAppointments; trackBy: trackByAppointment"
                  class="appointment-item"
                >
                  <div class="appointment-item__marker" aria-hidden="true"></div>
                  <div class="appointment-item__content">
                    <p class="appointment-item__text">{{ appointment }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noAppointments>
                <div class="empty-state">
                  <div class="empty-state__icon" aria-hidden="true">✅</div>
                  <p class="empty-state__text">
                    No scheduled appointments found. Consult your healthcare provider for your
                    personalized schedule.
                  </p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Key Information Cards -->
        <div class="summary-view__info-grid">
          <!-- Current Trimester Info -->
          <div class="info-card info-card--{{ summary.currentTrimester }}">
            <div class="info-card__header">
              <h4 class="info-card__title">
                {{ getTrismesterDisplay(summary.currentTrimester) }} Trimester
              </h4>
            </div>
            <div class="info-card__body">
              <p class="info-card__description">
                {{ getTrimesterDescription(summary.currentTrimester) }}
              </p>
              <ul class="info-card__features">
                <li *ngFor="let feature of getTrimesterFeatures(summary.currentTrimester)">
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Important Reminders -->
          <div class="info-card info-card--reminders">
            <div class="info-card__header">
              <h4 class="info-card__title">
                <span class="info-card__icon" aria-hidden="true">💡</span>
                Important Reminders
              </h4>
            </div>
            <div class="info-card__body">
              <ul class="info-card__reminders">
                <li>Take prenatal vitamins daily</li>
                <li>Stay hydrated (8-10 glasses of water)</li>
                <li>Get adequate rest and sleep</li>
                <li>Avoid alcohol, smoking, and certain medications</li>
                <li>Contact your healthcare provider with concerns</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Medical Disclaimer -->
        <div class="summary-view__disclaimer">
          <div class="disclaimer-card">
            <div class="disclaimer-card__header">
              <span class="disclaimer-card__icon" aria-hidden="true">⚠️</span>
              <strong class="disclaimer-card__title">Medical Disclaimer</strong>
            </div>
            <div class="disclaimer-card__body">
              <p>
                This information is for educational purposes only and based on standard 40-week
                pregnancy calculations. Individual pregnancies vary significantly. Always consult
                your healthcare provider for personalized medical advice, proper prenatal care, and
                any pregnancy-related concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div class="summary-view__empty" *ngIf="!summary">
      <div class="empty-state empty-state--large">
        <div class="empty-state__icon" aria-hidden="true">📊</div>
        <h3 class="empty-state__title">No Pregnancy Data Available</h3>
        <p class="empty-state__description">
          Please set up your pregnancy information to view your summary.
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./summary-view.component.scss'],
})
export class SummaryViewComponent {
  @Input() summary: PregnancySummary | null = null;
  @Input() preferences: UserPreferences | null = null;

  /**
   * Gets display-friendly trimester name
   * @param trimester - Trimester identifier
   * @returns Formatted trimester name
   */
  getTrismesterDisplay(trimester: string): string {
    const trimesterMap: { [key: string]: string } = {
      first: 'First',
      second: 'Second',
      third: 'Third',
    };
    return trimesterMap[trimester] || 'Unknown';
  }

  /**
   * Gets trimester description
   * @param trimester - Trimester identifier
   * @returns Description text
   */
  getTrimesterDescription(trimester: string): string {
    const descriptions: { [key: string]: string } = {
      first:
        "The foundation stage of your pregnancy. Your baby's organs are forming and early development is crucial.",
      second:
        'Often called the "golden period" - you may feel more energetic and comfortable during these weeks.',
      third:
        'The final stretch! Your baby is growing rapidly and preparing for life outside the womb.',
    };
    return descriptions[trimester] || 'Important stage of your pregnancy journey.';
  }

  /**
   * Gets key features for each trimester
   * @param trimester - Trimester identifier
   * @returns Array of key features
   */
  getTrimesterFeatures(trimester: string): string[] {
    const features: { [key: string]: string[] } = {
      first: [
        'Morning sickness may occur',
        'Fatigue is common',
        'Important organ development',
        'First prenatal appointments',
        'Folic acid supplementation crucial',
      ],
      second: [
        'Energy levels typically improve',
        'Baby movements may be felt',
        'Anatomy scan around week 20',
        'Gender may be determined',
        'Belly starts to show more',
      ],
      third: [
        'Frequent doctor visits',
        'Baby movements are strong',
        'Prepare for delivery',
        'Monitor for labor signs',
        'Final preparations for baby',
      ],
    };
    return features[trimester] || [];
  }

  /**
   * Track by function for milestones list
   * @param index - Array index
   * @param milestone - Milestone text
   * @returns Unique identifier
   */
  trackByMilestone(index: number, milestone: string): string {
    return `milestone-${index}-${milestone.substring(0, 10)}`;
  }

  /**
   * Track by function for appointments list
   * @param index - Array index
   * @param appointment - Appointment text
   * @returns Unique identifier
   */
  trackByAppointment(index: number, appointment: string): string {
    return `appointment-${index}-${appointment.substring(0, 10)}`;
  }
}
