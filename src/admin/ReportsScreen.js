import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign, 
  FaShoppingBag, 
  FaUsers, 
  FaShoppingCart,
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaBox,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaCreditCard,
  FaMobileAlt,
  FaStore,
  FaPhone,
  FaEnvelope,
  FaMoneyBill
} from 'react-icons/fa';
import { supabase } from '../supabase';

// Simple Stat Card
const StatCard = ({ icon: Icon, title, value, change, color, bgColor }) => {
  const isPositive = change > 0;
  
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ 
          backgroundColor: bgColor, 
          padding: '10px', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
          {title}
        </div>
      </div>
      
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
        {value}
      </div>
      
      {change !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPositive ? <FaArrowUp size={12} color="#10b981" /> : <FaArrowDown size={12} color="#ef4444" />}
          <span style={{ 
            fontSize: '14px', 
            color: isPositive ? '#10b981' : '#ef4444', 
            fontWeight: '500' 
          }}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            vs last period
          </span>
        </div>
      )}
    </div>
  );
};

// Payment Method Icons
const PaymentMethodIcon = ({ method }) => {
  const methodLower = method.toLowerCase();
  
  if (methodLower.includes('cash')) return <FaMoneyBill size={16} color="#10b981" />;
  if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('debit')) 
    return <FaCreditCard size={16} color="#3b82f6" />;
  if (methodLower.includes('online') || methodLower.includes('digital')) 
    return <FaMobileAlt size={16} color="#8b5cf6" />;
  
  return <FaDollarSign size={16} color="#6b7280" />;
};

// Channel Icons
const ChannelIcon = ({ channel }) => {
  const channelLower = channel.toLowerCase();
  
  if (channelLower.includes('walk') || channelLower.includes('store') || channelLower.includes('in-person')) 
    return <FaStore size={16} color="#f59e0b" />;
  if (channelLower.includes('online') || channelLower.includes('web') || channelLower.includes('app')) 
    return <FaMobileAlt size={16} color="#ec4899" />;
  if (channelLower.includes('phone') || channelLower.includes('call')) 
    return <FaPhone size={16} color="#06b6d4" />;
  
  return <FaStore size={16} color="#6b7280" />;
};

// Simple Bar Chart
const SimpleBarChart = ({ data, title, color = '#3b82f6' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
        No data available
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(item => item.value));
  const maxBarHeight = 120;
  
  return (
    <div>
      <h4 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
        {title}
      </h4>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: `${maxBarHeight + 40}px` }}>
        {data.map((item, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              height: maxValue > 0 ? `${(item.value / maxValue) * maxBarHeight}px` : '5px',
              width: '30px',
              background: color,
              borderRadius: '6px 6px 0 0',
              position: 'relative',
              minHeight: '5px'
            }}>
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                whiteSpace: 'nowrap'
              }}>
                ₱{item.value.toLocaleString()}
              </div>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '8px', 
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Reports Component
const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    dailyRevenue: [],
    topProducts: [],
    paymentMethods: [],
    salesChannels: []
  });

  const dateRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges based on selected period
      const endDate = new Date();
      const startDate = new Date();
      const previousStartDate = new Date();
      const previousEndDate = new Date();
      
      switch(dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          previousStartDate.setDate(endDate.getDate() - 14);
          previousEndDate.setDate(endDate.getDate() - 8);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          previousStartDate.setMonth(endDate.getMonth() - 2);
          previousEndDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          previousStartDate.setMonth(endDate.getMonth() - 6);
          previousEndDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          previousStartDate.setFullYear(endDate.getFullYear() - 2);
          previousEndDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // 1. Fetch current period data
      const { data: currentOrdersData, error: currentError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          payment_method,
          payment_status,
          customer_name,
          customer_phone,
          customer_email,
          channel,
          subtotal,
          tax,
          discount,
          total,
          user_id,
          created_at,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              id,
              name,
              category,
              price
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (currentError) throw currentError;

      // 2. Fetch previous period data for comparison
      const { data: previousOrdersData, error: previousError } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString())
        .neq('status', 'cancelled');

      if (previousError) throw previousError;

      // Process current period data
      const currentOrders = currentOrdersData || [];
      
      // Calculate basic metrics
      const revenue = currentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const orders = currentOrders.length;
      
      // Get unique customers (by phone or email if user_id is null)
      const customerIdentifiers = currentOrders.map(order => 
        order.user_id || order.customer_phone || order.customer_email
      ).filter(Boolean);
      const uniqueCustomers = new Set(customerIdentifiers).size;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;

      // Calculate previous period metrics
      const previousRevenue = previousOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const previousOrdersCount = previousOrdersData?.length || 0;

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // Generate daily revenue data (last 7 days)
      const dailyRevenue = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayRevenue = currentOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate <= dayEnd;
        }).reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        dailyRevenue.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayRevenue
        });
      }

      // Analyze products from order items
      const productAnalysis = {};
      currentOrders.forEach(order => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach(item => {
            if (item.products) {
              const productName = item.products.name || `Product #${item.product_id}`;
              if (!productAnalysis[productName]) {
                productAnalysis[productName] = {
                  revenue: 0,
                  quantity: 0
                };
              }
              const itemTotal = (item.quantity || 1) * (item.price || 0);
              productAnalysis[productName].revenue += itemTotal;
              productAnalysis[productName].quantity += item.quantity || 1;
            }
          });
        }
      });

      // Get top 5 products
      const topProducts = Object.entries(productAnalysis)
        .map(([name, data]) => ({
          name,
          revenue: data.revenue,
          quantity: data.quantity
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Analyze payment methods - ONLY REAL DATA FROM DATABASE
      const paymentAnalysis = {};
      currentOrders.forEach(order => {
        const method = order.payment_method || 'Unknown';
        if (!paymentAnalysis[method]) {
          paymentAnalysis[method] = {
            count: 0,
            revenue: 0
          };
        }
        paymentAnalysis[method].count += 1;
        paymentAnalysis[method].revenue += order.total_amount || 0;
      });

      // Format payment methods for display
      const paymentMethods = Object.entries(paymentAnalysis)
        .filter(([method]) => method.toLowerCase() !== 'gcash') // Remove GCash if not used
        .map(([method, data]) => {
          const percentage = revenue > 0 ? (data.revenue / revenue) * 100 : 0;
          return {
            method: method.toUpperCase(),
            percentage: percentage.toFixed(1),
            count: data.count,
            revenue: data.revenue
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      // Analyze sales channels
      const channelAnalysis = {};
      currentOrders.forEach(order => {
        const channel = order.channel || 'walk-in';
        if (!channelAnalysis[channel]) {
          channelAnalysis[channel] = {
            count: 0,
            revenue: 0
          };
        }
        channelAnalysis[channel].count += 1;
        channelAnalysis[channel].revenue += order.total_amount || 0;
      });

      const salesChannels = Object.entries(channelAnalysis).map(([channel, data]) => ({
        channel: channel.charAt(0).toUpperCase() + channel.slice(1).replace('-', ' '),
        percentage: revenue > 0 ? (data.revenue / revenue) * 100 : 0,
        count: data.count,
        revenue: data.revenue
      }));

      setReportData({
        revenue,
        orders,
        customers: uniqueCustomers,
        avgOrderValue,
        revenueChange: calculateChange(revenue, previousRevenue),
        ordersChange: calculateChange(orders, previousOrdersCount),
        dailyRevenue,
        topProducts: topProducts.length > 0 ? topProducts : [
          { name: 'No product data', revenue: 0, quantity: 0 }
        ],
        paymentMethods: paymentMethods.length > 0 ? paymentMethods : [
          { method: 'NO DATA', percentage: 100, count: 0, revenue: 0 }
        ],
        salesChannels: salesChannels.length > 0 ? salesChannels : [
          { channel: 'No channel data', percentage: 100, count: 0, revenue: 0 }
        ]
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      // Set empty state on error
      setReportData({
        revenue: 0,
        orders: 0,
        customers: 0,
        avgOrderValue: 0,
        revenueChange: 0,
        ordersChange: 0,
        dailyRevenue: [],
        topProducts: [],
        paymentMethods: [],
        salesChannels: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleExport = () => {
    const csvContent = [
      'Sales Report',
      `Date Range: ${dateRanges.find(r => r.value === dateRange)?.label}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'SUMMARY',
      'Metric,Value',
      `Total Revenue,₱${reportData.revenue.toLocaleString()}`,
      `Total Orders,${reportData.orders}`,
      `Total Customers,${reportData.customers}`,
      `Average Order Value,₱${reportData.avgOrderValue.toFixed(2)}`,
      `Revenue Growth,${reportData.revenueChange.toFixed(1)}%`,
      `Order Growth,${reportData.ordersChange.toFixed(1)}%`,
      '',
      'TOP PRODUCTS',
      'Product,Revenue,Quantity',
      ...reportData.topProducts.map(p => `${p.name},₱${p.revenue.toLocaleString()},${p.quantity}`),
      '',
      'PAYMENT METHODS',
      'Method,Percentage,Orders,Revenue',
      ...reportData.paymentMethods.map(p => `${p.method},${p.percentage}%,${p.count},₱${p.revenue.toLocaleString()}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
          Loading sales data...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 4px 0'
          }}>
            Sales Dashboard
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Real-time sales data from your database
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease'
            }}
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter color="#6b7280" />
            <span style={{ fontWeight: '600', color: '#111827' }}>Report Period</span>
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCalendarAlt />
            {dateRanges.find(r => r.value === dateRange)?.label}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {dateRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: dateRange === range.value ? '#3b82f6' : '#f3f4f6',
                color: dateRange === range.value ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '120px'
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '24px'
      }}>
        <StatCard
          icon={FaDollarSign}
          title="Total Revenue"
          value={`₱${reportData.revenue.toLocaleString()}`}
          change={reportData.revenueChange}
          color="#065f46"
          bgColor="#d1fae5"
        />
        
        <StatCard
          icon={FaShoppingBag}
          title="Total Orders"
          value={reportData.orders}
          change={reportData.ordersChange}
          color="#1e40af"
          bgColor="#dbeafe"
        />
        
        <StatCard
          icon={FaUsers}
          title="Customers"
          value={reportData.customers}
          change={null}
          color="#92400e"
          bgColor="#fef3c7"
        />
        
        <StatCard
          icon={FaShoppingCart}
          title="Avg Order Value"
          value={`₱${reportData.avgOrderValue.toFixed(2)}`}
          change={null}
          color="#7c3aed"
          bgColor="#ede9fe"
        />
      </div>

      {/* Charts and Tables Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px', 
        marginBottom: '24px'
      }}>
        {/* Daily Revenue Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <SimpleBarChart 
            data={reportData.dailyRevenue}
            title="Daily Revenue (Last 7 Days)"
            color="#10b981"
          />
        </div>

        {/* Top Products */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <h4 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            <FaBox style={{ marginRight: '8px' }} />
            Top Selling Products
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Product
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Revenue
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                      {product.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                      ₱{product.revenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                      {product.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Methods & Sales Channels */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '24px'
      }}>
        {/* Payment Methods */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCreditCard />
            Payment Methods
          </h4>
          
          {reportData.paymentMethods.length === 0 || reportData.paymentMethods[0].method === 'NO DATA' ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              No payment method data available
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportData.paymentMethods.map((method, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PaymentMethodIcon method={method.method} />
                    <span style={{ fontWeight: '500', color: '#374151' }}>{method.method}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{method.percentage}%</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{method.count} orders</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Channels */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaStore />
            Sales Channels
          </h4>
          
          {reportData.salesChannels.length === 0 || reportData.salesChannels[0].channel === 'No channel data' ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              No channel data available
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportData.salesChannels.map((channel, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ChannelIcon channel={channel.channel} />
                    <span style={{ fontWeight: '500', color: '#374151' }}>{channel.channel}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{channel.percentage.toFixed(1)}%</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{channel.count} orders</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f3f4f6'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
          <FaCheckCircle style={{ marginRight: '8px' }} />
          Performance Summary
        </h4>
        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          {reportData.revenue === 0 ? (
            <span>No sales data found for the selected period. Start making sales to see analytics!</span>
          ) : reportData.revenueChange >= 0 ? (
            <span>
              Sales are trending <strong style={{ color: '#10b981' }}>positively</strong> with 
              <strong> {reportData.revenueChange.toFixed(1)}% revenue growth</strong> compared to the previous period. 
              {reportData.topProducts[0]?.name !== 'No product data' && ` Your top product "${reportData.topProducts[0]?.name}" is performing well.`}
            </span>
          ) : (
            <span>
              Sales are trending <strong style={{ color: '#ef4444' }}>downward</strong> with 
              <strong> {Math.abs(reportData.revenueChange).toFixed(1)}% decrease</strong> in revenue. 
              Consider reviewing your marketing strategy.
            </span>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            opacity: 0.9;
          }
          
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsScreen;