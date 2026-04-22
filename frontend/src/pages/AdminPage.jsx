import { useState } from 'react';
// import DashboardPage from './DashboardPage';
// import MenuPage from './MenuPage';
// import StaffPage from './StaffPage';
// import CustomersPage from './CustomersPage';
// import TablesPage from './TablesPage';

const tabs = [
  { key: 'dashboard', label: 'Tổng quan' },
  { key: 'menu', label: 'Menu' },
  { key: 'staff', label: 'Nhân viên' },
  { key: 'customers', label: 'Khách hàng' },
  { key: 'tables', label: 'Bàn' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {/* {ActiveComponent && <ActiveComponent />} */}
        <p>Chọn tab để xem nội dung. (Giao diện sẽ được viết lại)</p>
      </div>
    </div>
  );
}