import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserPreferences, ThemeColor } from '../../models/pregnancy.models';
import { ThemeService } from '../../services/theme/theme.service';
import { parseLocalDate } from '../../utilities/parse-date';

/**
 * Setup component for first-time users
 * Collects Last Menstrual Period date and user preferences
 */
@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
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
    const today = parseLocalDate();
    const oneYearAgo = parseLocalDate();
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

    const selectedDate = parseLocalDate(control.value);
    const today = parseLocalDate();
    const oneYearAgo = parseLocalDate();
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
