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

// Signup forms: submit to Mailchimp in the background (JSONP) and show a
// message under the field. Without JavaScript the form posts normally.
document.querySelectorAll('form[data-signup]').forEach(function (form) {
  var status = form.querySelector('.signup-form__status');
  var input = form.querySelector('input[type="email"]');
  var button = form.querySelector('button[type="submit"]');

  var hideTimer;

  function show(message, isError) {
    clearTimeout(hideTimer);
    status.textContent = message;
    status.hidden = false;
    status.classList.remove('is-hiding');
    status.classList.toggle('is-error', !!isError);

    // Success fades out after 5 seconds; errors stay until the next attempt
    if (!isError) {
      hideTimer = setTimeout(function () {
        status.classList.add('is-hiding');
        setTimeout(function () { status.hidden = true; }, 600);
      }, 5000);
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!input.checkValidity()) {
      show('Please enter a valid email address.', true);
      input.focus();
      return;
    }

    var callback = 'mcSignup' + Date.now();
    var params = new URLSearchParams(new FormData(form));
    params.set('c', callback);
    var url = form.action.replace('/post?', '/post-json?') + '&' + params.toString();
    var script = document.createElement('script');

    function cleanUp() {
      delete window[callback];
      script.remove();
      button.disabled = false;
    }

    window[callback] = function (data) {
      cleanUp();
      if (data && data.result === 'success') {
        form.reset();
        show(form.dataset.success);
      } else {
        // Mailchimp messages can contain HTML and a "0 - " prefix
        var tmp = document.createElement('div');
        tmp.innerHTML = (data && data.msg) || '';
        var message = tmp.textContent.replace(/^\d+ - /, '').trim();
        show(message || form.dataset.error, true);
      }
    };

    script.onerror = function () {
      cleanUp();
      show(form.dataset.error, true);
    };

    button.disabled = true;
    script.src = url;
    document.body.appendChild(script);
  });
});
