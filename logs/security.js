
const SECURITY_CONFIG = {

  allowedDomains: [
    'mailspoof.orildo.sbs',
    'orildo.sbs',
    'localhost',
    '127.0.0.1'
  ],
  
  
  protectedPaths: [
    '/logs/',
    '/bug/report/',
    '/admin/',
    '/api/'
  ],
  
  blockedPaths: [
    '/.env',
    '/.git',
    '/.htaccess',
    '/logs/main.js',
    '/logs/report.js',
    '/logs/splash.js',
    '/style/',
    '/assets/'
  ],
  errorPages: {
    404: '/404.html',
    500: '/500.html',
    503: '/503.html',
    forbidden: '/404.html'
  }
};


function validateDomain() {
  const currentDomain = window.location.hostname;
  const isAllowed = SECURITY_CONFIG.allowedDomains.some(domain => {
    return currentDomain === domain || currentDomain.endsWith('.' + domain);
  });
  
  if (!isAllowed) {
    console.warn('Security: Invalid domain detected:', currentDomain);
    if (!window.location.pathname.includes('404.html')) {
      window.location.href = SECURITY_CONFIG.errorPages.forbidden + '?reason=invalid_domain';
    }
    return false;
  }
  
  return true;
}

function validatePath() {
  const currentPath = window.location.pathname;
  
  const isBlocked = SECURITY_CONFIG.blockedPaths.some(path => {
    return currentPath.includes(path) || currentPath.startsWith(path);
  });
  
  if (isBlocked) {
    console.warn('Security: Blocked path accessed:', currentPath);
    if (!currentPath.includes('404.html')) {
      window.location.href = SECURITY_CONFIG.errorPages.forbidden + '?reason=blocked_path';
    }
    return false;
  }
  
  const isProtected = SECURITY_CONFIG.protectedPaths.some(path => {
    return currentPath.includes(path) || currentPath.startsWith(path);
  });
  
  if (isProtected) {
    console.warn('Security: Protected path accessed:', currentPath);
    }
  
  return true;
}

function validateHTTPS() {
  if (window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    console.warn('Security: Non-HTTPS connection detected');
    const httpsUrl = 'https://' + window.location.host + window.location.pathname + window.location.search;
    window.location.href = httpsUrl;
    return false;
  }
  return true;
}

function validateSecurityHeaders() {
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!csp) {
    console.warn('Security: CSP meta tag missing');
  }
  
  const xFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
  if (!xFrameOptions) {
    console.warn('Security: X-Frame-Options header missing');
  }
}

function preventClickjacking() {
  if (window.self !== window.top) {
    console.warn('Security: Page loaded in iframe - potential clickjacking attempt');
  
  }
}

function validateURLParams() {
  const params = new URLSearchParams(window.location.search);
  const dangerousParams = ['<script', 'javascript:', 'onerror=', 'onload=', 'eval('];
  
  for (const [key, value] of params) {
    for (const dangerous of dangerousParams) {
      if (value.toLowerCase().includes(dangerous)) {
        console.warn('Security: Dangerous URL parameter detected:', key);
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
      }
    }
  }
}

function logSecurityEvent(event, details) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event: event,
    details: details,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    url: window.location.href
  };
  
  console.log('Security Event:', securityLog);
  

}

function handleSecurityError(reason) {
  const urlParams = new URLSearchParams(window.location.search);
  const errorReason = urlParams.get('reason') || reason;

  const errorReasonEl = document.getElementById('errorReason');
  if (errorReasonEl) {
    const messages = {
      'invalid_domain': 'Access denied: Invalid domain',
      'blocked_path': 'Access denied: Restricted path',
      'security_violation': 'Access denied: Security violation'
    };
    errorReasonEl.textContent = messages[errorReason] || 'Access denied';
  }
  
  logSecurityEvent('security_error', { reason: errorReason });
}

function initSecurity() {
  console.log('Initializing MailSpoof Security...');
  
  const domainValid = validateDomain();
  const pathValid = validatePath();
  const httpsValid = validateHTTPS();
  
  validateSecurityHeaders();
  preventClickjacking();
  validateURLParams();
  
  if (window.location.pathname.includes('404.html') || 
      window.location.pathname.includes('500.html') || 
      window.location.pathname.includes('503.html')) {
    handleSecurityError();
  }
  
  if (domainValid && pathValid && httpsValid) {
    logSecurityEvent('security_init_success', {
      domain: window.location.hostname,
      path: window.location.pathname
    });
  }
}

function monitorSecurity() {
  window.addEventListener('error', (event) => {
    logSecurityEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logSecurityEvent('unhandled_rejection', {
      reason: event.reason
    });
  });
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { 
            const scripts = node.querySelectorAll ? node.querySelectorAll('script') : [];
            scripts.forEach((script) => {
              if (script.src && !script.src.includes(window.location.hostname)) {
                console.warn('Security: External script detected:', script.src);
              }
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSecurity();
    monitorSecurity();
  });
} else {
  initSecurity();
  monitorSecurity();
}

window.MailSpoofSecurity = {
  validateDomain,
  validatePath,
  validateHTTPS,
  logSecurityEvent,
  SECURITY_CONFIG
};
