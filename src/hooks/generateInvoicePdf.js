import html2pdf from 'html2pdf.js';
import logo from '../assets/images/gul-e-daman-logo.png';
import receiptLogo from '../assets/images/reciept-logo.png';
import barcode from '../assets/images/barcode.png';
import bgImage from '../assets/images/bg-shape-invoice.png';
import { FaScissors } from "react-icons/fa6";

export const generateInvoicePdf = (payment) => {
  // Extract data from the payment object
  const {
    block_name,
    property_number,
    name_id,
    month,
    year,
    bills_fields,
    total_current_bills,
    balance,
    currect_balance,
    paid_amount,
    bill_status,
    issue_date,
    due_date
  } = payment;

  // Format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate payable after due date (10% surcharge)
  const payableAfterDueDate = Math.round(parseFloat(total_current_bills) * 1.1);

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

    <div class="relative z-10 p-5 pr-7 pt-7 text-xs leading-6 font-sans" style="background-image: url('${bgImage}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: top right;
    ">
      <div class="flex items-center gap-1 mb-1">
        <div class='w-[10%]'>
          <img src="${logo}" alt="Logo" class="" />
        </div>
       
        <div class="text-center border-2 border-gray-800 p-2 space-y-0 w-[58%]">
          <h1 class="leading-[1.1rem] font-[600] text-[#351c7d] text-[15px] font-['Times_New_Roman'] mt-[-10px]">Accounts Group Officers Co-operative Housing Society Limited Lahore <span class='text-[10px]'>Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com</span></h1>
        </div>
        <div class="text-[12px] leading-[0.8rem] border-2 w-[32%] border-gray-800 p-2">
          <p class='text-[#351c7d] mt-[-10px] '><strong>Society Office:</strong> A Block (Gul e Daman) </br> <strong>For:</strong> Billing Complain & Information </br> <strong>Ph:</strong> 042-35140503, 0307-4229933</p>
        </div>
      </div>

      <div class="flex items-stretch gap-1 mb-3">
        <div class='border-2 border-gray-800 font-bold-gray-600 leading-3 text-[#351c7d] text-[12px] font-bold p-2 w-[30%]'>
          <p>Billing ID #: ${property_number.replace('-', '')}</p>
          <p>${name_id}</p>
          <p>${block_name} ${property_number}</p>
        </div>
        <div class="text-center font-bold text-[#351c7d] text-[12px] border-2 leading-3 w-[30%] border-gray-800 p-2">
          <p>Status: Resident</p>
          <p>Area: 10 Marla</p>
        </div>
        <div class="text-center border-2 w-[10%] border-gray-800 p-1">
          <img src="${barcode}" alt="" class='w-[80px]' />
        </div>
        <div class="font-bold border-2 text-[#351c7d] text-[12px] leading-3 w-[30%] border-gray-800 p-2">
          <p>Bill Month: ${month}, ${year}</p>
          <p>Issue Date: ${formatDate(issue_date)}</p>
          <p>Due Date: ${formatDate(due_date)}</p>
        </div>
      </div>
   
      <div class="grid grid-cols-2 gap-4">
        <div class="mb-3">
          <h2 class="border-2 text-center border-gray-800 text-xs font-bold text-[#351c7d]" style="padding:10px; padding-top:0px;">Billed History</h2>
          <table class="w-full text-[#351c7d] mt-1">
            <thead>
              <tr class='text-left text-[12px] leading-[0.5rem]'>
                <th class="border-2 border-b-0 border-gray-800 h-[25px]" style="padding:10px; padding-bottom:5px; padding-top:0px;">#</th>
                <th class="border-2 border-b-0 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">Month</th>
                <th class="border-2 border-b-0 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">Year</th>
                <th class="border-2 border-b-0 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">Total Bill</th>
                <th class="border-2 border-b-0 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              <tr class='text-[12px] font-bold leading-[0.5rem]'>
                <td class="border-2 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">1</td>
                <td class="border-2 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">${parseInt(month) === 1 ? 'Dec' : String(parseInt(month) - 1).padStart(2, '0')}</td>
                <td class="border-2 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">${parseInt(month) === 1 ? parseInt(year) - 1 : year}</td>
                <td class="border-2 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">Rs ${(parseFloat(total_current_bills) - 100).toFixed(2)}</td>
                <td class="border-2 border-gray-800 h-[25px]" style="padding:10px; padding-top:0px;">${formatDate(new Date(new Date(issue_date).setMonth(new Date(issue_date).getMonth() - 1)))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table class="w-full text-[#351c7d]">
            <thead>
              <tr><th colSpan="2" class="border-2 border-b-0 border-gray-800 text-xs text-center" style="padding:10px; padding-top:0px;">Current Bill Details</th></tr>
            </thead>
            <tbody class='text-[12px] font-bold leading-[0.5rem]'>
              ${Object.entries(bills_fields).map(([key, value]) => `
                <tr>
                  <td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">${key.replace(/_/g, ' ')}</td>
                  <td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Rs ${value}.00</td>
                </tr>
              `).join('')}
              <tr><td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Total Services</td><td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${total_current_bills}.00</td></tr>
              <tr><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Arrears</td><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Rs ${balance}.00</td></tr>
              <tr><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Payable within Due Date</td><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Rs ${(parseFloat(total_current_bills) + parseFloat(balance)).toFixed(2)}</td></tr>
              <tr><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Late Payment Surcharge (10%)</td><td class="border-2 border-b-0 border-gray-800" style="padding:10px; padding-top:0px;">Rs ${(parseFloat(total_current_bills) * 0.1).toFixed(2)}</td></tr>
              <tr><td class="border-2 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Payable After Due Date</td><td class="border-2 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${payableAfterDueDate}.00</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class='flex justify-center gap-3 mt-2'>
        <div class="text-right leading-[0.8rem] w-[50%]">
          <p class="text-xl text-center mb-2 text-[#009d90] font-['Arial']">ضروری ہدایات</p>
          <ul class="font-['Arial'] text-[12px] list-none pr-6 space-y-1" dir="rtl">
            <li>پانی ایک نعمت ہے اس لئے گھروں میں پانی کا استعمال احتیاط سے کریں اور سڑک پر گاڑی دھونے سے اجتناب کریں۔
            گھر میں پانی کھڑا نہ ہونے دیں کیونکہ پانی کھڑا ہونے سے ڈینگی مچھر پیدا ہونے کا خطرہ ہے۔</li>
            <li>معزز رہائشیوں سے گزارش ہے کہ اپنے گھر کا کوڑا کرکٹ باسکٹ میں ڈالیں۔
            سوسائٹی کے روڈ، پارک اور خالی جگہوں پر کچرا نہ پھینکیں۔
            سوسائٹی کی صفائی کا خاص خیال رکھیں کیونکہ صفائی نصف ایمان ہے۔</li>
            <li>گل دامن سوسائٹی نے فیصلہ کیا ہے کہ آئندہ سوسائٹی کے بل کی تاریخ میں توسیع نہیں کی جائے گی۔
            %10 جرمانہ گھروں کو اور %25 جرمانہ کمرشل کو ادا کرنا ہوگا، جس کی معافی نہیں ہوگی۔
            لہٰذا معزز رہائشیوں سے درخواست ہے کہ بل بروقت ادا کریں تاکہ آپ کو کسی قسم کی پریشانی نہ ہو۔</li>
          </ul>
        </div>
        <div class='border-gray-800 border-2 w-[50%] rounded-lg'></div>
      </div>

      <div class='flex justify-between gap-3 mt-5'>
        <p class="text-[12px] leading-3 text-left mt-4 text-[#351c7d]"><strong>Online Payment Bank Al Habib Account<br/>
        Account Title: Accounts Group Officer Cooperative Society Ltd LHR<br/>
        IBAN No: PK73BAHL0423098100103901<br/>
        After Online payment send it to Society WhatsApp 0307-4229933</strong></p>
        <p class="font-bold font-['Arial']">بہتر خدمت کیلئے پانی کا بل بروقت ادا کریں۔</p>
      </div>

      <p class='text-justify flex items-center my-3'><FaScissors />✄----------------------------------------------------------------------------------------------------------------------------------------</p>

      <div class="flex justify-between items-end text-[#351c7d] text-xs pt-2">
        <div class="w-[70%]">
          <h1 class="leading-3 font-[600] text-[#351c7d] text-[13px] text-center mb-3 p-2 px-6 font-['Times_New_Roman']">Accounts Group Officers Co-operative Housing Society Limited Lahore <br/><span class='text-[10px]'>Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com</span></h1>
          
          <table class="w-full border-collapse text-left text-[10px] leading-[0.5rem]">
            <tbody>
              <tr>
                <td class="border-2 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">
                  Billing ID # ${property_number.replace('-', '')}
                </td>
                <td class="border-2 border-gray-800 font-bold border-r-0 text-center" style="padding:10px; padding-top:0px;">
                  Resident 10 Marla
                </td>
              </tr>
              <tr>
                <td class="border-2 border-gray-800 border-t-0 font-bold text-[10px] leading-[0.7rem]" style="padding:10px; padding-top:0px;">
                  ${name_id}<br />
                  ${block_name}<br />
                  ${property_number}
                </td>
                <td class="border-2 border-gray-800 border-t-0 border-r-0 text-right" style="padding:10px; padding-top:0px;">
                  <img src="${barcode}" alt="Logo" class="ml-auto w-[40px]" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="w-[30%]">
          <p class="font-bold text-center mb-3">Office Copy</p>
          <table class="w-full mt-1 border-collapse text-left text-[10px] leading-[0.5rem]">
            <tbody>
              <tr>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Issue Date</td>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">${new Date(issue_date).toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Due Date</td>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">${new Date(due_date).toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Arrears</td>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${balance}.00</td>
              </tr>
              <tr>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Total Services</td>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${total_current_bills}.00</td>
              </tr>
              <tr>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Payable within Due Date</td>
                <td class="border-2 border-b-0 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${(parseFloat(total_current_bills) + parseFloat(balance)).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="border-2 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Payable after Due Date</td>
                <td class="border-2 border-gray-800 font-bold" style="padding:10px; padding-top:0px;">Rs ${payableAfterDueDate}.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="font-bold text-right mt-3 font-['Arial']">بل کے اجرا، تاریخ، ادائیگی، اور دیگر سہولیات بذریعہ وٹس ایپ کے متحصول کیلئے اپنا موبائل نمبر لکھوائیں</p>
    </div>
  `;

  html2pdf().from(element).set({
    margin: 10,
    filename: `invoice-${property_number}-${month}-${year}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4' }
  }).save();
};