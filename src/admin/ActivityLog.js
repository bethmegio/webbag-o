// ActivityLog.js - ADMIN VERSION (Enhanced)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  FaHistory, FaUser, FaShoppingBag, FaCalendarAlt, FaBoxOpen,
  FaCog, FaSearch, FaFilter, FaTrash, FaDownload, FaEye,
  FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaSync, FaPlus,
  FaCheckCircle, FaExclamationCircle, FaUserCircle, FaTimes,
  FaChartLine, FaStore, FaMobileAlt, FaTools, FaShieldAlt,
  FaFileInvoice, FaCreditCard, FaTruck, FaMapMarkerAlt,
  FaShoppingCart, FaTag, FaEnvelope, FaPhone, FaMoneyBill,
  FaStar, FaThumbsUp, FaThumbsDown, FaComments, FaBell
} from 'react-icons/fa';

// Activity logging function - Enhanced for both admin and app
export const logActivity = async (activityData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const activity = {
      user_id: user?.id || null,
      activity_type: activityData.type,
      description: activityData.description,
      ip_address: activityData.ipAddress || null,
      user_agent: activityData.userAgent || navigator.userAgent,
      metadata: activityData.metadata || {},
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('activity_logs')
      .insert(activity);

    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logActivity:', error);
    return false;
  }
};

// Activity Types for both admin and app
export const ActivityTypes = {
  // User Activities
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  USER_PROFILE_UPDATE: 'user_profile_update',
  USER_PASSWORD_CHANGE: 'user_password_change',
  
  // Admin Activities
  ADMIN_LOGIN: 'admin_login',
  ADMIN_DASHBOARD_ACCESS: 'admin_dashboard_access',
  ADMIN_SETTINGS_UPDATE: 'admin_settings_update',
  ADMIN_REPORT_VIEW: 'admin_report_view',
  
  // Product Activities
  PRODUCT_VIEW: 'product_view',
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  PRODUCT_REVIEW_CREATE: 'product_review_create',
  
  // Order Activities
  ORDER_CREATE: 'order_create',
  ORDER_UPDATE: 'order_update',
  ORDER_DELETE: 'order_delete',
  ORDER_STATUS_CHANGE: 'order_status_change',
  ORDER_PAYMENT_SUCCESS: 'order_payment_success',
  ORDER_PAYMENT_FAILED: 'order_payment_failed',
  
  // Booking Activities
  BOOKING_CREATE: 'booking_create',
  BOOKING_UPDATE: 'booking_update',
  BOOKING_DELETE: 'booking_delete',
  BOOKING_CONFIRM: 'booking_confirm',
  BOOKING_CANCEL: 'booking_cancel',
  BOOKING_COMPLETE: 'booking_complete',
  
  // Cart Activities
  CART_ADD_ITEM: 'cart_add_item',
  CART_REMOVE_ITEM: 'cart_remove_item',
  CART_UPDATE_ITEM: 'cart_update_item',
  CART_CLEAR: 'cart_clear',
  CART_CHECKOUT: 'cart_checkout',
  
  // Service Activities
  SERVICE_VIEW: 'service_view',
  SERVICE_BOOKING: 'service_booking',
  SERVICE_REVIEW_CREATE: 'service_review_create',
  
  // System Activities
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_UPDATE: 'system_update',
  REPORT_GENERATED: 'report_generated',
  ERROR_OCCURRED: 'error_occurred',
  
  // Inventory Activities
  INVENTORY_UPDATE: 'inventory_update',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  LOW_STOCK_ALERT: 'low_stock_alert',
  
  // Payment Activities
  PAYMENT_PROCESSED: 'payment_processed',
  REFUND_ISSUED: 'refund_issued',
  PAYMENT_METHOD_ADDED: 'payment_method_added',
  
  // Shipping Activities
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  TRACKING_UPDATE: 'tracking_update',
  
  // Marketing Activities
  NEWSLETTER_SUBSCRIBE: 'newsletter_subscribe',
  PROMOTION_APPLIED: 'promotion_applied',
  COUPON_USED: 'coupon_used',
  
  // Review Activities
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  REVIEW_DELETED: 'review_deleted',
  
  // Notification Activities
  NOTIFICATION_SENT: 'notification_sent',
  EMAIL_SENT: 'email_sent',
  SMS_SENT: 'sms_sent'
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user exists in user_roles table with admin role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRole?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Fallback: check if user has admin email pattern
        const adminEmails = ['admin@', 'administrator@', 'superadmin@'];
        if (adminEmails.some(pattern => user.email?.includes(pattern))) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.log('Admin check error:', error);
    }
  };

  const filterActivities = useCallback(() => {
    let filtered = [...activities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description?.toLowerCase().includes(term) ||
        activity.activity_type?.toLowerCase().includes(term) ||
        activity.metadata?.details?.toLowerCase().includes(term) ||
        activity.user_agent?.toLowerCase().includes(term) ||
        (activity.user_id && users.find(u => u.id === activity.user_id)?.email?.toLowerCase().includes(term)) ||
        (activity.user_id && users.find(u => u.id === activity.user_id)?.name?.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.activity_type === typeFilter);
    }

    if (userFilter !== 'all') {
      if (userFilter === 'system') {
        filtered = filtered.filter(activity => !activity.user_id);
      } else if (userFilter === 'admin') {
        filtered = filtered.filter(activity => {
          const user = users.find(u => u.id === activity.user_id);
          return user?.is_admin || user?.role === 'admin';
        });
      } else {
        filtered = filtered.filter(activity => activity.user_id === userFilter);
      }
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(activity => new Date(activity.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => new Date(activity.created_at) <= toDate);
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, searchTerm, typeFilter, userFilter, dateFrom, dateTo, users]);

  useEffect(() => {
    fetchActivities();
    fetchUsers();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError, count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1000);

      if (fetchError) {
        setError(`Error loading activities: ${fetchError.message}`);
        setActivities([]);
        setTotalCount(0);
        return;
      }

      setActivities(data || []);
      setTotalCount(count || (data ? data.length : 0));

    } catch (error) {
      console.error('Unexpected error:', error);
      setError(`Unexpected error: ${error.message}`);
      setActivities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupRealtimeSubscription = () => {
    try {
      const channel = supabase
        .channel('activity-logs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_logs'
          },
          (payload) => {
            setActivities(prev => [payload.new, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, email, full_name, phone, avatar_url')
        .order('email');

      if (!publicError && publicUsers) {
        // Check user_roles table for admin status
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const userRolesMap = {};
        if (!rolesError && userRoles) {
          userRoles.forEach(ur => {
            userRolesMap[ur.user_id] = ur.role;
          });
        }

        const transformedUsers = publicUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.full_name || user.email?.split('@')[0] || 'User',
          phone: user.phone,
          avatar_url: user.avatar_url,
          role: userRolesMap[user.id] || 'user',
          is_admin: userRolesMap[user.id] === 'admin'
        }));
        
        setUsers(transformedUsers);
      } else {
        // Fallback to auth users
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authUsers) {
          const transformedUsers = authUsers.map(user => ({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'user',
            is_admin: user.email?.includes('admin@') || false
          }));
          setUsers(transformedUsers);
        } else {
          setUsers([]);
        }
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const getActivityIcon = (type) => {
    if (!type) return <FaHistory />;
    
    const iconProps = { style: { fontSize: '14px' } };
    
    switch (true) {
      case type.includes('user_'):
        return <FaUser {...iconProps} />;
      case type.includes('admin_'):
        return <FaShieldAlt {...iconProps} />;
      case type.includes('order_'):
        return <FaShoppingBag {...iconProps} />;
      case type.includes('booking_'):
        return <FaCalendarAlt {...iconProps} />;
      case type.includes('product_'):
        return <FaBoxOpen {...iconProps} />;
      case type.includes('cart_'):
        return <FaShoppingCart {...iconProps} />;
      case type.includes('service_'):
        return <FaTools {...iconProps} />;
      case type.includes('payment_'):
        return <FaCreditCard {...iconProps} />;
      case type.includes('review_'):
        return <FaStar {...iconProps} />;
      case type.includes('inventory_') || type.includes('stock_'):
        return <FaBoxOpen {...iconProps} />;
      case type.includes('shipping_') || type.includes('delivered'):
        return <FaTruck {...iconProps} />;
      case type.includes('notification_') || type.includes('email_') || type.includes('sms_'):
        return <FaBell {...iconProps} />;
      case type.includes('promotion_') || type.includes('coupon_'):
        return <FaTag {...iconProps} />;
      case type.includes('report_'):
        return <FaChartLine {...iconProps} />;
      case type.includes('error_'):
        return <FaExclamationCircle {...iconProps} />;
      case type.includes('system_'):
        return <FaCog {...iconProps} />;
      default:
        return <FaHistory {...iconProps} />;
    }
  };

  const getSeverityColor = (type) => {
    if (!type) return { background: '#f3f4f6', color: '#6b7280' };
    
    if (type.includes('delete') || type.includes('reject') || type.includes('cancel') || type.includes('failed') || type.includes('error')) {
      return { background: '#fee2e2', color: '#dc2626' };
    }
    if (type.includes('create') || type.includes('approve') || type.includes('confirm') || type.includes('success') || type.includes('complete')) {
      return { background: '#dcfce7', color: '#16a34a' };
    }
    if (type.includes('update') || type.includes('adjustment') || type.includes('change')) {
      return { background: '#dbeafe', color: '#2563eb' };
    }
    if (type.includes('login') || type.includes('register')) {
      return { background: '#f0f9ff', color: '#0ea5e9' };
    }
    if (type.includes('view') || type.includes('access')) {
      return { background: '#f5f3ff', color: '#8b5cf6' };
    }
    return { background: '#f3f4f6', color: '#6b7280' };
  };

  const getActivityLabel = (type) => {
    if (!type) return 'Unknown';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setUserFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const refreshLogs = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const seedSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to generate sample data');
        return;
      }

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Admin';

      const sampleActivities = [
        {
          user_id: user.id,
          activity_type: 'admin_login',
          description: `${userName} logged into admin dashboard`,
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          metadata: { 
            details: 'Successful admin authentication',
            browser: 'Chrome/120.0.0.0',
            user_email: user.email,
            user_role: 'admin',
            timestamp: new Date().toISOString()
          }
        },
        {
          user_id: user.id,
          activity_type: 'order_create',
          description: 'New order #ORD-001 created by customer',
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          metadata: { 
            details: 'Order with 3 items',
            order_id: 'ORD-001',
            amount: 149.99,
            items: 3,
            customer_email: 'customer@example.com',
            payment_method: 'Credit Card'
          }
        },
        {
          user_id: null,
          activity_type: 'system_backup',
          description: 'Daily system backup completed',
          ip_address: null,
          user_agent: 'System',
          metadata: { 
            details: 'Automatic backup of database',
            backup_size: '45.2 MB',
            duration: '2m 15s',
            status: 'success'
          }
        },
        {
          user_id: user.id,
          activity_type: 'product_update',
          description: 'Product "Premium Widget" updated',
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          metadata: { 
            details: 'Updated product price and description',
            product_id: 'PROD-001',
            old_price: 49.99,
            new_price: 59.99,
            user_email: user.email
          }
        },
        {
          user_id: user.id,
          activity_type: 'booking_confirm',
          description: 'Booking #BK-001 confirmed',
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          metadata: { 
            details: 'Booking confirmed for client John Doe',
            booking_id: 'BK-001',
            client_email: 'john.doe@example.com',
            booking_date: '2024-01-25',
            amount: 199.99
          }
        },
        {
          user_id: user.id,
          activity_type: 'inventory_update',
          description: 'Inventory stock adjusted',
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          metadata: { 
            details: 'Stock adjustment for product XYZ',
            product_id: 'PROD-002',
            old_stock: 50,
            new_stock: 45,
            reason: 'Damaged items'
          }
        },
        {
          user_id: null,
          activity_type: 'low_stock_alert',
          description: 'Low stock alert for Product ABC',
          ip_address: null,
          user_agent: 'System',
          metadata: { 
            details: 'Stock level below threshold',
            product_id: 'PROD-003',
            current_stock: 5,
            threshold: 10,
            alert_type: 'low_stock'
          }
        }
      ];

      const { error } = await supabase
        .from('activity_logs')
        .insert(sampleActivities);

      if (error) {
        setError(`Error creating sample data: ${error.message}`);
        return;
      }

      await fetchActivities();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredActivities.length === 0) {
      alert('No activities to export');
      return;
    }

    const headers = ['Timestamp', 'Activity Type', 'Description', 'User', 'IP Address', 'Details'];
    const csvData = filteredActivities.map(activity => {
      const user = users.find(u => u.id === activity.user_id);
      return [
        new Date(activity.created_at).toISOString(),
        getActivityLabel(activity.activity_type),
        activity.description || 'N/A',
        user ? `${user.name} (${user.email})` : 'System',
        activity.ip_address || 'N/A',
        activity.metadata?.details || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllLogs = async () => {
    if (!window.confirm('⚠️ ARE YOU SURE?\n\nThis will permanently delete ALL activity logs. This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .gt('created_at', '1900-01-01');

      if (error) throw error;
      
      setActivities([]);
      setFilteredActivities([]);
      setTotalCount(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Error clearing logs: ' + error.message);
    }
  };

  const getActivityTypes = () => {
    const types = [...new Set(activities.map(activity => activity.activity_type).filter(Boolean))];
    return types.sort();
  };

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredActivities.slice(startIndex, startIndex + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredActivities.length / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get unique activity categories for filter
  const getActivityCategories = () => {
    const categories = {};
    activities.forEach(activity => {
      if (activity.activity_type) {
        const category = activity.activity_type.split('_')[0];
        categories[category] = true;
      }
    });
    return Object.keys(categories).sort();
  };

  if (!isAdmin && activities.length > 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <FaShieldAlt style={{ fontSize: '64px', color: '#ef4444', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            Access Denied
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            This section is only accessible to administrators.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: 'white',
        borderRadius: '12px',
        padding: '48px',
        margin: '24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#64748b' }}>Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaHistory style={{ color: '#3b82f6' }} />
          Activity Log Monitor
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Real-time monitoring of all system activities. Total records: {totalCount}
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaCheckCircle />
          <span>Operation completed successfully!</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Controls Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={refreshLogs}
              disabled={refreshing}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: refreshing ? 0.7 : 1
              }}
            >
              <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        
        
      </div>

      {/* Activity Logs Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: 0 }}>
              Activity Records ({filteredActivities.length})
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              Showing {paginatedActivities.length} of {filteredActivities.length} activities
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {activities.length === 0 && (
              <button
                onClick={seedSampleData}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus /> Create Sample Data
              </button>
            )}
            <button
              onClick={clearAllLogs}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaTrash /> Clear All Logs
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredActivities.length === 0}
              style={{
                background: filteredActivities.length === 0 ? '#cbd5e1' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: filteredActivities.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: filteredActivities.length === 0 ? 0.7 : 1
              }}
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {paginatedActivities.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              {activities.length === 0 ? (
                <>
                  <FaHistory style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    No activity logs found
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Your activity logs table is empty. Create sample data to get started.
                  </p>
                  <button
                    onClick={seedSampleData}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <FaPlus /> Create Sample Activity Data
                  </button>
                </>
              ) : (
                <>
                  <FaSearch style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    No activities match your filters
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1200px'
            }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Time</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>User</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Activity</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Details</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.map((activity) => {
                  const user = users.find(u => u.id === activity.user_id);
                  const severityColors = getSeverityColor(activity.activity_type);
                  
                  return (
                    <tr 
                      key={activity.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => setSelectedActivity(activity)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        {user ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0369a1',
                              fontWeight: '600'
                            }}>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b'
                            }}>
                              <FaCog />
                            </div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                              System
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: severityColors.background,
                            color: severityColors.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              background: severityColors.background,
                              color: severityColors.color,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              marginBottom: '8px'
                            }}>
                              {getActivityLabel(activity.activity_type)}
                            </span>
                            <div style={{ fontSize: '14px', color: '#334155', marginTop: '4px' }}>
                              {activity.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '14px', color: '#334155' }}>
                          {activity.metadata?.details || 'No additional details'}
                        </div>
                        {activity.metadata && Object.keys(activity.metadata).length > 1 && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                            {Object.keys(activity.metadata).length - 1} more fields
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#334155',
                          fontFamily: 'monospace',
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {activity.ip_address || 'N/A'}
                        </div>
                        {activity.user_agent && activity.user_agent !== 'System' && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {activity.user_agent.split('/')[0]}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#334155',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      background: currentPage === pageNum ? '#3b82f6' : 'white',
                      color: currentPage === pageNum ? 'white' : '#334155',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      minWidth: '40px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#334155',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                Activity Details
              </h3>
              <button
                onClick={() => setSelectedActivity(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: getSeverityColor(selectedActivity.activity_type).background,
                  color: getSeverityColor(selectedActivity.activity_type).color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getActivityIcon(selectedActivity.activity_type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: getSeverityColor(selectedActivity.activity_type).background,
                    color: getSeverityColor(selectedActivity.activity_type).color,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    {getActivityLabel(selectedActivity.activity_type)}
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#334155', margin: 0 }}>
                    {selectedActivity.description}
                  </p>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Timestamp</div>
                    <div style={{ fontSize: '14px', color: '#334155' }}>
                      {new Date(selectedActivity.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>IP Address</div>
                    <div style={{ fontSize: '14px', color: '#334155', fontFamily: 'monospace' }}>
                      {selectedActivity.ip_address || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedActivity.metadata && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', margin: '0 0 12px 0' }}>
                    Metadata
                  </h4>
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <pre style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      lineHeight: '1.5'
                    }}>
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ActivityLog;