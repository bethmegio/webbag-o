import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  Link,
  Navigate
} from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { supabase } from '../supabase';
import Sidebar from './Sidebar';
import UserSystemManagement from './UserSystemManagement';
import ProductManagement from './ProductManagement';
import ServiceManagement from './ServiceManagement';
import SalesManagement from './SalesManagement';
import ReportsScreen from './ReportsScreen';
import InventoryManagement from './InventoryManagement';
import ServiceScheduling from './ServiceScheduling';
import ActivityLog from './ActivityLog';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Colors - Stick to 3 colors
const COLORS = {
  primary: '#2e4dc8',     // Blue
  secondary: '#4ab8eb',   // Light Blue
  accent: '#10B981',      // Green
  lightBlue: '#4ab8eb20', // Light Blue with transparency
  lightGreen: '#10B98120' // Light Green with transparency
};

// CSS Styles as JavaScript object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif"
  },
  header: {
    background: 'linear-gradient(135deg, #2e4dc8 0%, #4ab8eb 100%)',
    padding: '2rem 2rem 1.5rem',
    color: 'white'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0'
  },
  headerSubtitle: {
    fontSize: '0.875rem',
    opacity: '0.9',
    margin: '0'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  },
  lastUpdated: {
    fontSize: '0.75rem',
    opacity: '0.8'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid transparent'
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statTitle: {
    fontSize: '0.875rem',
    color: '#64748B',
    margin: '0 0 0.5rem 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0',
    color: '#1E293B'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  chartTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1E293B',
    margin: '0 0 1rem 0'
  },
  chartContainer: {
    height: '300px',
    position: 'relative'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  dataCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
  },
  dataCardHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dataCardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1E293B',
    margin: '0'
  },
  viewAllLink: {
    color: '#2e4dc8',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'color 0.2s ease'
  },
  dataList: {
    padding: '0.5rem 0'
  },
  dataItem: {
    padding: '1rem 1.5rem',
    transition: 'background 0.2s ease'
  },
  dataItemContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dataItemTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1E293B',
    margin: '0 0 0.25rem 0'
  },
  dataItemSubtitle: {
    fontSize: '0.75rem',
    color: '#64748B',
    margin: '0'
  },
  dataItemRight: {
    textAlign: 'right'
  },
  dataItemAmount: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0'
  },
  primaryText: {
    color: '#2e4dc8'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  stockIndicator: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginLeft: 'auto',
    marginBottom: '0.5rem'
  },
  stockText: {
    fontSize: '0.75rem',
    color: '#64748B',
    textAlign: 'center',
    margin: '0'
  },
  fullWidthCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    marginBottom: '2rem'
  },
  bookingsList: {
    padding: '0.5rem 0'
  },
  bookingItem: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #F1F5F9',
    transition: 'background 0.2s ease'
  },
  bookingContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bookingTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1E293B',
    margin: '0 0 0.25rem 0'
  },
  bookingSubtitle: {
    fontSize: '0.75rem',
    color: '#64748B',
    margin: '0 0 0.25rem 0'
  },
  bookingTime: {
    fontSize: '0.75rem',
    color: '#94A3B8'
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '0.875rem'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #E2E8F0',
    borderTopColor: '#2e4dc8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748B',
    fontWeight: '500'
  }
};

// Add CSS animations via style tag
const GlobalStyles = () => (
  <style>
    {`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      @media (max-width: 768px) {
        .dashboard-header-content {
          flex-direction: column;
          text-align: center;
        }
        
        .dashboard-header-actions {
          flex-direction: column;
          gap: 1rem;
        }
        
        .dashboard-charts-grid {
          grid-template-columns: 1fr !important;
        }
        
        .dashboard-data-grid {
          grid-template-columns: 1fr !important;
        }
        
        .dashboard-stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
        }
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      
      .data-item:hover {
        background: #F8FAFC;
      }
      
      .booking-item:hover {
        background: #F8FAFC;
      }
      
      .refresh-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .view-all-link:hover {
        color: #1e40af;
      }
    `}
  </style>
);

// Helper function to format time from timestamp
const formatBookingTime = (timestamp) => {
  if (!timestamp) return 'Anytime';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return 'Anytime';
  }
};

// Dashboard Screen Component
const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalServices: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      activeBookings: 0,
    },
    recentOrders: [],
    lowStockItems: [],
    recentBookings: [],
    salesData: [],
    customerSegments: [],
    productCategories: []
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscription
    const ordersSubscription = supabase
      .channel('orders-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        productsRes,
        servicesRes,
        ordersRes,
        usersRes,
        bookingsRes,
        categoriesRes
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('services').select('*', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);

      // Calculate stats
      const totalProducts = productsRes.count || 0;
      const totalServices = servicesRes.count || 0;
      const totalOrders = ordersRes.data?.length || 0;
      const totalUsers = usersRes.count || 0;
      
      // Calculate total revenue
      const totalRevenue = ordersRes.data?.reduce((sum, order) => {
        return sum + (order.total_amount || order.total || 0);
      }, 0) || 0;

      // Pending orders
      const pendingOrders = ordersRes.data?.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length || 0;

      // Low stock products
      const lowStockProducts = productsRes.data?.filter(product => 
        (product.stock || 0) <= 10
      ).length || 0;

      // Active bookings
      const today = new Date().toISOString().split('T')[0];
      const activeBookings = bookingsRes.data?.filter(booking => {
        const bookingDate = booking.date || booking.booking_date;
        return bookingDate >= today && 
          (booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'scheduled');
      }).length || 0;

      // Recent orders (last 5)
      const recentOrders = ordersRes.data?.slice(0, 5).map(order => ({
        id: order.id,
        customer: order.customer_name || order.customer_email || 'Customer',
        amount: order.total_amount || order.total || 0,
        status: order.status || 'pending',
        date: new Date(order.created_at).toLocaleDateString()
      })) || [];

      // Low stock items
      const lowStockItems = productsRes.data
        ?.filter(product => (product.stock || 0) <= 10)
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          stock: product.stock || 0,
          category: product.category || 'Uncategorized'
        })) || [];

      // Recent bookings - FIXED: Check all possible column names
      const recentBookings = bookingsRes.data?.slice(0, 5).map(booking => {
        // Try different column names for service
        const serviceName = booking.service_name || booking.service_title || booking.service || 'Service';
        
        // Try different column names for customer
        const customerName = booking.customer_name || booking.client_name || booking.name || booking.email || 'Customer';
        
        // Try different column names for date
        const bookingDate = booking.date || booking.booking_date || booking.schedule_date;
        
        // Try different column names for time
        const bookingTime = booking.time || booking.booking_time || booking.appointment_time || 'Anytime';
        
        // Format date nicely if it exists
        let formattedDate = 'Date not set';
        if (bookingDate) {
          try {
            const date = new Date(bookingDate);
            formattedDate = date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
          } catch (e) {
            formattedDate = bookingDate;
          }
        }
        
        // Format time nicely
        let formattedTime = 'Anytime';
        if (bookingTime) {
          // Check if it's a timestamp
          if (bookingTime.includes('T') || bookingTime.includes(':')) {
            try {
              const time = new Date(bookingTime);
              formattedTime = time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (e) {
              formattedTime = bookingTime;
            }
          } else {
            formattedTime = bookingTime;
          }
        }

        return {
          id: booking.id,
          service: serviceName,
          customer: customerName,
          date: bookingDate,
          displayDate: formattedDate,
          time: bookingTime,
          displayTime: formattedTime,
          status: booking.status || 'pending'
        };
      }) || [];

      // Sales data for chart (last 7 days)
      const salesData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = ordersRes.data?.filter(order => {
          const orderDate = order.created_at?.split('T')[0];
          return orderDate === dateStr;
        }) || [];
        
        const dayRevenue = dayOrders.reduce((sum, order) => 
          sum + (order.total_amount || order.total || 0), 0
        );
        
        salesData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayRevenue,
          orders: dayOrders.length
        });
      }

      // Customer segments
      const customerSegments = [
        { name: 'New Customers', value: 40, color: COLORS.primary },
        { name: 'Returning', value: 35, color: COLORS.secondary },
        { name: 'VIP', value: 15, color: COLORS.accent },
        { name: 'Inactive', value: 10, color: '#64748B' }
      ];

      // Product categories
      const productCategories = categoriesRes.data?.map(cat => ({
        name: cat.name,
        count: productsRes.data?.filter(p => p.category_id === cat.id).length || 0
      })) || [];

      setDashboardData({
        stats: {
          totalProducts,
          totalServices,
          totalOrders,
          totalRevenue,
          totalUsers,
          pendingOrders,
          lowStockProducts,
          activeBookings
        },
        recentOrders,
        lowStockItems,
        recentBookings,
        salesData,
        customerSegments,
        productCategories
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const salesChartData = {
    labels: dashboardData.salesData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue (₱)',
        data: dashboardData.salesData.map(d => d.revenue),
        borderColor: COLORS.primary,
        backgroundColor: COLORS.lightBlue,
        tension: 0.4
      },
      {
        label: 'Orders',
        data: dashboardData.salesData.map(d => d.orders),
        borderColor: COLORS.accent,
        backgroundColor: COLORS.lightGreen,
        tension: 0.4
      }
    ]
  };

  const customerChartData = {
    labels: dashboardData.customerSegments.map(s => s.name),
    datasets: [
      {
        data: dashboardData.customerSegments.map(s => s.value),
        backgroundColor: dashboardData.customerSegments.map(s => s.color),
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <GlobalStyles />
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch(statusLower) {
      case 'confirmed': 
      case 'completed': 
      case 'delivered':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'pending': 
      case 'scheduled':
      case 'processing':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'cancelled': 
      case 'rejected':
      case 'failed':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      default: 
        return { bg: 'rgba(74, 184, 235, 0.1)', color: '#4ab8eb' };
    }
  };

  return (
    <div style={styles.container}>
      <GlobalStyles />
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent} className="dashboard-header-content">
          <div>
            <h1 style={styles.headerTitle}>Dashboard</h1>
            <p style={styles.headerSubtitle}>Business Overview</p>
          </div>
          <div style={styles.headerActions} className="dashboard-header-actions">
            <button 
              onClick={loadDashboardData}
              style={styles.refreshButton}
              className="refresh-button"
            >
              Refresh Data
            </button>
            <div style={styles.lastUpdated}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats Grid */}
        <div style={styles.statsGrid} className="dashboard-stats-grid">
          {/* Primary Color Cards */}
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #2e4dc8',
            background: 'linear-gradient(to right, rgba(46, 77, 200, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Total Products</p>
                <p style={styles.statValue}>{dashboardData.stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #2e4dc8',
            background: 'linear-gradient(to right, rgba(46, 77, 200, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Total Orders</p>
                <p style={styles.statValue}>{dashboardData.stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          {/* Secondary Color Cards */}
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #4ab8eb',
            background: 'linear-gradient(to right, rgba(74, 184, 235, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Total Services</p>
                <p style={styles.statValue}>{dashboardData.stats.totalServices}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #4ab8eb',
            background: 'linear-gradient(to right, rgba(74, 184, 235, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Active Bookings</p>
                <p style={styles.statValue}>{dashboardData.stats.activeBookings}</p>
              </div>
            </div>
          </div>
          
          {/* Accent Color Cards */}
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #10B981',
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Total Revenue</p>
                <p style={styles.statValue}>₱{dashboardData.stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #10B981',
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Total Users</p>
                <p style={styles.statValue}>{dashboardData.stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          {/* Status Cards */}
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #F59E0B',
            background: 'linear-gradient(to right, rgba(245, 158, 11, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Pending Orders</p>
                <p style={styles.statValue}>{dashboardData.stats.pendingOrders}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            ...styles.statCard,
            borderLeft: '4px solid #EF4444',
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.06), white)'
          }} className="stat-card">
            <div style={styles.statContent}>
              <div>
                <p style={styles.statTitle}>Low Stock Items</p>
                <p style={styles.statValue}>{dashboardData.stats.lowStockProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={styles.chartsGrid} className="dashboard-charts-grid">
          {/* Sales Chart */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Sales Overview (Last 7 Days)</h2>
            <div style={styles.chartContainer}>
              <Line 
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₱' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Customer Segments */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Customer Segments</h2>
            <div style={styles.chartContainer}>
              <Pie 
                data={customerChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Data Section */}
        <div style={styles.dataGrid} className="dashboard-data-grid">
          {/* Recent Orders */}
          <div style={styles.dataCard}>
            <div style={styles.dataCardHeader}>
              <h2 style={styles.dataCardTitle}>Recent Orders</h2>
              <Link to="/dashboard/sales" style={styles.viewAllLink} className="view-all-link">
                View all →
              </Link>
            </div>
            <div style={styles.dataList}>
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => {
                  const statusStyle = getStatusColor(order.status);
                  return (
                    <div key={order.id} style={styles.dataItem} className="data-item">
                      <div style={styles.dataItemContent}>
                        <div>
                          <p style={styles.dataItemTitle}>Order #{order.id}</p>
                          <p style={styles.dataItemSubtitle}>{order.customer}</p>
                        </div>
                        <div style={styles.dataItemRight}>
                          <p style={{...styles.dataItemAmount, ...styles.primaryText}}>
                            ₱{order.amount.toLocaleString()}
                          </p>
                          <span style={{
                            ...styles.statusBadge,
                            background: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={styles.emptyState}>
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Items */}
          <div style={styles.dataCard}>
            <div style={styles.dataCardHeader}>
              <h2 style={styles.dataCardTitle}>Low Stock Alert</h2>
              <Link to="/dashboard/products" style={styles.viewAllLink} className="view-all-link">
                Manage stock →
              </Link>
            </div>
            <div style={styles.dataList}>
              {dashboardData.lowStockItems.length > 0 ? (
                dashboardData.lowStockItems.map((item) => (
                  <div key={item.id} style={styles.dataItem} className="data-item">
                    <div style={styles.dataItemContent}>
                      <div>
                        <p style={styles.dataItemTitle}>{item.name}</p>
                        <p style={styles.dataItemSubtitle}>{item.category}</p>
                      </div>
                      <div style={styles.dataItemRight}>
                        <div style={{
                          ...styles.stockIndicator,
                          background: item.stock <= 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: item.stock <= 5 ? '#EF4444' : '#F59E0B'
                        }}>
                          {item.stock}
                        </div>
                        <p style={styles.stockText}>units left</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  All stock levels are optimal
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings - FIXED DISPLAY */}
        <div style={styles.fullWidthCard}>
          <div style={styles.dataCardHeader}>
            <h2 style={styles.dataCardTitle}>Recent Bookings</h2>
            <Link to="/dashboard/service-scheduling" style={styles.viewAllLink} className="view-all-link">
              View all →
            </Link>
          </div>
          <div style={styles.bookingsList}>
            {dashboardData.recentBookings.length > 0 ? (
              dashboardData.recentBookings.map((booking) => {
                const statusStyle = getStatusColor(booking.status);
                
                return (
                  <div key={booking.id} style={styles.bookingItem} className="booking-item">
                    <div style={styles.bookingContent}>
                      <div>
                        <p style={styles.bookingTitle}>{booking.service}</p>
                        <p style={styles.bookingSubtitle}>{booking.customer}</p>
                        <p style={styles.bookingTime}>
                          {booking.displayDate || booking.date || 'Date not set'} • {booking.displayTime || booking.time || 'Anytime'}
                        </p>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.emptyState}>
                No recent bookings found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main Dashboard Component with routing
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Update active page based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentPage = path[path.length - 1] || 'dashboard';
    setActivePage(currentPage);
  }, [location]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out: ' + error.message);
    }
  };

  const handleNavigation = (page) => {
    navigate(`/dashboard/${page}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#f8fafc',
    }}>
      {/* Sidebar - No changes to your sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activePage={activePage}
        onToggle={toggleSidebar}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: '#f8fafc',
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s ease',
      }}>
        <Routes>
          <Route index element={<DashboardScreen />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="users" element={<UserSystemManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="sales" element={<SalesManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="service-scheduling" element={<ServiceScheduling />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="reports" element={<ReportsScreen />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}