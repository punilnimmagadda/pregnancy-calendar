# Pregnancy Calendar App - Development Context

## Current Status: 85% Complete ✅

### Completed Components & Files:
- ✅ **Project Setup**: package.json, angular.json, ESLint, Prettier, Husky
- ✅ **Core Models**: Complete TypeScript interfaces in `pregnancy.models.ts`
- ✅ **Core Services**: 
  - StorageService (with comprehensive tests)
  - PregnancyCalculatorService 
  - ExportService (PDF & Excel)
  - ThemeService (dark mode + 3 color themes)
- ✅ **Global Styles**: Complete SCSS with BEM methodology
- ✅ **Components**:
  - AppComponent (main orchestrator)
  - SetupComponent (LMP input & theme selection)
  - HeaderComponent (navigation & theme switcher)
  - SummaryViewComponent (pregnancy overview)
  - TableViewComponent (detailed 280-day calendar) 
  - FloatingNavigationComponent (view switching & export)

### Remaining Work (~15%):
- ⏳ **SCSS files** for TableView and FloatingNavigation components
- ⏳ **Test files** for remaining components
- ⏳ **main.ts** and **index.html** files
- ⏳ **GitHub Pages** deployment configuration

## Key Technical Decisions Made:

### Architecture:
- **Angular 19** with standalone components
- **RxJS** for reactive state management (no signals)
- **Service-based architecture** with separation of concerns
- **Mobile-first responsive design**
- **LocalStorage** for data persistence

### Medical Specifications:
- **LMP-based calculations** (Last Menstrual Period)
- **280-day pregnancy** (40 weeks standard)
- **Medical terminology** throughout
- **Proper disclaimers** included
- **Fetal development data** by week

### Design System:
- **Dark mode only** with 3 accent color themes:
  - Neutral: Warm beige (#D4A574)
  - Boy: Light blue (#6B9BD1) 
  - Girl: Soft pink (#E8A5B8)
- **BEM CSS methodology**
- **CSS custom properties** for theming
- **Accessibility-first** (ARIA, keyboard navigation)

### Features Implemented:
- **Two Views**: Summary (overview) and Table (detailed calendar)
- **Month Filtering** in table view
- **Export Functionality**: PDF and Excel
- **Theme Switching** with live preview
- **Floating Navigation** at bottom for mobile
- **Progress Tracking** with visual indicators
- **Milestone Tracking** and appointment reminders

## File Structure Created:
```
src/
├── app/
│   ├── components/
│   │   ├── setup/
│   │   ├── header/  
│   │   ├── summary-view/
│   │   ├── table-view/
│   │   └── floating-navigation/
│   ├── services/
│   │   ├── storage.service.ts
│   │   ├── pregnancy-calculator.service.ts
│   │   ├── export.service.ts
│   │   └── theme.service.ts
│   ├── models/
│   │   └── pregnancy.models.ts
│   └── app.component.ts
├── styles.scss (global styles)
└── [remaining files needed]
```

## User Flow:
1. **Setup**: Enter LMP date, choose theme, accept disclaimer
2. **Summary View**: See current status, progress, milestones
3. **Table View**: Browse 280-day calendar with filtering
4. **Export**: Download as PDF or Excel
5. **Settings**: Change theme, reset preferences

## Next Steps for Completion:
1. Create remaining SCSS files (table-view, floating-navigation)
2. Write comprehensive test suites for all components  
3. Create main.ts bootstrap file and index.html
4. Set up GitHub Pages deployment
5. Final testing and bug fixes

## Key Code Patterns:
- **BehaviorSubject** for state management
- **OnPush change detection** ready
- **Comprehensive error handling**
- **TypeScript strict mode**
- **100% test coverage target**
- **Accessibility best practices**

## Libraries Used:
- **jsPDF** for PDF generation
- **xlsx** (SheetJS) for Excel export  
- **RxJS** for reactive programming
- **Angular 19** latest features

## Development Commands:
```bash
npm start              # Development server
npm test              # Run unit tests  
npm run build:prod    # Production build
npm run deploy        # Deploy to GitHub Pages
npm run lint          # ESLint check
npm run format        # Prettier formatting
```

This context provides everything needed to continue development efficiently.