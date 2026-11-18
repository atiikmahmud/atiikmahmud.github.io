/* ==========================================================================
   Atik Mahmud – Portfolio
   Renders every section from config.json, then wires up the interactions.
   Edit the content at /config.html. Text wrapped in *asterisks* becomes
   the italic accent (<em>) in headings.
   ========================================================================== */
(function () {
    'use strict';

    var CONFIG_URL = 'config.json';
    var DRAFT_KEY = 'portfolio-config-draft';

    /* Helpers -------------------------------------------------------------- */
    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Escapes the text, then turns *phrase* into <em>phrase</em>.
    function rich(value, emClass) {
        var open = emClass ? '<em class="' + emClass + '">' : '<em>';
        return esc(value).replace(/\*([^*]+)\*/g, function (_, inner) {
            return open + inner + '</em>';
        });
    }

    function plain(value) {
        return String(value == null ? '' : value).replace(/\*/g, '');
    }

    function list(value) {
        return Array.isArray(value) ? value : [];
    }

    // Only allow link schemes that are safe to put in an href.
    function safeHref(value) {
        var href = String(value == null ? '' : value).trim();
        var scheme = href.match(/^([a-z][a-z0-9+.-]*):/i);
        if (scheme && !/^(https?|mailto|tel)$/i.test(scheme[1])) return '#';
        return href || '#';
    }

    function isExternal(href) {
        return /^https?:\/\//i.test(href);
    }

    function hostOf(url) {
        try { return new URL(url).host.replace(/^www\./, ''); } catch (e) { return url; }
    }

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    var ARROW = '<svg class="i" aria-hidden="true"><use href="#arrow"/></svg>';

    /* Config loading ------------------------------------------------------- */
    function loadConfig() {
        // /?preview shows the unsaved draft from the editor.
        if (/[?&]preview\b/.test(location.search)) {
            try {
                var draft = localStorage.getItem(DRAFT_KEY);
                if (draft) return Promise.resolve(JSON.parse(draft));
            } catch (e) { /* fall through to the published config */ }
        }
        return fetch(CONFIG_URL).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
    }

    /* Templates ------------------------------------------------------------ */
    function navHTML(c) {
        var p = c.profile || {};
        var links = list(c.nav).map(function (item) {
            return '<a class="nav__link" href="#' + esc(item.target) + '">' + esc(item.label) + '</a>';
        }).join('');
        return '<span class="nav__thumb" aria-hidden="true"></span>' +
            '<a class="nav__mark" href="#top" aria-label="' + esc(p.firstName + ' ' + p.lastName) + ', back to top">' + esc(p.initials) + '</a>' +
            links;
    }

    function ctaHTML(cta, solid) {
        if (!cta || !cta.label) return '';
        return '<a class="btn' + (solid ? ' btn--solid' : '') + '" href="' + esc(safeHref(cta.href)) + '">' +
            esc(cta.label) + (solid ? ' ' + ARROW : '') + '</a>';
    }

    function heroHTML(c) {
        var p = c.profile || {};
        var h = c.hero || {};
        var status = p.showStatus !== false && p.status
            ? '<p class="status"><span class="status__dot" aria-hidden="true"></span>' + esc(p.status) + '</p>'
            : '';
        return '<header class="hero"><div class="hero__grid">' +
            '<h1 class="hero__name">' +
                '<span class="hero__word">' + esc(p.firstName) + '</span> ' +
                '<span class="hero__word"><em>' + esc(p.lastName) + '</em></span>' +
                '<span class="sr"> – ' + esc(p.role) + '</span>' +
            '</h1>' +
            '<div class="hero__intro">' +
                status +
                '<p class="hero__lede">' + rich(h.lede) + '</p>' +
                '<p class="hero__sub">' + esc(h.sub) + '</p>' +
                '<div class="hero__cta">' + ctaHTML(h.primaryCta, true) + ctaHTML(h.secondaryCta, false) + '</div>' +
            '</div>' +
            '<figure class="plate"><div class="plate__inner">' +
                '<figcaption class="plate__cap">' +
                    '<span>' + esc(p.firstName + ' ' + p.lastName) + '</span>' +
                    '<span>' + esc(p.location) + ' <span data-clock></span></span>' +
                '</figcaption>' +
                '<img src="' + esc(p.portrait) + '" width="900" height="900" alt="' + esc(p.portraitAlt) + '" fetchpriority="high">' +
            '</div></figure>' +
        '</div></header>';
    }

    function headHTML(id, s) {
        return '<div class="head">' +
            '<p class="label">' + esc(s.label) + '</p>' +
            '<h2 class="title" id="' + id + '-title" data-reveal>' + rich(s.title) + '</h2>' +
            (s.note ? '<p class="head__note" data-reveal>' + esc(s.note) + '</p>' : '') +
        '</div>';
    }

    // Cards alternate wide/tall per row: row 1 wide+tall, row 2 tall+wide, …
    function cardShape(i) {
        var row = Math.floor(i / 2);
        var first = i % 2 === 0;
        return (row % 2 === 0) === first ? 'wide' : 'tall';
    }

    function workHTML(c) {
        var w = c.work || {};
        var cards = list(w.projects).map(function (project, i) {
            var url = safeHref(project.url);
            var tags = list(project.tags).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
            return '<article class="card card--' + cardShape(i) + '" data-reveal>' +
                '<a class="card__link" href="' + esc(url) + '"' + (isExternal(url) ? ' target="_blank" rel="noopener"' : '') + '>' +
                    '<div class="card__bar"><span>' + esc(hostOf(project.url)) + '</span>' + ARROW + '</div>' +
                    '<div class="card__frame">' +
                        (project.image ? '<img src="' + esc(project.image) + '" width="1100" height="2062" loading="lazy" decoding="async" alt="' + esc(project.imageAlt) + '">' : '') +
                    '</div>' +
                    '<div class="card__body">' +
                        '<span class="card__no">' + pad(i + 1) + '</span>' +
                        '<h3 class="card__name">' + esc(project.name) + '</h3>' +
                        '<p class="card__desc">' + esc(project.description) + '</p>' +
                        (tags ? '<ul class="card__meta">' + tags + '</ul>' : '') +
                    '</div>' +
                '</a>' +
            '</article>';
        }).join('');
        return '<section class="section" id="work" aria-labelledby="work-title"><div class="wrap">' +
            headHTML('work', w) +
            '<div class="work">' + cards + '</div>' +
        '</div></section>';
    }

    // The profile.json card – a code view of the profile, built from the config.
    function jsonHTML(c) {
        var p = c.profile || {};
        var a = c.about || {};
        var photoName = String(p.photo || '').split('/').pop();

        function str(v) { return '<span class="s">"' + esc(v) + '"</span>'; }
        function key(k) { return '<span class="k">"' + k + '"</span>'; }
        function line(depth, html) { return '<span class="l' + (depth ? ' g' + depth : '') + '">' + html + '</span>\n'; }
        function arr(k, items, last) {
            items = list(items);
            var out = line(2, key(k) + ': [');
            items.forEach(function (item, i) { out += line(3, str(item) + (i < items.length - 1 ? ',' : '')); });
            return out + line(2, ']' + (last ? '' : ','));
        }

        var body = line(0, '{') +
            line(1, key('profile') + ': {') +
            line(2, key('name') + ': ' + str(p.firstName + ' ' + p.lastName) + ',') +
            line(2, key('role') + ': ' + str(p.role) + ',') +
            (p.photo ? line(2, key('profile_picture') + ': <a class="s" href="' + esc(p.photo) + '">"' + esc(photoName) + '"</a>,') : '') +
            line(2, key('experience') + ': ' + str(p.experience) + ',') +
            line(2, key('based_in') + ': ' + str(p.location) + ',') +
            arr('cares_about', a.caresAbout, false) +
            arr('open_to', a.openTo, true) +
            line(1, '}') +
            line(0, '}');

        return '<div class="json" data-reveal>' +
            '<div class="json__bar"><span>profile.json</span></div>' +
            '<pre class="json__code" tabindex="0" aria-label="Profile summary written as JSON"><code>' + body.replace(/\n$/, '') + '</code></pre>' +
        '</div>';
    }

    function countTechnologies(c) {
        return list((c.stack || {}).groups).reduce(function (sum, g) { return sum + list(g.items).length; }, 0);
    }

    function statValue(value, c) {
        return String(value == null ? '' : value)
            .replace(/\{\{\s*projects\s*\}\}/g, list((c.work || {}).projects).length)
            .replace(/\{\{\s*technologies\s*\}\}/g, countTechnologies(c));
    }

    function aboutHTML(c) {
        var a = c.about || {};
        var stats = list(a.stats).map(function (s) {
            return '<div class="stat"><dt>' + esc(s.label) + '</dt><dd>' + esc(statValue(s.value, c)) + '</dd></div>';
        }).join('');
        return '<section class="section" id="about" aria-labelledby="about-title"><div class="wrap">' +
            '<div class="about">' +
                '<div class="about__text">' +
                    '<p class="label">' + esc(a.label) + '</p>' +
                    '<h2 class="about__big" id="about-title" data-reveal>' + rich(a.title, 'nb') + '</h2>' +
                    (a.text ? '<p class="about__small" data-reveal>' + esc(a.text) + '</p>' : '') +
                '</div>' +
                jsonHTML(c) +
            '</div>' +
            (stats ? '<dl class="stats" data-reveal>' + stats + '</dl>' : '') +
        '</div></section>';
    }

    function stackHTML(c) {
        var s = c.stack || {};
        var groups = list(s.groups).map(function (g) {
            var items = list(g.items).map(function (item) {
                return '<li>' + esc(item.name) + (item.note ? ' <small>' + esc(item.note) + '</small>' : '') + '</li>';
            }).join('');
            return '<div class="stack__col" data-reveal>' +
                '<h3 class="stack__title">' + esc(g.title) + '</h3>' +
                '<ul class="stack__list">' + items + '</ul>' +
            '</div>';
        }).join('');
        return '<section class="section" id="stack" aria-labelledby="stack-title"><div class="wrap">' +
            headHTML('stack', s) +
            '<div class="stack">' + groups + '</div>' +
        '</div></section>';
    }

    function contactHTML(c) {
        var p = c.profile || {};
        var k = c.contact || {};
        var links = list(k.links).map(function (l) {
            var href = safeHref(l.href);
            return '<li><a href="' + esc(href) + '"' + (isExternal(href) ? ' target="_blank" rel="noopener me"' : '') + '>' +
                '<span>' + esc(l.label) + '</span><b>' + esc(l.value) + '</b>' + ARROW + '</a></li>';
        }).join('');
        // Keep the last two words of the accent together, as the design did.
        var title = rich(k.title).replace(/<em>([^<]*?) (\S+)<\/em>/, '<em>$1&nbsp;$2</em>');
        return '<div class="contact__wrap wrap">' +
            '<p class="label label--ink">' + esc(k.label) + '</p>' +
            '<h2 class="contact__title" data-reveal>' + title + '</h2>' +
            (k.note ? '<p class="contact__note" data-reveal>' + esc(k.note) + '</p>' : '') +
            (p.email ?
                '<div class="mail" data-reveal>' +
                    '<a class="mail__link" href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>' +
                    '<button class="mail__copy" type="button" data-copy="' + esc(p.email) + '">Copy email</button>' +
                '</div>' : '') +
            (links ? '<ul class="links" data-reveal>' + links + '</ul>' : '') +
            '<div class="legal">' +
                '<span>© <span data-year>' + new Date().getFullYear() + '</span> ' + esc(p.firstName + ' ' + p.lastName) + '. ' + esc(k.copyright) + '</span>' +
                '<span>' + esc(p.location) + ' <span data-clock></span></span>' +
                '<a href="#top">Back to top</a>' +
            '</div>' +
        '</div>';
    }

    /* SEO: title, description and JSON-LD from the config ------------------ */
    function applyMeta(c) {
        var site = c.site || {};
        var p = c.profile || {};
        var name = plain(p.firstName + ' ' + p.lastName);
        if (site.title) document.title = site.title;
        if (site.description) {
            var desc = document.querySelector('meta[name="description"]');
            if (desc) desc.setAttribute('content', site.description);
        }

        var sameAs = list((c.contact || {}).links)
            .map(function (l) { return l.href; })
            .filter(function (href) { return isExternal(href); });
        var knowsAbout = [];
        list((c.stack || {}).groups).forEach(function (g) {
            list(g.items).forEach(function (item) { knowsAbout.push(item.name); });
        });
        var phone = list((c.contact || {}).links).filter(function (l) { return /^tel:/i.test(l.href || ''); })[0];
        var base = site.url || location.origin + '/';
        function abs(path) { try { return new URL(path, base).href; } catch (e) { return path; } }

        var person = {
            '@type': 'Person',
            name: name,
            url: base,
            jobTitle: p.role,
            description: plain((c.about || {}).title),
            sameAs: sameAs,
            knowsAbout: knowsAbout
        };
        if (p.photo) person.image = abs(p.photo);
        if (p.email) person.email = 'mailto:' + p.email;
        if (phone) person.telephone = phone.href.replace(/^tel:/i, '');
        if (p.location) person.nationality = { '@type': 'Country', name: p.location };

        var graph = [
            { '@context': 'https://schema.org', '@type': 'ProfilePage', name: name + ' Portfolio', url: base, mainEntity: person },
            { '@context': 'https://schema.org', '@type': 'WebSite', name: name + ' Portfolio', url: base, description: site.description }
        ];
        graph.forEach(function (data) {
            var script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(data);
            document.head.appendChild(script);
        });
    }

    function render(c) {
        document.querySelector('[data-slot="nav"]').innerHTML = navHTML(c);
        var main = document.querySelector('[data-slot="main"]');
        main.innerHTML = heroHTML(c) + workHTML(c) + aboutHTML(c) + stackHTML(c);
        main.removeAttribute('aria-busy');
        document.querySelector('[data-slot="contact"]').innerHTML = contactHTML(c);
        applyMeta(c);
    }

    function renderError(err) {
        var main = document.querySelector('[data-slot="main"]');
        main.removeAttribute('aria-busy');
        main.innerHTML = '<div class="load-error wrap"><p class="label">Something went wrong</p>' +
            '<p>The portfolio content could not be loaded (' + esc(err.message) + ').</p>' +
            (location.protocol === 'file:' ? '<p>Open the site through a local web server, for example <code>python3 -m http.server</code>, not as a file.</p>' : '') +
            '</div>';
        if (window.console) console.error('[portfolio] Could not load config.json', err);
    }

    /* Interactions --------------------------------------------------------- */
    function initReveal() {
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
    }

    // A sliding thumb follows the section in view.
    function initNav() {
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
            var id = link.getAttribute('href').slice(1);
            return { link: link, el: id && document.getElementById(id) };
        }).filter(function (s) { return s.el; });

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
    }

    function initClock(c) {
        var site = c.site || {};
        var clocks = document.querySelectorAll('[data-clock]');
        if (!clocks.length || !site.timezone) return;
        var timeFormat;
        try {
            timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: site.timezone });
        } catch (e) { return; }
        function tick() {
            var label = timeFormat.format(new Date()) + (site.timezoneLabel ? ' ' + site.timezoneLabel : '');
            clocks.forEach(function (el) { el.textContent = '· ' + label; });
        }
        tick();
        setInterval(tick, 20000);
    }

    function initCopy() {
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
    }

    // The URL hash can't scroll to a section that didn't exist yet; do it now.
    function restoreHash() {
        if (!location.hash) return;
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
    }

    // The editor's live preview pane: no entrance animations on every refresh.
    if (/[?&]preview=live\b/.test(location.search)) document.documentElement.classList.add('no-motion');

    loadConfig().then(function (config) {
        render(config);
        initReveal();
        initNav();
        initClock(config);
        initCopy();
        restoreHash();
    }).catch(renderError);
})();
