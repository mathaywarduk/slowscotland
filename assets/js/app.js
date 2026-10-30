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

// Itinerary photo carousel: moves the row so the current photo starts at the
// left edge, looping at both ends. Swipe works on touch screens. Without
// JavaScript the row scrolls sideways and the buttons stay hidden.
document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
  var viewport = carousel.querySelector('.carousel__viewport');
  var track = carousel.querySelector('.carousel__track');
  var slides = track.querySelectorAll('.carousel__slide');
  var counter = carousel.querySelector('[data-carousel-counter]');
  var count = slides.length;
  var current = 0;

  function update() {
    track.style.transform = 'translateX(-' + slides[current].offsetLeft + 'px)';
    counter.textContent = (current + 1) + ' of ' + count;
  }

  function go(step) {
    current = (current + step + count) % count;
    update();
  }

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', function () { go(-1); });
  carousel.querySelector('[data-carousel-next]').addEventListener('click', function () { go(1); });

  var startX = null;
  viewport.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', function (event) {
    if (startX === null) return;
    var distance = event.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(distance) > 40) go(distance < 0 ? 1 : -1);
  });

  // Photo widths aren't known until each one loads, and change with the screen
  slides.forEach(function (slide) { slide.addEventListener('load', update); });
  window.addEventListener('resize', update);

  viewport.scrollLeft = 0;
  carousel.classList.add('is-ready');
  carousel.querySelector('.carousel__controls').hidden = false;
  update();
});

// Thank-you page: each Payhip product redirects to /thank-you/?itinerary=<file name>,
// so name the itinerary they bought and count the sale in Plausible.
var thanks = document.querySelector('[data-itinerary-thanks]');
var titles = document.getElementById('itinerary-titles');
if (thanks && titles) {
  var bought = new URLSearchParams(window.location.search).get('itinerary');
  var names = JSON.parse(titles.textContent);
  var known = bought && Object.prototype.hasOwnProperty.call(names, bought);
  if (known) {
    thanks.textContent = thanks.dataset.itineraryThanks + ' ' + names[bought] + ' ' + thanks.dataset.itineraryThanksEnd;
  }
  // Recorded against /thank-you/<itinerary>/, so Plausible's Top Pages shows
  // which itinerary sold without needing custom properties
  if (window.plausible) {
    var page = known ? bought : 'unknown';
    window.plausible('Purchase', {
      url: window.location.origin + '/thank-you/' + page + '/',
      props: { itinerary: page }
    });
  }
}

// Itinerary buy buttons: count clicks in Plausible, so sales can be compared
// with clicks to see how many people leave at checkout. Plausible's Top Pages
// shows which itinerary page each click came from. Waits for the event to
// send before going to checkout (at most a second); new-tab clicks just go.
document.addEventListener('click', function (event) {
  var link = event.target.closest('a[data-buy]');
  if (!link || !window.plausible) return;

  var props = { itinerary: link.dataset.buy, placement: link.dataset.placement };
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    window.plausible('Buy click', { props: props });
    return;
  }

  event.preventDefault();
  var gone = false;
  function go() {
    if (gone) return;
    gone = true;
    window.location.href = link.href;
  }
  setTimeout(go, 1000);
  window.plausible('Buy click', { props: props, callback: go });
});
