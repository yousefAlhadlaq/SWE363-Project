import React, { useState } from 'react';
import Button from '../Shared/Button';

function ReportsExport() {
  const [reportType, setReportType] = useState('monthly');
  const [format, setFormat] = useState('pdf');

  const handleExport = () => {
    // Add export logic here
    console.log(`Exporting ${reportType} report as ${format}`);
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Export Reports</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Report Type</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="monthly"
                checked={reportType === 'monthly'}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Monthly Summary
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="yearly"
                checked={reportType === 'yearly'}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Yearly Summary
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="custom"
                checked={reportType === 'custom'}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Custom Date Range
            </label>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Export Format</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-2"
              />
              PDF
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-2"
              />
              Excel
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-2"
              />
              CSV
            </label>
          </div>
        </div>

        <Button onClick={handleExport} variant="primary">
          Export Report
        </Button>
      </div>
    </div>
  );
}

export default ReportsExport;
