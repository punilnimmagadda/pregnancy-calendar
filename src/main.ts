/**
 * Main application bootstrap file
 * Initializes the Angular application with standalone components
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';

/**
 * Bootstrap the application with necessary providers
 * Using standalone components architecture with Angular 19
 */
bootstrapApplication(AppComponent, {
  providers: [
    // Router configuration (though we're using a single-page app)
    provideRouter([
      {
        path: '',
        component: AppComponent,
        title: 'Pregnancy Calendar',
      },
      {
        path: '**',
        redirectTo: '',
      },
    ]),

    // Import browser animations for smooth transitions
    importProvidersFrom(BrowserAnimationsModule),
  ],
}).catch(err => {
  console.error('Error starting application:', err);

  // Display user-friendly error message
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0F0F0F;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1 style="color: #F44336; margin-bottom: 16px;">⚠️ Application Error</h1>
        <p style="margin-bottom: 16px; max-width: 500px;">
          Sorry, there was an error loading the Pregnancy Calendar application.
          Please refresh the page or try again later.
        </p>
        <button
          onclick="window.location.reload()"
          style="
            background: #D4A574;
            color: #0F0F0F;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          "
        >
          Reload Application
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(errorDiv);
});
