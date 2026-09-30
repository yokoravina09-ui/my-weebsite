/**
 * Chito's Restaurant - Interactive Script (ES6+)
 * Features:
 * 1. Mobile Hamburger Navigation Menu with ARIA state management
 * 2. Filterable Menu Category Tabs with Accessible Keyboard Navigation
 * 3. Native Accessible Order / Pickup Modal Dialog with trigger data prefilling
 * 4. Interactive Contact & Order Inquiry Form validation and feedback
 * 5. Sticky Header Scroll Indicator
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
  initMenuFilter();
  initOrderModal();
  initContactForm();
  initHeaderScroll();
});

/* --------------------------------------------------------------------------
   0. Dark Mode Theme Toggle
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'chitos-theme-preference';

  // Determine starting theme: saved preference -> system preference -> default light
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
        themeToggle.setAttribute('title', 'Switch to light mode');
        themeToggle.setAttribute('aria-pressed', 'true');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        themeToggle.setAttribute('title', 'Switch to dark mode');
        themeToggle.setAttribute('aria-pressed', 'false');
      }
    }
  }

  // Apply initial theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (err) {
        // Fallback for private browsing mode
      }
      applyTheme(newTheme);
    });
  }

  // React to OS theme change if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   1. Mobile Hamburger Navigation
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  if (!navToggle || !primaryNav) return;

  function openMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Hamburger toggle click
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (primaryNav.classList.contains('is-open')) {
        closeMenu();
      }
    });
  });

  // Close when clicking outside of the navigation
  document.addEventListener('click', (e) => {
    if (
      primaryNav.classList.contains('is-open') &&
      !primaryNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close with Escape key for keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   2. Filterable Menu Category Tabs (Interactive Section 5 Feature)
   -------------------------------------------------------------------------- */
function initMenuFilter() {
  const tabs = Array.from(document.querySelectorAll('.filter-tab'));
  const cards = document.querySelectorAll('.menu-card');
  const menuGrid = document.getElementById('menu-grid');

  if (!tabs.length || !cards.length) return;

  function filterCategory(targetCategory) {
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const matches = targetCategory === 'all' || cardCategory === targetCategory;

      if (matches) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    // Update screen reader status
    if (menuGrid) {
      const countAnnouncement = document.getElementById('filter-announcement') || createFilterAnnouncement();
      countAnnouncement.textContent = `Showing ${visibleCount} dishes for ${targetCategory === 'all' ? 'All Dishes' : targetCategory}`;
    }
  }

  function createFilterAnnouncement() {
    const el = document.createElement('div');
    el.id = 'filter-announcement';
    el.className = 'sr-only';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.clip = 'rect(0,0,0,0)';
    menuGrid.parentNode.insertBefore(el, menuGrid);
    return el;
  }

  function setActiveTab(selectedTab) {
    tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.tabIndex = isSelected ? 0 : -1;
    });

    const category = selectedTab.getAttribute('data-category');
    filterCategory(category);
  }

  // Click handler for category tabs
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveTab(tab);
    });

    // Keyboard navigation (Arrow keys, Home, End)
    tab.addEventListener('keydown', (e) => {
      const currentIndex = tabs.indexOf(tab);
      let nextIndex;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      tabs[nextIndex].focus();
      setActiveTab(tabs[nextIndex]);
    });
  });
}

/* --------------------------------------------------------------------------
   Receipt Generator (.txt) & File Downloader
   -------------------------------------------------------------------------- */
function generateOrderReceipt({
  orderRef,
  customerName = 'Valued Customer',
  customerPhone,
  customerEmail = 'N/A',
  serviceType = 'Curbside Pickup',
  items = [],
  notes = '',
  totalAmount = null
}) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const dividerDouble = '='.repeat(60);
  const dividerSingle = '-'.repeat(60);

  // Format Items Section
  let itemsSection = '';
  if (items.length > 0) {
    itemsSection = items.map((item, idx) => {
      const qty = item.quantity || 1;
      const unitPriceFormatted = item.unitPrice ? `PHP ${Number(item.unitPrice).toFixed(2)}` : 'Pricing based on size';
      const subtotalFormatted = item.unitPrice ? `PHP ${(Number(item.unitPrice) * qty).toFixed(2)}` : 'Varies';
      return `  [${idx + 1}] ${item.name}\n      Quantity:   ${qty}\n      Unit Price: ${unitPriceFormatted}\n      Subtotal:   ${subtotalFormatted}`;
    }).join('\n\n');
  } else {
    itemsSection = '  Custom order / Inquired dishes listed in notes section.';
  }

  const totalLine = totalAmount !== null && totalAmount > 0
    ? `ESTIMATED TOTAL:        PHP ${Number(totalAmount).toFixed(2)}`
    : 'ESTIMATED TOTAL:        Pay upon pickup / Counter confirmation';

  return `${dividerDouble}
                      CHITO'S RESTAURANT
                  "Uulit ka sa Sarap! - Est. 2009"
               35 Plaridel St., Lucban, Quezon, 4328
                 Phone Hotline: (042) 540 9262
                 Email: chitos0409@yahoo.com
                 Instagram: @chitosuulitkasasarap
${dividerDouble}
ORDER / PICKUP CONFIRMATION RECEIPT
${dividerDouble}
RECEIPT NO:             ${orderRef}
DATE:                   ${dateFormatted}
TIME:                   ${timeFormatted}
SERVICE TYPE:           ${serviceType.toUpperCase()}
ORDER STATUS:           CONFIRMED / QUEUED FOR PREPARATION
${dividerSingle}
CUSTOMER INFORMATION:
Customer Name:          ${customerName}
Contact Mobile:         ${customerPhone}
Email:                  ${customerEmail || 'N/A'}
Store Address:          35 Plaridel St., Lucban, Philippines, 4328
${dividerSingle}
ORDER DETAILS:
${itemsSection}

${totalLine}
${dividerSingle}
SPECIAL INSTRUCTIONS / NOTES:
${notes ? notes : 'No special instructions provided.'}
${dividerSingle}
PICKUP & CLAIMING GUIDELINES:
1. CURBSIDE PICKUP:
   - Drive to 35 Plaridel St., Lucban, Quezon.
   - Stay safely inside your vehicle and call (042) 540 9262.
   - Quote your Receipt No: [${orderRef}].
   - Our crew will immediately bring your freshly packed meal out.

2. DINE-IN / ADVANCE ORDERS:
   - Present this digital receipt number to our counter upon arrival.

3. PAYMENT METHODS:
   - Cash upon pickup / vehicle handover.
   - GCash or Bank Transfer upon confirmation call from our staff.
${dividerSingle}
                 Maraming Salamat po sa Inyong Pagtangkilik!
                     "Dahil Sigurado, Uulit ka sa Sarap!"
${dividerDouble}
Generated digitally by Chito's Restaurant Web Portal (ES6+)
`;
}

function downloadReceiptFile(filename, textContent) {
  try {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to trigger receipt download', err);
    return false;
  }
}

/* --------------------------------------------------------------------------
   3. Native Accessible Order / Pickup Modal Dialog
   -------------------------------------------------------------------------- */
function initOrderModal() {
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const orderForm = document.getElementById('quick-order-form');
  const dishInput = document.getElementById('modal-dish-name');
  const triggers = document.querySelectorAll('.order-trigger');

  if (!modal) return;

  let lastActiveElement = null;
  let currentDishPrice = 0;

  function openModal(dishName, price) {
    lastActiveElement = document.activeElement;
    currentDishPrice = price || 0;

    if (dishInput) {
      dishInput.value = dishName || 'Chito’s Specialty Dish';
    }
    
    // Support modern HTML5 dialog showModal
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  }

  function closeModal() {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }

    if (orderForm) {
      orderForm.reset();
    }

    // Return focus to the trigger that opened the dialog
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  // Attach to all "Order for Pickup" trigger buttons in the menu
  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dish = btn.getAttribute('data-dish');
      const price = parseFloat(btn.getAttribute('data-price')) || 0;
      openModal(dish, price);
    });
  });

  // Close buttons
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeModal();
    }
  });

  // Modal Form Submission & .txt Receipt Generation
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customerNameInput = document.getElementById('modal-customer-name');
      const phoneInput = document.getElementById('modal-contact-phone');
      const quantityInput = document.getElementById('modal-quantity');
      const serviceSelect = document.getElementById('modal-service');
      const notesInput = document.getElementById('modal-notes');

      const customerName = customerNameInput?.value.trim() || 'Valued Customer';
      const phone = phoneInput?.value.trim();
      const quantity = parseInt(quantityInput?.value || '1', 10);
      const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Curbside Pickup';
      const dish = dishInput ? dishInput.value : 'Specialty Dish';
      const notes = notesInput?.value.trim() || '';

      if (!phone) {
        alert('Please enter your contact phone number.');
        return;
      }

      // Generate Unique Order Reference
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderRef = `CHTO-ORD-${Date.now().toString().slice(-6)}-${randomSuffix}`;
      const totalAmount = currentDishPrice > 0 ? currentDishPrice * quantity : null;

      // Generate Receipt Text Content
      const receiptText = generateOrderReceipt({
        orderRef,
        customerName,
        customerPhone: phone,
        serviceType: serviceText,
        items: [
          {
            name: dish,
            quantity: quantity,
            unitPrice: currentDishPrice > 0 ? currentDishPrice : null
          }
        ],
        notes,
        totalAmount
      });

      // Automatically download .txt receipt
      const receiptFilename = `Chitos_Receipt_${orderRef}.txt`;
      downloadReceiptFile(receiptFilename, receiptText);

      // User notification
      alert(`Salamat, ${customerName}! Your pickup request (#${orderRef}) has been confirmed.\n\nYour official receipt has been downloaded as "${receiptFilename}".\n\nWe will call you at ${phone} when your order is ready!`);
      closeModal();
    });
  }
}

/* --------------------------------------------------------------------------
   4. Contact & Order Inquiry Form Validation & Handling with Receipt
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-button');

  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById('full-name'),
      error: document.getElementById('name-error'),
      validate: (val) => val.trim().length >= 2,
      message: 'Please provide your full name (at least 2 letters).'
    },
    phone: {
      input: document.getElementById('phone-number'),
      error: document.getElementById('phone-error'),
      validate: (val) => {
        const cleanDigits = val.replace(/\D/g, '');
        return cleanDigits.length >= 7;
      },
      message: 'Please enter a valid mobile number or landline (at least 7 digits).'
    },
    service: {
      input: document.getElementById('service-type'),
      error: document.getElementById('service-error'),
      validate: (val) => Boolean(val),
      message: 'Please choose an option for type of service.'
    },
    message: {
      input: document.getElementById('order-details'),
      error: document.getElementById('message-error'),
      validate: (val) => val.trim().length >= 5,
      message: 'Please describe the dishes you would like to order or your inquiry.'
    }
  };

  // Clear errors on input
  Object.values(fields).forEach(({ input, error }) => {
    if (!input || !error) return;
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      error.textContent = '';
      if (alertBox) {
        alertBox.className = 'form-alert';
        alertBox.textContent = '';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate each field
    Object.values(fields).forEach(({ input, error, validate, message }) => {
      if (!input || !error) return;
      if (!validate(input.value)) {
        input.classList.add('is-invalid');
        error.textContent = message;
        if (isValid) {
          input.focus();
        }
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
        error.textContent = '';
      }
    });

    if (!isValid) return;

    // Show simulated loading state
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    const customerName = fields.name.input.value.trim();
    const customerPhone = fields.phone.input.value.trim();
    const customerEmail = document.getElementById('email-address')?.value.trim() || 'N/A';
    const serviceName = fields.service.input.options[fields.service.input.selectedIndex].text;
    const orderDetails = fields.message.input.value.trim();

    // Generate Unique Inquiry / Order Reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `CHTO-INQ-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // Generate Receipt Text Content
    const receiptText = generateOrderReceipt({
      orderRef,
      customerName,
      customerPhone,
      customerEmail,
      serviceType: serviceName,
      items: [],
      notes: orderDetails,
      totalAmount: null
    });

    const receiptFilename = `Chitos_Inquiry_Receipt_${orderRef}.txt`;

    // Simulate async submission and trigger download
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }

      // Automatically download receipt .txt
      downloadReceiptFile(receiptFilename, receiptText);

      if (alertBox) {
        alertBox.className = 'form-alert alert-success';
        alertBox.innerHTML = `
          <strong>Maraming salamat, ${customerName}!</strong><br>
          Your order / inquiry reference is <strong>#${orderRef}</strong>.<br>
          Your official receipt has been downloaded as <code>${receiptFilename}</code>.<br>
          Our team will contact you at <strong>${customerPhone}</strong> shortly.
        `;
      }

      form.reset();
    }, 700);
  });
}

/* --------------------------------------------------------------------------
   5. Sticky Header Scroll Enhancement
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
