function getTarget() {
  return 'https://discord.com/api/webhooks/1512479784603750500/MPpdx8ZspDDfokLh3Adk4yMpzhdtEsARBDdREgBsTvXQhEUaGFt9p2lSUH9Kjhp4yY2y';
}

function hasTarget() {
  return !!getTarget();
}

function checkRateLimit() {
  const _d = 'ms_r_d';
  const _c = 'ms_r_c';
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(_d);
  let count = parseInt(localStorage.getItem(_c), 10) || 0;

  if (storedDate !== today) {
    localStorage.setItem(_d, today);
    count = 0;
  }

  if (count >= 3) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: 3 - count };
}

function incrementRateLimit() {
  const _c = 'ms_r_c';
  const count = (parseInt(localStorage.getItem(_c), 10) || 0) + 1;
  localStorage.setItem(_c, String(count));
}

function _s(v, max) {
  let s = String(v || '').trim();
  if (s.length > max) s = s.slice(0, max);
  s = s.replace(/[@<>\[\]\|\`\\]/g, '');
  return s;
}

async function sendBugReport(formData) {
  const limit = checkRateLimit();
  if (!limit.allowed) {
    throw new Error('Daily limit reached. You can submit up to 3 reports per day.');
  }

  const url = getTarget();
  if (!url) {
    throw new Error('Delivery endpoint is not configured.');
  }

  const github = _s(formData.get('github'), 39);

  const fields = [
    { name: 'Name', value: _s(formData.get('name'), 100), inline: true },
    { name: 'Email', value: _s(formData.get('email'), 254), inline: true },
    { name: 'Severity', value: _s(formData.get('severity'), 20).toUpperCase(), inline: true },
    { name: 'Version', value: _s(formData.get('version'), 50), inline: true },
    { name: 'Environment', value: _s(formData.get('environment'), 200), inline: true },
    { name: 'Description', value: _s(formData.get('description'), 2000) },
    { name: 'Steps to Reproduce', value: _s(formData.get('steps'), 1000) }
  ];

  if (github) {
    fields.splice(1, 0, { name: 'GitHub', value: '@' + github, inline: true });
  }

  const payload = {
    username: _s('MailSpoof Bug Reporter', 80),
    avatar_url: 'https://raw.githubusercontent.com/syed-sameer-ul-hassan/MailSpoof/main/assets/icon.svg',
    embeds: [{
      title: 'Bug Report: ' + _s(formData.get('subject'), 200),
      color: 0xC94242,
      fields: fields,
      footer: { text: _s('Submitted via MailSpoof website', 200) },
      timestamp: new Date().toISOString()
    }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Server returned ' + res.status);
  }

  incrementRateLimit();
  return true;
}
