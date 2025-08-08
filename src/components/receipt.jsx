import React from 'react';

const Receipt = () => {
  return (
    <div className="max-w-xl mx-auto p-6 border border-gray-300 rounded text-sm">
      <div class="max-w-4xl mx-auto border border-black p-4">
      <div class="flex justify-between items-start">
        <div>
          <img src="https://i.imgur.com/ZDgRm9g.png" alt="Logo" class="w-20 mb-2" />
        </div>
        <div class="text-center flex-1">
          <h2 class="text-xl font-bold text-blue-900">PAYMENT RECEIPT</h2>
          <p class="font-bold text-[13px] leading-tight">
            Accounts Group Officers Co-operative Housing Society Limited Lahore
          </p>
          <p class="text-[12px] leading-tight">
            Regd. No. 1174 (Gul-e-Daman) College Road, Lahore.
          </p>
          <p class="text-[12px] leading-tight">
            042-35140850 E-mail: agcohsl1174@gmail.com
          </p>
        </div>
        <div class="text-right text-blue-900 text-[13px]">
          <p><span class="font-bold">Receipt No:</span> 1495</p>
          <p><span class="font-bold">Paid Date:</span></p>
        </div>
      </div>

      <h3 class="font-bold text-[13px] mt-4 mb-2 text-blue-900">Member Copy</h3>

      <table class="w-full border border-black text-left text-[12px]">
        <tbody>
          <tr>
            <td class="border border-black p-1 font-bold">Billing ID: 2425</td>
            <td class="border border-black p-1 font-bold">
              Plot/House No: 121 shop No 2,3 & 4
            </td>
          </tr>
          <tr>
            <td class="border border-black p-1">
              Received with thanks from: Usman Abdul Majeed
            </td>
            <td class="border border-black p-1">
              Block: A Block Mian College Road
            </td>
          </tr>
          <tr>
            <td class="border border-black p-1">Rupees: 450000</td>
            <td class="border border-black p-1">
              (In Words): Four Hundred And Fifty Thousand Rupees
            </td>
          </tr>
          <tr>
            <td class="border border-black p-1">On Account of: Rented</td>
            <td class="border border-black p-1">Instrument No:</td>
          </tr>
          <tr>
            <td class="border border-black p-1">Payment Mode: Cash</td>
            <td class="border border-black p-1">Remarks: COB, 6172</td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-between mt-6">
        <p class="font-bold">Posted By: Talha Rizwan</p>
        <p class="font-bold">For AGCOHS Ltd Lhr</p>
      </div>

      <p class="text-[11px] mt-4">
        This Receipt if issued against any instrument will be valid upon realization of the
        instrument
      </p>

      <div class="flex justify-end mt-4">
        <p>----------------------------</p>
      </div>
    </div>
    </div>
  );
};

export default Receipt;
