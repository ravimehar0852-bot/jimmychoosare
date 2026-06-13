/* ===================================================
   JIMMY CHOO SAREE — Script.js
   Handles: Header, Gallery, Lightbox, Reviews, FAQ,
            Order Modal (3-step), WhatsApp Integration
=================================================== */

'use strict';

/* ─── DOM Ready ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initScrollAnimations();
  initGallery();
  initReviewSlider();
  initFAQ();
  initModal();
});


/* ─── HEADER ─────────────────────────────── */
function initHeader() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  // Sticky scroll
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}


/* ─── SCROLL ANIMATIONS ──────────────────── */
function initScrollAnimations() {
  const fadeEls = document.querySelectorAll('.fade-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // Stagger siblings
        const siblings = e.target.parentElement.querySelectorAll('.fade-up');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === e.target) delay = idx * 80;
        });
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => obs.observe(el));
}


/* ─── GALLERY & LIGHTBOX ─────────────────── */
const galleryImages = [
  "images/saree1.jpg",
  "images/saree2.jpg",
  "images/saree3.jpg",
  "images/saree4.jpg"
];

let lightboxIndex = 0;

function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  items.forEach(item => {
    item.addEventListener('click', () => {
      lightboxIndex = parseInt(item.dataset.index, 10);
      openLightbox();
    });
  });

  function openLightbox() {
    lbImg.src = galleryImages[lightboxIndex];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
    lbImg.src = galleryImages[lightboxIndex];
  }
  function showPrev() {
    lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    lbImg.src = galleryImages[lightboxIndex];
  }

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Touch swipe on lightbox
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx > 0 ? showPrev() : showNext();
  });
}


/* ─── REVIEW SLIDER ──────────────────────── */
function initReviewSlider() {
  const slider = document.getElementById('reviewsSlider');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');
  const dotsContainer = document.getElementById('sliderDots');
  const cards = slider.querySelectorAll('.review-card');

  let current = 0;
  let perView = getPerView();
  const total = cards.length;
  let maxIndex = Math.max(0, total - perView);

  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const numDots = Math.ceil(total / perView);
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap
    slider.style.transform = `translateX(-${current * cardWidth}px)`;
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === Math.floor(current / Math.max(1, Math.floor(total / Math.ceil(total / perView)))));
    });
    // Simpler: dot active = which "page"
    const dotPage = Math.floor(current / perView);
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === dotPage);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx > 0 ? goTo(current - 1) : goTo(current + 1);
  });

  // Auto-play
  let autoTimer = setInterval(() => goTo(current + 1 > maxIndex ? 0 : current + 1), 4500);
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => goTo(current + 1 > maxIndex ? 0 : current + 1), 4500);
  });

  // Responsive
  window.addEventListener('resize', () => {
    const newPerView = getPerView();
    if (newPerView !== perView) {
      perView = newPerView;
      maxIndex = Math.max(0, total - perView);
      current = 0;
      slider.style.transform = 'translateX(0)';
      buildDots();
    }
  });

  buildDots();
}


/* ─── FAQ ACCORDION ──────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open')); // close others
      if (!isOpen) item.classList.add('open');
    });
  });
}


/* ─── MODAL STATE ────────────────────────── */
const state = {
  name: '', mobile: '', altMobile: '',
  house: '', street: '', city: '', stateVal: '', pincode: '',
  payMethod: 'cod', utr: '',
};

function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showStep(1);
}
window.openModal = openModal;

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

// Close overlay on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
});


/* ─── STEP NAVIGATION ────────────────────── */
function showStep(n) {
  [1,2,3,'Success'].forEach(s => {
    const el = document.getElementById(`step${s}`);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(`step${n}`);
  if (target) target.classList.remove('hidden');

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`stepInd${i}`);
    ind.classList.remove('active', 'done');
    if (i < n) ind.classList.add('done');
    else if (i === n) ind.classList.add('active');
  }
  // Update step lines
  const lines = document.querySelectorAll('.step-line');
  lines.forEach((line, idx) => {
    line.classList.toggle('done', idx < n - 1);
  });

  // Scroll modal to top
  document.getElementById('orderModal').scrollTop = 0;
}

function goStep1() { showStep(1); }
window.goStep1 = goStep1;

function goStep2() {
  // Validate step 1
  const name = document.getElementById('fullName').value.trim();
  const mobile = document.getElementById('mobileNum').value.trim();
  let valid = true;

  if (!name) {
    setErr('errName', 'Please enter your full name.');
    document.getElementById('fullName').classList.add('error');
    valid = false;
  } else {
    clearErr('errName');
    document.getElementById('fullName').classList.remove('error');
  }

  if (!mobile) {
    setErr('errMobile', 'Please enter your mobile number.');
    document.getElementById('mobileNum').classList.add('error');
    valid = false;
  } else if (!/^\d{10}$/.test(mobile)) {
    setErr('errMobile', 'Mobile number must be exactly 10 digits.');
    document.getElementById('mobileNum').classList.add('error');
    valid = false;
  } else {
    clearErr('errMobile');
    document.getElementById('mobileNum').classList.remove('error');
  }

  if (!valid) return;

  state.name = name;
  state.mobile = mobile;
  state.altMobile = document.getElementById('altMobile').value.trim();

  showStep(2);
}
window.goStep2 = goStep2;

function goStep3() {
  // Validate step 2
  const fields = [
    { id: 'houseNum', err: 'errHouse', msg: 'Please enter house / flat number.' },
    { id: 'street', err: 'errStreet', msg: 'Please enter street / area.' },
    { id: 'city', err: 'errCity', msg: 'Please enter city.' },
    { id: 'state', err: 'errState', msg: 'Please enter state.' },
  ];
  let valid = true;

  fields.forEach(f => {
    const val = document.getElementById(f.id).value.trim();
    if (!val) {
      setErr(f.err, f.msg);
      document.getElementById(f.id).classList.add('error');
      valid = false;
    } else {
      clearErr(f.err);
      document.getElementById(f.id).classList.remove('error');
    }
  });

  const pincode = document.getElementById('pincode').value.trim();
  if (!pincode) {
    setErr('errPincode', 'Please enter your pincode.');
    document.getElementById('pincode').classList.add('error');
    valid = false;
  } else if (!/^\d{6}$/.test(pincode)) {
    setErr('errPincode', 'Pincode must be exactly 6 digits.');
    document.getElementById('pincode').classList.add('error');
    valid = false;
  } else {
    clearErr('errPincode');
    document.getElementById('pincode').classList.remove('error');
  }

  if (!valid) return;

  state.house = document.getElementById('houseNum').value.trim();
  state.street = document.getElementById('street').value.trim();
  state.city = document.getElementById('city').value.trim();
  state.stateVal = document.getElementById('state').value.trim();
  state.pincode = pincode;

  showStep(3);
}
window.goStep3 = goStep3;


/* ─── PAYMENT METHOD TOGGLE ──────────────── */
function payMethodChange(radio) {
  state.payMethod = radio.value;
  const codSection = document.getElementById('codSection');
  const upiSection = document.getElementById('upiSection');
  const displayPrice = document.getElementById('displayPrice');

  if (radio.value === 'upi') {
    codSection.classList.add('hidden');
    upiSection.classList.remove('hidden');
    displayPrice.textContent = '₹1,199';
  } else {
    upiSection.classList.add('hidden');
    codSection.classList.remove('hidden');
    displayPrice.textContent = '₹1,299';
  }
}
window.payMethodChange = payMethodChange;


/* ─── UPI LAUNCHER ───────────────────────── */
function launchUPI(app) {
  const upiId = '8504843164-2@ybl';
  const amount = '1199';
  const name = 'Jimmy%20Choo%20Saree';
  const baseUPI = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

  const deepLinks = {
    phonepe: `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    gpay: `tez://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    paytm: `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`,
    bhim: baseUPI,
  };

  const link = deepLinks[app] || baseUPI;

  // Try deep link, fall back to base UPI
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.src = link;
  setTimeout(() => {
    document.body.removeChild(iframe);
    // If app didn't open, open generic UPI intent
    window.location.href = baseUPI;
  }, 1500);
}
window.launchUPI = launchUPI;


/* ─── PLACE ORDER ────────────────────────── */
function placeOrder(method) {
  if (method === 'upi') {
    const utr = document.getElementById('utrNum').value.trim();
    if (!utr) {
      setErr('errUTR', 'Please enter your UTR / Transaction ID.');
      document.getElementById('utrNum').classList.add('error');
      return;
    }
    clearErr('errUTR');
    document.getElementById('utrNum').classList.remove('error');
    state.utr = utr;
  }

  state.payMethod = method;
  const now = new Date();
  const orderTime = now.toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  });

  const fullAddress = `${state.house}, ${state.street}, ${state.city}, ${state.stateVal} - ${state.pincode}`;
  const payLabel = method === 'upi' ? 'Prepaid UPI' : 'Cash on Delivery (COD)';
  const amount = method === 'upi' ? '₹1,199' : '₹1,299';

  // Show success screen
  showStep('Success');

  document.getElementById('successDetails').innerHTML = `
    <p><strong>Name:</strong> ${state.name}</p>
    <p><strong>Mobile:</strong> ${state.mobile}${state.altMobile ? ' | Alt: ' + state.altMobile : ''}</p>
    <p><strong>Address:</strong> ${fullAddress}</p>
    <p><strong>Product:</strong> Jimmy Choo Saree</p>
    <p><strong>Amount:</strong> ${amount}</p>
    <p><strong>Payment:</strong> ${payLabel}</p>
    ${method === 'upi' ? `<p><strong>Transaction ID:</strong> ${state.utr}</p>` : ''}
    <p><strong>Order Time:</strong> ${orderTime}</p>
  `;

  // WhatsApp message
  const msg = encodeURIComponent(
`🛍️ *New Jimmy Choo Saree Order*

👤 *Customer Name:* ${state.name}
📱 *Mobile:* ${state.mobile}${state.altMobile ? '\n📱 *Alt Number:* ' + state.altMobile : ''}

📦 *Address:*
${fullAddress}

🛍️ *Product:* Jimmy Choo Saree
💰 *Price:* ${amount}
💳 *Payment Method:* ${payLabel}
${method === 'upi' ? `🔖 *Transaction ID:* ${state.utr}` : ''}

🕒 *Order Time:* ${orderTime}

_Placed via jimmychoosaree.in_`
  );

  // Open WhatsApp after short delay (let success screen show)
  setTimeout(() => {
    window.open(`https://wa.me/918504843164?text=${msg}`, '_blank');
  }, 1200);
}
window.placeOrder = placeOrder;


/* ─── HELPERS ────────────────────────────── */
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
