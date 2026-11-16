/* DeFiMind — landing page behaviour
   No build step. ES5-safe syntax so it runs everywhere without transpiling. */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* ----------------------------------------------------------
     FEATURE STATUS
     Set a feature to 'live' only on the day it ships.
     ---------------------------------------------------------- */
  var FEATURES = {
    plugins: 'soon', screening: 'soon', verified: 'soon', identity: 'soon',
    escrow: 'soon', trading: 'soon', teams: 'soon', chains: 'soon',
    platforms: 'soon', drain: 'soon', audit: 'soon', governance: 'soon'
  };

  /* Every card and every roadmap item carries data-feature="<key>".
     The markup ships as "Coming soon", so a JavaScript failure can only ever
     under-promise, never over-promise. */
  (function featureStatus() {
    $$('[data-feature]').forEach(function (el) {
      var live = FEATURES[el.getAttribute('data-feature')] === 'live';
      el.setAttribute('data-status', live ? 'live' : 'soon');
      var badge = $('[data-badge]', el);
      if (badge) badge.textContent = live ? 'Live' : 'Coming soon';
    });
  })();

  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------------------------------------------------------
     Nav: stuck state + mobile menu
     ---------------------------------------------------------- */
  (function nav() {
    var bar = $('#nav');
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!bar) return;

    var stuck = false;
    function onScroll() {
      var should = window.scrollY > 12;
      if (should !== stuck) {
        stuck = should;
        bar.classList.toggle('is-stuck', stuck);
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !links) return;

    function close() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    function open() {
      links.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    toggle.addEventListener('click', function () {
      if (links.classList.contains('is-open')) close(); else open();
    });

    links.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') close();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180) close();
    });
  })();

  /* ----------------------------------------------------------
     Reveal on scroll (+ fallback if IntersectionObserver is missing)
     ---------------------------------------------------------- */
  (function reveal() {
    var items = $$('.rv');
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      // Fallback: reveal whatever is near the viewport, on scroll.
      var check = function () {
        var h = window.innerHeight || doc.documentElement.clientHeight;
        var left = 0;
        items.forEach(function (el) {
          if (el.classList.contains('is-in')) return;
          var r = el.getBoundingClientRect();
          if (r.top < h - 60) el.classList.add('is-in'); else left++;
        });
        if (!left) window.removeEventListener('scroll', check);
      };
      check();
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      // Safety net: never leave content hidden.
      window.setTimeout(showAll, 3500);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });

    // If the tab was hidden while loading, the observer may not have fired.
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden) {
        var h = window.innerHeight || doc.documentElement.clientHeight;
        items.forEach(function (el) {
          if (el.getBoundingClientRect().top < h) el.classList.add('is-in');
        });
      }
    });
  })();

  /* ----------------------------------------------------------
     Hero aurora — drifting silk strands on canvas
     ---------------------------------------------------------- */
  (function aurora() {
    var cv = $('#aurora');
    if (!cv || reduceMotion) return;

    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var W = 0, H = 0, dpr = 1, t = 0, raf = 0;

    // Brand blue sampled from the logo mark, with the cyan of the swoosh.
    var strands = [
      { col: '23,99,201',   amp: 0.16, freq: 1.5, speed: 0.00022, y: 0.34, w: 150, phase: 0 },
      { col: '43,138,248',  amp: 0.13, freq: 1.9, speed: 0.00029, y: 0.46, w: 120, phase: 1.7 },
      { col: '26,215,234',  amp: 0.11, freq: 2.4, speed: 0.00035, y: 0.58, w: 95, phase: 3.1 },
      { col: '43,138,248',  amp: 0.09, freq: 3.1, speed: 0.00042, y: 0.66, w: 70, phase: 4.6 },
      { col: '116,179,255', amp: 0.07, freq: 3.8, speed: 0.00051, y: 0.28, w: 55, phase: 5.9 }
    ];

    function size() {
      var rect = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function strand(s, now) {
      var steps = 42;
      var phase = now * s.speed + s.phase;
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var p = i / steps;
        var x = p * W;
        var swell = Math.sin(p * Math.PI);                       // fade the ends
        var y = s.y * H
              + Math.sin(p * s.freq * Math.PI * 2 + phase) * s.amp * H * swell
              + Math.sin(p * s.freq * 0.47 * Math.PI * 2 - phase * 1.6) * s.amp * 0.4 * H * swell;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }

      var g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(' + s.col + ',0)');
      g.addColorStop(0.5, 'rgba(' + s.col + ',0.5)');
      g.addColorStop(1, 'rgba(' + s.col + ',0)');

      ctx.strokeStyle = g;
      ctx.lineCap = 'round';

      // Draw the same path a few times: wide and faint, then narrow and bright.
      var passes = [
        { w: s.w, a: 0.10 },
        { w: s.w * 0.45, a: 0.16 },
        { w: s.w * 0.16, a: 0.30 },
        { w: 1.3, a: 0.75 }
      ];
      for (var k = 0; k < passes.length; k++) {
        ctx.globalAlpha = passes[k].a;
        ctx.lineWidth = passes[k].w;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // The canvas sits behind the whole page now, so it never scrolls away.
    // 30fps is plenty for something this slow, and halves the work.
    var last = -1e9, MIN_MS = 1000 / 30;

    function paint(now) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < strands.length; i++) strand(strands[i], now);
      ctx.globalCompositeOperation = 'source-over';
      t = now;
    }

    function frame(now) {
      if (doc.hidden) { raf = 0; return; }                        // resumed by visibilitychange
      raf = window.requestAnimationFrame(frame);
      if (now - last < MIN_MS) return;
      last = now;
      paint(now);
    }

    function start() { if (!raf) raf = window.requestAnimationFrame(frame); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }

    size();
    start();

    var rt;
    window.addEventListener('resize', function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(function () { size(); paint(t); }, 160);
    });

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop(); else start();
    });
  })();

  /* ----------------------------------------------------------
     "Your worst day" calculator
     ---------------------------------------------------------- */
  (function calc() {
    var cap = $('#capIn'), hot = $('#hotIn'), vault = $('#vaultIn');
    if (!cap || !hot || !vault) return;

    var capOut = $('#capOut'), hotOut = $('#hotOut'), vaultOut = $('#vaultOut');
    var big = $('#maxLoss'), eq = $('#maxEq'), pctNote = $('#maxPct');

    var usd = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
      useGrouping: 'always'
    });

    function fill(el) {
      var min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
      var pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
      el.style.setProperty('--pct', pct.toFixed(2) + '%');
    }

    function pretty(n) {
      if (n >= 10) return n.toFixed(0);
      if (n >= 1) return n.toFixed(1);
      return n.toFixed(2);
    }

    function render() {
      var c = parseFloat(cap.value) || 0;
      var h = parseFloat(hot.value) || 0;
      var v = parseFloat(vault.value) || 0;
      var loss = c + h;

      capOut.textContent = usd.format(c);
      hotOut.textContent = usd.format(h);
      vaultOut.textContent = usd.format(v);

      big.textContent = usd.format(loss);
      eq.textContent = 'daily cap ' + usd.format(c) + ' + hot wallet ' + usd.format(h);

      if (loss >= v) {
        pctNote.textContent = 'That is everything in the vault. Lower the daily cap, or keep less in the hot wallet.';
      } else {
        pctNote.textContent = 'That is ' + pretty((loss / v) * 100) + '% of the vault. The rest cannot move without your signature.';
      }

      fill(cap); fill(hot); fill(vault);
    }

    [cap, hot, vault].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });

    render();
  })();

  /* ----------------------------------------------------------
     Reject codes
     ---------------------------------------------------------- */
  (function codes() {
    var list = $('#codeList');
    var tabs = $$('.tabs button[data-tab]');
    if (!list || !tabs.length) return;

    var DATA = {
      shared: [
        ['POLICY_DENIED', 'No rule allows this payment. A new agent starts able to spend nothing at all.'],
        ['LIMIT_EXCEEDED', 'Above the per-payment limit you set for this agent.'],
        ['DAILY_CAP_REACHED', 'Today’s spending is already at your cap. It resets tomorrow, never sooner.'],
        ['RECIPIENT_NOT_ALLOWED', 'The destination is not one you added to the allowlist.'],
        ['DOMAIN_NOT_ALLOWED', 'The site asking to be paid is not a domain you approved.'],
        ['CHAIN_NOT_ALLOWED', 'This agent is not allowed to spend on that chain.'],
        ['TOKEN_NOT_ALLOWED', 'Only the chain’s dollar can be spent. Everything else is refused.'],
        ['AMOUNT_NOT_EXACT', 'The amount would have to be rounded to fit. It is refused instead of rounded.'],
        ['APPROVAL_REQUIRED', 'At or above your threshold, and nobody has approved it yet.'],
        ['APPROVAL_EXPIRED', 'The request waited ten minutes without an answer. Silence is a no.'],
        ['AGENT_PAUSED', 'The kill switch is on. Every agent is stopped, on every chain.'],
        ['SIMULATION_FAILED', 'The test run could not finish, so nothing gets signed.']
      ],
      solana: [
        ['UNKNOWN_PROGRAM', 'The transaction calls a program that is not on the allowlist.'],
        ['AUTHORITY_CHANGE', 'It tries to hand control of an account to somebody else.'],
        ['DELEGATE_DETECTED', 'It gives another account standing permission to move your tokens.'],
        ['EXTRA_INSTRUCTION', 'There are more instructions than the payment needs, and the extras are not understood.']
      ],
      evm: [
        ['APPROVAL_DETECTED', 'It grants a spender permission to take tokens later. A transfer never needs that.'],
        ['UNKNOWN_SELECTOR', 'The call is to a function the parser does not recognise.'],
        ['CONTRACT_NOT_ALLOWED', 'The target contract is not one you approved.'],
        ['VALUE_NOT_ZERO', 'The call carries native currency when it should carry none.']
      ]
    };

    function paint(key) {
      var rows = DATA[key] || [];
      var html = '';
      for (var i = 0; i < rows.length; i++) {
        html += '<div class="code"><p class="code__k">' + rows[i][0] + '</p>'
             +  '<p class="code__v">' + rows[i][1] + '</p></div>';
      }
      list.innerHTML = html;
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        paint(btn.getAttribute('data-tab'));
      });
    });

    var active = tabs.filter(function (b) { return b.classList.contains('is-on'); })[0] || tabs[0];
    paint(active.getAttribute('data-tab'));
  })();

  /* ----------------------------------------------------------
     FAQ — one open at a time
     ---------------------------------------------------------- */
  (function faq() {
    var items = $$('.faq__i');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  })();

  /* ----------------------------------------------------------
     Waitlist
     ---------------------------------------------------------- */
  (function waitlist() {
    var form = $('#wlForm');
    if (!form) return;

    var input = $('#email', form);
    var msg = $('#wlMsg');
    var btn = form.querySelector('button[type=submit]');
    var label = $('#wlBtnLabel');
    var sending = false;

    var TEXT = {
      invalid: 'That email does not look right. Check it and try again.',
      ok: 'You are on the list. We will write once, when it is ready.',
      err: 'We could not accept that address. Try another one.',
      fail: 'Something went wrong on our side. Please try again in a moment.',
      offline: 'You appear to be offline. Try again once you are connected.'
    };

    function say(text, kind) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.remove('is-ok', 'is-err');
      if (kind) msg.classList.add(kind === 'ok' ? 'is-ok' : 'is-err');
    }

    function busy(state) {
      sending = state;
      if (btn) btn.disabled = state;
      if (label) label.textContent = state ? 'Sending…' : 'Join the waitlist';
    }

    function valid(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      var email = (input.value || '').trim();

      if (!valid(email)) {
        input.setAttribute('aria-invalid', 'true');
        say(TEXT.invalid, 'err');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');

      var cfg = window.DFM_CONFIG || {};
      if (!cfg.supabaseUrl || !cfg.supabaseKey) {
        say(TEXT.fail, 'err');
        return;
      }

      if (navigator.onLine === false) {
        say(TEXT.offline, 'err');
        return;
      }

      busy(true);
      say('', null);

      function done(text, kind) {
        busy(false);
        say(text, kind);
        if (kind === 'ok') {
          input.value = '';
          if (label) label.textContent = 'Join the waitlist';
        }
      }

      fetch(cfg.supabaseUrl + '/rest/v1/waitlist', {
        method: 'POST',
        headers: {
          'apikey': cfg.supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: email, lang: 'en', source: 'landing' })
      }).then(function (res) {
        // 409 means the address is already on the list — same outcome for the visitor.
        if (res.ok || res.status === 409) { done(TEXT.ok, 'ok'); return; }
        done(res.status === 400 ? TEXT.err : TEXT.fail, 'err');
      }).catch(function () {
        done(TEXT.fail, 'err');
      });
    });
  })();

})();
