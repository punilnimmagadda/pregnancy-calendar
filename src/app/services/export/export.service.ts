import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  ExportData,
  ExportFormat,
  PregnancyDay,
  PregnancySummary,
} from '../../models/pregnancy.models';

/**
 * Service responsible for exporting pregnancy data to PDF and Excel formats
 * Uses jsPDF for PDF generation and SheetJS (xlsx) for Excel generation
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /** PDF page margins */
  private readonly PDF_MARGINS = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  };

  /** PDF page dimensions (A4) */
  private readonly PDF_PAGE = {
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
  };

  /**
   * Exports pregnancy data in the specified format
   * @param exportData - Complete export data object
   * @param format - Export format (pdf or excel)
   * @param filename - Optional custom filename
   * @returns Promise<boolean> indicating success/failure
   */
  async exportData(
    exportData: ExportData,
    format: ExportFormat,
    filename?: string
  ): Promise<boolean> {
    try {
      const defaultFilename = this.generateDefaultFilename(exportData.summary, format);
      const finalFilename = filename || defaultFilename;

      if (format === 'pdf') {
        return await this.exportToPdf(exportData, finalFilename);
      } else {
        return this.exportToExcel(exportData, finalFilename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }

  /**
   * Exports pregnancy data to PDF format
   * @param exportData - Complete export data object
   * @param filename - PDF filename
   * @returns Promise<boolean> indicating success/failure
   */
  private async exportToPdf(exportData: ExportData, filename: string): Promise<boolean> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = this.PDF_MARGINS.top;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pregnancy Calendar', this.PDF_MARGINS.left, yPosition);
      yPosition += 15;

      // Add generation date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on: ${exportData.exportTimestamp.toLocaleDateString()}`,
        this.PDF_MARGINS.left,
        yPosition
      );
      yPosition += 15;

      // Add summary section
      yPosition = this.addSummaryToPdf(pdf, exportData.summary, yPosition);

      // Add disclaimer
      yPosition = this.addDisclaimerToPdf(pdf, yPosition);

      // Add pregnancy calendar table
      await this.addCalendarTableToPdf(pdf, exportData.pregnancyDays, yPosition);

      // Save the PDF
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('PDF export failed:', error);
      return false;
    }
  }

  /**
   * Adds pregnancy summary to PDF
   * @param pdf - jsPDF instance
   * @param summary - Pregnancy summary data
   * @param startY - Starting Y position
   * @returns New Y position after adding summary
   */
  private addSummaryToPdf(pdf: jsPDF, summary: PregnancySummary, startY: number): number {
    let yPosition = startY;

    // Section title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pregnancy Summary', this.PDF_MARGINS.left, yPosition);
    yPosition += 10;

    // Summary details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const summaryItems = [
      `Current Gestational Age: ${summary.currentGestationalAge}`,
      `Current Trimester: ${summary.currentTrimester}`,
      `Days Completed: ${summary.daysCompleted}`,
      `Days Remaining: ${summary.daysRemaining}`,
      `Progress: ${summary.progressPercentage}%`,
      `Estimated Due Date: ${summary.formattedDueDate}`,
    ];

    summaryItems.forEach(item => {
      pdf.text(item, this.PDF_MARGINS.left, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Upcoming milestones
    if (summary.upcomingMilestones.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Upcoming Milestones:', this.PDF_MARGINS.left, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      summary.upcomingMilestones.forEach(milestone => {
        pdf.text(`• ${milestone}`, this.PDF_MARGINS.left + 5, yPosition);
        yPosition += 6;
      });
    }

    return yPosition + 10;
  }

  /**
   * Adds medical disclaimer to PDF
   * @param pdf - jsPDF instance
   * @param startY - Starting Y position
   * @returns New Y position after adding disclaimer
   */
  private addDisclaimerToPdf(pdf: jsPDF, startY: number): number {
    let yPosition = startY;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');

    const disclaimer = [
      'MEDICAL DISCLAIMER: This calendar is based on standard 40-week pregnancy calculations',
      'from your Last Menstrual Period (LMP). All dates and milestones are estimates only.',
      'Individual pregnancies may vary. Always consult with your healthcare provider for',
      'personalized medical advice and accurate pregnancy monitoring.',
    ];

    disclaimer.forEach(line => {
      pdf.text(line, this.PDF_MARGINS.left, yPosition);
      yPosition += 4;
    });

    return yPosition + 15;
  }

  /**
   * Adds pregnancy calendar table to PDF
   * @param pdf - jsPDF instance
   * @param pregnancyDays - Array of pregnancy days
   * @param startY - Starting Y position
   * @returns Promise<void>
   */
  private async addCalendarTableToPdf(
    pdf: jsPDF,
    pregnancyDays: PregnancyDay[],
    startY: number
  ): Promise<void> {
    const pageHeight = this.PDF_PAGE.height - this.PDF_MARGINS.bottom;
    let yPosition = startY;

    // Table headers
    const headers = ['Day', 'Date', 'Week', 'Trimester', 'Development'];
    const colWidths = [15, 25, 20, 25, 95]; // Column widths in mm

    // Add table header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pregnancy Calendar', this.PDF_MARGINS.left, yPosition);
    yPosition += 10;

    // Add column headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    let xPosition = this.PDF_MARGINS.left;

    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 8;

    // Add table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    for (const day of pregnancyDays) {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = this.PDF_MARGINS.top;
      }

      xPosition = this.PDF_MARGINS.left;

      // Row data
      const rowData = [
        day.dayNumber.toString(),
        day.formattedDate,
        `${day.gestationalWeek}w ${day.dayOfWeek}d`,
        day.trimester,
        day.developmentMilestone || day.appointments?.join('; ') || '',
      ];

      rowData.forEach((data, index) => {
        const maxWidth = colWidths[index] - 2; // Leave some padding
        const lines = pdf.splitTextToSize(data, maxWidth);

        if (Array.isArray(lines)) {
          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, xPosition, yPosition + lineIndex * 4);
          });
        } else {
          pdf.text(lines, xPosition, yPosition);
        }

        xPosition += colWidths[index];
      });

      yPosition += 6;
    }
  }

  /**
   * Exports pregnancy data to Excel format
   * @param exportData - Complete export data object
   * @param filename - Excel filename
   * @returns boolean indicating success/failure
   */
  private exportToExcel(exportData: ExportData, filename: string): boolean {
    try {
      const workbook = XLSX.utils.book_new();

      // Create summary worksheet
      this.addSummaryWorksheet(workbook, exportData.summary);

      // Create calendar worksheet
      this.addCalendarWorksheet(workbook, exportData.pregnancyDays);

      // Create appointments worksheet
      this.addAppointmentsWorksheet(workbook, exportData.pregnancyDays);

      // Create milestones worksheet
      this.addMilestonesWorksheet(workbook, exportData.pregnancyDays);

      // Write the file
      XLSX.writeFile(workbook, filename);
      return true;
    } catch (error) {
      console.error('Excel export failed:', error);
      return false;
    }
  }

  /**
   * Adds summary worksheet to Excel workbook
   * @param workbook - XLSX workbook instance
   * @param summary - Pregnancy summary data
   */
  private addSummaryWorksheet(workbook: XLSX.WorkBook, summary: PregnancySummary): void {
    const summaryData = [
      ['Pregnancy Summary', ''],
      ['Current Gestational Age', summary.currentGestationalAge],
      ['Current Trimester', summary.currentTrimester],
      ['Days Completed', summary.daysCompleted],
      ['Days Remaining', summary.daysRemaining],
      ['Progress Percentage', `${summary.progressPercentage}%`],
      ['Estimated Due Date', summary.formattedDueDate],
      ['', ''],
      ['Upcoming Milestones', ''],
      ...summary.upcomingMilestones.map(milestone => ['', milestone]),
      ['', ''],
      ['Next Appointments', ''],
      ...summary.nextAppointments.map(appointment => ['', appointment]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Milestones');
  }

  /**
   * Generates default filename based on export data and format
   * @param summary - Pregnancy summary data
   * @param format - Export format
   * @returns Generated filename
   */
  private generateDefaultFilename(summary: PregnancySummary, format: ExportFormat): string {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    return `pregnancy-calendar-${summary.currentGestationalAge.replace(' ', '-')}-${dateStr}.${extension}`;
  }

  /**
   * Validates export data before processing
   * @param exportData - Export data to validate
   * @returns boolean indicating if data is valid
   */
  validateExportData(exportData: ExportData): boolean {
    if (!exportData) {
      console.error('Export data is null or undefined');
      return false;
    }

    if (!exportData.summary) {
      console.error('Export data missing summary');
      return false;
    }

    if (!exportData.pregnancyDays || exportData.pregnancyDays.length === 0) {
      console.error('Export data missing pregnancy days');
      return false;
    }

    if (!exportData.userPreferences) {
      console.error('Export data missing user preferences');
      return false;
    }

    return true;
  }

  /**
   * Gets estimated file size for export (rough calculation)
   * @param exportData - Export data
   * @param format - Export format
   * @returns Estimated file size in KB
   */
  getEstimatedFileSize(exportData: ExportData, format: ExportFormat): number {
    const dataPoints = exportData.pregnancyDays.length;

    if (format === 'pdf') {
      // PDF estimate: ~2-3 KB per day + base overhead
      return Math.round(dataPoints * 2.5 + 50);
    } else {
      // Excel estimate: ~1 KB per day + base overhead
      return Math.round(dataPoints * 1 + 30);
    }
  }

  /**
   * Creates a preview of export data for user confirmation
   * @param exportData - Export data
   * @returns Preview object with summary information
   */
  createExportPreview(exportData: ExportData): {
    summary: string;
    totalDays: number;
    appointmentsCount: number;
    milestonesCount: number;
    estimatedFileSizes: { pdf: number; excel: number };
  } {
    const appointmentsCount = exportData.pregnancyDays.filter(
      day => day.appointments && day.appointments.length > 0
    ).length;

    const milestonesCount = exportData.pregnancyDays.filter(day => day.developmentMilestone).length;

    return {
      summary: `Export includes ${exportData.pregnancyDays.length} days of pregnancy calendar data`,
      totalDays: exportData.pregnancyDays.length,
      appointmentsCount,
      milestonesCount,
      estimatedFileSizes: {
        pdf: this.getEstimatedFileSize(exportData, 'pdf'),
        excel: this.getEstimatedFileSize(exportData, 'excel'),
      },
    };
  }

  /**
   * Adds calendar worksheet to Excel workbook
   * @param workbook - XLSX workbook instance
   * @param pregnancyDays - Array of pregnancy days
   */
  private addCalendarWorksheet(workbook: XLSX.WorkBook, pregnancyDays: PregnancyDay[]): void {
    const headers = [
      'Day Number',
      'Date',
      'Gestational Week',
      'Day of Week',
      'Gestational Age',
      'Month',
      'Year',
      'Trimester',
      'Fetal Weight (g)',
      'Fetal Length (cm)',
    ];

    const data = pregnancyDays.map(day => [
      day.dayNumber,
      day.formattedDate,
      day.gestationalWeek,
      day.dayOfWeek,
      day.gestationalAge,
      day.monthName,
      day.calendarYear,
      day.trimester,
      day.estimatedFetalWeight || '',
      day.estimatedFetalLength || '',
    ]);

    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calendar');
  }

  /**
   * Adds appointments worksheet to Excel workbook
   * @param workbook - XLSX workbook instance
   * @param pregnancyDays - Array of pregnancy days
   */
  private addAppointmentsWorksheet(workbook: XLSX.WorkBook, pregnancyDays: PregnancyDay[]): void {
    const appointmentData: string[][] = [['Date', 'Week', 'Appointment']];

    pregnancyDays.forEach(day => {
      if (day.appointments && day.appointments.length > 0) {
        day.appointments.forEach(appointment => {
          appointmentData.push([day.formattedDate, `Week ${day.gestationalWeek}`, appointment]);
        });
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(appointmentData);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  }

  /**
   * Adds milestones worksheet to Excel workbook
   * @param workbook - XLSX workbook instance
   * @param pregnancyDays - Array of pregnancy days
   */
  private addMilestonesWorksheet(workbook: XLSX.WorkBook, pregnancyDays: PregnancyDay[]): void {
    const milestoneData: string[][] = [['Date', 'Week', 'Development Milestone']];

    pregnancyDays.forEach(day => {
      if (day.developmentMilestone) {
        milestoneData.push([
          day.formattedDate,
          `Week ${day.gestationalWeek}`,
          day.developmentMilestone,
        ]);
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(milestoneData);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Milestones');
  }
}
