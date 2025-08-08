import html2pdf from 'html2pdf.js';
import logo from '../assets/images/gul-e-daman-logo.png';
import receiptLogo from '../assets/images/reciept-logo.png';
import barcode from '../assets/images/barcode.png';
import bgImage from '../assets/images/bg-shape-invoice.png';
import { FaScissors } from "react-icons/fa6";

export const generateReportPdf = (report, isMultiple = false, accountInfo = null) => {
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };



  // Create a multiple reports PDF
  const createMultipleReports = (reports) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="display:flex; align-items:center; width:100%;">
        <div style="width:7%;">
          <img src="${logo}" alt="Logo" /></div><div style="width:93%;">
          <h1 style="color: #351c7d; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;text-align:center;">
            Accounts Group Officers Co-operative Housing Society Limited Lahore
          </h1>
          <p style="font-size: 12px; color: #555; margin: 0;text-align:center;">
            Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com
          </p></div>
        </div>
        
        <h2 style="text-align: center; font-size: 16px; color: #351c7d; margin-bottom: 20px; border-bottom: 2px solid #351c7d; padding-bottom: 20px;">
          Account Status
        </h2>
        ${accountInfo ? `
          <div style="border: 1px solid #ccc; height:auto;  margin-bottom: 20px; font-size: 12px;">
            <div style="display: flex; ">
              <div style="border-right: 1px solid #ccc; width:50%;padding:10px 10px 20px 10px;">
                <p><strong>Name:</strong> ${accountInfo.name}</p>
                <p><strong>CNIC:</strong> ${accountInfo.cnic}</p>
                <p><strong>Contact:</strong> ${accountInfo.contact}</p>
                <p><strong>Relationship:</strong> ${accountInfo.relationship}</p>
              </div>
              <div style="width:50%;padding:10px;">
                <p><strong>Type:</strong> ${accountInfo.type}</p>
                <p><strong>Status:</strong> ${accountInfo.status}</p>
                <p><strong>Membership No:</strong> ${accountInfo.membership_no}</p>
                <p><strong>Property/Block No:</strong> ${accountInfo.property_no} - ${accountInfo.block_name}</p>
               
              </div>
            </div>
          </div>
        ` : ''}
        
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background-color: #351c7d; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
                   <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Receipt No</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Property</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Month/Year</th>
       
          
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Bills</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Received</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Discount</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Balance</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Payment Method</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Reference No</th>
         
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Paid Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${reports.map((report, index) => `
              <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${report.recept_no || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.name_id}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.block_name} ${report.property_number}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.month}/${report.year}</td>
                
              
                <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(report.total_bills)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(report.received_amount)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(report.discount)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(report.after_pay_balance)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                
                    ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                 
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.payment_by || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.reference_no || '-'}</td>
              
                <td style="border: 1px solid #ddd; padding: 8px;">${report.paid_date ? formatDate(report.paid_date) : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${report.description || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f0f0f0; font-weight: bold;">
              <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Totals:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(reports.reduce((sum, r) => sum + (r.total_bills || 0), 0))}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(reports.reduce((sum, r) => sum + (r.received_amount || 0), 0))}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(reports.reduce((sum, r) => sum + (r.discount || 0), 0))}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(reports.reduce((sum, r) => sum + (r.after_pay_balance || 0), 0))}</td>
              <td colspan="5" style="border: 1px solid #ddd; padding: 8px;"></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px; font-size: 11px; text-align: center; color: #555;">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
        </div>
      </div>
    `;

    return element;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      case 'partially': return '#17a2b8';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Generate the appropriate PDF
  if (isMultiple) {
    const element = createMultipleReports(report);
    html2pdf().from(element).set({
      margin: 10,
      filename: `reports-summary-${new Date().toISOString().slice(0, 10)}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }).save();
  } else {
    const element = createSingleReport(report);
    html2pdf().from(element).set({
      margin: 10,
      filename: `payment-receipt-${report.property_number}-${report.month}-${report.year}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    }).save();
  }
};