(function () {
  const formatMoney = value => `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  function initBuilder(root) {
    if (!root) return;

    const products = {
      web: { id: 'web', title: 'Desarrollo Web Profesional', category: 'Desarrollo Web', description: 'Sitio web responsivo con diseño moderno y optimizado para SEO', price: 1500 },
      mobile: { id: 'mobile', title: 'Aplicación Móvil iOS/Android', category: 'Desarrollo Móvil', description: 'App nativa con interfaz intuitiva y funcionalidades avanzadas', price: 3500 },
      crm: { id: 'crm', title: 'Sistema de Gestión (CRM)', category: 'Software Empresarial', description: 'Plataforma completa para gestión de clientes y ventas', price: 2800 },
      ecommerce: { id: 'ecommerce', title: 'E-commerce Completo', category: 'Desarrollo Web', description: 'Tienda online con pasarela de pagos y panel administrativo', price: 2200 }
    };

    const state = { items: {}, discount: 0, tax: 18 };
    const previewModalEl = root.querySelector('.js-preview-modal');
    const previewModal = previewModalEl && window.bootstrap ? bootstrap.Modal.getOrCreateInstance(previewModalEl) : null;
    const rejectModalEl = root.querySelector('.js-reject-modal');
    const rejectModal = rejectModalEl && window.bootstrap ? bootstrap.Modal.getOrCreateInstance(rejectModalEl) : null;
    const deleteModalEl = root.querySelector('.js-delete-modal');
    const deleteModal = deleteModalEl && window.bootstrap ? bootstrap.Modal.getOrCreateInstance(deleteModalEl) : null;
    let pendingDelete = null;

    function getItemsArray() {
      return Object.values(state.items);
    }

    function subtotal() {
      return getItemsArray().reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    function discountAmount() {
      return subtotal() * (Number(state.discount || 0) / 100);
    }

    function taxableBase() {
      return Math.max(subtotal() - discountAmount(), 0);
    }

    function taxAmount() {
      return taxableBase() * (Number(state.tax || 0) / 100);
    }

    function total() {
      return taxableBase() + taxAmount();
    }

    function renderSidebar() {
      const body = root.querySelector('.js-cart-body');
      const badgeCount = root.querySelectorAll('.js-items-count');
      const subtotalNode = root.querySelector('.js-subtotal');
      const taxNode = root.querySelector('.js-tax');
      const totalNode = root.querySelector('.js-total');
      const emptyNode = root.querySelector('.js-cart-empty');
      const summaryNode = root.querySelector('.js-cart-summary');
      const generateBtn = root.querySelector('.js-generate-btn');
      const items = getItemsArray();

      badgeCount.forEach(node => node.textContent = items.length);
      subtotalNode && (subtotalNode.textContent = formatMoney(taxableBase()));
      taxNode && (taxNode.textContent = formatMoney(taxAmount()));
      totalNode && (totalNode.textContent = formatMoney(total()));
      if (generateBtn) generateBtn.disabled = items.length === 0;

      if (emptyNode) emptyNode.classList.toggle('d-none', items.length > 0);
      if (summaryNode) summaryNode.classList.toggle('d-none', items.length === 0);
      if (!body) return;
      body.innerHTML = '';

      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
            <div>
              <div class="fw-bold fs-5">${item.title}</div>
              <div class="text-muted">${formatMoney(item.price)} c/u</div>
            </div>
            <button class="btn btn-link text-danger p-0 js-remove-item" data-id="${item.id}" aria-label="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="d-flex justify-content-between align-items-end gap-3 flex-wrap">
            <div class="quantity-box">
              <button type="button" class="js-qty" data-action="minus" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button type="button" class="js-qty" data-action="plus" data-id="${item.id}">+</button>
            </div>
            <div class="fw-bold fs-3">${formatMoney(item.qty * item.price)}</div>
          </div>`;
        body.appendChild(div);
      });
    }

    function renderPreview() {
      const tableBody = root.querySelector('.js-preview-items');
      if (!tableBody) return;
      tableBody.innerHTML = getItemsArray().map(item => `
        <tr>
          <td>
            <div class="fw-bold">${item.title}</div>
            <div class="text-muted">${item.description}</div>
          </td>
          <td>${item.qty}</td>
          <td>${formatMoney(item.price)}</td>
          <td>${formatMoney(item.qty * item.price)}</td>
        </tr>
      `).join('');
      const prevSub = root.querySelector('.js-preview-subtotal');
      const prevTax = root.querySelector('.js-preview-tax');
      const prevTotal = root.querySelector('.js-preview-total');
      if (prevSub) prevSub.textContent = formatMoney(taxableBase());
      if (prevTax) prevTax.textContent = formatMoney(taxAmount());
      if (prevTotal) prevTotal.textContent = `${formatMoney(total())} USD`;
    }

    root.addEventListener('click', e => {
      const addBtn = e.target.closest('.js-add-product');
      if (addBtn) {
        const product = products[addBtn.dataset.id];
        if (!product) return;
        state.items[product.id] = state.items[product.id] || { ...product, qty: 0 };
        state.items[product.id].qty += 1;
        renderSidebar();
        const toast = root.querySelector('.js-added-toast');
        if (toast && window.bootstrap) bootstrap.Toast.getOrCreateInstance(toast).show();
        return;
      }

      const qtyBtn = e.target.closest('.js-qty');
      if (qtyBtn) {
        const item = state.items[qtyBtn.dataset.id];
        if (!item) return;
        item.qty += qtyBtn.dataset.action === 'plus' ? 1 : -1;
        if (item.qty <= 0) delete state.items[item.id];
        renderSidebar();
        return;
      }

      const removeBtn = e.target.closest('.js-remove-item');
      if (removeBtn) {
        pendingDelete = removeBtn.dataset.id;
        if (deleteModal) deleteModal.show();
        return;
      }

      if (e.target.closest('.js-confirm-delete')) {
        if (pendingDelete) delete state.items[pendingDelete];
        pendingDelete = null;
        renderSidebar();
        deleteModal && deleteModal.hide();
        const toast = root.querySelector('.js-removed-toast');
        if (toast && window.bootstrap) bootstrap.Toast.getOrCreateInstance(toast).show();
        return;
      }

      if (e.target.closest('.js-open-preview')) {
        renderPreview();
        previewModal && previewModal.show();
        return;
      }

      if (e.target.closest('.js-open-reject')) {
        rejectModal && rejectModal.show();
        return;
      }

      if (e.target.closest('.js-confirm-reject')) {
        const reason = root.querySelector('.js-reject-reason')?.value?.trim();
        const holder = root.querySelector('.js-reject-result');
        if (holder && reason) {
          holder.classList.remove('d-none');
          holder.innerHTML = `<strong>Motivo del rechazo:</strong> ${reason}`;
        }
        const status = root.querySelector('.js-status-badge');
        if (status) {
          status.className = 'badge-ui badge-rejected js-status-badge';
          status.innerHTML = '<i class="bi bi-x-circle"></i> Rechazada';
        }
        rejectModal && rejectModal.hide();
      }
    });

    root.querySelectorAll('.js-discount-input').forEach(input => {
      input.addEventListener('input', e => {
        state.discount = e.target.value || 0;
        renderSidebar();
      });
    });

    root.querySelectorAll('.js-tax-input').forEach(input => {
      input.addEventListener('input', e => {
        state.tax = e.target.value || 0;
        renderSidebar();
      });
    });

    renderSidebar();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-quote-builder]').forEach(initBuilder);
  });
})();
