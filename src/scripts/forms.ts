// Wires every [data-contact] and [data-subscribe] form on the page to the
// Supabase `contact` edge function, which stores the submission and emails the team.
import { site } from '../data/site';

const endpoint = `${site.supabase.url}/functions/v1/contact`;
const openedAt = Date.now();

async function post(payload: Record<string, unknown>) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: site.supabase.key },
    body: JSON.stringify({ ...payload, elapsed_ms: Date.now() - openedAt, source_page: location.pathname }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function setStatus(form: HTMLFormElement, text: string, kind: 'ok' | 'err' | '') {
  const el = form.querySelector<HTMLElement>('.form-status');
  if (!el) return;
  el.textContent = text;
  el.className = `form-status ${kind}`;
}

function busy(form: HTMLFormElement, on: boolean, label?: string) {
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!btn) return;
  if (on) {
    btn.dataset.label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = label ?? 'Sending…';
  } else {
    btn.disabled = false;
    if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
  }
}

document.querySelectorAll<HTMLFormElement>('form[data-subscribe]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setStatus(form, 'Please enter a valid email address.', 'err');
      return;
    }
    busy(form, true, 'Joining…');
    try {
      await post({ kind: 'subscribe', email, website: fd.get('website') });
      form.reset();
      setStatus(form, 'You’re on the list. Thank you!', 'ok');
    } catch (err) {
      setStatus(form, (err as Error).message, 'err');
    } finally {
      busy(form, false);
    }
  });
});

document.querySelectorAll<HTMLFormElement>('form[data-contact]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    busy(form, true);
    setStatus(form, '', '');
    try {
      await post({
        kind: 'contact',
        name: fd.get('name'),
        email: fd.get('email'),
        organization: fd.get('organization'),
        topic: fd.get('topic'),
        message: fd.get('message'),
        website: fd.get('website'),
      });
      form.reset();
      form.classList.add('sent');
      setStatus(form, 'Thank you — your message is on its way. We usually reply within two business days.', 'ok');
    } catch (err) {
      setStatus(form, (err as Error).message, 'err');
    } finally {
      busy(form, false);
    }
  });
});
