import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  // Add these icons for the chatbox:
  FaTimes,           // For close button (×)
  FaPhoneAlt,        // For phone/call button
  FaEnvelopeOpen,    // For email button
  FaComments,        // For chat/message icon
  FaPaperPlane,
  FaCalendarCheck, 
  FaShoppingBag,
  FaQuestionCircle, 
  FaFileInvoice, 
  FaUsers, 
  FaChartBar,
  FaDollarSign,
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaFilter,
  FaPrint,
  FaDownload,
  FaEye,
  FaTrash,
  FaEdit,
  FaPlus,
  FaChartLine,
  FaStore,
  FaMobileAlt,
  FaTools,
  FaCar,
  FaCarAlt,
  FaOilCan,
  FaShieldAlt,
  FaUserCircle,
  FaTag,
  FaSync,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaBox,
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaStarHalfAlt,
  FaRegStar,
  FaComment,
  FaExclamationCircle,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaReceipt,
  FaCreditCard,
  FaTruck,
  FaMapMarkerAlt,
  FaListAlt,
  FaSwimmingPool,
  FaWrench,
  FaPaintRoller,
  FaTint,
  FaLeaf,
  FaCalendarDay,
  FaCalendar,
  FaList,
  FaCalendarWeek,
  // ADD THESE MISSING IMPORTS (but make sure they're not duplicates):
  FaUserPlus,
  FaCheck,
  FaChevronDown,
  FaFileCsv,
  FaBan,
  FaExclamationTriangle
} from 'react-icons/fa';

// ====================
// REUSABLE COMPONENTS
// ====================

// Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            size={size}
            color={starValue <= rating ? '#F59E0B' : '#E5E7EB'}
            style={{ transition: 'color 0.2s ease' }}
          />
        );
      })}
      <span style={{ 
        marginLeft: '8px', 
        fontSize: size * 0.75, 
        fontWeight: '600',
        color: '#111827' 
      }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status, type = 'order') => {
  const colors = {
    pending: { background: '#fffbeb', color: '#f59e0b', border: '#fcd34d' },
    confirmed: { background: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' },
    in_progress: { background: '#f0f9ff', color: '#0ea5e9', border: '#bae6fd' },
    completed: { background: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    cancelled: { background: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    shipped: { background: '#f5f3ff', color: '#8b5cf6', border: '#c4b5fd' },
    delivered: { background: '#f0fdf4', color: '#10b981', border: '#a7f3d0' },
    approved: { background: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    rejected: { background: '#fef2f2', color: '#dc2626', border: '#fca5a5' }
  };
  return colors[status] || { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
};

// Status badge component
const StatusBadge = ({ status, type = 'order' }) => {
  const color = getStatusColor(status, type);
  return (
    <span style={{
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      backgroundColor: color.background,
      color: color.color,
      border: `1px solid ${color.border}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {status === 'pending' && <FaClock size={10} />}
      {status === 'confirmed' && <FaCheckCircle size={10} />}
      {status === 'completed' && <FaCheckCircle size={10} />}
      {status === 'cancelled' && <FaTimesCircle size={10} />}
      {status === 'in_progress' && <FaClock size={10} />}
      {status === 'shipped' && <FaTruck size={10} />}
      {status === 'delivered' && <FaCheckCircle size={10} />}
      {status.replace('_', ' ')}
    </span>
  );
};

// Review Status Badge
const ReviewStatusBadge = ({ status }) => {
  const colors = {
    pending: { background: '#fffbeb', color: '#f59e0b', border: '#fcd34d' },
    approved: { background: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    rejected: { background: '#fef2f2', color: '#dc2626', border: '#fca5a5' }
  };
  
  const color = colors[status] || { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
  
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      backgroundColor: color.background,
      color: color.color,
      border: `1px solid ${color.border}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {status === 'approved' && <FaThumbsUp size={10} />}
      {status === 'rejected' && <FaThumbsDown size={10} />}
      {status === 'pending' && <FaClock size={10} />}
      {status}
    </span>
  );
};

// Stat card component
const StatCard = ({ icon: Icon, title, value, color, bgColor, subtitle, onClick }) => (
  <div 
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      ':hover': onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      } : {}
    }}
    onClick={onClick}
  >
    <div style={{
      backgroundColor: bgColor,
      padding: '12px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={24} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '4px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: subtitle ? '4px' : '0'
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

// ====================
// ORDER MANAGEMENT COMPONENT
// ====================

const OrdersManagementTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (search) {
        query = query.or(`
          customer_name.ilike.%${search}%,
          customer_email.ilike.%${search}%,
          customer_phone.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        // Try without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleError) throw simpleError;
        setOrders(simpleData || []);
      } else {
        setOrders(data || []);
      }

    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error loading orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      alert(`Order ${status} successfully!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + error.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.filter(order => order.id !== orderId));
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order: ' + error.message);
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'confirmed')
      .reduce((sum, o) => sum + (o.total || o.total_amount || 0), 0);
    
    return { total, pending, confirmed, completed, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  const renderOrderDetails = (order) => {
    const orderTotal = order.total || order.total_amount || 0;
    const subtotal = order.subtotal || 0;
    const tax = order.tax || 0;
    const discount = order.discount || 0;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Order Details
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Order Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Order Number
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  #{order.id}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Customer
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {order.customer_name || 'Customer'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {order.customer_email || ''}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Date & Time
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Payment Method
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {order.payment_method || 'Cash'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Payment Status
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: order.payment_status === 'paid' ? '#10b981' : '#ef4444'
                }}>
                  {order.payment_status || 'Pending'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Channel
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {order.channel || 'Online'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Total Amount
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                  ₱{orderTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Order Summary
            </h4>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: '600' }}>₱{subtotal.toLocaleString()}</span>
              </div>
              
              {tax > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <span style={{ color: '#6b7280' }}>Tax</span>
                  <span style={{ fontWeight: '600' }}>₱{tax.toLocaleString()}</span>
                </div>
              )}
              
              {discount > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <span style={{ color: '#6b7280' }}>Discount</span>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>-₱{discount.toLocaleString()}</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '12px',
                fontWeight: '700',
                fontSize: '18px'
              }}>
                <span>Total</span>
                <span>₱{orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Order Items
            </h4>
            {order.order_items && order.order_items.length > 0 ? (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {order.order_items.map((item, index) => (
                  <div key={item.id} style={{
                    padding: '16px',
                    borderBottom: index < order.order_items.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaBox size={24} color="#6b7280" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {item.products?.name || `Product #${item.product_id}`}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Quantity: {item.quantity || 1} × ₱{(item.price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                      ₱{((item.quantity || 1) * (item.price || 0)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '32px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <FaBox size={48} color="#d1d5db" />
                <p style={{ color: '#6b7280', marginTop: '16px' }}>
                  No items found for this order
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, 'confirmed');
                    setShowDetails(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaCheckCircle />
                  Accept Order
                </button>
                
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, 'cancelled');
                    setShowDetails(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaTimesCircle />
                  Decline Order
                </button>
              </>
            )}
            
            {order.status === 'confirmed' && (
              <button
                onClick={() => {
                  updateOrderStatus(order.id, 'completed');
                  setShowDetails(false);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaCheckCircle />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            Orders Management
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Manage and process customer orders
          </p>
        </div>
        
        <button
          onClick={fetchOrders}
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
            gap: '8px'
          }}
        >
          <FaSync />
          Refresh
        </button>
      </div>

      {/* Order Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          icon={FaShoppingBag}
          title="Total Orders"
          value={stats.total}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={FaClock}
          title="Pending"
          value={stats.pending}
          color="#F59E0B"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Confirmed"
          value={stats.confirmed}
          color="#10B981"
          bgColor="#d1fae5"
        />
        <StatCard
          icon={FaDollarSign}
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          color="#8B5CF6"
          bgColor="#f5f3ff"
        />
      </div>


      {/* Orders List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p style={{ color: '#6b7280' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <FaShoppingBag size={48} color="#d1d5db" />
            <h3 style={{ 
              margin: '16px 0 8px 0', 
              color: '#111827', 
              fontSize: '18px' 
            }}>
              No Orders Found
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px',
              margin: 0 
            }}>
              {search ? 'No orders match your search criteria' : 'No orders available yet'}
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const orderTotal = order.total || order.total_amount || 0;
            
            return (
              <div key={order.id} style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                transition: 'background-color 0.2s ease',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px'
                }}>
                  {/* Order Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaReceipt size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          Order #{order.id}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: 'auto'
                      }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Customer Info */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaUser size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {order.customer_name || 'Customer'}
                        </span>
                      </div>
                      {order.customer_email ? (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          ({order.customer_email})
                        </span>
                      ) : null}
                      {order.customer_phone && (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          📱 {order.customer_phone}
                        </span>
                      )}
                    </div>
                    
                    {/* Order Summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Items
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {order.order_items?.length || 'N/A'} items
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Total Amount
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                          ₱{orderTotal.toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Payment
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCreditCard size={12} />
                          {order.payment_method || 'Cash'}
                        </div>
                        <div style={{ fontSize: '12px', color: order.payment_status === 'paid' ? '#10b981' : '#ef4444' }}>
                          {order.payment_status || 'Pending'}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Channel
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {order.channel === 'online' ? <FaMobileAlt size={12} /> : <FaStore size={12} />}
                          {order.channel || 'Online'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minWidth: '140px'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaEye size={12} />
                      View Details
                    </button>
                    
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaCheckCircle size={12} />
                          Accept
                        </button>
                        
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaTimesCircle size={12} />
                          Decline
                        </button>
                      </>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FaCheckCircle size={12} />
                        Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaTrash size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && renderOrderDetails(selectedOrder)}
    </div>
  );
};

// ====================
// BOOKINGS MANAGEMENT TAB
// ====================


const BookingsManagementTab = () => {
  // State variables
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [calendarView, setCalendarView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Chatbox state
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const cancellationReasons = [
    { id: 'customer_requested', label: 'Customer Requested', description: 'Customer requested to cancel the booking' },
    { id: 'schedule_conflict', label: 'Schedule Conflict', description: 'Conflicting schedule with other bookings' },
    { id: 'technician_unavailable', label: 'Technician Unavailable', description: 'No available technician for the date/time' },
    { id: 'weather_conditions', label: 'Weather Conditions', description: 'Unfavorable weather conditions' },
    { id: 'customer_no_show', label: 'Customer No-Show', description: 'Customer was not available at scheduled time' },
    { id: 'service_not_possible', label: 'Service Not Possible', description: 'Service cannot be performed as requested' },
    { id: 'equipment_failure', label: 'Equipment Failure', description: 'Required equipment is not functioning' },
    { id: 'location_inaccessible', label: 'Location Inaccessible', description: 'Cannot access the service location' },
    { id: 'customer_non_responsive', label: 'Customer Non-Responsive', description: 'Customer is not responding to communication' },
    { id: 'other', label: 'Other', description: 'Other reason (specify below)' }
  ];

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    
    // Real-time updates subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchBookings();
  }, [filter, categoryFilter, technicianFilter, paymentFilter, sortBy, sortOrder, dateRange]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [search]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBookings(),
        fetchServices(),
        fetchTechnicians(),
        calculateFullyBookedDates()
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch services from database
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      setServices(data || []);
      console.log('Services fetched:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Error loading services: ' + error.message);
    }
  };

  // Fetch technicians from database
  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }
      
      setAvailableTechnicians(data || []);
      console.log('Technicians fetched:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      alert('Error loading technicians: ' + error.message);
    }
  };

// Fetch bookings with new schema
const fetchBookings = async () => {
  try {
    setLoading(true);
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services:service_id (
          name,
          category,
          price,
          service_type
        ),
        technicians:technician_id (
          name,
          email,
          phone,
          specialization
        )
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    if (paymentFilter !== 'all') {
      query = query.eq('payment_status', paymentFilter);
    }
    
    if (dateRange.start && dateRange.end) {
      query = query.gte('booking_date', dateRange.start).lte('booking_date', dateRange.end);
    }

    if (search) {
      query = query.or(`
        customer_name.ilike.%${search}%,
        customer_email.ilike.%${search}%,
        customer_phone.ilike.%${search}%,
        address.ilike.%${search}%,
        services.name.ilike.%${search}%
      `);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      // Try without joins
      const { data: simpleData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      setBookings(simpleData || []);
    } else {
      setBookings(data || []);
    }

  } catch (error) {
    console.error('Error fetching bookings:', error);
    alert('Error loading bookings: ' + error.message);
    setBookings([]);
  } finally {
    setLoading(false);
  }
};

// Update references in the component to use new field names:
// Instead of booking.name -> booking.customer_name
// Instead of booking.email -> booking.customer_email
// Instead of booking.contact -> booking.customer_phone
// Instead of booking.date -> booking.booking_date
// Instead of booking.location -> booking.address

  // Calculate fully booked dates
  const calculateFullyBookedDates = async () => {
    try {
      // First, get all services with their capacities
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, max_daily_capacity');
      
      if (servicesError) throw servicesError;

      const serviceCapacities = {};
      servicesData?.forEach(s => {
        serviceCapacities[s.id] = s.max_daily_capacity || 5; // Default to 5 if not set
      });

      // Get bookings for the next 90 days
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, service_id, date, status')
        .gte('date', startDate)
        .lte('date', endDateStr)
        .neq('status', 'cancelled')
        .neq('status', 'deleted');
      
      if (bookingsError) throw bookingsError;
      
      // Count bookings per service per date
      const capacityMap = {};
      bookingsData?.forEach(booking => {
        if (!capacityMap[booking.date]) {
          capacityMap[booking.date] = {};
        }
        if (!capacityMap[booking.date][booking.service_id]) {
          capacityMap[booking.date][booking.service_id] = 0;
        }
        capacityMap[booking.date][booking.service_id]++;
      });
      
      // Find fully booked dates
      const fullyBooked = [];
      Object.keys(capacityMap).forEach(date => {
        Object.keys(capacityMap[date]).forEach(serviceId => {
          const capacity = serviceCapacities[serviceId] || 5;
          if (capacityMap[date][serviceId] >= capacity) {
            if (!fullyBooked.includes(date)) {
              fullyBooked.push(date);
            }
          }
        });
      });
      
      setFullyBookedDates(fullyBooked);
      console.log('Fully booked dates calculated:', fullyBooked.length);
      
    } catch (error) {
      console.error('Error calculating fully booked dates:', error);
    }
  };

  // Fetch chat messages
  const fetchChatMessages = async (bookingId) => {
    try {
      setChatLoading(true);
      const { data, error } = await supabase
        .from('booking_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedBooking) return;

    try {
      setIsSendingMessage(true);
      
      const messageData = {
        booking_id: selectedBooking.id,
        sender_type: 'admin',
        sender_id: 'admin',
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('booking_messages')
        .insert([messageData])
        .select();

      if (error) throw error;

      setChatMessages(prev => [...prev, ...(data || [])]);
      setNewMessage('');

      await sendMessageNotification(selectedBooking, newMessage.trim());

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Send email notification
  const sendMessageNotification = async (booking, message) => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .insert([{
          to_email: booking.email,
          subject: `New Message Regarding Your Booking #${booking.id}`,
          body: `
            <h3>New Message from Pool Service Admin</h3>
            <p><strong>Regarding:</strong> ${booking.service || booking.services?.name || 'Your Service'}</p>
            <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Message:</strong><br/>
              ${message}
            </div>
            <p>Please log in to your account to view and reply to this message.</p>
            <p>Thank you,<br/>Pool Service Team</p>
          `,
          booking_id: booking.id,
          notification_type: 'booking_message'
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Open chatbox
  const openChatbox = async (booking) => {
    setSelectedBooking(booking);
    await fetchChatMessages(booking.id);
    setShowChatbox(true);
  };

  // Close chatbox
  const closeChatbox = () => {
    setShowChatbox(false);
    setChatMessages([]);
    setNewMessage('');
  };

  // Helper functions
  const getBookingStatusColor = (status) => {
    const colors = {
      'requested': { bg: '#dbeafe', text: '#1d4ed8', label: 'Requested' },
      'awaiting_store_visit': { bg: '#fef3c7', text: '#92400e', label: 'Awaiting Store Visit' },
      'scheduled': { bg: '#d1fae5', text: '#065f46', label: 'Scheduled' },
      'in_progress': { bg: '#e0f2fe', text: '#0284c7', label: 'In Progress' },
      'completed': { bg: '#dcfce7', text: '#166534', label: 'Completed' },
      'cancelled': { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' },
      'deleted': { bg: '#f3f4f6', text: '#6b7280', label: 'Deleted' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280', label: status };
  };

  const getServiceIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'pool care': return <FaTools />;
      case 'pool repair': return <FaWrench />;
      case 'pool design': return <FaPaintRoller />;
      case 'water treatment': return <FaTint />;
      case 'landscaping': return <FaLeaf />;
      default: return <FaTools />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₱0';
    return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus, reason = '') => {
    try {
      const updates = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'cancelled' && reason) {
        updates.cancellation_reason = reason;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) throw error;
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ));
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, ...updates }));
      }
      
      alert(`Booking status updated to ${newStatus.replace('_', ' ')}`);
      
      // Recalculate fully booked dates
      await calculateFullyBookedDates();
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  // Delete booking
  const deleteBooking = async (bookingId, reason = '') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'deleted',
          deletion_reason: reason,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      setShowDetails(false);
      setSelectedBooking(null);
      
      alert('Booking deleted successfully!');
      
      // Recalculate fully booked dates
      await calculateFullyBookedDates();
      
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking: ' + error.message);
    }
  };

  // Quick delete
  const quickDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for deletion (optional):');
    
    try {
      await deleteBooking(bookingId, reason);
    } catch (error) {
      console.error('Error in quick delete:', error);
    }
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'requested': ['awaiting_store_visit', 'scheduled', 'cancelled'],
      'awaiting_store_visit': ['scheduled', 'cancelled'],
      'scheduled': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'deleted': []
    };
    return statusFlow[currentStatus] || [];
  };

  // Export bookings to CSV
  const exportBookingsToCSV = async () => {
    try {
      setIsExporting(true);
      const headers = [
        'ID', 'Customer Name', 'Email', 'Phone', 'Service', 
        'Status', 'Booking Date', 'Location', 'Technician',
        'Estimated Cost', 'Payment Status', 'Created Date'
      ];
      
      const rows = bookings.map(booking => [
        booking.id,
        booking.name,
        booking.email,
        booking.contact,
        booking.services?.name || booking.service || 'N/A',
        booking.status,
        booking.date,
        booking.location,
        booking.technicians?.name || 'Not assigned',
        booking.estimated_cost,
        booking.payment_status,
        booking.created_at
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${bookings.length} bookings successfully!`);
    } catch (error) {
      console.error('Error exporting bookings:', error);
      alert('Error exporting bookings: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (status) => {
    if (selectedBookings.length === 0) return;
    
    if (!window.confirm(`Update ${selectedBookings.length} bookings to "${status.replace('_', ' ')}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedBookings);

      if (error) throw error;
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        selectedBookings.includes(booking.id) ? { ...booking, status } : booking
      ));
      
      setSelectedBookings([]);
      setShowBulkActions(false);
      alert(`Updated ${selectedBookings.length} bookings to ${status.replace('_', ' ')}`);
      
      // Recalculate fully booked dates
      await calculateFullyBookedDates();
      
    } catch (error) {
      console.error('Error updating bulk status:', error);
      alert('Error updating bookings: ' + error.message);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const requested = bookings.filter(b => b.status === 'requested').length;
    const awaiting = bookings.filter(b => b.status === 'awaiting_store_visit').length;
    const scheduled = bookings.filter(b => b.status === 'scheduled').length;
    const inProgress = bookings.filter(b => b.status === 'in_progress').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.final_cost) || parseFloat(b.estimated_cost) || 0), 0);
    const upcoming = bookings.filter(b => 
      (b.status === 'scheduled' || b.status === 'in_progress') && 
      b.date && new Date(b.date) >= new Date()
    ).length;
    const pendingPayment = bookings.filter(b => 
      b.payment_status === 'pending' || b.payment_status === 'unpaid'
    ).length;

    return {
      total, requested, awaiting, scheduled, inProgress,
      completed, cancelled, revenue, upcoming, pendingPayment
    };
  }, [bookings]);

  // Cancel Booking Modal
  const renderCancelModal = () => {
    if (!showCancelModal || !cancellingBooking) return null;

    const handleCancel = () => {
      if (selectedReason === 'other' && !cancellationReason.trim()) {
        alert('Please provide a cancellation reason');
        return;
      }

      const reason = selectedReason === 'other' 
        ? cancellationReason 
        : cancellationReasons.find(r => r.id === selectedReason)?.description || 'No reason provided';

      // Handle bulk cancellation
      if (cancellingBooking.id === 'bulk') {
        if (!window.confirm(`Cancel ${selectedBookings.length} bookings? This action cannot be undone.`)) {
          return;
        }
        
        selectedBookings.forEach(id => updateBookingStatus(id, 'cancelled', reason));
        setSelectedBookings([]);
        setShowBulkActions(false);
      } else {
        // Handle single booking cancellation
        updateBookingStatus(cancellingBooking.id, 'cancelled', reason);
      }
      
      setShowCancelModal(false);
      setSelectedReason('');
      setCancellationReason('');
      setCancellingBooking(null);
      setShowDetails(false);
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {cancellingBooking.id === 'bulk' 
                ? `Cancel ${selectedBookings.length} Bookings` 
                : `Cancel Booking #${cancellingBooking.id}`}
            </h3>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedReason('');
                setCancellationReason('');
                setCancellingBooking(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {cancellingBooking.id === 'bulk' ? (
                <>
                  <strong>{selectedBookings.length} bookings selected</strong><br/>
                  You are about to cancel multiple bookings. Please provide a reason.
                </>
              ) : (
                <>
                  <strong>Booking #{cancellingBooking.id}</strong><br/>
                  Customer: {cancellingBooking.name}<br/>
                  Service: {cancellingBooking.services?.name || cancellingBooking.service || 'Service'}<br/>
                  Date: {formatDate(cancellingBooking.date)}
                </>
              )}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
                Select Cancellation Reason:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {cancellationReasons.map(reason => (
                  <label
                    key={reason.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedReason === reason.id ? '#3b82f6' : '#e5e7eb'}`,
                      backgroundColor: selectedReason === reason.id ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      style={{ marginRight: '12px', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {reason.label}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {reason.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'other' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Specify Cancellation Reason:
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide detailed reason for cancellation..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedReason('');
                setCancellationReason('');
                setCancellingBooking(null);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleCancel}
              disabled={!selectedReason || (selectedReason === 'other' && !cancellationReason.trim())}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedReason ? '#ef4444' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedReason ? 'pointer' : 'not-allowed',
                opacity: selectedReason ? 1 : 0.6
              }}
            >
              <FaTimesCircle />
              {cancellingBooking.id === 'bulk' ? 'Confirm Bulk Cancellation' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render chatbox component
  const renderChatbox = () => {
    if (!showChatbox || !selectedBooking) return null;

    const customerName = selectedBooking.name || 'Customer';
    const serviceName = selectedBooking.services?.name || selectedBooking.service || 'Service';

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        height: '600px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Chat with {customerName}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              Booking #{selectedBooking.id} • {serviceName}
            </p>
          </div>
          <button
            onClick={closeChatbox}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '12px 20px',
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => window.open(`tel:${selectedBooking.contact}`)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaPhoneAlt size={12} />
            Call
          </button>
          <button
            onClick={() => window.open(`mailto:${selectedBooking.email}`)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaEnvelopeOpen size={12} />
            Email
          </button>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {chatLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                Loading messages...
              </p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaComments size={48} color="#d1d5db" />
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '12px' }}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={message.id || index}
                style={{
                  alignSelf: message.sender_type === 'admin' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div style={{
                  backgroundColor: message.sender_type === 'admin' ? '#3b82f6' : '#e5e7eb',
                  color: message.sender_type === 'admin' ? 'white' : '#111827',
                  padding: '10px 14px',
                  borderRadius: message.sender_type === 'admin' 
                    ? '12px 12px 0 12px' 
                    : '12px 12px 12px 0',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {message.message}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginTop: '4px',
                  textAlign: message.sender_type === 'admin' ? 'right' : 'left',
                  padding: '0 4px'
                }}>
                  {formatDateTime(message.created_at)}
                  {message.sender_type === 'admin' && ' • You'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '16px 20px',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={isSendingMessage}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
              style={{
                padding: '10px 20px',
                backgroundColor: newMessage.trim() ? '#3b82f6' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {isSendingMessage ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Send
                </>
              )}
            </button>
          </div>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: '8px 0 0 0',
            textAlign: 'center'
          }}>
            Messages are saved and customer will receive email notification
          </p>
        </div>
      </div>
    );
  };
// Add this after the renderChatbox function and before the BulkActions component

// ================= BOOKING DETAILS MODAL =================
const BookingDetailsModal = () => {
  if (!showDetails || !selectedBooking) return null;

  const service = selectedBooking.services || {};
  const technician = selectedBooking.technicians || {};
  const statusColor = getBookingStatusColor(selectedBooking.status);
  const isRecurring = service.service_type === 'recurring';
  
  // Safely format dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return formatDate(dateString);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const safeFormatCurrency = (amount) => {
    if (!amount) return '₱0';
    try {
      return formatCurrency(amount);
    } catch (e) {
      return '₱0';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              Booking #{selectedBooking.id}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: statusColor.bg,
                color: statusColor.text
              }}>
                {statusColor.label}
              </span>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {safeFormatDate(selectedBooking.created_at)}
              </span>
              {isRecurring && (
                <span style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🔄 Recurring Service
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowDetails(false);
              setSelectedBooking(null);
            }}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Customer Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Customer Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Customer Name
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {selectedBooking.name || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Email Address
                </label>
                <div style={{ fontSize: '16px', color: '#111827' }}>
                  {selectedBooking.email || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Phone Number
                </label>
                <div style={{ fontSize: '16px', color: '#111827' }}>
                  {selectedBooking.contact || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Address/Location
                </label>
                <div style={{ fontSize: '16px', color: '#111827' }}>
                  📍 {selectedBooking.location || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Service Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Service Type
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {service.name || selectedBooking.service || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Category
                </label>
                <div style={{ fontSize: '16px', color: '#111827' }}>
                  {service.category || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {isRecurring ? 'Start Date' : 'Service Date'}
                </label>
                <div style={{ fontSize: '16px', color: '#111827' }}>
                  📅 {safeFormatDate(selectedBooking.date)}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Service Type
                </label>
                <div style={{
                  fontSize: '16px',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {service.service_type === 'one_time' ? '🔹 One Time' : 
                   service.service_type === 'recurring' ? '🔄 Recurring' : 
                   service.service_type === 'project' ? '🏗️ Project' : 
                   'Not specified'}
                </div>
              </div>
            </div>
            
            {/* Price Information */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Estimated Cost
                </span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  {safeFormatCurrency(selectedBooking.estimated_cost)}
                </span>
              </div>
              
              {selectedBooking.final_cost && selectedBooking.final_cost !== selectedBooking.estimated_cost && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Final Cost
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                    {safeFormatCurrency(selectedBooking.final_cost)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Technician & Assignment */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Technician Assignment
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Assigned Technician
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {technician.name || 'Not assigned'}
                </div>
                {technician.phone && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    📞 {technician.phone}
                  </div>
                )}
                {technician.specialization && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                    ⚙️ {technician.specialization}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Payment Status
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: selectedBooking.payment_status === 'paid' ? '#10b981' :
                         selectedBooking.payment_status === 'pending' ? '#f59e0b' :
                         selectedBooking.payment_status === 'unpaid' ? '#ef4444' : '#6b7280'
                }}>
                  {selectedBooking.payment_status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Priority
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: selectedBooking.service_priority === 1 ? '#ef4444' : 
                         selectedBooking.service_priority === 2 ? '#f59e0b' : '#10b981'
                }}>
                  {selectedBooking.service_priority === 1 ? '🔴 High Priority' :
                   selectedBooking.service_priority === 2 ? '🟡 Medium Priority' :
                   '🟢 Normal Priority'}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          {selectedBooking.message && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 16px 0',
                paddingBottom: '8px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Customer Message
              </h3>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <p style={{
                  fontSize: '15px',
                  color: '#1e40af',
                  margin: 0,
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  "{selectedBooking.message}"
                </p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {selectedBooking.notes && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 16px 0',
                paddingBottom: '8px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Admin Notes
              </h3>
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #10b981'
              }}>
                <p style={{
                  fontSize: '15px',
                  color: '#065f46',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {selectedBooking.notes}
                </p>
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {selectedBooking.status === 'cancelled' && selectedBooking.cancellation_reason && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ef4444',
                margin: '0 0 16px 0',
                paddingBottom: '8px',
                borderBottom: '2px solid #fecaca'
              }}>
                Cancellation Details
              </h3>
              <div style={{
                backgroundColor: '#fef2f2',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #ef4444'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#991b1b',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>
                    Reason for Cancellation:
                  </label>
                  <div style={{ fontSize: '15px', color: '#111827' }}>
                    {selectedBooking.cancellation_reason}
                  </div>
                </div>
                {selectedBooking.cancelled_at && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#991b1b',
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>
                      Cancelled On:
                    </label>
                    <div style={{ fontSize: '15px', color: '#111827' }}>
                      {safeFormatDate(selectedBooking.cancelled_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setShowDetails(false);
                openChatbox(selectedBooking);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaComments />
              Message Customer
            </button>
            
            <button
              onClick={() => window.open(`tel:${selectedBooking.contact}`)}
              disabled={!selectedBooking.contact}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedBooking.contact ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedBooking.contact ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaPhoneAlt />
              Call Customer
            </button>
            
            <button
              onClick={() => window.open(`mailto:${selectedBooking.email}`)}
              disabled={!selectedBooking.email}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedBooking.email ? '#ec4899' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedBooking.email ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaEnvelopeOpen />
              Email Customer
            </button>

            {/* Status Update Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {getNextStatusOptions(selectedBooking.status).map(nextStatus => (
                nextStatus === 'cancelled' ? (
                  <button
                    key={nextStatus}
                    onClick={() => {
                      setShowDetails(false);
                      setCancellingBooking(selectedBooking);
                      setShowCancelModal(true);
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaTimesCircle />
                    Cancel Booking
                  </button>
                ) : (
                  <button
                    key={nextStatus}
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, nextStatus);
                      setShowDetails(false);
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: nextStatus === 'completed' ? '#10b981' :
                                     nextStatus === 'in_progress' ? '#3b82f6' : '#f3f4f6',
                      color: nextStatus === 'completed' ? 'white' :
                            nextStatus === 'in_progress' ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {nextStatus === 'completed' && <FaCheckCircle />}
                    {nextStatus === 'in_progress' && <FaTools />}
                    Mark as {nextStatus.replace('_', ' ')}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  // Chat button component
  const renderChatButton = (booking) => (
    <button
      onClick={() => openChatbox(booking)}
      style={{
        padding: '8px 12px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
      }}
    >
      <FaComments size={12} />
      Message
    </button>
  );

  // Bulk actions component
  const BulkActions = () => {
    if (selectedBookings.length === 0) return null;
    
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <FaCheckCircle color="#10b981" size={20} />
          <span style={{ fontWeight: '600', fontSize: '16px' }}>
            {selectedBookings.length} booking(s) selected
          </span>
          <button 
            onClick={() => {
              setSelectedBookings([]);
              setShowBulkActions(false);
            }}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleBulkStatusUpdate('scheduled')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaCalendarCheck /> Mark as Scheduled
          </button>
          
          <button
            onClick={() => handleBulkStatusUpdate('in_progress')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaTools /> Mark as In Progress
          </button>
          
          <button
            onClick={() => handleBulkStatusUpdate('completed')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaCheck /> Mark as Completed
          </button>
          
          <button
            onClick={() => {
              setCancellingBooking({ id: 'bulk', name: `${selectedBookings.length} bookings` });
              setShowCancelModal(true);
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaTimesCircle /> Cancel Selected
          </button>
        </div>
      </div>
    );
  };

  

  // Add CSS for spinner animation
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinnerStyle}</style>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              Bookings Management
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Manage customer service bookings and schedules
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          
            
            <button
              onClick={fetchAllData}
              disabled={loading}
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
                opacity: loading ? 0.7 : 1
              }}
            >
              <FaSync style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={exportBookingsToCSV}
              disabled={isExporting}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isExporting ? 0.7 : 1
              }}
            >
              <FaFileCsv />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#fce7f3',
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #EC4899',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCalendarCheck size={20} color="#EC4899" />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                Total Bookings
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {stats.total}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#fffbeb',
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #F59E0B',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaClock size={20} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                Upcoming
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {stats.upcoming}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #3B82F6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaTools size={20} color="#3B82F6" />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                In Progress
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {stats.inProgress}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#d1fae5',
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #10B981',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaDollarSign size={20} color="#10B981" />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                Revenue
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {formatCurrency(stats.revenue)}
            </div>
          </div>
        </div>

        

        {/* Bookings List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {loading ? (
            <div style={{ 
              padding: '48px 16px', 
              textAlign: 'center' 
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }} />
              <p style={{ color: '#6b7280' }}>Loading bookings from database...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ 
              padding: '48px 16px', 
              textAlign: 'center' 
            }}>
              <FaCalendarCheck size={48} color="#d1d5db" />
              <h3 style={{ 
                margin: '16px 0 8px 0', 
                color: '#111827', 
                fontSize: '18px' 
              }}>
                No Bookings Found
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                margin: 0 
              }}>
                {search ? 'No bookings match your search criteria' : 'No bookings available in the database'}
              </p>
              <button
                onClick={fetchAllData}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Bulk selection header */}
              {selectedBookings.length > 0 && (
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCheckCircle />
                    <span style={{ fontWeight: '600' }}>
                      {selectedBookings.length} booking(s) selected
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Bulk Actions
                    </button>
                    <button
                      onClick={() => setSelectedBookings([])}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {bookings.map((booking) => {
                const service = booking.services || {};
                const statusColor = getBookingStatusColor(booking.status);
                const hasMessage = !!booking.message;
                const isRecurring = service.service_type === 'recurring';
                const isSelected = selectedBookings.includes(booking.id);
                
                return (
                  <div key={booking.id} style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    ':hover': {
                      backgroundColor: isSelected ? '#dbeafe' : '#f9fafb'
                    }
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px'
                    }}>
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings(prev => [...prev, booking.id]);
                            setShowBulkActions(true);
                          } else {
                            setSelectedBookings(prev => prev.filter(id => id !== booking.id));
                          }
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      />
                      
                      {/* Booking Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {getServiceIcon(service.category)}
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                              {booking.name || 'Customer'}
                            </span>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}>
                            {statusColor.label}
                          </span>
                          {isRecurring && (
                            <span style={{
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaCalendarWeek size={10} />
                              Recurring
                            </span>
                          )}
                          {hasMessage && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#3b82f6',
                              backgroundColor: '#eff6ff',
                              padding: '4px 8px',
                              borderRadius: '12px'
                            }}>
                              <FaComment size={10} />
                              Has Message
                            </span>
                          )}
                          {booking.service_priority === 1 && (
                            <span style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaExclamationTriangle size={10} />
                              High Priority
                            </span>
                          )}
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginLeft: 'auto'
                          }}>
                            {formatDate(booking.created_at)}
                          </span>
                        </div>
                        
                        {/* Service Info */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaTools size={14} color="#6b7280" />
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                              {service.name || booking.service || 'Service'}
                            </span>
                          </div>
                          {service.category && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              ({service.category})
                            </span>
                          )}
                        </div>
                        
                        {/* Contact & Location */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '16px',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              Contact
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                              📱 {booking.contact || 'No phone'}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              Email
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              {booking.email || 'No email'}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              Location
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              📍 {booking.location || 'Not specified'}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              {isRecurring ? 'Start Date' : 'Service Date'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                              {formatDate(booking.date)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Message Preview */}
                        {booking.message && (
                          <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            borderLeft: '4px solid #3b82f6'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              fontWeight: '600',
                              marginBottom: '4px'
                            }}>
                              Customer Message:
                            </div>
                            <p style={{
                              fontSize: '13px',
                              color: '#4b5563',
                              margin: 0,
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              "{booking.message}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '140px'
                      }}>
                        {renderChatButton(booking)}
                        
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetails(true);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaEye size={12} />
                          View Details
                        </button>
                        
                        {/* Quick status update */}
                        {getNextStatusOptions(booking.status).map(nextStatus => (
                          nextStatus === 'cancelled' ? (
                            <button
                              key={nextStatus}
                              onClick={() => {
                                setCancellingBooking(booking);
                                setShowCancelModal(true);
                              }}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FaTimesCircle size={12} />
                              Cancel
                            </button>
                          ) : (
                            <button
                              key={nextStatus}
                              onClick={() => updateBookingStatus(booking.id, nextStatus)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: nextStatus === 'completed' ? '#10b981' :
                                               nextStatus === 'in_progress' ? '#3b82f6' : '#f3f4f6',
                                color: nextStatus === 'completed' ? 'white' :
                                      nextStatus === 'in_progress' ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {nextStatus === 'completed' && <FaCheckCircle size={12} />}
                              {nextStatus === 'in_progress' && <FaTools size={12} />}
                              {nextStatus.replace('_', ' ')}
                            </button>
                          )
                        ))}
                        
                        {/* Quick Delete Button */}
                        <button
                          onClick={() => quickDeleteBooking(booking.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaTrash size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      
            {BookingDetailsModal()}
      {/* Chatbox */}
      {renderChatbox()}

      {/* Bulk Actions */}
      {showBulkActions && <BulkActions />}

      {/* Cancel Modal */}
      {renderCancelModal()}
    </>
  );
};

// ====================
// SERVICE REVIEWS TAB COMPONENT
// ====================

const ServiceReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchServiceReviews();
  }, [ratingFilter]);

  const fetchServiceReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch from service_reviews table
      let query = supabase
        .from('service_reviews')
        .select(`
          *,
          services (
            id,
            name,
            description,
            price,
            duration
          )
        `)
        .order('created_at', { ascending: false });

      if (ratingFilter !== 'all') {
        query = query.eq('rating', parseInt(ratingFilter));
      }

      if (search) {
        query = query.or(`
          comment.ilike.%${search}%,
          user_name.ilike.%${search}%,
          user_email.ilike.%${search}%,
          services.name.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching service reviews:', error);
        // Try without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('service_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleError) throw simpleError;
        setReviews(simpleData || []);
      } else {
        setReviews(data || []);
      }

    } catch (error) {
      console.error('Error fetching service reviews:', error);
      alert('Error loading service reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      alert('Service review deleted successfully!');
    } catch (error) {
      console.error('Error deleting service review:', error);
      alert('Error deleting service review: ' + error.message);
    }
  };

  const getServiceReviewStats = () => {
    const total = reviews.length;
    const averageRating = total > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
      : 0;
    
    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
    
    // Verified service reviews
    const verifiedReviews = reviews.filter(r => r.is_verified_service).length;
    
    return { total, averageRating, ratingDistribution, verifiedReviews };
  };

  const stats = getServiceReviewStats();

  const renderServiceReviewDetails = (review) => {
    const userName = review.user_name || 'Anonymous';
    const userEmail = review.user_email || 'N/A';
    const serviceName = review.services?.name || `Service #${review.service_id}`;
    const isVerified = review.is_verified_service ? '✅ Verified Service' : '';

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Service Review Details
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Review Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Service
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {serviceName}
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Reviewer
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {userEmail}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Rating
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {review.rating}/5
                  </span>
                </div>
                {isVerified && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#10b981',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isVerified}
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Date & Time
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString()}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Helpful Votes
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaThumbsUp size={16} />
                  {review.helpful_count || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Review Comment
              </h4>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4b5563', 
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {review.comment}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                deleteServiceReview(review.id);
                setShowDetails(false);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaTrash />
              Delete Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            Service Reviews
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            View and manage service reviews
          </p>
        </div>
        
        <button
          onClick={fetchServiceReviews}
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
            gap: '8px'
          }}
        >
          <FaSync />
          Refresh
        </button>
      </div>

      {/* Review Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          icon={FaComment}
          title="Service Reviews"
          value={stats.total}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={FaStar}
          title="Avg. Rating"
          value={stats.averageRating.toFixed(1)}
          color="#F59E0B"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FaTools}
          title="Services Reviewed"
          value={new Set(reviews.map(r => r.service_id)).size}
          color="#EC4899"
          bgColor="#fce7f3"
        />
        <StatCard
          icon={FaShieldAlt}
          title="Verified Reviews"
          value={stats.verifiedReviews}
          color="#10B981"
          bgColor="#d1fae5"
        />
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Search Service Reviews
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search by service name, reviewer name, email, or comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchServiceReviews()}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Rating Filter
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              setSearch('');
              setRatingFilter('all');
              fetchServiceReviews();
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p style={{ color: '#6b7280' }}>Loading service reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <FaTools size={48} color="#d1d5db" />
            <h3 style={{ 
              margin: '16px 0 8px 0', 
              color: '#111827', 
              fontSize: '18px' 
            }}>
              No Service Reviews Found
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px',
              margin: 0 
            }}>
              {search ? 'No service reviews match your search criteria' : 'No service reviews available yet'}
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const userName = review.user_name || 'Anonymous';
            const userEmail = review.user_email || '';
            const serviceName = review.services?.name || `Service #${review.service_id}`;
            const isVerified = review.is_verified_service;
            
            return (
              <div key={review.id} style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                transition: 'background-color 0.2s ease',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px'
                }}>
                  {/* Review Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaTools size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {serviceName}
                        </span>
                      </div>
                      {isVerified && (
                        <span style={{
                          fontSize: '11px',
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: '600'
                        }}>
                          ✓ Verified Service
                        </span>
                      )}
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: 'auto'
                      }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Reviewer & Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaUserCircle size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {userName}
                        </span>
                        {userEmail && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            ({userEmail})
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={14} />
                      {review.helpful_count > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#6b7280',
                          marginLeft: '8px'
                        }}>
                          <FaThumbsUp size={10} />
                          {review.helpful_count}
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Preview */}
                    {review.comment && (
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.5',
                        margin: '12px 0',
                        backgroundColor: '#f9fafb',
                        padding: '12px',
                        borderRadius: '6px'
                      }}>
                        {review.comment.length > 200 ? `${review.comment.substring(0, 200)}...` : review.comment}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minWidth: '140px'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetails(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaEye size={12} />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => deleteServiceReview(review.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaTrash size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Details Modal */}
      {showDetails && selectedReview && renderServiceReviewDetails(selectedReview)}
    </div>
  );
};

// ====================
// PRODUCT REVIEWS TAB COMPONENT
// ====================

const ProductReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProductReviews();
  }, [ratingFilter, statusFilter]);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch from 'reviews' table (for products)
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (ratingFilter !== 'all') {
        query = query.eq('rating', parseInt(ratingFilter));
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        query = query.or(`
          comment.ilike.%${search}%,
          user_name.ilike.%${search}%,
          user_email.ilike.%${search}%,
          products.name.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching product reviews:', error);
        // Try without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleError) throw simpleError;
        setReviews(simpleData || []);
      } else {
        setReviews(data || []);
      }

    } catch (error) {
      console.error('Error fetching product reviews:', error);
      alert('Error loading product reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status } : review
      ));
      
      // Update selected review if it's the current one
      if (selectedReview?.id === reviewId) {
        setSelectedReview(prev => ({ ...prev, status }));
      }
      
      alert(`Review ${status} successfully!`);
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Error updating review status: ' + error.message);
    }
  };

  const deleteProductReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      if (selectedReview?.id === reviewId) {
        setShowDetails(false);
        setSelectedReview(null);
      }
      alert('Product review deleted successfully!');
    } catch (error) {
      console.error('Error deleting product review:', error);
      alert('Error deleting product review: ' + error.message);
    }
  };

  const getProductReviewStats = () => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    
    const averageRating = total > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
      : 0;
    
    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
    
    return { total, pending, approved, rejected, averageRating, ratingDistribution };
  };

  const stats = getProductReviewStats();

  const renderProductReviewDetails = (review) => {
    const userName = review.user_name || 'Anonymous';
    const userEmail = review.user_email || 'N/A';
    const productName = review.products?.name || `Product #${review.product_id}`;
    const productPrice = review.products?.price ? `₱${review.products.price.toLocaleString()}` : 'N/A';

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Product Review Details
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Review Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Product
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {productName}
              </div>
              {productPrice !== 'N/A' && (
                <div style={{ fontSize: '14px', color: '#10b981', marginTop: '2px' }}>
                  {productPrice}
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Reviewer
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {userEmail}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Rating
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {review.rating}/5
                  </span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Status
                </div>
                <ReviewStatusBadge status={review.status} />
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Date & Time
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Review Comment
              </h4>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4b5563', 
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {review.comment}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {review.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    updateReviewStatus(review.id, 'approved');
                    setShowDetails(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaThumbsUp />
                  Approve
                </button>
                
                <button
                  onClick={() => {
                    updateReviewStatus(review.id, 'rejected');
                    setShowDetails(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaThumbsDown />
                  Reject
                </button>
              </>
            )}
            
            <button
              onClick={() => {
                deleteProductReview(review.id);
                setShowDetails(false);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaTrash />
              Delete Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            Product Reviews
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Moderate and manage product reviews
          </p>
        </div>
        
        <button
          onClick={fetchProductReviews}
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
            gap: '8px'
          }}
        >
          <FaSync />
          Refresh
        </button>
      </div>

      {/* Review Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          icon={FaStar}
          title="Total Reviews"
          value={stats.total}
          color="#8B5CF6"
          bgColor="#f5f3ff"
        />
        <StatCard
          icon={FaClock}
          title="Pending"
          value={stats.pending}
          color="#F59E0B"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FaThumbsUp}
          title="Approved"
          value={stats.approved}
          color="#10B981"
          bgColor="#d1fae5"
        />
        <StatCard
          icon={FaThumbsDown}
          title="Rejected"
          value={stats.rejected}
          color="#EF4444"
          bgColor="#fee2e2"
        />
      </div>

      {/* Rating Distribution */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Rating Distribution
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '60px' }}>
                <FaStar color="#F59E0B" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {rating}
                </span>
              </div>
              <div style={{ flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: '#F59E0B',
                    width: `${stats.total > 0 ? (stats.ratingDistribution[rating] / stats.total) * 100 : 0}%`
                  }} 
                />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', width: '40px' }}>
                {stats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Search Reviews
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search by product name, reviewer name, email, or comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchProductReviews()}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Rating Filter
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              setSearch('');
              setRatingFilter('all');
              setStatusFilter('all');
              fetchProductReviews();
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p style={{ color: '#6b7280' }}>Loading product reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ 
            padding: '48px 16px', 
            textAlign: 'center' 
          }}>
            <FaStar size={48} color="#d1d5db" />
            <h3 style={{ 
              margin: '16px 0 8px 0', 
              color: '#111827', 
              fontSize: '18px' 
            }}>
              No Product Reviews Found
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px',
              margin: 0 
            }}>
              {search ? 'No reviews match your search criteria' : 'No product reviews available yet'}
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const userName = review.user_name || 'Anonymous';
            const userEmail = review.user_email || '';
            const productName = review.products?.name || `Product #${review.product_id}`;
            const productImage = review.products?.image_url;
            
            return (
              <div key={review.id} style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                transition: 'background-color 0.2s ease',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px'
                }}>
                  {/* Review Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaShoppingBag size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {productName}
                        </span>
                      </div>
                      <ReviewStatusBadge status={review.status} />
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: 'auto'
                      }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Reviewer & Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaUserCircle size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {userName}
                        </span>
                        {userEmail && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            ({userEmail})
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    
                    {/* Comment Preview */}
                    {review.comment && (
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.5',
                        margin: '12px 0',
                        backgroundColor: '#f9fafb',
                        padding: '12px',
                        borderRadius: '6px'
                      }}>
                        {review.comment.length > 200 ? `${review.comment.substring(0, 200)}...` : review.comment}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minWidth: '140px'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetails(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaEye size={12} />
                      View Details
                    </button>
                    
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaThumbsUp size={12} />
                          Approve
                        </button>
                        
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaThumbsDown size={12} />
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => deleteProductReview(review.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaTrash size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Details Modal */}
      {showDetails && selectedReview && renderProductReviewDetails(selectedReview)}
    </div>
  );
};

// ====================
// MAIN SALES MANAGEMENT COMPONENT
// ====================
const SalesManagement = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    productReviews: 0,
    serviceReviews: 0,
    pendingProductReviews: 0,
    pendingServiceReviews: 0,
    averageProductRating: 0,
    averageServiceRating: 0
  });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    upcomingBookings: 0
  });

  // Fetch all statistics
  const fetchAllStats = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Fetch product reviews stats from 'reviews' table
      const { data: productReviews, error: productError } = await supabase
        .from('reviews')
        .select('rating, status');
      
      // Fetch service reviews stats from 'service_reviews' table
      const { data: serviceReviews, error: serviceError } = await supabase
        .from('service_reviews')
        .select('rating, status');

      // Fetch order stats
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('status, total');

      // Fetch booking stats
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('status, booking_date');

      if (productError) console.error('Error fetching product reviews:', productError);
      if (serviceError) console.error('Error fetching service reviews:', serviceError);
      if (orderError) console.error('Error fetching orders:', orderError);
      if (bookingError) console.error('Error fetching bookings:', bookingError);

      const productReviewsData = productReviews || [];
      const serviceReviewsData = serviceReviews || [];
      const ordersData = orders || [];
      const bookingsData = bookings || [];

      // Calculate review stats
      const pendingProductReviews = productReviewsData.filter(r => r.status === 'pending').length;
      const pendingServiceReviews = serviceReviewsData.filter(r => r.status === 'pending').length;
      
      const avgProductRating = productReviewsData.length > 0
        ? productReviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / productReviewsData.length
        : 0;
      
      const avgServiceRating = serviceReviewsData.length > 0
        ? serviceReviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / serviceReviewsData.length
        : 0;

      // Calculate order stats
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const totalRevenue = ordersData
        .filter(o => o.status === 'completed' || o.status === 'confirmed')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Calculate booking stats
      const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
      const upcomingBookings = bookingsData.filter(b => 
        b.status === 'confirmed' && 
        b.booking_date && 
        new Date(b.booking_date) > new Date()
      ).length;

      setReviewStats({
        productReviews: productReviewsData.length,
        serviceReviews: serviceReviewsData.length,
        pendingProductReviews,
        pendingServiceReviews,
        averageProductRating: avgProductRating,
        averageServiceRating: avgServiceRating
      });

      setOrderStats({
        totalOrders: ordersData.length,
        pendingOrders,
        totalRevenue
      });

      setBookingStats({
        totalBookings: bookingsData.length,
        pendingBookings,
        upcomingBookings
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAllStats();
      setLoading(false);
    };
    loadData();
  }, [fetchAllStats]);

  const tabs = [
    { key: 'orders', icon: <FaShoppingBag />, label: 'Orders', badge: orderStats.pendingOrders },
    { key: 'bookings', icon: <FaCalendarCheck />, label: 'Bookings', badge: bookingStats.pendingBookings },
    { key: 'product-reviews', icon: <FaStar />, label: 'Product Reviews', badge: reviewStats.pendingProductReviews },
    { key: 'service-reviews', icon: <FaTools />, label: 'Service Reviews', badge: reviewStats.pendingServiceReviews },
  ];

  // Loading state for the entire component
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '20px',
        background: '#f9fafb'
      }}>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: '#6b7280', fontSize: '16px' }}>
          Loading sales data...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px rgba(30, 58, 138, 0.15)',
        color: 'white',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.5px',
            }}>
              <FaShoppingBag style={{ marginRight: '12px' }} />
              Sales & Reviews Management
            </h1>
            <p style={{
              fontSize: '16px',
              opacity: 0.9,
              margin: 0,
              fontWeight: '400'
            }}>
              Manage orders, bookings, and customer reviews in one place
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchAllStats().finally(() => {
                  setRefreshing(false);
                });
              }}
              disabled={refreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                opacity: refreshing ? 0.7 : 1
              }}
            >
              <FaSync style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
              {refreshing ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          icon={FaShoppingBag}
          title="Total Orders"
          value={orderStats.totalOrders}
          color="#3b82f6"
          bgColor="#eff6ff"
          subtitle={`${orderStats.pendingOrders}  • ₱${orderStats.totalRevenue.toLocaleString()} revenue`}
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          icon={FaCalendarCheck}
          title="Total Bookings"
          value={bookingStats.totalBookings}
          color="#EC4899"
          bgColor="#fce7f3"
          subtitle={`${bookingStats.pendingBookings} pending • ${bookingStats.upcomingBookings} upcoming`}
          onClick={() => setActiveTab('bookings')}
        />
        <StatCard
          icon={FaStar}
          title="Product Reviews"
          value={reviewStats.productReviews}
          color="#8B5CF6"
          bgColor="#f5f3ff"
          subtitle={`${reviewStats.pendingProductReviews} pending • Avg: ${reviewStats.averageProductRating.toFixed(1)}⭐`}
          onClick={() => setActiveTab('product-reviews')}
        />
        <StatCard
          icon={FaTools}
          title="Service Reviews"
          value={reviewStats.serviceReviews}
          color="#10B981"
          bgColor="#d1fae5"
          subtitle={`${reviewStats.pendingServiceReviews} pending • Avg: ${reviewStats.averageServiceRating.toFixed(1)}⭐`}
          onClick={() => setActiveTab('service-reviews')}
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flex: 1,
              justifyContent: 'center',
              minWidth: '140px',
              position: 'relative',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)' : 'transparent',
              color: activeTab === tab.key ? '#ffffff' : '#023e8a',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span style={{ fontSize: '15px' }}>{tab.label}</span>
            {tab.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ef4444',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        minHeight: '500px'
      }}>
        {activeTab === 'orders' && <OrdersManagementTab />}
        {activeTab === 'bookings' && <BookingsManagementTab />}
        {activeTab === 'product-reviews' && <ProductReviewsTab />}
        {activeTab === 'service-reviews' && <ServiceReviewsTab />}
      </div>
    </div>
  );
};

export default SalesManagement;