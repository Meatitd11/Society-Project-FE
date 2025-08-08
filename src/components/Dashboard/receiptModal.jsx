import React, { useEffect, useState, useRef } from 'react';
import receiptLogo from '../../assets/images/reciept-logo.png';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const ReceiptModal = ({ paymentId, isOpen, onClose }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const receiptRefs = useRef({});

  useEffect(() => {
    if (!isOpen || !paymentId) return;

    fetch(`http://127.0.0.1:8000/payments-collection/${paymentId}/receipt_report/`)
      .then((res) => res.json())
      .then((data) => {
        setReceipts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load receipts:', err);
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

  const generatePDF = async (receipt) => {
    try {
      // Fetch the receipt data again to ensure we have the latest version
      const response = await axios.get(`http://127.0.0.1:8000/payments-collection/${paymentId}/receipt_report/`);
      const receiptData = response.data.find(r => r.recept_no === receipt.recept_no) || receipt;

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
              <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">PAYMENT RECEIPT</h2>
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
              <p style="font-weight: bold;">Receipt No: ${receiptData.recept_no || 'N/A'}<br/>
              Paid Date: ${formatDate(receiptData.paid_date)}</p>
            </div>
          </div>

          <h3 style="font-weight: bold; font-size: 14px; margin: 15px 0 10px 0; color: #351c7d;">Member Copy</h3>

          <table style="width: 100%; border: 1px solid black; border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Billing ID: ${receiptData.property_number?.replace('-', '') || 'N/A'}</p>
                </td>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Plot/House No: ${receiptData.property_number || 'N/A'}</p>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Received with thanks from: ${receiptData.name_id || 'N/A'}</p>
                </td>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Block: ${receiptData.block_name || 'N/A'}</p>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Rupees: ${receiptData.received_amount || '0'}</p>
                </td>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">(In Words): ${numberToWords(receiptData.received_amount || 0)} Rupees</p>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">On Account of: ${receiptData.status || 'N/A'}</p>
                </td>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Instrument No: ${receiptData.reference_no || 'N/A'}</p>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Payment Mode: ${receiptData.payment_by || 'Cash'}</p>
                </td>
                <td style="border: 1px solid black; padding: 4px 8px; font-weight: bold;">
                  <p style="margin-bottom: 10px;">Remarks: ${receiptData.description || 'N/A'}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <p style="font-weight: bold;">Posted By: Society Office</p>
            <p style="font-weight: bold;">For AGCOHS Ltd Lhr</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <p style="font-size: 11px; font-weight: bold; max-width: 70%;">
              This Receipt if issued against any instrument will be valid upon realization of the instrument
            </p>
            <p>----------------------------</p>
          </div>
        </div>
      `;

      // Generate and download PDF
      html2pdf().from(element).set({
        margin: 10,
        filename: `receipt-${receiptData.property_number}-${receiptData.recept_no || 'temp'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4' }
      }).save();

    } catch (error) {
      console.error("Error generating receipt PDF:", error);
      alert("Failed to generate receipt PDF. Please try again.");
    }
  };

  const printReceipt = async (receipt) => {
    try {
      // Fetch the receipt data again to ensure we have the latest version
      const response = await axios.get(`http://127.0.0.1:8000/payments-collection/${paymentId}/receipt_report/`);
      const receiptData = response.data.find(r => r.recept_no === receipt.recept_no) || receipt;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${receiptData.recept_no}</title>
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
                border: 1px solid black;
                border-collapse: collapse;
              }
              td {
                border: 1px solid black;
                padding: 4px 8px;
                font-weight: bold;
              }
              p {
                margin: 0 0 10px 0;
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
              .receipt-title {
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
              .copy-title {
                font-weight: bold;
                font-size: 14px;
                margin: 15px 0 10px 0;
                color: #351c7d;
              }
              .footer-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .footer-text {
                font-weight: bold;
                font-size: 12px;
              }
              .disclaimer {
                font-size: 11px;
                font-weight: bold;
                max-width: 70%;
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
                <h2 class="receipt-title">PAYMENT RECEIPT</h2>
                <p class="subtitle">Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
                <p class="address">Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.</p>
                <p class="contact">042-35140850 E-mail: agcohsl1174@gmail.com</p>
              </div>
              <div style="text-align: right; color: #351c7d; font-size: 13px;">
                <p style="font-weight: bold;">Receipt No: ${receiptData.recept_no || 'N/A'}<br/>
                Paid Date: ${formatDate(receiptData.paid_date)}</p>
              </div>
            </div>

            <h3 class="copy-title">Member Copy</h3>

            <table>
              <tbody>
                <tr>
                  <td><p>Billing ID: ${receiptData.property_number?.replace('-', '') || 'N/A'}</p></td>
                  <td><p>Plot/House No: ${receiptData.property_number || 'N/A'}</p></td>
                </tr>
                <tr>
                  <td><p>Received with thanks from: ${receiptData.name_id || 'N/A'}</p></td>
                  <td><p>Block: ${receiptData.block_name || 'N/A'}</p></td>
                </tr>
                <tr>
                  <td><p>Rupees: ${receiptData.received_amount || '0'}</p></td>
                  <td><p>(In Words): ${numberToWords(receiptData.received_amount || 0)} Rupees</p></td>
                </tr>
                <tr>
                  <td><p>On Account of: ${receiptData.status || 'N/A'}</p></td>
                  <td><p>Instrument No: ${receiptData.reference_no || 'N/A'}</p></td>
                </tr>
                <tr>
                  <td><p>Payment Mode: ${receiptData.payment_by || 'Cash'}</p></td>
                  <td><p>Remarks: ${receiptData.description || 'N/A'}</p></td>
                </tr>
              </tbody>
            </table>

            <div class="footer-row" style="margin-top: 10px;">
              <p class="footer-text">Posted By: Society Office</p>
              <p class="footer-text">For AGCOHS Ltd Lhr</p>
            </div>

            <div class="footer-row" style="margin-top: 5px;">
              <p class="disclaimer">
                This Receipt if issued against any instrument will be valid upon realization of the instrument
              </p>
              <p>----------------------------</p>
            </div>

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
      console.error("Error printing receipt:", error);
      alert("Failed to print receipt. Please try again.");
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
              <h2 style={styles.title}>PAYMENT RECEIPTS</h2>
              <p style={styles.subtitle}>Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
              <p style={styles.address}>Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.</p>
              <p style={styles.contact}>042-35140850 E-mail: agcohsl1174@gmail.com</p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Loading receipts...</p>
            </div>
          ) : receipts.length === 0 ? (
            <div style={styles.noReceiptsContainer}>
              <p style={styles.noReceiptsText}>No receipts found for this payment.</p>
            </div>
          ) : (
            receipts.map((receipt) => (
              <div key={receipt.recept_no} style={styles.receiptContainer}>
                <div style={styles.receiptHeader}>
                  <h3 style={styles.copyTitle}>Member Copy</h3>
                  <div style={styles.receiptInfo}>
                    <p style={styles.receiptNo}>Receipt No: {receipt.recept_no || 'N/A'}</p>
                    <p style={styles.paidDate}>Paid Date: {formatDate(receipt.paid_date)}</p>
                  </div>
                </div>

                <table style={styles.receiptTable}>
                  <tbody>
                    <tr>
                      <td style={styles.tableCell}><p style={styles.tableText}>Billing ID: {receipt.property_number?.replace('-', '') || 'N/A'}</p></td>
                      <td style={styles.tableCell}><p style={styles.tableText}>Plot/House No: {receipt.property_number || 'N/A'}</p></td>
                    </tr>
                    <tr>
                      <td style={styles.tableCell}><p style={styles.tableText}>Received with thanks from: {receipt.name_id || 'N/A'}</p></td>
                      <td style={styles.tableCell}><p style={styles.tableText}>Block: {receipt.block_name || 'N/A'}</p></td>
                    </tr>
                    <tr>
                      <td style={styles.tableCell}><p style={styles.tableText}>Rupees: {receipt.received_amount || '0'}</p></td>
                      <td style={styles.tableCell}><p style={styles.tableText}>(In Words): {numberToWords(receipt.received_amount || 0)} Rupees</p></td>
                    </tr>
                    <tr>
                      <td style={styles.tableCell}><p style={styles.tableText}>On Account of: {receipt.status || 'N/A'}</p></td>
                      <td style={styles.tableCell}><p style={styles.tableText}>Instrument No: {receipt.reference_no || 'N/A'}</p></td>
                    </tr>
                    <tr>
                      <td style={styles.tableCell}><p style={styles.tableText}>Payment Mode: {receipt.payment_by || 'Cash'}</p></td>
                      <td style={styles.tableCell}><p style={styles.tableText}>Remarks: {receipt.description || 'N/A'}</p></td>
                    </tr>
                  </tbody>
                </table>

                <div style={styles.footer}>
                  <div style={styles.footerRow}>
                    <p style={styles.footerText}>Posted By: Society Office</p>
                    <p style={styles.footerText}>For AGCOHS Ltd Lhr</p>
                  </div>
                  <div style={styles.footerRow}>
                    <p style={styles.disclaimer}>
                      This Receipt if issued against any instrument will be valid upon realization of the instrument
                    </p>
                    <p style={styles.signature}>----------------------------</p>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button 
                    style={styles.viewButton}
                    onClick={() => printReceipt(receipt)}
                  >
                    View / Print
                  </button>
                  <button 
                    style={styles.downloadButton}
                    onClick={() => generatePDF(receipt)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

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
  receiptContainer: {
    marginBottom: '30px',
    border: '1px solid #ddd',
    padding: '15px',
    position: 'relative',
    backgroundColor: '#fff',
  },
  receiptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  copyTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#351c7d',
    margin: 0,
  },
  receiptInfo: {
    textAlign: 'right',
    color: '#351c7d',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  receiptNo: {
    margin: 0,
  },
  paidDate: {
    margin: 0,
  },
  receiptTable: {
    width: '100%',
    border: '1px solid black',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginBottom: '10px',
  },
  tableCell: {
    border: '1px solid black',
    padding: '4px 8px',
    fontWeight: 'bold',
  },
  tableText: {
    margin: '0 0 10px 0',
    lineHeight: '1.2',
  },
  footer: {
    marginTop: '10px',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  footerText: {
    fontWeight: 'bold',
    fontSize: '12px',
    margin: 0,
  },
  disclaimer: {
    fontSize: '11px',
    fontWeight: 'bold',
    margin: 0,
    maxWidth: '70%',
  },
  signature: {
    margin: 0,
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
  noReceiptsContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  noReceiptsText: {
    color: '#351c7d',
    fontWeight: 'bold',
  },
};

export default ReceiptModal;