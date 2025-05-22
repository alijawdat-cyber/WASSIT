import React, { useState, useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PaymentFormProps {
  onSubmit: (data: any) => Promise<void>;
  amount: number;
  isLoading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, amount, isLoading = false }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);

  // جلب طرق الدفع المتاحة
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await walletAPI.getPaymentMethods();
        if (response.success && response.data) {
          setPaymentMethods(response.data);
        } else {
          // إذا فشل جلب طرق الدفع، استخدم طرق افتراضية
          setPaymentMethods([
            { id: 'credit_card', name: 'بطاقة ائتمانية' },
            { id: 'debit_card', name: 'بطاقة سحب' },
            { id: 'wallet', name: 'محفظة إلكترونية' },
            { id: 'bank_transfer', name: 'تحويل بنكي' }
          ]);
        }
      } catch (error) {
        console.error('خطأ في جلب طرق الدفع:', error);
        // استخدم طرق دفع افتراضية في حالة الخطأ
        setPaymentMethods([
          { id: 'credit_card', name: 'بطاقة ائتمانية' },
          { id: 'debit_card', name: 'بطاقة سحب' },
          { id: 'wallet', name: 'محفظة إلكترونية' },
          { id: 'bank_transfer', name: 'تحويل بنكي' }
        ]);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardNumber) {
        newErrors.cardNumber = 'رقم البطاقة مطلوب';
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'رقم البطاقة غير صالح';
      }

      if (!cardHolder) {
        newErrors.cardHolder = 'اسم حامل البطاقة مطلوب';
      }

      if (!expiryDate) {
        newErrors.expiryDate = 'تاريخ الانتهاء مطلوب';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        newErrors.expiryDate = 'تنسيق تاريخ الانتهاء غير صحيح (MM/YY)';
      }

      if (!cvv) {
        newErrors.cvv = 'رمز التحقق مطلوب';
      } else if (!/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = 'رمز التحقق غير صالح';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة تنسيق رقم البطاقة
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // معالجة تقديم النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData: any = {
      method: paymentMethod,
      amount,
    };

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      paymentData.details = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiryDate,
        cvv,
      };
    }

    onSubmit(paymentData);
  };

  if (loadingMethods) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* طريقة الدفع */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          اختر طريقة الدفع <span className="text-red-500">*</span>
        </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* حقول بطاقة الائتمان */}
      {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
        <div className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              رقم البطاقة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className={`w-full px-3 py-2 border ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isLoading}
              maxLength={19}
            />
            {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
          </div>

          <div>
            <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
              اسم حامل البطاقة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="الاسم كما هو مكتوب على البطاقة"
              className={`w-full px-3 py-2 border ${
                errors.cardHolder ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isLoading}
            />
            {errors.cardHolder && <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الانتهاء <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className={`w-full px-3 py-2 border ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isLoading}
                maxLength={5}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                رمز الأمان (CVV) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className={`w-full px-3 py-2 border ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isLoading}
                maxLength={4}
              />
              {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
            </div>
          </div>
        </div>
      )}

      {/* معلومات الدفع */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">المبلغ الكلي:</span>
          <span className="font-bold">{amount.toLocaleString('ar-IQ')} د.ع</span>
        </div>
        <div className="text-xs text-gray-500">
          ملاحظة: سيتم حجز المبلغ في حساب ضمان المنصة حتى يتم تسليم الخدمة واستلامها بشكل صحيح.
        </div>
      </div>

      {/* زر الدفع */}
      <div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'جارٍ معالجة الدفع...' : 'إتمام عملية الدفع'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm; 