const syncService = require('../services/sync.service');

async function syncGrabOrders(req, res) {
  try {
    const { trip_id, orders } = req.body;
    
    if (!trip_id || !Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid payload: missing trip_id or orders array' });
    }

    const syncedOrders = await syncService.syncOrders(trip_id, orders);
    return res.status(200).json({ success: true, message: 'Sync successful', data: syncedOrders });
  } catch (error) {
    console.error('Sync Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

module.exports = { syncGrabOrders };
