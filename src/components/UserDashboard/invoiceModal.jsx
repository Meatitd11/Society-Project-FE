import React, { useEffect, useState, useRef } from 'react';
import receiptLogo from '../../assets/images/reciept-logo.png';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import API_BASE_URL from '../../config';

const InvoiceModal = ({ paymentId, isOpen, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !paymentId) return;

    fetch(`${API_BASE_URL}/payments-collection/${paymentId}/invoice_report/`)
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load invoice:', err);
        setLoading(false);
      });
  }, [paymentId, isOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return '---------';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');

    return num.toString();
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const generatePDF = async () => {
    if (!invoice) return;

    try {
      // Create the PDF content
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          opacity: 0.05;
          font-family: Arial, sans-serif;
          font-weight: bold;
          color: #351c7d;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          grid-auto-rows: 20px;
        ">
          ${Array.from({ length: 900 }).map(() => `
            <div style="
              white-space: nowrap;
              font-size: 12px;
              line-height: 1;
              overflow: hidden;
            ">
              Accounts Group Officers Co-operative Housing Society Limited
            </div>
          `).join('')}
        </div>

        <div style="position: relative; z-index: 10; padding: 20px; font-family: 'Times New Roman', serif; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <img src="${receiptLogo}" alt="Logo" style="width: 80px; margin-bottom: 5px;" />
            </div>
            <div style="text-align: center; flex: 1; color: #351c7d;">
              <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">PAYMENT INVOICE</h2>
              <p style="font-weight: bold; font-size: 14px; margin-bottom: 3px;">
                Accounts Group Officers Co-operative Housing Society Limited Lahore
              </p>
              <p style="font-size: 12px; font-weight: bold; margin-bottom: 3px;">
                Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.
              </p>
              <p style="font-size: 12px; font-weight: bold;">
                042-35140850 E-mail: agcohsl1174@gmail.com
              </p>
            </div>
            <div style="text-align: right; color: #351c7d; font-size: 13px;">
              <p style="font-weight: bold;">Invoice No: ${invoice.invoice_no || 'N/A'}<br/>
              Issue Date: ${formatDate(invoice.issue_date)}<br/>
              Due Date: ${formatDate(invoice.due_date)}</p>
            </div>
          </div>

          <div style="margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tbody>
                <tr>
                  <td style="padding: 4px 8px; font-weight: bold; width: 50%;">
                    <p style="margin-bottom: 5px;">Billing ID: ${invoice.property_number?.replace('-', '') || 'N/A'}</p>
                    <p style="margin-bottom: 5px;">Plot/House No: ${invoice.property_number || 'N/A'}</p>
                    <p style="margin-bottom: 5px;">Block: ${invoice.block_name || 'N/A'}</p>
                  </td>
                  <td style="padding: 4px 8px; font-weight: bold; width: 50%;">
                    <p style="margin-bottom: 5px;">Name: ${invoice.name_id || 'N/A'}</p>
                    <p style="margin-bottom: 5px;">Month: ${getMonthName(invoice.month)} ${invoice.year}</p>
                    <p style="margin-bottom: 5px;">Collection Mode: ${invoice.payments_collection_mode || 'N/A'}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <table style="width: 100%; border: 1px solid black; border-collapse: collapse; font-size: 12px; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid black; padding: 6px 8px; text-align: left;">Description</th>
                <th style="border: 1px solid black; padding: 6px 8px; text-align: right;">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(invoice.bills_fields || {}).map(([key, value]) => `
                <tr>
                  <td style="border: 1px solid black; padding: 4px 8px;">${key.replace(/_/g, ' ').toUpperCase()}</td>
                  <td style="border: 1px solid black; padding: 4px 8px; text-align: right;">${value}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">TOTAL AMOUNT</td>
                <td style="border: 1px solid black; padding: 4px 8px; text-align: right; font-weight: bold;">${invoice.total_current_bills || '0'}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 10px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Amount in Words: ${numberToWords(invoice.total_current_bills || 0)} Rupees Only</p>
            <p style="font-weight: bold; margin-bottom: 5px;">Status: ${invoice.bill_status === 'paid' ? 'PAID' : invoice.bill_status === 'partially' ? 'PARTIALLY PAID' : 'PENDING'}</p>
            ${invoice.bill_status === 'partially' ? `<p style="font-weight: bold; margin-bottom: 5px;">Balance Due: Rs ${invoice.balance || '0'}</p>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="text-align: center;">
              <p>----------------------------</p>
              <p style="font-weight: bold;">Prepared By</p>
            </div>
            <div style="text-align: center;">
              <p>----------------------------</p>
              <p style="font-weight: bold;">For AGCOHS Ltd Lhr</p>
            </div>
          </div>

          <div style="margin-top: 10px; font-size: 11px; font-weight: bold;">
            <p>Note: Please pay before due date to avoid late payment charges.</p>
          </div>
        </div>
      `;

      // Generate and download PDF
      html2pdf().from(element).set({
        margin: 10,
        filename: `invoice-${invoice.property_number}-${invoice.invoice_no || 'temp'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4' }
      }).save();

    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      alert("Failed to generate invoice PDF. Please try again.");
    }
  };

  const printInvoice = async () => {
    if (!invoice) return;

    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_no}</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12px;
                padding: 20px;
              }
              .watermark {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
                opacity: 0.05;
                font-family: Arial, sans-serif;
                font-weight: bold;
                color: #351c7d;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                grid-auto-rows: 20px;
              }
              .watermark div {
                white-space: nowrap;
                font-size: 12px;
                line-height: 1;
                overflow: hidden;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 4px 8px;
              }
              th {
                background-color: #f0f0f0;
                text-align: left;
              }
              .amount-cell {
                text-align: right;
              }
              p {
                margin: 0 0 5px 0;
                line-height: 1.2;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
              }
              .title-container {
                text-align: center;
                flex: 1;
                color: #351c7d;
              }
              .invoice-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .subtitle {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 3px;
              }
              .address {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 3px;
              }
              .contact {
                font-size: 12px;
                font-weight: bold;
              }
              .info-table {
                width: 100%;
                margin: 15px 0;
              }
              .footer {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
              }
              .signature {
                text-align: center;
              }
              .note {
                font-size: 11px;
                font-weight: bold;
                margin-top: 10px;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="watermark">
              ${Array.from({ length: 100 }).map(() => `
                <div>Accounts Group Officers Co-operative Housing Society Limited</div>
              `).join('')}
            </div>

            <div class="header">
              <div>
                <img src="${receiptLogo}" alt="Logo" style="width: 80px; margin-bottom: 5px;" />
              </div>
              <div class="title-container">
                <h2 class="invoice-title">PAYMENT INVOICE</h2>
                <p class="subtitle">Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
                <p class="address">Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.</p>
                <p class="contact">042-35140850 E-mail: agcohsl1174@gmail.com</p>
              </div>
              <div style="text-align: right; color: #351c7d; font-size: 13px;">
                <p style="font-weight: bold;">
                  Invoice No: ${invoice.invoice_no || 'N/A'}<br/>
                  Issue Date: ${formatDate(invoice.issue_date)}<br/>
                  Due Date: ${formatDate(invoice.due_date)}
                </p>
              </div>
            </div>

            <table class="info-table">
              <tbody>
                <tr>
                  <td style="width: 50%;">
                    <p>Billing ID: ${invoice.property_number?.replace('-', '') || 'N/A'}</p>
                    <p>Plot/House No: ${invoice.property_number || 'N/A'}</p>
                    <p>Block: ${invoice.block_name || 'N/A'}</p>
                  </td>
                  <td style="width: 50%;">
                    <p>Name: ${invoice.name_id || 'N/A'}</p>
                    <p>Month: ${getMonthName(invoice.month)} ${invoice.year}</p>
                    <p>Collection Mode: ${invoice.payments_collection_mode || 'N/A'}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="amount-cell">Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(invoice.bills_fields || {}).map(([key, value]) => `
                  <tr>
                    <td>${key.replace(/_/g, ' ').toUpperCase()}</td>
                    <td class="amount-cell">${value}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td style="font-weight: bold;">TOTAL AMOUNT</td>
                  <td class="amount-cell" style="font-weight: bold;">${invoice.total_current_bills || '0'}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 10px;">
              <p style="font-weight: bold;">Amount in Words: ${numberToWords(invoice.total_current_bills || 0)} Rupees Only</p>
              <p style="font-weight: bold;">Status: ${invoice.bill_status === 'paid' ? 'PAID' : invoice.bill_status === 'partially' ? 'PARTIALLY PAID' : 'PENDING'}</p>
              ${invoice.bill_status === 'partially' ? `<p style="font-weight: bold;">Balance Due: Rs ${invoice.balance || '0'}</p>` : ''}
            </div>

            <div class="footer">
              <div class="signature">
                <p>----------------------------</p>
                <p style="font-weight: bold;">Prepared By</p>
              </div>
              <div class="signature">
                <p>----------------------------</p>
                <p style="font-weight: bold;">For AGCOHS Ltd Lhr</p>
              </div>
            </div>

            <p class="note">Note: Please pay before due date to avoid late payment charges.</p>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("Failed to print invoice. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.watermark}>
          {Array.from({ length: 900 }).map((_, i) => (
            <div key={i} style={styles.watermarkText}>
              Accounts Group Officers Co-operative Housing Society Limited
            </div>
          ))}
        </div>

        <div style={styles.content}>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
          
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <img src={receiptLogo} alt="Logo" style={styles.logo} />
            </div>
            <div style={styles.titleContainer}>
              <h2 style={styles.title}>PAYMENT INVOICE</h2>
              <p style={styles.subtitle}>Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
              <p style={styles.address}>Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.</p>
              <p style={styles.contact}>042-35140850 E-mail: agcohsl1174@gmail.com</p>
            </div>
            <div style={styles.invoiceInfo}>
              <p style={styles.invoiceNo}>Invoice No: {invoice?.invoice_no || 'N/A'}</p>
              <p style={styles.issueDate}>Issue Date: {formatDate(invoice?.issue_date)}</p>
              <p style={styles.dueDate}>Due Date: {formatDate(invoice?.due_date)}</p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Loading invoice...</p>
            </div>
          ) : !invoice ? (
            <div style={styles.noInvoiceContainer}>
              <p style={styles.noInvoiceText}>No invoice found for this payment.</p>
            </div>
          ) : (
            <div style={styles.invoiceContainer} ref={invoiceRef}>
              <div style={styles.infoSection}>
                <div style={styles.infoColumn}>
                  <p style={styles.infoText}>Billing ID: {invoice.property_number?.replace('-', '') || 'N/A'}</p>
                  <p style={styles.infoText}>Plot/House No: {invoice.property_number || 'N/A'}</p>
                  <p style={styles.infoText}>Block: {invoice.block_name || 'N/A'}</p>
                </div>
                <div style={styles.infoColumn}>
                  <p style={styles.infoText}>Name: {invoice.name_id || 'N/A'}</p>
                  <p style={styles.infoText}>Month: {getMonthName(invoice.month)} {invoice.year}</p>
                  <p style={styles.infoText}>Collection Mode: {invoice.payments_collection_mode || 'N/A'}</p>
                </div>
              </div>

              <table style={styles.invoiceTable}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeaderCell}>Description</th>
                    <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(invoice.bills_fields || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td style={styles.tableCell}>{key.replace(/_/g, ' ').toUpperCase()}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>TOTAL AMOUNT</td>
                    <td style={{ ...styles.tableCell, textAlign: 'right', fontWeight: 'bold' }}>
                      {invoice.total_current_bills || '0'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={styles.amountInWords}>
                <p style={styles.amountText}>
                  Amount in Words: {numberToWords(invoice.total_current_bills || 0)} Rupees Only
                </p>
                <p style={styles.statusText}>
                  Status: {invoice.bill_status === 'paid' ? 'PAID' : invoice.bill_status === 'partially' ? 'PARTIALLY PAID' : 'PENDING'}
                </p>
                {invoice.bill_status === 'partially' && (
                  <p style={styles.balanceText}>Balance Due: Rs {invoice.balance || '0'}</p>
                )}
              </div>

              <div style={styles.footer}>
                <div style={styles.signature}>
                  <p>----------------------------</p>
                  <p style={styles.signatureText}>Prepared By</p>
                </div>
                <div style={styles.signature}>
                  <p>----------------------------</p>
                  <p style={styles.signatureText}>For AGCOHS Ltd Lhr</p>
                </div>
              </div>

              <p style={styles.note}>
                Note: Please pay before due date to avoid late payment charges.
              </p>

              <div style={styles.actions}>
                <button 
                  style={styles.viewButton}
                  onClick={printInvoice}
                >
                  View / Print
                </button>
                <button 
                  style={styles.downloadButton}
                  onClick={generatePDF}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles (similar to ReceiptModal but adjusted for invoice)
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: "'Times New Roman', Times, serif",
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    width: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 0.05,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gridAutoRows: '20px',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    color: '#351c7d',
  },
  watermarkText: {
    whiteSpace: 'nowrap',
    fontSize: '12px',
    lineHeight: '1',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '20px',
  },
  closeBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#351c7d',
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    borderBottom: '1px solid #351c7d',
    paddingBottom: '15px',
    position: 'relative',
  },
  logoContainer: {
    flex: '0 0 auto',
  },
  logo: {
    width: '80px',
    marginBottom: '5px',
  },
  titleContainer: {
    flex: 1,
    textAlign: 'center',
    color: '#351c7d',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#351c7d',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '3px',
  },
  address: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '3px',
  },
  contact: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  invoiceInfo: {
    position: 'absolute',
    right: 0,
    top: 0,
    textAlign: 'right',
    color: '#351c7d',
    fontSize: '13px',
  },
  invoiceNo: {
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  issueDate: {
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  dueDate: {
    fontWeight: 'bold',
    margin: 0,
  },
  invoiceContainer: {
    marginBottom: '20px',
    border: '1px solid #ddd',
    padding: '15px',
    position: 'relative',
    backgroundColor: '#fff',
  },
  infoSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  infoColumn: {
    width: '48%',
  },
  infoText: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  invoiceTable: {
    width: '100%',
    border: '1px solid black',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginBottom: '10px',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableHeaderCell: {
    border: '1px solid black',
    padding: '6px 8px',
    fontWeight: 'bold',
  },
  tableCell: {
    border: '1px solid black',
    padding: '4px 8px',
    fontSize: '12px',
  },
  amountInWords: {
    margin: '10px 0',
  },
  amountText: {
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    fontSize: '12px',
  },
  statusText: {
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    fontSize: '12px',
  },
  balanceText: {
    fontWeight: 'bold',
    margin: 0,
    fontSize: '12px',
    color: '#d9534f',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  signature: {
    textAlign: 'center',
    width: '48%',
  },
  signatureText: {
    fontWeight: 'bold',
    margin: '5px 0 0 0',
    fontSize: '12px',
  },
  note: {
    fontSize: '11px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px',
  },
  viewButton: {
    backgroundColor: '#351c7d',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  loadingText: {
    color: '#351c7d',
    fontWeight: 'bold',
  },
  noInvoiceContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  noInvoiceText: {
    color: '#351c7d',
    fontWeight: 'bold',
  },
};

export default InvoiceModal;
