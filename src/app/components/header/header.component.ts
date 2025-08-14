import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPreferences, ThemeColor } from '../../models/pregnancy.models';
import { ThemeService } from '../../services/theme/theme.service';
import { parseLocalDate } from '../../utilities/parse-date';
import { PregnancyCalculatorService } from '../../services/pregnancy-calculator/pregnancy-calculator.service';

/**
 * Application header component
 * Displays app title, theme selector, and settings
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
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

  constructor(
    private themeService: ThemeService,
    private pregnancyCalculatorService: PregnancyCalculatorService
  ) {
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  /**
   * Gets the current gestational age display text
   * @returns Formatted gestational age string or empty string
   */
  getCurrentGestationalAge(): string {
    if (!this.preferences?.lmpDate) return '';

    return this.pregnancyCalculatorService.calculateGestationalAge(
      parseLocalDate(this.preferences.lmpDate)
    ).formatted;
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
