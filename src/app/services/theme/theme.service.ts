import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeColor } from '../../models/pregnancy.models';

/**
 * Service responsible for managing application themes and colors
 * Handles dark mode with three color variations: neutral, boy, and girl themes
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** Current theme color subject */
  private themeColorSubject = new BehaviorSubject<ThemeColor>('neutral');

  /** CSS custom properties for each theme */
  private readonly THEME_PROPERTIES: Record<ThemeColor, Record<string, string>> = {
    neutral: {
      '--color-primary': '#D4A574', // Warm beige/tan
      '--color-primary-light': '#E5C29F',
      '--color-primary-dark': '#B8944F',
      '--color-accent': '#F4E4D1',
      '--color-accent-light': '#F9F0E5',
      '--color-accent-dark': '#E8D3B8',
      '--color-gradient-start': '#D4A574',
      '--color-gradient-end': '#E5C29F',
    },
    boy: {
      '--color-primary': '#6B9BD1', // Light blue
      '--color-primary-light': '#8FB4DC',
      '--color-primary-dark': '#4A82C6',
      '--color-accent': '#A8C8E6',
      '--color-accent-light': '#C1D7F0',
      '--color-accent-dark': '#8FB9DC',
      '--color-gradient-start': '#6B9BD1',
      '--color-gradient-end': '#8FB4DC',
    },
    girl: {
      '--color-primary': '#E8A5B8', // Soft pink
      '--color-primary-light': '#F0BCC9',
      '--color-primary-dark': '#E08EA7',
      '--color-accent': '#F5D0DC',
      '--color-accent-light': '#F9E5EA',
      '--color-accent-dark': '#F0BAC9',
      '--color-gradient-start': '#E8A5B8',
      '--color-gradient-end': '#F0BCC9',
    },
  };

  /** Base dark theme properties that remain consistent */
  private readonly BASE_DARK_THEME: Record<string, string> = {
    '--color-background': '#0F0F0F', // Very dark background
    '--color-surface': '#1A1A1A', // Dark surface
    '--color-surface-elevated': '#252525', // Elevated surface
    '--color-surface-hover': '#2F2F2F', // Hover state
    '--color-text': '#FFFFFF', // White text
    '--color-text-secondary': '#CCCCCC', // Light gray text
    '--color-text-muted': '#888888', // Muted text
    '--color-border': '#333333', // Dark borders
    '--color-border-light': '#444444', // Lighter borders
    '--color-shadow': 'rgba(0, 0, 0, 0.5)', // Shadows
    '--color-success': '#4CAF50', // Success color
    '--color-warning': '#FF9800', // Warning color
    '--color-error': '#F44336', // Error color
    '--color-info': '#2196F3', // Info color

    // Typography
    '--font-family-primary':
      '"Gilroy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '--font-weight-normal': '400',
    '--font-weight-medium': '500',
    '--font-weight-semibold': '600',
    '--font-weight-bold': '700',

    // Spacing
    '--spacing-xs': '0.25rem', // 4px
    '--spacing-sm': '0.5rem', // 8px
    '--spacing-md': '1rem', // 16px
    '--spacing-lg': '1.5rem', // 24px
    '--spacing-xl': '2rem', // 32px
    '--spacing-xxl': '3rem', // 48px

    // Border radius
    '--radius-sm': '0.25rem', // 4px
    '--radius-md': '0.5rem', // 8px
    '--radius-lg': '1rem', // 16px
    '--radius-xl': '1.5rem', // 24px
    '--radius-full': '9999px', // Full radius

    // Transitions
    '--transition-fast': '0.15s ease-in-out',
    '--transition-normal': '0.3s ease-in-out',
    '--transition-slow': '0.5s ease-in-out',

    // Z-index layers
    '--z-dropdown': '1000',
    '--z-sticky': '1020',
    '--z-fixed': '1030',
    '--z-modal-backdrop': '1040',
    '--z-modal': '1050',
    '--z-popover': '1060',
    '--z-tooltip': '1070',
    '--z-toast': '1080',
  };

  constructor() {
    // Initialize with default theme
    this.initializeTheme();
  }

  /**
   * Gets the current theme color as an Observable
   * @returns Observable of current theme color
   */
  getCurrentTheme(): Observable<ThemeColor> {
    return this.themeColorSubject.asObservable();
  }

  /**
   * Gets the current theme color synchronously
   * @returns Current theme color
   */
  getCurrentThemeSync(): ThemeColor {
    return this.themeColorSubject.value;
  }

  /**
   * Sets the theme color and applies it to the DOM
   * @param themeColor - Theme color to apply
   */
  setTheme(themeColor: ThemeColor): void {
    this.themeColorSubject.next(themeColor);
    this.applyTheme(themeColor);
  }

  /**
   * Applies the theme to the document root
   * @param themeColor - Theme color to apply
   */
  private applyTheme(themeColor: ThemeColor): void {
    const root = document.documentElement;

    // Apply base dark theme properties
    Object.entries(this.BASE_DARK_THEME).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply theme-specific color properties
    const themeProperties = this.THEME_PROPERTIES[themeColor];
    Object.entries(themeProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add theme class to body for CSS selectors
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '') // Remove existing theme classes
      .trim();
    document.body.classList.add(`theme-${themeColor}`);
  }

  /**
   * Initializes the theme system
   * Sets up default theme and ensures proper initialization
   */
  private initializeTheme(): void {
    // Apply default theme
    this.applyTheme(this.themeColorSubject.value);

    // Ensure dark mode is always applied
    document.body.classList.add('dark-theme');
  }

  /**
   * Gets theme-specific colors for programmatic use
   * @param themeColor - Theme color to get properties for
   * @returns Object with theme color values
   */
  getThemeColors(themeColor?: ThemeColor): Record<string, string> {
    const targetTheme = themeColor || this.getCurrentThemeSync();
    return { ...this.THEME_PROPERTIES[targetTheme] };
  }

  /**
   * Gets all available themes with their display information
   * @returns Array of theme information objects
   */
  getAvailableThemes(): Array<{
    value: ThemeColor;
    label: string;
    description: string;
    primaryColor: string;
  }> {
    return [
      {
        value: 'neutral',
        label: 'Neutral',
        description: 'Warm, gender-neutral tones',
        primaryColor: this.THEME_PROPERTIES.neutral['--color-primary'],
      },
      {
        value: 'boy',
        label: 'Boy',
        description: 'Soft blue accents',
        primaryColor: this.THEME_PROPERTIES.boy['--color-primary'],
      },
      {
        value: 'girl',
        label: 'Girl',
        description: 'Gentle pink accents',
        primaryColor: this.THEME_PROPERTIES.girl['--color-primary'],
      },
    ];
  }

  /**
   * Converts a theme color to its CSS custom property name
   * @param colorName - Name of the color property
   * @param variant - Color variant (light, dark, etc.)
   * @returns CSS custom property name
   */
  getColorProperty(colorName: string, variant?: string): string {
    const variantSuffix = variant ? `-${variant}` : '';
    return `var(--color-${colorName}${variantSuffix})`;
  }

  /**
   * Gets computed color value from the current theme
   * @param propertyName - CSS custom property name
   * @returns Computed color value
   */
  getComputedColor(propertyName: string): string {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(propertyName).trim();
  }

  /**
   * Creates a gradient string using theme colors
   * @param direction - Gradient direction (default: 'to bottom right')
   * @returns CSS gradient string
   */
  createThemeGradient(direction: string = 'to bottom right'): string {
    return `linear-gradient(${direction}, var(--color-gradient-start), var(--color-gradient-end))`;
  }

  /**
   * Generates theme-aware shadow styles
   * @param elevation - Shadow elevation level (1-5)
   * @returns CSS box-shadow string
   */
  getThemeShadow(elevation: 1 | 2 | 3 | 4 | 5): string {
    const shadows = {
      1: '0 1px 3px var(--color-shadow)',
      2: '0 4px 6px var(--color-shadow)',
      3: '0 10px 15px var(--color-shadow)',
      4: '0 20px 25px var(--color-shadow)',
      5: '0 25px 50px var(--color-shadow)',
    };

    return shadows[elevation];
  }

  /**
   * Checks if the current theme is suitable for light text
   * @param themeColor - Theme color to check (defaults to current)
   * @returns boolean indicating if light text should be used
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldUseLightText(themeColor?: ThemeColor): boolean {
    // In this app, all themes are dark backgrounds, so light text is always suitable
    // If you add light themes in the future, adjust this logic accordingly
    return true;
  }

  /**
   * Gets the appropriate text color for the current theme
   * @param variant - Text variant (primary, secondary, muted)
   * @returns CSS color value
   */
  getTextColor(variant: 'primary' | 'secondary' | 'muted' = 'primary'): string {
    const textColors = {
      primary: 'var(--color-text)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
    };

    return textColors[variant];
  }

  /**
   * Generates theme metadata for export or debugging
   * @returns Object containing current theme information
   */
  getThemeMetadata(): {
    currentTheme: ThemeColor;
    appliedProperties: Record<string, string>;
    isDarkMode: boolean;
  } {
    const currentTheme = this.getCurrentThemeSync();
    const appliedProperties = {
      ...this.BASE_DARK_THEME,
      ...this.THEME_PROPERTIES[currentTheme],
    };

    return {
      currentTheme,
      appliedProperties,
      isDarkMode: true, // Always true for this app
    };
  }
}
