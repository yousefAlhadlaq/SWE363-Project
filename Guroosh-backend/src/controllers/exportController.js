const ExternalBankAccount = require('../models/externalBankAccount');
const Expense = require('../models/expense');
const PDFDocument = require('pdfkit');

// Helper: Format date
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Helper: Fetch all transactions with filtering
const fetchTransactions = async (userId, startDate, endDate) => {
  const query = { userId };
  const accounts = await ExternalBankAccount.find(query);
  const expenses = await Expense.find(query);

  let allTransactions = [];

  // Process bank transactions
  accounts.forEach(account => {
    account.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      // Filter by date if provided
      if (startDate && txDate < new Date(startDate)) return;
      if (endDate && txDate > new Date(endDate)) return;

      // STRICT FILTERING for Reports:
      // Exclude internal transfers, deposits, main account redistribution
      // Only include real spending (payments) for the spending report
      // However, the user asked for "Full transaction history (filtered)"
      // But also said "Exclude internal transfers, deposits... Only include real spending types when exporting spending report"
      // The prompt says: "Exclude: internal transfers, deposits, main account redistribution. Only include real spending types when exporting spending report"
      // It seems the user wants a "Spending Report".
      // Let's filter for 'payment' type primarily, as requested in "Backend Requirements" section 1.
      
      if (tx.type === 'payment') {
        allTransactions.push({
          date: formatDate(tx.date),
          type: tx.type,
          merchant: tx.description || 'Unknown', // Description usually holds merchant name
          category: tx.category || 'Other',
          amount: tx.amount,
          direction: 'outgoing',
          account: account.bank,
          originalDate: txDate
        });
      }
    });
  });

  // Process expenses
  expenses.forEach(expense => {
    const txDate = new Date(expense.date);
    if (startDate && txDate < new Date(startDate)) return;
    if (endDate && txDate > new Date(endDate)) return;

    allTransactions.push({
      date: formatDate(expense.date),
      type: 'payment', // Expenses are payments
      merchant: expense.description || expense.title || 'Expense',
      category: expense.category || 'Other',
      amount: expense.amount,
      direction: 'outgoing',
      account: 'Manual Expense',
      originalDate: txDate
    });
  });

  // Sort by date (newest first)
  allTransactions.sort((a, b) => b.originalDate - a.originalDate);

  return allTransactions;
};

// GET /api/export/csv
exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const transactions = await fetchTransactions(userId, startDate, endDate);

    // CSV Header
    let csvContent = 'Date,Type,Merchant,Category,Amount,Direction,Account\n';

    // CSV Rows
    transactions.forEach(tx => {
      const row = [
        tx.date,
        tx.type,
        `"${tx.merchant.replace(/"/g, '""')}"`, // Escape quotes
        tx.category,
        tx.amount,
        tx.direction,
        tx.account
      ].join(',');
      csvContent += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to export CSV' });
  }
};

// GET /api/export/pdf
exports.exportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const transactions = await fetchTransactions(userId, startDate, endDate);

    // Calculate totals
    const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();

    // Date Range
    doc.fontSize(12).text(`Date Range: ${startDate || 'All time'} - ${endDate || 'Present'}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Spending: SR ${totalSpending.toFixed(2)}`);
    doc.moveDown();

    // Table Header
    const tableTop = 250;
    const dateX = 50;
    const merchantX = 150;
    const categoryX = 300;
    const amountX = 450;

    doc.font('Helvetica-Bold');
    doc.text('Date', dateX, tableTop);
    doc.text('Merchant', merchantX, tableTop);
    doc.text('Category', categoryX, tableTop);
    doc.text('Amount', amountX, tableTop);
    doc.moveDown();
    doc.font('Helvetica');

    // Draw line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    let y = tableTop + 30;
    
    transactions.forEach(tx => {
      // Check for page break
      if (y > 700) {
        doc.addPage();
        y = 50;
        
        // Redraw header on new page
        doc.font('Helvetica-Bold');
        doc.text('Date', dateX, y);
        doc.text('Merchant', merchantX, y);
        doc.text('Category', categoryX, y);
        doc.text('Amount', amountX, y);
        doc.moveDown();
        doc.font('Helvetica');
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        y += 30;
      }

      doc.text(tx.date, dateX, y);
      doc.text(tx.merchant.substring(0, 20), merchantX, y); // Truncate merchant
      doc.text(tx.category, categoryX, y);
      doc.text(`SR ${tx.amount.toFixed(2)}`, amountX, y);
      
      y += 20;
    });

    doc.end();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ success: false, error: 'Failed to export PDF' });
  }
};
