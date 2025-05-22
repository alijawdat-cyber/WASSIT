'use client';

import React, { useState } from 'react';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

interface MarginPolicy {
  id?: number;
  serviceId: number;
  serviceName?: string;
  minAmount: number;
  maxAmount: number | null;
  marginType: 'percentage' | 'fixed';
  marginValue: number;
  active: boolean;
}

interface MarginManagerProps {
  initialPolicies?: MarginPolicy[];
  services?: { id: number; name: string }[];
  isLoading?: boolean;
  error?: string | null;
}

const MarginManager: React.FC<MarginManagerProps> = ({
  initialPolicies = [],
  services = [],
  isLoading = false,
  error = null,
}) => {
  const [policies, setPolicies] = useState<MarginPolicy[]>(initialPolicies);
  const [editingPolicy, setEditingPolicy] = useState<MarginPolicy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // فتح نموذج إضافة سياسة جديدة
  const handleAddPolicy = () => {
    setEditingPolicy({
      serviceId: services.length > 0 ? services[0].id : 0,
      minAmount: 0,
      maxAmount: null,
      marginType: 'percentage',
      marginValue: 10,
      active: true,
    });
    setIsFormOpen(true);
    setFormError(null);
  };

  // فتح نموذج تعديل سياسة موجودة
  const handleEditPolicy = (policy: MarginPolicy) => {
    setEditingPolicy({ ...policy });
    setIsFormOpen(true);
    setFormError(null);
  };

  // تغيير حالة سياسة (تفعيل/تعطيل)
  const togglePolicyStatus = async (policyId: number | undefined, currentStatus: boolean) => {
    if (!policyId) return;
    
    try {
      const response = await adminAPI.updateMarginPolicy(policyId, { active: !currentStatus });
      
      if (response.success && response.data) {
        setPolicies(prevPolicies => 
          prevPolicies.map(policy => 
            policy.id === policyId ? { ...policy, active: !currentStatus } : policy
          )
        );
      } else {
        setFormError(response.message || 'حدث خطأ أثناء تحديث حالة السياسة');
      }
    } catch (err) {
      console.error('خطأ في تحديث حالة السياسة:', err);
      setFormError('حدث خطأ أثناء تحديث حالة السياسة');
    }
  };

  // حفظ السياسة (إضافة أو تعديل)
  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    
    // التحقق من صحة المدخلات
    if (editingPolicy.marginValue <= 0) {
      setFormError('يجب أن تكون قيمة الهامش أكبر من صفر');
      return;
    }

    if (editingPolicy.minAmount < 0) {
      setFormError('يجب أن تكون القيمة الدنيا صفر أو أكبر');
      return;
    }

    if (editingPolicy.maxAmount !== null && editingPolicy.maxAmount <= editingPolicy.minAmount) {
      setFormError('يجب أن تكون القيمة القصوى أكبر من القيمة الدنيا');
      return;
    }

    try {
      setIsSaving(true);
      let response;
      
      if (editingPolicy.id) {
        // تحديث سياسة موجودة
        response = await adminAPI.updateMarginPolicy(editingPolicy.id, editingPolicy);
      } else {
        // إضافة سياسة جديدة
        response = await adminAPI.createMarginPolicy(editingPolicy);
      }
      
      if (response.success && response.data) {
        // تحديث القائمة
        if (editingPolicy.id) {
          setPolicies(prevPolicies => 
            prevPolicies.map(policy => 
              policy.id === editingPolicy.id ? { ...response.data } : policy
            )
          );
        } else {
          setPolicies(prevPolicies => [...prevPolicies, response.data]);
        }
        
        // إغلاق النموذج
        setIsFormOpen(false);
        setEditingPolicy(null);
      } else {
        setFormError(response.message || 'حدث خطأ أثناء حفظ السياسة');
      }
    } catch (err) {
      console.error('خطأ في حفظ السياسة:', err);
      setFormError('حدث خطأ أثناء حفظ السياسة');
    } finally {
      setIsSaving(false);
    }
  };

  // حذف سياسة
  const handleDeletePolicy = async (policyId: number | undefined) => {
    if (!policyId || !window.confirm('هل أنت متأكد من حذف هذه السياسة؟')) return;
    
    try {
      const response = await adminAPI.deleteMarginPolicy(policyId);
      
      if (response.success) {
        setPolicies(prevPolicies => prevPolicies.filter(policy => policy.id !== policyId));
      } else {
        setFormError(response.message || 'حدث خطأ أثناء حذف السياسة');
      }
    } catch (err) {
      console.error('خطأ في حذف السياسة:', err);
      setFormError('حدث خطأ أثناء حذف السياسة');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">إدارة هوامش الربح</h2>
        <button
          onClick={handleAddPolicy}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          إضافة سياسة جديدة
        </button>
      </div>

      {policies.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-gray-500">
            لا توجد سياسات هوامش ربح محددة. قم بإضافة سياسة جديدة لتحديد طريقة احتساب هوامش الربح.
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الخدمة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نطاق المبلغ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع الهامش
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قيمة الهامش
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy, index) => {
                  const serviceName = services.find(s => s.id === policy.serviceId)?.name || `خدمة #${policy.serviceId}`;
                  
                  return (
                    <tr key={policy.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {policy.serviceName || serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {policy.minAmount.toLocaleString('ar-IQ')} د.ع
                        {policy.maxAmount !== null 
                          ? ` - ${policy.maxAmount.toLocaleString('ar-IQ')} د.ع` 
                          : ' وما فوق'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {policy.marginType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {policy.marginValue}
                        {policy.marginType === 'percentage' ? '%' : ' د.ع'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${policy.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {policy.active ? 'مفعّلة' : 'معطلة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="mr-2 py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => togglePolicyStatus(policy.id, policy.active)}
                          className={`mr-2 py-1 px-3 rounded ${policy.active 
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {policy.active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="py-1 px-3 rounded bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نموذج إضافة/تعديل سياسة */}
      {isFormOpen && editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingPolicy.id ? 'تعديل سياسة الهامش' : 'إضافة سياسة هامش جديدة'}
            </h2>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                {formError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">الخدمة</label>
                <select
                  id="service"
                  value={editingPolicy.serviceId}
                  onChange={(e) => setEditingPolicy({...editingPolicy, serviceId: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                  {services.length === 0 && (
                    <option value={0}>كل الخدمات</option>
                  )}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للمبلغ</label>
                  <input
                    type="number"
                    id="minAmount"
                    min="0"
                    value={editingPolicy.minAmount}
                    onChange={(e) => setEditingPolicy({...editingPolicy, minAmount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للمبلغ</label>
                  <input
                    type="number"
                    id="maxAmount"
                    min="0"
                    value={editingPolicy.maxAmount === null ? '' : editingPolicy.maxAmount}
                    onChange={(e) => setEditingPolicy({
                      ...editingPolicy, 
                      maxAmount: e.target.value === '' ? null : Number(e.target.value)
                    })}
                    placeholder="غير محدود"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="marginType" className="block text-sm font-medium text-gray-700 mb-1">نوع الهامش</label>
                <select
                  id="marginType"
                  value={editingPolicy.marginType}
                  onChange={(e) => setEditingPolicy({
                    ...editingPolicy, 
                    marginType: e.target.value as 'percentage' | 'fixed'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (د.ع)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="marginValue" className="block text-sm font-medium text-gray-700 mb-1">
                  قيمة الهامش {editingPolicy.marginType === 'percentage' ? '(%)' : '(د.ع)'}
                </label>
                <input
                  type="number"
                  id="marginValue"
                  min="0"
                  value={editingPolicy.marginValue}
                  onChange={(e) => setEditingPolicy({...editingPolicy, marginValue: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingPolicy.active}
                  onChange={(e) => setEditingPolicy({...editingPolicy, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="mr-2 block text-sm text-gray-900">
                  تفعيل السياسة
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingPolicy(null);
                }}
                disabled={isSaving}
                className="ml-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                إلغاء
              </button>
              <button
                onClick={handleSavePolicy}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block ml-2"></span>
                    جارٍ الحفظ...
                  </>
                ) : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarginManager; 