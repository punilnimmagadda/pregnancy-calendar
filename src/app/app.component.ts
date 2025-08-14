import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import {
  UserPreferences,
  ViewMode,
  ThemeColor,
  PregnancyDay,
  PregnancySummary,
  AppState,
} from './models/pregnancy.models';

import { SetupComponent } from './components/setup/setup.component';
import { SummaryViewComponent } from './components/summary-view/summary-view.component';
import { TableViewComponent } from './components/table-view/table-view.component';
import { FloatingNavigationComponent } from './components/floating-navigation/floating-navigation.component';
import { HeaderComponent } from './components/header/header.component';
import { StorageService } from './services/storage/storage.service';
import { ThemeService } from './services/theme/theme.service';
import { PregnancyCalculatorService } from './services/pregnancy-calculator/pregnancy-calculator.service';

/**
 * Main application component that orchestrates the pregnancy calendar app
 * Manages global state, user preferences, and view switching
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SetupComponent,
    SummaryViewComponent,
    TableViewComponent,
    FloatingNavigationComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /** Subject for component cleanup */
  private destroy$ = new Subject<void>();

  /** Combined application state observable */
  appState$: Observable<AppState>;

  /** Pregnancy days data observable */
  pregnancyDays$: Observable<PregnancyDay[] | null>;

  /** Pregnancy summary data observable */
  pregnancySummary$: Observable<PregnancySummary | null>;

  /** Internal state management */
  private appStateSubject = new BehaviorSubject<Partial<AppState>>({});
  private currentAppState: AppState = {
    preferences: null,
    currentView: 'summary',
    isLoading: true,
    error: null,
    isInitialized: false,
  };

  constructor(
    private storageService: StorageService,
    private themeService: ThemeService,
    private pregnancyCalculatorService: PregnancyCalculatorService
  ) {
    // Initialize observables
    this.appState$ = this.createAppStateObservable();
    this.pregnancyDays$ = this.createPregnancyDaysObservable();
    this.pregnancySummary$ = this.createPregnancySummaryObservable();
  }

  ngOnInit(): void {
    this.initializeApplication();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles setup completion from the setup component
   * @param preferences - User preferences from setup
   */
  onSetupComplete(preferences: UserPreferences): void {
    this.updateAppState({ isLoading: true, error: null });

    // Save preferences and apply theme
    const success = this.storageService.savePreferences(preferences);
    if (success) {
      this.themeService.setTheme(preferences.themeColor);
      this.updateAppState({
        preferences,
        isInitialized: true,
        isLoading: false,
        currentView: preferences.viewMode,
      });
      this.announceToScreenReader('Pregnancy calendar setup completed successfully');
    } else {
      this.updateAppState({
        error: 'Failed to save your preferences. Please try again.',
        isLoading: false,
      });
    }
  }

  /**
   * Handles view mode changes
   * @param viewMode - New view mode to switch to
   */
  onViewChange(viewMode: ViewMode): void {
    this.updateAppState({ currentView: viewMode });
    this.storageService.updateViewMode(viewMode);
    this.announceToScreenReader(`Switched to ${viewMode} view`);
  }

  /**
   * Handles theme color changes from the header
   * @param themeColor - New theme color to apply
   */
  onThemeColorChange(themeColor: ThemeColor): void {
    this.themeService.setTheme(themeColor);
    this.storageService.updateThemeColor(themeColor);

    // Update preferences in state
    const currentPreferences = this.currentAppState.preferences;
    if (currentPreferences) {
      const updatedPreferences = { ...currentPreferences, themeColor };
      this.updateAppState({ preferences: updatedPreferences });
    }

    this.announceToScreenReader(`Theme changed to ${themeColor}`);
  }

  /**
   * Handles preferences reset request
   */
  onPreferencesReset(): void {
    const confirmReset = confirm(
      'Are you sure you want to reset all preferences? This will clear your pregnancy data and return to the setup screen.'
    );

    if (confirmReset) {
      this.storageService.clearPreferences();
      this.updateAppState({
        preferences: null,
        isInitialized: false,
        currentView: 'summary',
        error: null,
      });
      this.announceToScreenReader('Preferences have been reset');
    }
  }

  /**
   * Handles export requests from floating navigation
   * @param exportFormat - Format to export data in
   */
  onExportRequested(exportFormat: 'pdf' | 'excel'): void {
    // This will be handled by the floating navigation component
    // Just announce the action to screen readers
    this.announceToScreenReader(`Exporting pregnancy calendar as ${exportFormat.toUpperCase()}`);
  }

  /**
   * Handles retry action when errors occur
   */
  onRetry(): void {
    this.updateAppState({ error: null, isLoading: true });
    this.initializeApplication();
  }

  /**
   * Initializes the application by loading user preferences
   * @private
   */
  private initializeApplication(): void {
    this.storageService
      .getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: preferences => {
          if (preferences) {
            // User has existing preferences
            this.themeService.setTheme(preferences.themeColor);
            this.updateAppState({
              preferences,
              isInitialized: true,
              isLoading: false,
              currentView: preferences.viewMode,
              error: null,
            });
          } else {
            // New user, show setup
            this.updateAppState({
              preferences: null,
              isInitialized: false,
              isLoading: false,
              error: null,
            });
          }
        },
        error: error => {
          console.error('Failed to initialize application:', error);
          this.updateAppState({
            error: 'Failed to load your preferences. Please refresh the page.',
            isLoading: false,
          });
        },
      });
  }

  /**
   * Creates the main application state observable
   * @private
   */
  private createAppStateObservable(): Observable<AppState> {
    return combineLatest([
      this.storageService.getPreferences(),
      this.appStateSubject.asObservable().pipe(startWith(null)),
    ]).pipe(
      map(([preferences, stateUpdates]) => {
        this.currentAppState = {
          ...this.currentAppState,
          preferences,
          ...stateUpdates,
        };
        return this.currentAppState;
      }),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Creates the pregnancy days observable
   * @private
   */
  private createPregnancyDaysObservable(): Observable<PregnancyDay[] | null> {
    return this.appState$.pipe(
      map(state => {
        if (!state.preferences?.lmpDate) {
          return null;
        }

        try {
          const lmpDate = new Date(state.preferences.lmpDate);
          return this.pregnancyCalculatorService.generatePregnancyCalendar(lmpDate);
        } catch (error) {
          console.error('Failed to generate pregnancy calendar:', error);
          return null;
        }
      })
    );
  }

  /**
   * Creates the pregnancy summary observable
   * @private
   */
  private createPregnancySummaryObservable(): Observable<PregnancySummary | null> {
    return this.appState$.pipe(
      map(state => {
        if (!state.preferences?.lmpDate) {
          return null;
        }

        try {
          const lmpDate = new Date(state.preferences.lmpDate);
          return this.pregnancyCalculatorService.generatePregnancySummary(lmpDate);
        } catch (error) {
          console.error('Failed to generate pregnancy summary:', error);
          return null;
        }
      })
    );
  }

  /**
   * Updates the application state
   * @param updates - Partial state updates to apply
   * @private
   */
  private updateAppState(updates: Partial<AppState>): void {
    this.appStateSubject.next(updates);
  }

  /**
   * Announces messages to screen readers
   * @param message - Message to announce
   * @private
   */
  private announceToScreenReader(message: string): void {
    // This would typically be handled by a dedicated accessibility service
    // For now, we'll use a simple approach
    setTimeout(() => {
      const announcement = document.querySelector('[role="status"][aria-live="polite"]');
      if (announcement) {
        announcement.textContent = message;
        setTimeout(() => {
          announcement.textContent = '';
        }, 1000);
      }
    }, 100);
  }
}
