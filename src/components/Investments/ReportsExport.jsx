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
    <div className="max-w-2xl mx-auto p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-white">Export Reports</h2>
      <div className="bg-slate-800/80 p-6 rounded-xl shadow-lg border border-slate-700/60 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Report Type</h3>
          <div className="space-y-2 text-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reportType"
                value="monthly"
                checked={reportType === 'monthly'}
                onChange={(e) => setReportType(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              Monthly Summary
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reportType"
                value="yearly"
                checked={reportType === 'yearly'}
                onChange={(e) => setReportType(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              Yearly Summary
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="reportType"
                value="custom"
                checked={reportType === 'custom'}
                onChange={(e) => setReportType(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              Custom Date Range
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Export Format</h3>
          <div className="space-y-2 text-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              PDF
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              Excel
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value)}
                className="text-teal-400 focus:ring-teal-400"
              />
              CSV
            </label>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleExport} variant="primary">
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReportsExport;
