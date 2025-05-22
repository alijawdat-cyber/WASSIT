import React, { useState } from 'react';
import { CreateWithdrawalFormData } from '@/types';

interface WithdrawalFormProps {
  onSubmit: (data: CreateWithdrawalFormData) => void;
  maximumAmount: number;
  isLoading?: boolean;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ 
  onSubmit, 
  maximumAmount,
  isLoading 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [notes, setNotes] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // التحقق من الصحة
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // التحقق من المبلغ
    if (!amount) {
      newErrors.amount = 'المبلغ مطلوب';
    } else {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        newErrors.amount = 'يرجى إدخال رقم صحيح';
      } else if (amountValue <= 0) {
        newErrors.amount = 'يجب أن يكون المبلغ أكبر من صفر';
      } else if (amountValue > maximumAmount) {
        newErrors.amount = `المبلغ يتجاوز الرصيد المتاح (${maximumAmount.toLocaleString('ar-IQ')} د.ع)`;
      }
    }
    
    // التحقق من طريقة الدفع
    if (!paymentMethod) {
      newErrors.paymentMethod = 'يرجى اختيار طريقة الدفع';
    }
    
    // التحقق من بيانات الحساب البنكي إذا كانت طريقة الدفع هي التحويل البنكي
    if (paymentMethod === 'bank_transfer') {
      if (!bankName) {
        newErrors.bankName = 'اسم البنك مطلوب';
      }
      
      if (!accountName) {
        newErrors.accountName = 'اسم صاحب الحساب مطلوب';
      }
      
      if (!accountNumber) {
        newErrors.accountNumber = 'رقم الحساب مطلوب';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تقديم النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // تحضير بيانات الدفع
    let paymentDetails: Record<string, any> = {};
    
    if (paymentMethod === 'bank_transfer') {
      paymentDetails = {
        bankName,
        accountName,
        accountNumber,
      };
    } else if (paymentMethod === 'mobile_wallet') {
      // بيانات المحفظة الإلكترونية
      paymentDetails = {
        phoneNumber: accountNumber,
      };
    }
    
    const data: CreateWithdrawalFormData = {
      amount: parseFloat(amount),
      paymentMethod,
      paymentDetails,
      notes: notes || undefined,
    };
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* المبلغ */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          المبلغ (د.ع) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="أدخل المبلغ المراد سحبه"
          min="1"
          max={maximumAmount}
          disabled={isLoading}
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        <p className="mt-1 text-xs text-gray-500">الحد الأقصى: {maximumAmount.toLocaleString('ar-IQ')} د.ع</p>
      </div>
      
      {/* طريقة الدفع */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          طريقة الدفع <span className="text-red-500">*</span>
        </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={`w-full px-3 py-2 border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isLoading}
        >
          <option value="bank_transfer">تحويل بنكي</option>
          <option value="mobile_wallet">محفظة إلكترونية</option>
          <option value="cash_pickup">استلام نقدي</option>
        </select>
        {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
      </div>
      
      {/* حقول خاصة بالتحويل البنكي */}
      {paymentMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              اسم البنك <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.bankName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="أدخل اسم البنك"
              disabled={isLoading}
            />
            {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
          </div>
          
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
              اسم صاحب الحساب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.accountName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="أدخل اسم صاحب الحساب"
              disabled={isLoading}
            />
            {errors.accountName && <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>}
          </div>
          
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              رقم الحساب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="أدخل رقم الحساب البنكي"
              disabled={isLoading}
            />
            {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
          </div>
        </div>
      )}
      
      {/* حقول خاصة بالمحفظة الإلكترونية */}
      {paymentMethod === 'mobile_wallet' && (
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="أدخل رقم الهاتف المسجل للمحفظة الإلكترونية"
            disabled={isLoading}
          />
          {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
        </div>
      )}
      
      {/* ملاحظات */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          ملاحظات (اختياري)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أي معلومات إضافية ترغب بإضافتها..."
          rows={3}
          disabled={isLoading}
        />
      </div>
      
      {/* زر التقديم */}
      <div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'جارٍ التقديم...' : 'تقديم طلب السحب'}
        </button>
      </div>
    </form>
  );
};

export default WithdrawalForm; 