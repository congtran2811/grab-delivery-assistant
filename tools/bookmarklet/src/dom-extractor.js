(async function() {
  async function extractData() {
    try {
      let driverId = localStorage.getItem('grab_driver_id');
      if (!driverId) {
        driverId = 'DRV-' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('grab_driver_id', driverId);
      }
      
      // Generate daily trip ID so data is preserved across syncs today
      const today = new Date().toISOString().slice(0, 10);
      const trip_id = `${driverId}-${today}`;
      let orders = [];
      
      const findInputByLabel = (labelText) => {
        const elements = Array.from(document.querySelectorAll('div, p, span, label'));
        const labelEl = elements.find(el => el.innerText && el.innerText.trim().includes(labelText));
        if (labelEl) {
          let nextEl = labelEl.nextElementSibling;
          while(nextEl) {
            const input = nextEl.tagName === 'INPUT' || nextEl.tagName === 'TEXTAREA' || nextEl.tagName === 'SELECT' ? nextEl : nextEl.querySelector('input, textarea, select');
            if (input) return input;
            nextEl = nextEl.nextElementSibling;
          }
          const parentInput = labelEl.parentElement.querySelector('input, textarea, select');
          if (parentInput) return parentInput;
        }
        return null;
      };

      const extractCurrentRecipient = () => {
        let recipient_name = '';
        let phone = '';
        let address = '';
        const nguoiNhanIndex = Array.from(document.querySelectorAll('*')).findIndex(el => el.innerText && el.innerText.trim() === 'Người nhận:');
        if (nguoiNhanIndex !== -1) {
          const afterNguoiNhan = Array.from(document.querySelectorAll('*')).slice(nguoiNhanIndex);
          const inputsAfter = afterNguoiNhan.filter(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
          if (inputsAfter.length >= 3) {
            recipient_name = inputsAfter[0].value.trim();
            phone = inputsAfter[1].value.trim();
            address = inputsAfter[2].value.trim();
          }
        }
        return { recipient_name, phone, address };
      };

      const orderField = findInputByLabel('Mã đơn hàng');
      
      if (orderField && orderField.tagName === 'SELECT') {
        const options = Array.from(orderField.options);
        for (let i = 0; i < options.length; i++) {
          orderField.value = options[i].value;
          orderField.dispatchEvent(new Event('change', { bubbles: true }));
          // Wait 1 second for Grab's network to fetch new order info on slow 4G
          await new Promise(r => setTimeout(r, 1000));
          
          const rec = extractCurrentRecipient();
          orders.push({
            order_code: options[i].text.trim() || `ORD-${Date.now()}`,
            recipient_name: rec.recipient_name || 'Khách hàng',
            phone: rec.phone || '',
            address: rec.address || 'Chưa rõ địa chỉ',
            cod_amount: 0,
            shipping_fee_payer: 'SENDER'
          });
        }
      } else {
        let order_code = orderField ? orderField.value.trim() : '';
        const allInputs = Array.from(document.querySelectorAll('input, textarea'));
        if (!order_code && allInputs.length > 0) order_code = allInputs[0].value.trim();
        
        if (!order_code && allInputs.length === 0) {
          orders = [
            { order_code: 'ORD-001', recipient_name: 'Khách hàng Demo', phone: '0123456789', address: '123 Đường Ảo, Quận 1', cod_amount: 150000, shipping_fee_payer: 'SENDER' }
          ];
        } else {
          const rec = extractCurrentRecipient();
          orders.push({
            order_code: order_code || `ORD-${Date.now()}`,
            recipient_name: rec.recipient_name || 'Khách hàng',
            phone: rec.phone || '',
            address: rec.address || 'Chưa rõ địa chỉ',
            cod_amount: 0,
            shipping_fee_payer: 'SENDER'
          });
        }
      }

      const payload = { trip_id, orders };
      const res = await fetch('__API_BASE_URL__/api/v1/sync-grab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(data.success) {
        alert(`Đồng bộ thành công! ${data.data.length} đơn hàng.\n\n📌 Mã Tài Xế: ${driverId}`);
        
        // Inject a floating button to bypass popup blockers
        const btn = document.createElement('a');
        btn.href = `__DASHBOARD_URL__/?driverId=${driverId}`;
        btn.target = '_blank';
        btn.innerText = '👉 MỞ DASHBOARD 👈';
        btn.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999999;background:#00B14F;color:white;padding:20px 40px;font-size:20px;border-radius:12px;font-weight:bold;text-decoration:none;box-shadow:0 10px 25px rgba(0,0,0,0.5);text-align:center;font-family:sans-serif;white-space:nowrap;';
        document.body.appendChild(btn);
        
        const closeBtn = document.createElement('div');
        closeBtn.innerText = 'Đóng';
        closeBtn.style.cssText = 'position:fixed;top:calc(50% + 50px);left:50%;transform:translateX(-50%);z-index:999999;color:#333;padding:10px 30px;font-size:16px;cursor:pointer;font-family:sans-serif;background:white;border-radius:20px;margin-top:20px;box-shadow:0 4px 10px rgba(0,0,0,0.2);font-weight:bold;';
        closeBtn.onclick = () => { btn.remove(); closeBtn.remove(); };
        document.body.appendChild(closeBtn);
      }
      else alert('Đồng bộ thất bại: ' + data.error);
    } catch (e) {
      alert('Lỗi lấy dữ liệu: ' + e.message);
    }
  }
  extractData();
})();
