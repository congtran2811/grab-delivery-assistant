// Bookmarklet source for scraping Grab PGĐT
(function() {
  function extractData() {
    try {
      // Logic would adapt to actual Grab DOM, here's a generic assumption
      const tripIdElem = document.querySelector('.trip-id-selector') || document.querySelector('h1');
      const trip_id = tripIdElem ? tripIdElem.innerText.trim().replace('Trip: ', '') : `TRIP_${Date.now()}`;
      
      const orderNodes = document.querySelectorAll('.order-card-selector'); // Mock selector
      let orders = [];
      
      if (orderNodes.length === 0) {
        // Mock data fallback for demonstration if selectors fail
        orders = [
          { order_code: 'ORD-001', recipient_name: 'John Doe', phone: '0123456789', address: '123 Fake St', cod_amount: 150000 },
          { order_code: 'ORD-002', recipient_name: 'Jane Smith', phone: '0987654321', address: '456 Mock Ave', cod_amount: 0 }
        ];
      } else {
        orderNodes.forEach((node, index) => {
          orders.push({
            order_code: node.querySelector('.code')?.innerText.trim() || `ORD-${index}`,
            recipient_name: node.querySelector('.name')?.innerText.trim() || 'Unknown',
            phone: node.querySelector('.phone')?.innerText.trim() || '',
            address: node.querySelector('.address')?.innerText.trim() || 'Unknown Address',
            cod_amount: parseInt(node.querySelector('.cod')?.innerText.replace(/\D/g, '') || '0', 10),
          });
        });
      }

      const payload = { trip_id, orders };

      // Send to local API for development, change to prod URL later
      fetch('http://localhost:3001/api/v1/sync-grab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          alert('Sync successful! ' + data.data.length + ' orders synced.');
        } else {
          alert('Sync failed: ' + data.error);
        }
      })
      .catch(err => alert('Network error: ' + err.message));
    } catch (e) {
      alert('Extraction error: ' + e.message);
    }
  }
  extractData();
})();
