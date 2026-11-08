(function () {
    'use strict';

    // Scroll reveal
    var reveals = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { revealObserver.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-in'); });
    }

    // Navigation: a sliding thumb follows the section in view
    var nav = document.querySelector('.nav');
    var thumb = nav.querySelector('.nav__thumb');
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav__link'));
    var current = null;

    function moveThumb() {
        if (!current) {
            thumb.style.opacity = '0';
            return;
        }
        thumb.style.opacity = '1';
        thumb.style.width = current.offsetWidth + 'px';
        thumb.style.transform = 'translateX(' + current.offsetLeft + 'px)';
    }

    function setCurrent(link) {
        if (link === current) return;
        if (current) current.removeAttribute('aria-current');
        current = link;
        if (current) current.setAttribute('aria-current', 'true');
        moveThumb();
    }

    var sections = links.map(function (link) {
        return { link: link, el: document.querySelector(link.getAttribute('href')) };
    });

    function updateCurrent() {
        // The section crossing a line 40% down the viewport is the current one.
        var line = window.innerHeight * 0.4;
        var active = null;
        sections.forEach(function (s) {
            var r = s.el.getBoundingClientRect();
            if (r.top <= line && r.bottom > line) active = s.link;
        });
        setCurrent(active);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            updateCurrent();
            ticking = false;
        });
    }, { passive: true });
    window.addEventListener('resize', function () {
        updateCurrent();
        moveThumb();
    });
    updateCurrent();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveThumb);

    // Local time in Bangladesh (one time zone, GMT+6)
    var clocks = document.querySelectorAll('[data-clock]');
    var timeFormat = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka'
    });
    function tick() {
        var label = timeFormat.format(new Date()) + ' GMT+6';
        clocks.forEach(function (el) { el.textContent = '· ' + label; });
    }
    tick();
    setInterval(tick, 20000);

    // Footer year
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    // Copy email
    var live = document.querySelector('[data-live]');
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        var original = btn.textContent;
        var timer;
        btn.addEventListener('click', function () {
            var done = function (message, ok) {
                btn.textContent = message;
                btn.classList.toggle('is-done', ok);
                if (live) live.textContent = message;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    btn.textContent = original;
                    btn.classList.remove('is-done');
                }, 2200);
            };
            if (!navigator.clipboard) {
                done('Press and hold to copy', false);
                return;
            }
            navigator.clipboard.writeText(btn.dataset.copy).then(
                function () { done('Copied', true); },
                function () { done('Could not copy', false); }
            );
        });
    });
})();
