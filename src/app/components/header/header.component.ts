import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPreferences, ThemeColor } from '../../models/pregnancy.models';
import { ThemeService } from '../../services/theme/theme.service';

/**
 * Application header component
 * Displays app title, theme selector, and settings
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header" role="banner">
      <div class="header__container">
        <!-- App Logo and Title -->
        <div class="header__brand">
          <div class="header__logo" aria-hidden="true">🤱</div>
          <div class="header__title-group">
            <h1 class="header__title">Pregnancy Calendar</h1>
            <p class="header__subtitle" *ngIf="preferences">
              {{ getCurrentGestationalAge() }}
            </p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="header__actions" *ngIf="preferences">
          <!-- Theme Selector -->
          <div
            class="header__theme-selector"
            [class.header__theme-selector--open]="isThemeSelectorOpen"
          >
            <button
              type="button"
              class="header__theme-button"
              (click)="toggleThemeSelector()"
              [attr.aria-expanded]="isThemeSelectorOpen"
              aria-haspopup="true"
              aria-label="Select theme color"
            >
              <div
                class="header__theme-preview"
                [style.background]="getCurrentThemeColor()"
                aria-hidden="true"
              ></div>
              <span class="header__theme-text" aria-hidden="true">Theme</span>
              <span class="header__theme-arrow" aria-hidden="true">▼</span>
            </button>

            <!-- Theme Options Dropdown -->
            <div
              class="header__theme-dropdown"
              role="menu"
              [attr.aria-hidden]="!isThemeSelectorOpen"
            >
              <button
                *ngFor="let theme of availableThemes"
                type="button"
                class="header__theme-option"
                [class.header__theme-option--active]="preferences.themeColor === theme.value"
                (click)="selectTheme(theme.value)"
                role="menuitem"
                [attr.aria-label]="'Select ' + theme.label + ' theme: ' + theme.description"
              >
                <div
                  class="header__theme-option-preview"
                  [style.background]="theme.primaryColor"
                  aria-hidden="true"
                ></div>
                <div class="header__theme-option-info">
                  <span class="header__theme-option-name">{{ theme.label }}</span>
                  <span class="header__theme-option-desc">{{ theme.description }}</span>
                </div>
                <span
                  class="header__theme-option-check"
                  *ngIf="preferences?.themeColor === theme.value"
                  aria-hidden="true"
                >
                  ✓
                </span>
              </button>
            </div>
          </div>

          <!-- Settings Menu -->
          <div class="header__settings" [class.header__settings--open]="isSettingsOpen">
            <button
              type="button"
              class="header__settings-button"
              (click)="toggleSettings()"
              [attr.aria-expanded]="isSettingsOpen"
              aria-haspopup="true"
              aria-label="Open settings menu"
            >
              <span class="header__settings-icon" aria-hidden="true">⚙️</span>
              <span class="sr-only">Settings</span>
            </button>

            <!-- Settings Dropdown -->
            <div class="header__settings-dropdown" role="menu" [attr.aria-hidden]="!isSettingsOpen">
              <button
                type="button"
                class="header__settings-option"
                (click)="requestPreferencesReset()"
                role="menuitem"
              >
                <span class="header__settings-option-icon" aria-hidden="true">🔄</span>
                <span class="header__settings-option-text">Reset Preferences</span>
              </button>

              <a
                href="#"
                class="header__settings-option"
                (click)="showHelp($event)"
                role="menuitem"
              >
                <span class="header__settings-option-icon" aria-hidden="true">❓</span>
                <span class="header__settings-option-text">Help & Info</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Click outside handler -->
      <div
        class="header__overlay"
        *ngIf="isThemeSelectorOpen || isSettingsOpen"
        (click)="closeAllDropdowns()"
        aria-hidden="true"
      ></div>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeAllDropdowns()',
  },
})
export class HeaderComponent {
  @Input() preferences: UserPreferences | null = null;
  @Output() themeColorChange = new EventEmitter<ThemeColor>();
  @Output() preferencesReset = new EventEmitter<void>();

  availableThemes: Array<{
    value: ThemeColor;
    label: string;
    description: string;
    primaryColor: string;
  }> = [];

  isThemeSelectorOpen = false;
  isSettingsOpen = false;

  constructor(private themeService: ThemeService) {
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  /**
   * Gets the current gestational age display text
   * @returns Formatted gestational age string or empty string
   */
  getCurrentGestationalAge(): string {
    if (!this.preferences?.lmpDate) return '';

    try {
      const lmpDate = new Date(this.preferences.lmpDate);
      const today = new Date();
      const timeDiff = today.getTime() - lmpDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      const weeks = Math.floor(daysDiff / 7);
      const days = daysDiff % 7;

      return `${weeks} weeks ${days} days`;
    } catch (error) {
      console.error('Error calculating gestational age:', error);
      return '';
    }
  }

  /**
   * Gets the current theme's primary color
   * @returns CSS color value
   */
  getCurrentThemeColor(): string {
    const currentTheme = this.preferences?.themeColor || 'neutral';
    const theme = this.availableThemes.find(t => t.value === currentTheme);
    return theme?.primaryColor || '#D4A574';
  }

  /**
   * Toggles the theme selector dropdown
   */
  toggleThemeSelector(): void {
    this.isThemeSelectorOpen = !this.isThemeSelectorOpen;
    this.isSettingsOpen = false; // Close settings if open
  }

  /**
   * Toggles the settings dropdown
   */
  toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.isThemeSelectorOpen = false; // Close theme selector if open
  }

  /**
   * Selects a new theme
   * @param themeColor - Theme color to select
   */
  selectTheme(themeColor: ThemeColor): void {
    this.themeColorChange.emit(themeColor);
    this.isThemeSelectorOpen = false;
  }

  /**
   * Requests preferences reset from parent component
   */
  requestPreferencesReset(): void {
    this.preferencesReset.emit();
    this.isSettingsOpen = false;
  }

  /**
   * Shows help information
   * @param event - Click event
   */
  showHelp(event: Event): void {
    event.preventDefault();

    const helpMessage = `
Pregnancy Calendar Help

This application calculates your pregnancy timeline based on your Last Menstrual Period (LMP) date.

Key Features:
• Summary View: Overview of your current pregnancy status
• Table View: Detailed day-by-day calendar with milestones
• Export Options: Save your calendar as PDF or Excel
• Theme Options: Choose colors that match your preference

Medical Disclaimer:
All calculations are estimates based on standard 40-week pregnancy timelines. Individual pregnancies may vary. Always consult your healthcare provider for personalized medical advice.

Navigation:
• Use the floating buttons at the bottom to switch views and export data
• Change themes using the theme selector in the header
• Filter table view by month using the dropdown

For technical support or feedback, please contact your system administrator.
    `.trim();

    alert(helpMessage);
    this.isSettingsOpen = false;
  }

  /**
   * Closes all open dropdowns
   */
  closeAllDropdowns(): void {
    this.isThemeSelectorOpen = false;
    this.isSettingsOpen = false;
  }

  /**
   * Handles document clicks to close dropdowns when clicking outside
   * @param event - Click event
   */
  onDocumentClick(event: Event): void {
    const target = event.target as Element;

    // Check if click is outside theme selector
    if (this.isThemeSelectorOpen && !target.closest('.header__theme-selector')) {
      this.isThemeSelectorOpen = false;
    }

    // Check if click is outside settings menu
    if (this.isSettingsOpen && !target.closest('.header__settings')) {
      this.isSettingsOpen = false;
    }
  }
}
