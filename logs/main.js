document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
      }
    });
  }

  const cookieOverlay = document.getElementById('cookieOverlay');
  const cookieConsent = document.getElementById('cookieConsent');
  const cookieBlocked = document.getElementById('cookieBlocked');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const cookieRemodify = document.getElementById('cookieRemodify');

  if (cookieOverlay) {
    const consent = localStorage.getItem('cookieConsent');
    if (consent !== 'accepted') {
      cookieOverlay.classList.add('show');
      if (consent === 'rejected' && cookieConsent && cookieBlocked) {
        cookieConsent.classList.remove('show');
        cookieBlocked.classList.add('show');
      }
    }

    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieOverlay.classList.remove('show');
      });
    }

    if (cookieReject) {
      cookieReject.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        if (cookieConsent && cookieBlocked) {
          cookieConsent.classList.remove('show');
          cookieBlocked.classList.add('show');
        }
      });
    }

    if (cookieRemodify) {
      cookieRemodify.addEventListener('click', () => {
        if (cookieConsent && cookieBlocked) {
          cookieBlocked.classList.remove('show');
          cookieConsent.classList.add('show');
        }
      });
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  const term = document.getElementById('typewriter');
  if (term) {
    const lines = term.dataset.lines ? JSON.parse(term.dataset.lines) : [
      { text: '$ mailspoof start --port 2525', cls: 'cmd' },
      { text: '[+] SMTP server running on 0.0.0.0:2525', cls: 'output' },
      { text: '$ mailspoof test 1 target@company.com', cls: 'cmd' },
      { text: '[TARGET]  target@company.com', cls: 'output' },
      { text: '[FROM]    John Smith, CEO <ceo@company.com>', cls: 'output' },
      { text: '[SUBJECT] URGENT: Wire Transfer Authorization Required', cls: 'output' },
      { text: '[STATUS]  Connecting... SENT', cls: 'output' }
    ];
    let li = 0, ci = 0;
    term.textContent = '';
    function typeNext() {
      if (li >= lines.length) return;
      const line = lines[li];
      let row = term.children[li];
      if (!row) {
        row = document.createElement('div');
        row.className = 'tline ' + line.cls;
        term.appendChild(row);
      }
      if (ci < line.text.length) {
        row.textContent += line.text[ci++];
        setTimeout(typeNext, 18);
      } else {
        ci = 0; li++;
        setTimeout(typeNext, 300);
      }
    }
    setTimeout(typeNext, 600);
  }

  document.querySelectorAll('.footer-col').forEach(col => {
    if (col.querySelector('.footer-links')) return;
    const links = col.querySelectorAll('a');
    if (links.length === 0) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-links';
    links.forEach(a => wrapper.appendChild(a));
    col.appendChild(wrapper);
    const h5 = col.querySelector('h5');
    if (h5) {
      h5.addEventListener('click', () => {
        if (window.innerWidth <= 767) col.classList.toggle('open');
      });
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
      document.querySelectorAll('.footer-col').forEach(col => col.classList.remove('open'));
    }
  });

  const docsNav = document.querySelector('.docs-nav');
  const docsContent = document.querySelector('.docs-content');
  if (docsNav && docsContent) {
    const sectionHeadings = Array.from(docsContent.querySelectorAll('h3[id], h2[id]'));
    const navLinks = Array.from(docsNav.querySelectorAll('a[href^="#"]'));
    if (sectionHeadings.length && navLinks.length) {

      sectionHeadings.forEach(h => { h.style.scrollMarginTop = '100px'; });

      let currentActive = null;
      const OFFSET = 160;
      const NAVBAR_CLEARANCE = 100;

      const isSidebarVisible = () => getComputedStyle(docsNav).display !== 'none';

      const spy = () => {
        if (!isSidebarVisible()) {
          if (currentActive !== null) {
            navLinks.forEach(a => a.classList.remove('active'));
            currentActive = null;
          }
          return;
        }

        let activeId = '';

        sectionHeadings.forEach(h => {
          if (h.getBoundingClientRect().top <= OFFSET) {
            activeId = h.id;
          }
        });

        const scrollBottom = window.innerHeight + Math.round(window.scrollY);
        const docHeight = document.documentElement.scrollHeight;
        if (!activeId && scrollBottom >= docHeight - 20) {
          activeId = sectionHeadings[sectionHeadings.length - 1].id;
        }

        if (!activeId) {
          activeId = sectionHeadings[0].id;
        }

        if (activeId !== currentActive) {
          currentActive = activeId;
          navLinks.forEach(a => a.classList.remove('active'));
          const match = navLinks.find(a => a.getAttribute('href') === '#' + activeId);
          if (match) match.classList.add('active');
        }
      };

      navLinks.forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          const target = document.getElementById(href.slice(1));
          if (!target) return;
          e.preventDefault();
          const y = target.getBoundingClientRect().top + window.scrollY - NAVBAR_CLEARANCE;
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
      });

      window.addEventListener('scroll', spy, { passive: true });
      window.addEventListener('resize', spy);
      spy();
    }
  }
});
