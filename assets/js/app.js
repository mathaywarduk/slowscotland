// Locked story tiles link to #signup. Scroll to the form and focus the email field.
document.addEventListener('click', function (event) {
  var link = event.target.closest('a[href="#signup"]');
  if (!link) return;

  var signup = document.getElementById('signup');
  var input = signup && signup.querySelector('input[type="email"]');
  if (!input) return;

  event.preventDefault();
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  signup.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  input.focus({ preventScroll: true });
  history.replaceState(null, '', '#signup');
});
