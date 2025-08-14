# 🤱 Pregnancy Calendar App

A professional, medically-informed pregnancy tracking application built with Angular 19. Track your 280-day journey with detailed milestones, appointment reminders, and fetal development information.

## ✨ Features

### 📊 **Summary View**
- Current gestational age and trimester
- Progress visualization with completion percentage
- Upcoming milestones and appointments
- Trimester-specific information and reminders

### 📅 **Detailed Calendar View**
- Complete 280-day pregnancy timeline
- Day-by-day breakdown with gestational weeks
- Fetal development milestones by week
- Appointment scheduling reminders
- Estimated fetal weight and size progression
- Month-based filtering system

### 🎨 **Theming System**
- Dark mode optimized design
- Three color schemes: Neutral, Boy, Girl
- Accessible color contrast ratios
- Mobile-first responsive design

### 📤 **Export Functionality**
- PDF export for printing and sharing
- Excel export for data analysis
- Complete calendar data with all milestones
- Professional medical document formatting

### 🔐 **Privacy First**
- 100% client-side calculations
- No data transmission to servers
- LocalStorage for preferences
- GDPR compliant design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pregnancy-calendar.git
cd pregnancy-calendar

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/` - the app will automatically reload when you make changes.

### Development Commands

```bash
# Development server
npm start

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build:prod

# Deploy to GitHub Pages
npm run deploy
```

## 🏗️ Architecture

### Technical Stack
- **Framework**: Angular 19 with standalone components
- **Styling**: SCSS with BEM methodology
- **State Management**: RxJS with BehaviorSubjects
- **Export Libraries**: jsPDF, SheetJS (xlsx)
- **Testing**: Jasmine + Karma with 100% coverage target
- **Build**: Angular CLI with production optimizations

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── setup/              # Initial LMP setup
│   │   ├── header/             # App header with theme switcher
│   │   ├── summary-view/       # Pregnancy overview
│   │   ├── table-view/         # Detailed calendar
│   │   └── floating-navigation/ # View switching & export
│   ├── services/
│   │   ├── storage.service.ts       # LocalStorage management
│   │   ├── pregnancy-calculator.ts  # Medical calculations
│   │   ├── export.service.ts        # PDF/Excel generation
│   │   └── theme.service.ts         # UI theming
│   ├── models/
│   │   └── pregnancy.models.ts      # TypeScript interfaces
│   └── app.component.ts             # Main app orchestrator
├── styles.scss                     # Global styles
└── index.html                       # Main HTML template
```

## 🩺 Medical Information

### Calculation Methodology
- **Basis**: Last Menstrual Period (LMP) dating method
- **Timeline**: Standard 40-week (280-day) pregnancy
- **Trimesters**: First (1-12 weeks), Second (13-27 weeks), Third (28-40 weeks)
- **Development Data**: Based on established medical literature

### Important Disclaimers
- ⚠️ **Educational Purpose Only**: This app provides general information based on standard pregnancy timelines
- 👩‍⚕️ **Consult Healthcare Providers**: Always seek professional medical advice for personalized care
- 📏 **Individual Variation**: Every pregnancy is unique and may vary from standard timelines
- 🚨 **Emergency Situations**: Contact healthcare providers immediately for any concerns

## 🎯 User Guide

### Initial Setup
1. **Enter LMP Date**: Input the first day of your last menstrual period
2. **Choose Theme**: Select color scheme (Neutral, Boy, or Girl)
3. **Accept Disclaimer**: Acknowledge medical disclaimers to continue

### Using the App
1. **Summary View**: See current status, progress, and upcoming milestones
2. **Table View**: Browse detailed 280-day calendar with filtering options
3. **Export Data**: Download complete calendar as PDF or Excel
4. **Change Settings**: Modify theme colors or reset preferences

### Navigation
- **Floating Buttons**: Use bottom navigation for easy mobile access
- **Theme Switcher**: Change colors via header dropdown
- **Month Filter**: Filter table view by specific months

## 🧪 Testing

The application includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run linting
npm run lint
```

**Coverage Targets:**
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

## 🚀 Deployment

### GitHub Pages (Automated)
1. Push to main branch
2. GitHub Actions automatically builds and deploys
3. Access at `https://your-username.github.io/pregnancy-calendar`

### Manual Deployment
```bash
# Build for production
npm run build:prod

# Deploy to GitHub Pages
npm run deploy
```

## 🎨 Design System

### Color Themes
- **Neutral**: Warm beige tones (#D4A574)
- **Boy**: Soft blue accents (#6B9BD1)
- **Girl**: Gentle pink hues (#E8A5B8)

### Typography
- **Font**: Inter (with system font fallbacks)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: Responsive typography using clamp()

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimized
- High contrast mode support
- Reduced motion preferences respected

## 🔧 Configuration

### Environment Variables
- `CUSTOM_DOMAIN`: Custom domain for GitHub Pages
- `CODECOV_TOKEN`: Code coverage reporting
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI integration

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS 12+, Android 8+)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow Angular style guide
- Use BEM CSS methodology
- Maintain 100% test coverage
- Include medical accuracy citations
- Document all functions and components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Medical information based on established obstetric guidelines
- Fetal development data from peer-reviewed medical literature
- Design inspiration from modern healthcare applications
- Accessibility guidelines from WCAG 2.1 standards

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/pregnancy-calendar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/pregnancy-calendar/discussions)
- **Medical Questions**: Always consult your healthcare provider

## 🔒 Privacy & Security

- **No Data Collection**: Zero personal data transmitted or stored externally
- **Local Storage Only**: All preferences stored in browser's localStorage
- **HTTPS Required**: Secure connection enforced for all interactions
- **No Third-Party Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency with public codebase

---

**⚠️ Medical Disclaimer**: This application is for informational and educational purposes only. All calculations are based on standard 40-week pregnancy timelines and may not reflect individual variations. This tool is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for personalized medical guidance and regular prenatal care. In case of medical emergencies or concerns, contact your healthcare provider immediately.
