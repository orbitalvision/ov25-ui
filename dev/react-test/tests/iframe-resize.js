const params = new URLSearchParams(window.location.search);
const framing = params.get('test') === 'framing';
document.querySelector('#resize-tests').hidden = framing;
document.querySelector('#framing-tests').hidden = !framing;
document.querySelector('#frame-layer').hidden = framing;
document.querySelector('#status').hidden = framing;
document.body.classList.toggle('initial-framing', framing);
document.querySelectorAll('[data-test]').forEach(link => {
  const url = new URL(window.location.href);
  url.searchParams.set('test', link.dataset.test);
  link.href = url.href;
  if (link.dataset.test === (framing ? 'framing' : 'resize')) link.setAttribute('aria-current', 'page');
});
if (framing) {
  document.querySelector('h1').textContent = 'Start at the right size.';
  document.querySelector('.intro').textContent = 'Check initial camera framing, drawer transitions and fullscreen using the current local OV25 UI build.';
  await import('./iframe-initial-framing.js');
} else {
  await import('./iframe-relocation.js');
}
