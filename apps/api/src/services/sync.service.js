const { supabase } = require('../config/supabase');
const { PaymentStatus, OrderStatus } = require('shared-types');

async function syncOrders(tripId, orders) {
  // 1. Ensure trip exists or create it
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .upsert({ trip_id: tripId, status: 'ACTIVE' }, { onConflict: 'trip_id' })
    .select()
    .single();

  if (tripError) throw tripError;

  // 2. Fetch existing orders for this trip to preserve their states
  const { data: existingOrders, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('trip_id', tripId);

  if (fetchError) throw fetchError;

  const existingOrderMap = new Map(existingOrders.map(o => [o.order_code, o]));

  const upsertPayloads = orders.map((order, index) => {
    const existing = existingOrderMap.get(order.order_code);
    return {
      trip_id: tripId,
      order_code: order.order_code,
      recipient_name: order.recipient_name,
      phone: order.phone,
      address: order.address,
      cod_amount: existing?.cod_amount !== undefined && existing?.cod_amount > 0 ? existing.cod_amount : order.cod_amount,
      shipping_fee_payer: order.shipping_fee_payer || 'SENDER',
      sequence: index, // Update sequence from bookmarklet
      // Preserve existing states or set defaults
      payment_status: existing?.payment_status || PaymentStatus.UNPAID,
      actual_collected: existing?.actual_collected !== undefined ? existing.actual_collected : order.cod_amount,
      delivery_status: existing?.delivery_status || OrderStatus.PENDING,
      signature_image: existing?.signature_image || null,
      notes: existing?.notes || ''
    };
  });

  // 3. Upsert orders
  const { data: upserted, error: upsertError } = await supabase
    .from('orders')
    .upsert(upsertPayloads, { onConflict: 'trip_id,order_code' })
    .select();

  if (upsertError) throw upsertError;

  // 4. Delete orders that are no longer in the payload (so the list is exactly identical to Grab)
  const newOrderCodes = new Set(orders.map(o => o.order_code));
  const ordersToDelete = existingOrders.filter(o => !newOrderCodes.has(o.order_code)).map(o => o.id);
  
  if (ordersToDelete.length > 0) {
    await supabase.from('orders').delete().in('id', ordersToDelete);
  }

  return upserted;
}

module.exports = { syncOrders };
