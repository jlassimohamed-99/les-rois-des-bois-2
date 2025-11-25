import { useState } from 'react';
import { ShoppingCart, Package, TrendingUp } from 'lucide-react';

const POSDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">نقاط البيع</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">لوحة تحكم نقاط البيع</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مبيعات اليوم</p>
              <p className="text-2xl font-bold mt-2">25</p>
            </div>
            <ShoppingCart className="text-green-500" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إيرادات اليوم</p>
              <p className="text-2xl font-bold mt-2">5,250 TND</p>
            </div>
            <TrendingUp className="text-gold-500" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الطلبات الجارية</p>
              <p className="text-2xl font-bold mt-2">3</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-center text-gray-500 py-8">
          واجهة نقاط البيع - قريباً
        </p>
      </div>
    </div>
  );
};

export default POSDashboard;

