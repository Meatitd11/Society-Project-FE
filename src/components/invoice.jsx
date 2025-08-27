import React from 'react';
import logo from '../assets/images/gul-e-daman-logo.png';
import barcode from '../assets/images/barcode.png';
import { FaScissors } from "react-icons/fa6";

const Invoice = () => {
  return (
    <div className="max-w-4xl mx-auto border border-gray-800
 p-4 text-xs leading-6 font-sans">
 
    <div className="flex  items-center gap-1 mb-1">
      <div className='w-[10%]'>
      <img src={logo} alt="Logo" className="" />
      </div>
     
      <div className="text-center border-2 border-gray-800 p-2 space-y-0  text-[10px] w-[60%]">
        <h1 className="leading-4 font-[600]  text-[#351c7d] text-sm">Accounts Group Officers Co-operative Housing Society Limited Lahore <span className='text-[10px]'>Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com</span></h1>
      
      </div>
      <div className="text-[10px] leading-3  border-2 w-[30%] border-gray-800 p-2">
        <p className='text-[#351c7d]'><strong>Society Office:</strong> A Block (Gul e Daman)</p>
        <p className='text-[#351c7d]'><strong>For:</strong>  Billing Complain & Information</p>
        <p className='text-[#351c7d]'><strong>Ph:</strong>  042-35140503, 0307-4229933</p>
      </div>
    </div>
   
    <div className="flex  items-stretch gap-1 mb-3">
      <div className='border-2 border-gray-800 font-bold-gray-600 leading-4 text-[#351c7d] font-bold p-2 w-[30%]'>
        <p>Billing ID #: 2668</p>
        <p>Javed Akhtar</p>
        <p>B Block Khaki Shah Road 28-2</p>
       
      </div>
      <div className="text-center font-bold text-[#351c7d] border-2 leading-4 w-[30%] border-gray-800 p-2 ">
        <p>Status: Resident</p>
        <p>Area: 10 Marla</p>
       
      </div>
      <div className="text-center border-2  w-[10%] border-gray-800 p-1 ">
        <img src={barcode} alt="" className='w-full' />
       
      </div>
      <div className="font-bold border-2 text-[#351c7d] leading-4 w-[30%] border-gray-800 p-2 ">
        <p>Bill Month: June, 2025</p>
        <p>Issue Date: Jun 30, 2025</p>
        <p>Due Date: Jul 15, 2025</p>
      </div>
    </div>
   
    <div className="grid grid-cols-2 gap-4">
    <div className="mb-3">
    <h2 colSpan="2" className="border-2 text-center border-gray-800
 py-[0.05rem] px-2 text-xs font-bold text-[#351c7d] ">Billed History</h2>
      <table className="w-full text-[#351c7d]  mt-1">
        <thead className="">
       
          
          
          <tr className='text-left text-xs'>
            <th className="border-2 border-gray-800
 py-[0.05rem] px-2">#</th>
            <th className="border-2 border-gray-800
 py-[0.05rem] px-2">Month</th>
            <th className="border-2 border-gray-800
 py-[0.05rem] px-2">Year</th>
            <th className="border-2 border-gray-800
 py-[0.05rem] px-2">Total Bill</th>
            <th className="border-2 border-gray-800
 py-[0.05rem] px-2">Paid Date</th>
          </tr>
        </thead>
        <tbody >
          <tr className='text-xs'>
            <td className="border-2 border-gray-800
 py-[0.05rem] px-2">1</td>
            <td className="border-2 border-gray-800
 py-[0.05rem] px-2">May</td>
            <td className="border-2 border-gray-800
 py-[0.05rem] px-2">2025</td>
            <td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 10000.00</td>
            <td className="border-2 border-gray-800
 py-[0.05rem] px-2">Jun 10, 2025</td>
          </tr>
        </tbody>
      </table>
    </div>
      <div>
        <table className="w-full text-[#351c7d]">
          <thead className="">
            <tr ><th colSpan="2" className="border-2 border-gray-800
 py-[0.05rem] px-2 text-xs text-center">Current Bill Details</th></tr>
          </thead>
          <tbody className='text-xs'>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Water Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 1000.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Sewerage Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 1000.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Maintenance Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 0.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Security Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 300.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Street Light Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 200.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Transformer Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 0.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Service Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 0.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Wasa Aqua Charges</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 0.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2 font-bold">Total Services</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2 font-bold">Rs 2500.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Arrears</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 1500.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Payable within Due Date</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 4000.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Late Payment Surcharge (10%)</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2">Rs 250.00</td></tr>
            <tr><td className="border-2 border-gray-800
 py-[0.05rem] px-2 font-bold">Payable After Due Date</td><td className="border-2 border-gray-800
 py-[0.05rem] px-2 font-bold">Rs 4250.00</td></tr>
          </tbody>
        </table>
      </div>
    </div>
<div className='flex justify-center gap-3 mt-5'>
<div className=" p-3 mt-4 text-right leading-4 text-xs w-[50%]" >
      <p className='text-xl text-center'>ضروری ہدایات</p>
     <p>پانی ایک نعمت ہے اس لئے گھروں میں پانی کا استعمال احتیاط سے کریں اورسڑک پر گاڑی دھونے
سے اجتناب کریں۔
اور گھر میں پانی کھڑا نہ ہوئے دیں کیونکہ پانی کھڑا ہونے سے ڈینگی مچھر پیدا ہونے کا خطرہ ہے۔
معزز رہائشیوں سے گزارش ہے کہ اپنے گھر کا کوڑا کرکٹ باسکٹ میں ڈالیں اور سوسائٹی کے
روڈ۔پارک اور خالی جگہوں پر کچرانہ پھینکیں اورسوسائٹی کی صفائی کا خاص خیال رکھیں کیونکہ
صفائی نصف ایمان ہے۔
گل دامن سوسائٹی نے فیصلہ کیا ہے کہ آئندہ سوسائٹی کے بل کی تاریخ میں توسیع نہیں کی جائے گی۔
اور%10 جرمانه گھروں کو اور %25 جرمانہ کمرشل کو ادا کرنا ہوگا ۔ جس کی معافی نە ھوگی
لہز١معزز ربائشیوں سے درخواست ہے کہ بل بروقت ادا کریں تا کہ آب کو کسی قسم کی پریشانی نہ
ہو۔</p>

    
    </div>
   
    <div className='border-gray-800
 border-2 w-[50%] rounded-lg'></div>
   
   
  
</div>

<div className='flex justify-between gap-3 mt-5'>
<p className="text-[12px] leading-3 text-left mt-4 text-[#351c7d]"><strong>Online Payment Bank Al Habib Account<br/>
Account Title: Accounts Group Officer Cooperative Society Ltd LHR<br/>
IBAN No: PK73BAHL0423098100103901<br/>
After Online payment send it to Society WhatsApp 0307-4229933</strong></p>

<p className='font-bold'>بہتر خدمت کیلئے پانی کا بل بروقت ادا کریں۔
</p>

</div>
   

    
    

    <p className='text-justify flex items-center my-3'><FaScissors />---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
  {/* Office Copy Section */}
<div className="flex justify-between items-end text-[#351c7d] text-xs pt-2">
  {/* Left Section */}
  <div className="w-[70%]">
  <h1 className="leading-4 font-[600]  text-[#351c7d] text-sm text-center mb-3">Accounts Group Officers Co-operative Housing Society Limited Lahore <span className='text-[10px]'>Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com</span></h1>
      
  <table className="w-full border-collapse text-left text-xs">
  <tbody>
    {/* Row 1 */}
    <tr>
      <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold " >
        Billing ID # 2668
      </td>
      <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold border-r-0 text-center" colSpan="2">
        Resident 10 Marla
      </td>
    </tr>

    {/* Row 2 — MUST have 3 columns to match above */}
    <tr>
      <td className="border-2 border-gray-800 border-t-0 py-[0.05rem] px-2 font-bold">
        Javed Akhtar<br />
        B Block Khaki Shah<br />
        Road 28-2
      </td>
    
      <td className="border-2 border-gray-800 border-t-0 py-[0.05rem] px-2"></td>
      <td className="border-2 border-gray-800 border-t-0 py-[0.05rem] px-2 border-r-0 text-right">   <img src={barcode} alt="Logo" className="ml-auto" /></td>
    </tr>
  </tbody>
</table>

   
  </div>

  {/* Right Section */}
  <div className="w-[30%]">
    <p className="font-bold text-center">Office Copy</p>
    <table className="w-full mt-1 border-collapse text-left text-xs">
      <tbody>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Issue Date</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2">30/06/2025</td>
        </tr>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Due Date</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2">15/07/2025</td>
        </tr>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Arrears</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2">Rs 1500.00</td>
        </tr>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Total Services</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2">Rs 2500.00</td>
        </tr>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Payable within Due Date</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2">Rs 4000.00</td>
        </tr>
        <tr>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Payable after Due Date</td>
          <td className="border-2 border-gray-800 py-[0.05rem] px-2 font-bold">Rs 4,250.00</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<p className="font-bold text-right mt-3 font-['Times_New_Roman']">بل کے اجرا، تاریخ، ادائیگی، اور دیگر سہولیات بذریعہ وٹس ایپ کے متحصول کیلئے اپنا موبائل نمبر لکھوائیں</p>







   
  </div>
  
  );
};

export default Invoice;
