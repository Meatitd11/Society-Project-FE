import html2pdf from 'html2pdf.js';
import logo from '../assets/images/gul-e-daman-logo.png';
// import receiptLogo from '../assets/images/reciept-logo.png';
// import barcode from '../assets/images/barcode.png';
// import bgImage from '../assets/images/bg-shape-invoice.png';
// import { FaScissors } from "react-icons/fa6";

export const generateReportPdf = (report, isMultiple = false, accountInfo = null, apiTotals = null) => {
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Format currency to match screen display exactly
  const formatCurrency = (amount) => {
    const value = amount || 0;
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(value);
    
    // Remove .00 if it's a whole number
    return formatted.replace(/\.00$/, '');
  };

  // Create a multiple reports PDF
  const createMultipleReports = (reports) => {
    console.log('=== PDF TOTALS DEBUG ===');
    
    // Debug: Log PDF totals calculation
    if (apiTotals) {
      console.log('PDF using API Totals:', apiTotals);
      console.log('PDF Display Values:', {
        totalCurrentBills: apiTotals.totalCurrentBillsSum,
        totalBills: apiTotals.totalBillsSum,
        receivedAmount: apiTotals.receivedAmountSum,
        discount: apiTotals.discountSum,
        balance: apiTotals.afterPayBalanceSum
      });
    } else {
      const calculatedTotals = {
        totalCurrentBills: reports.reduce((sum, r) => sum + (parseFloat(r.total_current_bills) || 0), 0),
        totalBills: reports.reduce((sum, r) => sum + (parseFloat(r.total_bills) || 0), 0),
        receivedAmount: reports.reduce((sum, r) => sum + (parseFloat(r.received_amount) || 0), 0),
        discount: reports.reduce((sum, r) => sum + (parseFloat(r.discount) || 0), 0),
        balance: reports.reduce((sum, r) => sum + (parseFloat(r.after_pay_balance) || 0), 0)
      };
      console.log('PDF using Calculated Totals:', calculatedTotals);
    }
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="display:flex; align-items:center; width:100%;">
        <div style="width:7%;">
          <img src="${logo}" alt="Logo" /></div><div style="width:93%;">
          <h1 style="color: black; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;text-align:center;">
            Accounts Group Officers Co-operative Housing Society Limited Lahore
          </h1>
          <p style="font-size: 12px; color: black; margin: 0;text-align:center;">
            Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com
          </p></div>
        </div>
        
        <h2 style="text-align: center; font-size: 16px; color: black; margin: 15px 0 15px 0; border-bottom: 2px solid black; padding-bottom: 10px;">
          Account Status
        </h2>
        ${accountInfo ? `
          <div style="border: 1px solid #ccc; height:auto; margin-bottom: 10px; font-size: 14px;">
            <div style="background-color: #016F28; color: white; padding: 14px;">
              <h4 style="margin-top:-1rem ; font-size: 14px; ">Account Information</h4>
            </div>
            <div style="padding: 8px;">
              <div style="display: flex; margin: 0;">
                <div style="border-right: 1px solid #ccc; width:33.33%;padding-right: 12px;">
                  <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 15px; color: black; border-bottom: 1px solid #E9D5FF; padding-bottom: 15px;">Owner Information</p>
                  <p style="margin-top: -5px ;"><strong>Name:</strong> ${accountInfo.name || '-'}</p>
                  <p style="margin: 2px 0;"><strong>CNIC:</strong> ${accountInfo.cnic || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Contact:</strong> ${accountInfo.contact || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Email:</strong> ${accountInfo.email || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Address:</strong> ${accountInfo.address || '-'}</p>
                </div>
                <div style="border-right: 1px solid #ccc; width:33.33%;padding-left: 12px; padding-right: 12px;">
                  <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 15px; color: black; border-bottom: 1px solid #E9D5FF; padding-bottom: 15px;">Property & Account Details</p>
                  <p style="margin-top: -5px ;"><strong>Party Type:</strong> ${accountInfo.party_type || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Status:</strong> ${accountInfo.status || 'RUNNING'}</p>
                  <p style="margin: 2px 0;"><strong>Membership No:</strong> ${accountInfo.membership_no || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Property/Block:</strong> ${accountInfo.property_no || '-'} - ${accountInfo.block_name || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Relationship:</strong> ${accountInfo.relationship || '-'}</p>
                </div>
                <div style="width:33.33%;padding-left: 12px;">
                  <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 15px; color: black; border-bottom: 1px solid #E9D5FF; padding-bottom: 15px;">Tenant Information</p>
                  ${accountInfo.party_type?.toLowerCase() !== 'owner' && (accountInfo.tenant_guardian_name || accountInfo.tenant_phone_number || accountInfo.tenant_email || accountInfo.tenant_cnic || accountInfo.tenant_address) ? `
                    ${accountInfo.tenant_guardian_name ? `<p style="margin-top: -5px ;"><strong>Name:</strong> ${accountInfo.tenant_guardian_name}</p>` : ''}
                    ${accountInfo.tenant_phone_number ? `<p style="margin: 2px 0;"><strong>Phone:</strong> ${accountInfo.tenant_phone_number}</p>` : ''}
                    ${accountInfo.tenant_email ? `<p style="margin: 2px 0;"><strong>Email:</strong> ${accountInfo.tenant_email}</p>` : ''}
                    ${accountInfo.tenant_cnic ? `<p style="margin: 2px 0;"><strong>CNIC:</strong> ${accountInfo.tenant_cnic}</p>` : ''}
                    ${accountInfo.tenant_address ? `<p style="margin: 2px 0;"><strong>Address:</strong> ${accountInfo.tenant_address}</p>` : ''}
                  ` : `<p style="margin: 2px 0; color: #666;">N/A</p>`}
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <div style="width: 100%; overflow-x: auto; margin: 0px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #016F28; color: white; height: 40px;">
                <th style="border: 1px solid #ddd; padding: 6px;  text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">#</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Receipt No</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Name</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Month/Year</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Property</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Period</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Current</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Total</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Received</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Discount</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Balance</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Status</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Payment</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Reference</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Paid Date</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: bold; white-space: nowrap; vertical-align: middle;">Description</th>
              </tr>
            </thead>
            <tbody>
              ${reports.map((report, index) => `
                <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : 'background-color: white;'} height: 35px;">
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; vertical-align: middle;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${report.recept_no || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.name_id || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.month || '-'}/${report.year || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${(report.block_name || '-')} / ${(report.property_number || '-')}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.issue_date ? formatDate(report.issue_date) : '-'} - ${report.due_date ? formatDate(report.due_date) : '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${formatCurrency(report.total_current_bills || 0)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${formatCurrency(report.total_bills || 0)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${formatCurrency(report.received_amount || 0)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${formatCurrency(report.discount || 0)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; font-weight: 500; vertical-align: middle;">${formatCurrency(report.after_pay_balance || 0)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; text-transform: capitalize; vertical-align: middle;">${report.status || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.payment_by || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.reference_no || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; vertical-align: middle;">${report.paid_date ? formatDate(report.paid_date) : '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; vertical-align: middle; word-wrap: break-word; max-width: 100px;">${report.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f0f0f0; font-weight: bold; height: 35px;">
                <td colspan="6" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 11px; font-weight: bold; vertical-align: middle;">Totals:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; vertical-align: middle;">${formatCurrency(
                  apiTotals?.totalCurrentBillsSum || reports.reduce((sum, r) => sum + (parseFloat(r.total_current_bills) || 0), 0)
                )}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; vertical-align: middle;">${formatCurrency(
                  apiTotals?.totalBillsSum || reports.reduce((sum, r) => sum + (parseFloat(r.total_bills) || 0), 0)
                )}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; vertical-align: middle;">${formatCurrency(
                  apiTotals?.receivedAmountSum || reports.reduce((sum, r) => sum + (parseFloat(r.received_amount) || 0), 0)
                )}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; vertical-align: middle;">${formatCurrency(
                  apiTotals?.discountSum || reports.reduce((sum, r) => sum + (parseFloat(r.discount) || 0), 0)
                )}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; vertical-align: middle;">${formatCurrency(
                  apiTotals?.afterPayBalanceSum || reports.reduce((sum, r) => sum + (parseFloat(r.after_pay_balance) || 0), 0)
                )}</td>
                <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; vertical-align: middle;"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="margin: 15px 0; font-size: 11px; text-align: center; color: #555;">
          <p style="margin: 5px 0;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p style="margin: 5px 0;">Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
        </div>
      </div>
    `;

    return element;
  };

  // Create a single report PDF
  const createSingleReport = (report) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="display:flex; align-items:center; width:100%;">
          <div style="width:7%;">
            <img src="${logo}" alt="Logo" />
          </div>
          <div style="width:93%;">
            <h1 style="color: #351c7d; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;text-align:center;">
              Accounts Group Officers Co-operative Housing Society Limited Lahore
            </h1>
            <p style="font-size: 12px; color: #555; margin: 0;text-align:center;">
              Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com
            </p>
          </div>
        </div>
        
        <h2 style="text-align: center; font-size: 16px; color: #351c7d; margin: 0 0 5px 0; border-bottom: 2px solid #351c7d; padding-bottom: 5px;">
          Payment Receipt - ${report.property_number || '-'}
        </h2>
        
        <!-- Payment Details -->
        <div style="border: 1px solid #ccc; margin-bottom: 10px; font-size: 12px;">
          <div style="background-color: #351c7d; color: white; padding: 6px;">
            <h4 style="margin: 0; font-size: 14px;">Payment Receipt Details</h4>
          </div>
          <div style="padding: 15px;">
            <div style="display: flex; margin-bottom: 15px;">
              <div style="width: 50%; padding-right: 20px;">
                <p style="margin: 5px 0;"><strong>Receipt No:</strong> ${report.recept_no || '-'}</p>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${report.name_id || '-'}</p>
                <p style="margin: 5px 0;"><strong>Property:</strong> ${report.block_name || '-'} / ${report.property_number || '-'}</p>
                <p style="margin: 5px 0;"><strong>Month/Year:</strong> ${report.month || '-'}/${report.year || '-'}</p>
                <p style="margin: 5px 0;"><strong>Party Type:</strong> ${report.party_type || '-'}</p>
              </div>
              <div style="width: 50%;">
                <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${report.issue_date ? formatDate(report.issue_date) : '-'}</p>
                <p style="margin: 5px 0;"><strong>Due Date:</strong> ${report.due_date ? formatDate(report.due_date) : '-'}</p>
                <p style="margin: 5px 0;"><strong>Paid Date:</strong> ${report.paid_date ? formatDate(report.paid_date) : '-'}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${report.payment_by || '-'}</p>
              </div>
            </div>
            
            <!-- Contact Information -->
            <div style="border-top: 1px solid #ddd; padding-top: 6px; margin-bottom: 6px;">
              <h5 style="margin: 0 0 -3px 0; color: #351c7d;">Account Information</h5>
              <div style="display: flex;">
                <div style="border-right: 1px solid #ccc; width:33.33%;padding-right: 12px;">
                  <p style="margin: 2px 0; font-weight: bold; color: #351c7d;">Owner Information:</p>
                  <p style="margin: 0 0 -3px 0;"><strong>Name:</strong> ${report.name_id || '-'}</p>
                  <p style="margin: 2px 0;"><strong>CNIC:</strong> ${report.cnic || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Contact:</strong> ${report.contact || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Email:</strong> ${report.email || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Address:</strong> ${report.address || '-'}</p>
                </div>
                <div style="border-right: 1px solid #ccc; width:33.33%;padding-left: 12px; padding-right: 12px;">
                  <p style="margin: 2px 0; font-weight: bold; color: #351c7d;">Property & Account Details:</p>
                  <p style="margin: 2px 0;"><strong>Party Type:</strong> ${report.party_type || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Status:</strong> ${report.status || 'RUNNING'}</p>
                  <p style="margin: 2px 0;"><strong>Membership No:</strong> ${report.membership_no || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Property/Block:</strong> ${report.property_number || '-'} - ${report.block_name || '-'}</p>
                  <p style="margin: 2px 0;"><strong>Relationship:</strong> ${report.relationship || '-'}</p>
                </div>
                <div style="width:33.33%;padding-left: 12px;">
                  <p style="margin: 2px 0; font-weight: bold; color: #351c7d;">Tenant Information:</p>
                  ${report.party_type?.toLowerCase() !== 'owner' && (report.tenant_guardian_name || report.tenant_phone_number || report.tenant_email || report.tenant_cnic || report.tenant_address) ? `
                    ${report.tenant_guardian_name ? `<p style="margin: 2px 0;"><strong>Name:</strong> ${report.tenant_guardian_name}</p>` : ''}
                    ${report.tenant_phone_number ? `<p style="margin: 2px 0;"><strong>Phone:</strong> ${report.tenant_phone_number}</p>` : ''}
                    ${report.tenant_email ? `<p style="margin: 2px 0;"><strong>Email:</strong> ${report.tenant_email}</p>` : ''}
                    ${report.tenant_cnic ? `<p style="margin: 2px 0;"><strong>CNIC:</strong> ${report.tenant_cnic}</p>` : ''}
                    ${report.tenant_address ? `<p style="margin: 2px 0;"><strong>Address:</strong> ${report.tenant_address}</p>` : ''}
                  ` : `<p style="margin: 2px 0; color: #666;">N/A</p>`}
                </div>
              </div>
            </div>
            
            <!-- Financial Summary -->
            <div style="border-top: 1px solid #ddd; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Current Bills:</strong></span>
                <span style="font-weight: bold;">${formatCurrency(report.total_current_bills || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Total Bills:</strong></span>
                <span style="font-weight: bold;">${formatCurrency(report.total_bills || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Received Amount:</strong></span>
                <span style="font-weight: bold; color: green;">${formatCurrency(report.received_amount || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Discount:</strong></span>
                <span style="font-weight: bold; color: blue;">${formatCurrency(report.discount || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-top: 1px solid #ddd; padding-top: 8px;">
                <span><strong>Balance:</strong></span>
                <span style="font-weight: bold; color: ${(report.after_pay_balance || 0) > 0 ? 'red' : 'green'};">${formatCurrency(report.after_pay_balance || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Status:</strong></span>
                <span style="font-weight: bold; text-transform: capitalize; color: ${getStatusColor(report.status)};">${report.status || 'N/A'}</span>
              </div>
              ${report.reference_no ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Reference No:</strong></span>
                <span style="font-weight: bold;">${report.reference_no}</span>
              </div>
              ` : ''}
              ${report.description ? `
              <div style="margin-top: 10px;">
                <span><strong>Description:</strong></span>
                <p style="margin: 5px 0; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">${report.description}</p>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        
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