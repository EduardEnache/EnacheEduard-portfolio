/** Contact form: inline validation (role="alert" messages), honeypot, sending / sent / failed states. Only wired when an endpoint is configured. */
import { scene, mm, conditions } from '../motion';

const MESSAGES: Record<string, [string, string?]> = {
  name: ['Please tell me your name.'],
  email: ['Please enter your email address.', 'That email address does not look right.'],
  message: ['Please write a short message.'],
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

scene('contact-form', (form) => {
  if (!(form instanceof HTMLFormElement) || form.dataset.liveForm === undefined) return;
  mm.add({ motion: conditions.motion, reduce: conditions.reduce }, () => {
    const status = form.querySelector<HTMLElement>('[data-status]')!;
    const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    const fields = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#f-name, #f-email, #f-message')];
    let ctl: AbortController | undefined;
    form.noValidate = true; // our messages replace the browser bubbles; without JS the native ones still work

    const problem = (f: HTMLInputElement | HTMLTextAreaElement) => {
      const [empty, bad] = MESSAGES[f.name];
      const v = f.value.trim();
      return !v ? empty : f.name === 'email' && !EMAIL.test(v) ? bad : '';
    };
    const show = (f: HTMLInputElement | HTMLTextAreaElement) => {
      const msg = problem(f) ?? '';
      form.querySelector<HTMLElement>(`#e-${f.name}`)!.textContent = msg;
      f.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    };
    const touched = new Set<Element>();
    const onBlur = (e: Event) => { touched.add(e.target as Element); show(e.target as HTMLInputElement); };
    const onInput = (e: Event) => { if (touched.has(e.target as Element)) show(e.target as HTMLInputElement); };
    fields.forEach((f) => { f.addEventListener('blur', onBlur); f.addEventListener('input', onInput); });

    const say = (text: string, kind = '') => { status.textContent = text; status.dataset.kind = kind; };
    const onSubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      fields.forEach((f) => touched.add(f));
      const bad = fields.filter((f) => !show(f));
      if (bad.length) { bad[0].focus(); return; }
      if ((form.elements.namedItem('_honey') as HTMLInputElement).value) { form.dataset.state = 'sent'; form.querySelector<HTMLElement>('.done')!.hidden = false; return; } // honeypot: pretend, send nothing
      button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Sending';
      say('Sending your message.');
      ctl = new AbortController();
      try {
        const res = await fetch(form.dataset.ajax!, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(15000)]),
          body: JSON.stringify({ ...Object.fromEntries(fields.map((f) => [f.name, f.value.trim()])), _subject: 'Message from eduardenache.ro', _template: 'table', _captcha: 'false' }),
        });
        // FormSubmit answers {"success":"true"|"false","message":...}; "false" also comes back for a not-yet-activated address
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) !== 'true') throw new Error(String(res.status));
        form.dataset.state = 'sent';
        const done = form.querySelector<HTMLElement>('.done')!;
        done.hidden = false; done.focus();
      } catch (err) {
        if ((err as Error).name === 'AbortError' && ctl.signal.aborted) return;
        say(`Could not send. Your message is still here: try again, or write to ${form.dataset.email} directly.`, 'failed');
        button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = 'Send again'; button.focus(); // focus fell to <body> while the button was disabled
      }
    };
    form.addEventListener('submit', onSubmit);
    if (new URLSearchParams(location.search).has('sent')) { form.dataset.state = 'sent'; form.querySelector<HTMLElement>('.done')!.hidden = false; } // back from a no-JS post

    return () => {
      ctl?.abort();
      form.noValidate = false;
      form.removeEventListener('submit', onSubmit);
      fields.forEach((f) => { f.removeEventListener('blur', onBlur); f.removeEventListener('input', onInput); });
    };
  });
});
