import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { QRCodeCanvas } from 'qrcode.react';
import CODMetricBar from '../components/CODMetricBar';
import { supabase } from '../services/supabase';
import { GripVertical, MapPin, XCircle, QrCode, X } from 'lucide-react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [tripId, setTripId] = useState('TRIP_DEV_01'); // Hardcoded for demo, normally from URL/Auth
  const [showQR, setShowQR] = useState(null); // stores order_code to show modal

  useEffect(() => {
    fetchOrders();
  }, [tripId]);

  const fetchOrders = async () => {
    // For demo, just set mock data if DB is empty
    const mock = [
      { id: '1', order_code: 'ORD-123', recipient_name: 'John', address: '123 Fake St', cod_amount: 150000, payment_status: 'UNPAID', delivery_status: 'PENDING', sequence: 0 },
      { id: '2', order_code: 'ORD-124', recipient_name: 'Jane', address: '456 Main St', cod_amount: 0, payment_status: 'PAID_ONLINE', delivery_status: 'PENDING', sequence: 1 },
      { id: '3', order_code: 'ORD-125', recipient_name: 'Bob', address: '789 Park Ave', cod_amount: 50000, payment_status: 'UNPAID', delivery_status: 'PENDING', sequence: 2 },
    ];
    setOrders(mock);
    
    // Example Supabase fetch (commented out until API is fully running)
    /*
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('trip_id', tripId)
      .order('sequence', { ascending: true });
    if (!error && data.length > 0) setOrders(data);
    */
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
    // fetch(`/api/v1/trips/${tripId}/reorder`, { method: 'PUT', body: JSON.stringify({ orders: updatedItems }) })
  };

  const totalCOD = orders.reduce((sum, o) => o.delivery_status !== 'CANCELLED' ? sum + Number(o.cod_amount || 0) : sum, 0);
  const collected = orders.reduce((sum, o) => o.payment_status === 'COLLECTED' ? sum + Number(o.cod_amount || 0) : sum, 0);
  const pendingStops = orders.filter(o => o.delivery_status === 'PENDING').length;

  const togglePayment = (id, currentStatus) => {
    const nextStatus = currentStatus === 'UNPAID' ? 'COLLECTED' : currentStatus === 'COLLECTED' ? 'PAID_ONLINE' : 'UNPAID';
    setOrders(orders.map(o => o.id === id ? { ...o, payment_status: nextStatus } : o));
    // Persist API call
  };

  const cancelOrder = (id) => {
    if(window.confirm('Are you sure you want to cancel this stop?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, delivery_status: 'CANCELLED' } : o));
      // Persist API call
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-grab text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold">Trip: {tripId}</h1>
      </header>
      
      <main className="p-4">
        <CODMetricBar totalCOD={totalCOD} collected={collected} pendingStops={pendingStops} />
        
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
                        className={`bg-white rounded-xl shadow-sm border p-4 ${order.delivery_status === 'CANCELLED' ? 'opacity-50 grayscale' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start">
                          <div {...provided.dragHandleProps} className="p-2 -ml-2 mr-2 text-gray-400">
                            <GripVertical size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{order.recipient_name}</h3>
                              <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">#{order.order_code}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                              <MapPin size={16} className="mr-1" /> {order.address}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">COD Amount</span>
                                <span className="font-bold text-lg">{order.cod_amount.toLocaleString()} đ</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setShowQR(order.order_code)}
                                  className="p-1.5 text-blue-600 bg-blue-50 rounded-lg"
                                >
                                  <QrCode size={20} />
                                </button>
                                <button 
                                  onClick={() => togglePayment(order.id, order.payment_status)}
                                  disabled={order.delivery_status === 'CANCELLED'}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                    order.payment_status === 'COLLECTED' ? 'bg-green-100 text-green-700' :
                                    order.payment_status === 'PAID_ONLINE' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {order.payment_status.replace('_', ' ')}
                                </button>
                                
                                {order.delivery_status !== 'CANCELLED' && (
                                  <button onClick={() => cancelOrder(order.id)} className="p-1.5 text-red-500 bg-red-50 rounded-lg">
                                    <XCircle size={20} />
                                  </button>
                                )}
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
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center max-w-sm w-full relative">
              <button 
                onClick={() => setShowQR(null)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-2">Scan to Sign</h2>
              <p className="text-gray-500 mb-6 text-center text-sm">Have the customer scan this to confirm receipt for #{showQR}</p>
              
              <div className="p-4 bg-white border rounded-xl shadow-sm mb-4">
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
                Open link directly
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
