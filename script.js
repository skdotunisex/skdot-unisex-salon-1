
(() => {
  // Mobile menu
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.navlinks');

  if (menu && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = 'Menu';
    };

    menu.setAttribute('aria-expanded', 'false');
    menu.onclick = () => {
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(isOpen));
      menu.textContent = isOpen ? 'Close' : 'Menu';
    };

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // Customer support links
  document.querySelectorAll('.navlinks').forEach(nav => {
    const cart = nav.querySelector('.cart-link');

    [
      ['support.html', 'Customer Support'],
      ['request-chat.html', 'My Request / Chat']
    ].forEach(([href, label]) => {
      if (!nav.querySelector(`a[href="${href}"]`)) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        nav.insertBefore(a, cart || null);
      }
    });
  });

  // Light and dark theme toggle
  const themeKey = 'skdot-theme';
  let theme = 'light';

  try {
    theme = localStorage.getItem(themeKey) || 'light';
  } catch (e) {}

  document.documentElement.dataset.theme = theme;

  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'theme-toggle';
  themeButton.setAttribute('aria-label', 'Switch colour theme');

  const updateThemeLabel = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeButton.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
    themeButton.setAttribute('aria-pressed', String(dark));
  };

  themeButton.addEventListener('click', () => {
    const next =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem(themeKey, next);
    } catch (e) {}

    updateThemeLabel();
  });

  const themeHost =
    document.querySelector('.nav') ||
    document.querySelector('.header');

  if (themeHost) {
    themeHost.appendChild(themeButton);
    updateThemeLabel();
  }

  // Appointment booking
  const bookingForm = document.querySelector('[data-booking]');

  if (bookingForm) {
    const dateInput = bookingForm.querySelector('[name="date"]');
    const timeInput = bookingForm.querySelector('[name="time"]');

    if (dateInput) {
      const now = new Date();
      dateInput.min = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
    }

    if (timeInput) {
      timeInput.min = '08:00';
      timeInput.max = '20:00';
      timeInput.step = '900';
    }

    bookingForm.addEventListener('submit', async event => {
      event.preventDefault();

      const formData = new FormData(bookingForm);
      const values = Object.fromEntries(formData.entries());
      const time = String(values.time || '');

      if (!time || time < '08:00' || time > '20:00') {
        alert('Please choose an appointment time between 08:00 and 20:00.');
        timeInput?.focus();
        return;
      }

      if (String(values.date || '') < (dateInput?.min || '')) {
        alert('Please choose today or a future date.');
        dateInput?.focus();
        return;
      }

      const button = bookingForm.querySelector('button[type="submit"]');
      const originalText = button?.textContent || 'Submit request';

      if (button) {
        button.disabled = true;
        button.textContent = 'Saving appointment request…';
      }

      try {
        const payload = {
          name: values.name,
          phone: values.phone,
          booking_type: values.booking_type,
          service_name: values.service,
          preferred_date: values.date,
          preferred_time: values.time,
          service_location: values.location || '',
          customer_note: values.note || ''
        };

        const response = await fetch(
          'https://xiumeinjpxqfnokeeszi.supabase.co/functions/v1/appointments',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'sb_publishable_ZY9Zda1FeKv5talqm_FxDw_Xsxi8D-b'
            },
            body: JSON.stringify(payload)
          }
        );

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error('Invalid response from the booking service.');
        }

        if (!response.ok || !data.ok) {
          throw new Error(
            data.error || 'Unable to save your appointment. Please try again.'
          );
        }

        const appointment = data.appointment;

        if (!appointment?.id) {
          throw new Error('No booking reference was returned.');
        }

        const message = [
          'SKDOT UNISEX SALON APPOINTMENT REQUEST',
          'Request code: ' + appointment.id,
          'Status: ' + (appointment.status || 'Pending review'),
          'Name: ' + (values.name || ''),
          'Phone: ' + (values.phone || ''),
          'Booking type: ' + (values.booking_type || ''),
          'Service: ' + (values.service || ''),
          'Preferred date: ' + (values.date || ''),
          'Preferred time: ' + (values.time || ''),
          'Location: ' + (values.location || 'N/A'),
          'Details: ' + (values.note || 'N/A'),
          'Request status/chat: ' + location.origin + '/request-chat.html'
        ].join('\n');

        try {
          localStorage.setItem('skdot_last_booking', message);
          localStorage.setItem('skdot_last_appointment_id', appointment.id);
        } catch (e) {}

        const messageField = document.querySelector('[data-message]');
        if (messageField) messageField.value = message;

        const result = document.querySelector('[data-result]');

        if (result) {
          result.hidden = false;
          result.textContent =
            'Request saved. Reference: ' + appointment.id +
            '. Your appointment is pending SKDOT review and is not yet confirmed.';
        }

        const whatsapp = document.querySelector('[data-whatsapp]');

        if (whatsapp) {
          whatsapp.href =
            'https://wa.me/2349064653935?text=' +
            encodeURIComponent(message);
        }

        if (button) button.textContent = 'Request saved ✓';
      } catch (error) {
        alert(error.message || 'Booking failed. Please try again.');

        if (button) {
          button.textContent = originalText;
          button.disabled = false;
        }
      }
    });
  }

  // Copy booking message
  const copyButton = document.querySelector('[data-copy]');

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const field = document.querySelector('[data-message]');
      if (!field) return;

      try {
        await navigator.clipboard.writeText(field.value);
      } catch (error) {
        field.select();
        document.execCommand('copy');
      }

      copyButton.textContent = 'Copied';
    });
  }

  // Bottom mobile navigation
  const bar = document.querySelector('.mobile-action-bar');

  if (bar) {
    const path =
      (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    const links = [
      ['index.html', 'Home'],
      ['services.html', 'Services'],
      ['gallery.html', 'Gallery'],
      ['shop.html', 'Shop'],
      ['booking.html', 'Book'],
      ['contact.html', 'Contact']
    ];

    bar.innerHTML = links.map(([href, label]) => {
      const active = href === path ||
        ((path === '' || path === 'index.html') && href === 'index.html');

      return `<a href="${href}" class="${active ? 'active' : ''}">
        <span>${label}</span>
      </a>`;
    }).join('');
  }

  // Client-side interaction events.
  // Netlify customer-event calls are intentionally omitted on Cloudflare Pages.
  const notify = (event, details = {}) => {
    window.dispatchEvent(new CustomEvent('skdot:customer-event', {
      detail: { event, page: location.pathname, ...details }
    }));
  };

  notify('page_view');

  document.addEventListener('click', event => {
    const element = event.target?.closest?.('a, button');
    if (!element) return;

    notify('click', {
      label: (element.innerText || element.getAttribute('aria-label') || '')
        .trim().slice(0, 200),
      target: (element.getAttribute('href') || '').slice(0, 300)
    });
  });

  window.SKDOT_NOTIFY = notify;
})();
