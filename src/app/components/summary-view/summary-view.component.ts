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
  templateUrl: './summary-view.component.html',
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
