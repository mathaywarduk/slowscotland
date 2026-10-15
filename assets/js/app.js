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

  // Message with a link to Mailchimp's own signup page, email filled in
  function showWithLink(message) {
    clearTimeout(hideTimer);
    var url = form.action.replace('/post?', '?') + '&EMAIL=' + encodeURIComponent(input.value);
    status.textContent = message + ' ';
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = form.dataset.captchaLink;
    status.appendChild(link);
    status.hidden = false;
    status.classList.remove('is-hiding');
  }

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

    // If Mailchimp's reply never arrives or can't be read, don't leave the
    // visitor with nothing: offer Mailchimp's own signup page instead
    var timeout = setTimeout(function () {
      cleanUp();
      showWithLink(form.dataset.error);
      status.classList.add('is-error');
    }, 10000);

    function cleanUp() {
      clearTimeout(timeout);
      window[callback] = function () {};
      script.remove();
      button.disabled = false;
    }

    window[callback] = function (data) {
      cleanUp();
      if (data && data.result === 'success') {
        form.reset();
        show(form.dataset.success);
      } else if (data && /captcha/i.test(data.msg || '')) {
        // Mailchimp wants a human check it can't run in the background
        showWithLink(form.dataset.captcha);
        status.classList.remove('is-error');
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
      showWithLink(form.dataset.error);
      status.classList.add('is-error');
    };

    button.disabled = true;
    script.src = url;
    document.body.appendChild(script);
  });
});
