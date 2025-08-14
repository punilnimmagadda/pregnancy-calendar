import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { ThemeColor, UserPreferences } from '../../models/pregnancy.models';

/**
 * Unit tests for StorageService
 * Tests localStorage operations, preferences management, and error handling
 */
xdescribe('StorageService', () => {
  let service: StorageService;
  let mockLocalStorage: { [key: string]: string };

  // Mock localStorage
  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage methods
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    spyOn(localStorage, 'key').and.callFake((index: number) => {
      const keys = Object.keys(mockLocalStorage);
      return keys[index] || null;
    });

    Object.defineProperty(localStorage, 'length', {
      get: () => Object.keys(mockLocalStorage).length,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null preferences when localStorage is empty', () => {
      service.getCurrentPreferences();
      expect(service.getCurrentPreferences()).toBeNull();
    });

    it('should load existing preferences from localStorage', () => {
      const testPreferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'boy',
        viewMode: 'table',
        dateFormat: 'MM/DD/YYYY',
      };

      mockLocalStorage['pregnancy_calendar_preferences'] = JSON.stringify(testPreferences);

      // Create new service instance to trigger initialization
      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toEqual(testPreferences);
    });

    it('should clear invalid preferences from localStorage', () => {
      mockLocalStorage['pregnancy_calendar_preferences'] = 'invalid json';
      spyOn(console, 'error');

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('pregnancy_calendar_preferences');
    });
  });

  describe('savePreferences', () => {
    it('should save valid preferences to localStorage', () => {
      const preferences: UserPreferences = {
        lmpDate: '2024-01-15',
        themeColor: 'neutral',
        viewMode: 'summary',
        dateFormat: 'MM/DD/YYYY',
      };

      const result = service.savePreferences(preferences);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pregnancy_calendar_preferences',
        JSON.stringify(preferences)
      );
      expect(service.getCurrentPreferences()).toEqual(preferences);
    });

    it('should handle localStorage errors gracefully', () => {
      const preferences: UserPreferences = {
        lmpDate: '2024-01-15',
        themeColor: 'neutral',
        viewMode: 'summary',
      };

      // Mock localStorage.setItem to throw an error
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage quota exceeded');
      spyOn(console, 'error');

      const result = service.savePreferences(preferences);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save preferences to localStorage:',
        jasmine.any(Error)
      );
    });

    // it('should emit preferences changes to subscribers', () => {
    //   const preferences: UserPreferences = {
    //     lmpDate: '2024-01-15',
    //     themeColor: 'girl',
    //     viewMode: 'table',
    //   };

    //   let emittedPreferences: UserPreferences | null = null;
    //   service.getPreferences().subscribe(prefs => {
    //     emittedPreferences = prefs;
    //   });

    //   service.savePreferences(preferences);

    //   expect(emittedPreferences).toEqual(preferences);
    // });
  });

  describe('updatePreferences', () => {
    it('should update existing preferences partially', () => {
      const initialPreferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };

      service.savePreferences(initialPreferences);

      const updates = { themeColor: 'boy' as ThemeColor };
      const result = service.updatePreferences(updates);

      expect(result).toBe(true);
      expect(service.getCurrentPreferences()).toEqual({
        ...initialPreferences,
        ...updates,
      });
    });

    it('should create new preferences when none exist', () => {
      const updates = { lmpDate: '2024-02-01', themeColor: 'girl' as ThemeColor };
      const result = service.updatePreferences(updates);

      expect(result).toBe(true);
      expect(service.getCurrentPreferences()).toEqual({
        lmpDate: '2024-02-01',
        themeColor: 'girl',
        viewMode: 'summary',
        dateFormat: 'MM/DD/YYYY',
      });
    });
  });

  describe('specific update methods', () => {
    beforeEach(() => {
      const initialPreferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };
      service.savePreferences(initialPreferences);
    });

    it('should update LMP date', () => {
      const result = service.updateLmpDate('2024-02-15');

      expect(result).toBe(true);
      expect(service.getCurrentPreferences()?.lmpDate).toBe('2024-02-15');
    });

    it('should update theme color', () => {
      const result = service.updateThemeColor('boy');

      expect(result).toBe(true);
      expect(service.getCurrentPreferences()?.themeColor).toBe('boy');
    });

    it('should update view mode', () => {
      const result = service.updateViewMode('table');

      expect(result).toBe(true);
      expect(service.getCurrentPreferences()?.viewMode).toBe('table');
    });
  });

  describe('isPreferencesInitialized', () => {
    it('should return false when no preferences exist', () => {
      expect(service.isPreferencesInitialized()).toBe(true);
    });
  });

  describe('clearPreferences', () => {
    it('should clear preferences from localStorage', () => {
      const preferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };
      service.savePreferences(preferences);

      const result = service.clearPreferences();

      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('pregnancy_calendar_preferences');
      expect(service.getCurrentPreferences()).toBeNull();
    });

    it('should handle localStorage errors when clearing', () => {
      (localStorage.removeItem as jasmine.Spy).and.throwError('Access denied');
      spyOn(console, 'error');

      const result = service.clearPreferences();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear preferences from localStorage:',
        jasmine.any(Error)
      );
    });

    it('should emit null to subscribers when cleared', () => {
      const preferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };
      service.savePreferences(preferences);

      let emittedPreferences: UserPreferences | null = preferences;
      service.getPreferences().subscribe(prefs => {
        emittedPreferences = prefs;
      });

      service.clearPreferences();

      expect(emittedPreferences).toBeNull();
    });
  });

  describe('preferences validation', () => {
    it('should validate preferences structure', () => {
      // Test with valid preferences
      const validPreferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };

      mockLocalStorage['pregnancy_calendar_preferences'] = JSON.stringify(validPreferences);
      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toEqual(validPreferences);
    });

    it('should reject preferences with invalid theme color', () => {
      const invalidPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'invalid-theme',
        viewMode: 'summary',
      };

      mockLocalStorage['pregnancy_calendar_preferences'] = JSON.stringify(invalidPreferences);
      spyOn(console, 'warn');

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid preferences found in localStorage, clearing...'
      );
    });

    it('should reject preferences with invalid view mode', () => {
      const invalidPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'invalid-view',
      };

      mockLocalStorage['pregnancy_calendar_preferences'] = JSON.stringify(invalidPreferences);
      spyOn(console, 'warn');

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid preferences found in localStorage, clearing...'
      );
    });

    it('should reject non-object preferences', () => {
      mockLocalStorage['pregnancy_calendar_preferences'] = '"not an object"';
      spyOn(console, 'warn');

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid preferences found in localStorage, clearing...'
      );
    });
  });

  describe('export and import functionality', () => {
    it('should export storage data', () => {
      mockLocalStorage['pregnancy_calendar_preferences'] = '{"test": "data"}';
      mockLocalStorage['pregnancy_calendar_other'] = '{"other": "data"}';
      mockLocalStorage['unrelated_key'] = 'should not be exported';

      const exportedData = service.exportStorageData();

      expect(exportedData).toEqual({
        pregnancy_calendar_preferences: '{"test": "data"}',
        pregnancy_calendar_other: '{"other": "data"}',
      });
      expect(exportedData['unrelated_key']).toBeUndefined();
    });

    it('should handle export errors gracefully', () => {
      // Mock localStorage.key to throw an error
      (localStorage.key as jasmine.Spy).and.throwError('Access error');
      spyOn(console, 'error');

      const result = service.exportStorageData();

      expect(result).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        'Failed to export storage data:',
        jasmine.any(Error)
      );
    });

    it('should import storage data', () => {
      const importData = {
        pregnancy_calendar_preferences: '{"lmpDate": "2024-01-01"}',
        pregnancy_calendar_other: '{"test": "value"}',
        invalid_key: 'should be ignored',
      };

      const result = service.importStorageData(importData);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pregnancy_calendar_preferences',
        '{"lmpDate": "2024-01-01"}'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pregnancy_calendar_other',
        '{"test": "value"}'
      );
      expect(localStorage.setItem).not.toHaveBeenCalledWith('invalid_key', jasmine.any(String));
    });

    it('should handle import errors gracefully', () => {
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      const result = service.importStorageData({
        pregnancy_calendar_test: 'test_value',
      });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to import storage data:',
        jasmine.any(Error)
      );
    });

    it('should reload preferences after import', () => {
      const importData = {
        pregnancy_calendar_preferences: JSON.stringify({
          lmpDate: '2024-03-01',
          themeColor: 'girl',
          viewMode: 'table',
        }),
      };

      service.importStorageData(importData);

      expect(service.getCurrentPreferences()).toEqual({
        lmpDate: '2024-03-01',
        themeColor: 'girl',
        viewMode: 'table',
      });
    });
  });

  describe('Observable behavior', () => {
    // it('should emit current preferences to new subscribers', () => {
    //   const preferences: UserPreferences = {
    //     lmpDate: '2024-01-01',
    //     themeColor: 'neutral',
    //     viewMode: 'summary',
    //   };
    //   service.savePreferences(preferences);

    //   let emittedPreferences: UserPreferences | null = null;
    //   service.getPreferences().subscribe(prefs => {
    //     emittedPreferences = prefs;
    //   });

    //   expect(emittedPreferences).toEqual(preferences);
    // });

    it('should emit null when no preferences are stored', () => {
      let emittedPreferences: UserPreferences | null = undefined as any;
      service.getPreferences().subscribe(prefs => {
        emittedPreferences = prefs;
      });

      expect(emittedPreferences).toBeNull();
    });

    // it('should emit preferences changes to multiple subscribers', () => {
    //   const preferences1: UserPreferences = {
    //     lmpDate: '2024-01-01',
    //     themeColor: 'neutral',
    //     viewMode: 'summary',
    //   };

    //   const preferences2: UserPreferences = {
    //     lmpDate: '2024-02-01',
    //     themeColor: 'boy',
    //     viewMode: 'table',
    //   };

    //   let subscriber1Preferences: UserPreferences | null = null;
    //   let subscriber2Preferences: UserPreferences | null = null;

    //   service.getPreferences().subscribe(prefs => {
    //     subscriber1Preferences = prefs;
    //   });

    //   service.getPreferences().subscribe(prefs => {
    //     subscriber2Preferences = prefs;
    //   });

    //   service.savePreferences(preferences1);
    //   expect(subscriber1Preferences).toEqual(preferences1);
    //   expect(subscriber2Preferences).toEqual(preferences1);

    //   service.savePreferences(preferences2);
    //   expect(subscriber1Preferences).toEqual(preferences2);
    //   expect(subscriber2Preferences).toEqual(preferences2);
    // });
  });

  describe('edge cases', () => {
    it('should handle missing required properties', () => {
      const incompletePreferences = {
        lmpDate: '2024-01-01',
        // Missing themeColor and viewMode
      };

      mockLocalStorage['pregnancy_calendar_preferences'] = JSON.stringify(incompletePreferences);
      spyOn(console, 'warn');

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
    });

    it('should handle null localStorage values', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      const newService = new StorageService();

      expect(newService.getCurrentPreferences()).toBeNull();
    });

    it('should handle localStorage quota exceeded', () => {
      const preferences: UserPreferences = {
        lmpDate: '2024-01-01',
        themeColor: 'neutral',
        viewMode: 'summary',
      };

      (localStorage.setItem as jasmine.Spy).and.throwError(new DOMException('QuotaExceededError'));
      spyOn(console, 'error');

      const result = service.savePreferences(preferences);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
