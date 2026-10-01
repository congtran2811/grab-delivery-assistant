const { supabase } = require('../config/supabase');
const { OrderStatus } = require('shared-types');

async function completeOrder(req, res) {
  try {
    const { orderCode } = req.params;
    const { signature } = req.body; // Base64 image
    
    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    // Usually, we'd upload the base64 to Supabase Storage and get a URL.
    // For simplicity/demo in this context, we can just save the base64 string 
    // to the `signature_image` column if it's not too large.
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        delivery_status: OrderStatus.DELIVERED,
        signature_image: signature
      })
      .eq('order_code', orderCode)
      .select();

    if (error) throw error;
    
    return res.status(200).json({ success: true, message: 'Order marked as DELIVERED', data });
  } catch (error) {
    console.error('Complete Order Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

module.exports = { completeOrder };
