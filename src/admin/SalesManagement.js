import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  FaTimes, FaPhoneAlt, FaEnvelopeOpen, FaComments, FaPaperPlane,
  FaCalendarCheck, FaShoppingBag, FaQuestionCircle, FaFileInvoice, 
  FaUsers, FaChartBar, FaDollarSign, FaShoppingCart, FaCheckCircle,
  FaClock, FaTimesCircle, FaArrowUp, FaArrowDown, FaSearch, FaFilter,
  FaPrint, FaDownload, FaEye, FaTrash, FaEdit, FaPlus, FaChartLine,
  FaStore, FaMobileAlt, FaTools, FaCar, FaCarAlt, FaOilCan, FaShieldAlt,
  FaUserCircle, FaTag, FaSync, FaPhone, FaEnvelope, FaUser, FaBox,
  FaStar, FaThumbsUp, FaThumbsDown, FaStarHalfAlt, FaRegStar, FaComment,
  FaExclamationCircle, FaCalendarAlt, FaSort, FaSortUp, FaSortDown,
  FaReceipt, FaCreditCard, FaTruck, FaMapMarkerAlt, FaListAlt, FaSwimmingPool,
  FaWrench, FaPaintRoller, FaTint, FaLeaf, FaCalendarDay, FaCalendar,
  FaList, FaCalendarWeek, FaUserPlus, FaCheck, FaChevronDown, FaFileCsv,
  FaBan, FaExclamationTriangle, FaReply
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
      cursor: onClick ? 'pointer' : 'default'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
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
// REVIEW REPLY MODAL COMPONENT (FIXED)
// ====================

const ReviewReplyModal = ({ review, onClose, onReplySent, isServiceReview = false }) => {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [existingReply, setExistingReply] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExistingReply();
  }, [review.id, isServiceReview]);

  const fetchExistingReply = async () => {
    try {
      const tableName = isServiceReview ? 'service_review_replies' : 'review_replies';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('review_id', review.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExistingReply(data);
        setReplyText(data.reply_text);
      }
    } catch (error) {
      console.error('Error fetching existing reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      setSending(true);
      
      const replyData = {
        review_id: review.id,
        reply_text: replyText.trim(),
        admin_name: 'Admin',
        updated_at: new Date().toISOString()
      };

      let result;
      const tableName = isServiceReview ? 'service_review_replies' : 'review_replies';

      if (existingReply) {
        // Update existing reply
        result = await supabase
          .from(tableName)
          .update(replyData)
          .eq('id', existingReply.id);
      } else {
        // Insert new reply
        replyData.created_at = new Date().toISOString();
        result = await supabase
          .from(tableName)
          .insert([replyData]);
      }

      if (result.error) throw result.error;

      // Also update the review's replied status
      const reviewTable = isServiceReview ? 'service_reviews' : 'reviews';
      await supabase
        .from(reviewTable)
        .update({ 
          admin_replied: true,
          admin_replied_at: new Date().toISOString()
        })
        .eq('id', review.id);

      alert(existingReply ? 'Reply updated successfully!' : 'Reply sent successfully!');
      onReplySent();
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // FIXED: Proper delete function for review reply modal
  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review and all associated replies? This action cannot be undone.')) return;

    try {
      const reviewTable = isServiceReview ? 'service_reviews' : 'reviews';
      const repliesTable = isServiceReview ? 'service_review_replies' : 'review_replies';
      
      // First delete any replies
      const { error: repliesError } = await supabase
        .from(repliesTable)
        .delete()
        .eq('review_id', review.id);
      
      if (repliesError) {
        console.error('Error deleting replies:', repliesError);
      }

      // Delete conversations if they exist
      const conversationsTable = isServiceReview ? 'service_review_conversations' : 'review_conversations';
      const { error: convError } = await supabase
        .from(conversationsTable)
        .delete()
        .eq('review_id', review.id);
      
      if (convError && convError.code !== '42P01') {
        console.error('Error deleting conversations:', convError);
      }

      // Finally delete the review
      const { error } = await supabase
        .from(reviewTable)
        .delete()
        .eq('id', review.id);

      if (error) throw error;

      alert('Review deleted successfully!');
      onReplySent();
      onClose();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review: ' + error.message);
    }
  };

  if (loading) {
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
        zIndex: 1000
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          Loading...
        </div>
      </div>
    );
  }

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
            {existingReply ? 'Edit Reply' : 'Reply to Review'}
          </h3>
          <button
            onClick={onClose}
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

        {/* Original Review */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {review.user_name || 'Anonymous'}
                </span>
                <div style={{ marginTop: '4px' }}>
                  <StarRating rating={review.rating} size={12} />
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', lineHeight: '1.5' }}>
                {review.comment}
              </p>
            )}
          </div>
        </div>

        {/* Reply Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Your Reply
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply to this review..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Existing Reply Info */}
        {existingReply && (
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#1e40af'
          }}>
            <strong>Previously replied on:</strong> {new Date(existingReply.created_at).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDeleteReview}
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
          
          <button
            onClick={onClose}
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
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            style={{
              padding: '12px 24px',
              backgroundColor: replyText.trim() ? '#3b82f6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: replyText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {sending ? (
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
                <FaReply />
                {existingReply ? 'Update Reply' : 'Send Reply'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  }, [filter, search]);

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
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px 12px 10px 36px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                width: '250px'
              }}
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
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
      </div>

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

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
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
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <FaShoppingBag size={48} color="#d1d5db" />
            <h3 style={{ margin: '16px 0 8px 0', color: '#111827', fontSize: '18px' }}>
              No Orders Found
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
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
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px'
                }}>
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
                        gap: '6px'
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
                            gap: '6px'
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
                            gap: '6px'
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
                          gap: '6px'
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
                        gap: '6px'
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

      {showDetails && selectedOrder && renderOrderDetails(selectedOrder)}
    </div>
  );
};

// ====================
// BOOKINGS MANAGEMENT TAB
// ====================

const BookingsManagementTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
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
    { id: 'other', label: 'Other', description: 'Other reason (specify below)' }
  ];

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, search]);

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
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
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
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openChatbox = async (booking) => {
    setSelectedBooking(booking);
    await fetchChatMessages(booking.id);
    setShowChatbox(true);
  };

  const closeChatbox = () => {
    setShowChatbox(false);
    setChatMessages([]);
    setNewMessage('');
  };

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
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ));
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, ...updates }));
      }
      
      alert(`Booking status updated to ${newStatus.replace('_', ' ')}`);
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking: ' + error.message);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
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

  const stats = useMemo(() => {
    const total = bookings.length;
    const requested = bookings.filter(b => b.status === 'requested').length;
    const scheduled = bookings.filter(b => b.status === 'scheduled').length;
    const inProgress = bookings.filter(b => b.status === 'in_progress').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.final_cost) || parseFloat(b.estimated_cost) || 0), 0);
    const upcoming = bookings.filter(b => 
      (b.status === 'scheduled' || b.status === 'in_progress') && 
      b.booking_date && new Date(b.booking_date) >= new Date()
    ).length;

    return { total, requested, scheduled, inProgress, completed, cancelled, revenue, upcoming };
  }, [bookings]);

  const renderChatbox = () => {
    if (!showChatbox || !selectedBooking) return null;

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
              Chat with {selectedBooking.customer_name || 'Customer'}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              Booking #{selectedBooking.id}
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
                outline: 'none'
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
        </div>
      </div>
    );
  };

  const renderBookingDetails = () => {
    if (!showDetails || !selectedBooking) return null;

    const service = selectedBooking.services || {};
    const statusColor = getBookingStatusColor(selectedBooking.status);

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
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
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

          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Customer Name</label>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{selectedBooking.customer_name || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Email Address</label>
                  <div style={{ fontSize: '16px', color: '#111827' }}>{selectedBooking.customer_email || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Phone Number</label>
                  <div style={{ fontSize: '16px', color: '#111827' }}>{selectedBooking.customer_phone || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Address/Location</label>
                  <div style={{ fontSize: '16px', color: '#111827' }}>📍 {selectedBooking.address || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                Service Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Service Type</label>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{service.name || selectedBooking.service || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Service Date</label>
                  <div style={{ fontSize: '16px', color: '#111827' }}>📅 {formatDate(selectedBooking.booking_date)}</div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Estimated Cost</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>₱{parseFloat(selectedBooking.estimated_cost || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedBooking.message && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                  Customer Message
                </h3>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ fontSize: '15px', color: '#1e40af', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                    "{selectedBooking.message}"
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '24px', flexWrap: 'wrap' }}>
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
                onClick={() => {
                  if (selectedBooking.status !== 'cancelled') {
                    updateBookingStatus(selectedBooking.id, 'cancelled');
                    setShowDetails(false);
                  }
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
              
              <button
                onClick={() => deleteBooking(selectedBooking.id)}
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
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            Bookings Management
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Manage customer service bookings and schedules
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '250px' }}
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
          >
            <option value="all">All Bookings</option>
            <option value="requested">Requested</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button
            onClick={fetchBookings}
            style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={FaCalendarCheck} title="Total Bookings" value={stats.total} color="#EC4899" bgColor="#fce7f3" />
        <StatCard icon={FaClock} title="Requested" value={stats.requested} color="#F59E0B" bgColor="#fffbeb" />
        <StatCard icon={FaTools} title="In Progress" value={stats.inProgress} color="#3B82F6" bgColor="#eff6ff" />
        <StatCard icon={FaDollarSign} title="Revenue" value={`₱${stats.revenue.toLocaleString()}`} color="#10B981" bgColor="#d1fae5" />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ color: '#6b7280' }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <FaCalendarCheck size={48} color="#d1d5db" />
            <h3 style={{ margin: '16px 0 8px 0', color: '#111827', fontSize: '18px' }}>No Bookings Found</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No bookings available in the database</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const service = booking.services || {};
            const statusColor = getBookingStatusColor(booking.status);
            
            return (
              <div key={booking.id} style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaTools size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{booking.customer_name || 'Customer'}</span>
                      </div>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: statusColor.bg, color: statusColor.text }}>
                        {statusColor.label}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>{formatDate(booking.created_at)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaTools size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{service.name || booking.service || 'Service'}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Contact</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>📱 {booking.customer_phone || 'No phone'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Service Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatDate(booking.booking_date)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Estimated Cost</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>₱{parseFloat(booking.estimated_cost || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {booking.message && (
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                        <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.4' }}>"{booking.message.substring(0, 100)}..."</p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                    <button
                      onClick={() => openChatbox(booking)}
                      style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaComments size={12} />
                      Message
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetails(true);
                      }}
                      style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaEye size={12} />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
      
      {renderChatbox()}
      {renderBookingDetails()}
    </div>
  );
};

// ====================
// REVIEW CONVERSATION VIEWER COMPONENT
// ====================

const ReviewConversationViewer = ({ reviewId, adminReply, onReplySent }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [reviewId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_conversations')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      setSending(true);
      
      const { data, error } = await supabase
        .from('review_conversations')
        .insert([{
          review_id: reviewId,
          parent_id: null,
          user_id: null,
          user_name: 'Admin',
          message: replyMessage.trim(),
          is_admin: true,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setConversations(prev => [...prev, data[0]]);
      setReplyMessage('');
      setShowReplyForm(false);
      alert('Reply sent successfully!');
      if (onReplySent) onReplySent();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const totalReplies = (adminReply ? 1 : 0) + conversations.length;

  if (totalReplies === 0) return null;

  return (
    <div style={{
      marginTop: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#e9ecef',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: expanded ? '1px solid #dee2e6' : 'none'
        }}
      >
        <FaComments size={14} color="#6c757d" />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#495057' }}>
          {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {expanded ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '16px' }}>
          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          )}

          {/* Admin's original reply */}
          {!loading && adminReply && (
            <div style={{
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              borderLeft: '3px solid #2196f3'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <FaUserCircle size={14} color="#2196f3" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2' }}>Admin</span>
                <span style={{ fontSize: '10px', color: '#6c757d', marginLeft: 'auto' }}>
                  {new Date(adminReply.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.5' }}>
                {adminReply.reply_text}
              </p>
            </div>
          )}

          {/* User replies and admin replies */}
          {!loading && conversations.map(conv => (
            <div key={conv.id} style={{
              backgroundColor: conv.is_admin ? '#e3f2fd' : '#fff3e0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              borderLeft: conv.is_admin ? '3px solid #2196f3' : '3px solid #ff9800',
              marginLeft: conv.parent_id ? '20px' : '0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                {conv.is_admin ? (
                  <>
                    <FaUserCircle size={14} color="#2196f3" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2' }}>Admin</span>
                  </>
                ) : (
                  <>
                    <FaUserCircle size={14} color="#ff9800" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#e65100' }}>
                      {conv.user_name || 'Customer'}
                    </span>
                  </>
                )}
                <span style={{ fontSize: '10px', color: '#6c757d', marginLeft: 'auto' }}>
                  {new Date(conv.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.5' }}>
                {conv.message}
              </p>
            </div>
          ))}

          {/* Admin reply form */}
          {!loading && !showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#2196f3',
                border: '1px dashed #2196f3',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <FaReply size={12} />
              Reply to Customer
            </button>
          ) : !loading && showReplyForm && (
            <div style={{ marginTop: '12px' }}>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '13px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyMessage('');
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f8f9fa',
                    color: '#6c757d',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || sending}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: !replyMessage.trim() || sending ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: !replyMessage.trim() || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {sending ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={10} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ====================
// PRODUCT REVIEWS TAB COMPONENT (FIXED)
// ====================

const ProductReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replies, setReplies] = useState({});
  const [conversations, setConversations] = useState({});

  useEffect(() => {
    fetchProductReviews();
  }, [ratingFilter, statusFilter, search]);

  // FIXED: Proper fetch function that doesn't filter out deleted reviews (since we actually delete them)
  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reviews')
        .select('*')
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
          user_email.ilike.%${search}%
        `);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching product reviews:', error);
        setReviews([]);
      } else {
        setReviews(data || []);
        await fetchAllReplies(data || []);
        await fetchConversationsForReviews(data || []);
      }

    } catch (error) {
      console.error('Error fetching product reviews:', error);
      alert('Error loading product reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReplies = async (reviewsData) => {
    try {
      const replyPromises = reviewsData.map(review => 
        supabase
          .from('review_replies')
          .select('*')
          .eq('review_id', review.id)
          .maybeSingle()
      );
      
      const results = await Promise.all(replyPromises);
      const repliesMap = {};
      results.forEach((result, index) => {
        if (result.data) {
          repliesMap[reviewsData[index].id] = result.data;
        }
      });
      setReplies(repliesMap);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const fetchConversationsForReviews = async (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) return;
    
    try {
      const reviewIds = reviewsData.map(review => review.id);
      const { data, error } = await supabase
        .from('review_conversations')
        .select('*')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const conversationsMap = {};
      data?.forEach(conv => {
        if (!conversationsMap[conv.review_id]) {
          conversationsMap[conv.review_id] = [];
        }
        conversationsMap[conv.review_id].push(conv);
      });
      setConversations(conversationsMap);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
      
      if (selectedReview?.id === reviewId) {
        setSelectedReview(prev => ({ ...prev, status }));
      }
      
      alert(`Review ${status} successfully!`);
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Error updating review status: ' + error.message);
    }
  };

  // FIXED: Proper delete function that actually removes from database
  const deleteProductReview = async (reviewId) => {
    console.log('🔍 Delete function called for review ID:', reviewId);
    
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      console.log('User cancelled');
      return;
    }
    
    try {
      // First, delete any replies associated with this review
      const { error: repliesError } = await supabase
        .from('review_replies')
        .delete()
        .eq('review_id', reviewId);
      
      if (repliesError) {
        console.error('Error deleting replies:', repliesError);
      }

      // Delete any conversations associated with this review
      const { error: conversationsError } = await supabase
        .from('review_conversations')
        .delete()
        .eq('review_id', reviewId);
      
      if (conversationsError && conversationsError.code !== '42P01') {
        console.error('Error deleting conversations:', conversationsError);
      }

      // Finally, delete the review itself
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      // Update local state by filtering out the deleted review
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      if (selectedReview?.id === reviewId) {
        setShowDetails(false);
        setSelectedReview(null);
      }
      
      alert('Product review and all associated data deleted successfully!');
      
      // Refresh to ensure consistency
      await fetchProductReviews();
      
    } catch (error) {
      console.error('Error deleting product review:', error);
      alert('Error deleting product review: ' + error.message);
    }
  };

  const handleReplySent = () => {
    fetchProductReviews();
  };

  const getProductReviewStats = () => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    
    const averageRating = total > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
      : 0;
    
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
    const productName = `Review #${review.id.substring(0, 8)}`;
    const hasReply = !!replies[review.id];

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
              Review Details
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

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Review ID</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{productName}</div>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Reviewer</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>{userName}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{userEmail}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{review.rating}/5</span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                <ReviewStatusBadge status={review.status} />
              </div>
            </div>
          </div>

          {review.comment && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Review Comment</h4>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {review.comment}
                </p>
              </div>
            </div>
          )}

          {hasReply && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaReply />
                Admin Reply
              </h4>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <p style={{ fontSize: '14px', color: '#065f46', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {replies[review.id].reply_text}
                </p>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  Replied on: {new Date(replies[review.id].created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <ReviewConversationViewer 
            reviewId={review.id}
            adminReply={replies[review.id]}
            onReplySent={() => {
              fetchProductReviews();
            }}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setSelectedReview(review);
                setShowReplyModal(true);
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
              <FaReply />
              {hasReply ? 'Edit Reply' : 'Reply to Review'}
            </button>
            
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
              onClick={() => deleteProductReview(review.id)}
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Product Reviews</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Moderate and manage product reviews</p>
        </div>
        
        <button onClick={fetchProductReviews} style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSync /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={FaStar} title="Total Reviews" value={stats.total} color="#8B5CF6" bgColor="#f5f3ff" />
        <StatCard icon={FaClock} title="Pending" value={stats.pending} color="#F59E0B" bgColor="#fffbeb" />
        <StatCard icon={FaThumbsUp} title="Approved" value={stats.approved} color="#10B981" bgColor="#d1fae5" />
        <StatCard icon={FaThumbsDown} title="Rejected" value={stats.rejected} color="#EF4444" bgColor="#fee2e2" />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Search Reviews</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Search by product name, reviewer name, email, or comment..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && fetchProductReviews()} 
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              />
            </div>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Rating Filter</label>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Status Filter</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button onClick={() => { setSearch(''); setRatingFilter('all'); setStatusFilter('all'); fetchProductReviews(); }} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter /> Clear Filters
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ color: '#6b7280' }}>Loading product reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <FaStar size={48} color="#d1d5db" />
            <h3 style={{ margin: '16px 0 8px 0', color: '#111827', fontSize: '18px' }}>No Product Reviews Found</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{search ? 'No reviews match your search criteria' : 'No product reviews available yet'}</p>
          </div>
        ) : (
          reviews.map((review) => {
            const userName = review.user_name || 'Anonymous';
            const productName = `Review #${review.id.substring(0, 8)}`;
            const hasReply = !!replies[review.id];
            
            return (
              <div key={review.id} style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaShoppingBag size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{productName}</span>
                      </div>
                      <ReviewStatusBadge status={review.status} />
                      {hasReply && <span style={{ fontSize: '11px', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><FaReply size={10} /> Replied</span>}
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserCircle size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{userName}</span>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    
                    {review.comment && (
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: '12px 0', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                        {review.comment.length > 200 ? `${review.comment.substring(0, 200)}...` : review.comment}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                    <button onClick={() => { setSelectedReview(review); setShowDetails(true); }} style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaEye size={12} /> View Details
                    </button>
                    
                    <button onClick={() => { setSelectedReview(review); setShowReplyModal(true); }} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaReply size={12} /> {hasReply ? 'Edit Reply' : 'Reply'}
                    </button>
                    
                    {review.status === 'pending' && (
                      <>
                        <button onClick={() => updateReviewStatus(review.id, 'approved')} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <FaThumbsUp size={12} /> Approve
                        </button>
                        
                        <button onClick={() => updateReviewStatus(review.id, 'rejected')} style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <FaThumbsDown size={12} /> Reject
                        </button>
                      </>
                    )}
                    
                    <button onClick={() => deleteProductReview(review.id)} style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetails && selectedReview && renderProductReviewDetails(selectedReview)}
      {showReplyModal && selectedReview && (
        <ReviewReplyModal
          review={selectedReview}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          onReplySent={() => {
            handleReplySent();
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          isServiceReview={false}
        />
      )}
    </div>
  );
};

// ====================
// SERVICE REVIEWS TAB COMPONENT (FIXED)
// ====================

const ServiceReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    fetchServiceReviews();
  }, [ratingFilter, search]);

  const fetchServiceReviews = async () => {
    try {
      setLoading(true);
      
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
        const { data: simpleData, error: simpleError } = await supabase
          .from('service_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleError) throw simpleError;
        setReviews(simpleData || []);
      } else {
        setReviews(data || []);
        await fetchAllReplies(data || []);
      }

    } catch (error) {
      console.error('Error fetching service reviews:', error);
      alert('Error loading service reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReplies = async (reviewsData) => {
    try {
      const replyPromises = reviewsData.map(review => 
        supabase
          .from('service_review_replies')
          .select('*')
          .eq('review_id', review.id)
          .maybeSingle()
      );
      
      const results = await Promise.all(replyPromises);
      const repliesMap = {};
      results.forEach((result, index) => {
        if (result.data) {
          repliesMap[reviewsData[index].id] = result.data;
        }
      });
      setReplies(repliesMap);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  // FIXED: Proper delete function for service reviews
  const deleteServiceReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      // Delete replies associated with this service review
      const { error: repliesError } = await supabase
        .from('service_review_replies')
        .delete()
        .eq('review_id', reviewId);
      
      if (repliesError) {
        console.error('Error deleting replies:', repliesError);
      }

      // Delete conversations if they exist for service reviews
      const { error: conversationsError } = await supabase
        .from('service_review_conversations')
        .delete()
        .eq('review_id', reviewId);
      
      if (conversationsError && conversationsError.code !== '42P01') {
        console.error('Error deleting conversations:', conversationsError);
      }

      // Delete the service review itself
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      if (selectedReview?.id === reviewId) {
        setShowDetails(false);
        setSelectedReview(null);
      }
      
      alert('Service review and all associated replies deleted successfully!');
      
      // Refresh the list
      await fetchServiceReviews();
      
    } catch (error) {
      console.error('Error deleting service review:', error);
      alert('Error deleting service review: ' + error.message);
    }
  };

  const handleReplySent = () => {
    fetchServiceReviews();
  };

  const getServiceReviewStats = () => {
    const total = reviews.length;
    const averageRating = total > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
      : 0;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
    
    const verifiedReviews = reviews.filter(r => r.is_verified_service).length;
    
    return { total, averageRating, ratingDistribution, verifiedReviews };
  };

  const stats = getServiceReviewStats();

  const renderServiceReviewDetails = (review) => {
    const userName = review.user_name || 'Anonymous';
    const userEmail = review.user_email || 'N/A';
    const serviceName = review.services?.name || `Service #${review.service_id}`;
    const isVerified = review.is_verified_service ? '✅ Verified Service' : '';
    const hasReply = !!replies[review.id];

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

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Service</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{serviceName}</div>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Reviewer</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>{userName}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{userEmail}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{review.rating}/5</span>
                </div>
                {isVerified && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isVerified}
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date & Time</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                  {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString()}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Helpful Votes</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaThumbsUp size={16} /> {review.helpful_count || 0}
                </div>
              </div>
            </div>
          </div>

          {review.comment && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Review Comment</h4>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{review.comment}</p>
              </div>
            </div>
          )}

          {hasReply && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaReply /> Admin Reply
              </h4>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <p style={{ fontSize: '14px', color: '#065f46', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {replies[review.id].reply_text}
                </p>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  Replied on: {new Date(replies[review.id].created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setSelectedReview(review);
                setShowReplyModal(true);
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
              <FaReply />
              {hasReply ? 'Edit Reply' : 'Reply to Review'}
            </button>
            
            <button
              onClick={() => deleteServiceReview(review.id)}
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Service Reviews</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>View and manage service reviews</p>
        </div>
        
        <button onClick={fetchServiceReviews} style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSync /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={FaComment} title="Service Reviews" value={stats.total} color="#3b82f6" bgColor="#eff6ff" />
        <StatCard icon={FaStar} title="Avg. Rating" value={stats.averageRating.toFixed(1)} color="#F59E0B" bgColor="#fffbeb" />
        <StatCard icon={FaTools} title="Services Reviewed" value={new Set(reviews.map(r => r.service_id)).size} color="#EC4899" bgColor="#fce7f3" />
        <StatCard icon={FaShieldAlt} title="Verified Reviews" value={stats.verifiedReviews} color="#10B981" bgColor="#d1fae5" />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Search Service Reviews</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
              <input type="text" placeholder="Search by service name, reviewer name, email, or comment..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchServiceReviews()} style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Rating Filter</label>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <button onClick={() => { setSearch(''); setRatingFilter('all'); fetchServiceReviews(); }} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter /> Clear Filters
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ color: '#6b7280' }}>Loading service reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <FaTools size={48} color="#d1d5db" />
            <h3 style={{ margin: '16px 0 8px 0', color: '#111827', fontSize: '18px' }}>No Service Reviews Found</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{search ? 'No service reviews match your search criteria' : 'No service reviews available yet'}</p>
          </div>
        ) : (
          reviews.map((review) => {
            const userName = review.user_name || 'Anonymous';
            const serviceName = review.services?.name || `Service #${review.service_id}`;
            const isVerified = review.is_verified_service;
            const hasReply = !!replies[review.id];
            
            return (
              <div key={review.id} style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaTools size={16} color="#6b7280" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{serviceName}</span>
                      </div>
                      {isVerified && <span style={{ fontSize: '11px', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>✓ Verified Service</span>}
                      {hasReply && <span style={{ fontSize: '11px', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><FaReply size={10} /> Replied</span>}
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserCircle size={14} color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{userName}</span>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                      {review.helpful_count > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                          <FaThumbsUp size={10} /> {review.helpful_count}
                        </div>
                      )}
                    </div>
                    
                    {review.comment && (
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: '12px 0', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                        {review.comment.length > 200 ? `${review.comment.substring(0, 200)}...` : review.comment}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                    <button onClick={() => { setSelectedReview(review); setShowDetails(true); }} style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaEye size={12} /> View Details
                    </button>
                    
                    <button onClick={() => { setSelectedReview(review); setShowReplyModal(true); }} style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaReply size={12} /> {hasReply ? 'Edit Reply' : 'Reply'}
                    </button>
                    
                    <button onClick={() => deleteServiceReview(review.id)} style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetails && selectedReview && renderServiceReviewDetails(selectedReview)}
      {showReplyModal && selectedReview && (
        <ReviewReplyModal
          review={selectedReview}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          onReplySent={() => {
            handleReplySent();
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          isServiceReview={true}
        />
      )}
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

  const fetchAllStats = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const { data: productReviews, error: productError } = await supabase
        .from('reviews')
        .select('rating, status');
      
      const { data: serviceReviews, error: serviceError } = await supabase
        .from('service_reviews')
        .select('rating, status');

      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('status, total');

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

      const pendingProductReviews = productReviewsData.filter(r => r.status === 'pending').length;
      const pendingServiceReviews = serviceReviewsData.filter(r => r.status === 'pending').length;
      
      const avgProductRating = productReviewsData.length > 0
        ? productReviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / productReviewsData.length
        : 0;
      
      const avgServiceRating = serviceReviewsData.length > 0
        ? serviceReviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / serviceReviewsData.length
        : 0;

      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const totalRevenue = ordersData
        .filter(o => o.status === 'completed' || o.status === 'confirmed')
        .reduce((sum, o) => sum + (o.total || 0), 0);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px', background: '#f9fafb' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading sales data...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 10px 25px rgba(30, 58, 138, 0.15)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', letterSpacing: '-0.5px' }}>
              <FaShoppingBag style={{ marginRight: '12px' }} />
              Sales & Reviews Management
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0, fontWeight: '400' }}>Manage orders, bookings, and customer reviews in one place</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button onClick={() => { setRefreshing(true); fetchAllStats().finally(() => setRefreshing(false)); }} disabled={refreshing} style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', opacity: refreshing ? 0.7 : 1 }}>
              <FaSync style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
              {refreshing ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={FaShoppingBag} title="Total Orders" value={orderStats.totalOrders} color="#3b82f6" bgColor="#eff6ff" subtitle={`${orderStats.pendingOrders} pending • ₱${orderStats.totalRevenue.toLocaleString()} revenue`} onClick={() => setActiveTab('orders')} />
        <StatCard icon={FaCalendarCheck} title="Total Bookings" value={bookingStats.totalBookings} color="#EC4899" bgColor="#fce7f3" subtitle={`${bookingStats.pendingBookings} pending • ${bookingStats.upcomingBookings} upcoming`} onClick={() => setActiveTab('bookings')} />
        <StatCard icon={FaStar} title="Product Reviews" value={reviewStats.productReviews} color="#8B5CF6" bgColor="#f5f3ff" subtitle={`${reviewStats.pendingProductReviews} pending • Avg: ${reviewStats.averageProductRating.toFixed(1)}⭐`} onClick={() => setActiveTab('product-reviews')} />
        <StatCard icon={FaTools} title="Service Reviews" value={reviewStats.serviceReviews} color="#10B981" bgColor="#d1fae5" subtitle={`${reviewStats.pendingServiceReviews} pending • Avg: ${reviewStats.averageServiceRating.toFixed(1)}⭐`} onClick={() => setActiveTab('service-reviews')} />
      </div>

      <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '8px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap', flex: 1, justifyContent: 'center', minWidth: '140px', position: 'relative', background: activeTab === tab.key ? 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)' : 'transparent', color: activeTab === tab.key ? '#ffffff' : '#023e8a' }} onClick={() => setActiveTab(tab.key)}>
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span style={{ fontSize: '15px' }}>{tab.label}</span>
            {tab.badge > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '700', minWidth: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', minHeight: '500px' }}>
        {activeTab === 'orders' && <OrdersManagementTab />}
        {activeTab === 'bookings' && <BookingsManagementTab />}
        {activeTab === 'product-reviews' && <ProductReviewsTab />}
        {activeTab === 'service-reviews' && <ServiceReviewsTab />}
      </div>
    </div>
  );
};

export default SalesManagement;