/*
  Общая форма заявки для всех демо-сайтов.
  Заявка уходит в Google Apps Script → строка в Google Таблице + сообщение в Telegram.
  На странице должны быть: form#form, p#err, button#sendBtn, div#done, button#againBtn
  и поля name, phone, service, when, comment (+ невидимое поле website — ловушка для ботов).
*/
const FORM_URL = 'https://script.google.com/macros/s/AKfycbxDTOzwQDB9VyUvsiToZ-AlUGJTSYuoA4ec183ATgLRNpyut8vwUrix86Cb2i_LpxNL/exec';

function formatPhone(text) {
  let d = text.replace(/\D/g, '');
  if (d.length === 10) d = '7' + d;
  else if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length !== 11 || d[0] !== '7') return null;
  return `+7 ${d.slice(1,4)} ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
}

(function () {
  const form = document.getElementById('form');
  const err = document.getElementById('err');
  const btn = document.getElementById('sendBtn');
  const done = document.getElementById('done');
  const btnText = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = formatPhone(f.phone.value);
    if (name.length < 2) { err.textContent = 'Напишите имя — хотя бы 2 буквы.'; f.name.focus(); return; }
    if (!phone) { err.textContent = 'Проверьте телефон: нужен российский номер, например +7 900 123-45-67.'; f.phone.focus(); return; }
    if (f.website && f.website.value) return;   // ловушка для спам-ботов

    const data = {
      name, phone,
      service: f.service ? f.service.value : '',
      when: f.when ? f.when.value.trim() : '',
      comment: f.comment ? f.comment.value.trim() : '',
      page: location.href,
    };
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    try {
      const res = await fetch(FORM_URL, { method: 'POST', body: JSON.stringify(data),
                                         headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'ошибка сервера');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (ex) {
      console.error(ex);
      err.textContent = 'Заявка не отправилась. Позвоните нам — номер указан на странице.';
    } finally {
      btn.disabled = false;
      btn.textContent = btnText;
    }
  });

  document.getElementById('againBtn').addEventListener('click', () => {
    form.reset();
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
