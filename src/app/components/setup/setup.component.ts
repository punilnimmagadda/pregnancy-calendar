import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserPreferences, ThemeColor } from '../../models/pregnancy.models';
import { ThemeService } from '../../services/theme/theme.service';

/**
 * Setup component for first-time users
 * Collects Last Menstrual Period date and user preferences
 */
@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="setup">
      <div class="setup__container">
        <div class="setup__header">
          <h1 class="setup__title">Welcome to Your Pregnancy Calendar</h1>
          <p class="setup__description">
            Let's set up your personalized pregnancy journey tracker. We'll calculate everything
            based on your Last Menstrual Period (LMP) date using standard medical guidelines.
          </p>
        </div>

        <form [formGroup]="setupForm" (ngSubmit)="onSubmit()" class="setup__form" novalidate>
          <!-- LMP Date Input -->
          <div class="form-group">
            <label for="lmpDate" class="form-label form-label--required">
              Last Menstrual Period (LMP) Date
            </label>
            <input
              id="lmpDate"
              type="date"
              formControlName="lmpDate"
              class="form-input"
              [class.form-input--error]="isFieldInvalid('lmpDate')"
              [max]="maxLmpDate"
              [min]="minLmpDate"
              aria-describedby="lmpDate-help lmpDate-error"
              required
            />
            <small id="lmpDate-help" class="form-help">
              Enter the first day of your last menstrual period. This is used to calculate your
              pregnancy timeline and due date.
            </small>
            <span
              *ngIf="isFieldInvalid('lmpDate')"
              id="lmpDate-error"
              class="form-error"
              role="alert"
            >
              {{ getFieldError('lmpDate') }}
            </span>
          </div>

          <!-- Theme Color Selection -->
          <div class="form-group">
            <fieldset class="setup__theme-fieldset">
              <legend class="form-label">Choose Your Theme</legend>
              <p class="form-help mb--md">
                Select a color theme for your pregnancy calendar. You can change this later.
              </p>

              <div class="setup__theme-options">
                <div *ngFor="let theme of availableThemes" class="setup__theme-option">
                  <div class="form-radio">
                    <input
                      type="radio"
                      [id]="'theme-' + theme.value"
                      [value]="theme.value"
                      formControlName="themeColor"
                      (change)="onThemePreview(theme.value)"
                    />
                    <label [for]="'theme-' + theme.value" class="setup__theme-label">
                      <div
                        class="setup__theme-preview"
                        [style.background]="theme.primaryColor"
                      ></div>
                      <div class="setup__theme-info">
                        <strong class="setup__theme-name">{{ theme.label }}</strong>
                        <span class="setup__theme-description">{{ theme.description }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Medical Disclaimer -->
          <div class="setup__disclaimer">
            <div class="setup__disclaimer-content">
              <h3 class="setup__disclaimer-title">Important Medical Disclaimer</h3>
              <div class="setup__disclaimer-text">
                <p>
                  <strong>This pregnancy calendar is for informational purposes only.</strong>
                </p>
                <ul class="setup__disclaimer-list">
                  <li>
                    All calculations are based on a standard 40-week (280-day) pregnancy timeline
                  </li>
                  <li>Individual pregnancies may vary significantly from these estimates</li>
                  <li>This tool does not replace professional medical care or advice</li>
                  <li>
                    Always consult with your healthcare provider for personalized medical guidance
                  </li>
                  <li>Seek immediate medical attention for any pregnancy-related concerns</li>
                </ul>
              </div>

              <div class="form-checkbox">
                <input
                  type="checkbox"
                  id="disclaimerAccepted"
                  formControlName="disclaimerAccepted"
                  required
                />
                <label for="disclaimerAccepted">
                  I understand and acknowledge this medical disclaimer
                  <span class="text--error">*</span>
                </label>
              </div>

              <span *ngIf="isFieldInvalid('disclaimerAccepted')" class="form-error" role="alert">
                You must acknowledge the medical disclaimer to continue
              </span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="setup__actions">
            <button
              type="submit"
              class="btn btn--primary btn--large btn--full-width"
              [disabled]="setupForm.invalid || isSubmitting"
              [class.loading]="isSubmitting"
            >
              <span *ngIf="!isSubmitting">Start My Pregnancy Journey</span>
              <span *ngIf="isSubmitting" class="sr-only">Setting up your calendar...</span>
            </button>
          </div>
        </form>

        <!-- Additional Information -->
        <div class="setup__info">
          <details class="setup__details">
            <summary class="setup__details-summary">Why do we need your LMP date?</summary>
            <div class="setup__details-content">
              <p>
                The Last Menstrual Period (LMP) date is the medical standard for calculating
                pregnancy timelines because:
              </p>
              <ul>
                <li>It's typically easier to remember than conception date</li>
                <li>Most medical professionals use this method</li>
                <li>It provides the most accurate gestational age calculations</li>
                <li>All standard pregnancy milestones are based on LMP dating</li>
              </ul>
              <p>
                Your pregnancy is calculated as starting from the first day of your LMP, even though
                conception typically occurs about 2 weeks later.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  @Output() setupComplete = new EventEmitter<UserPreferences>();

  setupForm: FormGroup;
  availableThemes: Array<{
    value: ThemeColor;
    label: string;
    description: string;
    primaryColor: string;
  }> = [];

  isSubmitting = false;
  maxLmpDate: string = '';
  minLmpDate: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private themeService: ThemeService
  ) {
    this.setupForm = this.createForm();
    this.setDateConstraints();
  }

  ngOnInit(): void {
    this.availableThemes = this.themeService.getAvailableThemes();
    // Set default theme for preview
    this.onThemePreview('neutral');
  }

  /**
   * Creates the reactive form with validation
   * @returns FormGroup instance
   */
  private createForm(): FormGroup {
    return this.formBuilder.group({
      lmpDate: ['', [Validators.required, this.dateValidator.bind(this)]],
      themeColor: ['neutral', Validators.required],
      disclaimerAccepted: [false, Validators.requiredTrue],
    });
  }

  /**
   * Sets minimum and maximum date constraints for LMP input
   * @private
   */
  private setDateConstraints(): void {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Maximum LMP date is today (very early pregnancy)
    this.maxLmpDate = this.formatDateForInput(today);

    // Minimum LMP date is one year ago (covers most pregnancy scenarios)
    this.minLmpDate = this.formatDateForInput(oneYearAgo);
  }

  /**
   * Formats date for HTML date input
   * @param date - Date to format
   * @returns Date string in YYYY-MM-DD format
   * @private
   */
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Custom validator for LMP date
   * @param control - Form control to validate
   * @returns Validation error object or null
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dateValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Reset time to compare dates only
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999); // Allow today
    oneYearAgo.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: { message: 'LMP date cannot be in the future' } };
    }

    if (selectedDate < oneYearAgo) {
      return { tooOld: { message: 'Please enter a more recent LMP date' } };
    }

    return null;
  }

  /**
   * Checks if a form field is invalid and has been touched
   * @param fieldName - Name of the form field
   * @returns Boolean indicating if field should show error state
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.setupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gets the error message for a form field
   * @param fieldName - Name of the form field
   * @returns Error message string
   */
  getFieldError(fieldName: string): string {
    const field = this.setupForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'This field is required';
    if (errors['futureDate']) return errors['futureDate'].message;
    if (errors['tooOld']) return errors['tooOld'].message;

    return 'Please enter a valid value';
  }

  /**
   * Handles theme preview when user changes selection
   * @param themeColor - Selected theme color
   */
  onThemePreview(themeColor: ThemeColor): void {
    this.themeService.setTheme(themeColor);
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.setupForm.invalid || this.isSubmitting) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Simulate a brief loading period for better UX
    setTimeout(() => {
      const formValue = this.setupForm.value;

      const preferences: UserPreferences = {
        lmpDate: formValue.lmpDate,
        themeColor: formValue.themeColor,
        viewMode: 'summary', // Default to summary view
        dateFormat: 'MM/DD/YYYY',
      };

      this.setupComplete.emit(preferences);
      this.isSubmitting = false;
    }, 1000);
  }

  /**
   * Marks all form fields as touched to trigger validation display
   * @private
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.setupForm.controls).forEach(key => {
      this.setupForm.get(key)?.markAsTouched();
    });
  }
}
