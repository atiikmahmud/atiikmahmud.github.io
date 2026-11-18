/* ==========================================================================
   Portfolio config editor
   Edits config.json through a form generated from SCHEMA below, keeps an
   autosaved draft in this browser, and saves by download, by writing the file
   on disk, or by committing to GitHub.
   ========================================================================== */
(() => {
    'use strict';

    const CONFIG_URL = 'config.json';
    const DRAFT_KEY = 'portfolio-config-draft';      // also read by main.js for ?preview
    const DRAFT_AT_KEY = 'portfolio-config-draft-at';
    const GH_KEY = 'portfolio-config-github';
    const TAB_KEY = 'portfolio-config-tab';
    const PREVIEW_KEY = 'portfolio-config-preview';

    const RICH = 'Wrap words in *asterisks* to set them in the italic accent.';
    const SECTIONS = ['work', 'about', 'stack', 'contact', 'top'];

    /* Schema: what the form shows, and where each value lives in config.json */
    const SCHEMA = [
        {
            id: 'profile', title: 'Profile',
            intro: 'Who you are. Used in the hero, the profile.json card, the footer and search results.',
            fields: [
                { key: 'profile.firstName', label: 'First name' },
                { key: 'profile.lastName', label: 'Last name', hint: 'Shown in italics in the big hero name.' },
                { key: 'profile.initials', label: 'Initials', hint: 'The mark at the left of the navigation.' },
                { key: 'profile.role', label: 'Role' },
                { key: 'profile.experience', label: 'Experience', placeholder: '4+ years' },
                { key: 'profile.location', label: 'Based in' },
                { key: 'profile.email', label: 'Email', type: 'email', wide: true },
                { key: 'profile.status', label: 'Availability status', wide: true },
                { key: 'profile.showStatus', label: 'Show the availability status in the hero', type: 'toggle', wide: true },
                { key: 'profile.portrait', label: 'Hero portrait', type: 'image', wide: true, hint: 'Path inside the site, e.g. assets/images/portrait.webp. Square, about 900 × 900.' },
                { key: 'profile.portraitAlt', label: 'Portrait description (alt text)', wide: true },
                { key: 'profile.photo', label: 'Profile picture', type: 'image', wide: true, hint: 'Linked from the profile.json card and used for search results.' }
            ]
        },
        {
            id: 'hero', title: 'Hero',
            intro: 'The first screen: headline, short intro and the two buttons.',
            fields: [
                { key: 'hero.lede', label: 'Headline', type: 'textarea', rows: 2, wide: true, hint: RICH },
                { key: 'hero.sub', label: 'Intro', type: 'textarea', rows: 3, wide: true },
                { key: 'hero.primaryCta.label', label: 'Main button text' },
                { key: 'hero.primaryCta.href', label: 'Main button link', placeholder: '#work' },
                { key: 'hero.secondaryCta.label', label: 'Second button text' },
                { key: 'hero.secondaryCta.href', label: 'Second button link', placeholder: '#contact' }
            ]
        },
        {
            id: 'work', title: 'Work',
            intro: 'Selected projects. Cards alternate wide and tall automatically, in this order.',
            fields: [
                { key: 'work.label', label: 'Section label' },
                { key: 'work.title', label: 'Title', hint: RICH },
                { key: 'work.note', label: 'Note', type: 'textarea', rows: 2, wide: true },
                {
                    key: 'work.projects', type: 'list', label: 'Projects', itemLabel: 'project',
                    title: (p) => p.name,
                    subtitle: (p) => p.url,
                    newItem: { name: '', url: 'https://', image: 'assets/images/work/', imageAlt: '', description: '', tags: [] },
                    fields: [
                        { key: 'name', label: 'Name' },
                        { key: 'url', label: 'Live URL', type: 'url' },
                        { key: 'description', label: 'Description', type: 'textarea', rows: 2, wide: true },
                        { key: 'tags', label: 'Tags', type: 'tags', wide: true },
                        { key: 'image', label: 'Screenshot', type: 'image', wide: true, hint: 'A full-page screenshot, about 1100 px wide. It scrolls on hover.' },
                        { key: 'imageAlt', label: 'Screenshot description (alt text)', wide: true }
                    ]
                }
            ]
        },
        {
            id: 'about', title: 'About',
            intro: 'Your story, the profile.json card and the big numbers.',
            fields: [
                { key: 'about.label', label: 'Section label' },
                { key: 'about.title', label: 'Statement', type: 'textarea', rows: 3, wide: true, hint: RICH },
                { key: 'about.text', label: 'Paragraph', type: 'textarea', rows: 3, wide: true },
                { key: 'about.caresAbout', label: 'Cares about', type: 'tags', wide: true },
                { key: 'about.openTo', label: 'Open to', type: 'tags', wide: true },
                {
                    key: 'about.stats', type: 'list', label: 'Stats', itemLabel: 'stat',
                    title: (s) => s.label,
                    subtitle: (s) => s.value,
                    newItem: { label: '', value: '' },
                    hint: 'Use {{projects}} or {{technologies}} as the value to count them automatically.',
                    fields: [
                        { key: 'value', label: 'Value', placeholder: '4+' },
                        { key: 'label', label: 'Label' }
                    ]
                }
            ]
        },
        {
            id: 'stack', title: 'Stack',
            intro: 'Technologies, grouped into columns.',
            fields: [
                { key: 'stack.label', label: 'Section label' },
                { key: 'stack.title', label: 'Title', hint: RICH },
                { key: 'stack.note', label: 'Note', type: 'textarea', rows: 2, wide: true },
                {
                    key: 'stack.groups', type: 'list', label: 'Groups', itemLabel: 'group',
                    title: (g) => g.title,
                    subtitle: (g) => (g.items || []).length + ' items',
                    newItem: { title: '', items: [] },
                    fields: [
                        { key: 'title', label: 'Group title', wide: true },
                        {
                            key: 'items', type: 'list', label: 'Technologies', itemLabel: 'technology', compact: true,
                            title: (t) => t.name,
                            subtitle: (t) => t.note,
                            newItem: { name: '', note: '' },
                            fields: [
                                { key: 'name', label: 'Name' },
                                { key: 'note', label: 'Small note', placeholder: 'e.g. 8.x' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'contact', title: 'Contact',
            intro: 'The paper footer. The email comes from Profile.',
            fields: [
                { key: 'contact.label', label: 'Section label' },
                { key: 'contact.title', label: 'Title', hint: RICH },
                { key: 'contact.note', label: 'Note', type: 'textarea', rows: 2, wide: true },
                {
                    key: 'contact.links', type: 'list', label: 'Links', itemLabel: 'link',
                    title: (l) => l.label,
                    subtitle: (l) => l.value,
                    newItem: { label: '', value: '', href: 'https://' },
                    fields: [
                        { key: 'label', label: 'Label', placeholder: 'LinkedIn' },
                        { key: 'value', label: 'Shown text', placeholder: 'in/username' },
                        { key: 'href', label: 'Link', wide: true, hint: 'https://…, mailto:… or tel:…' }
                    ]
                },
                { key: 'contact.copyright', label: 'Copyright line', wide: true }
            ]
        },
        {
            id: 'nav', title: 'Navigation',
            intro: 'Links in the floating navigation bar.',
            fields: [
                {
                    key: 'nav', type: 'list', label: 'Links', itemLabel: 'link',
                    title: (n) => n.label,
                    subtitle: (n) => '#' + n.target,
                    newItem: { label: '', target: 'work' },
                    fields: [
                        { key: 'label', label: 'Label' },
                        { key: 'target', label: 'Goes to section', type: 'select', options: SECTIONS }
                    ]
                }
            ]
        },
        {
            id: 'site', title: 'Site & SEO',
            intro: 'Browser tab title, search description and the clock in the hero and footer.',
            fields: [
                { key: 'site.title', label: 'Page title', wide: true },
                { key: 'site.description', label: 'Search description', type: 'textarea', rows: 3, wide: true, counter: 160 },
                { key: 'site.url', label: 'Site URL', type: 'url', wide: true },
                { key: 'site.timezone', label: 'Time zone', placeholder: 'Asia/Dhaka', hint: 'An IANA name, like Asia/Dhaka or Europe/London.' },
                { key: 'site.timezoneLabel', label: 'Time zone label', placeholder: 'GMT+6' }
            ]
        }
    ];

    /* State ---------------------------------------------------------------- */
    const state = {
        config: null,
        baseline: '',      // the JSON last loaded or saved; differences mean unsaved changes
        fileHandle: null,
        tab: read(TAB_KEY) || 'profile',
        openItems: new WeakSet()
    };

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
    function write(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } }
    function remove(key) { try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ } }

    const serialize = (config = state.config) => JSON.stringify(config, null, 4) + '\n';
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const isDirty = () => state.config && serialize() !== state.baseline;

    function getPath(obj, path) {
        return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    }
    function setPath(obj, path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((o, k) => {
            if (o[k] == null || typeof o[k] !== 'object') o[k] = {};
            return o[k];
        }, obj);
        target[last] = value;
    }

    // Tiny element builder: h('div', { class: 'x', onclick: fn }, child, 'text')
    function h(tag, props, ...children) {
        const node = document.createElement(tag);
        Object.entries(props || {}).forEach(([k, v]) => {
            if (v == null || v === false) return;
            if (k === 'class') node.className = v;
            else if (k === 'text') node.textContent = v;
            else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
            else if (k in node && typeof v !== 'string') node[k] = v;
            else node.setAttribute(k, v === true ? '' : v);
        });
        children.flat().forEach((c) => { if (c != null && c !== false) node.append(c); });
        return node;
    }

    let uid = 0;
    const nextId = () => 'f' + (++uid);

    /* Change handling ------------------------------------------------------ */
    let draftTimer;
    function changed() {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(() => {
            if (isDirty()) {
                write(DRAFT_KEY, serialize());
                write(DRAFT_AT_KEY, String(Date.now()));
            } else {
                remove(DRAFT_KEY);
                remove(DRAFT_AT_KEY);
            }
            refreshPreview();
        }, 250);
        updateStatus();
    }

    function updateStatus() {
        const el = $('[data-status]');
        const dirty = isDirty();
        el.dataset.dirty = dirty;
        el.textContent = dirty
            ? 'Unsaved changes · kept as a draft in this browser'
            : 'Matches config.json';
    }

    function markSaved() {
        state.baseline = serialize();
        remove(DRAFT_KEY);
        remove(DRAFT_AT_KEY);
        updateStatus();
    }

    /* Toast ---------------------------------------------------------------- */
    let toastTimer;
    function toast(message, opts = {}) {
        const el = $('[data-toast]');
        el.textContent = '';
        el.dataset.tone = opts.tone || '';
        el.append(h('span', { text: message }));
        if (opts.action) {
            el.append(h('button', {
                type: 'button', class: 'toast__btn', text: opts.action.label,
                onclick: () => { el.hidden = true; opts.action.run(); }
            }));
        }
        if (opts.link) el.append(h('a', { class: 'toast__btn', href: opts.link.href, target: '_blank', rel: 'noopener', text: opts.link.label }));
        el.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.hidden = true; }, opts.duration || 4200);
    }

    /* Fields --------------------------------------------------------------- */
    function renderFields(fields, obj, container) {
        fields.forEach((f) => container.append(f.type === 'list' ? listField(f, obj) : field(f, obj)));
    }

    function field(f, obj) {
        const id = nextId();
        const value = getPath(obj, f.key);
        const wrap = h('div', { class: 'field' + (f.wide ? ' field--wide' : '') });
        const set = (v) => { setPath(obj, f.key, v); changed(); };
        let control;

        switch (f.type) {
            case 'toggle':
                control = h('input', {
                    id, type: 'checkbox', checked: value !== false,
                    onchange: (e) => set(e.target.checked)
                });
                wrap.className += ' field--toggle';
                wrap.append(h('label', { class: 'switch', for: id }, control, h('span', { class: 'switch__track', 'aria-hidden': 'true' }), h('span', { text: f.label })));
                return wrap;

            case 'textarea':
                control = h('textarea', { id, rows: String(f.rows || 3), placeholder: f.placeholder, oninput: (e) => set(e.target.value) });
                control.value = value == null ? '' : value;
                break;

            case 'select':
                control = h('select', { id, onchange: (e) => set(e.target.value) },
                    f.options.map((o) => h('option', { value: o, text: o, selected: o === value })));
                break;

            case 'tags':
                control = tagsInput(id, obj, f);
                break;

            case 'image':
                control = imageInput(id, value, set, f);
                break;

            default:
                control = h('input', {
                    id, type: f.type || 'text', placeholder: f.placeholder, spellcheck: f.type ? 'false' : null,
                    oninput: (e) => set(e.target.value)
                });
                control.value = value == null ? '' : value;
        }

        wrap.append(h('label', { class: 'field__label', for: id, text: f.label }), control);
        if (f.counter) wrap.append(counter(control, f.counter));
        if (f.hint) wrap.append(h('p', { class: 'field__hint', text: f.hint }));
        return wrap;
    }

    function counter(control, max) {
        const el = h('p', { class: 'field__count' });
        const update = () => {
            const n = control.value.length;
            el.textContent = n + ' / ' + max;
            el.dataset.over = n > max;
        };
        control.addEventListener('input', update);
        update();
        return el;
    }

    function imageInput(id, value, set, f) {
        const img = h('img', { alt: '', onerror: () => thumb.classList.add('is-missing'), onload: () => thumb.classList.remove('is-missing') });
        const thumb = h('span', { class: 'thumb' }, img, h('span', { class: 'thumb__empty', text: 'No image' }));
        const show = (v) => {
            if (v && !/\/$/.test(v)) img.src = v;
            else { img.removeAttribute('src'); thumb.classList.add('is-missing'); }
        };
        const input = h('input', {
            id, type: 'text', spellcheck: 'false', placeholder: f.placeholder || 'assets/images/…',
            oninput: (e) => { set(e.target.value); show(e.target.value); }
        });
        input.value = value || '';
        show(value);
        return h('div', { class: 'image' }, thumb, input);
    }

    function tagsInput(id, obj, f) {
        let tags = getPath(obj, f.key);
        if (!Array.isArray(tags)) { tags = []; setPath(obj, f.key, tags); }

        const box = h('div', { class: 'tags', onclick: (e) => { if (e.target === box) input.focus(); } });
        const input = h('input', { id, type: 'text', placeholder: 'Type and press Enter', class: 'tags__input' });

        function draw() {
            $$('.tag', box).forEach((t) => t.remove());
            tags.forEach((tag, i) => {
                box.insertBefore(h('span', { class: 'tag' },
                    h('span', { text: tag }),
                    h('button', {
                        type: 'button', class: 'tag__x', 'aria-label': 'Remove ' + tag, text: '×',
                        onclick: () => { tags.splice(i, 1); draw(); changed(); input.focus(); }
                    })
                ), input);
            });
        }
        function add(raw) {
            const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
            if (!parts.length) return;
            tags.push(...parts);
            input.value = '';
            draw();
            changed();
        }
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                add(input.value);
            } else if (e.key === 'Backspace' && !input.value && tags.length) {
                tags.pop();
                draw();
                changed();
            }
        });
        input.addEventListener('blur', () => add(input.value));
        input.addEventListener('paste', (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (text.includes(',')) { e.preventDefault(); add(text); }
        });
        box.append(input);
        draw();
        return box;
    }

    function listField(f, obj) {
        let arr = getPath(obj, f.key);
        if (!Array.isArray(arr)) { arr = []; setPath(obj, f.key, arr); }

        const items = h('div', { class: 'list__items' });
        const countEl = h('span', { class: 'list__count' });
        const wrap = h('div', { class: 'list field--wide' + (f.compact ? ' list--compact' : '') },
            h('div', { class: 'list__head' }, h('h3', { class: 'list__label', text: f.label }), countEl),
            f.hint ? h('p', { class: 'field__hint', text: f.hint }) : null,
            items,
            h('button', {
                type: 'button', class: 'list__add', text: '+ Add ' + f.itemLabel,
                onclick: () => {
                    const item = clone(f.newItem);
                    arr.push(item);
                    state.openItems.add(item);
                    draw();
                    changed();
                    const input = $('.item:last-child .item__body input, .item:last-child .item__body textarea', items);
                    if (input) input.focus();
                }
            })
        );

        function move(i, to) {
            const [item] = arr.splice(i, 1);
            arr.splice(to, 0, item);
            draw();
            changed();
        }

        function draw() {
            items.textContent = '';
            countEl.textContent = arr.length;
            arr.forEach((item, i) => {
                const open = state.openItems.has(item);
                const titleEl = h('span', { class: 'item__title' });
                const subEl = h('span', { class: 'item__sub' });
                const refresh = () => {
                    titleEl.textContent = (f.title && f.title(item)) || 'Untitled ' + f.itemLabel;
                    subEl.textContent = (f.subtitle && f.subtitle(item)) || '';
                };
                refresh();

                const body = h('div', { class: 'item__body grid', hidden: !open });
                const toggle = h('button', {
                    type: 'button', class: 'item__toggle', 'aria-expanded': String(open),
                    onclick: () => {
                        const isOpen = body.hidden;
                        body.hidden = !isOpen;
                        toggle.setAttribute('aria-expanded', String(isOpen));
                        if (isOpen) state.openItems.add(item); else state.openItems.delete(item);
                    }
                }, h('span', { class: 'item__no', text: String(i + 1).padStart(2, '0') }), titleEl, subEl);

                const tool = (label, icon, run, disabled) =>
                    h('button', { type: 'button', class: 'tool', title: label, 'aria-label': label + ' ' + (i + 1), disabled, onclick: run, text: icon });

                const tools = h('div', { class: 'item__tools' },
                    tool('Move up', '↑', () => move(i, i - 1), i === 0),
                    tool('Move down', '↓', () => move(i, i + 1), i === arr.length - 1),
                    tool('Duplicate', '⧉', () => {
                        const copy = clone(item);
                        arr.splice(i + 1, 0, copy);
                        state.openItems.add(copy);
                        draw();
                        changed();
                    }),
                    tool('Remove', '✕', () => {
                        const [removed] = arr.splice(i, 1);
                        draw();
                        changed();
                        toast('Removed ' + ((f.title && f.title(removed)) || f.itemLabel) + '.', {
                            action: { label: 'Undo', run: () => { arr.splice(i, 0, removed); draw(); changed(); } },
                            duration: 7000
                        });
                    })
                );

                renderFields(f.fields, item, body);
                body.addEventListener('input', refresh);
                body.addEventListener('change', refresh);
                body.addEventListener('click', () => setTimeout(refresh));
                items.append(h('div', { class: 'item' }, h('div', { class: 'item__head' }, toggle, tools), body));
            });
            if (!arr.length) items.append(h('p', { class: 'list__empty', text: 'No ' + f.itemLabel + 's yet.' }));
        }

        draw();
        return wrap;
    }

    /* Panels and tabs ------------------------------------------------------ */
    function renderEditor() {
        const editor = $('[data-editor]');
        const side = $('[data-side]');
        editor.textContent = '';
        side.textContent = '';

        const tabs = SCHEMA.map((s) => ({ id: s.id, title: s.title })).concat({ id: 'json', title: 'Raw JSON' });
        if (!tabs.some((t) => t.id === state.tab)) state.tab = 'profile';

        tabs.forEach((t) => {
            side.append(h('button', {
                type: 'button', class: 'side__link' + (t.id === 'json' ? ' side__link--code' : ''),
                'data-tab': t.id, text: t.title,
                onclick: () => showTab(t.id)
            }));
        });

        SCHEMA.forEach((section) => {
            const grid = h('div', { class: 'grid' });
            renderFields(section.fields, state.config, grid);
            editor.append(h('section', { class: 'panel', 'data-panel': section.id, 'aria-labelledby': 'p-' + section.id },
                h('header', { class: 'panel__head' },
                    h('h2', { class: 'panel__title', id: 'p-' + section.id, text: section.title }),
                    h('p', { class: 'panel__intro', text: section.intro })
                ),
                grid
            ));
        });

        editor.append(jsonPanel());
        showTab(state.tab, true);
    }

    function showTab(id, initial) {
        state.tab = id;
        write(TAB_KEY, id);
        $$('[data-tab]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.tab === id)));
        $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== id; });
        if (id === 'json') syncJson();
        if (!initial) $('[data-editor]').scrollTop = 0;
        if (!initial) window.scrollTo({ top: 0 });
    }

    function jsonPanel() {
        const area = h('textarea', { class: 'code', spellcheck: 'false', 'aria-label': 'config.json', rows: '28', 'data-json': '' });
        const msg = h('p', { class: 'json-msg', role: 'status' });
        return h('section', { class: 'panel', 'data-panel': 'json', 'aria-labelledby': 'p-json' },
            h('header', { class: 'panel__head' },
                h('h2', { class: 'panel__title', id: 'p-json', text: 'Raw JSON' }),
                h('p', { class: 'panel__intro', text: 'The whole config.json. Edit it directly, then apply to update the form.' })
            ),
            area,
            msg,
            h('div', { class: 'row' },
                h('button', {
                    type: 'button', class: 'btn btn--solid', text: 'Apply JSON',
                    onclick: () => {
                        try {
                            const parsed = JSON.parse(area.value);
                            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The top level must be an object.');
                            state.config = parsed;
                            renderEditor();
                            showTab('json');
                            changed();
                            toast('JSON applied.');
                        } catch (err) {
                            msg.textContent = err.message;
                            msg.dataset.tone = 'error';
                        }
                    }
                }),
                h('button', { type: 'button', class: 'btn', text: 'Revert to form', onclick: () => syncJson() })
            )
        );
    }

    function syncJson() {
        const area = $('[data-json]');
        if (area) area.value = serialize();
        const msg = $('.json-msg');
        if (msg) { msg.textContent = ''; delete msg.dataset.tone; }
    }

    /* Loading -------------------------------------------------------------- */
    async function load() {
        // Read any earlier draft first: the live preview overwrites the draft slot.
        const draft = parseDraft();
        const draftAt = Number(read(DRAFT_AT_KEY));
        let published;
        try {
            const res = await fetch(CONFIG_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            published = await res.json();
        } catch (err) {
            if (draft) {
                startWith(draft, '');
                toast('Could not load config.json (' + err.message + '). Showing your saved draft.', { tone: 'error', duration: 8000 });
                return;
            }
            $('[data-status]').textContent = 'Could not load config.json';
            $('[data-editor]').append(h('div', { class: 'panel' },
                h('h2', { class: 'panel__title', text: 'config.json could not be loaded' }),
                h('p', { class: 'panel__intro', text: err.message + '. ' + (location.protocol === 'file:'
                    ? 'Open this page through a local web server (for example: python3 -m http.server) rather than as a file.'
                    : 'Import a config file to start editing.') })
            ));
            return;
        }

        if (draft && serialize(draft) !== serialize(published)) {
            pendingDraft = draft;
            $('[data-banner-text]').textContent = 'You have unsaved changes from ' +
                (draftAt ? new Date(draftAt).toLocaleString() : 'an earlier session') + ' that are not in config.json yet.';
            $('[data-banner]').hidden = false;
        }

        startWith(published, serialize(published));
    }

    let pendingDraft = null;

    function parseDraft() {
        const raw = read(DRAFT_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    function startWith(config, baseline) {
        state.config = config;
        state.baseline = baseline;
        renderEditor();
        updateStatus();
        refreshPreview();
    }

    /* Saving --------------------------------------------------------------- */
    function download() {
        const url = URL.createObjectURL(new Blob([serialize()], { type: 'application/json' }));
        const a = h('a', { href: url, download: 'config.json' });
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('Downloaded config.json. Replace the file in the site folder to go live.');
    }

    async function saveToFile() {
        try {
            if (!state.fileHandle) {
                state.fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'config.json',
                    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
                });
            }
            const writable = await state.fileHandle.createWritable();
            await writable.write(serialize());
            await writable.close();
            markSaved();
            $('[data-action="save-file"]').textContent = 'Save to ' + state.fileHandle.name;
            toast('Saved to ' + state.fileHandle.name + '.');
        } catch (err) {
            if (err.name !== 'AbortError') toast('Could not save: ' + err.message, { tone: 'error' });
        }
    }

    function importFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not a config object');
                state.config = parsed;
                renderEditor();
                changed();
                toast('Imported ' + file.name + '.');
            } catch (err) {
                toast('That file is not valid JSON (' + err.message + ').', { tone: 'error' });
            }
        };
        reader.readAsText(file);
    }

    /* GitHub publishing ---------------------------------------------------- */
    function ghDefaults() {
        let saved = {};
        try { saved = JSON.parse(read(GH_KEY) || '{}'); } catch (e) { /* ignore */ }
        const pages = location.hostname.match(/^([^.]+)\.github\.io$/i);
        return Object.assign({
            owner: pages ? pages[1] : 'atiikmahmud',
            repo: pages ? location.hostname : 'atiikmahmud.github.io',
            branch: 'main',
            path: 'config.json',
            token: '',
            remember: false
        }, saved);
    }

    function toBase64(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return btoa(bin);
    }

    async function githubPublish(s) {
        const api = 'https://api.github.com/repos/' + encodeURIComponent(s.owner) + '/' + encodeURIComponent(s.repo) +
            '/contents/' + s.path.split('/').map(encodeURIComponent).join('/');
        const headers = {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer ' + s.token,
            'X-GitHub-Api-Version': '2022-11-28'
        };

        let sha;
        const current = await fetch(api + '?ref=' + encodeURIComponent(s.branch), { headers, cache: 'no-store' });
        if (current.ok) sha = (await current.json()).sha;
        else if (current.status !== 404) throw await ghError(current);

        const res = await fetch(api, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ message: s.message, content: toBase64(serialize()), branch: s.branch, sha })
        });
        if (!res.ok) throw await ghError(res);
        return res.json();
    }

    async function ghError(res) {
        let detail = '';
        try { detail = (await res.json()).message || ''; } catch (e) { /* ignore */ }
        const hints = {
            401: 'The token was rejected. Check that it is correct and has not expired.',
            403: 'The token does not have permission. It needs Contents: Read and write on this repository.',
            404: 'Repository or branch not found, or the token cannot see this repository.',
            409: 'config.json changed on GitHub while you were editing. Try publishing again.',
            422: 'GitHub rejected the update. Check the branch name.'
        };
        return new Error(hints[res.status] || ('GitHub error ' + res.status + (detail ? ': ' + detail : '')));
    }

    function openPublish() {
        const dialog = $('[data-dialog="publish"]');
        const form = $('[data-publish-form]');
        const d = ghDefaults();
        ['owner', 'repo', 'branch', 'path', 'token'].forEach((k) => { form.elements[k].value = d[k] || ''; });
        form.elements.remember.checked = !!d.remember;
        form.elements.message.value = 'Update portfolio content';
        $('[data-publish-msg]').textContent = '';
        dialog.showModal();
        (form.elements.token.value ? form.elements.message : form.elements.token).focus();
    }

    async function submitPublish(e) {
        const form = e.target;
        if (e.submitter && e.submitter.value === 'cancel') return;
        e.preventDefault();
        if (!form.reportValidity()) return;

        const s = {
            owner: form.elements.owner.value.trim(),
            repo: form.elements.repo.value.trim(),
            branch: form.elements.branch.value.trim(),
            path: form.elements.path.value.trim().replace(/^\/+/, ''),
            token: form.elements.token.value.trim(),
            remember: form.elements.remember.checked,
            message: form.elements.message.value.trim() || 'Update portfolio content'
        };
        const keep = { owner: s.owner, repo: s.repo, branch: s.branch, path: s.path, remember: s.remember };
        if (s.remember) keep.token = s.token;
        write(GH_KEY, JSON.stringify(keep));

        const msg = $('[data-publish-msg]');
        const submit = $('[data-publish-submit]');
        msg.dataset.tone = '';
        msg.textContent = 'Publishing…';
        submit.disabled = true;
        try {
            const result = await githubPublish(s);
            markSaved();
            $('[data-dialog="publish"]').close();
            toast('Published. The live site updates in a minute or two.', {
                link: result.commit && result.commit.html_url ? { href: result.commit.html_url, label: 'View commit' } : null,
                duration: 9000
            });
        } catch (err) {
            msg.dataset.tone = 'error';
            msg.textContent = err.message;
        } finally {
            submit.disabled = false;
        }
    }

    /* Live preview --------------------------------------------------------- */
    const frame = $('[data-frame]');
    const stage = $('[data-stage]');
    let device = 'desktop';
    let previewTimer;

    function previewOn() { return !$('[data-preview]').hidden; }

    function setPreview(on) {
        $('[data-preview]').hidden = !on;
        $('[data-layout]').classList.toggle('has-preview', on);
        $('[data-action="toggle-preview"]').setAttribute('aria-pressed', String(on));
        write(PREVIEW_KEY, on ? '1' : '0');
        if (on) {
            if (!frame.getAttribute('src')) frame.src = 'index.html?preview=live';
            else refreshPreview();
            fitFrame();
        }
    }

    function refreshPreview() {
        if (!previewOn() || !frame.getAttribute('src') || !state.config) return;
        // Don't overwrite an earlier draft the user hasn't decided about yet.
        if (pendingDraft && !$('[data-banner]').hidden) return;
        // The preview reads the draft from localStorage, so make sure it is current.
        write(DRAFT_KEY, serialize());
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
            try {
                const win = frame.contentWindow;
                const y = win.scrollY;
                frame.addEventListener('load', () => setTimeout(() => win.scrollTo(0, y), 120), { once: true });
                win.location.reload();
            } catch (e) {
                frame.src = 'index.html?preview=live';
            }
        }, 450);
    }

    // Desktop renders the page at 1440 px and scales it down to fit the pane.
    function fitFrame() {
        const w = stage.clientWidth;
        const hgt = stage.clientHeight;
        if (!w) return;
        if (device === 'desktop') {
            const scale = Math.min(1, w / 1440);
            frame.style.width = '1440px';
            frame.style.height = (hgt / scale) + 'px';
            frame.style.transform = 'scale(' + scale + ')';
        } else {
            frame.style.width = Math.min(390, w) + 'px';
            frame.style.height = hgt + 'px';
            frame.style.transform = 'none';
        }
        stage.dataset.device = device;
    }

    /* Wiring --------------------------------------------------------------- */
    function bind() {
        const on = (action, fn) => $('[data-action="' + action + '"]').addEventListener('click', fn);

        on('download', download);
        on('import', () => $('[data-import]').click());
        on('publish', openPublish);
        on('toggle-preview', () => setPreview(!previewOn()));
        on('restore-draft', () => {
            $('[data-banner]').hidden = true;
            if (pendingDraft) { state.config = pendingDraft; renderEditor(); changed(); }
            pendingDraft = null;
        });
        on('discard-draft', () => {
            remove(DRAFT_KEY);
            remove(DRAFT_AT_KEY);
            $('[data-banner]').hidden = true;
            pendingDraft = null;
            refreshPreview();
        });

        $('[data-import]').addEventListener('change', (e) => {
            if (e.target.files[0]) importFile(e.target.files[0]);
            e.target.value = '';
        });

        const saveBtn = $('[data-action="save-file"]');
        if ('showSaveFilePicker' in window) {
            saveBtn.hidden = false;
            saveBtn.addEventListener('click', saveToFile);
        }

        $('[data-publish-form]').addEventListener('submit', submitPublish);

        $$('[data-device]').forEach((b) => b.addEventListener('click', () => {
            device = b.dataset.device;
            $$('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            fitFrame();
        }));
        if ('ResizeObserver' in window) new ResizeObserver(fitFrame).observe(stage);

        // Ctrl/Cmd + S saves (to the chosen file when possible, otherwise downloads).
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if ('showSaveFilePicker' in window) saveToFile(); else download();
            }
        });

        window.addEventListener('beforeunload', (e) => {
            // The draft is autosaved, so this only guards the last few keystrokes.
            if (isDirty()) write(DRAFT_KEY, serialize());
            void e;
        });

        if (read(PREVIEW_KEY) === '1' && window.matchMedia('(min-width: 1100px)').matches) setPreview(true);
    }

    bind();
    load();
})();
