import html2pdf from 'html2pdf.js';
import receiptLogo from '../assets/images/reciept-logo.png';
import barcode from '../assets/images/barcode.png';
import axios from 'axios';

export const generateReceiptPdf = async (payment) => {
  try {
    // Step 1: Fetch dynamic data from backend
    const response = await axios.get(`http://127.0.0.1:8000/payments-collection/${payment.id}/receipt_report`);
    const data = response.data;

    // Step 2: Destructure values from fetched data
    const {
      name_id,
      block_name,
      property_number,
      bills_fields,
      issue_date,
      due_date,
      recept_no,
      total_current_bills,
      total_bills,
      received_amount,
      discount,
      payment_by,
      reference_no,
      after_pay_balance,
      description,
      status,
      paid_date
    } = data;

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '---------';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Convert number to words (simple version)
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

    // Step 3: Create PDF content
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

      <div class="relative z-10 p-5 text-xs leading-6 font-['Times_New_Roman']">
        <div class="flex justify-between items-start">
          <div>
            <img src="${receiptLogo}" alt="Logo" class="w-20 mb-2" />
          </div>
          <div class="text-center flex-1 text-[#351c7d]">
            <h2 class="text-xl font-bold mb-2">PAYMENT RECEIPT</h2>
            <p class="font-bold text-[14px] leading-tight">
              Accounts Group Officers Co-operative Housing Society Limited Lahore
            </p>
            <p class="text-[12px] font-bold leading-tight">
              Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.
            </p>
            <p class="text-[12px] font-bold leading-tight">
              042-35140850 E-mail: agcohsl1174@gmail.com
            </p>
          </div>
          <div class="text-right text-[#351c7d] text-[13px]">
            <p class="font-bold">Receipt No: ${recept_no || 'N/A'}<br/>
            Paid Date: ${formatDate(paid_date)}</p>
          </div>
        </div>

        <h3 class="font-bold text-[14px] mt-4 mb-2 text-[#351c7d]">Member Copy</h3>

        <table class="w-full border border-black text-left text-[12px] leading-[0.5rem]">
          <tbody>
            <tr>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Billing ID: ${property_number.replace('-', '')}</p></td>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Plot/House No: ${property_number}</p></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Received with thanks from: ${name_id}</p></td>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Block: ${block_name}</p></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Rupees: ${received_amount}</p></td>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">(In Words): ${numberToWords(received_amount)} Rupees</p></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">On Account of: ${status}</p></td>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Instrument No: ${reference_no || 'N/A'}</p></td>
            </tr>
            <tr>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Payment Mode: ${payment_by || 'Cash'}</p></td>
              <td class="border border-black p-1 font-bold"><p style="margin-bottom:10px;">Remarks: ${description || 'N/A'}</p></td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between mt-2">
          <p class="font-bold">Posted By: Society Office</p>
          <p class="font-bold">For AGCOHS Ltd Lhr</p>
        </div>

        <div class="flex justify-between mt-1">
          <p class="text-[11px] font-bold">
            This Receipt if issued against any instrument will be valid upon realization of the
            instrument
          </p>
          <p>----------------------------</p>
        </div>
      </div>
    `;

    // Step 4: Generate and download PDF
    html2pdf().from(element).set({
      margin: 10,
      filename: `receipt-${property_number}-${recept_no || 'temp'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    }).save();

  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    alert("Failed to fetch receipt data. Please try again.");
  }
};