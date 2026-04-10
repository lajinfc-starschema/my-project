const SB_URL = 'https://xfmogkpgapchiscyowti.supabase.co';
const SB_KEY = 'sb_publishable_s5teG_Mv0dJsW4S77lnlTw_aU8zXULl';

async function fetchComments() {
  const res = await fetch(
    `${SB_URL}/rest/v1/comments?approved=eq.true&order=created_at.asc&select=*`,
    { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } }
  );
  return res.ok ? res.json() : [];
}

async function submitComment(name, content) {
  const res = await fetch(`${SB_URL}/rest/v1/comments`, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ name: name || '匿名', content }),
  });
  return res.ok;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

async function renderComments() {
  const container = document.getElementById('guestbook-comments');
  const comments = await fetchComments();

  if (comments.length === 0) {
    container.innerHTML = '<p class="guestbook-empty">还没有留言，来第一个吧！</p>';
    return;
  }

  container.innerHTML = comments.map(c => `
    <div class="guestbook-comment">
      <div class="comment-header">
        <span class="comment-name">${c.name}</span>
        <span class="comment-date">${formatDate(c.created_at)}</span>
      </div>
      <p class="comment-content">${c.content}</p>
      ${c.reply ? `
        <div class="comment-reply">
          <span class="reply-label"><img src="hlg-avatar.svg" class="reply-icon" alt="🐉"> 火龙果回复：</span>
          <span>${c.reply}</span>
        </div>` : ''}
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderComments();

  const form = document.getElementById('guestbook-form');
  const status = document.getElementById('guestbook-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('guestbook-name').value.trim();
    const content = document.getElementById('guestbook-content').value.trim();
    if (!content) return;

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '提交中...';

    const ok = await submitComment(name, content);

    if (ok) {
      status.textContent = '留言成功！审核通过后会出现在这里 🌸';
      status.className = 'guestbook-status success';
      form.reset();
    } else {
      status.textContent = '提交失败，请稍后再试';
      status.className = 'guestbook-status error';
    }

    btn.disabled = false;
    btn.textContent = '留言 →';
  });
});
