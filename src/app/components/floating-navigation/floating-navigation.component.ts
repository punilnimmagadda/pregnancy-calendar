import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ViewMode,
  PregnancyDay,
  PregnancySummary,
  UserPreferences,
  ExportData,
  ExportFormat,
} from '../../models/pregnancy.models';
import { ExportService } from '../../services/export/export.service';

/**
 * Floating navigation component with view switching and export functionality
 * Positioned at bottom of screen for easy mobile access
 */
@Component({
  selector: 'app-floating-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="floating-nav">
      <div class="floating-nav__container">
        <!-- View Toggle Buttons -->
        <div class="floating-nav__view-toggle">
          <button
            type="button"
            class="floating-nav__button floating-nav__button--view"
            [class.floating-nav__button--active]="currentView === 'summary'"
            (click)="switchView('summary')"
            [attr.aria-pressed]="currentView === 'summary'"
            aria-label="Switch to summary view"
          >
            <span class="floating-nav__button-icon" aria-hidden="true">📊</span>
            <span class="floating-nav__button-text">Summary</span>
          </button>

          <button
            type="button"
            class="floating-nav__button floating-nav__button--view"
            [class.floating-nav__button--active]="currentView === 'table'"
            (click)="switchView('table')"
            [attr.aria-pressed]="currentView === 'table'"
            aria-label="Switch to table view"
          >
            <span class="floating-nav__button-icon" aria-hidden="true">📅</span>
            <span class="floating-nav__button-text">Calendar</span>
          </button>
        </div>

        <!-- Export Button with Dropdown -->
        <div class="floating-nav__export" [class.floating-nav__export--open]="isExportMenuOpen">
          <button
            type="button"
            class="floating-nav__button floating-nav__button--export"
            (click)="toggleExportMenu()"
            [attr.aria-expanded]="isExportMenuOpen"
            aria-haspopup="true"
            aria-label="Export options"
            [disabled]="isExporting"
          >
            <span class="floating-nav__button-icon" aria-hidden="true">
              {{ isExporting ? '⏳' : '📤' }}
            </span>
            <span class="floating-nav__button-text">
              {{ isExporting ? 'Exporting...' : 'Export' }}
            </span>
          </button>

          <!-- Export Options Dropdown -->
          <div class="floating-nav__export-menu" role="menu" [attr.aria-hidden]="!isExportMenuOpen">
            <button
              type="button"
              class="floating-nav__export-option"
              (click)="exportData('pdf')"
              role="menuitem"
              [disabled]="isExporting"
            >
              <span class="floating-nav__export-option-icon" aria-hidden="true">📄</span>
              <div class="floating-nav__export-option-info">
                <span class="floating-nav__export-option-title">Export as PDF</span>
                <span class="floating-nav__export-option-desc">
                  Printable format (~{{ getEstimatedFileSize('pdf') }}KB)
                </span>
              </div>
            </button>

            <button
              type="button"
              class="floating-nav__export-option"
              (click)="exportData('excel')"
              role="menuitem"
              [disabled]="isExporting"
            >
              <span class="floating-nav__export-option-icon" aria-hidden="true">📊</span>
              <div class="floating-nav__export-option-info">
                <span class="floating-nav__export-option-title">Export as Excel</span>
                <span class="floating-nav__export-option-desc">
                  Spreadsheet format (~{{ getEstimatedFileSize('excel') }}KB)
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Click outside overlay -->
      <div
        class="floating-nav__overlay"
        *ngIf="isExportMenuOpen"
        (click)="closeExportMenu()"
        aria-hidden="true"
      ></div>
    </div>
  `,
  styleUrls: ['./floating-navigation.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeExportMenu()',
  },
})
export class FloatingNavigationComponent {
  @Input() currentView: ViewMode = 'summary';
  @Input() pregnancyDays: PregnancyDay[] | null = null;
  @Input() summary: PregnancySummary | null = null;
  @Input() preferences: UserPreferences | null = null;

  @Output() viewChange = new EventEmitter<ViewMode>();
  @Output() exportRequested = new EventEmitter<ExportFormat>();

  isExportMenuOpen = false;
  isExporting = false;

  constructor(private exportService: ExportService) {}

  /**
   * Switches between view modes
   * @param viewMode - Target view mode
   */
  switchView(viewMode: ViewMode): void {
    if (viewMode !== this.currentView) {
      this.viewChange.emit(viewMode);
    }
  }

  /**
   * Toggles the export menu dropdown
   */
  toggleExportMenu(): void {
    if (this.isExporting) return;
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  /**
   * Closes the export menu
   */
  closeExportMenu(): void {
    this.isExportMenuOpen = false;
  }

  /**
   * Exports pregnancy data in specified format
   * @param format - Export format (pdf or excel)
   */
  async exportData(format: ExportFormat): Promise<void> {
    if (this.isExporting || !this.pregnancyDays || !this.summary || !this.preferences) {
      return;
    }

    this.isExporting = true;
    this.closeExportMenu();

    try {
      // Prepare export data
      const exportData: ExportData = {
        userPreferences: this.preferences,
        summary: this.summary,
        pregnancyDays: this.pregnancyDays,
        exportTimestamp: new Date(),
        format: format,
      };

      // Validate export data
      if (!this.exportService.validateExportData(exportData)) {
        throw new Error('Invalid export data');
      }

      // Perform export
      const success = await this.exportService.exportData(exportData, format);

      if (success) {
        this.showExportSuccess(format);
        this.exportRequested.emit(format);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showExportError(format, error);
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Gets estimated file size for export format
   * @param format - Export format
   * @returns Estimated file size in KB
   */
  getEstimatedFileSize(format: ExportFormat): number {
    if (!this.pregnancyDays || !this.summary || !this.preferences) {
      return 0;
    }

    const exportData: ExportData = {
      userPreferences: this.preferences,
      summary: this.summary,
      pregnancyDays: this.pregnancyDays,
      exportTimestamp: new Date(),
      format: format,
    };

    return this.exportService.getEstimatedFileSize(exportData, format);
  }

  /**
   * Shows export success notification
   * @param format - Export format that succeeded
   * @private
   */
  private showExportSuccess(format: ExportFormat): void {
    const formatLabel = format.toUpperCase();
    const message = `✅ Successfully exported pregnancy calendar as ${formatLabel}!`;

    // In a real app, this would use a toast/notification service
    // For now, we'll use a simple alert
    alert(message);
  }

  /**
   * Shows export error notification
   * @param format - Export format that failed
   * @param error - Error that occurred
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private showExportError(format: ExportFormat, error: any): void {
    const formatLabel = format.toUpperCase();
    const message = `❌ Failed to export as ${formatLabel}. Please try again.`;

    // In a real app, this would use a toast/notification service
    console.error('Export error details:', error);
    alert(message);
  }

  /**
   * Handles document clicks to close export menu
   * @param event - Click event
   */
  onDocumentClick(event: Event): void {
    const target = event.target as Element;

    // Close export menu if clicking outside
    if (this.isExportMenuOpen && !target.closest('.floating-nav__export')) {
      this.closeExportMenu();
    }
  }
}
