import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, MapPin, User, Package } from 'lucide-react';
// import { supabase } from '../services/supabase';

export default function PublicReceipt() {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const sigPad = useRef({});

  useEffect(() => {
    // For demo, load mock data if DB isn't connected
    setOrder({
      order_code: orderCode,
      recipient_name: 'John Doe',
      address: '123 Fake Street, District 1, HCMC',
      cod_amount: 150000,
      payment_status: 'UNPAID',
    });
    setLoading(false);
    
    // Example fetch
    /*
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*').eq('order_code', orderCode).single();
      if(data) setOrder(data);
      setLoading(false);
    };
    fetchOrder();
    */
  }, [orderCode]);

  const clearSignature = () => {
    sigPad.current.clear();
  };

  const submitSignature = async () => {
    if (sigPad.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    const signatureImage = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    
    try {
      // Example call to backend
      // await fetch(`/api/v1/orders/${orderCode}/complete`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ signature: signatureImage })
      // });
      
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting signature');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Confirmed</h1>
        <p className="text-gray-600 text-center">Thank you! Your signature has been recorded and the delivery is complete.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-lg">
      <header className="bg-grab text-white p-6 text-center rounded-b-3xl">
        <h1 className="text-2xl font-bold">Electronic Receipt</h1>
        <p className="opacity-90 mt-1">Order: #{order.order_code}</p>
      </header>

      <div className="p-6 flex-1">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
            <User className="text-gray-400 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Recipient</p>
              <p className="font-semibold text-gray-900 text-lg">{order.recipient_name}</p>
            </div>
          </div>
          
          <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
            <MapPin className="text-gray-400 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Delivery Address</p>
              <p className="font-medium text-gray-900">{order.address}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Package className="text-gray-400 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Amount to pay (COD)</p>
              <p className="font-bold text-2xl text-grab">{order.cod_amount.toLocaleString()} đ</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-gray-900 font-bold mb-3 px-1">Receiver Signature</h2>
          <div className="bg-white rounded-xl shadow-inner border-2 border-dashed border-gray-300 overflow-hidden">
            <SignatureCanvas 
              penColor="black"
              canvasProps={{className: 'w-full h-48 bg-gray-50'}} 
              ref={sigPad} 
            />
          </div>
          <button 
            onClick={clearSignature}
            className="text-gray-500 text-sm mt-2 font-medium w-full text-right hover:text-gray-700"
          >
            Clear signature
          </button>
        </div>

        <button 
          onClick={submitSignature}
          className="w-full bg-grab hover:bg-grabDark text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
        >
          Confirm Delivery
        </button>
      </div>
    </div>
  );
}
