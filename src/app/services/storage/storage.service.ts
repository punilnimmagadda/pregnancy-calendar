import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeColor, UserPreferences, ViewMode } from '../../models/pregnancy.models';

/**
 * Service responsible for managing browser localStorage operations
 * Handles user preferences persistence and retrieval
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** LocalStorage key for user preferences */
  private readonly PREFERENCES_KEY = 'pregnancy_calendar_preferences';

  /** Default user preferences */
  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    lmpDate: '',
    themeColor: 'neutral',
    viewMode: 'summary',
    dateFormat: 'MM/DD/YYYY',
  };

  /** BehaviorSubject to emit preference changes to subscribers */
  private preferencesSubject = new BehaviorSubject<UserPreferences | null>(null);

  constructor() {
    // Load preferences on service initialization
    this.loadPreferences();
  }

  /**
   * Gets current user preferences as an Observable
   * @returns Observable of current preferences or null if not set
   */
  getPreferences(): Observable<UserPreferences | null> {
    return this.preferencesSubject.asObservable();
  }

  /**
   * Gets current user preferences synchronously
   * @returns Current preferences or null if not set
   */
  getCurrentPreferences(): UserPreferences | null {
    return this.preferencesSubject.value;
  }

  /**
   * Saves user preferences to localStorage
   * @param preferences - User preferences to save
   * @returns boolean indicating success/failure
   */
  savePreferences(preferences: UserPreferences): boolean {
    try {
      const preferencesJson = JSON.stringify(preferences);
      localStorage.setItem(this.PREFERENCES_KEY, preferencesJson);
      this.preferencesSubject.next(preferences);
      return true;
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
      return false;
    }
  }

  /**
   * Updates specific preference fields without overwriting entire object
   * @param updates - Partial preferences to update
   * @returns boolean indicating success/failure
   */
  updatePreferences(updates: Partial<UserPreferences>): boolean {
    const currentPreferences = this.getCurrentPreferences();
    if (!currentPreferences) {
      // If no preferences exist, create new ones with defaults
      const newPreferences = { ...this.DEFAULT_PREFERENCES, ...updates };
      return this.savePreferences(newPreferences);
    }

    const updatedPreferences = { ...currentPreferences, ...updates };
    return this.savePreferences(updatedPreferences);
  }

  /**
   * Updates the Last Menstrual Period date
   * @param lmpDate - LMP date as ISO string
   * @returns boolean indicating success/failure
   */
  updateLmpDate(lmpDate: string): boolean {
    return this.updatePreferences({ lmpDate });
  }

  /**
   * Updates the theme color preference
   * @param themeColor - Selected theme color
   * @returns boolean indicating success/failure
   */
  updateThemeColor(themeColor: ThemeColor): boolean {
    return this.updatePreferences({ themeColor });
  }

  /**
   * Updates the view mode preference
   * @param viewMode - Selected view mode
   * @returns boolean indicating success/failure
   */
  updateViewMode(viewMode: ViewMode): boolean {
    return this.updatePreferences({ viewMode });
  }

  /**
   * Checks if user preferences have been initialized
   * @returns boolean indicating if LMP date is set
   */
  isPreferencesInitialized(): boolean {
    const preferences = this.getCurrentPreferences();
    return !!(preferences && preferences.lmpDate);
  }

  /**
   * Clears all stored preferences
   * @returns boolean indicating success/failure
   */
  clearPreferences(): boolean {
    try {
      localStorage.removeItem(this.PREFERENCES_KEY);
      this.preferencesSubject.next(null);
      return true;
    } catch (error) {
      console.error('Failed to clear preferences from localStorage:', error);
      return false;
    }
  }

  /**
   * Loads preferences from localStorage and updates the subject
   * @private
   */
  private loadPreferences(): void {
    try {
      const preferencesJson = localStorage.getItem(this.PREFERENCES_KEY);
      if (preferencesJson) {
        const preferences = JSON.parse(preferencesJson) as UserPreferences;
        // Validate that the loaded preferences have required fields
        if (this.validatePreferences(preferences)) {
          this.preferencesSubject.next(preferences);
        } else {
          console.warn('Invalid preferences found in localStorage, clearing...');
          this.clearPreferences();
        }
      }
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
      this.clearPreferences();
    }
  }

  /**
   * Validates that preferences object has required structure
   * @param preferences - Preferences object to validate
   * @returns boolean indicating if preferences are valid
   * @private
   */
  private validatePreferences(preferences: unknown): preferences is UserPreferences {
    if (!preferences || typeof preferences !== 'object') {
      return false;
    }

    const pref = preferences as Record<string, unknown>;

    return (
      typeof pref['lmpDate'] === 'string' &&
      typeof pref['themeColor'] === 'string' &&
      typeof pref['viewMode'] === 'string' &&
      ['neutral', 'boy', 'girl'].includes(pref['themeColor'] as string) &&
      ['summary', 'table'].includes(pref['viewMode'] as string)
    );
  }

  /**
   * Exports all stored data for backup purposes
   * @returns Object containing all localStorage data
   */
  exportStorageData(): Record<string, unknown> {
    try {
      const data: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('pregnancy_calendar_')) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    } catch (error) {
      console.error('Failed to export storage data:', error);
      return {};
    }
  }

  /**
   * Imports storage data from backup
   * @param data - Data object to import
   * @returns boolean indicating success/failure
   */
  importStorageData(data: Record<string, unknown>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('pregnancy_calendar_') && typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
      this.loadPreferences(); // Reload preferences after import
      return true;
    } catch (error) {
      console.error('Failed to import storage data:', error);
      return false;
    }
  }
}
