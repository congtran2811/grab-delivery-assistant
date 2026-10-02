import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { QRCodeCanvas } from 'qrcode.react';
import CODMetricBar from '../components/CODMetricBar';
import { supabase } from '../services/supabase';
import { GripVertical, MapPin, XCircle, QrCode, X, Moon, Sun, Globe, ArrowRight } from 'lucide-react';

const DICT = {
  vi: {
    trip: "Chuyến",
    toCollect: "Cần thu",
    collected: "Đã thu",
    pending: "Chờ giao",
    scanToSign: "Quét mã để ký",
    scanDesc: "Đưa khách hàng quét mã này để xác nhận đã nhận hàng cho",
    openLink: "Mở link trực tiếp",
    receiverPays: "Người nhận trả ship",
    senderPays: "Người gửi trả ship",
    confirmReceiver: "Xác nhận chuyển sang: NGƯỜI NHẬN TRẢ phí ship?",
    confirmSender: "Xác nhận chuyển sang: NGƯỜI GỬI TRẢ phí ship?",
    cancelConfirm: "Bạn có chắc chắn muốn hủy điểm giao này?",
    codAmount: "Số tiền COD",
    unpaid: "CHƯA THU COD",
    collectedStatus: "COD TIỀN MẶT",
    paidOnline: "COD CHUYỂN KHOẢN",
    shipUnpaid: "Chưa thu phí",
    shipCollected: "Đã thu phí",
    confirmShipStatus: "Xác nhận thay đổi trạng thái thu phí ship?",
  },
  en: {
    trip: "Trip",
    toCollect: "To Collect",
    collected: "Collected",
    pending: "Pending",
    scanToSign: "Scan to Sign",
    scanDesc: "Have the customer scan this to confirm receipt for",
    openLink: "Open link directly",
    receiverPays: "Receiver Pays",
    senderPays: "Sender Pays",
    confirmReceiver: "Confirm change to: RECEIVER PAYS shipping fee?",
    confirmSender: "Confirm change to: SENDER PAYS shipping fee?",
    cancelConfirm: "Are you sure you want to cancel this stop?",
    codAmount: "COD Amount",
    unpaid: "COD UNPAID",
    collectedStatus: "COD CASH",
    paidOnline: "COD ONLINE",
    shipUnpaid: "Fee Unpaid",
    shipCollected: "Fee Collected",
    confirmShipStatus: "Confirm changing shipping fee status?",
  }
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [tripId, setTripId] = useState('TRIP_DEV_01');
  const [showQR, setShowQR] = useState(null);
  
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'vi');
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');
  const [driverId, setDriverId] = useState(() => localStorage.getItem('app_driver_id') || '');
  
  const t = DICT[lang];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlDriverId = params.get('driverId');
    if (urlDriverId) {
      localStorage.setItem('app_driver_id', urlDriverId);
      setDriverId(urlDriverId);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchOrders();
    }
  }, [tripId, driverId]);

  // Persist to local storage whenever orders change (for instant reload backup)
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('driver_orders', JSON.stringify(orders));
    } else {
      localStorage.removeItem('driver_orders');
    }
  }, [orders]);

  const fetchOrders = async () => {
    if (!driverId) return;
    
    // 1. Find the most recent trip_id in the database for this driver
    let currentTripId = tripId;
    const { data: latestOrder, error: latestErr } = await supabase
      .from('orders')
      .select('trip_id')
      .like('trip_id', `${driverId}-%`)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (!latestErr && latestOrder && latestOrder.length > 0) {
      currentTripId = latestOrder[0].trip_id;
      setTripId(currentTripId); // Update the header to show the correct trip ID
    }

    // 2. Try to fetch orders for this trip from Supabase
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('trip_id', currentTripId)
      .order('sequence', { ascending: true });
      
    if (!error && data && data.length > 0) {
      setOrders(data);
      return;
    }

    // 3. Fallback to Local Storage
    const saved = localStorage.getItem('driver_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
      return;
    }

    // 3. Fallback to Mock Data
    const mock = [
      { id: '1', order_code: 'ORD-123', recipient_name: 'John', address: '123 Fake St', cod_amount: 150000, shipping_fee_payer: 'SENDER', shipping_fee_status: 'UNPAID', payment_status: 'UNPAID', delivery_status: 'PENDING', sequence: 0 },
      { id: '2', order_code: 'ORD-124', recipient_name: 'Jane', address: '456 Main St', cod_amount: 0, shipping_fee_payer: 'RECEIVER', shipping_fee_status: 'COLLECTED', payment_status: 'PAID_ONLINE', delivery_status: 'PENDING', sequence: 1 },
      { id: '3', order_code: 'ORD-125', recipient_name: 'Bob', address: '789 Park Ave', cod_amount: 50000, shipping_fee_payer: 'SENDER', shipping_fee_status: 'UNPAID', payment_status: 'UNPAID', delivery_status: 'PENDING', sequence: 2 },
    ];
    setOrders(mock);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(orders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update local state immediately for snappy UI
    const updatedItems = items.map((item, index) => ({ ...item, sequence: index }));
    setOrders(updatedItems);
    
    // Call backend to persist
    Promise.all(updatedItems.map(item => 
      supabase.from('orders').update({ sequence: item.sequence }).eq('id', item.id)
    )).catch(err => console.error('Failed to save reorder:', err));
  };

  const totalCOD = orders.reduce((sum, o) => o.delivery_status !== 'CANCELLED' ? sum + Number(o.cod_amount || 0) : sum, 0);
  const collected = orders.reduce((sum, o) => o.payment_status === 'COLLECTED' ? sum + Number(o.cod_amount || 0) : sum, 0);
  const pendingStops = orders.filter(o => o.delivery_status === 'PENDING').length;

  const togglePayment = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'UNPAID' ? 'COLLECTED' : currentStatus === 'COLLECTED' ? 'PAID_ONLINE' : 'UNPAID';
    setOrders(orders.map(o => o.id === id ? { ...o, payment_status: nextStatus } : o));
    await supabase.from('orders').update({ payment_status: nextStatus }).eq('id', id);
  };

  const handleCODChange = async (id, value) => {
    let numVal = 0;
    if (typeof value === 'string') {
      value = value.toLowerCase().trim();
      if (value.endsWith('k')) {
        numVal = parseFloat(value.replace('k', '').replace(/,/g, '')) * 1000;
      } else {
        numVal = parseFloat(value.replace(/[^0-9.-]/g, ''));
      }
    } else {
      numVal = value;
    }
    
    if (isNaN(numVal)) numVal = 0;
    
    // Optimistic UI update
    setOrders(orders.map(o => o.id === id ? { ...o, cod_amount: numVal } : o));
    
    // Background DB save
    await supabase.from('orders').update({ cod_amount: numVal }).eq('id', id);
  };

  const toggleShippingFeePayer = async (id, currentPayer) => {
    const nextPayer = currentPayer === 'SENDER' ? 'RECEIVER' : 'SENDER';
    const message = nextPayer === 'RECEIVER' ? t.confirmReceiver : t.confirmSender;
      
    if (window.confirm(message)) {
      setOrders(orders.map(o => o.id === id ? { ...o, shipping_fee_payer: nextPayer } : o));
      await supabase.from('orders').update({ shipping_fee_payer: nextPayer }).eq('id', id);
    }
  };

  const toggleShippingFeeStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'UNPAID' ? 'COLLECTED' : 'UNPAID';
    if (window.confirm(t.confirmShipStatus)) {
      setOrders(orders.map(o => o.id === id ? { ...o, shipping_fee_status: nextStatus } : o));
      await supabase.from('orders').update({ shipping_fee_status: nextStatus }).eq('id', id);
    }
  };

  const cancelOrder = async (id) => {
    if(window.confirm(t.cancelConfirm)) {
      setOrders(orders.map(o => o.id === id ? { ...o, delivery_status: 'CANCELLED' } : o));
      await supabase.from('orders').update({ delivery_status: 'CANCELLED' }).eq('id', id);
    }
  };

  const deleteAllOrders = async () => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ đơn hàng trong phiên làm việc này không?")) {
      setOrders([]);
      localStorage.removeItem('driver_orders');
      await supabase.from('orders').delete().eq('trip_id', tripId);
    }
  };

  if (!driverId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Nhập Mã Tài Xế</h2>
            <p className="text-gray-500 text-sm mb-6">Mã này được cấp khi bạn chạy Bookmarklet lần đầu trên trang Grab.</p>
            <input 
              id="driver_id_input"
              type="text" 
              placeholder="VD: DRV-1234" 
              className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4 text-center text-lg font-bold uppercase"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.target.value.trim().toUpperCase();
                  if (val) {
                    localStorage.setItem('app_driver_id', val);
                    setDriverId(val);
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const val = document.getElementById('driver_id_input').value.trim().toUpperCase();
                if (val) {
                  localStorage.setItem('app_driver_id', val);
                  setDriverId(val);
                }
              }}
              className="w-full bg-grab text-white p-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              Đăng nhập / Bắt đầu
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <header className="bg-grab text-white p-3 sm:p-4 sticky top-0 z-10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex flex-col w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl font-bold truncate">Dashboard</h1>
          <span className="text-xs opacity-80">{driverId} | {tripId}</span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap justify-end">
          {orders.length > 0 && (
            <button onClick={deleteAllOrders} className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors shadow-sm">
              Xóa Hết
            </button>
          )}
          <button onClick={() => {
            if(window.confirm('Bạn muốn đăng xuất?')) {
              localStorage.removeItem('app_driver_id');
              setDriverId('');
            }
          }} className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
            Đăng xuất
          </button>
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
            <Globe size={16} /> <span className="font-bold text-sm">{lang.toUpperCase()}</span>
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1 bg-white/20 rounded">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      
      <main className="p-3 sm:p-4">
        <CODMetricBar totalCOD={totalCOD} collected={collected} pendingStops={pendingStops} t={t} />
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="orders">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {orders.map((order, index) => (
                  <Draggable key={order.id} draggableId={order.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative mb-3"
                      >
                        {/* Green connecting line - hidden on the last item */}
                        {index !== orders.length - 1 && (
                          <div className="absolute left-6 sm:left-8 top-14 bottom-[-24px] w-1 bg-green-500 z-0"></div>
                        )}
                        
                        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-3 sm:p-4 transition-colors relative z-10 ${order.delivery_status === 'CANCELLED' ? 'opacity-50 grayscale dark:border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="flex items-start">
                            <div className="flex flex-col items-center mr-2 sm:mr-4">
                              <div {...provided.dragHandleProps} className="p-1 sm:p-2 -mt-1 mb-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors">
                                <GripVertical size={20} className="sm:w-6 sm:h-6" />
                              </div>
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 gap-1 sm:gap-0">
                              <div className="flex justify-between w-full sm:w-auto items-start">
                                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate pr-2">{order.recipient_name}</h3>
                                <span className="text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded whitespace-nowrap sm:hidden">#{order.order_code}</span>
                              </div>
                              <span className="hidden sm:inline-block text-sm font-semibold bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">#{order.order_code}</span>
                            </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 mb-2 sm:mb-0">
                                  <button 
                                    onClick={() => toggleShippingFeePayer(order.id, order.shipping_fee_payer)}
                                    className="transition-transform active:scale-95 text-left"
                                  >
                                    {order.shipping_fee_payer === 'RECEIVER' ? (
                                      <span className="inline-block text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm border border-amber-200 dark:border-amber-800">
                                        🔄 {t.receiverPays}
                                      </span>
                                    ) : (
                                      <span className="inline-block text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm border border-green-200 dark:border-green-800">
                                        🔄 {t.senderPays}
                                      </span>
                                    )}
                                  </button>
                                  
                                  <ArrowRight size={14} className="text-gray-400 dark:text-gray-500 mx-0.5 sm:mx-1 flex-shrink-0" />

                                  <button 
                                    onClick={() => toggleShippingFeeStatus(order.id, order.shipping_fee_status)}
                                    className="transition-transform active:scale-95 text-left"
                                  >
                                    {order.shipping_fee_status === 'COLLECTED' ? (
                                      <span className="inline-block text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm border border-emerald-200 dark:border-emerald-800">
                                        ✅ {t.shipCollected}
                                      </span>
                                    ) : (
                                      <span className="inline-block text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm border border-gray-300 dark:border-gray-600">
                                        ⭕ {t.shipUnpaid}
                                      </span>
                                    )}
                                  </button>
                                </div>
                            
                            <div className="flex items-start text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                              <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" /> 
                              <span className="line-clamp-2">{order.address}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 gap-3 sm:gap-0">
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">{t.codAmount}</span>
                                <div className="flex items-center">
                                  <input 
                                    key={`cod-${order.id}-${order.cod_amount}`}
                                    type="text" 
                                    defaultValue={order.cod_amount > 0 ? order.cod_amount.toLocaleString() : ''}
                                    placeholder="0"
                                    className="font-bold text-base sm:text-lg text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 hover:border-solid hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 focus:border-solid focus:border-grab focus:outline-none w-16 sm:w-20 transition-colors p-0 text-right focus:ring-0"
                                    onFocus={(e) => {
                                      // Remove formatting for easier editing
                                      const val = e.target.value.replace(/[^0-9kK]/g, '');
                                      if (val !== '0') e.target.value = val;
                                    }}
                                    onBlur={(e) => handleCODChange(order.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.target.blur();
                                    }}
                                  />
                                  <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white ml-1">đ</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => setShowQR(order.order_code)}
                                  className="p-1.5 sm:p-2 flex-shrink-0 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                                >
                                  <QrCode size={18} className="sm:w-5 sm:h-5" />
                                </button>
                                <button 
                                  onClick={() => togglePayment(order.id, order.payment_status)}
                                  disabled={order.delivery_status === 'CANCELLED'}
                                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                                    order.payment_status === 'COLLECTED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                    order.payment_status === 'PAID_ONLINE' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                                    'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
                                  }`}
                                >
                                  {order.payment_status === 'UNPAID' ? t.unpaid : order.payment_status === 'COLLECTED' ? t.collectedStatus : t.paidOnline}
                                </button>
                                
                                {order.delivery_status !== 'CANCELLED' && (
                                  <button onClick={() => cancelOrder(order.id)} className="p-1.5 sm:p-2 flex-shrink-0 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                    <XCircle size={18} className="sm:w-5 sm:h-5" />
                                  </button>
                                )}
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center max-w-sm w-full relative">
              <button 
                onClick={() => setShowQR(null)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t.scanToSign}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-sm">{t.scanDesc} #{showQR}</p>
              
              <div className="p-4 bg-white border dark:border-gray-700 rounded-xl shadow-sm mb-4">
                <QRCodeCanvas 
                  value={`${window.location.origin}/receipt/${showQR}`} 
                  size={200}
                  level="M"
                />
              </div>
              <a 
                href={`/receipt/${showQR}`} 
                target="_blank" rel="noreferrer"
                className="text-grab font-semibold"
              >
                {t.openLink}
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
