
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    //brondat
    const store_input_primarydataset_raw = writable(0);
    const store_input_primarydataset_processed = writable(0);

    //visualisatiedatasets
    const store_visualisatiedataset_bubblechart = writable(0);
    const store_visualisatiedataset_racechart = writable(0);

    //instellingen
    const store_instelling_kostenkentaltransportnet = writable(0);
    const store_instelling_gjtarief = writable(0);
    const store_instelling_lengtetransportleiding = writable(0);
    const store_instelling_mapcontextswitch = writable(0);

    //selectieinfo
    const store_selectie_gemeentenaam = writable(0);
    const store_selectie_buurtcodes = writable(0);
    const store_selectie_buurtnamen = writable(0);
    const store_selectie_weq = writable(0);
    const store_selectie_co2reductie = writable(0);
    const store_selectie_woningen_bouwperiode = writable(0);
    const store_selectie_woningen_woningtype = writable(0);

    //tussenresultaten
    const store_tussenresultaat_kapitaalslasten_transportnet = writable(0);
    const store_tussenresultaat_primarydataset_processed = writable(0);

    /* src/Calculations.svelte generated by Svelte v3.32.1 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dynamicSort(property) {
    	var sortOrder = 1;

    	if (property[0] === "-") {
    		sortOrder = -1;
    		property = property.substr(1);
    	}

    	return function (a, b) {
    		var result = a[property] < b[property]
    		? -1
    		: a[property] > b[property] ? 1 : 0;

    		return result * sortOrder;
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Calculations", slots, []);
    	var kapitaalslasten_transportnet_current;

    	store_tussenresultaat_kapitaalslasten_transportnet.subscribe(value => {
    		kapitaalslasten_transportnet_current = value;
    	});

    	var selectie_weq;

    	store_selectie_weq.subscribe(value => {
    		selectie_weq = value;
    	});

    	var selectie_co2reductie;

    	store_selectie_co2reductie.subscribe(value => {
    		selectie_co2reductie = value;
    	});

    	var instelling_lengtetransportleiding;

    	store_instelling_lengtetransportleiding.subscribe(value => {
    		instelling_lengtetransportleiding = value;
    	});

    	var selectie_buurtcodes;

    	store_selectie_buurtcodes.subscribe(value => {
    		selectie_buurtcodes = value;
    	});

    	var instelling_gjtarief;

    	store_instelling_gjtarief.subscribe(value => {
    		instelling_gjtarief = value;
    	});

    	var input_primarydataset_raw;

    	store_input_primarydataset_raw.subscribe(value => {
    		input_primarydataset_raw = value;
    	});

    	var i, j;
    	var h17_ranking = [];
    	var bubblechartdata_collector = [];
    	var s1a_hoofdresultaat = 0;
    	var s2c_hoofdresultaat = 0;
    	var s2f_hoofdresultaat = 0;

    	// aantallen registry
    	var s1a_aantalweq = 0;

    	var s2c_aantalweq = 0;
    	var s2f_aantalweq = 0;

    	var totaal_aantal_woningen_per_bouwperiode = {
    		bp1: 0,
    		bp2: 0,
    		bp3: 0,
    		bp4: 0,
    		bp5: 0,
    		bp6: 0,
    		bp7: 0
    	};

    	var totaal_aantal_woningen_per_woningtype = {
    		twee1kap: 0,
    		vrij: 0,
    		gestapeld: 0,
    		rijhoek: 0,
    		rijtussen: 0
    	};

    	var co2_reductie_som = 0;
    	var count_analysed = 0;

    	// berekeningen
    	var results_dynamic = {
    		s1a: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		s2c: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		s2f: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		ref30: {
    			I11_aantalweq: 0,
    			H15: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0
    		}
    	};

    	var results_static = {
    		s1a: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		s2c: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		s2f: {
    			K01: 0,
    			K02: 0,
    			K03: 0,
    			K04: 0,
    			K05: 0,
    			K06: 0,
    			K07: 0,
    			K08: 0,
    			K09: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H02: 0,
    			H03: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0,
    			H13: 0
    		},
    		ref30: {
    			I11_aantalweq: 0,
    			H15: 0,
    			K11: 0,
    			K12: 0,
    			K13: 0,
    			K14: 0,
    			K15: 0,
    			K16: 0,
    			H09: 0,
    			H10: 0,
    			H11: 0,
    			H12: 0
    		}
    	};

    	var knobvalues_dynamic = {
    		s1a: {
    			K01: 1,
    			K02: 1,
    			K03: 1,
    			K04: 1,
    			K05: 1,
    			K06: 1,
    			K07: 1,
    			K08: 1,
    			K09: 1,
    			K11: 1,
    			K12: 1,
    			K13: 1,
    			K14: 1,
    			K15: 1,
    			K16: 1,
    			H02: 1,
    			H03: 1,
    			H09: 1,
    			H10: 1,
    			H11: 1,
    			H12: 1,
    			H13: 1
    		},
    		s2c: {
    			K01: 1,
    			K02: 1,
    			K03: 1,
    			K04: 1,
    			K05: 1,
    			K06: 1,
    			K07: 1,
    			K08: 1,
    			K09: 1,
    			K11: 1,
    			K12: 1,
    			K13: 1,
    			K14: 1,
    			K15: 1,
    			K16: 1,
    			H02: 1,
    			H03: 1,
    			H09: 1,
    			H10: 1,
    			H11: 1,
    			H12: 1,
    			H13: 1
    		},
    		s2f: {
    			K01: 1,
    			K02: 1,
    			K03: 1,
    			K04: 1,
    			K05: 1,
    			K06: 1,
    			K07: 1,
    			K08: 1,
    			K09: 1,
    			K11: 1,
    			K12: 1,
    			K13: 1,
    			K14: 1,
    			K15: 1,
    			K16: 1,
    			H02: 1,
    			H03: 1,
    			H09: 1,
    			H10: 1,
    			H11: 1,
    			H12: 1,
    			H13: 1
    		}
    	};

    	var s1a_som = {
    		egnet: 0,
    		wnet_buurt: 0,
    		wnet_pand: 0,
    		wnet_transport: 0,
    		wnet_bron: 0,
    		iso: 0,
    		inst: 0,
    		om: 0,
    		energie: 0,
    		aantalweq: 0,
    		h17_share: 0,
    		kosten_elektriciteit_warmtepomp: 0,
    		wnet_warmtevraag: 0
    	};

    	var s2c_som = {
    		egnet: 0,
    		wnet_buurt: 0,
    		wnet_pand: 0,
    		wnet_transport: 0,
    		wnet_bron: 0,
    		iso: 0,
    		inst: 0,
    		om: 0,
    		energie: 0,
    		aantalweq: 0,
    		h17_share: 0,
    		kosten_elektriciteit_warmtepomp: 0,
    		wnet_warmtevraag: 0
    	};

    	var s2f_som = {
    		egnet: 0,
    		wnet_buurt: 0,
    		wnet_pand: 0,
    		wnet_transport: 0,
    		wnet_bron: 0,
    		iso: 0,
    		inst: 0,
    		om: 0,
    		energie: 0,
    		aantalweq: 0,
    		h17_share: 0,
    		kosten_elektriciteit_warmtepomp: 0,
    		wnet_warmtevraag: 0
    	};

    	window.color_buurten = (index, buco) => {
    		let colors2 = ["#1976d2", "#ffd54f", "#e64a19"];
    		var polygon_opacity = 0.4;

    		//register bouwperiode woningen
    		totaal_aantal_woningen_per_bouwperiode.bp1 += parseInt(input_primarydataset_raw.features[index].properties.won_bp1);

    		totaal_aantal_woningen_per_bouwperiode.bp2 += parseInt(input_primarydataset_raw.features[index].properties.won_bp2);
    		totaal_aantal_woningen_per_bouwperiode.bp3 += parseInt(input_primarydataset_raw.features[index].properties.won_bp3);
    		totaal_aantal_woningen_per_bouwperiode.bp4 += parseInt(input_primarydataset_raw.features[index].properties.won_bp4);
    		totaal_aantal_woningen_per_bouwperiode.bp5 += parseInt(input_primarydataset_raw.features[index].properties.won_bp5);
    		totaal_aantal_woningen_per_bouwperiode.bp6 += parseInt(input_primarydataset_raw.features[index].properties.won_bp6);
    		totaal_aantal_woningen_per_bouwperiode.bp7 += parseInt(input_primarydataset_raw.features[index].properties.won_bp7);

    		// console.log(totaal_aantal_woningen_per_bouwperiode)
    		//register woningtype woningen
    		totaal_aantal_woningen_per_woningtype.twee1kap += parseInt(input_primarydataset_raw.features[index].properties.wt_21kap);

    		totaal_aantal_woningen_per_woningtype.vrijstaand += parseInt(input_primarydataset_raw.features[index].properties.wt_vrijsaa);
    		totaal_aantal_woningen_per_woningtype.gestapeld += parseInt(input_primarydataset_raw.features[index].properties.wt_mgz_hoo) + parseInt(input_primarydataset_raw.features[index].properties.wt_mgz_laa);
    		totaal_aantal_woningen_per_woningtype.rijhoek += parseInt(input_primarydataset_raw.features[index].properties.wt_rwhoek);
    		totaal_aantal_woningen_per_woningtype.rijtussen += parseInt(input_primarydataset_raw.features[index].properties.wt_rwtusse);

    		switch (h17_ranking[0].strat) {
    			case "s1a":
    				if (selectie_buurtcodes.indexOf(buco) >= 0) {
    					d3.select("#" + buco).attr("fill", colors2[0]).style("opacity", polygon_opacity);

    					//register aantal weq
    					s1a_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq);
    				} else {
    					d3.select("#" + buco).attr("fill", function () {
    						return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));
    					}).style("opacity", 0.6);
    				}
    				break;
    			case "s2c":
    				if (selectie_buurtcodes.indexOf(buco) >= 0) {
    					d3.select("#" + buco).attr("fill", colors2[1]).style("opacity", polygon_opacity);

    					//register aantal weq
    					s2c_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq);
    				} else {
    					d3.select("#" + buco).attr("fill", function () {
    						return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));
    					}).style("opacity", 0.6);
    				}
    				break;
    			case "s2f":
    				if (selectie_buurtcodes.indexOf(buco) >= 0) {
    					d3.select("#" + buco).attr("fill", colors2[2]).style("opacity", polygon_opacity);

    					//register aantal weq
    					s2f_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq);
    				} else {
    					d3.select("#" + buco).attr("fill", function () {
    						return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));
    					}).style("opacity", 0.6);
    				}
    				break;
    		}
    	};

    	window.adapt_opacity = opacity => {
    		var i;

    		for (i = 0; i < selectie_buurtcodes.length; i++) {
    			d3.select("#" + selectie_buurtcodes[i]).style("opacity", opacity);
    		}
    	};

    	window.get_color_D02 = D02 => {
    		// deze functie kleurt niet-geselecteerde buurten. Wordt nu geen gebruik van gemaakt.
    		return "none";
    	};

    	window.recalculate_results = buurt_geladen => {
    		var variantcode = ["s1a", "s2c", "s2f"];

    		var K_code = [
    			"K01",
    			"K02",
    			"K03",
    			"K04",
    			"K05",
    			"K06",
    			"K07",
    			"K08",
    			"K09",
    			"K11",
    			"K12",
    			"K13",
    			"K14",
    			"K15",
    			"K16",
    			"H02",
    			"H03",
    			"H09",
    			"H10",
    			"H11",
    			"H12",
    			"H13"
    		];

    		var ref30_code = [
    			"I11_aantalweq",
    			"H15",
    			"K11",
    			"K12",
    			"K13",
    			"K14",
    			"K15",
    			"K16",
    			"H09",
    			"H10",
    			"H11",
    			"H12"
    		];

    		// STAP A: STRUCTUREER STATISCHE RESULTATEN
    		for (j = 0; j < variantcode.length; j++) {
    			for (i = 0; i < K_code.length; i++) {
    				if (Number.isInteger(parseInt(buurt_geladen[variantcode[j] + "_" + K_code[i]]))) {
    					results_static[variantcode[j]][K_code[i]] = parseInt(buurt_geladen[variantcode[j] + "_" + K_code[i]]);
    				} else {
    					results_static[variantcode[j]][K_code[i]] = 0;
    				}
    			}
    		}

    		for (i = 0; i < ref30_code.length; i++) {
    			if (Number.isInteger(parseInt(buurt_geladen["ref_2030_" + ref30_code[i]]))) {
    				results_static["ref30"][ref30_code[i]] = parseInt(buurt_geladen["ref_2030_" + ref30_code[i]]);
    			} else {
    				results_static["ref30"][ref30_code[i]] = 0;
    			}
    		}

    		results_static["ref30"]["I11_aantalweq"] = parseInt(buurt_geladen["I11_aantalweq"]);

    		//MUTEER DYNAMISCHE RESULTATEN MET INSTELLINGEN
    		for (j = 0; j < variantcode.length; j++) {
    			for (i = 0; i < K_code.length; i++) {
    				results_dynamic[variantcode[j]][K_code[i]] = results_static[variantcode[j]][K_code[i]] * knobvalues_dynamic[variantcode[j]][K_code[i]];
    			}
    		}

    		bubblechartdata_collector = [];

    		//BEREKEN H17
    		s1a_hoofdresultaat = process_NK("s1a", buurt_geladen.BU_CODE);

    		s2c_hoofdresultaat = process_NK("s2c", buurt_geladen.BU_CODE);
    		s2f_hoofdresultaat = process_NK("s2f", buurt_geladen.BU_CODE);

    		// CREEER ARRAY MET RESULTATEN, NEGEER WAARVOOR GEEN RESULTAAT
    		h17_ranking = [];

    		if (Number.isNaN(s1a_hoofdresultaat) == false) {
    			h17_ranking.push({ strat: "s1a", h17: s1a_hoofdresultaat });
    		}

    		if (Number.isNaN(s2c_hoofdresultaat) == false) {
    			h17_ranking.push({ strat: "s2c", h17: s2c_hoofdresultaat });
    		}

    		if (Number.isNaN(s2f_hoofdresultaat) == false) {
    			h17_ranking.push({ strat: "s2f", h17: s2f_hoofdresultaat });
    		}

    		//SORTEER DE RESULTATEN VAN LAAGSTE NAAR HOOGSTE NATIONALE KOSTEN
    		h17_ranking.sort(dynamicSort("h17"));

    		store_visualisatiedataset_racechart.update(n => h17_ranking);
    		store_tussenresultaat_primarydataset_processed.update(n => results_dynamic);
    		store_input_primarydataset_processed.update(n => results_static);
    	};

    	window.update_boxchartdata = () => {
    		var boxchart_data = [];

    		boxchart_data.push({
    			stratid: "s1a",
    			egnet: Math.round(s1a_som.egnet / selectie_weq),
    			wnet_buurt: Math.round(s1a_som.wnet_buurt / selectie_weq),
    			wnet_pand: Math.round(s1a_som.wnet_pand / selectie_weq),
    			wnet_transport: Math.round(s1a_som.wnet_transport / selectie_weq),
    			wnet_bron: Math.round(s1a_som.wnet_bron / selectie_weq),
    			iso: Math.round(s1a_som.iso / selectie_weq),
    			inst: Math.round(s1a_som.inst / selectie_weq),
    			om: Math.round(s1a_som.om / selectie_weq),
    			energie: Math.round(s1a_som.energie / selectie_weq),
    			h17_weighed: Math.round(s1a_som.h17_share),
    			totaal_aantal_weq: s1a_som.aantalweq,
    			warmtepomp_elek: s1a_som.kosten_elektriciteit_warmtepomp / selectie_weq,
    			co2_red_totaal: co2_reductie_som
    		});

    		bubblechartdata_collector.push(boxchart_data[0]);

    		boxchart_data.push({
    			stratid: "s2c",
    			egnet: Math.round(s2c_som.egnet / selectie_weq),
    			wnet_buurt: Math.round(s2c_som.wnet_buurt / selectie_weq),
    			wnet_pand: Math.round(s2c_som.wnet_pand / selectie_weq),
    			wnet_transport: Math.round(kapitaalslasten_transportnet_current),
    			wnet_bron: Math.round(s2c_som.wnet_bron / selectie_weq),
    			iso: Math.round(s2c_som.iso / selectie_weq),
    			inst: Math.round(s2c_som.inst / selectie_weq),
    			om: Math.round(s2c_som.om / selectie_weq),
    			energie: Math.round(s2c_som.energie / selectie_weq),
    			I11_aantalweq: results_static["ref30"].I11_aantalweq,
    			warmtevraag: s2c_som.wnet_warmtevraag,
    			h17_weighed: Math.round(s2c_som.h17_share),
    			totaal_aantal_weq: s2c_som.aantalweq,
    			warmtepomp_elek: 0
    		});

    		bubblechartdata_collector.push(boxchart_data[1]);

    		boxchart_data.push({
    			stratid: "s2f",
    			egnet: Math.round(s2f_som.egnet / selectie_weq),
    			wnet_buurt: Math.round(s2f_som.wnet_buurt / selectie_weq),
    			wnet_pand: Math.round(s2f_som.wnet_pand / selectie_weq),
    			wnet_transport: Math.round(kapitaalslasten_transportnet_current),
    			wnet_bron: Math.round(s2f_som.wnet_bron / selectie_weq),
    			iso: Math.round(s2f_som.iso / selectie_weq),
    			inst: Math.round(s2f_som.inst / selectie_weq),
    			om: Math.round(s2f_som.om / selectie_weq),
    			energie: Math.round(s2f_som.energie / selectie_weq),
    			I11_aantalweq: results_static["ref30"].I11_aantalweq,
    			warmtevraag: s2f_som.wnet_warmtevraag,
    			h17_weighed: Math.round(s2f_som.h17_share),
    			totaal_aantal_weq: s2f_som.aantalweq,
    			warmtepomp_elek: 0
    		});

    		bubblechartdata_collector.push(boxchart_data[2]);
    		var h17_wa_array = [];

    		h17_wa_array.push({
    			strat: "s1a",
    			h17: Math.round(s1a_som.h17_share)
    		});

    		h17_wa_array.push({
    			strat: "s2c",
    			h17: Math.round(s2c_som.h17_share)
    		});

    		h17_wa_array.push({
    			strat: "s2f",
    			h17: Math.round(s2f_som.h17_share)
    		});

    		h17_wa_array.sort(dynamicSort("h17"));
    		store_visualisatiedataset_racechart.update(n => h17_wa_array);
    		store_visualisatiedataset_bubblechart.update(n => bubblechartdata_collector);

    		s1a_som = {
    			egnet: 0,
    			wnet_buurt: 0,
    			wnet_pand: 0,
    			wnet_transport: 0,
    			wnet_bron: 0,
    			iso: 0,
    			inst: 0,
    			om: 0,
    			energie: 0,
    			aantalweq: 0,
    			h17_share: 0,
    			kosten_elektriciteit_warmtepomp: 0,
    			wnet_warmtevraag: 0
    		};

    		s2c_som = {
    			egnet: 0,
    			wnet_buurt: 0,
    			wnet_pand: 0,
    			wnet_transport: 0,
    			wnet_bron: 0,
    			iso: 0,
    			inst: 0,
    			om: 0,
    			energie: 0,
    			aantalweq: 0,
    			h17_share: 0,
    			kosten_elektriciteit_warmtepomp: 0,
    			wnet_warmtevraag: 0
    		};

    		s2f_som = {
    			egnet: 0,
    			wnet_buurt: 0,
    			wnet_pand: 0,
    			wnet_transport: 0,
    			wnet_bron: 0,
    			iso: 0,
    			inst: 0,
    			om: 0,
    			energie: 0,
    			aantalweq: 0,
    			h17_share: 0,
    			kosten_elektriciteit_warmtepomp: 0,
    			wnet_warmtevraag: 0
    		};

    		co2_reductie_som = 0;
    		count_analysed = 0;
    	};

    	window.process_NK = (stratid, buurtcode) => {
    		if (stratid == "s1a") {
    			var mutatie_kapitaalslasten = results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03 + results_dynamic[stratid].K04 + results_dynamic[stratid].K05 + results_dynamic[stratid].K06 + results_dynamic[stratid].K07 + results_dynamic[stratid].K08 + results_dynamic[stratid].K09;
    			var mutatie_variabelekosten = results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13 + results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13 + results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
    			var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
    			var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

    			if (selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
    				count_analysed = count_analysed + 1;
    				s1a_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
    				s1a_som.wnet_buurt += results_dynamic[stratid].K04;
    				s1a_som.wnet_pand += results_dynamic[stratid].K05;
    				s1a_som.wnet_transport += results_dynamic[stratid].K06;
    				s1a_som.wnet_bron += results_dynamic[stratid].K07;
    				s1a_som.iso += results_dynamic[stratid].K08;
    				s1a_som.inst += results_dynamic[stratid].K09;
    				s1a_som.om += results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
    				s1a_som.energie += results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13 - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
    				s1a_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
    				s1a_som.h17_share += results_static.ref30.H15 / selectie_co2reductie * resultaat_H17;
    				co2_reductie_som += results_static.ref30.H15;
    			}

    			return Math.round(resultaat_H17);
    		} else //else do custom calculations for S2
    		if (stratid == "s2c") {
    			var kostprijs_warmte = instelling_gjtarief / 100;
    			var warmtekosten_allin = (results_dynamic[stratid].H10 + results_dynamic[stratid].H12) * kostprijs_warmte * results_static.ref30.I11_aantalweq;

    			// H12 en H10 voor meting warmtevraag op niveau 'levering aan buurt'
    			var mutatie_kapitaalslasten = results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03 + results_dynamic[stratid].K04 + results_dynamic[stratid].K05 + //results_dynamic[stratid].K06 +
    			kapitaalslasten_transportnet_current * results_static.ref30.I11_aantalweq + // = K06
    			//results_dynamic[stratid].K07 + //covered under allin-warmteprijs
    			results_dynamic[stratid].K08 + results_dynamic[stratid].K09;

    			var mutatie_variabelekosten = // results_dynamic[stratid].K11 +
    			// results_dynamic[stratid].K12 +
    			results_dynamic[stratid].K13 + results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (// results_static.ref30.K11 +
    			results_static.ref30.K12 + // discount reference gas use
    			results_static.ref30.K13 + results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16) + warmtekosten_allin;

    			var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
    			var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

    			if (selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
    				s2c_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
    				s2c_som.wnet_buurt += results_dynamic[stratid].K04;
    				s2c_som.wnet_pand += results_dynamic[stratid].K05;
    				s2c_som.wnet_transport += results_dynamic[stratid].K06; //unused, neaten
    				s2c_som.wnet_bron += warmtekosten_allin;
    				s2c_som.iso += results_dynamic[stratid].K08;
    				s2c_som.inst += results_dynamic[stratid].K09;
    				s2c_som.om += results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
    				s2c_som.energie += results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13 - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
    				s2c_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
    				s2c_som.wnet_warmtevraag += (results_dynamic[stratid].H02 + results_dynamic[stratid].H03) * results_static.ref30.I11_aantalweq;
    				s2c_som.h17_share += results_static.ref30.H15 / selectie_co2reductie * resultaat_H17;
    			}

    			return Math.round(resultaat_H17);
    		} else if (stratid == "s2f") {
    			var kostprijs_warmte = instelling_gjtarief / 100;
    			var warmtekosten_allin = (results_dynamic[stratid].H10 + results_dynamic[stratid].H12) * kostprijs_warmte * results_static.ref30.I11_aantalweq;

    			var mutatie_kapitaalslasten = results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03 + results_dynamic[stratid].K04 + results_dynamic[stratid].K05 + kapitaalslasten_transportnet_current * results_static.ref30.I11_aantalweq + // = K06 en  K07 = covered under allin-warmteprijs
    			results_dynamic[stratid].K08 + results_dynamic[stratid].K09;

    			var mutatie_variabelekosten = results_dynamic[stratid].K13 + results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (results_static.ref30.K12 + // discount reference gas use
    			results_static.ref30.K13 + results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16) + warmtekosten_allin;

    			var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
    			var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

    			if (selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
    				s2f_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
    				s2f_som.wnet_buurt += results_dynamic[stratid].K04;
    				s2f_som.wnet_pand += results_dynamic[stratid].K05;
    				s2f_som.wnet_transport += results_dynamic[stratid].K06;
    				s2f_som.wnet_bron += warmtekosten_allin;
    				s2f_som.iso += results_dynamic[stratid].K08;
    				s2f_som.inst += results_dynamic[stratid].K09;
    				s2f_som.om += results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16 - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
    				s2f_som.energie += results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13 - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
    				s2f_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
    				s2f_som.wnet_warmtevraag += (results_dynamic[stratid].H02 + results_dynamic[stratid].H03) * results_static.ref30.I11_aantalweq;
    				s2f_som.h17_share += results_static.ref30.H15 / selectie_co2reductie * resultaat_H17;
    			}

    			return Math.round(resultaat_H17);
    		}
    	};

    	window.mutationrequest = (stratid, kid, value) => {
    		knobvalues_dynamic[stratid][kid] = value;
    		results_dynamic[stratid][kid] = results_static[stratid][kid] * knobvalues_dynamic[stratid][kid];
    	};

    	window.redraw_donutChart = () => {
    		//var totaal_aantal_woningen_per_bouwperiode = [{bp1: 0},{bp2: 0},{bp3: 0},{bp4: 0},{bp5: 0},{bp6: 0},{bp7: 0}];
    		//var totaal_aantal_woningen_per_woningtype = [{twee1kap: 0},{vrij: 0},{gestapeld: 0},{rijhoek: 0},{rijtussen: 0}];
    		var donutdata_bouwperiode = [
    			{
    				label: "< 1930",
    				value: totaal_aantal_woningen_per_bouwperiode.bp1
    			},
    			{
    				label: "1930 - 1945",
    				value: totaal_aantal_woningen_per_bouwperiode.bp2
    			},
    			{
    				label: "1945 - 1965",
    				value: totaal_aantal_woningen_per_bouwperiode.bp3
    			},
    			{
    				label: "1965 - 1976",
    				value: totaal_aantal_woningen_per_bouwperiode.bp4
    			},
    			{
    				label: "1975 - 1992",
    				value: totaal_aantal_woningen_per_bouwperiode.bp5
    			},
    			{
    				label: "1992 - 2005",
    				value: totaal_aantal_woningen_per_bouwperiode.bp6
    			},
    			{
    				label: "2006 >",
    				value: totaal_aantal_woningen_per_bouwperiode.bp7
    			}
    		];

    		store_selectie_woningen_bouwperiode.update(n => donutdata_bouwperiode);

    		var donutdata_woningtype = [
    			{
    				label: "Gestapeld",
    				value: totaal_aantal_woningen_per_woningtype.gestapeld
    			},
    			{
    				label: "2-1-kap",
    				value: totaal_aantal_woningen_per_woningtype.twee1kap
    			},
    			{
    				label: "Rij-hoek",
    				value: totaal_aantal_woningen_per_woningtype.rijhoek
    			},
    			{
    				label: "Rij-tussen",
    				value: totaal_aantal_woningen_per_woningtype.rijtussen
    			},
    			{
    				label: "Vrijstaand",
    				value: totaal_aantal_woningen_per_woningtype.vrijstaand
    			}
    		];

    		store_selectie_woningen_woningtype.update(n => donutdata_woningtype);

    		var donutdata_weq = [
    			{ label: "s1a", value: s1a_aantalweq },
    			{ label: "s2c", value: s2c_aantalweq },
    			{ label: "s2f", value: s2f_aantalweq }
    		];

    		s1a_aantalweq = 0;
    		s2c_aantalweq = 0;
    		s2f_aantalweq = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp1 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp2 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp3 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp4 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp5 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp6 = 0;
    		totaal_aantal_woningen_per_bouwperiode.bp7 = 0;
    		totaal_aantal_woningen_per_woningtype.gestapeld = 0;
    		totaal_aantal_woningen_per_woningtype.twee1kap = 0;
    		totaal_aantal_woningen_per_woningtype.rijhoek = 0;
    		totaal_aantal_woningen_per_woningtype.rijtussen = 0;
    		totaal_aantal_woningen_per_woningtype.vrijstaand = 0;

    		if (JSON.stringify(donutdata_bouwperiode) != JSON.stringify(window.donutdata_bouwperiode_log)) {
    			donutChartChange_bouwperiode(donutdata_bouwperiode);
    		}

    		if (JSON.stringify(donutdata_woningtype) != JSON.stringify(window.donutdata_woningtype_log)) {
    			donutChartChange_woningtype(donutdata_woningtype);
    		}

    		if (JSON.stringify(window.donutdata_weq_log) != JSON.stringify(donutdata_weq)) ; // do nothing

    		if (JSON.stringify(window.donutdata_weq_log) != JSON.stringify(donutdata_weq)) {
    			donutChartChange_weq(donutdata_weq);
    		}

    		window.donutdata_bouwperiode_log = donutdata_bouwperiode; // store van maken
    		window.donutdata_woningtype_log = donutdata_woningtype; // store van maken
    		window.donutdata_weq_log = donutdata_weq; // store van maken
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Calculations> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		store_input_primarydataset_raw,
    		store_input_primarydataset_processed,
    		store_visualisatiedataset_racechart,
    		store_visualisatiedataset_bubblechart,
    		store_instelling_gjtarief,
    		store_instelling_lengtetransportleiding,
    		store_selectie_buurtcodes,
    		store_selectie_weq,
    		store_selectie_co2reductie,
    		store_selectie_woningen_woningtype,
    		store_selectie_woningen_bouwperiode,
    		store_tussenresultaat_kapitaalslasten_transportnet,
    		store_tussenresultaat_primarydataset_processed,
    		kapitaalslasten_transportnet_current,
    		selectie_weq,
    		selectie_co2reductie,
    		instelling_lengtetransportleiding,
    		selectie_buurtcodes,
    		instelling_gjtarief,
    		input_primarydataset_raw,
    		i,
    		j,
    		h17_ranking,
    		bubblechartdata_collector,
    		s1a_hoofdresultaat,
    		s2c_hoofdresultaat,
    		s2f_hoofdresultaat,
    		s1a_aantalweq,
    		s2c_aantalweq,
    		s2f_aantalweq,
    		totaal_aantal_woningen_per_bouwperiode,
    		totaal_aantal_woningen_per_woningtype,
    		co2_reductie_som,
    		count_analysed,
    		results_dynamic,
    		results_static,
    		knobvalues_dynamic,
    		s1a_som,
    		s2c_som,
    		s2f_som,
    		dynamicSort
    	});

    	$$self.$inject_state = $$props => {
    		if ("kapitaalslasten_transportnet_current" in $$props) kapitaalslasten_transportnet_current = $$props.kapitaalslasten_transportnet_current;
    		if ("selectie_weq" in $$props) selectie_weq = $$props.selectie_weq;
    		if ("selectie_co2reductie" in $$props) selectie_co2reductie = $$props.selectie_co2reductie;
    		if ("instelling_lengtetransportleiding" in $$props) instelling_lengtetransportleiding = $$props.instelling_lengtetransportleiding;
    		if ("selectie_buurtcodes" in $$props) selectie_buurtcodes = $$props.selectie_buurtcodes;
    		if ("instelling_gjtarief" in $$props) instelling_gjtarief = $$props.instelling_gjtarief;
    		if ("input_primarydataset_raw" in $$props) input_primarydataset_raw = $$props.input_primarydataset_raw;
    		if ("i" in $$props) i = $$props.i;
    		if ("j" in $$props) j = $$props.j;
    		if ("h17_ranking" in $$props) h17_ranking = $$props.h17_ranking;
    		if ("bubblechartdata_collector" in $$props) bubblechartdata_collector = $$props.bubblechartdata_collector;
    		if ("s1a_hoofdresultaat" in $$props) s1a_hoofdresultaat = $$props.s1a_hoofdresultaat;
    		if ("s2c_hoofdresultaat" in $$props) s2c_hoofdresultaat = $$props.s2c_hoofdresultaat;
    		if ("s2f_hoofdresultaat" in $$props) s2f_hoofdresultaat = $$props.s2f_hoofdresultaat;
    		if ("s1a_aantalweq" in $$props) s1a_aantalweq = $$props.s1a_aantalweq;
    		if ("s2c_aantalweq" in $$props) s2c_aantalweq = $$props.s2c_aantalweq;
    		if ("s2f_aantalweq" in $$props) s2f_aantalweq = $$props.s2f_aantalweq;
    		if ("totaal_aantal_woningen_per_bouwperiode" in $$props) totaal_aantal_woningen_per_bouwperiode = $$props.totaal_aantal_woningen_per_bouwperiode;
    		if ("totaal_aantal_woningen_per_woningtype" in $$props) totaal_aantal_woningen_per_woningtype = $$props.totaal_aantal_woningen_per_woningtype;
    		if ("co2_reductie_som" in $$props) co2_reductie_som = $$props.co2_reductie_som;
    		if ("count_analysed" in $$props) count_analysed = $$props.count_analysed;
    		if ("results_dynamic" in $$props) results_dynamic = $$props.results_dynamic;
    		if ("results_static" in $$props) results_static = $$props.results_static;
    		if ("knobvalues_dynamic" in $$props) knobvalues_dynamic = $$props.knobvalues_dynamic;
    		if ("s1a_som" in $$props) s1a_som = $$props.s1a_som;
    		if ("s2c_som" in $$props) s2c_som = $$props.s2c_som;
    		if ("s2f_som" in $$props) s2f_som = $$props.s2f_som;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Calculations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculations",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/DonutChart_weq.svelte generated by Svelte v3.32.1 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DonutChart_weq", slots, []);
    	var piechart_canvas;

    	onMount(() => {
    		piechart_canvas = d3.select("#DonutChartC").append("svg").attr("width", "150px").attr("height", "100px").append("g");
    		piechart_canvas.append("text").attr("class", "footer-item-hoofd").attr("id", "popup_reportdownload").style("font-family", "RijksoverheidSans").style("font-size", 16 + "px").style("font-weight", 400).text("WEQ").attr("text-anchor", "middle").attr("fill", "#000").attr("transform", "translate(0,7)");
    		piechart_canvas.append("g").attr("class", "slices");
    		piechart_canvas.append("g").attr("class", "labels");
    		piechart_canvas.append("g").attr("class", "lines");
    		var width = 150, height = 80, radius = Math.min(width, height) / 2;

    		var pie = d3.pie().sort(null).value(function (d) {
    			return d.value;
    		});

    		var arc = d3.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.6);
    		var outerArc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    		piechart_canvas.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    		var key = function (d) {
    			return d.data.label;
    		};

    		var color = d3.scaleOrdinal().domain(["s1a", "s2c", "s2f"]).range(["#90caf9", "#ffecb3", "#ffab91"]);

    		window.donutChartChange_weq = data => {
    			var i;
    			var total_weq = 0;

    			for (i = 0; i < data.length; i++) {
    				total_weq = total_weq + data[i].value;
    			}

    			// pie slices
    			var slice = piechart_canvas.select(".slices").selectAll("path.slice").data(pie(data), key);

    			slice.enter().insert("path").style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5).style("fill", function (d) {
    				return color(d.data.label);
    			}).attr("class", "slice");

    			slice.transition().duration(1000).attrTween("d", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					return arc(interpolate(t));
    				};
    			});

    			slice.exit().remove();

    			// textlabels
    			var text = piechart_canvas.select(".labels").selectAll("text").data(pie(data), key).text(function (d) {
    				if (parseInt(d.value / total_weq * 100) > 2) {
    					return parseInt(d.value / total_weq * 100) + "%";
    				} else return "";
    			});

    			text.enter().append("text").style("font-family", "RijksoverheidSans").style("font-size", "13px").attr("dy", ".35em").attr("fill", "black").text(function (d) {
    				return parseInt(d.value * 100);
    			});

    			function midAngle(d) {
    				return d.startAngle + (d.endAngle - d.startAngle) / 2;
    			}

    			text.transition().duration(1000).attrTween("transform", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
    					return "translate(" + pos + ")";
    				};
    			}).styleTween("text-anchor", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					return midAngle(d2) < Math.PI ? "start" : "end";
    				};
    			});

    			text.exit().remove();

    			// slice text to polylines
    			var polyline = piechart_canvas.select(".lines").selectAll("polyline").data(pie(data), key).style("opacity", function (d) {
    				if (parseInt(d.value / total_weq * 100) > 2) {
    					return 1;
    				} else return 0;
    			});

    			polyline.enter().append("polyline");

    			polyline.transition().duration(1000).attrTween("points", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
    					return [arc.centroid(d2), outerArc.centroid(d2), pos];
    				};
    			});

    			polyline.exit().remove();
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DonutChart_weq> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, piechart_canvas });

    	$$self.$inject_state = $$props => {
    		if ("piechart_canvas" in $$props) piechart_canvas = $$props.piechart_canvas;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class DonutChart_weq extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DonutChart_weq",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/DonutChart_bouwperiode.svelte generated by Svelte v3.32.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DonutChart_bouwperiode", slots, []);
    	var piechart_canvas;

    	onMount(() => {
    		// initialiseer piecharts
    		piechart_canvas = d3.select("#DonutChartA").append("svg").attr("width", "150px").attr("height", "100px").append("g");

    		piechart_canvas.append("text").style("font-family", "RijksoverheidSans").style("font-size", 16 + "px").style("font-weight", 800).text("Bouwperiode").attr("text-anchor", "middle").attr("fill", "#000").attr("transform", "translate(0,-7)");
    		piechart_canvas.append("text").style("font-family", "RijksoverheidSans").style("font-size", 16 + "px").style("font-weight", 800).text("woningen").attr("text-anchor", "middle").attr("fill", "#000").attr("transform", "translate(0,13)");
    		piechart_canvas.append("g").attr("class", "slices");
    		piechart_canvas.append("g").attr("class", "labels");
    		piechart_canvas.append("g").attr("class", "lines");
    		var width = 250, height = 250, radius = Math.min(width, height) / 2;

    		var pie = d3.pie().sort(null).value(function (d) {
    			return d.value;
    		});

    		var arc = d3.arc().outerRadius(radius * 0.7).innerRadius(radius * 0.5);
    		var outerArc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    		piechart_canvas.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    		var key = function (d) {
    			return d.data.label;
    		};

    		var color = d3.scaleOrdinal().domain([
    			"< '30",
    			"30 - '45",
    			"'46 - '64",
    			"'65 - '74",
    			"'75 - '91",
    			"'92 - '05",
    			"'06 >"
    		]).range(["#333333", "#43514c", "#537067", "#639182", "#72b39f", "#82d6bd", "#91fbdc"]);

    		window.donutChartChange_bouwperiode = data => {
    			var i;
    			var total_weq = 0;

    			for (i = 0; i < data.length; i++) {
    				total_weq = total_weq + data[i].value;
    			}

    			// pie slices
    			var slice = piechart_canvas.select(".slices").selectAll("path.slice").data(pie(data), key);

    			slice.enter().insert("path").style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5).style("fill", function (d) {
    				return color(d.data.label);
    			}).attr("class", "slice");

    			slice.transition().duration(1000).attrTween("d", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					return arc(interpolate(t));
    				};
    			});

    			slice.exit().remove();

    			// text labels
    			var text = piechart_canvas.select(".labels").selectAll("text").data(pie(data), key).text(function (d) {
    				if (parseInt(d.value / total_weq * 100) > 1) {
    					return d.data.label + ", " + parseInt(d.value / total_weq * 100) + "%";
    				} else return "";
    			});

    			text.enter().append("text").style("font-family", "RijksoverheidSans").style("font-size", "16px").style("font-weight", 800).attr("dy", ".35em").attr("fill", "black").text(function (d) {
    				return parseInt(d.value * 100);
    			});

    			function midAngle(d) {
    				return d.startAngle + (d.endAngle - d.startAngle) / 2;
    			}

    			text.transition().duration(1000).attrTween("transform", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
    					return "translate(" + pos + ")";
    				};
    			}).styleTween("text-anchor", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					return midAngle(d2) < Math.PI ? "start" : "end";
    				};
    			});

    			text.exit().remove();

    			// slice text to polylines
    			var polyline = piechart_canvas.select(".lines").selectAll("polyline").data(pie(data), key).style("opacity", function (d) {
    				if (parseInt(d.value / total_weq * 100) > 1) {
    					return 1;
    				} else return 0;
    			});

    			polyline.enter().append("polyline");

    			polyline.transition().duration(1000).attrTween("points", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
    					return [arc.centroid(d2), outerArc.centroid(d2), pos];
    				};
    			});

    			polyline.exit().remove();
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DonutChart_bouwperiode> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, piechart_canvas });

    	$$self.$inject_state = $$props => {
    		if ("piechart_canvas" in $$props) piechart_canvas = $$props.piechart_canvas;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class DonutChart_bouwperiode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DonutChart_bouwperiode",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/DonutChart_woningtype.svelte generated by Svelte v3.32.1 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DonutChart_woningtype", slots, []);
    	var piechart_canvas;

    	onMount(() => {
    		piechart_canvas = d3.select("#DonutChartB").append("svg").attr("width", "150px").attr("height", "100px").append("g");
    		piechart_canvas.append("text").style("font-family", "RijksoverheidSans").style("font-size", 16 + "px").style("font-weight", 800).text("Woningtype").attr("text-anchor", "middle").attr("fill", "#000").attr("transform", "translate(0,0)");
    		piechart_canvas.append("g").attr("class", "slices");
    		piechart_canvas.append("g").attr("class", "labels");
    		piechart_canvas.append("g").attr("class", "lines");
    		var width = 250, height = 250, radius = Math.min(width, height) / 2;

    		var pie = d3.pie().sort(null).value(function (d) {
    			return d.value;
    		});

    		var arc = d3.arc().outerRadius(radius * 0.7).innerRadius(radius * 0.5);
    		var outerArc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    		piechart_canvas.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    		var key = function (d) {
    			return d.data.label;
    		};

    		var color = d3.scaleOrdinal().domain(["Gestapeld", "2-1-kap", "Rij-hoek", "Rij-tussen", "Vrijstaand"]).range(["#DE6451", "#1F9DCE", "#9667B8", "#60BA80", "#F1A33A"]);

    		window.donutChartChange_woningtype = data => {
    			var i;
    			var total_weq = 0;

    			for (i = 0; i < data.length; i++) {
    				total_weq = total_weq + data[i].value;
    			}

    			// pie slices
    			var slice = piechart_canvas.select(".slices").selectAll("path.slice").data(pie(data), key);

    			slice.enter().insert("path").style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5).style("fill", function (d) {
    				return color(d.data.label);
    			}).attr("class", "slice");

    			slice.transition().duration(1000).attrTween("d", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					return arc(interpolate(t));
    				};
    			});

    			slice.exit().remove();

    			//textlabels
    			var text = piechart_canvas.select(".labels").selectAll("text").data(pie(data), key).text(function (d) {
    				if (parseInt(d.value / total_weq * 100) > 2) {
    					return d.data.label + ", " + parseInt(d.value / total_weq * 100) + "%";
    				} else return "";
    			});

    			text.enter().append("text").style("font-family", "RijksoverheidSans").style("font-size", "16px").style("font-weight", 800).attr("dy", ".35em").attr("fill", "black").text(function (d) {
    				return parseInt(d.value * 100);
    			});

    			function midAngle(d) {
    				return d.startAngle + (d.endAngle - d.startAngle) / 2;
    			}

    			text.transition().duration(1000).attrTween("transform", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
    					return "translate(" + pos + ")";
    				};
    			}).styleTween("text-anchor", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					return midAngle(d2) < Math.PI ? "start" : "end";
    				};
    			});

    			text.exit().remove();

    			// slice text to polylines
    			var polyline = piechart_canvas.select(".lines").selectAll("polyline").data(pie(data), key).style("opacity", function (d) {
    				if (parseInt(d.value / total_weq * 100) > 2) {
    					return 1;
    				} else return 0;
    			});

    			polyline.enter().append("polyline");

    			polyline.transition().duration(1000).attrTween("points", function (d) {
    				this._current = this._current || d;
    				var interpolate = d3.interpolate(this._current, d);
    				this._current = interpolate(0);

    				return function (t) {
    					var d2 = interpolate(t);
    					var pos = outerArc.centroid(d2);
    					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
    					return [arc.centroid(d2), outerArc.centroid(d2), pos];
    				};
    			});

    			polyline.exit().remove();
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DonutChart_woningtype> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, piechart_canvas });

    	$$self.$inject_state = $$props => {
    		if ("piechart_canvas" in $$props) piechart_canvas = $$props.piechart_canvas;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class DonutChart_woningtype extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DonutChart_woningtype",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /* node_modules/svelte-materialify/dist/components/MaterialApp/MaterialApp.svelte generated by Svelte v3.32.1 */

    const file = "node_modules/svelte-materialify/dist/components/MaterialApp/MaterialApp.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file, 13082, 0, 248465);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Icon/Icon.svelte generated by Svelte v3.32.1 */
    const file$1 = "node_modules/svelte-materialify/dist/components/Icon/Icon.svelte";

    // (65:2) {#if path}
    function create_if_block(ctx) {
    	let svg;
    	let path_1;
    	let if_block = /*label*/ ctx[6] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[5]);
    			add_location(path_1, file$1, 70, 6, 1512);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$1, 65, 4, 1394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 32) {
    				attr_dev(path_1, "d", /*path*/ ctx[5]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(65:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (72:8) {#if label}
    function create_if_block_1(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[6]);
    			add_location(title, file$1, 72, 10, 1558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 64) set_data_dev(t, /*label*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[5] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[0]);
    			attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			attr_dev(i, "style", /*style*/ ctx[7]);
    			toggle_class(i, "spin", /*spin*/ ctx[3]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			add_location(i, file$1, 55, 0, 1172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[1],
    					"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[0])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 64) {
    				attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(i, "style", /*style*/ ctx[7]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 6) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[1],
    				"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    			});

    			if (dirty & /*klass, spin*/ 9) {
    				toggle_class(i, "spin", /*spin*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "size", "rotate", "spin", "disabled", "path", "label", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, size, rotate, spin, disabled, path, label, style, $$scope, slots];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			size: 1,
    			rotate: 2,
    			spin: 3,
    			disabled: 4,
    			path: 5,
    			label: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Button/Button.svelte generated by Svelte v3.32.1 */
    const file$2 = "node_modules/svelte-materialify/dist/components/Button/Button.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let button_levels = [
    		{
    			class: button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0]
    		},
    		{ type: /*type*/ ctx[13] },
    		{ style: /*style*/ ctx[15] },
    		{ disabled: /*disabled*/ ctx[10] },
    		{ "aria-disabled": /*disabled*/ ctx[10] },
    		/*$$restProps*/ ctx[16]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$2, 270, 2, 5682);
    			set_attributes(button, button_data);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    			add_location(button, file$2, 251, 0, 5286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button, /*ripple*/ ctx[14])),
    					listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*size, klass*/ 17 && button_class_value !== (button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0])) && { class: button_class_value },
    				(!current || dirty & /*type*/ 8192) && { type: /*type*/ ctx[13] },
    				(!current || dirty & /*style*/ 32768) && { style: /*style*/ ctx[15] },
    				(!current || dirty & /*disabled*/ 1024) && { disabled: /*disabled*/ ctx[10] },
    				(!current || dirty & /*disabled*/ 1024) && { "aria-disabled": /*disabled*/ ctx[10] },
    				dirty & /*$$restProps*/ 65536 && /*$$restProps*/ ctx[16]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 6144) Class_action.update.call(null, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 16384) Ripple_action.update.call(null, /*ripple*/ ctx[14]);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(0, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(15, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(15, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			fab: 1,
    			icon: 2,
    			block: 3,
    			size: 4,
    			tile: 5,
    			text: 6,
    			depressed: 7,
    			outlined: 8,
    			rounded: 9,
    			disabled: 10,
    			active: 11,
    			activeClass: 12,
    			type: 13,
    			ripple: 14,
    			style: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/ItemGroup/ItemGroup.svelte generated by Svelte v3.32.1 */
    const file$3 = "node_modules/svelte-materialify/dist/components/ItemGroup/ItemGroup.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$3, 58, 0, 1480);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemGroup", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!(mandatory && value === 1)) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(multiple ? val : [val]);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max",
    		"role",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 8) {
    			 valueStore.set(value);
    		}

    		if ($$self.$$.dirty & /*value*/ 8) {
    			 dispatch("change", value);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Input/Input.svelte generated by Svelte v3.32.1 */
    const file$4 = "node_modules/svelte-materialify/dist/components/Input/Input.svelte";
    const get_append_outer_slot_changes = dirty => ({});
    const get_append_outer_slot_context = ctx => ({});
    const get_messages_slot_changes = dirty => ({});
    const get_messages_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes = dirty => ({});
    const get_prepend_outer_slot_context = ctx => ({});

    function create_fragment$8(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_outer_slot_template = /*#slots*/ ctx[9]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_prepend_outer_slot_context);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const messages_slot_template = /*#slots*/ ctx[9].messages;
    	const messages_slot = create_slot(messages_slot_template, ctx, /*$$scope*/ ctx[8], get_messages_slot_context);
    	const append_outer_slot_template = /*#slots*/ ctx[9]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_append_outer_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_outer_slot) prepend_outer_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (messages_slot) messages_slot.c();
    			t2 = space();
    			if (append_outer_slot) append_outer_slot.c();
    			attr_dev(div0, "class", "s-input__slot");
    			add_location(div0, file$4, 385, 4, 9687);
    			attr_dev(div1, "class", "s-input__details");
    			add_location(div1, file$4, 388, 4, 9745);
    			attr_dev(div2, "class", "s-input__control");
    			add_location(div2, file$4, 384, 2, 9652);
    			attr_dev(div3, "class", div3_class_value = "s-input " + /*klass*/ ctx[0]);
    			attr_dev(div3, "style", /*style*/ ctx[7]);
    			toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			toggle_class(div3, "error", /*error*/ ctx[5]);
    			toggle_class(div3, "success", /*success*/ ctx[6]);
    			toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$4, 374, 0, 9434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (messages_slot) {
    				messages_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_outer_slot) {
    				append_outer_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div3, /*success*/ ctx[6]
    				? "success"
    				: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_prepend_outer_slot_changes, get_prepend_outer_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (messages_slot) {
    				if (messages_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(messages_slot, messages_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_messages_slot_changes, get_messages_slot_context);
    				}
    			}

    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_append_outer_slot_changes, get_append_outer_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div3_class_value !== (div3_class_value = "s-input " + /*klass*/ ctx[0])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div3, "style", /*style*/ ctx[7]);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*success, error, color*/ 98) TextColor_action.update.call(null, /*success*/ ctx[6]
    			? "success"
    			: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]);

    			if (dirty & /*klass, dense*/ 5) {
    				toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			}

    			if (dirty & /*klass, error*/ 33) {
    				toggle_class(div3, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*klass, success*/ 65) {
    				toggle_class(div3, "success", /*success*/ ctx[6]);
    			}

    			if (dirty & /*klass, readonly*/ 9) {
    				toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			transition_in(default_slot, local);
    			transition_in(messages_slot, local);
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			transition_out(default_slot, local);
    			transition_out(messages_slot, local);
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (messages_slot) messages_slot.d(detaching);
    			if (append_outer_slot) append_outer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, ['prepend-outer','default','messages','append-outer']);
    	let { class: klass = "" } = $$props;
    	let { color = null } = $$props;
    	let { dense = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "color", "dense", "readonly", "disabled", "error", "success", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		color,
    		dense,
    		readonly,
    		disabled,
    		error,
    		success,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, color, dense, readonly, disabled, error, success, style, $$scope, slots];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 0,
    			color: 1,
    			dense: 2,
    			readonly: 3,
    			disabled: 4,
    			error: 5,
    			success: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var uid = (len) => {
      let str = '';
      let num = len || 11;
      while (num--) str += HEX[(Math.random() * 36) | 0];
      return str;
    };

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* eslint-disable */

    var nouislider_min = createCommonjsModule(function (module, exports) {
    /*! nouislider - 14.6.1 - 8/17/2020 */
    !(function (t) {
        (module.exports = t())
        ;
    })(function () {
      var lt = '14.6.1';
      function ut(t) {
        t.parentElement.removeChild(t);
      }
      function a(t) {
        return null != t;
      }
      function ct(t) {
        t.preventDefault();
      }
      function o(t) {
        return 'number' == typeof t && !isNaN(t) && isFinite(t);
      }
      function pt(t, e, r) {
        0 < r &&
          (ht(t, e),
          setTimeout(function () {
            mt(t, e);
          }, r));
      }
      function ft(t) {
        return Math.max(Math.min(t, 100), 0);
      }
      function dt(t) {
        return Array.isArray(t) ? t : [t];
      }
      function e(t) {
        var e = (t = String(t)).split('.');
        return 1 < e.length ? e[1].length : 0;
      }
      function ht(t, e) {
        t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
      }
      function mt(t, e) {
        t.classList && !/\s/.test(e)
          ? t.classList.remove(e)
          : (t.className = t.className.replace(
              new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'),
              ' ',
            ));
      }
      function gt(t) {
        var e = void 0 !== window.pageXOffset,
          r = 'CSS1Compat' === (t.compatMode || '');
        return {
          x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
          y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
        };
      }
      function c(t, e) {
        return 100 / (e - t);
      }
      function p(t, e, r) {
        return (100 * e) / (t[r + 1] - t[r]);
      }
      function f(t, e) {
        for (var r = 1; t >= e[r]; ) r += 1;
        return r;
      }
      function r(t, e, r) {
        if (r >= t.slice(-1)[0]) return 100;
        var n,
          i,
          o = f(r, t),
          s = t[o - 1],
          a = t[o],
          l = e[o - 1],
          u = e[o];
        return (
          l +
          ((i = r), p((n = [s, a]), n[0] < 0 ? i + Math.abs(n[0]) : i - n[0], 0) / c(l, u))
        );
      }
      function n(t, e, r, n) {
        if (100 === n) return n;
        var i,
          o,
          s = f(n, t),
          a = t[s - 1],
          l = t[s];
        return r
          ? (l - a) / 2 < n - a
            ? l
            : a
          : e[s - 1]
          ? t[s - 1] + ((i = n - t[s - 1]), (o = e[s - 1]), Math.round(i / o) * o)
          : n;
      }
      function s(t, e, r) {
        var n;
        if (('number' == typeof e && (e = [e]), !Array.isArray(e)))
          throw new Error('noUiSlider (' + lt + "): 'range' contains invalid value.");
        if (!o((n = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !o(e[0]))
          throw new Error('noUiSlider (' + lt + "): 'range' value isn't numeric.");
        r.xPct.push(n),
          r.xVal.push(e[0]),
          n ? r.xSteps.push(!isNaN(e[1]) && e[1]) : isNaN(e[1]) || (r.xSteps[0] = e[1]),
          r.xHighestCompleteStep.push(0);
      }
      function l(t, e, r) {
        if (e)
          if (r.xVal[t] !== r.xVal[t + 1]) {
            r.xSteps[t] = p([r.xVal[t], r.xVal[t + 1]], e, 0) / c(r.xPct[t], r.xPct[t + 1]);
            var n = (r.xVal[t + 1] - r.xVal[t]) / r.xNumSteps[t],
              i = Math.ceil(Number(n.toFixed(3)) - 1),
              o = r.xVal[t] + r.xNumSteps[t] * i;
            r.xHighestCompleteStep[t] = o;
          } else r.xSteps[t] = r.xHighestCompleteStep[t] = r.xVal[t];
      }
      function i(t, e, r) {
        var n;
        (this.xPct = []),
          (this.xVal = []),
          (this.xSteps = [r || !1]),
          (this.xNumSteps = [!1]),
          (this.xHighestCompleteStep = []),
          (this.snap = e);
        var i = [];
        for (n in t) t.hasOwnProperty(n) && i.push([t[n], n]);
        for (
          i.length && 'object' == typeof i[0][0]
            ? i.sort(function (t, e) {
                return t[0][0] - e[0][0];
              })
            : i.sort(function (t, e) {
                return t[0] - e[0];
              }),
            n = 0;
          n < i.length;
          n++
        )
          s(i[n][1], i[n][0], this);
        for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
          l(n, this.xNumSteps[n], this);
      }
      (i.prototype.getDistance = function (t) {
        var e,
          r = [];
        for (e = 0; e < this.xNumSteps.length - 1; e++) {
          var n = this.xNumSteps[e];
          if (n && (t / n) % 1 != 0)
            throw new Error(
              'noUiSlider (' +
                lt +
                "): 'limit', 'margin' and 'padding' of " +
                this.xPct[e] +
                '% range must be divisible by step.',
            );
          r[e] = p(this.xVal, t, e);
        }
        return r;
      }),
        (i.prototype.getAbsoluteDistance = function (t, e, r) {
          var n,
            i = 0;
          if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
          else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
          r || t !== this.xPct[i + 1] || i++;
          var o = 1,
            s = e[i],
            a = 0,
            l = 0,
            u = 0,
            c = 0;
          for (
            n = r
              ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
              : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
            0 < s;

          )
            (a = this.xPct[i + 1 + c] - this.xPct[i + c]),
              100 < e[i + c] * o + 100 - 100 * n
                ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
              r
                ? ((u -= l), 1 <= this.xPct.length + c && c--)
                : ((u += l), 1 <= this.xPct.length - c && c++),
              (s = e[i + c] * o);
          return t + u;
        }),
        (i.prototype.toStepping = function (t) {
          return (t = r(this.xVal, this.xPct, t));
        }),
        (i.prototype.fromStepping = function (t) {
          return (function (t, e, r) {
            if (100 <= r) return t.slice(-1)[0];
            var n,
              i = f(r, e),
              o = t[i - 1],
              s = t[i],
              a = e[i - 1],
              l = e[i];
            return (n = [o, s]), ((r - a) * c(a, l) * (n[1] - n[0])) / 100 + n[0];
          })(this.xVal, this.xPct, t);
        }),
        (i.prototype.getStep = function (t) {
          return (t = n(this.xPct, this.xSteps, this.snap, t));
        }),
        (i.prototype.getDefaultStep = function (t, e, r) {
          var n = f(t, this.xPct);
          return (
            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
            (this.xVal[n] - this.xVal[n - 1]) / r
          );
        }),
        (i.prototype.getNearbySteps = function (t) {
          var e = f(t, this.xPct);
          return {
            stepBefore: {
              startValue: this.xVal[e - 2],
              step: this.xNumSteps[e - 2],
              highestStep: this.xHighestCompleteStep[e - 2],
            },
            thisStep: {
              startValue: this.xVal[e - 1],
              step: this.xNumSteps[e - 1],
              highestStep: this.xHighestCompleteStep[e - 1],
            },
            stepAfter: {
              startValue: this.xVal[e],
              step: this.xNumSteps[e],
              highestStep: this.xHighestCompleteStep[e],
            },
          };
        }),
        (i.prototype.countStepDecimals = function () {
          var t = this.xNumSteps.map(e);
          return Math.max.apply(null, t);
        }),
        (i.prototype.convert = function (t) {
          return this.getStep(this.toStepping(t));
        });
      var u = {
          to: function (t) {
            return void 0 !== t && t.toFixed(2);
          },
          from: Number,
        },
        d = {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle',
          handleLower: 'handle-lower',
          handleUpper: 'handle-upper',
          touchArea: 'touch-area',
          horizontal: 'horizontal',
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          textDirectionLtr: 'txt-dir-ltr',
          textDirectionRtl: 'txt-dir-rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub',
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub',
        };
      function h(t) {
        if (
          'object' == typeof (e = t) &&
          'function' == typeof e.to &&
          'function' == typeof e.from
        )
          return !0;
        var e;
        throw new Error(
          'noUiSlider (' + lt + "): 'format' requires 'to' and 'from' methods.",
        );
      }
      function m(t, e) {
        if (!o(e)) throw new Error('noUiSlider (' + lt + "): 'step' is not numeric.");
        t.singleStep = e;
      }
      function g(t, e) {
        if (!o(e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardPageMultiplier' is not numeric.",
          );
        t.keyboardPageMultiplier = e;
      }
      function v(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'keyboardDefaultStep' is not numeric.");
        t.keyboardDefaultStep = e;
      }
      function b(t, e) {
        if ('object' != typeof e || Array.isArray(e))
          throw new Error('noUiSlider (' + lt + "): 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)
          throw new Error('noUiSlider (' + lt + "): Missing 'min' or 'max' in 'range'.");
        if (e.min === e.max)
          throw new Error(
            'noUiSlider (' + lt + "): 'range' 'min' and 'max' cannot be equal.",
          );
        t.spectrum = new i(e, t.snap, t.singleStep);
      }
      function x(t, e) {
        if (((e = dt(e)), !Array.isArray(e) || !e.length))
          throw new Error('noUiSlider (' + lt + "): 'start' option is incorrect.");
        (t.handles = e.length), (t.start = e);
      }
      function S(t, e) {
        if ('boolean' != typeof (t.snap = e))
          throw new Error('noUiSlider (' + lt + "): 'snap' option must be a boolean.");
      }
      function w(t, e) {
        if ('boolean' != typeof (t.animate = e))
          throw new Error('noUiSlider (' + lt + "): 'animate' option must be a boolean.");
      }
      function y(t, e) {
        if ('number' != typeof (t.animationDuration = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'animationDuration' option must be a number.",
          );
      }
      function E(t, e) {
        var r,
          n = [!1];
        if (
          ('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]),
          !0 === e || !1 === e)
        ) {
          for (r = 1; r < t.handles; r++) n.push(e);
          n.push(!1);
        } else {
          if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
            throw new Error(
              'noUiSlider (' + lt + "): 'connect' option doesn't match handle count.",
            );
          n = e;
        }
        t.connect = n;
      }
      function C(t, e) {
        switch (e) {
          case 'horizontal':
            t.ort = 0;
            break;
          case 'vertical':
            t.ort = 1;
            break;
          default:
            throw new Error('noUiSlider (' + lt + "): 'orientation' option is invalid.");
        }
      }
      function P(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'margin' option must be numeric.");
        0 !== e && (t.margin = t.spectrum.getDistance(e));
      }
      function N(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'limit' option must be numeric.");
        if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'limit' option is only supported on linear sliders with 2 or more handles.",
          );
      }
      function k(t, e) {
        var r;
        if (!o(e) && !Array.isArray(e))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (Array.isArray(e) && 2 !== e.length && !o(e[0]) && !o(e[1]))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (0 !== e) {
          for (
            Array.isArray(e) || (e = [e, e]),
              t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])],
              r = 0;
            r < t.spectrum.xNumSteps.length - 1;
            r++
          )
            if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
              throw new Error(
                'noUiSlider (' + lt + "): 'padding' option must be a positive number(s).",
              );
          var n = e[0] + e[1],
            i = t.spectrum.xVal[0];
          if (1 < n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i))
            throw new Error(
              'noUiSlider (' + lt + "): 'padding' option must not exceed 100% of the range.",
            );
        }
      }
      function U(t, e) {
        switch (e) {
          case 'ltr':
            t.dir = 0;
            break;
          case 'rtl':
            t.dir = 1;
            break;
          default:
            throw new Error(
              'noUiSlider (' + lt + "): 'direction' option was not recognized.",
            );
        }
      }
      function A(t, e) {
        if ('string' != typeof e)
          throw new Error(
            'noUiSlider (' + lt + "): 'behaviour' must be a string containing options.",
          );
        var r = 0 <= e.indexOf('tap'),
          n = 0 <= e.indexOf('drag'),
          i = 0 <= e.indexOf('fixed'),
          o = 0 <= e.indexOf('snap'),
          s = 0 <= e.indexOf('hover'),
          a = 0 <= e.indexOf('unconstrained');
        if (i) {
          if (2 !== t.handles)
            throw new Error(
              'noUiSlider (' + lt + "): 'fixed' behaviour must be used with 2 handles",
            );
          P(t, t.start[1] - t.start[0]);
        }
        if (a && (t.margin || t.limit))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'unconstrained' behaviour cannot be used with margin or limit",
          );
        t.events = { tap: r || o, drag: n, fixed: i, snap: o, hover: s, unconstrained: a };
      }
      function V(t, e) {
        if (!1 !== e)
          if (!0 === e) {
            t.tooltips = [];
            for (var r = 0; r < t.handles; r++) t.tooltips.push(!0);
          } else {
            if (((t.tooltips = dt(e)), t.tooltips.length !== t.handles))
              throw new Error(
                'noUiSlider (' + lt + '): must pass a formatter for all handles.',
              );
            t.tooltips.forEach(function (t) {
              if (
                'boolean' != typeof t &&
                ('object' != typeof t || 'function' != typeof t.to)
              )
                throw new Error(
                  'noUiSlider (' +
                    lt +
                    "): 'tooltips' must be passed a formatter or 'false'.",
                );
            });
          }
      }
      function D(t, e) {
        h((t.ariaFormat = e));
      }
      function M(t, e) {
        h((t.format = e));
      }
      function O(t, e) {
        if ('boolean' != typeof (t.keyboardSupport = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardSupport' option must be a boolean.",
          );
      }
      function L(t, e) {
        t.documentElement = e;
      }
      function z(t, e) {
        if ('string' != typeof e && !1 !== e)
          throw new Error(
            'noUiSlider (' + lt + "): 'cssPrefix' must be a string or `false`.",
          );
        t.cssPrefix = e;
      }
      function H(t, e) {
        if ('object' != typeof e)
          throw new Error('noUiSlider (' + lt + "): 'cssClasses' must be an object.");
        if ('string' == typeof t.cssPrefix)
          for (var r in ((t.cssClasses = {}), e))
            e.hasOwnProperty(r) && (t.cssClasses[r] = t.cssPrefix + e[r]);
        else t.cssClasses = e;
      }
      function vt(e) {
        var r = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: !0,
            animationDuration: 300,
            ariaFormat: u,
            format: u,
          },
          n = {
            step: { r: !1, t: m },
            keyboardPageMultiplier: { r: !1, t: g },
            keyboardDefaultStep: { r: !1, t: v },
            start: { r: !0, t: x },
            connect: { r: !0, t: E },
            direction: { r: !0, t: U },
            snap: { r: !1, t: S },
            animate: { r: !1, t: w },
            animationDuration: { r: !1, t: y },
            range: { r: !0, t: b },
            orientation: { r: !1, t: C },
            margin: { r: !1, t: P },
            limit: { r: !1, t: N },
            padding: { r: !1, t: k },
            behaviour: { r: !0, t: A },
            ariaFormat: { r: !1, t: D },
            format: { r: !1, t: M },
            tooltips: { r: !1, t: V },
            keyboardSupport: { r: !0, t: O },
            documentElement: { r: !1, t: L },
            cssPrefix: { r: !0, t: z },
            cssClasses: { r: !0, t: H },
          },
          i = {
            connect: !1,
            direction: 'ltr',
            behaviour: 'tap',
            orientation: 'horizontal',
            keyboardSupport: !0,
            cssPrefix: 'noUi-',
            cssClasses: d,
            keyboardPageMultiplier: 5,
            keyboardDefaultStep: 10,
          };
        e.format && !e.ariaFormat && (e.ariaFormat = e.format),
          Object.keys(n).forEach(function (t) {
            if (!a(e[t]) && void 0 === i[t]) {
              if (n[t].r)
                throw new Error('noUiSlider (' + lt + "): '" + t + "' is required.");
              return !0;
            }
            n[t].t(r, a(e[t]) ? e[t] : i[t]);
          }),
          (r.pips = e.pips);
        var t = document.createElement('div'),
          o = void 0 !== t.style.msTransform,
          s = void 0 !== t.style.transform;
        r.transformRule = s ? 'transform' : o ? 'msTransform' : 'webkitTransform';
        return (
          (r.style = [
            ['left', 'top'],
            ['right', 'bottom'],
          ][r.dir][r.ort]),
          r
        );
      }
      function j(t, b, o) {
        var l,
          u,
          s,
          c,
          i,
          a,
          e,
          p,
          f = window.navigator.pointerEnabled
            ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
            : window.navigator.msPointerEnabled
            ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
            : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
              },
          d =
            window.CSS &&
            CSS.supports &&
            CSS.supports('touch-action', 'none') &&
            (function () {
              var t = !1;
              try {
                var e = Object.defineProperty({}, 'passive', {
                  get: function () {
                    t = !0;
                  },
                });
                window.addEventListener('test', null, e);
              } catch (t) {}
              return t;
            })(),
          h = t,
          y = b.spectrum,
          x = [],
          S = [],
          m = [],
          g = 0,
          v = {},
          w = t.ownerDocument,
          E = b.documentElement || w.documentElement,
          C = w.body,
          P = -1,
          N = 0,
          k = 1,
          U = 2,
          A = 'rtl' === w.dir || 1 === b.ort ? 0 : 100;
        function V(t, e) {
          var r = w.createElement('div');
          return e && ht(r, e), t.appendChild(r), r;
        }
        function D(t, e) {
          var r = V(t, b.cssClasses.origin),
            n = V(r, b.cssClasses.handle);
          return (
            V(n, b.cssClasses.touchArea),
            n.setAttribute('data-handle', e),
            b.keyboardSupport &&
              (n.setAttribute('tabindex', '0'),
              n.addEventListener('keydown', function (t) {
                return (function (t, e) {
                  if (O() || L(e)) return !1;
                  var r = ['Left', 'Right'],
                    n = ['Down', 'Up'],
                    i = ['PageDown', 'PageUp'],
                    o = ['Home', 'End'];
                  b.dir && !b.ort
                    ? r.reverse()
                    : b.ort && !b.dir && (n.reverse(), i.reverse());
                  var s,
                    a = t.key.replace('Arrow', ''),
                    l = a === i[0],
                    u = a === i[1],
                    c = a === n[0] || a === r[0] || l,
                    p = a === n[1] || a === r[1] || u,
                    f = a === o[0],
                    d = a === o[1];
                  if (!(c || p || f || d)) return !0;
                  if ((t.preventDefault(), p || c)) {
                    var h = b.keyboardPageMultiplier,
                      m = c ? 0 : 1,
                      g = at(e),
                      v = g[m];
                    if (null === v) return !1;
                    !1 === v && (v = y.getDefaultStep(S[e], c, b.keyboardDefaultStep)),
                      (u || l) && (v *= h),
                      (v = Math.max(v, 1e-7)),
                      (v *= c ? -1 : 1),
                      (s = x[e] + v);
                  } else s = d ? b.spectrum.xVal[b.spectrum.xVal.length - 1] : b.spectrum.xVal[0];
                  return (
                    rt(e, y.toStepping(s), !0, !0),
                    J('slide', e),
                    J('update', e),
                    J('change', e),
                    J('set', e),
                    !1
                  );
                })(t, e);
              })),
            n.setAttribute('role', 'slider'),
            n.setAttribute('aria-orientation', b.ort ? 'vertical' : 'horizontal'),
            0 === e
              ? ht(n, b.cssClasses.handleLower)
              : e === b.handles - 1 && ht(n, b.cssClasses.handleUpper),
            r
          );
        }
        function M(t, e) {
          return !!e && V(t, b.cssClasses.connect);
        }
        function r(t, e) {
          return !!b.tooltips[e] && V(t.firstChild, b.cssClasses.tooltip);
        }
        function O() {
          return h.hasAttribute('disabled');
        }
        function L(t) {
          return u[t].hasAttribute('disabled');
        }
        function z() {
          i &&
            (G('update.tooltips'),
            i.forEach(function (t) {
              t && ut(t);
            }),
            (i = null));
        }
        function H() {
          z(),
            (i = u.map(r)),
            $('update.tooltips', function (t, e, r) {
              if (i[e]) {
                var n = t[e];
                !0 !== b.tooltips[e] && (n = b.tooltips[e].to(r[e])), (i[e].innerHTML = n);
              }
            });
        }
        function j(e, i, o) {
          var s = w.createElement('div'),
            a = [];
          (a[N] = b.cssClasses.valueNormal),
            (a[k] = b.cssClasses.valueLarge),
            (a[U] = b.cssClasses.valueSub);
          var l = [];
          (l[N] = b.cssClasses.markerNormal),
            (l[k] = b.cssClasses.markerLarge),
            (l[U] = b.cssClasses.markerSub);
          var u = [b.cssClasses.valueHorizontal, b.cssClasses.valueVertical],
            c = [b.cssClasses.markerHorizontal, b.cssClasses.markerVertical];
          function p(t, e) {
            var r = e === b.cssClasses.value,
              n = r ? a : l;
            return e + ' ' + (r ? u : c)[b.ort] + ' ' + n[t];
          }
          return (
            ht(s, b.cssClasses.pips),
            ht(s, 0 === b.ort ? b.cssClasses.pipsHorizontal : b.cssClasses.pipsVertical),
            Object.keys(e).forEach(function (t) {
              !(function (t, e, r) {
                if ((r = i ? i(e, r) : r) !== P) {
                  var n = V(s, !1);
                  (n.className = p(r, b.cssClasses.marker)),
                    (n.style[b.style] = t + '%'),
                    N < r &&
                      (((n = V(s, !1)).className = p(r, b.cssClasses.value)),
                      n.setAttribute('data-value', e),
                      (n.style[b.style] = t + '%'),
                      (n.innerHTML = o.to(e)));
                }
              })(t, e[t][0], e[t][1]);
            }),
            s
          );
        }
        function F() {
          c && (ut(c), (c = null));
        }
        function R(t) {
          F();
          var m,
            g,
            v,
            b,
            e,
            r,
            x,
            S,
            w,
            n = t.mode,
            i = t.density || 1,
            o = t.filter || !1,
            s = (function (t, e, r) {
              if ('range' === t || 'steps' === t) return y.xVal;
              if ('count' === t) {
                if (e < 2)
                  throw new Error(
                    'noUiSlider (' + lt + "): 'values' (>= 2) required for mode 'count'.",
                  );
                var n = e - 1,
                  i = 100 / n;
                for (e = []; n--; ) e[n] = n * i;
                e.push(100), (t = 'positions');
              }
              return 'positions' === t
                ? e.map(function (t) {
                    return y.fromStepping(r ? y.getStep(t) : t);
                  })
                : 'values' === t
                ? r
                  ? e.map(function (t) {
                      return y.fromStepping(y.getStep(y.toStepping(t)));
                    })
                  : e
                : void 0;
            })(n, t.values || !1, t.stepped || !1),
            a =
              ((m = i),
              (g = n),
              (v = s),
              (b = {}),
              (e = y.xVal[0]),
              (r = y.xVal[y.xVal.length - 1]),
              (S = x = !1),
              (w = 0),
              (v = v
                .slice()
                .sort(function (t, e) {
                  return t - e;
                })
                .filter(function (t) {
                  return !this[t] && (this[t] = !0);
                }, {}))[0] !== e && (v.unshift(e), (x = !0)),
              v[v.length - 1] !== r && (v.push(r), (S = !0)),
              v.forEach(function (t, e) {
                var r,
                  n,
                  i,
                  o,
                  s,
                  a,
                  l,
                  u,
                  c,
                  p,
                  f = t,
                  d = v[e + 1],
                  h = 'steps' === g;
                if ((h && (r = y.xNumSteps[e]), r || (r = d - f), !1 !== f))
                  for (
                    void 0 === d && (d = f), r = Math.max(r, 1e-7), n = f;
                    n <= d;
                    n = (n + r).toFixed(7) / 1
                  ) {
                    for (
                      u = (s = (o = y.toStepping(n)) - w) / m,
                        p = s / (c = Math.round(u)),
                        i = 1;
                      i <= c;
                      i += 1
                    )
                      b[(a = w + i * p).toFixed(5)] = [y.fromStepping(a), 0];
                    (l = -1 < v.indexOf(n) ? k : h ? U : N),
                      !e && x && n !== d && (l = 0),
                      (n === d && S) || (b[o.toFixed(5)] = [n, l]),
                      (w = o);
                  }
              }),
              b),
            l = t.format || { to: Math.round };
          return (c = h.appendChild(j(a, o, l)));
        }
        function T() {
          var t = l.getBoundingClientRect(),
            e = 'offset' + ['Width', 'Height'][b.ort];
          return 0 === b.ort ? t.width || l[e] : t.height || l[e];
        }
        function B(n, i, o, s) {
          var e = function (t) {
              return (
                !!(t = (function (t, e, r) {
                  var n,
                    i,
                    o = 0 === t.type.indexOf('touch'),
                    s = 0 === t.type.indexOf('mouse'),
                    a = 0 === t.type.indexOf('pointer');
                  0 === t.type.indexOf('MSPointer') && (a = !0);
                  if (o) {
                    var l = function (t) {
                      return (
                        t.target === r ||
                        r.contains(t.target) ||
                        (t.target.shadowRoot && t.target.shadowRoot.contains(r))
                      );
                    };
                    if ('touchstart' === t.type) {
                      var u = Array.prototype.filter.call(t.touches, l);
                      if (1 < u.length) return !1;
                      (n = u[0].pageX), (i = u[0].pageY);
                    } else {
                      var c = Array.prototype.find.call(t.changedTouches, l);
                      if (!c) return !1;
                      (n = c.pageX), (i = c.pageY);
                    }
                  }
                  (e = e || gt(w)),
                    (s || a) && ((n = t.clientX + e.x), (i = t.clientY + e.y));
                  return (t.pageOffset = e), (t.points = [n, i]), (t.cursor = s || a), t;
                })(t, s.pageOffset, s.target || i)) &&
                !(O() && !s.doNotReject) &&
                ((e = h),
                (r = b.cssClasses.tap),
                !(
                  (e.classList
                    ? e.classList.contains(r)
                    : new RegExp('\\b' + r + '\\b').test(e.className)) && !s.doNotReject
                ) &&
                  !(n === f.start && void 0 !== t.buttons && 1 < t.buttons) &&
                  (!s.hover || !t.buttons) &&
                  (d || t.preventDefault(), (t.calcPoint = t.points[b.ort]), void o(t, s)))
              );
              var e, r;
            },
            r = [];
          return (
            n.split(' ').forEach(function (t) {
              i.addEventListener(t, e, !!d && { passive: !0 }), r.push([t, e]);
            }),
            r
          );
        }
        function q(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            a =
              (100 *
                (t -
                  ((e = l),
                  (r = b.ort),
                  (n = e.getBoundingClientRect()),
                  (i = e.ownerDocument),
                  (o = i.documentElement),
                  (s = gt(i)),
                  /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (s.x = 0),
                  r ? n.top + s.y - o.clientTop : n.left + s.x - o.clientLeft))) /
              T();
          return (a = ft(a)), b.dir ? 100 - a : a;
        }
        function X(t, e) {
          'mouseout' === t.type &&
            'HTML' === t.target.nodeName &&
            null === t.relatedTarget &&
            _(t, e);
        }
        function Y(t, e) {
          if (
            -1 === navigator.appVersion.indexOf('MSIE 9') &&
            0 === t.buttons &&
            0 !== e.buttonsProperty
          )
            return _(t, e);
          var r = (b.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
          Z(0 < r, (100 * r) / e.baseSize, e.locations, e.handleNumbers);
        }
        function _(t, e) {
          e.handle && (mt(e.handle, b.cssClasses.active), (g -= 1)),
            e.listeners.forEach(function (t) {
              E.removeEventListener(t[0], t[1]);
            }),
            0 === g &&
              (mt(h, b.cssClasses.drag),
              et(),
              t.cursor && ((C.style.cursor = ''), C.removeEventListener('selectstart', ct))),
            e.handleNumbers.forEach(function (t) {
              J('change', t), J('set', t), J('end', t);
            });
        }
        function I(t, e) {
          if (e.handleNumbers.some(L)) return !1;
          var r;
          1 === e.handleNumbers.length &&
            ((r = u[e.handleNumbers[0]].children[0]), (g += 1), ht(r, b.cssClasses.active));
          t.stopPropagation();
          var n = [],
            i = B(f.move, E, Y, {
              target: t.target,
              handle: r,
              listeners: n,
              startCalcPoint: t.calcPoint,
              baseSize: T(),
              pageOffset: t.pageOffset,
              handleNumbers: e.handleNumbers,
              buttonsProperty: t.buttons,
              locations: S.slice(),
            }),
            o = B(f.end, E, _, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            }),
            s = B('mouseout', E, X, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            });
          n.push.apply(n, i.concat(o, s)),
            t.cursor &&
              ((C.style.cursor = getComputedStyle(t.target).cursor),
              1 < u.length && ht(h, b.cssClasses.drag),
              C.addEventListener('selectstart', ct, !1)),
            e.handleNumbers.forEach(function (t) {
              J('start', t);
            });
        }
        function n(t) {
          if (!t.buttons && !t.touches) return !1;
          t.stopPropagation();
          var i,
            o,
            s,
            e = q(t.calcPoint),
            r =
              ((i = e),
              (s = !(o = 100)),
              u.forEach(function (t, e) {
                if (!L(e)) {
                  var r = S[e],
                    n = Math.abs(r - i);
                  (n < o || (n <= o && r < i) || (100 === n && 100 === o)) &&
                    ((s = e), (o = n));
                }
              }),
              s);
          if (!1 === r) return !1;
          b.events.snap || pt(h, b.cssClasses.tap, b.animationDuration),
            rt(r, e, !0, !0),
            et(),
            J('slide', r, !0),
            J('update', r, !0),
            J('change', r, !0),
            J('set', r, !0),
            b.events.snap && I(t, { handleNumbers: [r] });
        }
        function W(t) {
          var e = q(t.calcPoint),
            r = y.getStep(e),
            n = y.fromStepping(r);
          Object.keys(v).forEach(function (t) {
            'hover' === t.split('.')[0] &&
              v[t].forEach(function (t) {
                t.call(a, n);
              });
          });
        }
        function $(t, e) {
          (v[t] = v[t] || []),
            v[t].push(e),
            'update' === t.split('.')[0] &&
              u.forEach(function (t, e) {
                J('update', e);
              });
        }
        function G(t) {
          var n = t && t.split('.')[0],
            i = n && t.substring(n.length);
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0],
              r = t.substring(e.length);
            (n && n !== e) || (i && i !== r) || delete v[t];
          });
        }
        function J(r, n, i) {
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0];
            r === e &&
              v[t].forEach(function (t) {
                t.call(a, x.map(b.format.to), n, x.slice(), i || !1, S.slice(), a);
              });
          });
        }
        function K(t, e, r, n, i, o) {
          var s;
          return (
            1 < u.length &&
              !b.events.unconstrained &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.margin, 0)), (r = Math.max(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.margin, 1)), (r = Math.min(r, s)))),
            1 < u.length &&
              b.limit &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.limit, 0)), (r = Math.min(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.limit, 1)), (r = Math.max(r, s)))),
            b.padding &&
              (0 === e &&
                ((s = y.getAbsoluteDistance(0, b.padding[0], 0)), (r = Math.max(r, s))),
              e === u.length - 1 &&
                ((s = y.getAbsoluteDistance(100, b.padding[1], 1)), (r = Math.min(r, s)))),
            !((r = ft((r = y.getStep(r)))) === t[e] && !o) && r
          );
        }
        function Q(t, e) {
          var r = b.ort;
          return (r ? e : t) + ', ' + (r ? t : e);
        }
        function Z(t, n, r, e) {
          var i = r.slice(),
            o = [!t, t],
            s = [t, !t];
          (e = e.slice()),
            t && e.reverse(),
            1 < e.length
              ? e.forEach(function (t, e) {
                  var r = K(i, t, i[t] + n, o[e], s[e], !1);
                  !1 === r ? (n = 0) : ((n = r - i[t]), (i[t] = r));
                })
              : (o = s = [!0]);
          var a = !1;
          e.forEach(function (t, e) {
            a = rt(t, r[t] + n, o[e], s[e]) || a;
          }),
            a &&
              e.forEach(function (t) {
                J('update', t), J('slide', t);
              });
        }
        function tt(t, e) {
          return b.dir ? 100 - t - e : t;
        }
        function et() {
          m.forEach(function (t) {
            var e = 50 < S[t] ? -1 : 1,
              r = 3 + (u.length + e * t);
            u[t].style.zIndex = r;
          });
        }
        function rt(t, e, r, n) {
          return (
            !1 !== (e = K(S, t, e, r, n, !1)) &&
            ((function (t, e) {
              (S[t] = e), (x[t] = y.fromStepping(e));
              var r = 'translate(' + Q(10 * (tt(e, 0) - A) + '%', '0') + ')';
              (u[t].style[b.transformRule] = r), nt(t), nt(t + 1);
            })(t, e),
            !0)
          );
        }
        function nt(t) {
          if (s[t]) {
            var e = 0,
              r = 100;
            0 !== t && (e = S[t - 1]), t !== s.length - 1 && (r = S[t]);
            var n = r - e,
              i = 'translate(' + Q(tt(e, n) + '%', '0') + ')',
              o = 'scale(' + Q(n / 100, '1') + ')';
            s[t].style[b.transformRule] = i + ' ' + o;
          }
        }
        function it(t, e) {
          return null === t || !1 === t || void 0 === t
            ? S[e]
            : ('number' == typeof t && (t = String(t)),
              (t = b.format.from(t)),
              !1 === (t = y.toStepping(t)) || isNaN(t) ? S[e] : t);
        }
        function ot(t, e) {
          var r = dt(t),
            n = void 0 === S[0];
          (e = void 0 === e || !!e),
            b.animate && !n && pt(h, b.cssClasses.tap, b.animationDuration),
            m.forEach(function (t) {
              rt(t, it(r[t], t), !0, !1);
            });
          for (var i = 1 === m.length ? 0 : 1; i < m.length; ++i)
            m.forEach(function (t) {
              rt(t, S[t], !0, !0);
            });
          et(),
            m.forEach(function (t) {
              J('update', t), null !== r[t] && e && J('set', t);
            });
        }
        function st() {
          var t = x.map(b.format.to);
          return 1 === t.length ? t[0] : t;
        }
        function at(t) {
          var e = S[t],
            r = y.getNearbySteps(e),
            n = x[t],
            i = r.thisStep.step,
            o = null;
          if (b.snap)
            return [n - r.stepBefore.startValue || null, r.stepAfter.startValue - n || null];
          !1 !== i && n + i > r.stepAfter.startValue && (i = r.stepAfter.startValue - n),
            (o =
              n > r.thisStep.startValue
                ? r.thisStep.step
                : !1 !== r.stepBefore.step && n - r.stepBefore.highestStep),
            100 === e ? (i = null) : 0 === e && (o = null);
          var s = y.countStepDecimals();
          return (
            null !== i && !1 !== i && (i = Number(i.toFixed(s))),
            null !== o && !1 !== o && (o = Number(o.toFixed(s))),
            [o, i]
          );
        }
        return (
          ht((e = h), b.cssClasses.target),
          0 === b.dir ? ht(e, b.cssClasses.ltr) : ht(e, b.cssClasses.rtl),
          0 === b.ort ? ht(e, b.cssClasses.horizontal) : ht(e, b.cssClasses.vertical),
          ht(
            e,
            'rtl' === getComputedStyle(e).direction
              ? b.cssClasses.textDirectionRtl
              : b.cssClasses.textDirectionLtr,
          ),
          (l = V(e, b.cssClasses.base)),
          (function (t, e) {
            var r = V(e, b.cssClasses.connects);
            (u = []), (s = []).push(M(r, t[0]));
            for (var n = 0; n < b.handles; n++)
              u.push(D(e, n)), (m[n] = n), s.push(M(r, t[n + 1]));
          })(b.connect, l),
          (p = b.events).fixed ||
            u.forEach(function (t, e) {
              B(f.start, t.children[0], I, { handleNumbers: [e] });
            }),
          p.tap && B(f.start, l, n, {}),
          p.hover && B(f.move, l, W, { hover: !0 }),
          p.drag &&
            s.forEach(function (t, e) {
              if (!1 !== t && 0 !== e && e !== s.length - 1) {
                var r = u[e - 1],
                  n = u[e],
                  i = [t];
                ht(t, b.cssClasses.draggable),
                  p.fixed && (i.push(r.children[0]), i.push(n.children[0])),
                  i.forEach(function (t) {
                    B(f.start, t, I, { handles: [r, n], handleNumbers: [e - 1, e] });
                  });
              }
            }),
          ot(b.start),
          b.pips && R(b.pips),
          b.tooltips && H(),
          $('update', function (t, e, s, r, a) {
            m.forEach(function (t) {
              var e = u[t],
                r = K(S, t, 0, !0, !0, !0),
                n = K(S, t, 100, !0, !0, !0),
                i = a[t],
                o = b.ariaFormat.to(s[t]);
              (r = y.fromStepping(r).toFixed(1)),
                (n = y.fromStepping(n).toFixed(1)),
                (i = y.fromStepping(i).toFixed(1)),
                e.children[0].setAttribute('aria-valuemin', r),
                e.children[0].setAttribute('aria-valuemax', n),
                e.children[0].setAttribute('aria-valuenow', i),
                e.children[0].setAttribute('aria-valuetext', o);
            });
          }),
          (a = {
            destroy: function () {
              for (var t in b.cssClasses)
                b.cssClasses.hasOwnProperty(t) && mt(h, b.cssClasses[t]);
              for (; h.firstChild; ) h.removeChild(h.firstChild);
              delete h.noUiSlider;
            },
            steps: function () {
              return m.map(at);
            },
            on: $,
            off: G,
            get: st,
            set: ot,
            setHandle: function (t, e, r) {
              if (!(0 <= (t = Number(t)) && t < m.length))
                throw new Error('noUiSlider (' + lt + '): invalid handle number, got: ' + t);
              rt(t, it(e, t), !0, !0), J('update', t), r && J('set', t);
            },
            reset: function (t) {
              ot(b.start, t);
            },
            __moveHandles: function (t, e, r) {
              Z(t, e, S, r);
            },
            options: o,
            updateOptions: function (e, t) {
              var r = st(),
                n = [
                  'margin',
                  'limit',
                  'padding',
                  'range',
                  'animate',
                  'snap',
                  'step',
                  'format',
                  'pips',
                  'tooltips',
                ];
              n.forEach(function (t) {
                void 0 !== e[t] && (o[t] = e[t]);
              });
              var i = vt(o);
              n.forEach(function (t) {
                void 0 !== e[t] && (b[t] = i[t]);
              }),
                (y = i.spectrum),
                (b.margin = i.margin),
                (b.limit = i.limit),
                (b.padding = i.padding),
                b.pips ? R(b.pips) : F(),
                b.tooltips ? H() : z(),
                (S = []),
                ot(e.start || r, t);
            },
            target: h,
            removePips: F,
            removeTooltips: z,
            getTooltips: function () {
              return i;
            },
            getOrigins: function () {
              return u;
            },
            pips: R,
          })
        );
      }
      return {
        __spectrum: i,
        version: lt,
        cssClasses: d,
        create: function (t, e) {
          if (!t || !t.nodeName)
            throw new Error(
              'noUiSlider (' + lt + '): create requires a single element, got: ' + t,
            );
          if (t.noUiSlider)
            throw new Error('noUiSlider (' + lt + '): Slider was already initialized.');
          var r = j(t, vt(e), e);
          return (t.noUiSlider = r);
        },
      };
    });
    });

    /* node_modules/svelte-materialify/dist/components/Slider/Slider.svelte generated by Svelte v3.32.1 */
    const file$5 = "node_modules/svelte-materialify/dist/components/Slider/Slider.svelte";
    const get_append_outer_slot_changes$1 = dirty => ({});
    const get_append_outer_slot_context$1 = ctx => ({ slot: "append-outer" });
    const get_prepend_outer_slot_changes$1 = dirty => ({});
    const get_prepend_outer_slot_context$1 = ctx => ({ slot: "prepend-outer" });

    // (325:2) <slot slot="prepend-outer" name="prepend-outer" />   <label class="s-slider__label" class:inverse-label={inverseLabel}
    function create_prepend_outer_slot(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[20]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[22], get_prepend_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_prepend_outer_slot_changes$1, get_prepend_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot.name,
    		type: "slot",
    		source: "(325:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <label class=\\\"s-slider__label\\\" class:inverse-label={inverseLabel}",
    		ctx
    	});

    	return block;
    }

    // (334:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[20]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[22], get_append_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_append_outer_slot_changes$1, get_append_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot.name,
    		type: "slot",
    		source: "(334:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (323:0) <Input class="s-slider" {color} {readonly} {disabled} {hint}>
    function create_default_slot(ctx) {
    	let t0;
    	let label;
    	let t1;
    	let div;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	const block = {
    		c: function create() {
    			t0 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			attr_dev(label, "class", "s-slider__label");
    			toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			add_location(label, file$5, 325, 2, 7227);
    			attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			attr_dev(div, "style", /*style*/ ctx[6]);
    			toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			add_location(div, file$5, 326, 2, 7312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[21](div);
    			insert_dev(target, t2, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (dirty & /*inverseLabel*/ 4) {
    				toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 64) {
    				attr_dev(div, "style", /*style*/ ctx[6]);
    			}

    			if (dirty & /*persistentThumb*/ 2) {
    				toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[21](null);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(323:0) <Input class=\\\"s-slider\\\" {color} {readonly} {disabled} {hint}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-slider",
    				color: /*color*/ ctx[0],
    				readonly: /*readonly*/ ctx[3],
    				disabled: /*disabled*/ ctx[4],
    				hint: /*hint*/ ctx[5],
    				$$slots: {
    					default: [create_default_slot],
    					"append-outer": [create_append_outer_slot],
    					"prepend-outer": [create_prepend_outer_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*color*/ 1) input_changes.color = /*color*/ ctx[0];
    			if (dirty & /*readonly*/ 8) input_changes.readonly = /*readonly*/ ctx[3];
    			if (dirty & /*disabled*/ 16) input_changes.disabled = /*disabled*/ ctx[4];
    			if (dirty & /*hint*/ 32) input_changes.hint = /*hint*/ ctx[5];

    			if (dirty & /*$$scope, disabled, style, sliderElement, persistentThumb, inverseLabel*/ 4194518) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format$2(val) {
    	if (Array.isArray(val)) {
    		if (val.length === 1) return Number(val[0]);
    		return val.map(v => Number(v));
    	}

    	return Number(val);
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, ['prepend-outer','default','append-outer']);
    	let sliderElement;
    	let slider;
    	let localValue;
    	const dispatch = createEventDispatcher();
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { value = (min + max) / 2 } = $$props;
    	let { connect = Array.isArray(value) ? true : "lower" } = $$props;
    	let { color = "primary" } = $$props;
    	let { step = null } = $$props;
    	let { margin = null } = $$props;
    	let { limit = null } = $$props;
    	let { padding = null } = $$props;
    	let { thumb = false } = $$props;
    	let { persistentThumb = false } = $$props;
    	let { thumbClass = "primary-color" } = $$props;
    	let { vertical = false } = $$props;
    	let { inverseLabel = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = null } = $$props;
    	let { hint = "" } = $$props;
    	let { style = null } = $$props;

    	function tooltip() {
    		if (Array.isArray(thumb)) {
    			return thumb.map(x => {
    				if (typeof x === "function") return { to: x };
    				return x;
    			});
    		}

    		if (typeof thumb === "function") {
    			return { to: thumb };
    		}

    		return thumb;
    	}

    	onMount(() => {
    		nouislider_min.cssClasses.tooltip = `tooltip ${thumbClass}`;

    		nouislider_min.create(sliderElement, {
    			cssPrefix: "s-slider__",
    			format: {
    				to: v => Math.round(v),
    				from: v => Number(v)
    			},
    			start: value,
    			connect,
    			margin,
    			limit,
    			padding,
    			range: { min, max },
    			orientation: vertical ? "vertical" : "horizontal",
    			step,
    			tooltips: tooltip()
    		});

    		$$invalidate(19, slider = sliderElement.noUiSlider);

    		slider.on("update", (val, handle) => {
    			$$invalidate(8, value = format$2(val));
    			localValue = value;
    			dispatch("update", { value: val, handle });
    		});

    		slider.on("change", (val, handle) => {
    			dispatch("change", { value: val, handle });
    		});

    		return () => {
    			slider.destroy();
    		};
    	});

    	afterUpdate(() => {
    		if (value !== localValue) slider.set(value, false);
    	});

    	const writable_props = [
    		"min",
    		"max",
    		"value",
    		"connect",
    		"color",
    		"step",
    		"margin",
    		"limit",
    		"padding",
    		"thumb",
    		"persistentThumb",
    		"thumbClass",
    		"vertical",
    		"inverseLabel",
    		"readonly",
    		"disabled",
    		"hint",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(7, sliderElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("min" in $$props) $$invalidate(9, min = $$props.min);
    		if ("max" in $$props) $$invalidate(10, max = $$props.max);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(11, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(12, step = $$props.step);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("hint" in $$props) $$invalidate(5, hint = $$props.hint);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		noUiSlider: nouislider_min,
    		Input,
    		onMount,
    		afterUpdate,
    		createEventDispatcher,
    		sliderElement,
    		slider,
    		localValue,
    		dispatch,
    		min,
    		max,
    		value,
    		connect,
    		color,
    		step,
    		margin,
    		limit,
    		padding,
    		thumb,
    		persistentThumb,
    		thumbClass,
    		vertical,
    		inverseLabel,
    		readonly,
    		disabled,
    		hint,
    		style,
    		format: format$2,
    		tooltip
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(7, sliderElement = $$props.sliderElement);
    		if ("slider" in $$props) $$invalidate(19, slider = $$props.slider);
    		if ("localValue" in $$props) localValue = $$props.localValue;
    		if ("min" in $$props) $$invalidate(9, min = $$props.min);
    		if ("max" in $$props) $$invalidate(10, max = $$props.max);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(11, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(12, step = $$props.step);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("hint" in $$props) $$invalidate(5, hint = $$props.hint);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slider, min, max, vertical, connect, margin, limit, padding*/ 847360) {
    			 {
    				if (slider != null) {
    					slider.updateOptions({
    						range: { min, max },
    						orientation: vertical ? "vertical" : "horizontal",
    						connect,
    						margin,
    						limit,
    						padding
    					});
    				}
    			}
    		}
    	};

    	return [
    		color,
    		persistentThumb,
    		inverseLabel,
    		readonly,
    		disabled,
    		hint,
    		style,
    		sliderElement,
    		value,
    		min,
    		max,
    		connect,
    		step,
    		margin,
    		limit,
    		padding,
    		thumb,
    		thumbClass,
    		vertical,
    		slider,
    		slots,
    		div_binding,
    		$$scope
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			min: 9,
    			max: 10,
    			value: 8,
    			connect: 11,
    			color: 0,
    			step: 12,
    			margin: 13,
    			limit: 14,
    			padding: 15,
    			thumb: 16,
    			persistentThumb: 1,
    			thumbClass: 17,
    			vertical: 18,
    			inverseLabel: 2,
    			readonly: 3,
    			disabled: 4,
    			hint: 5,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connect() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connect(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limit() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limit(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentThumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentThumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbClass() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbClass(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverseLabel() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverseLabel(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    var down = 'M7,10L12,15L17,10H7Z';

    /* node_modules/svelte-materialify/dist/components/Switch/Switch.svelte generated by Svelte v3.32.1 */
    const file$6 = "node_modules/svelte-materialify/dist/components/Switch/Switch.svelte";

    function create_fragment$a(ctx) {
    	let div3;
    	let div2;
    	let input;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let TextColor_action;
    	let t2;
    	let label;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "switch");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			input.disabled = /*disabled*/ ctx[7];
    			input.__value = /*value*/ ctx[4];
    			input.value = input.__value;
    			add_location(input, file$6, 205, 4, 4423);
    			attr_dev(div0, "class", "s-switch__track");
    			add_location(div0, file$6, 215, 4, 4615);
    			attr_dev(div1, "class", "s-switch__thumb");
    			add_location(div1, file$6, 216, 4, 4651);
    			attr_dev(div2, "class", "s-switch__wrapper");
    			toggle_class(div2, "dense", /*dense*/ ctx[6]);
    			toggle_class(div2, "inset", /*inset*/ ctx[5]);
    			toggle_class(div2, "disabled", /*disabled*/ ctx[7]);
    			add_location(div2, file$6, 199, 2, 4295);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			add_location(label, file$6, 218, 2, 4694);
    			attr_dev(div3, "class", div3_class_value = "s-switch " + /*klass*/ ctx[2]);
    			attr_dev(div3, "style", /*style*/ ctx[8]);
    			add_location(div3, file$6, 198, 0, 4254);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div3, t2);
    			append_dev(div3, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[14]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[13], false, false, false),
    					action_destroyer(TextColor_action = TextColor.call(null, div2, /*checked*/ ctx[0] && /*color*/ ctx[3]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 128) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (!current || dirty & /*value*/ 16) {
    				prop_dev(input, "__value", /*value*/ ctx[4]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, color*/ 9) TextColor_action.update.call(null, /*checked*/ ctx[0] && /*color*/ ctx[3]);

    			if (dirty & /*dense*/ 64) {
    				toggle_class(div2, "dense", /*dense*/ ctx[6]);
    			}

    			if (dirty & /*inset*/ 32) {
    				toggle_class(div2, "inset", /*inset*/ ctx[5]);
    			}

    			if (dirty & /*disabled*/ 128) {
    				toggle_class(div2, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(label, "for", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 4 && div3_class_value !== (div3_class_value = "s-switch " + /*klass*/ ctx[2])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 256) {
    				attr_dev(div3, "style", /*style*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { value = null } = $$props;
    	let { group = [] } = $$props;
    	let { checked = false } = $$props;
    	let { inset = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = false } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	id = id || `s-switch-${uid(5)}`;
    	const hasValidGroup = Array.isArray(group);

    	if (hasValidGroup && value) {
    		if (group.indexOf(value) >= 0) checked = true;
    	}

    	function groupUpdate() {
    		if (hasValidGroup && value) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(10, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"value",
    		"group",
    		"checked",
    		"inset",
    		"dense",
    		"disabled",
    		"id",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(5, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(6, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		TextColor,
    		klass,
    		color,
    		value,
    		group,
    		checked,
    		inset,
    		dense,
    		disabled,
    		id,
    		style,
    		hasValidGroup,
    		groupUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(5, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(6, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		checked,
    		id,
    		klass,
    		color,
    		value,
    		inset,
    		dense,
    		disabled,
    		style,
    		groupUpdate,
    		group,
    		$$scope,
    		slots,
    		change_handler,
    		input_change_handler
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 2,
    			color: 3,
    			value: 4,
    			group: 10,
    			checked: 0,
    			inset: 5,
    			dense: 6,
    			disabled: 7,
    			id: 1,
    			style: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    /**
     * @param {string} klass
     */
    function formatClass$1(klass) {
      return klass.split(' ').map((i) => {
        if (themeColors.includes(i)) return `${i}-color`;
        return i;
      });
    }

    function setBackgroundColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.backgroundColor = text;
        return false;
      }

      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.backgroundColor = `var(${text})`;
        return false;
      }

      const klass = formatClass$1(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var BackgroundColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setBackgroundColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.backgroundColor = null;
          }

          if (typeof newText === 'string') {
            klass = setBackgroundColor(node, newText);
          }
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Overlay/Overlay.svelte generated by Svelte v3.32.1 */
    const file$7 = "node_modules/svelte-materialify/dist/components/Overlay/Overlay.svelte";

    // (52:0) {#if active}
    function create_if_block$1(ctx) {
    	let div2;
    	let div0;
    	let BackgroundColor_action;
    	let t;
    	let div1;
    	let div2_class_value;
    	let div2_style_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "s-overlay__scrim svelte-x5kbih");
    			set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			add_location(div0, file$7, 59, 4, 1182);
    			attr_dev(div1, "class", "s-overlay__content svelte-x5kbih");
    			add_location(div1, file$7, 60, 4, 1273);
    			attr_dev(div2, "class", div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-x5kbih");
    			attr_dev(div2, "style", div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9]);
    			toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			add_location(div2, file$7, 52, 2, 1018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*color*/ ctx[6])),
    					listen_dev(div2, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 32) {
    				set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 64) BackgroundColor_action.update.call(null, /*color*/ ctx[6]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-x5kbih")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*index, style*/ 640 && div2_style_value !== (div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, absolute*/ 257) {
    				toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, /*transition*/ ctx[1], /*inOpts*/ ctx[2]);
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, /*transition*/ ctx[1], /*outOpts*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(52:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Overlay", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 250 } } = $$props;
    	let { active = true } = $$props;
    	let { opacity = 0.46 } = $$props;
    	let { color = "rgb(33, 33, 33)" } = $$props;
    	let { index = 5 } = $$props;
    	let { absolute = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"active",
    		"opacity",
    		"color",
    		"index",
    		"absolute",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		BackgroundColor,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 0,
    			transition: 1,
    			inOpts: 2,
    			outOpts: 3,
    			active: 4,
    			opacity: 5,
    			color: 6,
    			index: 7,
    			absolute: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Dialog/Dialog.svelte generated by Svelte v3.32.1 */
    const file$8 = "node_modules/svelte-materialify/dist/components/Dialog/Dialog.svelte";

    // (91:0) {#if visible}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div0_transition;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "s-dialog__content " + /*klass*/ ctx[0]);
    			toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			add_location(div0, file$8, 92, 4, 2126);
    			attr_dev(div1, "role", "document");
    			attr_dev(div1, "class", "s-dialog");
    			add_location(div1, file$8, 91, 2, 2045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, div1, { "dialog-width": /*width*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div0_class_value !== (div0_class_value = "s-dialog__content " + /*klass*/ ctx[0])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fullscreen*/ 5) {
    				toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*width*/ 2) Style_action.update.call(null, { "dialog-width": /*width*/ ctx[1] });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, true);
    				div0_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, false);
    			div0_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(91:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t;
    	let overlay_1;
    	let current;
    	let if_block = /*visible*/ ctx[5] && create_if_block$2(ctx);
    	const overlay_1_spread_levels = [/*overlay*/ ctx[4], { active: /*visible*/ ctx[5] }];
    	let overlay_1_props = {};

    	for (let i = 0; i < overlay_1_spread_levels.length; i += 1) {
    		overlay_1_props = assign(overlay_1_props, overlay_1_spread_levels[i]);
    	}

    	overlay_1 = new Overlay({ props: overlay_1_props, $$inline: true });
    	overlay_1.$on("click", /*close*/ ctx[6]);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(overlay_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(overlay_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const overlay_1_changes = (dirty & /*overlay, visible*/ 48)
    			? get_spread_update(overlay_1_spread_levels, [
    					dirty & /*overlay*/ 16 && get_spread_object(/*overlay*/ ctx[4]),
    					dirty & /*visible*/ 32 && { active: /*visible*/ ctx[5] }
    				])
    			: {};

    			overlay_1.$set(overlay_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(overlay_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(overlay_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(overlay_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let visible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dialog", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { persistent = false } = $$props;
    	let { disabled = false } = $$props;
    	let { width = 500 } = $$props;
    	let { fullscreen = false } = $$props;
    	let { transition = scale } = $$props;
    	let { overlay = {} } = $$props;

    	function close() {
    		if (!persistent) $$invalidate(7, active = false);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"persistent",
    		"disabled",
    		"width",
    		"fullscreen",
    		"transition",
    		"overlay"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Overlay,
    		Style,
    		scale,
    		klass,
    		active,
    		persistent,
    		disabled,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		close,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active, disabled*/ 640) {
    			 $$invalidate(5, visible = active && !disabled);
    		}
    	};

    	return [
    		klass,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		visible,
    		close,
    		active,
    		persistent,
    		disabled,
    		$$scope,
    		slots
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 0,
    			active: 7,
    			persistent: 8,
    			disabled: 9,
    			width: 1,
    			fullscreen: 2,
    			transition: 3,
    			overlay: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overlay() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overlay(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/ExpansionPanels/ExpansionPanels.svelte generated by Svelte v3.32.1 */
    const file$9 = "node_modules/svelte-materialify/dist/components/ExpansionPanels/ExpansionPanels.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-expansion-panels " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[6]);
    			toggle_class(div, "accordion", /*accordion*/ ctx[1]);
    			toggle_class(div, "popout", /*popout*/ ctx[2]);
    			toggle_class(div, "inset", /*inset*/ ctx[3]);
    			toggle_class(div, "flat", /*flat*/ ctx[4]);
    			toggle_class(div, "tile", /*tile*/ ctx[5]);
    			add_location(div, file$9, 148, 0, 3668);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-expansion-panels " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 64) {
    				attr_dev(div, "style", /*style*/ ctx[6]);
    			}

    			if (dirty & /*klass, accordion*/ 3) {
    				toggle_class(div, "accordion", /*accordion*/ ctx[1]);
    			}

    			if (dirty & /*klass, popout*/ 5) {
    				toggle_class(div, "popout", /*popout*/ ctx[2]);
    			}

    			if (dirty & /*klass, inset*/ 9) {
    				toggle_class(div, "inset", /*inset*/ ctx[3]);
    			}

    			if (dirty & /*klass, flat*/ 17) {
    				toggle_class(div, "flat", /*flat*/ ctx[4]);
    			}

    			if (dirty & /*klass, tile*/ 33) {
    				toggle_class(div, "tile", /*tile*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const EXPANSION_PANELS = {};

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExpansionPanels", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { accordion = false } = $$props;
    	let { popout = false } = $$props;
    	let { inset = false } = $$props;
    	let { flat = false } = $$props;
    	let { tile = false } = $$props;
    	let { disabled = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const values = writable(value);
    	const Disabled = writable(disabled);
    	let startIndex = -1;

    	setContext(EXPANSION_PANELS, {
    		values,
    		Disabled,
    		selectPanel: index => {
    			if (value.includes(index)) {
    				if (!(mandatory && value.length === 1)) {
    					value.splice(value.indexOf(index), 1);
    					$$invalidate(7, value);
    					dispatch("change", { index, active: false });
    				}
    			} else {
    				if (multiple) {
    					value.push(index);
    					$$invalidate(7, value);
    				} else {
    					$$invalidate(7, value = [index]);
    				}

    				dispatch("change", { index, active: true });
    			}
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		}
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"multiple",
    		"mandatory",
    		"accordion",
    		"popout",
    		"inset",
    		"flat",
    		"tile",
    		"disabled",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpansionPanels> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(9, mandatory = $$props.mandatory);
    		if ("accordion" in $$props) $$invalidate(1, accordion = $$props.accordion);
    		if ("popout" in $$props) $$invalidate(2, popout = $$props.popout);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("flat" in $$props) $$invalidate(4, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		EXPANSION_PANELS,
    		createEventDispatcher,
    		setContext,
    		writable,
    		klass,
    		value,
    		multiple,
    		mandatory,
    		accordion,
    		popout,
    		inset,
    		flat,
    		tile,
    		disabled,
    		style,
    		dispatch,
    		values,
    		Disabled,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(9, mandatory = $$props.mandatory);
    		if ("accordion" in $$props) $$invalidate(1, accordion = $$props.accordion);
    		if ("popout" in $$props) $$invalidate(2, popout = $$props.popout);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("flat" in $$props) $$invalidate(4, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 128) {
    			 values.set(value);
    		}

    		if ($$self.$$.dirty & /*disabled*/ 1024) {
    			 Disabled.set(disabled);
    		}
    	};

    	return [
    		klass,
    		accordion,
    		popout,
    		inset,
    		flat,
    		tile,
    		style,
    		value,
    		multiple,
    		mandatory,
    		disabled,
    		$$scope,
    		slots
    	];
    }

    class ExpansionPanels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 0,
    			value: 7,
    			multiple: 8,
    			mandatory: 9,
    			accordion: 1,
    			popout: 2,
    			inset: 3,
    			flat: 4,
    			tile: 5,
    			disabled: 10,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpansionPanels",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accordion() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accordion(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get popout() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set popout(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ExpansionPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ExpansionPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/ExpansionPanels/ExpansionPanel.svelte generated by Svelte v3.32.1 */
    const file$a = "node_modules/svelte-materialify/dist/components/ExpansionPanels/ExpansionPanel.svelte";
    const get_icon_slot_changes = dirty => ({ active: dirty & /*active*/ 32 });
    const get_icon_slot_context = ctx => ({ active: /*active*/ ctx[5] });
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (162:33)          
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				disabled: /*disabled*/ ctx[0],
    				path: down,
    				rotate: /*active*/ ctx[5] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*disabled*/ 1) icon_changes.disabled = /*disabled*/ ctx[0];
    			if (dirty & /*active*/ 32) icon_changes.rotate = /*active*/ ctx[5] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(162:33)          ",
    		ctx
    	});

    	return block;
    }

    // (167:2) {#if active}
    function create_if_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "s-expansion-panel__content");
    			add_location(div, file$a, 167, 4, 4176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, /*slideOpts*/ ctx[2], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, /*slideOpts*/ ctx[2], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(167:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let button;
    	let t0;
    	let div0;
    	let button_tabindex_value;
    	let t1;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*#slots*/ ctx[12].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[11], get_header_slot_context);
    	const icon_slot_template = /*#slots*/ ctx[12].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[11], get_icon_slot_context);
    	const icon_slot_or_fallback = icon_slot || fallback_block(ctx);
    	let if_block = /*active*/ ctx[5] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button = element("button");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (icon_slot_or_fallback) icon_slot_or_fallback.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "s-expansion-panel__icon");
    			add_location(div0, file$a, 159, 4, 3921);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "s-expansion-panel__header");
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[0] ? -1 : null);
    			add_location(button, file$a, 152, 2, 3725);
    			attr_dev(div1, "class", div1_class_value = "s-expansion-panel " + /*klass*/ ctx[1]);
    			attr_dev(div1, "aria-expanded", /*active*/ ctx[5]);
    			attr_dev(div1, "style", /*style*/ ctx[4]);
    			toggle_class(div1, "active", /*active*/ ctx[5]);
    			toggle_class(div1, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			add_location(div1, file$a, 145, 0, 3597);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);

    			if (header_slot) {
    				header_slot.m(button, null);
    			}

    			append_dev(button, t0);
    			append_dev(button, div0);

    			if (icon_slot_or_fallback) {
    				icon_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope, active*/ 2080) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			} else {
    				if (icon_slot_or_fallback && icon_slot_or_fallback.p && dirty & /*disabled, active*/ 33) {
    					icon_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*disabled*/ 1 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[0] ? -1 : null)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (/*active*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass*/ 2 && div1_class_value !== (div1_class_value = "s-expansion-panel " + /*klass*/ ctx[1])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*active*/ 32) {
    				attr_dev(div1, "aria-expanded", /*active*/ ctx[5]);
    			}

    			if (!current || dirty & /*style*/ 16) {
    				attr_dev(div1, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*klass, active*/ 34) {
    				toggle_class(div1, "active", /*active*/ ctx[5]);
    			}

    			if (dirty & /*klass, readonly*/ 10) {
    				toggle_class(div1, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 3) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(icon_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(icon_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);
    			if (icon_slot_or_fallback) icon_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $Disabled;
    	let $values;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExpansionPanel", slots, ['header','icon','default']);
    	const { values, Disabled, selectPanel, index } = getContext(EXPANSION_PANELS);
    	validate_store(values, "values");
    	component_subscribe($$self, values, value => $$invalidate(10, $values = value));
    	validate_store(Disabled, "Disabled");
    	component_subscribe($$self, Disabled, value => $$invalidate(9, $Disabled = value));

    	// Classes to add to the panel.
    	let { class: klass = "" } = $$props;

    	let { slideOpts = {} } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { style = null } = $$props;
    	const value = index();
    	let active = false;

    	function toggle() {
    		selectPanel(value);
    	}

    	const writable_props = ["class", "slideOpts", "readonly", "disabled", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpansionPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("slideOpts" in $$props) $$invalidate(2, slideOpts = $$props.slideOpts);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		EXPANSION_PANELS,
    		slide,
    		Icon,
    		down,
    		values,
    		Disabled,
    		selectPanel,
    		index,
    		klass,
    		slideOpts,
    		readonly,
    		disabled,
    		style,
    		value,
    		active,
    		toggle,
    		$Disabled,
    		$values
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("slideOpts" in $$props) $$invalidate(2, slideOpts = $$props.slideOpts);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("active" in $$props) $$invalidate(5, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$Disabled, disabled*/ 513) {
    			// Inheriting the disabled value from parent.
    			 $$invalidate(0, disabled = $Disabled == null ? disabled : $Disabled);
    		}

    		if ($$self.$$.dirty & /*$values*/ 1024) {
    			// Checking if panel is active everytime the value has changed.
    			 $$invalidate(5, active = $values.includes(value));
    		}
    	};

    	return [
    		disabled,
    		klass,
    		slideOpts,
    		readonly,
    		style,
    		active,
    		values,
    		Disabled,
    		toggle,
    		$Disabled,
    		$values,
    		$$scope,
    		slots
    	];
    }

    class ExpansionPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 1,
    			slideOpts: 2,
    			readonly: 3,
    			disabled: 0,
    			style: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpansionPanel",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slideOpts() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slideOpts(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ExpansionPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ExpansionPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var prevIcon = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';

    var nextIcon = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';

    /* node_modules/svelte-materialify/dist/components/SlideGroup/SlideGroup.svelte generated by Svelte v3.32.1 */
    const file$b = "node_modules/svelte-materialify/dist/components/SlideGroup/SlideGroup.svelte";
    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_previous_slot_changes = dirty => ({});
    const get_previous_slot_context = ctx => ({});

    // (111:2) {#if arrowsVisible}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const previous_slot_template = /*#slots*/ ctx[17].previous;
    	const previous_slot = create_slot(previous_slot_template, ctx, /*$$scope*/ ctx[22], get_previous_slot_context);
    	const previous_slot_or_fallback = previous_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (previous_slot_or_fallback) previous_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__prev");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$b, 111, 4, 2532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (previous_slot_or_fallback) {
    				previous_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*prev*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (previous_slot) {
    				if (previous_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(previous_slot, previous_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_previous_slot_changes, get_previous_slot_context);
    				}
    			}

    			if (dirty & /*x*/ 512) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previous_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previous_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (previous_slot_or_fallback) previous_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(111:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (117:28)          
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: prevIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(117:28)          ",
    		ctx
    	});

    	return block;
    }

    // (134:2) {#if arrowsVisible}
    function create_if_block$4(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const next_slot_template = /*#slots*/ ctx[17].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[22], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__next");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$b, 134, 4, 3117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*next*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			}

    			if (dirty & /*x, contentWidth, wrapperWidth*/ 896) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(134:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (140:24)          
    function fallback_block$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: nextIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(140:24)          ",
    		ctx
    	});

    	return block;
    }

    // (103:0) <ItemGroup   class="s-slide-group {klass}"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>
    function create_default_slot$1(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_resize_listener;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrowsVisible*/ ctx[10] && create_if_block_1$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*arrowsVisible*/ ctx[10] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "s-slide-group__content");
    			set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[18].call(div0));
    			add_location(div0, file$b, 126, 4, 2933);
    			attr_dev(div1, "class", "s-slide-group__wrapper");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			add_location(div1, file$b, 121, 2, 2776);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[18].bind(div0));
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "touchstart", /*touchstart*/ ctx[13], { passive: true }, false, false),
    					listen_dev(div1, "touchmove", /*touchmove*/ ctx[14], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*x*/ 512) {
    				set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			}

    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			div1_resize_listener();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(103:0) <ItemGroup   class=\\\"s-slide-group {klass}\\\"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[20].call(null, value);
    	}

    	let itemgroup_props = {
    		class: "s-slide-group " + /*klass*/ ctx[1],
    		activeClass: /*activeClass*/ ctx[3],
    		multiple: /*multiple*/ ctx[4],
    		mandatory: /*mandatory*/ ctx[5],
    		max: /*max*/ ctx[6],
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));
    	itemgroup.$on("change", /*change_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-slide-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 8) itemgroup_changes.activeClass = /*activeClass*/ ctx[3];
    			if (dirty & /*multiple*/ 16) itemgroup_changes.multiple = /*multiple*/ ctx[4];
    			if (dirty & /*mandatory*/ 32) itemgroup_changes.mandatory = /*mandatory*/ ctx[5];
    			if (dirty & /*max*/ 64) itemgroup_changes.max = /*max*/ ctx[6];

    			if (dirty & /*$$scope, x, contentWidth, wrapperWidth, hideDisabledArrows, arrowsVisible*/ 4196228) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SLIDE_GROUP = {};

    function instance$f($$self, $$props, $$invalidate) {
    	let arrowsVisible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideGroup", slots, ['previous','default','next']);
    	let contentWidth;
    	let wrapperWidth;
    	let { class: klass = "" } = $$props;
    	let { showArrows = true } = $$props;
    	let { hideDisabledArrows = false } = $$props;
    	let { centerActive = false } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let x = 0;

    	setContext(SLIDE_GROUP, item => {
    		const left = item.offsetLeft;
    		const width = item.offsetWidth;

    		if (centerActive) $$invalidate(9, x = left + (width - wrapperWidth) / 2); else if (left + 1.25 * width > wrapperWidth + x) {
    			$$invalidate(9, x = left + 1.25 * width - wrapperWidth);
    		} else if (left < x + width / 4) {
    			$$invalidate(9, x = left - width / 4);
    		}
    	});

    	afterUpdate(() => {
    		if (x + wrapperWidth > contentWidth) $$invalidate(9, x = contentWidth - wrapperWidth); else if (x < 0) $$invalidate(9, x = 0);
    	});

    	function next() {
    		$$invalidate(9, x += wrapperWidth);
    	}

    	function prev() {
    		$$invalidate(9, x -= wrapperWidth);
    	}

    	let touchStartX;

    	function touchstart({ touches }) {
    		touchStartX = x + touches[0].clientX;
    	}

    	function touchmove({ touches }) {
    		$$invalidate(9, x = touchStartX - touches[0].clientX);
    	}

    	const writable_props = [
    		"class",
    		"showArrows",
    		"hideDisabledArrows",
    		"centerActive",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideGroup> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		$$invalidate(7, contentWidth);
    	}

    	function div1_elementresize_handler() {
    		wrapperWidth = this.clientWidth;
    		$$invalidate(8, wrapperWidth);
    	}

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SLIDE_GROUP,
    		setContext,
    		afterUpdate,
    		ItemGroup,
    		prevIcon,
    		nextIcon,
    		Icon,
    		contentWidth,
    		wrapperWidth,
    		klass,
    		showArrows,
    		hideDisabledArrows,
    		centerActive,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		x,
    		next,
    		prev,
    		touchStartX,
    		touchstart,
    		touchmove,
    		arrowsVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentWidth" in $$props) $$invalidate(7, contentWidth = $$props.contentWidth);
    		if ("wrapperWidth" in $$props) $$invalidate(8, wrapperWidth = $$props.wrapperWidth);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("x" in $$props) $$invalidate(9, x = $$props.x);
    		if ("touchStartX" in $$props) touchStartX = $$props.touchStartX;
    		if ("arrowsVisible" in $$props) $$invalidate(10, arrowsVisible = $$props.arrowsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperWidth, contentWidth, showArrows*/ 33152) {
    			 $$invalidate(10, arrowsVisible = wrapperWidth < contentWidth && showArrows);
    		}
    	};

    	return [
    		value,
    		klass,
    		hideDisabledArrows,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		contentWidth,
    		wrapperWidth,
    		x,
    		arrowsVisible,
    		next,
    		prev,
    		touchstart,
    		touchmove,
    		showArrows,
    		centerActive,
    		slots,
    		div0_elementresize_handler,
    		div1_elementresize_handler,
    		itemgroup_value_binding,
    		change_handler,
    		$$scope
    	];
    }

    class SlideGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 1,
    			showArrows: 15,
    			hideDisabledArrows: 2,
    			centerActive: 16,
    			activeClass: 3,
    			value: 0,
    			multiple: 4,
    			mandatory: 5,
    			max: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideGroup",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideDisabledArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDisabledArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Window/Window.svelte generated by Svelte v3.32.1 */
    const file$c = "node_modules/svelte-materialify/dist/components/Window/Window.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window " + /*klass*/ ctx[0]);
    			toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			add_location(div, file$c, 126, 0, 3562);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[12](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, reverse*/ 5) {
    				toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const WINDOW = {};

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { value = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { reverse = false } = $$props;
    	let { continuous = true } = $$props;
    	let container;
    	const windowItems = [];
    	let moving = false;

    	setContext(WINDOW, window => {
    		windowItems.push(window);
    	});

    	function set(index) {
    		const prevIndex = windowItems.findIndex(i => i.classList.contains(activeClass));

    		if (!moving && windowItems[index] && index !== prevIndex) {
    			moving = true;
    			let direction;
    			let position;

    			if (index > prevIndex) {
    				direction = "left";
    				position = "next";
    			} else {
    				direction = "right";
    				position = "prev";
    			}

    			const prev = windowItems[prevIndex];
    			prev.classList.add(direction);
    			$$invalidate(3, container.style.height = `${prev.offsetHeight}px`, container);
    			const active = windowItems[index];
    			active.classList.add(position);
    			$$invalidate(3, container.style.height = `${active.offsetHeight}px`, container);
    			active.classList.add(direction);

    			setTimeout(
    				() => {
    					prev.classList.remove("active", direction);
    					active.classList.add("active");
    					active.classList.remove(position, direction);
    					$$invalidate(3, container.style.height = null, container);
    					moving = false;
    					$$invalidate(4, value = index);
    				},
    				300
    			);
    		}
    	}

    	function next() {
    		if (value === windowItems.length - 1) {
    			if (continuous) set(0);
    		} else {
    			set(value + 1);
    		}
    	}

    	function previous() {
    		if (value === 0) {
    			if (continuous) set(windowItems.length - 1);
    		} else {
    			set(value - 1);
    		}
    	}

    	onMount(() => {
    		const activeItem = windowItems[value];
    		if (activeItem) activeItem.classList.add(activeClass);
    	});

    	const writable_props = ["class", "activeClass", "value", "vertical", "reverse", "continuous"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		WINDOW,
    		onMount,
    		setContext,
    		klass,
    		activeClass,
    		value,
    		vertical,
    		reverse,
    		continuous,
    		container,
    		windowItems,
    		moving,
    		set,
    		next,
    		previous
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("moving" in $$props) moving = $$props.moving;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 16) {
    			 set(value);
    		}
    	};

    	return [
    		klass,
    		vertical,
    		reverse,
    		container,
    		value,
    		activeClass,
    		continuous,
    		set,
    		next,
    		previous,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 0,
    			activeClass: 5,
    			value: 4,
    			vertical: 1,
    			reverse: 2,
    			continuous: 6,
    			set: 7,
    			next: 8,
    			previous: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get continuous() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set continuous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get set() {
    		return this.$$.ctx[7];
    	}

    	set set(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[8];
    	}

    	set next(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		return this.$$.ctx[9];
    	}

    	set previous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Window/WindowItem.svelte generated by Svelte v3.32.1 */
    const file$d = "node_modules/svelte-materialify/dist/components/Window/WindowItem.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window-item " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$d, 31, 0, 699);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window-item " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WindowItem", slots, ['default']);
    	let window;
    	const registerWindow = getContext(WINDOW);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;

    	onMount(() => {
    		registerWindow(window);
    	});

    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WindowItem> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			window = $$value;
    			$$invalidate(2, window);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		WINDOW,
    		window,
    		registerWindow,
    		klass,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("window" in $$props) $$invalidate(2, window = $$props.window);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, window, $$scope, slots, div_binding];
    }

    class WindowItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowItem",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Tabs/Tabs.svelte generated by Svelte v3.32.1 */
    const file$e = "node_modules/svelte-materialify/dist/components/Tabs/Tabs.svelte";
    const get_tabs_slot_changes = dirty => ({});
    const get_tabs_slot_context = ctx => ({});

    // (169:6) {#if slider}
    function create_if_block$5(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10]);
    			add_location(div, file$e, 169, 8, 3566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderClass*/ 1024 && div_class_value !== (div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(169:6) {#if slider}",
    		ctx
    	});

    	return block;
    }

    // (161:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>
    function create_default_slot_1(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const tabs_slot_template = /*#slots*/ ctx[16].tabs;
    	const tabs_slot = create_slot(tabs_slot_template, ctx, /*$$scope*/ ctx[21], get_tabs_slot_context);
    	let if_block = /*slider*/ ctx[9] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (tabs_slot) tabs_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (tabs_slot) {
    				tabs_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tabs_slot) {
    				if (tabs_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(tabs_slot, tabs_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_tabs_slot_changes, get_tabs_slot_context);
    				}
    			}

    			if (/*slider*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tabs_slot) tabs_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(161:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>",
    		ctx
    	});

    	return block;
    }

    // (174:2) <Window bind:this={windowComponent}>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(174:2) <Window bind:this={windowComponent}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let div0;
    	let slidegroup;
    	let updating_value;
    	let div0_class_value;
    	let t;
    	let window;
    	let current;

    	function slidegroup_value_binding(value) {
    		/*slidegroup_value_binding*/ ctx[18].call(null, value);
    	}

    	let slidegroup_props = {
    		mandatory: true,
    		centerActive: /*centerActive*/ ctx[2],
    		showArrows: /*showArrows*/ ctx[3],
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		slidegroup_props.value = /*value*/ ctx[0];
    	}

    	slidegroup = new SlideGroup({ props: slidegroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(slidegroup, "value", slidegroup_value_binding));
    	slidegroup.$on("change", /*moveSlider*/ ctx[14]);
    	slidegroup.$on("change", /*change_handler*/ ctx[19]);

    	let window_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	window = new Window({ props: window_props, $$inline: true });
    	/*window_binding*/ ctx[20](window);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slidegroup.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1]);
    			attr_dev(div0, "role", "tablist");
    			toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			toggle_class(div0, "right", /*right*/ ctx[7]);
    			toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			add_location(div0, file$e, 152, 2, 3222);
    			attr_dev(div1, "class", "s-tabs");
    			attr_dev(div1, "role", "tablist");
    			toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			add_location(div1, file$e, 151, 0, 3169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slidegroup, div0, null);
    			append_dev(div1, t);
    			mount_component(window, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidegroup_changes = {};
    			if (dirty & /*centerActive*/ 4) slidegroup_changes.centerActive = /*centerActive*/ ctx[2];
    			if (dirty & /*showArrows*/ 8) slidegroup_changes.showArrows = /*showArrows*/ ctx[3];

    			if (dirty & /*$$scope, sliderClass, sliderElement, slider*/ 2102784) {
    				slidegroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				slidegroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidegroup.$set(slidegroup_changes);

    			if (!current || dirty & /*klass*/ 2 && div0_class_value !== (div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fixedTabs*/ 18) {
    				toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			}

    			if (dirty & /*klass, grow*/ 34) {
    				toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			}

    			if (dirty & /*klass, centered*/ 66) {
    				toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			}

    			if (dirty & /*klass, right*/ 130) {
    				toggle_class(div0, "right", /*right*/ ctx[7]);
    			}

    			if (dirty & /*klass, icons*/ 258) {
    				toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			}

    			const window_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);

    			if (dirty & /*vertical*/ 2048) {
    				toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidegroup.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidegroup.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidegroup);
    			/*window_binding*/ ctx[20](null);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['tabs','default']);
    	let sliderElement;
    	let windowComponent;
    	const tabs = [];
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { centerActive = false } = $$props;
    	let { showArrows = true } = $$props;
    	let { fixedTabs = false } = $$props;
    	let { grow = false } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { icons = false } = $$props;
    	let { slider = true } = $$props;
    	let { sliderClass = "" } = $$props;
    	let { ripple = {} } = $$props;
    	let { vertical = false } = $$props;

    	setContext(TABS, {
    		ripple,
    		registerTab: tab => {
    			tabs.push(tab);
    		}
    	});

    	function moveSlider({ detail }) {
    		if (slider) {
    			const activeTab = tabs[detail];

    			if (vertical) {
    				$$invalidate(12, sliderElement.style.top = `${activeTab.offsetTop}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.height = `${activeTab.offsetHeight}px`, sliderElement);
    			} else {
    				$$invalidate(12, sliderElement.style.left = `${activeTab.offsetLeft}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.width = `${activeTab.offsetWidth}px`, sliderElement);
    			}
    		}

    		windowComponent.set(value);
    	}

    	onMount(() => {
    		moveSlider({ detail: value });
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"centerActive",
    		"showArrows",
    		"fixedTabs",
    		"grow",
    		"centered",
    		"right",
    		"icons",
    		"slider",
    		"sliderClass",
    		"ripple",
    		"vertical"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(12, sliderElement);
    		});
    	}

    	function slidegroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function window_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			windowComponent = $$value;
    			$$invalidate(13, windowComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ("$$scope" in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		SlideGroup,
    		Window,
    		onMount,
    		setContext,
    		sliderElement,
    		windowComponent,
    		tabs,
    		klass,
    		value,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		ripple,
    		vertical,
    		moveSlider
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(12, sliderElement = $$props.sliderElement);
    		if ("windowComponent" in $$props) $$invalidate(13, windowComponent = $$props.windowComponent);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		vertical,
    		sliderElement,
    		windowComponent,
    		moveSlider,
    		ripple,
    		slots,
    		div_binding,
    		slidegroup_value_binding,
    		change_handler,
    		window_binding,
    		$$scope
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			class: 1,
    			value: 0,
    			centerActive: 2,
    			showArrows: 3,
    			fixedTabs: 4,
    			grow: 5,
    			centered: 6,
    			right: 7,
    			icons: 8,
    			slider: 9,
    			sliderClass: 10,
    			ripple: 15,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get class() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedTabs() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedTabs(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icons() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icons(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slider() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slider(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliderClass() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliderClass(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Tabs/Tab.svelte generated by Svelte v3.32.1 */
    const file$f = "node_modules/svelte-materialify/dist/components/Tabs/Tab.svelte";

    function create_fragment$j(ctx) {
    	let button;
    	let button_class_value;
    	let button_tabindex_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0]);
    			attr_dev(button, "role", "tab");
    			attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0);
    			toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			add_location(button, file$f, 92, 0, 1992);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[10](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]])),
    					listen_dev(button, "click", /*selectTab*/ ctx[6], false, false, false),
    					action_destroyer(Ripple.call(null, button, /*ripple*/ ctx[5]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && button_class_value !== (button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*active*/ 16) {
    				attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 4 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 18) Class_action.update.call(null, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]]);

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, active*/ 17) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let tab;
    	const click = getContext(SLIDE_GROUP);
    	const ITEM = getContext(ITEM_GROUP);
    	const { ripple, registerTab } = getContext(TABS);
    	let { class: klass = "" } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { disabled = null } = $$props;
    	let active;

    	ITEM.register(values => {
    		$$invalidate(4, active = values.includes(value));
    	});

    	function selectTab({ target }) {
    		if (!disabled) {
    			click(target);
    			ITEM.select(value);
    		}
    	}

    	onMount(() => {
    		registerTab(tab);
    	});

    	const writable_props = ["class", "value", "activeClass", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tab = $$value;
    			$$invalidate(3, tab);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		SLIDE_GROUP,
    		ITEM_GROUP,
    		TABS,
    		Class,
    		Ripple,
    		tab,
    		click,
    		ITEM,
    		ripple,
    		registerTab,
    		klass,
    		value,
    		activeClass,
    		disabled,
    		active,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		activeClass,
    		disabled,
    		tab,
    		active,
    		ripple,
    		selectTab,
    		value,
    		$$scope,
    		slots,
    		button_binding
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			class: 0,
    			value: 7,
    			activeClass: 1,
    			disabled: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/InputPanel.svelte generated by Svelte v3.32.1 */
    const file$g = "src/InputPanel.svelte";

    // (195:12) <Button style='width:465px; position:absolute; top:3px; left:-80px; height: 40px; font-size:25px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_Gebruiksaanwijzing = true)}>
    function create_default_slot_6(ctx) {
    	let strong;

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			strong.textContent = "GEBRUIKSAANWIJZING";
    			add_location(strong, file$g, 194, 212, 7799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(195:12) <Button style='width:465px; position:absolute; top:3px; left:-80px; height: 40px; font-size:25px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_Gebruiksaanwijzing = true)}>",
    		ctx
    	});

    	return block;
    }

    // (213:20) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_KL1 = true)}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(213:20) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_KL1 = true)}>",
    		ctx
    	});

    	return block;
    }

    // (230:8) <Button on:click={close_iD_KL1} text class="black-text" style='margin-top:30px;border:1px solid #333;'>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("OK");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(230:8) <Button on:click={close_iD_KL1} text class=\\\"black-text\\\" style='margin-top:30px;border:1px solid #333;'>",
    		ctx
    	});

    	return block;
    }

    // (227:4) <Dialog class="pa-16 text-center" width='1200px' bind:active={infoDialog_KL1}>
    function create_default_slot_3(ctx) {
    	let p;
    	let strong;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				class: "black-text",
    				style: "margin-top:30px;border:1px solid #333;",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*close_iD_KL1*/ ctx[4]);

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bronbudget";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$g, 227, 47, 10057);
    			set_style(p, "color", "black");
    			set_style(p, "font-size", "30px");
    			attr_dev(p, "class", "svelte-uputmg");
    			add_location(p, file$g, 227, 8, 10018);
    			set_style(img, "z-index", "90000");
    			if (img.src !== (img_src_value = "img/bestedingsruimte_warmtenet.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "icon");
    			attr_dev(img, "width", "1100");
    			attr_dev(img, "height", "630");
    			add_location(img, file$g, 228, 8, 10097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(227:4) <Dialog class=\\\"pa-16 text-center\\\" width='1200px' bind:active={infoDialog_KL1}>",
    		ctx
    	});

    	return block;
    }

    // (276:8) <Button on:click={close_iD_Gebruiksaanwijzing} text class="black-text" style='margin-top:30px;border:1px solid #333;'>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("OK");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(276:8) <Button on:click={close_iD_Gebruiksaanwijzing} text class=\\\"black-text\\\" style='margin-top:30px;border:1px solid #333;'>",
    		ctx
    	});

    	return block;
    }

    // (232:4) <Dialog class="pa-16 text-center" width='800px' bind:active={infoDialog_Gebruiksaanwijzing}>
    function create_default_slot_1$1(ctx) {
    	let h1;
    	let strong0;
    	let t1;
    	let div;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let h20;
    	let span0;
    	let t7;
    	let p0;
    	let t8;
    	let strong1;
    	let t10;
    	let strong2;
    	let t12;
    	let strong3;
    	let t14;
    	let t15;
    	let h21;
    	let span1;
    	let t17;
    	let p1;
    	let t18;
    	let strong4;
    	let t20;
    	let h22;
    	let span2;
    	let t22;
    	let p2;
    	let t24;
    	let ul1;
    	let li5;
    	let p3;
    	let t25;
    	let strong5;
    	let t27;
    	let t28;
    	let ul0;
    	let li0;
    	let t29;
    	let strong6;
    	let t31;
    	let t32;
    	let li1;
    	let t33;
    	let strong7;
    	let t35;
    	let t36;
    	let li2;
    	let t37;
    	let strong8;
    	let t39;
    	let t40;
    	let li3;
    	let t41;
    	let strong9;
    	let t43;
    	let t44;
    	let li4;
    	let t45;
    	let strong10;
    	let t47;
    	let t48;
    	let li6;
    	let t49;
    	let strong11;
    	let t51;
    	let t52;
    	let li7;
    	let t54;
    	let h23;
    	let span3;
    	let t56;
    	let p4;
    	let t57;
    	let strong12;
    	let t59;
    	let strong13;
    	let t61;
    	let strong14;
    	let t63;
    	let h24;
    	let span4;
    	let t65;
    	let p5;
    	let t67;
    	let ul3;
    	let li8;
    	let strong15;
    	let t69;
    	let strong16;
    	let t71;
    	let t72;
    	let li9;
    	let strong17;
    	let t74;
    	let strong18;
    	let t76;
    	let t77;
    	let ul2;
    	let li10;
    	let t78;
    	let strong19;
    	let t80;
    	let t81;
    	let li11;
    	let t82;
    	let strong20;
    	let t84;
    	let t85;
    	let h25;
    	let span5;
    	let t87;
    	let p6;
    	let t89;
    	let ul4;
    	let li12;
    	let span6;
    	let strong21;
    	let t91;
    	let t92;
    	let li13;
    	let span7;
    	let strong22;
    	let t94;
    	let t95;
    	let li14;
    	let span8;
    	let strong23;
    	let t97;
    	let t98;
    	let h26;
    	let span9;
    	let t100;
    	let p7;
    	let t102;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				class: "black-text",
    				style: "margin-top:30px;border:1px solid #333;",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*close_iD_Gebruiksaanwijzing*/ ctx[5]);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			strong0 = element("strong");
    			strong0.textContent = "GEBRUIKSAANWIJZING WARMTEWEEGSCHAAL";
    			t1 = space();
    			div = element("div");
    			t2 = text("Dit is een korte versie van de handleiding waar je snel mee van start kunt. Een uitgebreide versie van de handleiding vind je ");
    			a = element("a");
    			a.textContent = "hier";
    			t4 = text(". (volgt nog)");
    			t5 = space();
    			h20 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Het gebruiksdoel";
    			t7 = space();
    			p0 = element("p");
    			t8 = text("Met de warmteweegschaal vergelijk je ");
    			strong1 = element("strong");
    			strong1.textContent = "twee transitieroutes";
    			t10 = text(" met elkaar. Op de ene kant van de weegschaal staat de ");
    			strong2 = element("strong");
    			strong2.textContent = "collectieve";
    			t12 = text(" route en op de andere kant de ");
    			strong3 = element("strong");
    			strong3.textContent = "individuele";
    			t14 = text(" route. De collectieve route behelst het ontwikkelen van een buurt-breed warmtenet. Op de individuele route wordt een all-electric oplossing met warmtepomp toegepast, individueel per woning of gebouw.");
    			t15 = space();
    			h21 = element("h2");
    			span1 = element("span");
    			span1.textContent = "De focus";
    			t17 = space();
    			p1 = element("p");
    			t18 = text("De Warmteweegschaal is er primair op gericht gebieden op de ");
    			strong4 = element("strong");
    			strong4.textContent = "potentie van warmtenetten";
    			t20 = text(" als eindoplossing te verkennen. Tussenstappen, oplossingen met hernieuwbaar gas in de basis en kleinschalige gebouw- of blokgebonden warmtenetten vallen buiten de scope van de Warmteweegschaal. Voor gebied waar de Warmteweegschaal een lage potentie voor warmtenetten en buitengewoon hoge kosten voor all-electric laat zien zijn laatstgenoemde oplossingsrichtingen mogelijk een beter alternatief.\n        ");
    			h22 = element("h2");
    			span2 = element("span");
    			span2.textContent = "De bediening";
    			t22 = space();
    			p2 = element("p");
    			p2.textContent = "Kies een te analyseren gemeente en klik op één of meerdere buurten om een gebiedsselectie te maken. Analyseer het gebied door gebruik te maken van de volgende onderdelen:";
    			t24 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			p3 = element("p");
    			t25 = text("Het ");
    			strong5 = element("strong");
    			strong5.textContent = "'Selectie'";
    			t27 = text(" menu links onderaan de pagina toont rekenresultaten en statistieken over het geselecteerde gebied. Bij selectie van meerdere buurten tonen de grafieken de totalen over alle geselecteerde buurten of de op het aantal woningequivalenten in een buurt gewogen gemiddelde kosten over alle geselecteerde buurten. Dit menu bestaat uit een vijftal tabs welke de volgende informatie tonen:");
    			t28 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			t29 = text("Tab ");
    			strong6 = element("strong");
    			strong6.textContent = "'Kosten'";
    			t31 = text(": De nationale meerkosten per oplossing in €/ton C02-reductie/jaar.");
    			t32 = space();
    			li1 = element("li");
    			t33 = text("Tab ");
    			strong7 = element("strong");
    			strong7.textContent = "'Posten'";
    			t35 = text(": De verdeling van de kosten over de verschillende posten.");
    			t36 = space();
    			li2 = element("li");
    			t37 = text("Tab ");
    			strong8 = element("strong");
    			strong8.textContent = "'Warmtenet'";
    			t39 = text(": Informatie over het warmtenet (aangesloten aantal woningequivalenten, het benodigde warmtevolume en de veronderstelde kosten per weq)");
    			t40 = space();
    			li3 = element("li");
    			t41 = text("Tab ");
    			strong9 = element("strong");
    			strong9.textContent = "'Woningtypen'";
    			t43 = text(": De verdeling van het totaal aantal woningen binnen de selectie over de woningtypen");
    			t44 = space();
    			li4 = element("li");
    			t45 = text("Tab ");
    			strong10 = element("strong");
    			strong10.textContent = "'Bouwperiode'";
    			t47 = text(": De verdeling van het totaal aantal woningen binnen de selectie over de bouwperioden");
    			t48 = space();
    			li6 = element("li");
    			t49 = text("In de Warmteweegschaal zijn een aantal kaarten opgenomen die inzicht geven in de bebouwingsdichtheid en leeftijd van bebouwing. Wijzig via het ");
    			strong11 = element("strong");
    			strong11.textContent = "'Kaartlagen'";
    			t51 = text(" menu links bovenaan de pagina de getoonde kaartlaag. Klik op de 'INFO' knoppen bij de kaartlagen voor een uitgebreide toelichting bij de kaartlaag.");
    			t52 = space();
    			li7 = element("li");
    			li7.textContent = "Zodra er een gebiedsselectie is gemaakt verschijnt bovenaan het scherm een schuif getiteld 'warmtekosten'. Klik op de 'INFO' knop naast de schuif voor een uitleg over de schuif.";
    			t54 = space();
    			h23 = element("h2");
    			span3 = element("span");
    			span3.textContent = "De basis";
    			t56 = space();
    			p4 = element("p");
    			t57 = text("De warmteweegschaal is gebaseerd op de uitkomsten uit de ");
    			strong12 = element("strong");
    			strong12.textContent = "Startanalyse Aardgasvrije Buurten";
    			t59 = text(" van het Planbureau voor de Leefomgeving. In lijn met de Startanalyse rekent de warmteweegschaal op het niveau van ");
    			strong13 = element("strong");
    			strong13.textContent = "nationale kosten";
    			t61 = text(" en kijkt de warmteweegschaal op ");
    			strong14 = element("strong");
    			strong14.textContent = "CBS-buurtniveau.";
    			t63 = space();
    			h24 = element("h2");
    			span4 = element("span");
    			span4.textContent = "De uitbreiding";
    			t65 = space();
    			p5 = element("p");
    			p5.textContent = "De warmteweegschaal volgt de resultaten uit de Startanalyse, met één belangrijke uitzondering: op de collectieve route zijn de kosten voor de warmtebron en warmtetransportleiding dynamisch instelbaar gemaakt. Dit dient twee doelen:";
    			t67 = space();
    			ul3 = element("ul");
    			li8 = element("li");
    			strong15 = element("strong");
    			strong15.textContent = "Alle";
    			t69 = text(" buurten kunnen op de potentie van warmtenetten worden geanalyseerd, zonder afhankelijk te zijn van de ");
    			strong16 = element("strong");
    			strong16.textContent = "beschikbaarheid of volledigheid van data";
    			t71 = text(" over een nabijgelegen warmtebron en de bronallocaties van Vesta MAIS.");
    			t72 = space();
    			li9 = element("li");
    			strong17 = element("strong");
    			strong17.textContent = "Verbeterd inzicht";
    			t74 = text(" in de redenen ");
    			strong18 = element("strong");
    			strong18.textContent = "waarom";
    			t76 = text(" een warmtenet qua kosten als meer of minder interessant naar voren komt voor een bepaalde buurt of combinatie van buurten");
    			t77 = space();
    			ul2 = element("ul");
    			li10 = element("li");
    			t78 = text("door inzichtelijk te maken ");
    			strong19 = element("strong");
    			strong19.textContent = "onder welke condities";
    			t80 = text(" van bronbeschikbaarheid een warmtenet lagere nationale kosten geeft");
    			t81 = space();
    			li11 = element("li");
    			t82 = text("door de ");
    			strong20 = element("strong");
    			strong20.textContent = "bebouwingskarakteristieken";
    			t84 = text(" van een buurt op dichtheid en bouwperiode in beeld te brengen.");
    			t85 = space();
    			h25 = element("h2");
    			span5 = element("span");
    			span5.textContent = "De methode";
    			t87 = space();
    			p6 = element("p");
    			p6.textContent = "De Warmteweegschaal berekent de extra nationale kosten per ton CO2-uitstoot voor een drietal oplossingen:";
    			t89 = space();
    			ul4 = element("ul");
    			li12 = element("li");
    			span6 = element("span");
    			strong21 = element("strong");
    			strong21.textContent = "Een individuele all-electric oplossing met warmtepomp.";
    			t91 = text(" De getoonde kosten voor deze route komen exact overeen met de in de Startanalyse getoonde resultaten voor variant met individuele lucht-water warmtepomp (variant S1a).");
    			t92 = space();
    			li13 = element("li");
    			span7 = element("span");
    			strong22 = element("strong");
    			strong22.textContent = "Een warmtenet in combinatie met isolatieniveau D+.";
    			t94 = text(" De getoonde kosten voor deze route zijn deels overgenomen uit de resultaten uit de Startanalyse. Dit geldt voor de kosten voor aanleg van het wijkdistributienet, voor onderhoud en beheer, leidingen en installaties in gebouwen en de isolatiekosten (variant S2f). De kosten voor de ontwikkeling en exploitatie van de warmtebron en de warmtetransportleiding zijn vrij instelbaar.");
    			t95 = space();
    			li14 = element("li");
    			span8 = element("span");
    			strong23 = element("strong");
    			strong23.textContent = "Een warmtenet in combinatie met isolatieniveau B+.";
    			t97 = text(" Hiervoor is de opzet overeenkomstig met laatstgenoemde oplossing, met als verschil de toepassing van schilisolatieniveau label B+ in plaats van D+ (variant S2c).");
    			t98 = space();
    			h26 = element("h2");
    			span9 = element("span");
    			span9.textContent = "Aandachtspunt";
    			t100 = space();
    			p7 = element("p");
    			p7.textContent = "De warmteweegschaal volgt de Nationale Kosten methodiek van de Startanalyse. Houd er rekening mee dat het niet zonder meer mogelijk is om op basis van de Nationale Kosten te concluderen dat een warmtenet voor een buurt zowel een haalbare businesscase voor een warmtebedrijf als lagere kosten voor de eindgebruiker ten opzichte van all-electric oplevert. Een businesscase berekening is noodzakelijk om daar uitsluitsel over te krijgen. Met gebruik van de warmteweegschaal kan je erachter komen voor welke buurten het de moeite waard kan zijn zo'n businesscase berekening uit te werken. Hoe groter het verschil in Nationale Kosten, hoe groter de kans dat een warmtenet een voor zowel het warmtebedrijf als de eindgebruiker interessante optie is. Uit een steekproefsgewijze analyse van buurten komt naar voren dat...";
    			t102 = space();
    			create_component(button.$$.fragment);
    			add_location(strong0, file$g, 232, 32, 10471);
    			set_style(h1, "color", "black");
    			attr_dev(h1, "class", "svelte-uputmg");
    			add_location(h1, file$g, 232, 8, 10447);
    			attr_dev(a, "href", "");
    			add_location(a, file$g, 233, 171, 10700);
    			attr_dev(div, "class", "p2 svelte-uputmg");
    			set_style(div, "color", "black");
    			add_location(div, file$g, 233, 8, 10537);
    			set_style(span0, "background-color", "#64ffda");
    			add_location(span0, file$g, 234, 32, 10769);
    			set_style(h20, "color", "black");
    			attr_dev(h20, "class", "svelte-uputmg");
    			add_location(h20, file$g, 234, 8, 10745);
    			add_location(strong1, file$g, 235, 68, 10906);
    			add_location(strong2, file$g, 235, 160, 10998);
    			add_location(strong3, file$g, 235, 219, 11057);
    			set_style(p0, "color", "black");
    			attr_dev(p0, "class", "svelte-uputmg");
    			add_location(p0, file$g, 235, 8, 10846);
    			set_style(span1, "background-color", "#64ffda");
    			add_location(span1, file$g, 236, 32, 11323);
    			set_style(h21, "color", "black");
    			attr_dev(h21, "class", "svelte-uputmg");
    			add_location(h21, file$g, 236, 8, 11299);
    			add_location(strong4, file$g, 237, 91, 11475);
    			set_style(p1, "color", "black");
    			attr_dev(p1, "class", "svelte-uputmg");
    			add_location(p1, file$g, 237, 8, 11392);
    			set_style(span2, "background-color", "#64ffda");
    			add_location(span2, file$g, 238, 32, 11946);
    			set_style(h22, "color", "black");
    			attr_dev(h22, "class", "svelte-uputmg");
    			add_location(h22, file$g, 238, 8, 11922);
    			set_style(p2, "color", "black");
    			attr_dev(p2, "class", "svelte-uputmg");
    			add_location(p2, file$g, 239, 8, 12019);
    			add_location(strong5, file$g, 242, 43, 12290);
    			set_style(p3, "color", "black");
    			attr_dev(p3, "class", "svelte-uputmg");
    			add_location(p3, file$g, 242, 16, 12263);
    			add_location(strong6, file$g, 244, 28, 12751);
    			attr_dev(li0, "class", "svelte-uputmg");
    			add_location(li0, file$g, 244, 20, 12743);
    			add_location(strong7, file$g, 245, 28, 12878);
    			attr_dev(li1, "class", "svelte-uputmg");
    			add_location(li1, file$g, 245, 20, 12870);
    			add_location(strong8, file$g, 246, 28, 12995);
    			attr_dev(li2, "class", "svelte-uputmg");
    			add_location(li2, file$g, 246, 20, 12987);
    			add_location(strong9, file$g, 247, 28, 13193);
    			attr_dev(li3, "class", "svelte-uputmg");
    			add_location(li3, file$g, 247, 20, 13185);
    			add_location(strong10, file$g, 248, 28, 13341);
    			attr_dev(li4, "class", "svelte-uputmg");
    			add_location(li4, file$g, 248, 20, 13333);
    			attr_dev(ul0, "class", "svelte-uputmg");
    			add_location(ul0, file$g, 243, 16, 12718);
    			attr_dev(li5, "class", "svelte-uputmg");
    			add_location(li5, file$g, 241, 12, 12242);
    			add_location(strong11, file$g, 251, 159, 13661);
    			attr_dev(li6, "class", "svelte-uputmg");
    			add_location(li6, file$g, 251, 12, 13514);
    			attr_dev(li7, "class", "svelte-uputmg");
    			add_location(li7, file$g, 252, 12, 13856);
    			attr_dev(ul1, "class", "svelte-uputmg");
    			add_location(ul1, file$g, 240, 8, 12225);
    			set_style(span3, "background-color", "#64ffda");
    			add_location(span3, file$g, 254, 32, 14089);
    			set_style(h23, "color", "black");
    			attr_dev(h23, "class", "svelte-uputmg");
    			add_location(h23, file$g, 254, 8, 14065);
    			add_location(strong12, file$g, 255, 88, 14238);
    			add_location(strong13, file$g, 255, 253, 14403);
    			add_location(strong14, file$g, 255, 319, 14469);
    			set_style(p4, "color", "black");
    			attr_dev(p4, "class", "svelte-uputmg");
    			add_location(p4, file$g, 255, 8, 14158);
    			set_style(span4, "background-color", "#64ffda");
    			add_location(span4, file$g, 256, 32, 14530);
    			set_style(h24, "color", "black");
    			attr_dev(h24, "class", "svelte-uputmg");
    			add_location(h24, file$g, 256, 8, 14506);
    			set_style(p5, "color", "black");
    			attr_dev(p5, "class", "svelte-uputmg");
    			add_location(p5, file$g, 257, 8, 14605);
    			add_location(strong15, file$g, 259, 16, 14893);
    			add_location(strong16, file$g, 259, 140, 15017);
    			attr_dev(li8, "class", "svelte-uputmg");
    			add_location(li8, file$g, 259, 12, 14889);
    			add_location(strong17, file$g, 260, 16, 15166);
    			add_location(strong18, file$g, 260, 65, 15215);
    			attr_dev(li9, "class", "svelte-uputmg");
    			add_location(li9, file$g, 260, 12, 15162);
    			add_location(strong19, file$g, 262, 47, 15430);
    			attr_dev(li10, "class", "svelte-uputmg");
    			add_location(li10, file$g, 262, 16, 15399);
    			add_location(strong20, file$g, 263, 28, 15571);
    			attr_dev(li11, "class", "svelte-uputmg");
    			add_location(li11, file$g, 263, 16, 15559);
    			attr_dev(ul2, "class", "svelte-uputmg");
    			add_location(ul2, file$g, 261, 12, 15378);
    			attr_dev(ul3, "class", "svelte-uputmg");
    			add_location(ul3, file$g, 258, 8, 14872);
    			set_style(span5, "background-color", "#64ffda");
    			add_location(span5, file$g, 266, 32, 15747);
    			set_style(h25, "color", "black");
    			attr_dev(h25, "class", "svelte-uputmg");
    			add_location(h25, file$g, 266, 8, 15723);
    			set_style(p6, "color", "black");
    			attr_dev(p6, "class", "svelte-uputmg");
    			add_location(p6, file$g, 267, 8, 15818);
    			add_location(strong21, file$g, 269, 56, 16020);
    			set_style(span6, "background-color", "#90caf9");
    			add_location(span6, file$g, 269, 16, 15980);
    			attr_dev(li12, "class", "svelte-uputmg");
    			add_location(li12, file$g, 269, 12, 15976);
    			add_location(strong22, file$g, 270, 56, 16328);
    			set_style(span7, "background-color", "#ffab91");
    			add_location(span7, file$g, 270, 16, 16288);
    			attr_dev(li13, "class", "svelte-uputmg");
    			add_location(li13, file$g, 270, 12, 16284);
    			add_location(strong23, file$g, 271, 56, 16841);
    			set_style(span8, "background-color", "#ffecb3");
    			add_location(span8, file$g, 271, 16, 16801);
    			attr_dev(li14, "class", "svelte-uputmg");
    			add_location(li14, file$g, 271, 12, 16797);
    			attr_dev(ul4, "class", "svelte-uputmg");
    			add_location(ul4, file$g, 268, 8, 15959);
    			set_style(span9, "background-color", "#64ffda");
    			add_location(span9, file$g, 273, 32, 17129);
    			set_style(h26, "color", "black");
    			attr_dev(h26, "class", "svelte-uputmg");
    			add_location(h26, file$g, 273, 8, 17105);
    			set_style(p7, "color", "black");
    			attr_dev(p7, "class", "svelte-uputmg");
    			add_location(p7, file$g, 274, 8, 17203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, strong0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t2);
    			append_dev(div, a);
    			append_dev(div, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, span0);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t8);
    			append_dev(p0, strong1);
    			append_dev(p0, t10);
    			append_dev(p0, strong2);
    			append_dev(p0, t12);
    			append_dev(p0, strong3);
    			append_dev(p0, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, span1);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t18);
    			append_dev(p1, strong4);
    			append_dev(p1, t20);
    			insert_dev(target, h22, anchor);
    			append_dev(h22, span2);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li5);
    			append_dev(li5, p3);
    			append_dev(p3, t25);
    			append_dev(p3, strong5);
    			append_dev(p3, t27);
    			append_dev(li5, t28);
    			append_dev(li5, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, t29);
    			append_dev(li0, strong6);
    			append_dev(li0, t31);
    			append_dev(ul0, t32);
    			append_dev(ul0, li1);
    			append_dev(li1, t33);
    			append_dev(li1, strong7);
    			append_dev(li1, t35);
    			append_dev(ul0, t36);
    			append_dev(ul0, li2);
    			append_dev(li2, t37);
    			append_dev(li2, strong8);
    			append_dev(li2, t39);
    			append_dev(ul0, t40);
    			append_dev(ul0, li3);
    			append_dev(li3, t41);
    			append_dev(li3, strong9);
    			append_dev(li3, t43);
    			append_dev(ul0, t44);
    			append_dev(ul0, li4);
    			append_dev(li4, t45);
    			append_dev(li4, strong10);
    			append_dev(li4, t47);
    			append_dev(ul1, t48);
    			append_dev(ul1, li6);
    			append_dev(li6, t49);
    			append_dev(li6, strong11);
    			append_dev(li6, t51);
    			append_dev(ul1, t52);
    			append_dev(ul1, li7);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, h23, anchor);
    			append_dev(h23, span3);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t57);
    			append_dev(p4, strong12);
    			append_dev(p4, t59);
    			append_dev(p4, strong13);
    			append_dev(p4, t61);
    			append_dev(p4, strong14);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, h24, anchor);
    			append_dev(h24, span4);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t67, anchor);
    			insert_dev(target, ul3, anchor);
    			append_dev(ul3, li8);
    			append_dev(li8, strong15);
    			append_dev(li8, t69);
    			append_dev(li8, strong16);
    			append_dev(li8, t71);
    			append_dev(ul3, t72);
    			append_dev(ul3, li9);
    			append_dev(li9, strong17);
    			append_dev(li9, t74);
    			append_dev(li9, strong18);
    			append_dev(li9, t76);
    			append_dev(ul3, t77);
    			append_dev(ul3, ul2);
    			append_dev(ul2, li10);
    			append_dev(li10, t78);
    			append_dev(li10, strong19);
    			append_dev(li10, t80);
    			append_dev(ul2, t81);
    			append_dev(ul2, li11);
    			append_dev(li11, t82);
    			append_dev(li11, strong20);
    			append_dev(li11, t84);
    			insert_dev(target, t85, anchor);
    			insert_dev(target, h25, anchor);
    			append_dev(h25, span5);
    			insert_dev(target, t87, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t89, anchor);
    			insert_dev(target, ul4, anchor);
    			append_dev(ul4, li12);
    			append_dev(li12, span6);
    			append_dev(span6, strong21);
    			append_dev(li12, t91);
    			append_dev(ul4, t92);
    			append_dev(ul4, li13);
    			append_dev(li13, span7);
    			append_dev(span7, strong22);
    			append_dev(li13, t94);
    			append_dev(ul4, t95);
    			append_dev(ul4, li14);
    			append_dev(li14, span8);
    			append_dev(span8, strong23);
    			append_dev(li14, t97);
    			insert_dev(target, t98, anchor);
    			insert_dev(target, h26, anchor);
    			append_dev(h26, span9);
    			insert_dev(target, t100, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t102, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(h24);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t67);
    			if (detaching) detach_dev(ul3);
    			if (detaching) detach_dev(t85);
    			if (detaching) detach_dev(h25);
    			if (detaching) detach_dev(t87);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t89);
    			if (detaching) detach_dev(ul4);
    			if (detaching) detach_dev(t98);
    			if (detaching) detach_dev(h26);
    			if (detaching) detach_dev(t100);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t102);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(232:4) <Dialog class=\\\"pa-16 text-center\\\" width='800px' bind:active={infoDialog_Gebruiksaanwijzing}>",
    		ctx
    	});

    	return block;
    }

    // (192:0) <MaterialApp {theme}>
    function create_default_slot$3(ctx) {
    	let div1;
    	let div0;
    	let button0;
    	let t0;
    	let div4;
    	let p0;
    	let strong;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let p4;
    	let t10;
    	let label0;
    	let input0;
    	let input0_checked_value;
    	let t11;
    	let label1;
    	let input1;
    	let input1_checked_value;
    	let t12;
    	let div3;
    	let div2;
    	let button1;
    	let t13;
    	let label2;
    	let input2;
    	let input2_checked_value;
    	let t14;
    	let label3;
    	let input3;
    	let input3_checked_value;
    	let t15;
    	let dialog0;
    	let updating_active;
    	let t16;
    	let dialog1;
    	let updating_active_1;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: {
    				style: "width:465px; position:absolute; top:3px; left:-80px; height: 40px; font-size:25px; transform:scale(0.6); border:2px solid #fff;",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[7]);

    	button1 = new Button({
    			props: {
    				style: "width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[8]);

    	function dialog0_active_binding(value) {
    		/*dialog0_active_binding*/ ctx[9].call(null, value);
    	}

    	let dialog0_props = {
    		class: "pa-16 text-center",
    		width: "1200px",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*infoDialog_KL1*/ ctx[0] !== void 0) {
    		dialog0_props.active = /*infoDialog_KL1*/ ctx[0];
    	}

    	dialog0 = new Dialog({ props: dialog0_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog0, "active", dialog0_active_binding));

    	function dialog1_active_binding(value) {
    		/*dialog1_active_binding*/ ctx[10].call(null, value);
    	}

    	let dialog1_props = {
    		class: "pa-16 text-center",
    		width: "800px",
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*infoDialog_Gebruiksaanwijzing*/ ctx[1] !== void 0) {
    		dialog1_props.active = /*infoDialog_Gebruiksaanwijzing*/ ctx[1];
    	}

    	dialog1 = new Dialog({ props: dialog1_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog1, "active", dialog1_active_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			p0 = element("p");
    			strong = element("strong");
    			strong.textContent = "Kaartlagen";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Bebouwingsdichtheid";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Bouwperiode";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "Bronbudget";
    			t8 = space();
    			p4 = element("p");
    			p4.textContent = "Achtergrondkaart";
    			t10 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t11 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t12 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(button1.$$.fragment);
    			t13 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t14 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t15 = space();
    			create_component(dialog0.$$.fragment);
    			t16 = space();
    			create_component(dialog1.$$.fragment);
    			attr_dev(div0, "class", "text-center");
    			add_location(div0, file$g, 193, 8, 7561);
    			attr_dev(div1, "id", "button_handleiding");
    			set_style(div1, "position", "absolute");
    			set_style(div1, "width", "305px");
    			set_style(div1, "height", "47px");
    			set_style(div1, "top", "70px");
    			set_style(div1, "left", "-200px");
    			set_style(div1, "pointer-events", "all");
    			set_style(div1, "background-color", "#323232");
    			add_location(div1, file$g, 192, 4, 7396);
    			add_location(strong, file$g, 198, 78, 8116);
    			set_style(p0, "position", "absolute");
    			set_style(p0, "font-size", "18px");
    			set_style(p0, "left", "20px");
    			set_style(p0, "top", "20px");
    			attr_dev(p0, "class", "svelte-uputmg");
    			add_location(p0, file$g, 198, 8, 8046);
    			set_style(p1, "position", "absolute");
    			set_style(p1, "font-size", "16px");
    			set_style(p1, "left", "55px");
    			set_style(p1, "top", "108px");
    			attr_dev(p1, "class", "svelte-uputmg");
    			add_location(p1, file$g, 199, 8, 8156);
    			set_style(p2, "position", "absolute");
    			set_style(p2, "font-size", "16px");
    			set_style(p2, "left", "55px");
    			set_style(p2, "top", "148px");
    			attr_dev(p2, "class", "svelte-uputmg");
    			add_location(p2, file$g, 200, 8, 8259);
    			set_style(p3, "position", "absolute");
    			set_style(p3, "font-size", "16px");
    			set_style(p3, "left", "55px");
    			set_style(p3, "top", "68px");
    			attr_dev(p3, "class", "svelte-uputmg");
    			add_location(p3, file$g, 201, 8, 8354);
    			set_style(p4, "position", "absolute");
    			set_style(p4, "font-size", "16px");
    			set_style(p4, "left", "55px");
    			set_style(p4, "top", "188px");
    			attr_dev(p4, "class", "svelte-uputmg");
    			add_location(p4, file$g, 203, 8, 8568);
    			input0.checked = input0_checked_value = /*selected*/ ctx[2] === 30;
    			attr_dev(input0, "type", "radio");
    			set_style(input0, "position", "absolute");
    			set_style(input0, "left", "25px");
    			set_style(input0, "top", "70px");
    			attr_dev(input0, "name", "amount");
    			input0.value = "d02";
    			attr_dev(input0, "class", "svelte-uputmg");
    			add_location(input0, file$g, 206, 12, 8804);
    			add_location(label0, file$g, 205, 8, 8784);
    			input1.checked = input1_checked_value = /*selected*/ ctx[2] === "dichtheid";
    			attr_dev(input1, "type", "radio");
    			set_style(input1, "position", "absolute");
    			set_style(input1, "left", "25px");
    			set_style(input1, "top", "110px");
    			attr_dev(input1, "name", "amount");
    			input1.value = "dichtheid";
    			attr_dev(input1, "class", "svelte-uputmg");
    			add_location(input1, file$g, 209, 12, 8992);
    			attr_dev(div2, "class", "text-center");
    			add_location(div2, file$g, 211, 16, 9235);
    			set_style(div3, "position", "absolute");
    			set_style(div3, "top", "66px");
    			set_style(div3, "left", "215px");
    			add_location(div3, file$g, 210, 12, 9164);
    			add_location(label1, file$g, 208, 8, 8972);
    			input2.checked = input2_checked_value = /*selected*/ ctx[2] === 20;
    			attr_dev(input2, "type", "radio");
    			set_style(input2, "position", "absolute");
    			set_style(input2, "left", "25px");
    			set_style(input2, "top", "150px");
    			attr_dev(input2, "name", "amount");
    			input2.value = "bouwperiode";
    			attr_dev(input2, "class", "svelte-uputmg");
    			add_location(input2, file$g, 217, 12, 9526);
    			add_location(label2, file$g, 216, 8, 9506);
    			input3.checked = input3_checked_value = /*selected*/ ctx[2] === 40;
    			attr_dev(input3, "type", "radio");
    			set_style(input3, "position", "absolute");
    			set_style(input3, "left", "25px");
    			set_style(input3, "top", "190px");
    			attr_dev(input3, "name", "amount");
    			input3.value = "nothing";
    			attr_dev(input3, "class", "svelte-uputmg");
    			add_location(input3, file$g, 220, 12, 9723);
    			add_location(label3, file$g, 219, 8, 9703);
    			attr_dev(div4, "id", "mapcontext_radiobuttons");
    			set_style(div4, "position", "absolute");
    			set_style(div4, "width", "305px");
    			set_style(div4, "height", "285px");
    			set_style(div4, "top", "120px");
    			set_style(div4, "left", "-200px");
    			set_style(div4, "pointer-events", "all");
    			set_style(div4, "background-color", "#323232");
    			add_location(div4, file$g, 197, 4, 7874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, p0);
    			append_dev(p0, strong);
    			append_dev(div4, t2);
    			append_dev(div4, p1);
    			append_dev(div4, t4);
    			append_dev(div4, p2);
    			append_dev(div4, t6);
    			append_dev(div4, p3);
    			append_dev(div4, t8);
    			append_dev(div4, p4);
    			append_dev(div4, t10);
    			append_dev(div4, label0);
    			append_dev(label0, input0);
    			append_dev(div4, t11);
    			append_dev(div4, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t12);
    			append_dev(label1, div3);
    			append_dev(div3, div2);
    			mount_component(button1, div2, null);
    			append_dev(div4, t13);
    			append_dev(div4, label2);
    			append_dev(label2, input2);
    			append_dev(div4, t14);
    			append_dev(div4, label3);
    			append_dev(label3, input3);
    			insert_dev(target, t15, anchor);
    			mount_component(dialog0, target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(dialog1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*onChange*/ ctx[6], false, false, false),
    					listen_dev(input1, "change", /*onChange*/ ctx[6], false, false, false),
    					listen_dev(input2, "change", /*onChange*/ ctx[6], false, false, false),
    					listen_dev(input3, "change", /*onChange*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (!current || dirty & /*selected*/ 4 && input0_checked_value !== (input0_checked_value = /*selected*/ ctx[2] === 30)) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (!current || dirty & /*selected*/ 4 && input1_checked_value !== (input1_checked_value = /*selected*/ ctx[2] === "dichtheid")) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}

    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (!current || dirty & /*selected*/ 4 && input2_checked_value !== (input2_checked_value = /*selected*/ ctx[2] === 20)) {
    				prop_dev(input2, "checked", input2_checked_value);
    			}

    			if (!current || dirty & /*selected*/ 4 && input3_checked_value !== (input3_checked_value = /*selected*/ ctx[2] === 40)) {
    				prop_dev(input3, "checked", input3_checked_value);
    			}

    			const dialog0_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				dialog0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*infoDialog_KL1*/ 1) {
    				updating_active = true;
    				dialog0_changes.active = /*infoDialog_KL1*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			dialog0.$set(dialog0_changes);
    			const dialog1_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				dialog1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_1 && dirty & /*infoDialog_Gebruiksaanwijzing*/ 2) {
    				updating_active_1 = true;
    				dialog1_changes.active = /*infoDialog_Gebruiksaanwijzing*/ ctx[1];
    				add_flush_callback(() => updating_active_1 = false);
    			}

    			dialog1.$set(dialog1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(dialog0.$$.fragment, local);
    			transition_in(dialog1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(dialog0.$$.fragment, local);
    			transition_out(dialog1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			destroy_component(button1);
    			if (detaching) detach_dev(t15);
    			destroy_component(dialog0, detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(dialog1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(192:0) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[3],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, infoDialog_Gebruiksaanwijzing, infoDialog_KL1, selected*/ 8388615) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputPanel", slots, []);
    	var aant_weq_curr_select;

    	store_selectie_weq.subscribe(value => {
    		aant_weq_curr_select = value;
    	});

    	var lengte_transportleiding_current;

    	store_instelling_lengtetransportleiding.subscribe(value => {
    		lengte_transportleiding_current = value;
    	});

    	var sliderpanel_transportnet_kostenkental_current;

    	store_instelling_kostenkentaltransportnet.subscribe(value => {
    		sliderpanel_transportnet_kostenkental_current = value;
    	});

    	var buurtselectie_array;

    	store_selectie_buurtcodes.subscribe(value => {
    		buurtselectie_array = value;
    	});

    	store_input_primarydataset_raw.subscribe(value => {
    		data = value;
    	});

    	// import { store_instelling_kleurselectieswitch } from "./stores.js";
    	// var instelling_kleurselectieswitch = true;
    	// $: if (instelling_kleurselectieswitch) {adapt_opacity(0.4)} else {adapt_opacity(0)}
    	// $: store_instelling_kleurselectieswitch.update((n) => instelling_kleurselectieswitch);
    	var sliderpanel_active = false;

    	var data = 0;
    	var svg_top;
    	let theme = "light";
    	var cnt;
    	let infoDialog_KL1;

    	function open_iD_KL1() {
    		$$invalidate(0, infoDialog_KL1 = true);
    	}

    	function close_iD_KL1() {
    		$$invalidate(0, infoDialog_KL1 = false);
    	}

    	let infoDialog_Gebruiksaanwijzing;

    	function open_iD_Gebruiksaanwijzing() {
    		$$invalidate(1, infoDialog_Gebruiksaanwijzing = true);
    	}

    	function close_iD_Gebruiksaanwijzing() {
    		$$invalidate(1, infoDialog_Gebruiksaanwijzing = false);
    	}

    	onMount(() => {
    		d3.selectAll("#InputPanel .s-app-bar__wrapper").style("background", "transparent");
    		svg_top = d3.select("#InputPanel").append("svg").style("position", "absolute").style("pointer-events", "none").style("top", "0px").style("width", "100%").attr("height", 70).style("opacity", 1);
    		redraw_topbar();
    	});

    	window.redraw_topbar = () => {
    		d3.selectAll(".topbaritem").remove();
    		var topbarcolor = "#323232";
    		svg_top.append("rect").attr("x", 3).attr("y", 3).attr("fill", topbarcolor).attr("width", 305).attr("height", 64).attr("class", "topbaritem");
    		svg_top.append("svg:image").attr("xlink:href", "img/scale.png").attr("x", 20).attr("y", 16 - 1).style("opacity", 1).attr("width", 40).attr("height", 40);
    		svg_top.append("text").attr("class", "topbaritem").style("color", "#fff").text("WARMTEWEEGSCHAAL").style("font-family", "Varela Round").style("font-size", 17 + "px").style("font-weight", 800).attr("x", 19 + 60).attr("y", 29 + 7 - 6); // teken text op horizontale labels
    		svg_top.append("text").attr("class", "topbaritem").style("color", "#ffab91").text("warmtenet").style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400).attr("x", 19 + 60).attr("y", 53 + 7 - 6 - 3); // teken text op horizontale labels
    		svg_top.append("text").attr("class", "topbaritem").style("color", "#fff").text("vs.").style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400).attr("x", 19 + 98 + 60 - 6).attr("y", 53 + 7 - 6 - 3); // teken text op horizontale labels
    		svg_top.append("text").attr("class", "topbaritem").style("color", "#90caf9").text("all-electric").style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400).attr("x", 19 + 125 + 60).attr("y", 53 + 7 - 6 - 3); // teken text op horizontale labels
    	};

    	window.unfold_sliderpanel = () => {
    		if (!sliderpanel_active) {
    			sliderpanel_active = true;
    			d3.select("#SliderPanel").transition().duration(1000).style("top", "40px");
    			d3.select("#OutputPanel").transition().duration(1000).style("bottom", "0px");
    			d3.select("#LegendaPanel").transition().duration(1000).style("bottom", "0px");
    		}
    	};

    	window.recalculate_all = () => {
    		if (data != 0) {
    			var totaalinvestering_transportnet = lengte_transportleiding_current * sliderpanel_transportnet_kostenkental_current;
    			var totaalinvestering_transportnet_per_weq = totaalinvestering_transportnet / aant_weq_curr_select;
    			var kapitaalslasten_transportnet_per_weq = Math.abs(PMT(0.03, 30, totaalinvestering_transportnet_per_weq, 0, 0));
    			store_tussenresultaat_kapitaalslasten_transportnet.update(n => kapitaalslasten_transportnet_per_weq);

    			for (cnt = 0; cnt < data.features.length; cnt++) {
    				if (buurtselectie_array.indexOf(data.features[cnt].properties.BU_CODE) >= 0) {
    					recalculate_results(data.features[cnt].properties);
    					color_buurten(cnt, data.features[cnt].properties.BU_CODE);
    				} else {
    					d3.select("#" + data.features[cnt].properties.BU_CODE).attr("fill", function () {
    						return get_color_D02(parseInt(data.features[cnt].properties.D02));
    					}).style("opacity", 0.6);
    				}
    			}

    			update_boxchartdata();

    			if (flag_racechart_active) {
    				draw_racechart();
    			}

    			redraw_donutChart();
    		}
    	};

    	// SLIDER S2: GJ-tarief
    	let slider_s2_gjtarief = [300];

    	function change_s2_gjtarief() {
    		recalculate_all();
    		redraw_donutChart();
    	}

    	let selected = "dichtheid";
    	store_instelling_mapcontextswitch.update(n => selected); //init

    	function onChange(event) {
    		$$invalidate(2, selected = event.currentTarget.value);
    		store_instelling_mapcontextswitch.update(n => event.currentTarget.value);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputPanel> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, infoDialog_Gebruiksaanwijzing = true);
    	const click_handler_1 = () => $$invalidate(0, infoDialog_KL1 = true);

    	function dialog0_active_binding(value) {
    		infoDialog_KL1 = value;
    		$$invalidate(0, infoDialog_KL1);
    	}

    	function dialog1_active_binding(value) {
    		infoDialog_Gebruiksaanwijzing = value;
    		$$invalidate(1, infoDialog_Gebruiksaanwijzing);
    	}

    	$$self.$capture_state = () => ({
    		store_input_primarydataset_raw,
    		store_instelling_gjtarief,
    		Switch,
    		MaterialApp,
    		Button,
    		Dialog,
    		store_selectie_weq,
    		aant_weq_curr_select,
    		store_instelling_lengtetransportleiding,
    		lengte_transportleiding_current,
    		store_tussenresultaat_kapitaalslasten_transportnet,
    		store_instelling_kostenkentaltransportnet,
    		sliderpanel_transportnet_kostenkental_current,
    		store_selectie_buurtcodes,
    		buurtselectie_array,
    		store_instelling_mapcontextswitch,
    		sliderpanel_active,
    		data,
    		svg_top,
    		theme,
    		cnt,
    		infoDialog_KL1,
    		open_iD_KL1,
    		close_iD_KL1,
    		infoDialog_Gebruiksaanwijzing,
    		open_iD_Gebruiksaanwijzing,
    		close_iD_Gebruiksaanwijzing,
    		onMount,
    		slider_s2_gjtarief,
    		change_s2_gjtarief,
    		selected,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("aant_weq_curr_select" in $$props) aant_weq_curr_select = $$props.aant_weq_curr_select;
    		if ("lengte_transportleiding_current" in $$props) lengte_transportleiding_current = $$props.lengte_transportleiding_current;
    		if ("sliderpanel_transportnet_kostenkental_current" in $$props) sliderpanel_transportnet_kostenkental_current = $$props.sliderpanel_transportnet_kostenkental_current;
    		if ("buurtselectie_array" in $$props) buurtselectie_array = $$props.buurtselectie_array;
    		if ("sliderpanel_active" in $$props) sliderpanel_active = $$props.sliderpanel_active;
    		if ("data" in $$props) data = $$props.data;
    		if ("svg_top" in $$props) svg_top = $$props.svg_top;
    		if ("theme" in $$props) $$invalidate(3, theme = $$props.theme);
    		if ("cnt" in $$props) cnt = $$props.cnt;
    		if ("infoDialog_KL1" in $$props) $$invalidate(0, infoDialog_KL1 = $$props.infoDialog_KL1);
    		if ("infoDialog_Gebruiksaanwijzing" in $$props) $$invalidate(1, infoDialog_Gebruiksaanwijzing = $$props.infoDialog_Gebruiksaanwijzing);
    		if ("slider_s2_gjtarief" in $$props) $$invalidate(21, slider_s2_gjtarief = $$props.slider_s2_gjtarief);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 store_instelling_gjtarief.update(n => slider_s2_gjtarief);
    	 change_s2_gjtarief();

    	return [
    		infoDialog_KL1,
    		infoDialog_Gebruiksaanwijzing,
    		selected,
    		theme,
    		close_iD_KL1,
    		close_iD_Gebruiksaanwijzing,
    		onChange,
    		click_handler,
    		click_handler_1,
    		dialog0_active_binding,
    		dialog1_active_binding
    	];
    }

    class InputPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputPanel",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/SliderPanel.svelte generated by Svelte v3.32.1 */
    const file$h = "src/SliderPanel.svelte";

    // (68:20) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL1 = true)}>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(68:20) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL1 = true)}>",
    		ctx
    	});

    	return block;
    }

    // (81:24) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL2 = true)}>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(81:24) <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL2 = true)}>",
    		ctx
    	});

    	return block;
    }

    // (90:8) <Button on:click={close_iD_SL1} text class="black-text" style='margin-top:30px;border:1px solid #333;'>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("OK");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(90:8) <Button on:click={close_iD_SL1} text class=\\\"black-text\\\" style='margin-top:30px;border:1px solid #333;'>",
    		ctx
    	});

    	return block;
    }

    // (87:4) <Dialog class="pa-16 text-center" width='1200px' bind:active={infoDialog_SL1}>
    function create_default_slot_3$1(ctx) {
    	let p;
    	let strong;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				class: "black-text",
    				style: "margin-top:30px;border:1px solid #333;",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*close_iD_SL1*/ ctx[5]);

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bestedingsruimte warmtebron";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			create_component(button.$$.fragment);
    			add_location(strong, file$h, 87, 47, 5587);
    			set_style(p, "color", "black");
    			set_style(p, "font-size", "30px");
    			add_location(p, file$h, 87, 8, 5548);
    			set_style(img, "z-index", "90000");
    			if (img.src !== (img_src_value = "img/bestedingsruimte_warmtenet.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "icon");
    			attr_dev(img, "width", "1100");
    			attr_dev(img, "height", "630");
    			add_location(img, file$h, 88, 8, 5644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(87:4) <Dialog class=\\\"pa-16 text-center\\\" width='1200px' bind:active={infoDialog_SL1}>",
    		ctx
    	});

    	return block;
    }

    // (98:8) <Button on:click={close_iD_SL2} text class="black-text" style='margin-top:30px;border:1px solid #333;'>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("OK");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(98:8) <Button on:click={close_iD_SL2} text class=\\\"black-text\\\" style='margin-top:30px;border:1px solid #333;'>",
    		ctx
    	});

    	return block;
    }

    // (92:4) <Dialog class="pa-16 text-center" width='800px' bind:active={infoDialog_SL2}>
    function create_default_slot_1$2(ctx) {
    	let p0;
    	let t1;
    	let div;
    	let t2;
    	let p1;
    	let t4;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				class: "black-text",
    				style: "margin-top:30px;border:1px solid #333;",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*close_iD_SL2*/ ctx[6]);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "This is Dialog 2";
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Content";
    			t4 = space();
    			create_component(button.$$.fragment);
    			set_style(p0, "color", "black");
    			add_location(p0, file$h, 92, 8, 5979);
    			set_style(div, "position", "static");
    			set_style(div, "right", "20px");
    			set_style(div, "height", "20px");
    			set_style(div, "background-color", "#333");
    			add_location(div, file$h, 93, 8, 6031);
    			set_style(p1, "color", "black");
    			add_location(p1, file$h, 94, 8, 6124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(92:4) <Dialog class=\\\"pa-16 text-center\\\" width='800px' bind:active={infoDialog_SL2}>",
    		ctx
    	});

    	return block;
    }

    // (57:0) <MaterialApp {theme}>
    function create_default_slot$4(ctx) {
    	let div12;
    	let div5;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let p0;
    	let strong0;
    	let t3;
    	let strong1;
    	let t4_value = Math.round(/*slider_s2_gjtarief*/ ctx[0] / 10) * 10 / 100 + "";
    	let t4;
    	let t5;
    	let t6;
    	let div4;
    	let slider0;
    	let updating_value;
    	let t7;
    	let div3;
    	let div2;
    	let button0;
    	let t8;
    	let div11;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let p1;
    	let strong2;
    	let t12;
    	let strong3;
    	let t13;
    	let t14;
    	let t15;
    	let div10;
    	let slider1;
    	let updating_value_1;
    	let t16;
    	let div9;
    	let div8;
    	let button1;
    	let t17;
    	let dialog0;
    	let updating_active;
    	let t18;
    	let dialog1;
    	let updating_active_1;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[7].call(null, value);
    	}

    	let slider0_props = { min: 0, max: 3000, color: "white" };

    	if (/*slider_s2_gjtarief*/ ctx[0] !== void 0) {
    		slider0_props.value = /*slider_s2_gjtarief*/ ctx[0];
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, "value", slider0_value_binding));

    	button0 = new Button({
    			props: {
    				style: "width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;",
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[8]);

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[9].call(null, value);
    	}

    	let slider1_props = { min: 500, max: 3000, color: "white" };

    	if (/*slider_s2_transport*/ ctx[1] !== void 0) {
    		slider1_props.value = /*slider_s2_transport*/ ctx[1];
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, "value", slider1_value_binding));

    	button1 = new Button({
    			props: {
    				style: "width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[10]);

    	function dialog0_active_binding(value) {
    		/*dialog0_active_binding*/ ctx[11].call(null, value);
    	}

    	let dialog0_props = {
    		class: "pa-16 text-center",
    		width: "1200px",
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	};

    	if (/*infoDialog_SL1*/ ctx[2] !== void 0) {
    		dialog0_props.active = /*infoDialog_SL1*/ ctx[2];
    	}

    	dialog0 = new Dialog({ props: dialog0_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog0, "active", dialog0_active_binding));

    	function dialog1_active_binding(value) {
    		/*dialog1_active_binding*/ ctx[12].call(null, value);
    	}

    	let dialog1_props = {
    		class: "pa-16 text-center",
    		width: "800px",
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	};

    	if (/*infoDialog_SL2*/ ctx[3] !== void 0) {
    		dialog1_props.active = /*infoDialog_SL2*/ ctx[3];
    	}

    	dialog1 = new Dialog({ props: dialog1_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog1, "active", dialog1_active_binding));

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Bronkosten:";
    			t3 = text("    ");
    			strong1 = element("strong");
    			t4 = text(t4_value);
    			t5 = text(" €/GJ");
    			t6 = space();
    			div4 = element("div");
    			create_component(slider0.$$.fragment);
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(button0.$$.fragment);
    			t8 = space();
    			div11 = element("div");
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			p1 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Transportkosten:";
    			t12 = text("    ");
    			strong3 = element("strong");
    			t13 = text(/*slider_s2_transport*/ ctx[1]);
    			t14 = text(" €/m");
    			t15 = space();
    			div10 = element("div");
    			create_component(slider1.$$.fragment);
    			t16 = space();
    			div9 = element("div");
    			div8 = element("div");
    			create_component(button1.$$.fragment);
    			t17 = space();
    			create_component(dialog0.$$.fragment);
    			t18 = space();
    			create_component(dialog1.$$.fragment);
    			set_style(div0, "position", "absolute");
    			set_style(div0, "height", "100%");
    			set_style(div0, "width", "125px");
    			set_style(div0, "background-color", "#323232");
    			set_style(div0, "border-radius", "00px 0px 0px 0px");
    			add_location(div0, file$h, 60, 8, 3083);
    			set_style(div1, "position", "absolute");
    			set_style(div1, "height", "100%");
    			set_style(div1, "left", "125px");
    			set_style(div1, "width", "90px");
    			set_style(div1, "background-color", "#24242");
    			set_style(div1, "border-radius", "0px 0px 0px 0px");
    			add_location(div1, file$h, 61, 8, 3216);
    			add_location(strong0, file$h, 62, 74, 3424);
    			add_location(strong1, file$h, 62, 114, 3464);
    			set_style(p0, "color", "white");
    			set_style(p0, "position", "absolute");
    			set_style(p0, "top", "21px");
    			set_style(p0, "left", "25px");
    			add_location(p0, file$h, 62, 8, 3358);
    			attr_dev(div2, "class", "text-center");
    			add_location(div2, file$h, 66, 16, 3806);
    			set_style(div3, "position", "absolute");
    			set_style(div3, "top", "0px");
    			set_style(div3, "right", "-73px");
    			add_location(div3, file$h, 65, 12, 3735);
    			attr_dev(div4, "id", "warmteslider_kern");
    			set_style(div4, "position", "absolute");
    			set_style(div4, "top", "15px");
    			set_style(div4, "left", "240px");
    			set_style(div4, "width", "0px");
    			add_location(div4, file$h, 63, 8, 3542);
    			attr_dev(div5, "id", "slider_container_warmte");
    			set_style(div5, "border-style", "solid");
    			set_style(div5, "box-shadow", "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)");
    			set_style(div5, "border-color", "black");
    			set_style(div5, "border-width", "0px");
    			set_style(div5, "top", "10px");
    			set_style(div5, "height", "64px");
    			set_style(div5, "width", "500px");
    			set_style(div5, "position", "absolute");
    			set_style(div5, "left", "5px");
    			set_style(div5, "margin-right", "5px");
    			set_style(div5, "margin-bottom", "10px");
    			set_style(div5, "background-color", "#323232");
    			set_style(div5, "border-radius", "0px");
    			add_location(div5, file$h, 59, 4, 2753);
    			set_style(div6, "position", "absolute");
    			set_style(div6, "height", "100%");
    			set_style(div6, "width", "110px");
    			set_style(div6, "background-color", "#323232 border-radius:0px 0px 0px 0px");
    			add_location(div6, file$h, 73, 8, 4419);
    			set_style(div7, "position", "absolute");
    			set_style(div7, "height", "100%");
    			set_style(div7, "left", "110px");
    			set_style(div7, "width", "100px");
    			set_style(div7, "background-color", "#24242");
    			set_style(div7, "border-radius", "0px 0px 0px 0px");
    			add_location(div7, file$h, 74, 12, 4554);
    			add_location(strong2, file$h, 75, 78, 4767);
    			add_location(strong3, file$h, 75, 123, 4812);
    			set_style(p1, "color", "white");
    			set_style(p1, "position", "absolute");
    			set_style(p1, "top", "21px");
    			set_style(p1, "left", "25px");
    			add_location(p1, file$h, 75, 12, 4701);
    			attr_dev(div8, "class", "text-center");
    			add_location(div8, file$h, 79, 20, 5154);
    			set_style(div9, "position", "absolute");
    			set_style(div9, "top", "0px");
    			set_style(div9, "right", "-73px");
    			add_location(div9, file$h, 78, 16, 5079);
    			attr_dev(div10, "id", "transportslider_kern");
    			set_style(div10, "position", "absolute");
    			set_style(div10, "top", "15px");
    			set_style(div10, "left", "240px");
    			set_style(div10, "width", "0px");
    			add_location(div10, file$h, 76, 12, 4872);
    			attr_dev(div11, "id", "slider_container_transport");
    			set_style(div11, "border-style", "solid");
    			set_style(div11, "left", "530px");
    			set_style(div11, "box-shadow", "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)");
    			set_style(div11, "border-color", "black");
    			set_style(div11, "border-width", "0px");
    			set_style(div11, "top", "-75px");
    			set_style(div11, "height", "64px");
    			set_style(div11, "width", "500px");
    			set_style(div11, "position", "absolute");
    			set_style(div11, "margin-right", "5px");
    			set_style(div11, "margin-bottom", "10px");
    			set_style(div11, "background-color", "#323232");
    			set_style(div11, "border-radius", "0px");
    			add_location(div11, file$h, 72, 4, 4082);
    			attr_dev(div12, "id", "sliderpanel_containerdiv");
    			set_style(div12, "position", "absolute");
    			set_style(div12, "top", "-47px");
    			set_style(div12, "height", "80px");
    			set_style(div12, "left", "60px");
    			set_style(div12, "pointer-events", "all");
    			set_style(div12, "background-color", "none");
    			add_location(div12, file$h, 58, 4, 2607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div5);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div5, t1);
    			append_dev(div5, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t3);
    			append_dev(p0, strong1);
    			append_dev(strong1, t4);
    			append_dev(strong1, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			mount_component(slider0, div4, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(button0, div2, null);
    			append_dev(div12, t8);
    			append_dev(div12, div11);
    			append_dev(div11, div6);
    			append_dev(div11, t9);
    			append_dev(div11, div7);
    			append_dev(div11, t10);
    			append_dev(div11, p1);
    			append_dev(p1, strong2);
    			append_dev(p1, t12);
    			append_dev(p1, strong3);
    			append_dev(strong3, t13);
    			append_dev(strong3, t14);
    			append_dev(div11, t15);
    			append_dev(div11, div10);
    			mount_component(slider1, div10, null);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			mount_component(button1, div8, null);
    			insert_dev(target, t17, anchor);
    			mount_component(dialog0, target, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(dialog1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*slider_s2_gjtarief*/ 1) && t4_value !== (t4_value = Math.round(/*slider_s2_gjtarief*/ ctx[0] / 10) * 10 / 100 + "")) set_data_dev(t4, t4_value);
    			const slider0_changes = {};

    			if (!updating_value && dirty & /*slider_s2_gjtarief*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*slider_s2_gjtarief*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			if (!current || dirty & /*slider_s2_transport*/ 2) set_data_dev(t13, /*slider_s2_transport*/ ctx[1]);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty & /*slider_s2_transport*/ 2) {
    				updating_value_1 = true;
    				slider1_changes.value = /*slider_s2_transport*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const dialog0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				dialog0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*infoDialog_SL1*/ 4) {
    				updating_active = true;
    				dialog0_changes.active = /*infoDialog_SL1*/ ctx[2];
    				add_flush_callback(() => updating_active = false);
    			}

    			dialog0.$set(dialog0_changes);
    			const dialog1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				dialog1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_1 && dirty & /*infoDialog_SL2*/ 8) {
    				updating_active_1 = true;
    				dialog1_changes.active = /*infoDialog_SL2*/ ctx[3];
    				add_flush_callback(() => updating_active_1 = false);
    			}

    			dialog1.$set(dialog1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(dialog0.$$.fragment, local);
    			transition_in(dialog1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(dialog0.$$.fragment, local);
    			transition_out(dialog1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_component(slider0);
    			destroy_component(button0);
    			destroy_component(slider1);
    			destroy_component(button1);
    			if (detaching) detach_dev(t17);
    			destroy_component(dialog0, detaching);
    			if (detaching) detach_dev(t18);
    			destroy_component(dialog1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(57:0) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[4],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, infoDialog_SL2, infoDialog_SL1, slider_s2_transport, slider_s2_gjtarief*/ 131087) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SliderPanel", slots, []);
    	let slider_s2_gjtarief = [1000];

    	function change_s2_gjtarief() {
    		recalculate_all();
    	}

    	// SLIDER S2: transport
    	let slider_s2_transport = [1000];

    	function change_s2_transport() {
    		recalculate_all();
    	}

    	window.resize_sliderpanel = () => {
    		var titlewidth = 282 + 25;
    		var logowidth = 305;
    		var sliderlabel_width = 130;
    		var slidervalue_width = 140;
    		var individual_slider_width = (window.innerWidth - titlewidth - logowidth) / 2;
    		d3.select("#sliderpanel_containerdiv").style("width", window.innerWidth - titlewidth - logowidth + "px");
    		d3.select("#sliderpanel_containerdiv").style("left", titlewidth + "px");
    		d3.select("#slider_container_warmte").style("left", 5 + "px");
    		d3.select("#slider_container_warmte").style("width", individual_slider_width + "px");
    		d3.select("#warmteslider_kern").style("width", individual_slider_width - sliderlabel_width - slidervalue_width - 50 + "px");
    		d3.select("#slider_container_transport").style("left", 5 + individual_slider_width + 5 + "px");
    		d3.select("#slider_container_transport").style("width", individual_slider_width - 15 + "px");
    		d3.select("#transportslider_kern").style("width", individual_slider_width - sliderlabel_width - slidervalue_width - 65 + "px");
    	};

    	let theme = "light";
    	let infoDialog_SL1;

    	function open_iD_SL1() {
    		$$invalidate(2, infoDialog_SL1 = true);
    	}

    	function close_iD_SL1() {
    		$$invalidate(2, infoDialog_SL1 = false);
    	}

    	let infoDialog_SL2;

    	function open_iD_SL2() {
    		$$invalidate(3, infoDialog_SL2 = true);
    	}

    	function close_iD_SL2() {
    		$$invalidate(3, infoDialog_SL2 = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SliderPanel> was created with unknown prop '${key}'`);
    	});

    	function slider0_value_binding(value) {
    		slider_s2_gjtarief = value;
    		$$invalidate(0, slider_s2_gjtarief);
    	}

    	const click_handler = () => $$invalidate(2, infoDialog_SL1 = true);

    	function slider1_value_binding(value) {
    		slider_s2_transport = value;
    		$$invalidate(1, slider_s2_transport);
    	}

    	const click_handler_1 = () => $$invalidate(3, infoDialog_SL2 = true);

    	function dialog0_active_binding(value) {
    		infoDialog_SL1 = value;
    		$$invalidate(2, infoDialog_SL1);
    	}

    	function dialog1_active_binding(value) {
    		infoDialog_SL2 = value;
    		$$invalidate(3, infoDialog_SL2);
    	}

    	$$self.$capture_state = () => ({
    		store_instelling_gjtarief,
    		Slider,
    		MaterialApp,
    		Button,
    		Dialog,
    		store_instelling_kostenkentaltransportnet,
    		slider_s2_gjtarief,
    		change_s2_gjtarief,
    		slider_s2_transport,
    		change_s2_transport,
    		theme,
    		infoDialog_SL1,
    		open_iD_SL1,
    		close_iD_SL1,
    		infoDialog_SL2,
    		open_iD_SL2,
    		close_iD_SL2
    	});

    	$$self.$inject_state = $$props => {
    		if ("slider_s2_gjtarief" in $$props) $$invalidate(0, slider_s2_gjtarief = $$props.slider_s2_gjtarief);
    		if ("slider_s2_transport" in $$props) $$invalidate(1, slider_s2_transport = $$props.slider_s2_transport);
    		if ("theme" in $$props) $$invalidate(4, theme = $$props.theme);
    		if ("infoDialog_SL1" in $$props) $$invalidate(2, infoDialog_SL1 = $$props.infoDialog_SL1);
    		if ("infoDialog_SL2" in $$props) $$invalidate(3, infoDialog_SL2 = $$props.infoDialog_SL2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slider_s2_gjtarief*/ 1) {
    			 store_instelling_gjtarief.update(n => slider_s2_gjtarief);
    		}

    		if ($$self.$$.dirty & /*slider_s2_gjtarief*/ 1) {
    			 change_s2_gjtarief();
    		}

    		if ($$self.$$.dirty & /*slider_s2_transport*/ 2) {
    			 store_instelling_kostenkentaltransportnet.update(n => slider_s2_transport);
    		}

    		if ($$self.$$.dirty & /*slider_s2_transport*/ 2) {
    			 change_s2_transport();
    		}
    	};

    	return [
    		slider_s2_gjtarief,
    		slider_s2_transport,
    		infoDialog_SL1,
    		infoDialog_SL2,
    		theme,
    		close_iD_SL1,
    		close_iD_SL2,
    		slider0_value_binding,
    		click_handler,
    		slider1_value_binding,
    		click_handler_1,
    		dialog0_active_binding,
    		dialog1_active_binding
    	];
    }

    class SliderPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SliderPanel",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    // Material Design Icons v5.9.55
    var mdiArrowUpDropCircle = "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M17,14L12,9L7,14H17Z";

    /* src/RaceChart.svelte generated by Svelte v3.32.1 */

    function create_fragment$m(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RaceChart", slots, []);
    	var buurtnamen_current;

    	store_selectie_buurtnamen.subscribe(value => {
    		buurtnamen_current = value;
    	});

    	var data_wa_h17;

    	store_visualisatiedataset_racechart.subscribe(value => {
    		data_wa_h17 = value;
    	});

    	var data_gemeenten;

    	store_input_primarydataset_raw.subscribe(value => {
    		data_gemeenten = value;
    	});

    	var myElementToCheckIfClicksAreInsideOf = document.querySelector("#OutputPanel");

    	// Listen for click events on body
    	document.body.addEventListener("click", function (event) {
    		if (myElementToCheckIfClicksAreInsideOf.contains(event.target)) {
    			draw_racechart();
    			donutChartChange_bouwperiode(donutdata_bouwperiode_log);
    			donutChartChange_woningtype(donutdata_woningtype_log);
    			donutChartChange_weq(donutdata_weq_log);
    		} // do nothing
    	});

    	onMount(() => {
    		svg_RaceChart = d3.select("#RaceChartDiv").style("background-color", "#fff").append("svg").attr("width", 500).attr("height", 300);
    		svg_BuurtTitle = d3.select("#BuurtTitleDiv").style("background-color", "#fff").append("svg").attr("width", 500).attr("height", 60);
    		flag_racechart_active = true;
    	});

    	//global vars
    	var data_runchart = [
    		{
    			name: "dummy",
    			value: 1,
    			color: "#f00",
    			rank: 0
    		}
    	];

    	var top_n = 12;
    	var height = 600;
    	var width = 450;
    	const margin = { top: 20, right: 0, bottom: 4, left: 20 };
    	let barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);
    	var svg_RaceChart;
    	var svg_BuurtTitle;
    	let x = d3.scaleLinear().domain([0, d3.max(data_runchart, d => d.value)]).range([margin.left, width - margin.right - 65]);
    	let y = d3.scaleLinear().domain([top_n, 0]).range([height - margin.bottom, margin.top]);
    	let xAxis = d3.axisTop().scale(x).ticks(width > 500 ? 5 : 2).tickSize(-(height - margin.top - margin.bottom)).tickFormat(d => d3.format(",")(d));
    	var tickDuration = 200;

    	window.draw_racechart = buurt => {
    		var i;

    		for (i = 0; i < data_gemeenten.features.length; i++) {
    			if (data_gemeenten.features[i].properties.BU_CODE == buurt) {
    				data_gemeenten.features[i].properties;
    			}
    		}

    		let colors = {
    			s1a: "#90caf9",
    			s2c: "#ffecb3",
    			s2f: "#ffab91"
    		};

    		let translate_title = {
    			s1a: "All-electric (B+)",
    			s2c: "Warmtenet (B+)",
    			s2f: "Warmtenet (D+)"
    		};

    		var value = data_wa_h17;
    		var data_runchart = [];
    		var i;

    		for (i = 0; i < value.length; i++) {
    			data_runchart.push({
    				name: translate_title[value[i].strat],
    				value: value[i].h17,
    				color: colors[value[i].strat],
    				rank: i
    			});
    		}

    		var yearSlice = data_runchart;
    		var max_dynamic = d3.max(data_runchart, d => d.value);
    		x.domain([0, max_dynamic]);

    		// x.domain([0, 800]);
    		let bars = svg_RaceChart.selectAll(".bar").data(yearSlice, d => d.name);

    		bars.enter().append("rect").attr("class", d => `bar ${d.name.replace(/\s/g, "_")}`).attr("x", x(0) + 1).attr("width", d => x(d.value) - x(0) - 1).attr("y", d => y(top_n + 1) + 5).attr("height", y(1) - y(0) - barPadding).style("fill", d => d.color).style("opacity", 1).transition().duration(tickDuration).ease(d3.easeLinear).attr("y", d => y(d.rank) + 5);
    		bars.transition().duration(tickDuration).ease(d3.easeLinear).attr("width", d => x(d.value) - x(0) - 1).attr("y", d => y(d.rank) + 5);
    		bars.exit().transition().duration(tickDuration).ease(d3.easeLinear).attr("width", d => x(d.value) - x(0) - 1).attr("y", d => y(top_n + 1) + 5).remove();

    		bars.style("opacity", function (d) {
    			if (d.name == "s4a" || d.name == "s4b" || d.name == "s4c" || d.name == "s4d") {
    				if (ln == d.name) {
    					return 1;
    				} else return 0.5;
    			} else return 1;
    		});

    		let labels = svg_RaceChart.selectAll(".label").data(data_runchart, d => d.name);

    		labels.enter().append("text").attr("class", "label").attr("x", d => x(d.value) - 8).attr("y", d => y(top_n + 1) + 5 + (y(1) - y(0)) / 2).style("text-anchor", "end").attr("fill", function (d) {
    			if (d.color == "#fff" || d.color == "#ffd54f") return "black"; else return "black";
    		}).style("font-weight", "800").style("font-size", "12px").html(d => d.name).transition().duration(tickDuration).ease(d3.easeLinear).attr("y", d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

    		labels.transition().duration(tickDuration).ease(d3.easeLinear).attr("x", d => x(d.value) - 8).attr("y", d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);
    		labels.exit().transition().duration(tickDuration).ease(d3.easeLinear).attr("x", d => x(d.value) - 8).attr("y", d => y(top_n + 1) + 5).remove();
    		let valueLabels = svg_RaceChart.selectAll(".valueLabel").data(data_runchart, d => d.name);

    		valueLabels.enter().append("text").attr("class", "valueLabel").attr("x", d => x(d.value) + 5).attr("y", d => y(top_n + 1) + 5).text(function (d) {
    			var str = d3.format(",.0f")(d.value);
    			str = str.replace(",", ".");
    			return str;
    		}).transition().duration(tickDuration).ease(d3.easeLinear).attr("y", d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

    		valueLabels.transition().duration(tickDuration).ease(d3.easeLinear).attr("x", d => x(d.value) + 5).attr("y", d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1).tween("text", function (d) {
    			let i = d3.interpolateRound(d.value, d.value);

    			return function (t) {
    				var str = d3.format(",")(i(t));
    				str = str.replace(",", ".");
    				this.textContent = str;
    			};
    		});

    		valueLabels.exit().transition().duration(tickDuration).ease(d3.easeLinear).attr("x", d => x(d.value) + 5).attr("y", d => y(top_n + 1) + 5).remove();
    		var j;
    		var buurtnamen_string = "";

    		if (buurtnamen_current.length == 1) {
    			buurtnamen_string = "Enkele buurt: ";
    		}

    		if (buurtnamen_current.length > 1) {
    			buurtnamen_string = "Gemiddeld resultaat voor " + buurtnamen_current.length + " buurten: ";
    		}

    		for (j = 0; j < buurtnamen_current.length; j++) {
    			buurtnamen_string = buurtnamen_string.concat(buurtnamen_current[j]);

    			if (buurtnamen_current.length - j > 2) {
    				buurtnamen_string = buurtnamen_string.concat(", ");
    			} else if (buurtnamen_current.length - j > 1) {
    				buurtnamen_string = buurtnamen_string.concat(" en ");
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RaceChart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		store_input_primarydataset_raw,
    		store_visualisatiedataset_racechart,
    		store_selectie_buurtnamen,
    		buurtnamen_current,
    		data_wa_h17,
    		data_gemeenten,
    		myElementToCheckIfClicksAreInsideOf,
    		data_runchart,
    		top_n,
    		height,
    		width,
    		margin,
    		barPadding,
    		svg_RaceChart,
    		svg_BuurtTitle,
    		x,
    		y,
    		xAxis,
    		tickDuration
    	});

    	$$self.$inject_state = $$props => {
    		if ("buurtnamen_current" in $$props) buurtnamen_current = $$props.buurtnamen_current;
    		if ("data_wa_h17" in $$props) data_wa_h17 = $$props.data_wa_h17;
    		if ("data_gemeenten" in $$props) data_gemeenten = $$props.data_gemeenten;
    		if ("myElementToCheckIfClicksAreInsideOf" in $$props) myElementToCheckIfClicksAreInsideOf = $$props.myElementToCheckIfClicksAreInsideOf;
    		if ("data_runchart" in $$props) data_runchart = $$props.data_runchart;
    		if ("top_n" in $$props) top_n = $$props.top_n;
    		if ("height" in $$props) height = $$props.height;
    		if ("width" in $$props) width = $$props.width;
    		if ("barPadding" in $$props) barPadding = $$props.barPadding;
    		if ("svg_RaceChart" in $$props) svg_RaceChart = $$props.svg_RaceChart;
    		if ("svg_BuurtTitle" in $$props) svg_BuurtTitle = $$props.svg_BuurtTitle;
    		if ("x" in $$props) x = $$props.x;
    		if ("y" in $$props) y = $$props.y;
    		if ("xAxis" in $$props) xAxis = $$props.xAxis;
    		if ("tickDuration" in $$props) tickDuration = $$props.tickDuration;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class RaceChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RaceChart",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/BubbleChart.svelte generated by Svelte v3.32.1 */

    function create_fragment$n(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BubbleChart", slots, []);
    	var data;

    	store_visualisatiedataset_bubblechart.subscribe(value => {
    		$$invalidate(0, data = value);
    	});

    	var svg;
    	var i;

    	onMount(() => {
    		// onMount, initialiseer en teken in
    		Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    		svg = d3.select("#BlockChartDiv").append("svg").attr("width", 750).style("background-color", "#fff").style("overflow", "visible").attr("height", 240);

    		// viz draws first data
    		init_BlockChart();

    		if (data.length > 0) {
    			manipulate_blockchart(data);
    		}
    	});

    	function init_BlockChart() {
    		svg.append("text").style("font-family", "RijksoverheidSans").style("font-size", 14 + "px").style("font-weight", 200).call(wrap, 300).attr("transform", "translate(0,75)");
    		svg.append("text").style("font-family", "RijksoverheidSans").style("font-size", 14 + "px").style("font-weight", 200).call(wrap, 300).attr("transform", "translate(0,190)");

    		//afmetingen en posities
    		let spacing = 3;

    		var graph_width = 35;
    		var graph_height = graph_width;
    		var margin_left = 0;
    		var margin_top = 0;
    		var gpos = []; // datapunten referentie voor posities en labels

    		//data keys
    		let posten = [
    			"egnet",
    			"wnet_buurt",
    			"wnet_pand",
    			"wnet_transport",
    			"wnet_bron",
    			"iso",
    			"inst",
    			"om",
    			"warmtepomp_elek"
    		];

    		//maak datapunt-referenties (s1a (warmtepomp, B+)
    		for (i = 0; i < 9; i++) {
    			gpos.push({
    				post: posten[i],
    				strat: "s1a",
    				graph: i,
    				xpos: (graph_width + spacing) * i + margin_left,
    				ypos: 80 + margin_top
    			});
    		}

    		//maak datapunt-referenties s2c (warmtenet, B+)
    		for (i = 0; i < 9; i++) {
    			gpos.push({
    				post: posten[i],
    				strat: "s2c",
    				graph: i,
    				xpos: (graph_width + spacing) * i + margin_left,
    				ypos: 118 + margin_top
    			});
    		}

    		//maak datapunt-referenties voor s2f (warmtenet, D+)
    		for (i = 0; i < 9; i++) {
    			gpos.push({
    				post: posten[i],
    				strat: "s2f",
    				graph: i,
    				xpos: (graph_width + spacing) * i + margin_left,
    				ypos: 156 + margin_top
    			});
    		}

    		//titels posten en afmetingen achtergrondlabels (de diagonale etiketten bovenaan de grafiek en de horizontale labels aan de linkerkant van de grafiek)
    		let posten_labels = [
    			"Elek.- en gasnetten",
    			"Warmtenet buurt",
    			"Warmtenet pand",
    			"Warmtenet transport",
    			"Warmtekosten",
    			"Isolatie",
    			"Gebouwinstallaties",
    			"Onderhoud & beheer",
    			"Elektrct. warmtepomp"
    		];

    		let posten_widths = [105, 95, 95, 114, 82, 45, 103, 113, 119];
    		let horlabels_text = ["All-electric (B+)", "Warmtenet (B+)", "Warmtenet (D+)"];
    		let horlabels_color = ["#90caf9", "#ffecb3", "#ffab91"];
    		let horlabels_textcolor = ["#000", "#000", "#000"];

    		for (i = 0; i < 3; i++) {
    			svg.append("rect").attr("width", 373).attr("height", 2).attr("fill", "#333").attr("rx", 2).attr("ry", 2).attr("x", 65 + margin_left - 115).attr("y", margin_top - 40 + 136 + 38 * i); // horizontale gridlines
    			svg.append("rect").attr("width", 105).attr("height", 20).attr("fill", horlabels_color[i]).attr("rx", 5).attr("ry", 5).attr("x", margin_left - 115).attr("y", margin_top - 40 + 136 + 38 * i - 9); // teken horizontale labels
    			svg.append("text").style("color", horlabels_textcolor[i]).text(horlabels_text[i]).style("font-family", "RijksoverheidSans").style("font-size", 12 + "px").style("font-weight", 800).attr("x", margin_left - 109).attr("y", margin_top - 40 + 136 + 38 * i + 4); // teken text op horizontale labels
    		}

    		for (i = 0; i < 9; i++) {
    			// positie diagonale labels bovenaan grafiek
    			var xpos = gpos[i].xpos + 7;

    			var ypos = gpos[i].ypos - 13;
    			svg.append("rect").attr("width", posten_widths[i]).attr("height", 17).attr("fill", "#fff").attr("rx", 5).attr("ry", 5).attr("transform", "translate(" + xpos + "," + ypos + ") rotate(-55)"); // achtergrond diagonale labels bovenaan grafiek
    			svg.append("rect").attr("width", 2).attr("height", 106).attr("fill", "#333").attr("rx", 2).attr("ry", 2).attr("x", xpos + 9.5).attr("y", ypos); // verticale gridlines

    			// positie horizontale labels links van grafiek
    			xpos = gpos[i].xpos + 20;

    			ypos = gpos[i].ypos - 15;
    			svg.append("text").style("color", "black").text(posten_labels[i]).style("color", "black").style("font-family", "RijksoverheidSans").style("font-size", 14 + "px").style("font-weight", 800).attr("transform", "translate(" + xpos + "," + ypos + ") rotate(-55)"); // tekst op horizontale labels links van grafiek
    		}

    		// bubble kleuren per post (in huidige inmplementatie geen onderscheid op kleur)
    		let bubbleColors = {
    			egnet: "#424242",
    			wnet_buurt: "#424242",
    			wnet_pand: "#424242",
    			wnet_transport: "#424242",
    			wnet_bron: "#424242",
    			iso: "#424242",
    			inst: "#424242",
    			om: "#424242",
    			warmtepomp_elek: "#424242"
    		};

    		//generereer bubbles
    		for (i = 0; i < gpos.length; i++) {
    			svg.append("circle").attr("id", gpos[i].strat + "_" + gpos[i].post + "_back").attr("cx", gpos[i].xpos + graph_width / 2).attr("cy", gpos[i].ypos + graph_height / 2).attr("fill", "red").style("stroke", "red").style("stroke-width", 4).style("stroke-opacity", 0).attr("r", 0); //rode omcirkeling per bubble, is indicator voor negatieve waarden
    			svg.append("circle").attr("id", gpos[i].strat + "_" + gpos[i].post).attr("cx", gpos[i].xpos + graph_width / 2).attr("cy", gpos[i].ypos + graph_height / 2).attr("fill", bubbleColors[gpos[i].post]).attr("r", 10).style("stroke", "#fff").style("stroke-width", 1).attr("margin", 100); //teken bubbles
    		}
    	} // init_BlockChart()

    	function manipulate_blockchart(data) {
    		// manipuleer blockchar (omvang van bubbles, rode omcirkeling)
    		// referentielabels
    		let labels = ["s1a", "s2c", "s2f"];

    		// bepaal maximumwaarde per variant en over de gehele dataset (voor schaalfactor bubbles)
    		var maxima = [];

    		for (i = 0; i < data.length; i++) {
    			let arr = [
    				data[i].egnet,
    				data[i].warmtepomp_elek,
    				data[i].inst,
    				data[i].iso,
    				data[i].om,
    				data[i].wnet_bron,
    				data[i].wnet_buurt,
    				data[i].wnet_pand,
    				data[i].wnet_transport
    			];

    			var max = Math.max(...arr);
    			maxima.push(max);
    		}

    		var max_global = Math.max(...maxima);

    		// overkoepelende uitgangspunten voor de schaling van de bubbles op de data
    		let opp = 1.8;

    		const sqrtScale = d3.scaleSqrt().domain([0, 10]).range([0, 40]);

    		//schaal bubbles per post (afmeting bubble, wel/geen rode omcerikeling en update textlabel met waarde
    		// (1/9) EGNET ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].egnet) / max_global;
    			d3.select("#" + labels[i] + "_egnet").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].egnet < 0) {
    				d3.select("#" + labels[i] + "_egnet_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_egnet_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_egnet_text").text(data[i].egnet); // voor debugging

    		// (2/9) WARMTEPOMP ELEK ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].warmtepomp_elek) / max_global;
    			d3.select("#" + labels[i] + "_warmtepomp_elek").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].warmtepomp_elek < 0) {
    				d3.select("#" + labels[i] + "_warmtepomp_elek_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_warmtepomp_elek_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_warmtepomp_elek_text").text(data[i].warmtepomp_elek); // voor debugging

    		// (3/9) INST ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].inst) / max_global;
    			d3.select("#" + labels[i] + "_inst").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].inst < 0) {
    				d3.select("#" + labels[i] + "_inst_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_inst_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_inst_text").text(data[i].inst); // voor debugging

    		// (4/9) ISO ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].iso) / max_global;
    			d3.select("#" + labels[i] + "_iso").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].iso < 0) {
    				d3.select("#" + labels[i] + "_iso_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_iso_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_iso_text").text(data[i].iso); // voor debugging

    		// (5/9) OM ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].om) / max_global;
    			d3.select("#" + labels[i] + "_om").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].om < 0) {
    				d3.select("#" + labels[i] + "_om_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_om_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_om_text").text(data[i].om); // voor debugging

    		// (6/9) WNET_BRON ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = Math.sqrt(opp * Math.abs(data[i].wnet_bron) / max_global);
    			d3.select("#" + labels[i] + "_wnet_bron").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].wnet_bron < 0) {
    				d3.select("#" + labels[i] + "_wnet_bron_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_wnet_bron_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_wnet_bron_text").text(data[i].wnet_bron); // voor debugging

    		// (7/9) WNET_BUURT ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].wnet_buurt) / max_global;
    			d3.select("#" + labels[i] + "_wnet_buurt").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].wnet_buurt < 0) {
    				d3.select("#" + labels[i] + "_wnet_buurt_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_wnet_buurt_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_wnet_buurt_text").text(data[i].wnet_buurt); // voor debugging

    		// (8/9) WNET_PAND ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].wnet_pand) / max_global;
    			d3.select("#" + labels[i] + "_wnet_pand").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].wnet_pand < 0) {
    				d3.select("#" + labels[i] + "_wnet_pand_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_wnet_pand_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_wnet_pand_text").text(data[i].wnet_pand); // voor debugging

    		// (9/9) WNET_TRANSPORT ----------------
    		for (i = 0; i < labels.length; i++) {
    			let res = opp * Math.abs(data[i].wnet_transport) / max_global;
    			d3.select("#" + labels[i] + "_wnet_transport").transition().duration(50).attr("r", sqrtScale(res));

    			if (data[i].wnet_transport < 0) {
    				d3.select("#" + labels[i] + "_wnet_transport_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
    			} else {
    				d3.select("#" + labels[i] + "_wnet_transport_back").style("stroke-opacity", 0);
    			}
    		} // d3.select("#" + labels[i] + "_wnet_transport_text").text(data[i].wnet_transport); // voor debugging
    	} // voor debugging:
    	// d3.selectAll("#blockchart_overlays")

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BubbleChart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		store_visualisatiedataset_bubblechart,
    		data,
    		svg,
    		i,
    		init_BlockChart,
    		manipulate_blockchart
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("svg" in $$props) svg = $$props.svg;
    		if ("i" in $$props) i = $$props.i;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 1) {
    			// reageer op mutaties op input
    			 {
    				if (data.length > 0) {
    					manipulate_blockchart(data);
    				}
    			}
    		}
    	};

    	return [data];
    }

    class BubbleChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BubbleChart",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/OutputPanel.svelte generated by Svelte v3.32.1 */

    const { console: console_1 } = globals;
    const file$i = "src/OutputPanel.svelte";

    // (104:12) <span class="white-text text-accent-3" slot="header" style="font-size: 18px; font-weight:800;">
    function create_header_slot(ctx) {
    	let span;
    	let t0;
    	let p;
    	let t1_value = generate_selection_string(/*selectie_buurtnamen*/ ctx[2]) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("Selectie ");
    			p = element("p");
    			t1 = text(t1_value);
    			set_style(p, "font-size", "13px");
    			set_style(p, "position", "absolute");
    			set_style(p, "top", "20px");
    			set_style(p, "left", "130px");
    			set_style(p, "width", "600px");
    			attr_dev(p, "class", "svelte-1vetrtk");
    			add_location(p, file$i, 103, 116, 4274);
    			attr_dev(span, "class", "white-text text-accent-3");
    			attr_dev(span, "slot", "header");
    			set_style(span, "font-size", "18px");
    			set_style(span, "font-weight", "800");
    			add_location(span, file$i, 103, 12, 4170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectie_buurtnamen*/ 4 && t1_value !== (t1_value = generate_selection_string(/*selectie_buurtnamen*/ ctx[2]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(104:12) <span class=\\\"white-text text-accent-3\\\" slot=\\\"header\\\" style=\\\"font-size: 18px; font-weight:800;\\\">",
    		ctx
    	});

    	return block;
    }

    // (105:12) <span slot="icon" let:active>
    function create_icon_slot(ctx) {
    	let span;
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				path: mdiArrowUpDropCircle,
    				size: "40px",
    				class: "mdi white-text",
    				rotate: /*active*/ ctx[17] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "slot", "icon");
    			add_location(span, file$i, 104, 12, 4426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*active*/ 131072) icon_changes.rotate = /*active*/ ctx[17] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot.name,
    		type: "slot",
    		source: "(105:12) <span slot=\\\"icon\\\" let:active>",
    		ctx
    	});

    	return block;
    }

    // (111:24) <Tab>
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("KOSTEN");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(111:24) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (112:24) <Tab>
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("POSTEN");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(112:24) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (113:24) <Tab>
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("WARMTENET");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(113:24) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (114:24) <Tab>
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("WONINGTYPEN");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(114:24) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (115:24) <Tab>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("BOUWPERIODE");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(115:24) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (110:20) <div slot="tabs">
    function create_tabs_slot(ctx) {
    	let div;
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let t3;
    	let tab4;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab4 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    			t3 = space();
    			create_component(tab4.$$.fragment);
    			attr_dev(div, "slot", "tabs");
    			add_location(div, file$i, 109, 20, 4728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tab0, div, null);
    			append_dev(div, t0);
    			mount_component(tab1, div, null);
    			append_dev(div, t1);
    			mount_component(tab2, div, null);
    			append_dev(div, t2);
    			mount_component(tab3, div, null);
    			append_dev(div, t3);
    			mount_component(tab4, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    			const tab4_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tab4_changes.$$scope = { dirty, ctx };
    			}

    			tab4.$set(tab4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			transition_in(tab4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			transition_out(tab4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tab0);
    			destroy_component(tab1);
    			destroy_component(tab2);
    			destroy_component(tab3);
    			destroy_component(tab4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tabs_slot.name,
    		type: "slot",
    		source: "(110:20) <div slot=\\\"tabs\\\">",
    		ctx
    	});

    	return block;
    }

    // (119:20) <WindowItem>
    function create_default_slot_8(ctx) {
    	let div1;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let div0;
    	let racechart;
    	let current;
    	racechart = new RaceChart({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Nationale kosten (€ per ton CO2-reductie per jaar)";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "[ Toelichting Grafiek ]";
    			t3 = space();
    			div0 = element("div");
    			create_component(racechart.$$.fragment);
    			set_style(p0, "position", "absolute");
    			set_style(p0, "left", "0px");
    			set_style(p0, "top", "20px");
    			set_style(p0, "font-size", "18px");
    			set_style(p0, "font-weight", "800");
    			set_style(p0, "width", "600px");
    			attr_dev(p0, "class", "svelte-1vetrtk");
    			add_location(p0, file$i, 120, 28, 5202);
    			set_style(p1, "position", "absolute");
    			set_style(p1, "left", "0px");
    			set_style(p1, "top", "60px");
    			set_style(p1, "font-size", "13px");
    			set_style(p1, "width", "280px");
    			attr_dev(p1, "class", "svelte-1vetrtk");
    			add_location(p1, file$i, 121, 28, 5380);
    			attr_dev(div0, "id", "RaceChartDiv");
    			set_style(div0, "position", "absolute");
    			set_style(div0, "width", "100%");
    			set_style(div0, "left", "300px");
    			set_style(div0, "height", "300px");
    			set_style(div0, "top", "50px");
    			add_location(div0, file$i, 122, 28, 5515);
    			set_style(div1, "height", "240px");
    			set_style(div1, "background-color", "none");
    			add_location(div1, file$i, 119, 24, 5123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(div1, t1);
    			append_dev(div1, p1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			mount_component(racechart, div0, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(racechart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(racechart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(racechart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(119:20) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (128:20) <WindowItem>
    function create_default_slot_7(ctx) {
    	let div2;
    	let div1;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let div0;
    	let blockchart;
    	let current;
    	blockchart = new BubbleChart({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Verdeling over kostenposten";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "De grafiek toont voor elk van de drie opties de verdeling van kosten over negen verschillene kostenposten.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "De omvang van een bolletje is een maat voor de omvang van de kostenpost.";
    			t5 = space();
    			div0 = element("div");
    			create_component(blockchart.$$.fragment);
    			set_style(p0, "position", "absolute");
    			set_style(p0, "left", "0px");
    			set_style(p0, "top", "20px");
    			set_style(p0, "font-size", "18px");
    			set_style(p0, "font-weight", "800");
    			set_style(p0, "width", "600px");
    			attr_dev(p0, "class", "svelte-1vetrtk");
    			add_location(p0, file$i, 130, 32, 6042);
    			set_style(p1, "position", "absolute");
    			set_style(p1, "left", "0px");
    			set_style(p1, "top", "60px");
    			set_style(p1, "font-size", "13px");
    			set_style(p1, "width", "280px");
    			attr_dev(p1, "class", "svelte-1vetrtk");
    			add_location(p1, file$i, 131, 32, 6201);
    			set_style(p2, "position", "absolute");
    			set_style(p2, "left", "0px");
    			set_style(p2, "top", "150px");
    			set_style(p2, "font-size", "13px");
    			set_style(p2, "width", "220px");
    			attr_dev(p2, "class", "svelte-1vetrtk");
    			add_location(p2, file$i, 132, 32, 6423);
    			attr_dev(div0, "id", "BlockChartDiv");
    			set_style(div0, "position", "absolute");
    			set_style(div0, "width", "100%");
    			set_style(div0, "left", "340px");
    			set_style(div0, "height", "300px");
    			set_style(div0, "top", "50px");
    			add_location(div0, file$i, 133, 32, 6612);
    			set_style(div1, "position", "absolute");
    			set_style(div1, "right", "0px");
    			set_style(div1, "width", "100%");
    			set_style(div1, "height", "240px");
    			set_style(div1, "background-color", "none");
    			add_location(div1, file$i, 129, 28, 5917);
    			set_style(div2, "position", "relative");
    			set_style(div2, "width", "100%");
    			set_style(div2, "height", "240px");
    			set_style(div2, "float", "left");
    			add_location(div2, file$i, 128, 24, 5818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t1);
    			append_dev(div1, p1);
    			append_dev(div1, t3);
    			append_dev(div1, p2);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			mount_component(blockchart, div0, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(blockchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(blockchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(blockchart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(128:20) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (143:20) <WindowItem>
    function create_default_slot_5$2(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let img4;
    	let img4_src_value;
    	let t4;
    	let p0;
    	let t5_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value + /*selectie_woningen_woningtype*/ ctx[0][1].value + /*selectie_woningen_woningtype*/ ctx[0][2].value + /*selectie_woningen_woningtype*/ ctx[0][3].value + /*selectie_woningen_woningtype*/ ctx[0][4].value) + "";
    	let t5;
    	let t6;
    	let t7;
    	let p1;
    	let strong0;
    	let t9;
    	let t10_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value) + "";
    	let t10;
    	let t11;
    	let p2;
    	let strong1;
    	let t13;
    	let t14_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][2].value) + "";
    	let t14;
    	let t15;
    	let p3;
    	let strong2;
    	let t17;
    	let t18_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][3].value) + "";
    	let t18;
    	let t19;
    	let p4;
    	let strong3;
    	let t21;
    	let t22_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][1].value) + "";
    	let t22;
    	let t23;
    	let p5;
    	let strong4;
    	let t25;
    	let t26_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][4].value) + "";
    	let t26;
    	let t27;
    	let div0;
    	let donutchartwoningtype;
    	let current;
    	donutchartwoningtype = new DonutChart_woningtype({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			img2 = element("img");
    			t2 = space();
    			img3 = element("img");
    			t3 = space();
    			img4 = element("img");
    			t4 = space();
    			p0 = element("p");
    			t5 = text(t5_value);
    			t6 = text(" woningen");
    			t7 = space();
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Gestapeld:";
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			p2 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Rijwoning hoek:";
    			t13 = space();
    			t14 = text(t14_value);
    			t15 = space();
    			p3 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Rijwoning tussen:";
    			t17 = space();
    			t18 = text(t18_value);
    			t19 = space();
    			p4 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Twee-onder-één-kap:";
    			t21 = space();
    			t22 = text(t22_value);
    			t23 = space();
    			p5 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "Vrijstaand:";
    			t25 = space();
    			t26 = text(t26_value);
    			t27 = space();
    			div0 = element("div");
    			create_component(donutchartwoningtype.$$.fragment);
    			set_style(img0, "position", "absolute");
    			set_style(img0, "top", "55px");
    			set_style(img0, "left", "10px");
    			if (img0.src !== (img0_src_value = "img/wt_gestapeld.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "icon");
    			attr_dev(img0, "width", "26");
    			attr_dev(img0, "height", "33");
    			add_location(img0, file$i, 144, 28, 7138);
    			set_style(img1, "position", "absolute");
    			set_style(img1, "top", "95px");
    			set_style(img1, "left", "10px");
    			if (img1.src !== (img1_src_value = "img/wt_rijhoek.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "icon");
    			attr_dev(img1, "width", "26");
    			attr_dev(img1, "height", "33");
    			add_location(img1, file$i, 145, 28, 7282);
    			set_style(img2, "position", "absolute");
    			set_style(img2, "top", "135px");
    			set_style(img2, "left", "10px");
    			if (img2.src !== (img2_src_value = "img/wt_rijtussen.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "icon");
    			attr_dev(img2, "width", "26");
    			attr_dev(img2, "height", "33");
    			add_location(img2, file$i, 146, 28, 7424);
    			set_style(img3, "position", "absolute");
    			set_style(img3, "top", "175px");
    			set_style(img3, "left", "10px");
    			if (img3.src !== (img3_src_value = "img/wt_21kap.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "icon");
    			attr_dev(img3, "width", "26");
    			attr_dev(img3, "height", "26");
    			add_location(img3, file$i, 147, 28, 7569);
    			set_style(img4, "position", "absolute");
    			set_style(img4, "top", "215px");
    			set_style(img4, "left", "10px");
    			if (img4.src !== (img4_src_value = "img/wt_vrij.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "icon");
    			attr_dev(img4, "width", "26");
    			attr_dev(img4, "height", "26");
    			add_location(img4, file$i, 148, 28, 7711);
    			set_style(p0, "position", "absolute");
    			set_style(p0, "left", "10px");
    			set_style(p0, "top", "10px");
    			set_style(p0, "font-size", "20px");
    			set_style(p0, "font-weight", "600");
    			set_style(p0, "width", "600px");
    			attr_dev(p0, "class", "svelte-1vetrtk");
    			add_location(p0, file$i, 149, 28, 7851);
    			add_location(strong0, file$i, 150, 124, 8301);
    			set_style(p1, "position", "absolute");
    			set_style(p1, "left", "60px");
    			set_style(p1, "top", "60px");
    			set_style(p1, "font-size", "15px");
    			set_style(p1, "font-weight", "400");
    			set_style(p1, "width", "600px");
    			attr_dev(p1, "class", "svelte-1vetrtk");
    			add_location(p1, file$i, 150, 28, 8205);
    			add_location(strong1, file$i, 151, 125, 8524);
    			set_style(p2, "position", "absolute");
    			set_style(p2, "left", "60px");
    			set_style(p2, "top", "100px");
    			set_style(p2, "font-size", "15px");
    			set_style(p2, "font-weight", "400");
    			set_style(p2, "width", "600px");
    			attr_dev(p2, "class", "svelte-1vetrtk");
    			add_location(p2, file$i, 151, 28, 8427);
    			add_location(strong2, file$i, 152, 125, 8744);
    			set_style(p3, "position", "absolute");
    			set_style(p3, "left", "60px");
    			set_style(p3, "top", "140px");
    			set_style(p3, "font-size", "15px");
    			set_style(p3, "font-weight", "400");
    			set_style(p3, "width", "600px");
    			attr_dev(p3, "class", "svelte-1vetrtk");
    			add_location(p3, file$i, 152, 28, 8647);
    			add_location(strong3, file$i, 153, 125, 8966);
    			set_style(p4, "position", "absolute");
    			set_style(p4, "left", "60px");
    			set_style(p4, "top", "180px");
    			set_style(p4, "font-size", "15px");
    			set_style(p4, "font-weight", "400");
    			set_style(p4, "width", "600px");
    			attr_dev(p4, "class", "svelte-1vetrtk");
    			add_location(p4, file$i, 153, 28, 8869);
    			add_location(strong4, file$i, 154, 125, 9190);
    			set_style(p5, "position", "absolute");
    			set_style(p5, "left", "60px");
    			set_style(p5, "top", "220px");
    			set_style(p5, "font-size", "15px");
    			set_style(p5, "font-weight", "400");
    			set_style(p5, "width", "600px");
    			attr_dev(p5, "class", "svelte-1vetrtk");
    			add_location(p5, file$i, 154, 28, 9093);
    			attr_dev(div0, "id", "DonutChartB");
    			set_style(div0, "position", "absolute");
    			set_style(div0, "width", "400px");
    			set_style(div0, "left", "380px");
    			set_style(div0, "height", "300px");
    			set_style(div0, "top", "0px");
    			add_location(div0, file$i, 155, 28, 9309);
    			set_style(div1, "width", "300px");
    			set_style(div1, "height", "300px");
    			add_location(div1, file$i, 143, 24, 7068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, img1);
    			append_dev(div1, t1);
    			append_dev(div1, img2);
    			append_dev(div1, t2);
    			append_dev(div1, img3);
    			append_dev(div1, t3);
    			append_dev(div1, img4);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(p1, strong0);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p2);
    			append_dev(p2, strong1);
    			append_dev(p2, t13);
    			append_dev(p2, t14);
    			append_dev(div1, t15);
    			append_dev(div1, p3);
    			append_dev(p3, strong2);
    			append_dev(p3, t17);
    			append_dev(p3, t18);
    			append_dev(div1, t19);
    			append_dev(div1, p4);
    			append_dev(p4, strong3);
    			append_dev(p4, t21);
    			append_dev(p4, t22);
    			append_dev(div1, t23);
    			append_dev(div1, p5);
    			append_dev(p5, strong4);
    			append_dev(p5, t25);
    			append_dev(p5, t26);
    			append_dev(div1, t27);
    			append_dev(div1, div0);
    			mount_component(donutchartwoningtype, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t5_value !== (t5_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value + /*selectie_woningen_woningtype*/ ctx[0][1].value + /*selectie_woningen_woningtype*/ ctx[0][2].value + /*selectie_woningen_woningtype*/ ctx[0][3].value + /*selectie_woningen_woningtype*/ ctx[0][4].value) + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t10_value !== (t10_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value) + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t14_value !== (t14_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][2].value) + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t18_value !== (t18_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][3].value) + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t22_value !== (t22_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][1].value) + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t26_value !== (t26_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][4].value) + "")) set_data_dev(t26, t26_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(donutchartwoningtype.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(donutchartwoningtype.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(donutchartwoningtype);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(143:20) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (161:20) <WindowItem>
    function create_default_slot_4$2(ctx) {
    	let div1;
    	let p0;
    	let t0_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value + /*selectie_woningen_woningtype*/ ctx[0][1].value + /*selectie_woningen_woningtype*/ ctx[0][2].value + /*selectie_woningen_woningtype*/ ctx[0][3].value + /*selectie_woningen_woningtype*/ ctx[0][4].value) + "";
    	let t0;
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t5_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][0].value) + "";
    	let t5;
    	let t6;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t10_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][1].value) + "";
    	let t10;
    	let t11;
    	let t12;
    	let p5;
    	let t14;
    	let p6;
    	let t15_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][2].value) + "";
    	let t15;
    	let t16;
    	let t17;
    	let p7;
    	let t19;
    	let p8;
    	let t20_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][3].value) + "";
    	let t20;
    	let t21;
    	let t22;
    	let p9;
    	let t24;
    	let p10;
    	let t25_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][4].value) + "";
    	let t25;
    	let t26;
    	let t27;
    	let p11;
    	let t29;
    	let p12;
    	let t30_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][5].value) + "";
    	let t30;
    	let t31;
    	let t32;
    	let p13;
    	let t34;
    	let p14;
    	let t35_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][6].value) + "";
    	let t35;
    	let t36;
    	let t37;
    	let div0;
    	let donutchartbouwperiode;
    	let current;
    	donutchartbouwperiode = new DonutChart_bouwperiode({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = text(" woningen");
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "1930 en eerder:";
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = text(" woningen");
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "1930 - 1945:";
    			t9 = space();
    			p4 = element("p");
    			t10 = text(t10_value);
    			t11 = text(" woningen");
    			t12 = space();
    			p5 = element("p");
    			p5.textContent = "1945 - 1965:";
    			t14 = space();
    			p6 = element("p");
    			t15 = text(t15_value);
    			t16 = text(" woningen");
    			t17 = space();
    			p7 = element("p");
    			p7.textContent = "1965 - 1975:";
    			t19 = space();
    			p8 = element("p");
    			t20 = text(t20_value);
    			t21 = text(" woningen");
    			t22 = space();
    			p9 = element("p");
    			p9.textContent = "1975 - 1992:";
    			t24 = space();
    			p10 = element("p");
    			t25 = text(t25_value);
    			t26 = text(" woningen");
    			t27 = space();
    			p11 = element("p");
    			p11.textContent = "1992 - 2005:";
    			t29 = space();
    			p12 = element("p");
    			t30 = text(t30_value);
    			t31 = text(" woningen");
    			t32 = space();
    			p13 = element("p");
    			p13.textContent = "2006 en later:";
    			t34 = space();
    			p14 = element("p");
    			t35 = text(t35_value);
    			t36 = text(" woningen");
    			t37 = space();
    			div0 = element("div");
    			create_component(donutchartbouwperiode.$$.fragment);
    			set_style(p0, "position", "absolute");
    			set_style(p0, "left", "10px");
    			set_style(p0, "top", "10px");
    			set_style(p0, "font-size", "20px");
    			set_style(p0, "font-weight", "600");
    			set_style(p0, "width", "600px");
    			attr_dev(p0, "class", "svelte-1vetrtk");
    			add_location(p0, file$i, 162, 28, 9693);
    			set_style(p1, "position", "absolute");
    			set_style(p1, "left", "10px");
    			set_style(p1, "top", "60px");
    			set_style(p1, "font-size", "15px");
    			set_style(p1, "font-weight", "600");
    			set_style(p1, "width", "600px");
    			attr_dev(p1, "class", "svelte-1vetrtk");
    			add_location(p1, file$i, 163, 28, 10047);
    			set_style(p2, "position", "absolute");
    			set_style(p2, "left", "130px");
    			set_style(p2, "top", "60px");
    			set_style(p2, "font-size", "15px");
    			set_style(p2, "font-weight", "400");
    			set_style(p2, "width", "600px");
    			attr_dev(p2, "class", "svelte-1vetrtk");
    			add_location(p2, file$i, 163, 145, 10164);
    			set_style(p3, "position", "absolute");
    			set_style(p3, "left", "10px");
    			set_style(p3, "top", "85px");
    			set_style(p3, "font-size", "15px");
    			set_style(p3, "font-weight", "600");
    			set_style(p3, "width", "600px");
    			attr_dev(p3, "class", "svelte-1vetrtk");
    			add_location(p3, file$i, 164, 28, 10369);
    			set_style(p4, "position", "absolute");
    			set_style(p4, "left", "130px");
    			set_style(p4, "top", "85px");
    			set_style(p4, "font-size", "15px");
    			set_style(p4, "font-weight", "400");
    			set_style(p4, "width", "600px");
    			attr_dev(p4, "class", "svelte-1vetrtk");
    			add_location(p4, file$i, 164, 145, 10486);
    			set_style(p5, "position", "absolute");
    			set_style(p5, "left", "10px");
    			set_style(p5, "top", "110px");
    			set_style(p5, "font-size", "15px");
    			set_style(p5, "font-weight", "600");
    			set_style(p5, "width", "600px");
    			attr_dev(p5, "class", "svelte-1vetrtk");
    			add_location(p5, file$i, 165, 28, 10683);
    			set_style(p6, "position", "absolute");
    			set_style(p6, "left", "130px");
    			set_style(p6, "top", "110px");
    			set_style(p6, "font-size", "15px");
    			set_style(p6, "font-weight", "400");
    			set_style(p6, "width", "600px");
    			attr_dev(p6, "class", "svelte-1vetrtk");
    			add_location(p6, file$i, 165, 145, 10800);
    			set_style(p7, "position", "absolute");
    			set_style(p7, "left", "10px");
    			set_style(p7, "top", "135px");
    			set_style(p7, "font-size", "15px");
    			set_style(p7, "font-weight", "600");
    			set_style(p7, "width", "600px");
    			attr_dev(p7, "class", "svelte-1vetrtk");
    			add_location(p7, file$i, 166, 28, 10998);
    			set_style(p8, "position", "absolute");
    			set_style(p8, "left", "130px");
    			set_style(p8, "top", "135px");
    			set_style(p8, "font-size", "15px");
    			set_style(p8, "font-weight", "400");
    			set_style(p8, "width", "600px");
    			attr_dev(p8, "class", "svelte-1vetrtk");
    			add_location(p8, file$i, 166, 145, 11115);
    			set_style(p9, "position", "absolute");
    			set_style(p9, "left", "10px");
    			set_style(p9, "top", "160px");
    			set_style(p9, "font-size", "15px");
    			set_style(p9, "font-weight", "600");
    			set_style(p9, "width", "600px");
    			attr_dev(p9, "class", "svelte-1vetrtk");
    			add_location(p9, file$i, 167, 28, 11313);
    			set_style(p10, "position", "absolute");
    			set_style(p10, "left", "130px");
    			set_style(p10, "top", "160px");
    			set_style(p10, "font-size", "15px");
    			set_style(p10, "font-weight", "400");
    			set_style(p10, "width", "600px");
    			attr_dev(p10, "class", "svelte-1vetrtk");
    			add_location(p10, file$i, 167, 145, 11430);
    			set_style(p11, "position", "absolute");
    			set_style(p11, "left", "10px");
    			set_style(p11, "top", "185px");
    			set_style(p11, "font-size", "15px");
    			set_style(p11, "font-weight", "600");
    			set_style(p11, "width", "600px");
    			attr_dev(p11, "class", "svelte-1vetrtk");
    			add_location(p11, file$i, 168, 28, 11628);
    			set_style(p12, "position", "absolute");
    			set_style(p12, "left", "130px");
    			set_style(p12, "top", "185px");
    			set_style(p12, "font-size", "15px");
    			set_style(p12, "font-weight", "400");
    			set_style(p12, "width", "600px");
    			attr_dev(p12, "class", "svelte-1vetrtk");
    			add_location(p12, file$i, 168, 145, 11745);
    			set_style(p13, "position", "absolute");
    			set_style(p13, "left", "10px");
    			set_style(p13, "top", "210px");
    			set_style(p13, "font-size", "15px");
    			set_style(p13, "font-weight", "600");
    			set_style(p13, "width", "600px");
    			attr_dev(p13, "class", "svelte-1vetrtk");
    			add_location(p13, file$i, 169, 28, 11943);
    			set_style(p14, "position", "absolute");
    			set_style(p14, "left", "130px");
    			set_style(p14, "top", "210px");
    			set_style(p14, "font-size", "15px");
    			set_style(p14, "font-weight", "400");
    			set_style(p14, "width", "600px");
    			attr_dev(p14, "class", "svelte-1vetrtk");
    			add_location(p14, file$i, 169, 145, 12060);
    			attr_dev(div0, "id", "DonutChartA");
    			set_style(div0, "position", "absolute");
    			set_style(div0, "width", "400px");
    			set_style(div0, "left", "380px");
    			set_style(div0, "height", "300px");
    			set_style(div0, "top", "0px");
    			add_location(div0, file$i, 170, 28, 12258);
    			set_style(div1, "width", "300px");
    			set_style(div1, "height", "300px");
    			add_location(div1, file$i, 161, 24, 9623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(div1, t4);
    			append_dev(div1, p2);
    			append_dev(p2, t5);
    			append_dev(p2, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p3);
    			append_dev(div1, t9);
    			append_dev(div1, p4);
    			append_dev(p4, t10);
    			append_dev(p4, t11);
    			append_dev(div1, t12);
    			append_dev(div1, p5);
    			append_dev(div1, t14);
    			append_dev(div1, p6);
    			append_dev(p6, t15);
    			append_dev(p6, t16);
    			append_dev(div1, t17);
    			append_dev(div1, p7);
    			append_dev(div1, t19);
    			append_dev(div1, p8);
    			append_dev(p8, t20);
    			append_dev(p8, t21);
    			append_dev(div1, t22);
    			append_dev(div1, p9);
    			append_dev(div1, t24);
    			append_dev(div1, p10);
    			append_dev(p10, t25);
    			append_dev(p10, t26);
    			append_dev(div1, t27);
    			append_dev(div1, p11);
    			append_dev(div1, t29);
    			append_dev(div1, p12);
    			append_dev(p12, t30);
    			append_dev(p12, t31);
    			append_dev(div1, t32);
    			append_dev(div1, p13);
    			append_dev(div1, t34);
    			append_dev(div1, p14);
    			append_dev(p14, t35);
    			append_dev(p14, t36);
    			append_dev(div1, t37);
    			append_dev(div1, div0);
    			mount_component(donutchartbouwperiode, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*selectie_woningen_woningtype*/ 1) && t0_value !== (t0_value = numberWithCommas(/*selectie_woningen_woningtype*/ ctx[0][0].value + /*selectie_woningen_woningtype*/ ctx[0][1].value + /*selectie_woningen_woningtype*/ ctx[0][2].value + /*selectie_woningen_woningtype*/ ctx[0][3].value + /*selectie_woningen_woningtype*/ ctx[0][4].value) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t5_value !== (t5_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][0].value) + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t10_value !== (t10_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][1].value) + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t15_value !== (t15_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][2].value) + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t20_value !== (t20_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][3].value) + "")) set_data_dev(t20, t20_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t25_value !== (t25_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][4].value) + "")) set_data_dev(t25, t25_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t30_value !== (t30_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][5].value) + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty & /*selectie_woningen_bouwperiode*/ 2) && t35_value !== (t35_value = numberWithCommas(/*selectie_woningen_bouwperiode*/ ctx[1][6].value) + "")) set_data_dev(t35, t35_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(donutchartbouwperiode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(donutchartbouwperiode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(donutchartbouwperiode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(161:20) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (118:16) <Window {value} class="ma-0">
    function create_default_slot_3$2(ctx) {
    	let windowitem0;
    	let t0;
    	let windowitem1;
    	let t1;
    	let windowitem2;
    	let t2;
    	let windowitem3;
    	let t3;
    	let windowitem4;
    	let current;

    	windowitem0 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem1 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem2 = new WindowItem({ $$inline: true });

    	windowitem3 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem4 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(windowitem0.$$.fragment);
    			t0 = space();
    			create_component(windowitem1.$$.fragment);
    			t1 = space();
    			create_component(windowitem2.$$.fragment);
    			t2 = space();
    			create_component(windowitem3.$$.fragment);
    			t3 = space();
    			create_component(windowitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(windowitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(windowitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(windowitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(windowitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(windowitem4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const windowitem0_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				windowitem0_changes.$$scope = { dirty, ctx };
    			}

    			windowitem0.$set(windowitem0_changes);
    			const windowitem1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				windowitem1_changes.$$scope = { dirty, ctx };
    			}

    			windowitem1.$set(windowitem1_changes);
    			const windowitem2_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				windowitem2_changes.$$scope = { dirty, ctx };
    			}

    			windowitem2.$set(windowitem2_changes);
    			const windowitem3_changes = {};

    			if (dirty & /*$$scope, selectie_woningen_woningtype*/ 262145) {
    				windowitem3_changes.$$scope = { dirty, ctx };
    			}

    			windowitem3.$set(windowitem3_changes);
    			const windowitem4_changes = {};

    			if (dirty & /*$$scope, selectie_woningen_bouwperiode, selectie_woningen_woningtype*/ 262147) {
    				windowitem4_changes.$$scope = { dirty, ctx };
    			}

    			windowitem4.$set(windowitem4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(windowitem0.$$.fragment, local);
    			transition_in(windowitem1.$$.fragment, local);
    			transition_in(windowitem2.$$.fragment, local);
    			transition_in(windowitem3.$$.fragment, local);
    			transition_in(windowitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(windowitem0.$$.fragment, local);
    			transition_out(windowitem1.$$.fragment, local);
    			transition_out(windowitem2.$$.fragment, local);
    			transition_out(windowitem3.$$.fragment, local);
    			transition_out(windowitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(windowitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(windowitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(windowitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(windowitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(windowitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(118:16) <Window {value} class=\\\"ma-0\\\">",
    		ctx
    	});

    	return block;
    }

    // (103:8) <ExpansionPanel>
    function create_default_slot_2$2(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let tabs;
    	let updating_value;
    	let t2;
    	let window_1;
    	let current;

    	function tabs_value_binding(value) {
    		/*tabs_value_binding*/ ctx[6].call(null, value);
    	}

    	let tabs_props = {
    		class: "black-text text-accent-3",
    		$$slots: { tabs: [create_tabs_slot] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[3] !== void 0) {
    		tabs_props.value = /*value*/ ctx[3];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, "value", tabs_value_binding));

    	window_1 = new Window({
    			props: {
    				value: /*value*/ ctx[3],
    				class: "ma-0",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			create_component(window_1.$$.fragment);
    			set_style(div, "height", "290px");
    			set_style(div, "width", "100%");
    			add_location(div, file$i, 107, 12, 4601);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(tabs, div, null);
    			append_dev(div, t2);
    			mount_component(window_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 8) {
    				updating_value = true;
    				tabs_changes.value = /*value*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			tabs.$set(tabs_changes);
    			const window_1_changes = {};
    			if (dirty & /*value*/ 8) window_1_changes.value = /*value*/ ctx[3];

    			if (dirty & /*$$scope, selectie_woningen_bouwperiode, selectie_woningen_woningtype*/ 262147) {
    				window_1_changes.$$scope = { dirty, ctx };
    			}

    			window_1.$set(window_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(window_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(window_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(tabs);
    			destroy_component(window_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(103:8) <ExpansionPanel>",
    		ctx
    	});

    	return block;
    }

    // (102:4) <ExpansionPanels tile class="rounded-0" bind:value={klapuit_output} style="pointer-events: all; position:absolute; left: 5px; bottom:5px; width: 800px; border-top-left-radius:0px; border-top-right-radius:0px;">
    function create_default_slot_1$3(ctx) {
    	let expansionpanel;
    	let current;

    	expansionpanel = new ExpansionPanel({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2$2],
    					icon: [
    						create_icon_slot,
    						({ active }) => ({ 17: active }),
    						({ active }) => active ? 131072 : 0
    					],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expansionpanel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanel_changes = {};

    			if (dirty & /*$$scope, value, selectie_woningen_bouwperiode, selectie_woningen_woningtype, selectie_buurtnamen, active*/ 393231) {
    				expansionpanel_changes.$$scope = { dirty, ctx };
    			}

    			expansionpanel.$set(expansionpanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(102:4) <ExpansionPanels tile class=\\\"rounded-0\\\" bind:value={klapuit_output} style=\\\"pointer-events: all; position:absolute; left: 5px; bottom:5px; width: 800px; border-top-left-radius:0px; border-top-right-radius:0px;\\\">",
    		ctx
    	});

    	return block;
    }

    // (101:0) <MaterialApp {theme}>
    function create_default_slot$5(ctx) {
    	let expansionpanels;
    	let updating_value;
    	let current;

    	function expansionpanels_value_binding(value) {
    		/*expansionpanels_value_binding*/ ctx[7].call(null, value);
    	}

    	let expansionpanels_props = {
    		tile: true,
    		class: "rounded-0",
    		style: "pointer-events: all; position:absolute; left: 5px; bottom:5px; width: 800px; border-top-left-radius:0px; border-top-right-radius:0px;",
    		$$slots: { default: [create_default_slot_1$3] },
    		$$scope: { ctx }
    	};

    	if (/*klapuit_output*/ ctx[4] !== void 0) {
    		expansionpanels_props.value = /*klapuit_output*/ ctx[4];
    	}

    	expansionpanels = new ExpansionPanels({
    			props: expansionpanels_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(expansionpanels, "value", expansionpanels_value_binding));

    	const block = {
    		c: function create() {
    			create_component(expansionpanels.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanels_changes = {};

    			if (dirty & /*$$scope, value, selectie_woningen_bouwperiode, selectie_woningen_woningtype, selectie_buurtnamen*/ 262159) {
    				expansionpanels_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*klapuit_output*/ 16) {
    				updating_value = true;
    				expansionpanels_changes.value = /*klapuit_output*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			expansionpanels.$set(expansionpanels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanels, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(101:0) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[5],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, klapuit_output, value, selectie_woningen_bouwperiode, selectie_woningen_woningtype, selectie_buurtnamen*/ 262175) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function numberWithCommas(x) {
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function generate_selection_string(selectie_buurtnamen) {
    	var i;
    	var returnstring = "";
    	console.log(selectie_buurtnamen);

    	if (selectie_buurtnamen) {
    		for (i = 0; i < selectie_buurtnamen.length; i++) {
    			returnstring = returnstring.concat(selectie_buurtnamen[i]);

    			if (selectie_buurtnamen.length - i > 1) {
    				returnstring = returnstring.concat(", ");
    			}
    		}

    		return returnstring;
    	}

    	return "";
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("OutputPanel", slots, []);
    	var data_gemeenten;

    	store_input_primarydataset_raw.subscribe(value => {
    		data_gemeenten = value;
    	});

    	var selectie_woningen_woningtype;

    	store_selectie_woningen_woningtype.subscribe(value => {
    		$$invalidate(0, selectie_woningen_woningtype = value);
    	});

    	var selectie_woningen_bouwperiode;

    	store_selectie_woningen_bouwperiode.subscribe(value => {
    		$$invalidate(1, selectie_woningen_bouwperiode = value);
    	});

    	var selectie_buurtnamen;

    	store_selectie_buurtnamen.subscribe(value => {
    		$$invalidate(2, selectie_buurtnamen = value);
    	});

    	var lengte_transportleiding_current;

    	store_instelling_lengtetransportleiding.subscribe(value => {
    		lengte_transportleiding_current = value;
    	});

    	var results_dynamic_listen;

    	store_tussenresultaat_primarydataset_processed.subscribe(value => {
    		results_dynamic_listen = value;
    	});

    	var results_static_listen;

    	store_input_primarydataset_processed.subscribe(value => {
    		results_static_listen = value;
    	});

    	var data_boxchart;

    	store_visualisatiedataset_bubblechart.subscribe(value => {
    		data_boxchart = value;
    	});

    	var slider_s2_gjtarief;

    	store_instelling_gjtarief.subscribe(value => {
    		slider_s2_gjtarief = value;
    	});

    	let theme = "light";

    	onMount(() => {
    		d3.selectAll("#OutputPanel .horizontal").style("margin", "0px");
    		d3.selectAll("#OutputPanel .s-expansion-panel__header").style("background-color", "#323232");
    		d3.selectAll("#OutputPanel .s-expansion-panel__header").style("margin-bottom", "0px");
    	});

    	let value = 0;
    	let yeah;

    	// $: console.log(klapuit_output);
    	let klapuit_output = [1]; //start closed

    	window.toggle_output = n => {
    		if (klapuit_output[0] == 1 || klapuit_output.length == 0) {
    			$$invalidate(4, klapuit_output = [0]); //open

    			setTimeout(
    				function () {
    					draw_racechart();
    				},
    				100
    			); //neaten
    		}
    	};

    	var dyna = results_dynamic_listen;
    	var stati = store_input_primarydataset_processed;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<OutputPanel> was created with unknown prop '${key}'`);
    	});

    	function tabs_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(3, value);
    	}

    	function expansionpanels_value_binding(value) {
    		klapuit_output = value;
    		$$invalidate(4, klapuit_output);
    	}

    	$$self.$capture_state = () => ({
    		store_visualisatiedataset_bubblechart,
    		mdiArrowUpDropCircle,
    		MaterialApp,
    		Tabs,
    		Tab,
    		Icon,
    		Window,
    		WindowItem,
    		ExpansionPanels,
    		ExpansionPanel,
    		onMount,
    		store_input_primarydataset_raw,
    		data_gemeenten,
    		RaceChart,
    		BlockChart: BubbleChart,
    		DonutChartBouwperiode: DonutChart_bouwperiode,
    		DonutChartWoningtype: DonutChart_woningtype,
    		store_selectie_woningen_woningtype,
    		selectie_woningen_woningtype,
    		store_selectie_woningen_bouwperiode,
    		selectie_woningen_bouwperiode,
    		store_selectie_buurtnamen,
    		selectie_buurtnamen,
    		store_tussenresultaat_primarydataset_processed,
    		store_input_primarydataset_processed,
    		store_instelling_lengtetransportleiding,
    		lengte_transportleiding_current,
    		results_dynamic_listen,
    		results_static_listen,
    		data_boxchart,
    		store_instelling_gjtarief,
    		slider_s2_gjtarief,
    		theme,
    		value,
    		yeah,
    		klapuit_output,
    		dyna,
    		stati,
    		numberWithCommas,
    		generate_selection_string
    	});

    	$$self.$inject_state = $$props => {
    		if ("data_gemeenten" in $$props) data_gemeenten = $$props.data_gemeenten;
    		if ("selectie_woningen_woningtype" in $$props) $$invalidate(0, selectie_woningen_woningtype = $$props.selectie_woningen_woningtype);
    		if ("selectie_woningen_bouwperiode" in $$props) $$invalidate(1, selectie_woningen_bouwperiode = $$props.selectie_woningen_bouwperiode);
    		if ("selectie_buurtnamen" in $$props) $$invalidate(2, selectie_buurtnamen = $$props.selectie_buurtnamen);
    		if ("lengte_transportleiding_current" in $$props) lengte_transportleiding_current = $$props.lengte_transportleiding_current;
    		if ("results_dynamic_listen" in $$props) results_dynamic_listen = $$props.results_dynamic_listen;
    		if ("results_static_listen" in $$props) results_static_listen = $$props.results_static_listen;
    		if ("data_boxchart" in $$props) data_boxchart = $$props.data_boxchart;
    		if ("slider_s2_gjtarief" in $$props) slider_s2_gjtarief = $$props.slider_s2_gjtarief;
    		if ("theme" in $$props) $$invalidate(5, theme = $$props.theme);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("yeah" in $$props) yeah = $$props.yeah;
    		if ("klapuit_output" in $$props) $$invalidate(4, klapuit_output = $$props.klapuit_output);
    		if ("dyna" in $$props) dyna = $$props.dyna;
    		if ("stati" in $$props) stati = $$props.stati;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectie_woningen_woningtype,
    		selectie_woningen_bouwperiode,
    		selectie_buurtnamen,
    		value,
    		klapuit_output,
    		theme,
    		tabs_value_binding,
    		expansionpanels_value_binding
    	];
    }

    class OutputPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OutputPanel",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/LegendaPanel.svelte generated by Svelte v3.32.1 */

    const { console: console_1$1 } = globals;
    const file$j = "src/LegendaPanel.svelte";

    // (47:12) <span class="white-text text-accent-3" slot="header" style="position:absolute; margin-bottom:20px; font-size: 18px; top:22px; font-family:'Varela Round';">
    function create_header_slot$1(ctx) {
    	let span;
    	let strong;

    	const block = {
    		c: function create() {
    			span = element("span");
    			strong = element("strong");
    			strong.textContent = "Legenda";
    			add_location(strong, file$j, 46, 167, 2243);
    			attr_dev(span, "class", "white-text text-accent-3");
    			attr_dev(span, "slot", "header");
    			set_style(span, "position", "absolute");
    			set_style(span, "margin-bottom", "20px");
    			set_style(span, "font-size", "18px");
    			set_style(span, "top", "22px");
    			set_style(span, "font-family", "'Varela Round'");
    			add_location(span, file$j, 46, 12, 2088);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, strong);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$1.name,
    		type: "slot",
    		source: "(47:12) <span class=\\\"white-text text-accent-3\\\" slot=\\\"header\\\" style=\\\"position:absolute; margin-bottom:20px; font-size: 18px; top:22px; font-family:'Varela Round';\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:12) <span slot="icon" let:active>
    function create_icon_slot$1(ctx) {
    	let span;
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				path: mdiArrowUpDropCircle,
    				size: "40px",
    				class: "mdi white-text",
    				rotate: /*active*/ ctx[5] ? 0 : 180
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "slot", "icon");
    			add_location(span, file$j, 47, 12, 2287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*active*/ 32) icon_changes.rotate = /*active*/ ctx[5] ? 0 : 180;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot$1.name,
    		type: "slot",
    		source: "(48:12) <span slot=\\\"icon\\\" let:active>",
    		ctx
    	});

    	return block;
    }

    // (69:24) {#if instelling_mapcontextswitch == 'dichtheid'}
    function create_if_block_2(ctx) {
    	let div9;
    	let p;
    	let strong;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t8;
    	let div7;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bebouwingsdichtheid";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Laag";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Gemiddeld";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			div7.textContent = "Hoog";
    			add_location(strong, file$j, 70, 35, 3786);
    			attr_dev(p, "class", "svelte-va69wt");
    			add_location(p, file$j, 70, 32, 3783);
    			attr_dev(div0, "class", "legenda_key svelte-va69wt");
    			set_style(div0, "background-color", "#bdbdbd");
    			add_location(div0, file$j, 72, 36, 3922);
    			attr_dev(div1, "class", "legenda_text svelte-va69wt");
    			add_location(div1, file$j, 73, 36, 4024);
    			attr_dev(div2, "class", "legenda_item svelte-va69wt");
    			add_location(div2, file$j, 71, 32, 3859);
    			attr_dev(div3, "class", "legenda_key svelte-va69wt");
    			set_style(div3, "background-color", "#757575");
    			add_location(div3, file$j, 76, 36, 4195);
    			attr_dev(div4, "class", "legenda_text svelte-va69wt");
    			add_location(div4, file$j, 77, 36, 4297);
    			attr_dev(div5, "class", "legenda_item svelte-va69wt");
    			add_location(div5, file$j, 75, 32, 4132);
    			attr_dev(div6, "class", "legenda_key svelte-va69wt");
    			set_style(div6, "background-color", "#424242");
    			add_location(div6, file$j, 80, 36, 4473);
    			attr_dev(div7, "class", "legenda_text svelte-va69wt");
    			add_location(div7, file$j, 81, 36, 4575);
    			attr_dev(div8, "class", "legenda_item svelte-va69wt");
    			add_location(div8, file$j, 79, 32, 4410);
    			attr_dev(div9, "class", "legenda_sectie svelte-va69wt");
    			add_location(div9, file$j, 69, 28, 3722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, p);
    			append_dev(p, strong);
    			append_dev(div9, t1);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(69:24) {#if instelling_mapcontextswitch == 'dichtheid'}",
    		ctx
    	});

    	return block;
    }

    // (87:24) {#if instelling_mapcontextswitch == 'bouwperiode'}
    function create_if_block_1$2(ctx) {
    	let div9;
    	let p;
    	let strong;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t8;
    	let div7;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bouwperiode";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Oud";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Gemiddeld";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			div7.textContent = "Nieuw";
    			add_location(strong, file$j, 88, 35, 4908);
    			attr_dev(p, "class", "svelte-va69wt");
    			add_location(p, file$j, 88, 32, 4905);
    			attr_dev(div0, "class", "legenda_key svelte-va69wt");
    			set_style(div0, "background-color", "#bdbdbd");
    			add_location(div0, file$j, 90, 36, 5036);
    			attr_dev(div1, "class", "legenda_text svelte-va69wt");
    			add_location(div1, file$j, 91, 36, 5138);
    			attr_dev(div2, "class", "legenda_item svelte-va69wt");
    			add_location(div2, file$j, 89, 32, 4973);
    			attr_dev(div3, "class", "legenda_key svelte-va69wt");
    			set_style(div3, "background-color", "#757575");
    			add_location(div3, file$j, 94, 36, 5308);
    			attr_dev(div4, "class", "legenda_text svelte-va69wt");
    			add_location(div4, file$j, 95, 36, 5410);
    			attr_dev(div5, "class", "legenda_item svelte-va69wt");
    			add_location(div5, file$j, 93, 32, 5245);
    			attr_dev(div6, "class", "legenda_key svelte-va69wt");
    			set_style(div6, "background-color", "#424242");
    			add_location(div6, file$j, 98, 36, 5586);
    			attr_dev(div7, "class", "legenda_text svelte-va69wt");
    			add_location(div7, file$j, 99, 36, 5688);
    			attr_dev(div8, "class", "legenda_item svelte-va69wt");
    			add_location(div8, file$j, 97, 32, 5523);
    			attr_dev(div9, "class", "legenda_sectie svelte-va69wt");
    			add_location(div9, file$j, 87, 28, 4844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, p);
    			append_dev(p, strong);
    			append_dev(div9, t1);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(87:24) {#if instelling_mapcontextswitch == 'bouwperiode'}",
    		ctx
    	});

    	return block;
    }

    // (161:24) {:else}
    function create_else_block(ctx) {
    	let html_tag;
    	let raw_value = resize_legend(290) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(161:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (104:24) {#if instelling_mapcontextswitch == 'd02'}
    function create_if_block$6(ctx) {
    	let div39;
    	let p;
    	let strong;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t8;
    	let div7;
    	let t10;
    	let div11;
    	let div9;
    	let t11;
    	let div10;
    	let t13;
    	let div14;
    	let div12;
    	let t14;
    	let div13;
    	let t16;
    	let div17;
    	let div15;
    	let t17;
    	let div16;
    	let t19;
    	let div20;
    	let div18;
    	let t20;
    	let div19;
    	let t22;
    	let div23;
    	let div21;
    	let t23;
    	let div22;
    	let t25;
    	let div26;
    	let div24;
    	let t26;
    	let div25;
    	let t28;
    	let div29;
    	let div27;
    	let t29;
    	let div28;
    	let t31;
    	let div32;
    	let div30;
    	let t32;
    	let div31;
    	let t34;
    	let div35;
    	let div33;
    	let t35;
    	let div34;
    	let t37;
    	let div38;
    	let div36;
    	let t38;
    	let div37;
    	let t40;
    	let html_tag;
    	let raw_value = resize_legend(500) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			div39 = element("div");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bestedingsruimte warmtebron";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "< 0 €/GJ";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "0 - 2 €/GJ";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			div7.textContent = "2 - 4 €/GJ";
    			t10 = space();
    			div11 = element("div");
    			div9 = element("div");
    			t11 = space();
    			div10 = element("div");
    			div10.textContent = "4 - 6 €/GJ";
    			t13 = space();
    			div14 = element("div");
    			div12 = element("div");
    			t14 = space();
    			div13 = element("div");
    			div13.textContent = "6 - 8 €/GJ";
    			t16 = space();
    			div17 = element("div");
    			div15 = element("div");
    			t17 = space();
    			div16 = element("div");
    			div16.textContent = "8 - 10 €/GJ";
    			t19 = space();
    			div20 = element("div");
    			div18 = element("div");
    			t20 = space();
    			div19 = element("div");
    			div19.textContent = "10 - 12 €/GJ";
    			t22 = space();
    			div23 = element("div");
    			div21 = element("div");
    			t23 = space();
    			div22 = element("div");
    			div22.textContent = "12 - 14 €/GJ";
    			t25 = space();
    			div26 = element("div");
    			div24 = element("div");
    			t26 = space();
    			div25 = element("div");
    			div25.textContent = "14 - 16 €/GJ";
    			t28 = space();
    			div29 = element("div");
    			div27 = element("div");
    			t29 = space();
    			div28 = element("div");
    			div28.textContent = "16 - 18 €/GJ";
    			t31 = space();
    			div32 = element("div");
    			div30 = element("div");
    			t32 = space();
    			div31 = element("div");
    			div31.textContent = "18 - 20 €/GJ";
    			t34 = space();
    			div35 = element("div");
    			div33 = element("div");
    			t35 = space();
    			div34 = element("div");
    			div34.textContent = "20 - 30 €/GJ";
    			t37 = space();
    			div38 = element("div");
    			div36 = element("div");
    			t38 = space();
    			div37 = element("div");
    			div37.textContent = "30+ €/GJ";
    			t40 = space();
    			html_anchor = empty();
    			add_location(strong, file$j, 105, 35, 5989);
    			attr_dev(p, "class", "svelte-va69wt");
    			add_location(p, file$j, 105, 32, 5986);
    			attr_dev(div0, "class", "legenda_key svelte-va69wt");
    			set_style(div0, "background-color", "#181818");
    			add_location(div0, file$j, 107, 36, 6134);
    			attr_dev(div1, "class", "legenda_text svelte-va69wt");
    			add_location(div1, file$j, 108, 36, 6236);
    			attr_dev(div2, "class", "legenda_item svelte-va69wt");
    			add_location(div2, file$j, 106, 32, 6070);
    			attr_dev(div3, "class", "legenda_key svelte-va69wt");
    			set_style(div3, "background-color", "#383838");
    			add_location(div3, file$j, 111, 36, 6414);
    			attr_dev(div4, "class", "legenda_text svelte-va69wt");
    			add_location(div4, file$j, 112, 36, 6516);
    			attr_dev(div5, "class", "legenda_item svelte-va69wt");
    			add_location(div5, file$j, 110, 32, 6351);
    			attr_dev(div6, "class", "legenda_key svelte-va69wt");
    			set_style(div6, "background-color", "#464646");
    			add_location(div6, file$j, 115, 36, 6693);
    			attr_dev(div7, "class", "legenda_text svelte-va69wt");
    			add_location(div7, file$j, 116, 36, 6795);
    			attr_dev(div8, "class", "legenda_item svelte-va69wt");
    			add_location(div8, file$j, 114, 32, 6630);
    			attr_dev(div9, "class", "legenda_key svelte-va69wt");
    			set_style(div9, "background-color", "#555555");
    			add_location(div9, file$j, 119, 36, 6972);
    			attr_dev(div10, "class", "legenda_text svelte-va69wt");
    			add_location(div10, file$j, 120, 36, 7074);
    			attr_dev(div11, "class", "legenda_item svelte-va69wt");
    			add_location(div11, file$j, 118, 32, 6909);
    			attr_dev(div12, "class", "legenda_key svelte-va69wt");
    			set_style(div12, "background-color", "#646464");
    			add_location(div12, file$j, 123, 36, 7251);
    			attr_dev(div13, "class", "legenda_text svelte-va69wt");
    			add_location(div13, file$j, 124, 36, 7353);
    			attr_dev(div14, "class", "legenda_item svelte-va69wt");
    			add_location(div14, file$j, 122, 32, 7188);
    			attr_dev(div15, "class", "legenda_key svelte-va69wt");
    			set_style(div15, "background-color", "#747474");
    			add_location(div15, file$j, 127, 36, 7530);
    			attr_dev(div16, "class", "legenda_text svelte-va69wt");
    			add_location(div16, file$j, 128, 36, 7632);
    			attr_dev(div17, "class", "legenda_item svelte-va69wt");
    			add_location(div17, file$j, 126, 32, 7467);
    			attr_dev(div18, "class", "legenda_key svelte-va69wt");
    			set_style(div18, "background-color", "#848484");
    			add_location(div18, file$j, 131, 36, 7810);
    			attr_dev(div19, "class", "legenda_text svelte-va69wt");
    			add_location(div19, file$j, 132, 36, 7912);
    			attr_dev(div20, "class", "legenda_item svelte-va69wt");
    			add_location(div20, file$j, 130, 32, 7747);
    			attr_dev(div21, "class", "legenda_key svelte-va69wt");
    			set_style(div21, "background-color", "#959595");
    			add_location(div21, file$j, 135, 36, 8091);
    			attr_dev(div22, "class", "legenda_text svelte-va69wt");
    			add_location(div22, file$j, 136, 36, 8193);
    			attr_dev(div23, "class", "legenda_item svelte-va69wt");
    			add_location(div23, file$j, 134, 32, 8028);
    			attr_dev(div24, "class", "legenda_key svelte-va69wt");
    			set_style(div24, "background-color", "#a6a6a6");
    			add_location(div24, file$j, 139, 36, 8372);
    			attr_dev(div25, "class", "legenda_text svelte-va69wt");
    			add_location(div25, file$j, 140, 36, 8474);
    			attr_dev(div26, "class", "legenda_item svelte-va69wt");
    			add_location(div26, file$j, 138, 32, 8309);
    			attr_dev(div27, "class", "legenda_key svelte-va69wt");
    			set_style(div27, "background-color", "#bcbcbc");
    			add_location(div27, file$j, 143, 36, 8653);
    			attr_dev(div28, "class", "legenda_text svelte-va69wt");
    			add_location(div28, file$j, 144, 36, 8755);
    			attr_dev(div29, "class", "legenda_item svelte-va69wt");
    			add_location(div29, file$j, 142, 32, 8590);
    			attr_dev(div30, "class", "legenda_key svelte-va69wt");
    			set_style(div30, "background-color", "#d2d2d2");
    			add_location(div30, file$j, 147, 36, 8934);
    			attr_dev(div31, "class", "legenda_text svelte-va69wt");
    			add_location(div31, file$j, 148, 36, 9036);
    			attr_dev(div32, "class", "legenda_item svelte-va69wt");
    			add_location(div32, file$j, 146, 32, 8871);
    			attr_dev(div33, "class", "legenda_key svelte-va69wt");
    			set_style(div33, "background-color", "#e8e8e8");
    			add_location(div33, file$j, 151, 36, 9215);
    			attr_dev(div34, "class", "legenda_text svelte-va69wt");
    			add_location(div34, file$j, 152, 36, 9317);
    			attr_dev(div35, "class", "legenda_item svelte-va69wt");
    			add_location(div35, file$j, 150, 32, 9152);
    			attr_dev(div36, "class", "legenda_key svelte-va69wt");
    			set_style(div36, "background-color", "#ffffff");
    			add_location(div36, file$j, 155, 36, 9496);
    			attr_dev(div37, "class", "legenda_text svelte-va69wt");
    			add_location(div37, file$j, 156, 36, 9598);
    			attr_dev(div38, "class", "legenda_item svelte-va69wt");
    			add_location(div38, file$j, 154, 32, 9433);
    			attr_dev(div39, "class", "legenda_sectie svelte-va69wt");
    			add_location(div39, file$j, 104, 28, 5925);
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div39, anchor);
    			append_dev(div39, p);
    			append_dev(p, strong);
    			append_dev(div39, t1);
    			append_dev(div39, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div39, t4);
    			append_dev(div39, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div39, t7);
    			append_dev(div39, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div39, t10);
    			append_dev(div39, div11);
    			append_dev(div11, div9);
    			append_dev(div11, t11);
    			append_dev(div11, div10);
    			append_dev(div39, t13);
    			append_dev(div39, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t14);
    			append_dev(div14, div13);
    			append_dev(div39, t16);
    			append_dev(div39, div17);
    			append_dev(div17, div15);
    			append_dev(div17, t17);
    			append_dev(div17, div16);
    			append_dev(div39, t19);
    			append_dev(div39, div20);
    			append_dev(div20, div18);
    			append_dev(div20, t20);
    			append_dev(div20, div19);
    			append_dev(div39, t22);
    			append_dev(div39, div23);
    			append_dev(div23, div21);
    			append_dev(div23, t23);
    			append_dev(div23, div22);
    			append_dev(div39, t25);
    			append_dev(div39, div26);
    			append_dev(div26, div24);
    			append_dev(div26, t26);
    			append_dev(div26, div25);
    			append_dev(div39, t28);
    			append_dev(div39, div29);
    			append_dev(div29, div27);
    			append_dev(div29, t29);
    			append_dev(div29, div28);
    			append_dev(div39, t31);
    			append_dev(div39, div32);
    			append_dev(div32, div30);
    			append_dev(div32, t32);
    			append_dev(div32, div31);
    			append_dev(div39, t34);
    			append_dev(div39, div35);
    			append_dev(div35, div33);
    			append_dev(div35, t35);
    			append_dev(div35, div34);
    			append_dev(div39, t37);
    			append_dev(div39, div38);
    			append_dev(div38, div36);
    			append_dev(div38, t38);
    			append_dev(div38, div37);
    			insert_dev(target, t40, anchor);
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div39);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(104:24) {#if instelling_mapcontextswitch == 'd02'}",
    		ctx
    	});

    	return block;
    }

    // (53:20) <WindowItem>
    function create_default_slot_4$3(ctx) {
    	let div9;
    	let p;
    	let strong;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t8;
    	let div7;
    	let t10;
    	let t11;
    	let t12;
    	let if_block2_anchor;
    	let if_block0 = /*instelling_mapcontextswitch*/ ctx[1] == "dichtheid" && create_if_block_2(ctx);
    	let if_block1 = /*instelling_mapcontextswitch*/ ctx[1] == "bouwperiode" && create_if_block_1$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*instelling_mapcontextswitch*/ ctx[1] == "d02") return create_if_block$6;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Strategie met de laagste kosten";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Individueel, warmtepomp (B+)";
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Collectief, warmtenet (B+)";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			div7.textContent = "Collectief, warmtenet (D+)";
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    			add_location(strong, file$j, 54, 31, 2698);
    			attr_dev(p, "class", "svelte-va69wt");
    			add_location(p, file$j, 54, 28, 2695);
    			attr_dev(div0, "class", "legenda_key svelte-va69wt");
    			set_style(div0, "background-color", "#90caf9");
    			add_location(div0, file$j, 56, 32, 2838);
    			attr_dev(div1, "class", "legenda_text svelte-va69wt");
    			add_location(div1, file$j, 57, 32, 2936);
    			attr_dev(div2, "class", "legenda_item svelte-va69wt");
    			add_location(div2, file$j, 55, 28, 2779);
    			attr_dev(div3, "class", "legenda_key svelte-va69wt");
    			set_style(div3, "background-color", "#ffecb3");
    			add_location(div3, file$j, 60, 32, 3119);
    			attr_dev(div4, "class", "legenda_text svelte-va69wt");
    			add_location(div4, file$j, 61, 32, 3217);
    			attr_dev(div5, "class", "legenda_item svelte-va69wt");
    			add_location(div5, file$j, 59, 28, 3060);
    			attr_dev(div6, "class", "legenda_key svelte-va69wt");
    			set_style(div6, "background-color", "#ffab91");
    			add_location(div6, file$j, 64, 32, 3398);
    			attr_dev(div7, "class", "legenda_text svelte-va69wt");
    			add_location(div7, file$j, 65, 32, 3496);
    			attr_dev(div8, "class", "legenda_item svelte-va69wt");
    			add_location(div8, file$j, 63, 28, 3339);
    			attr_dev(div9, "class", "legenda_sectie svelte-va69wt");
    			add_location(div9, file$j, 53, 24, 2638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, p);
    			append_dev(p, strong);
    			append_dev(div9, t1);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			insert_dev(target, t10, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*instelling_mapcontextswitch*/ ctx[1] == "dichtheid") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t11.parentNode, t11);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*instelling_mapcontextswitch*/ ctx[1] == "bouwperiode") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(t12.parentNode, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t10);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t12);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(53:20) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (52:16) <Window {value} class="ma-0">
    function create_default_slot_3$3(ctx) {
    	let windowitem;
    	let current;

    	windowitem = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(windowitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(windowitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const windowitem_changes = {};

    			if (dirty & /*$$scope, instelling_mapcontextswitch*/ 66) {
    				windowitem_changes.$$scope = { dirty, ctx };
    			}

    			windowitem.$set(windowitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(windowitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(windowitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(windowitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(52:16) <Window {value} class=\\\"ma-0\\\">",
    		ctx
    	});

    	return block;
    }

    // (46:8) <ExpansionPanel>
    function create_default_slot_2$3(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let window_1;
    	let current;

    	window_1 = new Window({
    			props: {
    				value: /*value*/ ctx[3],
    				class: "ma-0",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			div = element("div");
    			create_component(window_1.$$.fragment);
    			attr_dev(div, "id", "legenda_content_container");
    			set_style(div, "height", "290px");
    			set_style(div, "width", "100%");
    			add_location(div, file$j, 50, 12, 2462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(window_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const window_1_changes = {};

    			if (dirty & /*$$scope, instelling_mapcontextswitch*/ 66) {
    				window_1_changes.$$scope = { dirty, ctx };
    			}

    			window_1.$set(window_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(window_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(window_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(window_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(46:8) <ExpansionPanel>",
    		ctx
    	});

    	return block;
    }

    // (45:4) <ExpansionPanels tile class="rounded-0" bind:value={klapuit_legenda} style="pointer-events: all; position:absolute; right: 5px; top:3px; width: 300px; border-top-left-radius:0px; border-top-right-radius:0px;">
    function create_default_slot_1$4(ctx) {
    	let expansionpanel;
    	let current;

    	expansionpanel = new ExpansionPanel({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2$3],
    					icon: [
    						create_icon_slot$1,
    						({ active }) => ({ 5: active }),
    						({ active }) => active ? 32 : 0
    					],
    					header: [create_header_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expansionpanel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanel_changes = {};

    			if (dirty & /*$$scope, instelling_mapcontextswitch, active*/ 98) {
    				expansionpanel_changes.$$scope = { dirty, ctx };
    			}

    			expansionpanel.$set(expansionpanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(45:4) <ExpansionPanels tile class=\\\"rounded-0\\\" bind:value={klapuit_legenda} style=\\\"pointer-events: all; position:absolute; right: 5px; top:3px; width: 300px; border-top-left-radius:0px; border-top-right-radius:0px;\\\">",
    		ctx
    	});

    	return block;
    }

    // (44:0) <MaterialApp {theme}>
    function create_default_slot$6(ctx) {
    	let expansionpanels;
    	let updating_value;
    	let current;

    	function expansionpanels_value_binding(value) {
    		/*expansionpanels_value_binding*/ ctx[4].call(null, value);
    	}

    	let expansionpanels_props = {
    		tile: true,
    		class: "rounded-0",
    		style: "pointer-events: all; position:absolute; right: 5px; top:3px; width: 300px; border-top-left-radius:0px; border-top-right-radius:0px;",
    		$$slots: { default: [create_default_slot_1$4] },
    		$$scope: { ctx }
    	};

    	if (/*klapuit_legenda*/ ctx[0] !== void 0) {
    		expansionpanels_props.value = /*klapuit_legenda*/ ctx[0];
    	}

    	expansionpanels = new ExpansionPanels({
    			props: expansionpanels_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(expansionpanels, "value", expansionpanels_value_binding));

    	const block = {
    		c: function create() {
    			create_component(expansionpanels.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expansionpanels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expansionpanels_changes = {};

    			if (dirty & /*$$scope, instelling_mapcontextswitch*/ 66) {
    				expansionpanels_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*klapuit_legenda*/ 1) {
    				updating_value = true;
    				expansionpanels_changes.value = /*klapuit_legenda*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			expansionpanels.$set(expansionpanels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expansionpanels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expansionpanels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expansionpanels, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(44:0) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[2],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, klapuit_legenda, instelling_mapcontextswitch*/ 67) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function resize_legend(height) {
    	d3.select("#legenda_content_container").style("height", height + "px");
    	return "";
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LegendaPanel", slots, []);
    	var instelling_mapcontextswitch;

    	store_instelling_mapcontextswitch.subscribe(value => {
    		$$invalidate(1, instelling_mapcontextswitch = value);
    	});

    	let theme = "light";
    	let value = 0;

    	onMount(() => {
    		d3.selectAll("#LegendaPanel .horizontal").style("margin", "0px");
    		d3.selectAll("#LegendaPanel .s-expansion-panel__header").style("background-color", "#323232");
    		d3.selectAll("#LegendaPanel .s-expansion-panel__header").style("margin-bottom", "0px");
    	});

    	
    	let klapuit_legenda = [1]; //start closed

    	window.toggle_legenda = n => {
    		if (klapuit_legenda[0] == 1 || klapuit_legenda.length == 0) {
    			$$invalidate(0, klapuit_legenda = [0]); //open
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<LegendaPanel> was created with unknown prop '${key}'`);
    	});

    	function expansionpanels_value_binding(value) {
    		klapuit_legenda = value;
    		$$invalidate(0, klapuit_legenda);
    	}

    	$$self.$capture_state = () => ({
    		mdiArrowUpDropCircle,
    		MaterialApp,
    		Icon,
    		Window,
    		WindowItem,
    		ExpansionPanels,
    		ExpansionPanel,
    		onMount,
    		store_instelling_mapcontextswitch,
    		instelling_mapcontextswitch,
    		theme,
    		value,
    		klapuit_legenda,
    		resize_legend
    	});

    	$$self.$inject_state = $$props => {
    		if ("instelling_mapcontextswitch" in $$props) $$invalidate(1, instelling_mapcontextswitch = $$props.instelling_mapcontextswitch);
    		if ("theme" in $$props) $$invalidate(2, theme = $$props.theme);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("klapuit_legenda" in $$props) $$invalidate(0, klapuit_legenda = $$props.klapuit_legenda);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*klapuit_legenda*/ 1) {
    			 if (klapuit_legenda.length > 0) {
    				console.log("uitgeklapt");
    				d3.selectAll(".leaflet-control").transition().duration(200).style("right", "305px").style("top", "85px");
    				d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-305px");
    			} else {
    				d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-5px");
    				d3.selectAll(".leaflet-control").transition().duration(200).style("top", "85px").style("right", "5px");
    			}
    		}
    	};

    	return [
    		klapuit_legenda,
    		instelling_mapcontextswitch,
    		theme,
    		value,
    		expansionpanels_value_binding
    	];
    }

    class LegendaPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LegendaPanel",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/Map.svelte generated by Svelte v3.32.1 */

    function create_fragment$q(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	var selectie_gemeentenaam;

    	store_selectie_gemeentenaam.subscribe(value => {
    		selectie_gemeentenaam = value;
    	});

    	var mapinit_done = false;

    	onMount(() => {
    		init_map();
    	});

    	var map;
    	var plot;
    	var data_gemeenten;

    	var redIcon = L.icon({
    		iconUrl: "img/map_markers/marker-icon-red-2x.png",
    		shadowUrl: "img/map_markers/marker-shadow.png",
    		iconSize: [25, 40],
    		shadowSize: [40, 20],
    		iconAnchor: [13, 35],
    		shadowAnchor: [13, 15],
    		popupAnchor: [20, 20]
    	});

    	store_input_primarydataset_raw.subscribe(value => {
    		data_gemeenten = value;
    	});

    	var mapcontextswitch;

    	store_instelling_mapcontextswitch.subscribe(value => {
    		$$invalidate(0, mapcontextswitch = value);
    	});

    	function change_mapcontext() {
    		// console.log('mapcontextswitch: '+ mapcontextswitch)
    		if (mapinit_done) {
    			switchcontextlaag(mapcontextswitch);
    		}
    	}

    	function init_map() {
    		map = new L.Map("map",
    		{
    				center: [52.0919, 5.09],
    				zoom: 8,
    				attributionControl: false,
    				scrollWheelZoom: true,
    				zoomControl: false,
    				zoomAnimation: false
    			});

    		//init leaflet draw
    		var drawnItems = new L.FeatureGroup();

    		map.addLayer(drawnItems);

    		var options = {
    			position: "topright",
    			draw: {
    				polyline: {
    					shapeOptions: { color: "red", weight: 10 }
    				}
    			}
    		};

    		var drawControl = new L.Control.Draw(options);
    		map.addControl(drawControl);
    		d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-5px");
    		var drawresult;

    		map.on("draw:created", function (e) {
    			drawnItems.removeLayer(drawresult);
    			drawresult = e.layer;

    			// Calculating the distance of the polyline
    			var tempLatLng = e.layer._latlngs[0];

    			var totalDistance = 0;
    			var i;

    			for (i = 0; i < e.layer._latlngs.length; i++) {
    				totalDistance += tempLatLng.distanceTo(e.layer._latlngs[i]);
    				tempLatLng = e.layer._latlngs[i];
    			}

    			store_instelling_lengtetransportleiding.update(n => totalDistance);
    			d3.select("#slider_container_transport").transition().duration(1500).style("top", "10px");
    			recalculate_all();
    			drawnItems.addLayer(drawresult);
    		});

    		L.control.zoom({ position: "topright" }).addTo(map);

    		//panes
    		map.createPane("backgroundmap");

    		map.getPane("backgroundmap").style.zIndex = 0;
    		map.createPane("referentienet");
    		map.getPane("referentienet").style.zIndex = 200;

    		new L.tileLayer("https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png",
    		{
    				minZoom: 0,
    				maxZoom: 20,
    				pane: "backgroundmap"
    			}).addTo(map);
    	}

    	// MT puntbronnen
    	// d3.json("geojson/20200213_MT_bronnen.geojson").then(function (data, error) {
    	//     map.createPane("puntbronnen");
    	//     map.getPane("puntbronnen").style.zIndex = 800;
    	//     var oms = new OverlappingMarkerSpiderfier(map);
    	//     var popup = new L.Popup();
    	//     oms.addListener("click", function (marker) {
    	//         popup.setContent(marker.desc);
    	//         popup.setLatLng(marker.getLatLng());
    	//         map.openPopup(popup);
    	//     });
    	//     oms.addListener("spiderfy", function (markers) {
    	//         map.closePopup();
    	//     });
    	//     for (var i = 0; i < data.features.length; i++) {
    	//         var datum = data.features[i];
    	//         var loc = new L.LatLng(
    	//             datum.geometry.coordinates[1],
    	//             datum.geometry.coordinates[0]
    	//         );
    	//         var marker = new L.Marker(loc, { icon: redIcon });
    	//         if ( datum.properties.MWcapaciteit != null && datum.properties.MWcapaciteitn != ""){
    	//             marker.desc = "<b>Naam:</b> " +
    	//             datum.properties.bron_naam + "<br><b>Type:</b> " +
    	//             datum.properties.type_bron + "<br><b>Vermogen:</b> " +
    	//             Math.round(parseFloat(datum.properties.MWcapaciteit) * 100) / 100 + " MW";
    	//         } else {
    	//             marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam + "<br><b>Type:</b> " + datum.properties.type_bron +"<br><b>Vermogen: </b>onbekend";
    	//         }
    	//         map.addLayer(marker);
    	//         oms.addMarker(marker);
    	//     }
    	// });
    	window.draw_contextlaag = () => {
    		var contextlaag_geojson = selectie_gemeentenaam + ".geojson";

    		window.switchcontextlaag = state => {
    			map.removeLayer(plot);

    			if (state == "dichtheid") {
    				d3.json("startkaart/" + contextlaag_geojson).then(function (data, error) {
    					map.createPane("puntbronnen");
    					map.getPane("puntbronnen").style.zIndex = 300;

    					plot = L.vectorGrid.slicer(data, {
    						workerCode: "js/webworker.js",
    						id: "puntbronnen",
    						pane: "puntbronnen",
    						maxZoom: 21,
    						tolerance: 2,
    						extent: 8000,
    						buffer: 64,
    						debug: 0,
    						indexMaxZoom: 0,
    						indexMaxPoints: 1000,
    						rendererFactory: L.svg.tile,
    						vectorTileLayerStyles: {
    							sliced(properties) {
    								return {
    									fillOpacity: 1,
    									opacity: 1,
    									stroke: false,
    									fill: true,
    									weight: 1,
    									fillColor: getColor_bbdh(properties),
    									color: "#000"
    								};
    							}
    						},
    						interactive: true,
    						getFeatureId(feature) {
    							return feature.properties.BU_CODE;
    						}
    					}).on("click", function (e) {
    						
    					}).addTo(map);

    					mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    				});
    			} else if (state == "bouwperiode") {
    				d3.json("startkaart/" + contextlaag_geojson).then(function (data, error) {
    					map.createPane("puntbronnen");
    					map.getPane("puntbronnen").style.zIndex = 300;

    					plot = L.vectorGrid.slicer(data, {
    						workerCode: "js/webworker.js",
    						id: "puntbronnen",
    						pane: "puntbronnen",
    						maxZoom: 21,
    						tolerance: 2,
    						extent: 8000,
    						buffer: 64,
    						debug: 0,
    						indexMaxZoom: 0,
    						indexMaxPoints: 1000,
    						rendererFactory: L.svg.tile,
    						vectorTileLayerStyles: {
    							sliced(properties) {
    								return {
    									fillOpacity: 1,
    									opacity: 1,
    									stroke: false,
    									fill: true,
    									weight: 1,
    									fillColor: getColor_leeftijd(properties),
    									color: "#000"
    								};
    							}
    						},
    						interactive: true,
    						getFeatureId(feature) {
    							return feature.properties.BU_CODE;
    						}
    					}).on("click", function (e) {
    						
    					}).addTo(map);

    					mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    				});
    			} else if (state == "combinatie") {
    				d3.json("startkaart/" + contextlaag_geojson).then(function (data, error) {
    					map.createPane("puntbronnen");
    					map.getPane("puntbronnen").style.zIndex = 300;

    					plot = L.vectorGrid.slicer(data, {
    						workerCode: "js/webworker.js",
    						id: "puntbronnen",
    						pane: "puntbronnen",
    						maxZoom: 21,
    						tolerance: 2,
    						extent: 8000,
    						buffer: 64,
    						debug: 0,
    						indexMaxZoom: 0,
    						indexMaxPoints: 1000,
    						rendererFactory: L.svg.tile,
    						vectorTileLayerStyles: {
    							sliced(properties) {
    								return {
    									fillOpacity: 1,
    									opacity: 1,
    									stroke: false,
    									fill: true,
    									weight: 1,
    									fillColor: getColor_combinatie(),
    									color: "#000"
    								};
    							}
    						},
    						interactive: true,
    						getFeatureId(feature) {
    							return feature.properties.BU_CODE;
    						}
    					}).on("click", function (e) {
    						
    					}).addTo(map);

    					mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    				});
    			} else if (state == "d02") {
    				map.createPane("puntbronnen");
    				map.getPane("puntbronnen").style.zIndex = 300;

    				plot = L.vectorGrid.slicer(data, {
    					workerCode: "js/webworker.js",
    					id: "puntbronnen",
    					pane: "puntbronnen",
    					maxZoom: 21,
    					tolerance: 2,
    					extent: 8000,
    					buffer: 64,
    					debug: 0,
    					indexMaxZoom: 0,
    					indexMaxPoints: 1000,
    					rendererFactory: L.svg.tile,
    					vectorTileLayerStyles: {
    						sliced(properties) {
    							return {
    								fillOpacity: 1,
    								opacity: 1,
    								stroke: false,
    								fill: true,
    								weight: 1,
    								fillColor: get_color_warmtebudget_d02(properties.D02),
    								color: "#000"
    							};
    						}
    					},
    					interactive: true,
    					getFeatureId(feature) {
    						return feature.properties.BU_CODE;
    					}
    				}).on("click", function (e) {
    					
    				}).addTo(map);

    				mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    			} else ; //do nothing
    		};

    		// plot contextlaag
    		d3.json("startkaart/" + contextlaag_geojson).then(function (data, error) {
    			map.createPane("puntbronnen");
    			map.getPane("puntbronnen").style.zIndex = 300;

    			plot = L.vectorGrid.slicer(data, {
    				workerCode: "js/webworker.js",
    				id: "puntbronnen",
    				pane: "puntbronnen",
    				maxZoom: 21,
    				tolerance: 2,
    				extent: 8000,
    				buffer: 64,
    				debug: 0,
    				indexMaxZoom: 0,
    				indexMaxPoints: 1000,
    				rendererFactory: L.svg.tile,
    				vectorTileLayerStyles: {
    					sliced(properties) {
    						return {
    							fillOpacity: 1,
    							opacity: 1,
    							stroke: false,
    							fill: true,
    							weight: 1,
    							fillColor: getColor_bbdh(properties),
    							color: "#000"
    						};
    					}
    				},
    				interactive: true,
    				getFeatureId(feature) {
    					return feature.properties.BU_CODE;
    				}
    			}).on("click", function (e) {
    				
    			}).addTo(map);

    			mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    		});

    		var color_gradient = [
    			"#181818",
    			"#383838",
    			"#464646",
    			"#555555",
    			"#646464",
    			"#747474",
    			"#848484",
    			"#959595",
    			"#a6a6a6",
    			"#bcbcbc",
    			"#d2d2d2",
    			"#e8e8e8",
    			"#ffffff"
    		];

    		window.get_color_warmtebudget_d02 = D02 => {
    			if (D02 < 0) {
    				return color_gradient[0];
    			} else if (D02 >= 0 && D02 < 2) {
    				return color_gradient[1];
    			} else if (D02 >= 2 && D02 < 4) {
    				return color_gradient[2];
    			} else if (D02 >= 4 && D02 < 6) {
    				return color_gradient[3];
    			} else if (D02 >= 6 && D02 < 8) {
    				return color_gradient[4];
    			} else if (D02 >= 8 && D02 < 10) {
    				return color_gradient[5];
    			} else if (D02 >= 10 && D02 < 12) {
    				return color_gradient[6];
    			} else if (D02 >= 12 && D02 < 14) {
    				return color_gradient[7];
    			} else if (D02 >= 14 && D02 < 16) {
    				return color_gradient[8];
    			} else if (D02 >= 16 && D02 < 18) {
    				return color_gradient[9];
    			} else if (D02 >= 18 && D02 < 20) {
    				return color_gradient[10];
    			} else if (D02 >= 20 && D02 < 30) {
    				return color_gradient[11];
    			} else if (D02 >= 30) {
    				return color_gradient[12];
    			}
    		};

    		function getColor_bbdh(properties) {
    			const classresult = getClass_with_label(properties);
    			var low = "#bdbdbd";
    			var mid = "#757575";
    			var high = "#424242";

    			if (classresult == "W" || classresult == "X") {
    				return high;
    			}

    			if (classresult == "O" || classresult == "P") {
    				return mid;
    			}

    			if (classresult == "G" || classresult == "H") {
    				return low;
    			}

    			if (classresult == "U" || classresult == "V") {
    				return high;
    			}

    			if (classresult == "M" || classresult == "N") {
    				return mid;
    			}

    			if (classresult == "E" || classresult == "F") {
    				return low;
    			}

    			if (classresult == "S" || classresult == "T" || classresult == "Q" || classresult == "R") {
    				return high;
    			}

    			if (classresult == "I" || classresult == "J" || classresult == "K" || classresult == "L") {
    				return mid;
    			}

    			if (classresult == "A" || classresult == "B" || classresult == "C" || classresult == "D") {
    				return low;
    			}

    			return "none";
    		}

    		function getColor_leeftijd(properties) {
    			const classresult = getClass_with_label(properties);
    			var low = "#bdbdbd";
    			var mid = "#757575";
    			var high = "#424242";

    			// LEEFTIJD
    			if (classresult == "W" || classresult == "X") {
    				return high;
    			}

    			if (classresult == "O" || classresult == "P") {
    				return high;
    			}

    			if (classresult == "G" || classresult == "H") {
    				return high;
    			}

    			if (classresult == "U" || classresult == "V") {
    				return mid;
    			}

    			if (classresult == "M" || classresult == "N") {
    				return mid;
    			}

    			if (classresult == "E" || classresult == "F") {
    				return mid;
    			}

    			if (classresult == "S" || classresult == "T" || classresult == "Q" || classresult == "R") {
    				return low;
    			}

    			if (classresult == "I" || classresult == "J" || classresult == "K" || classresult == "L") {
    				return low;
    			}

    			if (classresult == "A" || classresult == "B" || classresult == "C" || classresult == "D") {
    				return low;
    			}

    			return "none";
    		}

    		function getColor_combinatie(properties) {
    			if (classresult == "W" || classresult == "X") {
    				return "#608CCF";
    			}

    			if (classresult == "O" || classresult == "P") {
    				return "#AFC5E7";
    			}

    			if (classresult == "G" || classresult == "H") {
    				return "#D7E2F3";
    			}

    			if (classresult == "U" || classresult == "V") {
    				return "#333333";
    			}

    			if (classresult == "M" || classresult == "N") {
    				return "#999999";
    			}

    			if (classresult == "E" || classresult == "F") {
    				return "#CCCCCC";
    			}

    			if (classresult == "S" || classresult == "T" || classresult == "Q" || classresult == "R") {
    				return "#B02318";
    			}

    			if (classresult == "I" || classresult == "J" || classresult == "K" || classresult == "L") {
    				return "#D8918C";
    			}

    			if (classresult == "A" || classresult == "B" || classresult == "C" || classresult == "D") {
    				return "#EBC8C5";
    			}

    			return "none";
    		}

    		function getClass_with_label(properties) {
    			var bbdh = parseInt(properties.bbdh);
    			var woningoppervlakte = parseInt(properties.oppervlakteverblijfsobject_median);
    			var avg_bj = parseInt(properties.bouwjaar_median);
    			parseInt(properties.bbdh);
    			parseInt(properties.percbplus);
    			let opp_limit = 100;
    			const bbdh_limit_1 = 50;
    			const bbdh_limit_2 = 70;

    			if (bbdh > 0 && bbdh < bbdh_limit_1) {
    				if (avg_bj < 1945) {
    					//#EF902A
    					if (woningoppervlakte < opp_limit) {
    						return "Q";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "R";
    					}
    				}

    				if (avg_bj >= 1945 && avg_bj < 1965) {
    					//#EF902A
    					if (woningoppervlakte < opp_limit) {
    						return "S";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "T";
    					}
    				}

    				if (avg_bj >= 1965 && avg_bj < 1992) {
    					//#878463
    					if (woningoppervlakte < opp_limit) {
    						return "U";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "V";
    					}
    				}

    				if (avg_bj >= 1992 && avg_bj < 2021) {
    					//#1B7C9A
    					if (woningoppervlakte < opp_limit) {
    						return "W";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "X";
    					}
    				}
    			}

    			if (bbdh >= bbdh_limit_1 && bbdh < bbdh_limit_2) {
    				if (avg_bj < 1945) {
    					//#F3AB5F
    					if (woningoppervlakte < opp_limit) {
    						return "I";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "J";
    					}
    				}

    				if (avg_bj >= 1945 && avg_bj < 1965) {
    					//#F3AB5F
    					if (woningoppervlakte < opp_limit) {
    						return "K";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "L";
    					}
    				}

    				if (avg_bj >= 1965 && avg_bj < 1992) {
    					//#A4A389
    					if (woningoppervlakte < opp_limit) {
    						return "M";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "N";
    					}
    				}

    				if (avg_bj >= 1992 && avg_bj < 2021) {
    					//#559DB3
    					if (woningoppervlakte < opp_limit) {
    						return "O";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "P";
    					}
    				}
    			}

    			if (bbdh >= bbdh_limit_2) {
    				if (avg_bj < 1945) {
    					//#F8C798
    					if (woningoppervlakte < opp_limit) {
    						return "A";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "B";
    					}
    				}

    				if (avg_bj >= 1945 && avg_bj < 1965) {
    					//#F8C798
    					if (woningoppervlakte < opp_limit) {
    						return "C";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "D";
    					}
    				}

    				if (avg_bj >= 1965 && avg_bj < 1992) {
    					//#C2C2B0
    					if (woningoppervlakte < opp_limit) {
    						return "E";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "F";
    					}
    				}

    				if (avg_bj >= 1992 && avg_bj < 2021) {
    					//#8CBECD
    					if (woningoppervlakte < opp_limit) {
    						return "G";
    					}

    					if (woningoppervlakte >= opp_limit) {
    						return "H";
    					}
    				}
    			}
    		}
    	};

    	//overlapping markers MT-bronnen
    	// var oms = new OverlappingMarkerSpiderfier(map);
    	// var popup = new L.Popup();
    	// oms.addListener("click", function (marker) {
    	//     popup.setContent(marker.desc);
    	//     popup.setLatLng(marker.getLatLng());
    	//     map.openPopup(popup);
    	// });
    	// oms.addListener("spiderfy", function (markers) {
    	//     map.closePopup();
    	// });
    	// for (var i = 0; i < data.features.length; i++) {
    	//     var datum = data.features[i];
    	//     var loc = new L.LatLng(
    	//         datum.geometry.coordinates[1],
    	//         datum.geometry.coordinates[0]
    	//     );
    	//     var marker = new L.Marker(loc, { icon: redIcon });
    	//     if (datum.properties.MWcapaciteit != null && datum.properties.MWcapaciteitn != ""){
    	//         marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam +
    	//         "<br><b>Type:</b> " + datum.properties.type_bron + "<br><b>Vermogen:</b> " +
    	//         Math.round(parseFloat(datum.properties.MWcapaciteit) * 100) / 100 + " MW";
    	//     }
    	//     else {
    	//         marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam + "<br><b>Type:</b> " + datum.properties.type_bron + "<br><b>Vermogen: </b>onbekend";
    	//     }
    	//     map.addLayer(marker);
    	//     oms.addMarker(marker);
    	// }
    	var data;

    	var data_contour;

    	window.start_analysis = gm_code => {
    		d3.json("geojson/data/" + gm_code + ".geojson").then(function (data_output, error) {
    			data = data_output;
    			store_input_primarydataset_raw.update(n => data);
    			var geojsonLayer = L.geoJson(data_output);
    			map.fitBounds(geojsonLayer.getBounds());
    			draw_buurten(data_output);
    		});

    		d3.json("geojson/contours/" + gm_code + ".geojson").then(function (data_output, error) {
    			data_contour = data_output;

    			L.geoJSON(data_contour, {
    				invert: true,
    				renderer: L.svg({ padding: 1 }),
    				pane: "buurtselectie",
    				fillOpacity: 0.1,
    				srokeOpacity: 0.6,
    				stroke: true,
    				fill: true,
    				weight: 3,
    				color: "#000"
    			}).addTo(map);
    		});
    	};

    	window.draw_buurten = data => {
    		var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    			g = svg.append("g").attr("class", "leaflet-zoom-hide");

    		var transform = d3.geoTransform({ point: projectPoint }),
    			path = d3.geoPath().projection(transform);

    		var feature = g.selectAll("path").data(data.features).enter().append("path").attr("id", function (d) {
    			return d.properties.BU_CODE;
    		}).attr("fill", "#666").style("stroke-width", 3).style("opacity", 1).style("stroke", function (d) {
    			return "#000";
    		}).on("click", function (d) {
    			toggle_output(1); //toggle_output unfolds output panel

    			if (flag_racechart_active) {
    				draw_racechart();
    			}

    			buurtselectie_logger(this.id);
    		});

    		map.on("viewreset", reset);
    		reset();

    		// Reposition the SVG to cover the features
    		function reset() {
    			var bounds = path.bounds(data), topLeft = bounds[0], bottomRight = bounds[1];
    			svg.attr("width", bottomRight[0] - topLeft[0]).attr("height", bottomRight[1] - topLeft[1]).style("left", topLeft[0] + "px").style("top", topLeft[1] + "px");
    			g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    			feature.attr("d", path);
    		}

    		// Leaflet-D3 geometric transformation
    		function projectPoint(x, y) {
    			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    			this.stream.point(point.x, point.y);
    		}

    		var cnt;

    		for (cnt = 0; cnt < data.features.length; cnt++) {
    			recalculate_results(data.features[cnt].properties);
    			color_buurten(cnt, data.features[cnt].properties.BU_CODE);
    		}
    	};

    	var buurtselectie_array = [];
    	var buurtnamen_array = [];
    	var co2emissiereductie_selectie = 0;
    	var totaalweq_selectie = 0;
    	store_selectie_buurtcodes.update(n => buurtselectie_array);
    	var buurtpolygonen_array = [];
    	var vectorgrid_joinedpolygon;

    	function buurtselectie_logger(caller) {
    		var i;
    		var buurtpolygon;
    		var buurtproperties;

    		for (i = 0; i < data_gemeenten.features.length; i++) {
    			if (data_gemeenten.features[i].properties.BU_CODE == caller) {
    				buurtpolygon = data_gemeenten.features[i].geometry;
    				buurtproperties = data_gemeenten.features[i].properties;
    				break;
    			}
    		}

    		var buurtpolygon = turf.polygon(buurtpolygon.coordinates[0], { fill: "#0f0" });

    		if (buurtselectie_array.length == 0) {
    			buurtpolygonen_array.push(buurtpolygon);
    			buurtselectie_array.push(caller);
    			buurtnamen_array.push(buurtproperties.I02_buurtnaam);
    			co2emissiereductie_selectie = co2emissiereductie_selectie + parseInt(buurtproperties.ref_2030_H15);
    			totaalweq_selectie = totaalweq_selectie + parseInt(buurtproperties.I11_aantalweq);
    		} else if (buurtselectie_array.indexOf(caller) >= 0) {
    			buurtpolygonen_array.splice(buurtselectie_array.indexOf(caller), 1);
    			buurtselectie_array.splice(buurtselectie_array.indexOf(caller), 1);
    			buurtnamen_array.splice(buurtnamen_array.indexOf(buurtproperties.I02_buurtnaam), 1);
    			co2emissiereductie_selectie = co2emissiereductie_selectie - parseInt(buurtproperties.ref_2030_H15);
    			totaalweq_selectie = totaalweq_selectie - parseInt(buurtproperties.I11_aantalweq);
    		} else {
    			buurtpolygonen_array.push(buurtpolygon);
    			buurtselectie_array.push(caller);
    			buurtnamen_array.push(buurtproperties.I02_buurtnaam);
    			co2emissiereductie_selectie = co2emissiereductie_selectie + parseInt(buurtproperties.ref_2030_H15);
    			totaalweq_selectie = totaalweq_selectie + parseInt(buurtproperties.I11_aantalweq);
    		}

    		store_selectie_weq.update(n => totaalweq_selectie);
    		store_selectie_co2reductie.update(n => co2emissiereductie_selectie);
    		store_selectie_buurtnamen.update(n => buurtnamen_array);
    		store_selectie_buurtcodes.update(n => buurtselectie_array);
    		var joinedpolygons;

    		if (buurtpolygonen_array.length > 0) {
    			joinedpolygons = turf.union(...buurtpolygonen_array);

    			if (vectorgrid_joinedpolygon) {
    				map.removeLayer(vectorgrid_joinedpolygon);
    			}

    			vectorgrid_joinedpolygon = L.geoJSON(joinedpolygons, {
    				fillOpacity: 0,
    				strokeOpacity: 1,
    				stroke: true,
    				fill: true,
    				weight: 12,
    				color: "#000"
    			}).addTo(map);

    			unfold_sliderpanel();
    			recalculate_all();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		store_input_primarydataset_raw,
    		store_instelling_lengtetransportleiding,
    		store_selectie_buurtcodes,
    		store_selectie_weq,
    		store_selectie_co2reductie,
    		store_selectie_buurtnamen,
    		store_instelling_mapcontextswitch,
    		store_selectie_gemeentenaam,
    		selectie_gemeentenaam,
    		mapinit_done,
    		map,
    		plot,
    		data_gemeenten,
    		redIcon,
    		mapcontextswitch,
    		change_mapcontext,
    		init_map,
    		data,
    		data_contour,
    		buurtselectie_array,
    		buurtnamen_array,
    		co2emissiereductie_selectie,
    		totaalweq_selectie,
    		buurtpolygonen_array,
    		vectorgrid_joinedpolygon,
    		buurtselectie_logger
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectie_gemeentenaam" in $$props) selectie_gemeentenaam = $$props.selectie_gemeentenaam;
    		if ("mapinit_done" in $$props) mapinit_done = $$props.mapinit_done;
    		if ("map" in $$props) map = $$props.map;
    		if ("plot" in $$props) plot = $$props.plot;
    		if ("data_gemeenten" in $$props) data_gemeenten = $$props.data_gemeenten;
    		if ("redIcon" in $$props) redIcon = $$props.redIcon;
    		if ("mapcontextswitch" in $$props) $$invalidate(0, mapcontextswitch = $$props.mapcontextswitch);
    		if ("data" in $$props) data = $$props.data;
    		if ("data_contour" in $$props) data_contour = $$props.data_contour;
    		if ("buurtselectie_array" in $$props) buurtselectie_array = $$props.buurtselectie_array;
    		if ("buurtnamen_array" in $$props) buurtnamen_array = $$props.buurtnamen_array;
    		if ("co2emissiereductie_selectie" in $$props) co2emissiereductie_selectie = $$props.co2emissiereductie_selectie;
    		if ("totaalweq_selectie" in $$props) totaalweq_selectie = $$props.totaalweq_selectie;
    		if ("buurtpolygonen_array" in $$props) buurtpolygonen_array = $$props.buurtpolygonen_array;
    		if ("vectorgrid_joinedpolygon" in $$props) vectorgrid_joinedpolygon = $$props.vectorgrid_joinedpolygon;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mapcontextswitch*/ 1) {
    			 change_mapcontext();
    		}
    	};

    	return [mapcontextswitch];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.32.1 */

    const file$k = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$r(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl");
    			add_location(div, file$k, 61, 0, 1353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.32.1 */
    const file$l = "node_modules/svelte-select/src/VirtualList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    // (160:57) Missing template
    function fallback_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(160:57) Missing template",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_row, file$l, 158, 3, 3514);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_contents, file$l, 156, 1, 3364);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$l, 154, 0, 3222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[16](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[17](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
    				each_value = /*visible*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[16](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[17](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", slots, ['default']);
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(3, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(13, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(4, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(3, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(2, viewport_height);
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(3, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(4, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(2, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(13, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 14340) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport_height,
    		viewport,
    		contents,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		mounted,
    		$$scope,
    		slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.32.1 */
    const file$m = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3(ctx) {
    	let div;
    	let virtuallist;
    	let current;

    	virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot$7,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "listContainer virtualList svelte-ux0sbr");
    			add_location(div, file$m, 210, 0, 5850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot$7(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$m, 214, 4, 5970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block$7(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "listContainer svelte-ux0sbr");
    			add_location(div, file$m, 232, 0, 6477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[23](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			attr_dev(div, "class", "empty svelte-ux0sbr");
    			add_location(div, file$m, 255, 6, 7178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block$1(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1() {
    		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36]);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$m, 237, 4, 6691);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    					listen_dev(div, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "listGroupTitle svelte-ux0sbr");
    			add_location(div, file$m, 235, 6, 6611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function itemClasses(hoverItemIndex, item, itemIndex, items, selectedValue, optionIdentifier, isMulti) {
    	return `${selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]
	? "active "
	: ""}${hoverItemIndex === itemIndex || items.length === 1
	? "hover"
	: ""}`;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	}); // clearTimeout(isScrollingTimer);

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		// if (prev_activeItemIndex && activeItemIndex > -1) {
    		//   hoverItemIndex = activeItemIndex;
    		//   scrollToActiveItem('active');
    		// }
    		// if (prev_selectedValue && selectedValue) {
    		//   scrollToActiveItem('active');
    		//   if (items && !isMulti) {
    		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
    		//     if (hoverItemIndex) {
    		//       hoverItemIndex = hoverItemIndex;
    		//     }
    		//   }
    		// }
    		prev_items = items;

    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		dispatch,
    		container,
    		ItemComponent: Item,
    		VirtualList,
    		Item: Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		itemClasses,
    		handleSelect,
    		handleHover,
    		handleClick,
    		closeList,
    		updateHoverItem,
    		handleKeyDown,
    		scrollToActiveItem,
    		isItemActive,
    		isItemFirst,
    		isItemHover
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		hoverItemIndex,
    		Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$t,
    			create_fragment$t,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.32.1 */

    const file$n = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$u(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "selection svelte-ch6bh7");
    			add_location(div, file$n, 13, 0, 210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Selection", slots, []);
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ getSelectionLabel, item });

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.32.1 */
    const file$o = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (23:2) {#if !isDisabled && !multiFullItemClearable}
    function create_if_block$8(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$o, 25, 6, 950);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-14r1jr2");
    			add_location(svg, file$o, 24, 4, 851);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-14r1jr2");
    			add_location(div, file$o, 23, 2, 767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(23:2) {#if !isDisabled && !multiFullItemClearable}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#each selectedValue as value, i}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block = !/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3] && create_if_block$8(ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[7](/*i*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "multiSelectItem_label svelte-14r1jr2");
    			add_location(div0, file$o, 19, 2, 636);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2");

    			add_location(div1, file$o, 18, 0, 457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*getSelectionLabel, selectedValue*/ 17 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(18:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, multiFullItemClearable, handleClear, getSelectionLabel, selectedValue*/ 63) {
    				each_value = /*selectedValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelection", slots, []);
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { multiFullItemClearable = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = [
    		"selectedValue",
    		"activeSelectedValue",
    		"isDisabled",
    		"multiFullItemClearable",
    		"getSelectionLabel"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, event) => handleClear(i, event);
    	const click_handler_1 = (i, event) => multiFullItemClearable ? handleClear(i, event) : {};

    	$$self.$$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		multiFullItemClearable,
    		getSelectionLabel,
    		handleClear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		multiFullItemClearable,
    		getSelectionLabel,
    		handleClear,
    		click_handler,
    		click_handler_1
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			multiFullItemClearable: 3,
    			getSelectionLabel: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiFullItemClearable() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiFullItemClearable(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.32.1 */

    const { Object: Object_1, console: console_1$2 } = globals;
    const file$p = "node_modules/svelte-select/src/Select.svelte";

    // (821:2) {#if Icon}
    function create_if_block_7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*iconProps*/ ctx[18]];
    	var switch_value = /*Icon*/ ctx[17];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*iconProps*/ 262144)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*iconProps*/ ctx[18])])
    			: {};

    			if (switch_value !== (switch_value = /*Icon*/ ctx[17])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(821:2) {#if Icon}",
    		ctx
    	});

    	return block;
    }

    // (825:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[7];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[0],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[13],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[24],
    				isDisabled: /*isDisabled*/ ctx[10],
    				multiFullItemClearable: /*multiFullItemClearable*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[28]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[31]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[0];
    			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];
    			if (dirty[0] & /*activeSelectedValue*/ 16777216) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[24];
    			if (dirty[0] & /*isDisabled*/ 1024) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[10];
    			if (dirty[0] & /*multiFullItemClearable*/ 512) switch_instance_changes.multiFullItemClearable = /*multiFullItemClearable*/ ctx[9];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[28]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[31]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(825:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (846:2) {:else}
    function create_else_block_1$1(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[25],
    		{ placeholder: /*placeholderText*/ ctx[27] },
    		{ style: /*inputStyles*/ ctx[15] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-17qb5ew", true);
    			add_location(input_1, file$p, 846, 4, 21290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding_1*/ ctx[62](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[31], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler_1*/ ctx[63])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 33554432 && /*_inputAttributes*/ ctx[25],
    				dirty[0] & /*placeholderText*/ 134217728 && { placeholder: /*placeholderText*/ ctx[27] },
    				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] }
    			]));

    			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
    				set_input_value(input_1, /*filterText*/ ctx[1]);
    			}

    			toggle_class(input_1, "svelte-17qb5ew", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding_1*/ ctx[62](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(846:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (837:2) {#if isDisabled}
    function create_if_block_5(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[25],
    		{ placeholder: /*placeholderText*/ ctx[27] },
    		{ style: /*inputStyles*/ ctx[15] },
    		{ disabled: true }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-17qb5ew", true);
    			add_location(input_1, file$p, 837, 4, 21078);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[60](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[31], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[61])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 33554432 && /*_inputAttributes*/ ctx[25],
    				dirty[0] & /*placeholderText*/ 134217728 && { placeholder: /*placeholderText*/ ctx[27] },
    				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] },
    				{ disabled: true }
    			]));

    			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
    				set_input_value(input_1, /*filterText*/ ctx[1]);
    			}

    			toggle_class(input_1, "svelte-17qb5ew", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[60](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(837:2) {#if isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (856:2) {#if !isMulti && showSelectedItem}
    function create_if_block_4(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[0],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[13]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "selectedItem svelte-17qb5ew");
    			add_location(div, file$p, 856, 4, 21523);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[31], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.item = /*selectedValue*/ ctx[0];
    			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(856:2) {#if !isMulti && showSelectedItem}",
    		ctx
    	});

    	return block;
    }

    // (865:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_3$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$p, 872, 8, 21986);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-17qb5ew");
    			add_location(svg, file$p, 866, 6, 21845);
    			attr_dev(div, "class", "clearSelect svelte-17qb5ew");
    			add_location(div, file$p, 865, 4, 21775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[23]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(865:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (881:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
    function create_if_block_1$4(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*indicatorSvg*/ ctx[22]) return create_if_block_2$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "indicator svelte-17qb5ew");
    			add_location(div, file$p, 881, 4, 22420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(881:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}",
    		ctx
    	});

    	return block;
    }

    // (885:6) {:else}
    function create_else_block$2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n            0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n            0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$p, 890, 10, 22641);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "svelte-17qb5ew");
    			add_location(svg, file$p, 885, 8, 22520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(885:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (883:6) {#if indicatorSvg}
    function create_if_block_2$2(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*indicatorSvg*/ ctx[22], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*indicatorSvg*/ 4194304) html_tag.p(/*indicatorSvg*/ ctx[22]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(883:6) {#if indicatorSvg}",
    		ctx
    	});

    	return block;
    }

    // (902:2) {#if isWaiting}
    function create_if_block$9(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "spinner_path svelte-17qb5ew");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$p, 904, 8, 23146);
    			attr_dev(svg, "class", "spinner_icon svelte-17qb5ew");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$p, 903, 6, 23089);
    			attr_dev(div, "class", "spinner svelte-17qb5ew");
    			add_location(div, file$p, 902, 4, 23061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(902:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*Icon*/ ctx[17] && create_if_block_7(ctx);
    	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0 && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isDisabled*/ ctx[10]) return create_if_block_5;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[26] && create_if_block_4(ctx);
    	let if_block4 = /*showSelectedItem*/ ctx[26] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && create_if_block_3$1(ctx);
    	let if_block5 = (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[26] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[26]))) && create_if_block_1$4(ctx);
    	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17qb5ew");
    			attr_dev(div, "style", /*containerStyles*/ ctx[12]);
    			toggle_class(div, "hasError", /*hasError*/ ctx[11]);
    			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
    			toggle_class(div, "focused", /*isFocused*/ ctx[4]);
    			add_location(div, file$p, 810, 0, 20424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			/*div_binding*/ ctx[64](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*handleWindowClick*/ ctx[32], false, false, false),
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[30], false, false, false),
    					listen_dev(window, "resize", /*getPosition*/ ctx[29], false, false, false),
    					listen_dev(div, "click", /*handleClick*/ ctx[33], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Icon*/ ctx[17]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*Icon*/ 131072) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, selectedValue*/ 257) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			}

    			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[26]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, showSelectedItem*/ 67109120) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[26] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_3$1(ctx);
    					if_block4.c();
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[26] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[26]))) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1$4(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*isWaiting*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$9(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses*/ 2097152 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17qb5ew")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 4096) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[12]);
    			}

    			if (dirty[0] & /*containerClasses, hasError*/ 2099200) {
    				toggle_class(div, "hasError", /*hasError*/ ctx[11]);
    			}

    			if (dirty[0] & /*containerClasses, isMulti*/ 2097408) {
    				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			}

    			if (dirty[0] & /*containerClasses, isDisabled*/ 2098176) {
    				toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
    			}

    			if (dirty[0] & /*containerClasses, isFocused*/ 2097168) {
    				toggle_class(div, "focused", /*isFocused*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			/*div_binding*/ ctx[64](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let disabled;
    	let showSelectedItem;
    	let placeholderText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { multiFullItemClearable = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { Icon = undefined } = $$props;
    	let { iconProps = {} } = $$props;
    	let { showChevron = false } = $$props;
    	let { showIndicator = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { indicatorSvg = undefined } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(1, filterText = "");
    	}

    	let getItemsHasInvoked = false;

    	const getItems = debounce(
    		async () => {
    			getItemsHasInvoked = true;
    			$$invalidate(5, isWaiting = true);

    			let res = await loadOptions(filterText).catch(err => {
    				console.warn("svelte-select loadOptions error :>> ", err);
    				dispatch("error", { type: "loadOptions", details: err });
    			});

    			if (res) {
    				$$invalidate(34, items = [...res]);
    				dispatch("loaded", { items });
    			} else {
    				$$invalidate(34, items = []);
    			}

    			$$invalidate(5, isWaiting = false);
    			$$invalidate(4, isFocused = true);
    			$$invalidate(36, listOpen = true);
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(4, isFocused = true);
    				$$invalidate(36, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(36, listOpen = true);

    					if (isMulti) {
    						$$invalidate(24, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = createItem(filterText);
    				itemToCreate.isCreator = true;

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			if (!noDuplicates) $$invalidate(0, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	function findItem(selection) {
    		let matchTo = selection
    		? selection[optionIdentifier]
    		: selectedValue[optionIdentifier];

    		return items.find(item => item[optionIdentifier] === matchTo);
    	}

    	function updateSelectedValueDisplay(items) {
    		if (!items || items.length === 0 || items.some(item => typeof item !== "object")) return;

    		if (!selectedValue || (isMulti
    		? selectedValue.some(selection => !selection || !selection[optionIdentifier])
    		: !selectedValue[optionIdentifier])) return;

    		if (Array.isArray(selectedValue)) {
    			$$invalidate(0, selectedValue = selectedValue.map(selection => findItem(selection) || selection));
    		} else {
    			$$invalidate(0, selectedValue = findItem() || selectedValue);
    		}
    	}

    	async function setList(items) {
    		await tick();
    		if (!listOpen) return;
    		if (list) return list.$set({ items });
    		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(0, selectedValue = undefined);
    		} else {
    			$$invalidate(0, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(36, listOpen = true);
    				$$invalidate(24, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(36, listOpen = true);
    				$$invalidate(24, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(4, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(24, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(24, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(24, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(24, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(24, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(4, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(24, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(35, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(35, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;

    		const eventTarget = event.path && event.path.length > 0
    		? event.path[0]
    		: event.target;

    		if (container.contains(eventTarget)) return;
    		$$invalidate(4, isFocused = false);
    		$$invalidate(36, listOpen = false);
    		$$invalidate(24, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(4, isFocused = true);
    		$$invalidate(36, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(0, selectedValue = undefined);
    		$$invalidate(36, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item: Item$1,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems,
    			itemHeight
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			visibility: "hidden"
    		});

    		$$invalidate(35, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(35, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (!item.isGroupHeader || item.isSelectable) {
    					if (isMulti) {
    						$$invalidate(0, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    					} else {
    						$$invalidate(0, selectedValue = item);
    					}

    					resetFilter();
    					(($$invalidate(0, selectedValue), $$invalidate(47, optionIdentifier)), $$invalidate(8, isMulti));

    					setTimeout(() => {
    						$$invalidate(36, listOpen = false);
    						$$invalidate(24, activeSelectedValue = undefined);
    					});
    				}
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(0, selectedValue = selectedValue || []);
    				$$invalidate(0, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(0, selectedValue = createItem(detail));
    			}

    			$$invalidate(1, filterText = "");
    			$$invalidate(36, listOpen = false);
    			$$invalidate(24, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(36, listOpen = false);
    		});

    		($$invalidate(35, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(59, originalItemsClone = JSON.stringify(items));
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"multiFullItemClearable",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth",
    		"itemHeight",
    		"Icon",
    		"iconProps",
    		"showChevron",
    		"showIndicator",
    		"containerClasses",
    		"indicatorSvg"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(1, filterText);
    	}

    	function input_1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	function input_1_input_handler_1() {
    		filterText = this.value;
    		$$invalidate(1, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(2, container = $$props.container);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(38, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("multiFullItemClearable" in $$props) $$invalidate(9, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("isDisabled" in $$props) $$invalidate(10, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(39, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(4, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(1, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(40, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(34, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(41, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(42, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(43, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(44, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(45, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(46, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(47, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(48, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(11, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(12, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(13, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(49, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(50, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(14, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(15, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(16, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(51, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(36, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(35, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(52, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(53, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(54, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(55, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(37, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(56, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(57, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(58, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		List,
    		ItemComponent: Item,
    		SelectionComponent: Selection,
    		MultiSelectionComponent: MultiSelection,
    		isOutOfViewport,
    		debounce,
    		dispatch,
    		container,
    		input,
    		Item: Item$1,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		multiFullItemClearable,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		createGroupHeaderItem,
    		createItem,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		isWaiting,
    		listPlacement,
    		listOpen,
    		list,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		filteredItems,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		target,
    		activeSelectedValue,
    		_items,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		resetFilter,
    		getItemsHasInvoked,
    		getItems,
    		_inputAttributes,
    		checkSelectedValueForDuplicates,
    		findItem,
    		updateSelectedValueDisplay,
    		setList,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		removeList,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		loadList,
    		disabled,
    		showSelectedItem,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(2, container = $$props.container);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(38, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("multiFullItemClearable" in $$props) $$invalidate(9, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("isDisabled" in $$props) $$invalidate(10, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(39, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(4, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(1, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(40, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(34, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(41, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(42, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(43, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(44, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(45, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(46, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(47, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(48, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(11, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(12, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(13, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(49, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(50, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(14, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(15, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(16, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(51, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(36, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(35, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(52, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(53, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(54, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(55, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(37, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(56, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(57, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(58, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(24, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(74, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(59, originalItemsClone = $$props.originalItemsClone);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("getItemsHasInvoked" in $$props) getItemsHasInvoked = $$props.getItemsHasInvoked;
    		if ("_inputAttributes" in $$props) $$invalidate(25, _inputAttributes = $$props._inputAttributes);
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("showSelectedItem" in $$props) $$invalidate(26, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(27, placeholderText = $$props.placeholderText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isDisabled*/ 1024) {
    			 disabled = isDisabled;
    		}

    		if ($$self.$$.dirty[1] & /*items*/ 8) {
    			 updateSelectedValueDisplay(items);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, isMulti*/ 257 | $$self.$$.dirty[1] & /*optionIdentifier*/ 65536) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(0, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				} else if (isMulti && Array.isArray(selectedValue) && selectedValue.length > 0) {
    					$$invalidate(0, selectedValue = selectedValue.map(item => typeof item === "string"
    					? { value: item, label: item }
    					: item));
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*noOptionsMessage, list*/ 8388624) {
    			 {
    				if (noOptionsMessage && list) list.$set({ noOptionsMessage });
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 3) {
    			 $$invalidate(26, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 1 | $$self.$$.dirty[1] & /*placeholder*/ 512) {
    			 $$invalidate(27, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 16384 | $$self.$$.dirty[1] & /*inputAttributes*/ 33554432) {
    			 {
    				$$invalidate(25, _inputAttributes = Object.assign(
    					{
    						autocomplete: "off",
    						autocorrect: "off",
    						spellcheck: false
    					},
    					inputAttributes
    				));

    				if (!isSearchable) {
    					$$invalidate(25, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*filterText, isMulti, selectedValue*/ 259 | $$self.$$.dirty[1] & /*items, loadOptions, originalItemsClone, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 268942344) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.some(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(37, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(37, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		selectedValue,
    		filterText,
    		container,
    		input,
    		isFocused,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		multiFullItemClearable,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		handleClear,
    		activeSelectedValue,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		items,
    		list,
    		listOpen,
    		filteredItems,
    		Item$1,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		originalItemsClone,
    		input_1_binding,
    		input_1_input_handler,
    		input_1_binding_1,
    		input_1_input_handler_1,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$w,
    			create_fragment$w,
    			safe_not_equal,
    			{
    				container: 2,
    				input: 3,
    				Item: 38,
    				Selection: 6,
    				MultiSelection: 7,
    				isMulti: 8,
    				multiFullItemClearable: 9,
    				isDisabled: 10,
    				isCreatable: 39,
    				isFocused: 4,
    				selectedValue: 0,
    				filterText: 1,
    				placeholder: 40,
    				items: 34,
    				itemFilter: 41,
    				groupBy: 42,
    				groupFilter: 43,
    				isGroupHeaderSelectable: 44,
    				getGroupHeaderLabel: 45,
    				getOptionLabel: 46,
    				optionIdentifier: 47,
    				loadOptions: 48,
    				hasError: 11,
    				containerStyles: 12,
    				getSelectionLabel: 13,
    				createGroupHeaderItem: 49,
    				createItem: 50,
    				isSearchable: 14,
    				inputStyles: 15,
    				isClearable: 16,
    				isWaiting: 5,
    				listPlacement: 51,
    				listOpen: 36,
    				list: 35,
    				isVirtualList: 52,
    				loadOptionsInterval: 53,
    				noOptionsMessage: 54,
    				hideEmptyState: 55,
    				filteredItems: 37,
    				inputAttributes: 56,
    				listAutoWidth: 57,
    				itemHeight: 58,
    				Icon: 17,
    				iconProps: 18,
    				showChevron: 19,
    				showIndicator: 20,
    				containerClasses: 21,
    				indicatorSvg: 22,
    				handleClear: 23
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiFullItemClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiFullItemClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconProps() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconProps(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showChevron() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showChevron(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIndicator() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIndicator(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSvg() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSvg(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[23];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GemeenteSelector.svelte generated by Svelte v3.32.1 */
    const file$q = "src/GemeenteSelector.svelte";

    // (428:2) <MaterialApp {theme}>
    function create_default_slot$8(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let strong;
    	let t3;
    	let p1;
    	let t4;
    	let div;
    	let select;
    	let current;

    	select = new Select({
    			props: {
    				class: "float-left ma-16",
    				items: /*items*/ ctx[1],
    				placeholder: "Kies een gemeente"
    			},
    			$$inline: true
    		});

    	select.$on("select", /*handleSelect*/ ctx[2]);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Startanalyse Warmtenetverkenner";
    			t1 = space();
    			p0 = element("p");
    			strong = element("strong");
    			strong.textContent = "Met deze tool verken je onder welke condities een warmtenet lagere nationale kosten geeft in vergelijking tot all-electric.";
    			t3 = space();
    			p1 = element("p");
    			t4 = space();
    			div = element("div");
    			create_component(select.$$.fragment);
    			attr_dev(h1, "class", "svelte-1ui2bci");
    			add_location(h1, file$q, 428, 4, 21757);
    			add_location(strong, file$q, 430, 8, 21902);
    			attr_dev(p0, "class", "float-left ml-16 mr-16 black-text");
    			set_style(p0, "font-size", "20px");
    			set_style(p0, "margin-bottom", "40px");
    			add_location(p0, file$q, 429, 6, 21804);
    			attr_dev(p1, "class", "ml-16 mr-16 black-text");
    			set_style(p1, "font-size", "19px");
    			set_style(p1, "margin-bottom", "0px");
    			add_location(p1, file$q, 432, 4, 22058);
    			attr_dev(div, "class", "themed svelte-1ui2bci");
    			add_location(div, file$q, 434, 4, 22146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, strong);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(select, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			destroy_component(select);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(428:2) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let div;
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[0],
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(materialapp.$$.fragment);
    			attr_dev(div, "id", "welkomstScherm");
    			attr_dev(div, "class", "elevation-6");
    			set_style(div, "pointer-events", "all");
    			set_style(div, "margin", "auto");
    			set_style(div, "min-width", "700px");
    			set_style(div, "min-height", "300px");
    			set_style(div, "width", "70%");
    			set_style(div, "max-height", "700px");
    			set_style(div, "max-width", "300px");
    			set_style(div, "height", "30%");
    			set_style(div, "margin-top", "100px");
    			set_style(div, "align", "middle");
    			set_style(div, "background-color", "white");
    			add_location(div, file$q, 422, 0, 21484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(materialapp, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(materialapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GemeenteSelector", slots, []);
    	let theme = "light";

    	onMount(() => {
    		d3.select("#OutputPanel").style("visibility", "hidden");
    		d3.select("#InputPanel").style("visibility", "hidden");
    		d3.select("#LegendaPanel").style("visibility", "hidden");
    		d3.selectAll(".leaflet-control").style("right", "5px");
    		d3.selectAll(".leaflet-control-container").style("visibility", "hidden");
    	});

    	let value = "";

    	const items = [
    		{
    			label: "Aa en Hunze",
    			value: "Aa en Hunze"
    		},
    		{ label: "Aalsmeer", value: "Aalsmeer" },
    		{ label: "Aalten", value: "Aalten" },
    		{
    			label: "Achtkarspelen",
    			value: "Achtkarspelen"
    		},
    		{
    			label: "Alblasserdam",
    			value: "Alblasserdam"
    		},
    		{
    			label: "Albrandswaard",
    			value: "Albrandswaard"
    		},
    		{ label: "Alkmaar", value: "Alkmaar" },
    		{ label: "Almelo", value: "Almelo" },
    		{ label: "Almere", value: "Almere" },
    		{
    			label: "Alphen aan den Rijn",
    			value: "Alphen aan den Rijn"
    		},
    		{
    			label: "Alphen-Chaam",
    			value: "Alphen-Chaam"
    		},
    		{ label: "Altena", value: "Altena" },
    		{ label: "Ameland", value: "Ameland" },
    		{ label: "Amersfoort", value: "Amersfoort" },
    		{ label: "Amstelveen", value: "Amstelveen" },
    		{ label: "Amsterdam", value: "Amsterdam" },
    		{ label: "Apeldoorn", value: "Apeldoorn" },
    		{ label: "Appingedam", value: "Appingedam" },
    		{ label: "Arnhem", value: "Arnhem" },
    		{ label: "Assen", value: "Assen" },
    		{ label: "Asten", value: "Asten" },
    		{
    			label: "Baarle-Nassau",
    			value: "Baarle-Nassau"
    		},
    		{ label: "Baarn", value: "Baarn" },
    		{
    			label: "Barendrecht",
    			value: "Barendrecht"
    		},
    		{ label: "Barneveld", value: "Barneveld" },
    		{ label: "Beek", value: "Beek" },
    		{ label: "Beekdaelen", value: "Beekdaelen" },
    		{ label: "Beemster", value: "Beemster" },
    		{ label: "Beesel", value: "Beesel" },
    		{
    			label: "Berg en Dal",
    			value: "Berg en Dal"
    		},
    		{ label: "Bergeijk", value: "Bergeijk" },
    		{
    			label: "Bergen (L.)",
    			value: "Bergen (L.)"
    		},
    		{
    			label: "Bergen (NH.)",
    			value: "Bergen (NH.)"
    		},
    		{
    			label: "Bergen op Zoom",
    			value: "Bergen op Zoom"
    		},
    		{ label: "Berkelland", value: "Berkelland" },
    		{ label: "Bernheze", value: "Bernheze" },
    		{ label: "Best", value: "Best" },
    		{ label: "Beuningen", value: "Beuningen" },
    		{ label: "Beverwijk", value: "Beverwijk" },
    		{ label: "Bladel", value: "Bladel" },
    		{ label: "Blaricum", value: "Blaricum" },
    		{
    			label: "Bloemendaal",
    			value: "Bloemendaal"
    		},
    		{
    			label: "Bodegraven-Reeuwijk",
    			value: "Bodegraven-Reeuwijk"
    		},
    		{ label: "Boekel", value: "Boekel" },
    		{
    			label: "Borger-Odoorn",
    			value: "Borger-Odoorn"
    		},
    		{ label: "Borne", value: "Borne" },
    		{ label: "Borsele", value: "Borsele" },
    		{ label: "Boxmeer", value: "Boxmeer" },
    		{ label: "Boxtel", value: "Boxtel" },
    		{ label: "Breda", value: "Breda" },
    		{ label: "Brielle", value: "Brielle" },
    		{
    			label: "Bronckhorst",
    			value: "Bronckhorst"
    		},
    		{ label: "Brummen", value: "Brummen" },
    		{ label: "Brunssum", value: "Brunssum" },
    		{ label: "Bunnik", value: "Bunnik" },
    		{ label: "Bunschoten", value: "Bunschoten" },
    		{ label: "Buren", value: "Buren" },
    		{
    			label: "Capelle aan den IJssel",
    			value: "Capelle aan den IJssel"
    		},
    		{ label: "Castricum", value: "Castricum" },
    		{ label: "Coevorden", value: "Coevorden" },
    		{
    			label: "Cranendonck",
    			value: "Cranendonck"
    		},
    		{ label: "Cuijk", value: "Cuijk" },
    		{ label: "Culemborg", value: "Culemborg" },
    		{ label: "Dalfsen", value: "Dalfsen" },
    		{
    			label: "Dantumadiel",
    			value: "Dantumadiel"
    		},
    		{ label: "De Bilt", value: "De Bilt" },
    		{
    			label: "De Fryske Marren",
    			value: "De Fryske Marren"
    		},
    		{
    			label: "De Ronde Venen",
    			value: "De Ronde Venen"
    		},
    		{ label: "De Wolden", value: "De Wolden" },
    		{ label: "Delft", value: "Delft" },
    		{ label: "Delfzijl", value: "Delfzijl" },
    		{ label: "Den Helder", value: "Den Helder" },
    		{ label: "Deurne", value: "Deurne" },
    		{ label: "Deventer", value: "Deventer" },
    		{ label: "Diemen", value: "Diemen" },
    		{ label: "Dinkelland", value: "Dinkelland" },
    		{ label: "Doesburg", value: "Doesburg" },
    		{ label: "Doetinchem", value: "Doetinchem" },
    		{ label: "Dongen", value: "Dongen" },
    		{ label: "Dordrecht", value: "Dordrecht" },
    		{
    			label: "Drechterland",
    			value: "Drechterland"
    		},
    		{ label: "Drimmelen", value: "Drimmelen" },
    		{ label: "Dronten", value: "Dronten" },
    		{ label: "Druten", value: "Druten" },
    		{ label: "Duiven", value: "Duiven" },
    		{
    			label: "Echt-Susteren",
    			value: "Echt-Susteren"
    		},
    		{
    			label: "Edam-Volendam",
    			value: "Edam-Volendam"
    		},
    		{ label: "Ede", value: "Ede" },
    		{ label: "Eemnes", value: "Eemnes" },
    		{ label: "Eersel", value: "Eersel" },
    		{
    			label: "Eijsden-Margraten",
    			value: "Eijsden-Margraten"
    		},
    		{ label: "Eindhoven", value: "Eindhoven" },
    		{ label: "Elburg", value: "Elburg" },
    		{ label: "Emmen", value: "Emmen" },
    		{ label: "Enkhuizen", value: "Enkhuizen" },
    		{ label: "Enschede", value: "Enschede" },
    		{ label: "Epe", value: "Epe" },
    		{ label: "Ermelo", value: "Ermelo" },
    		{ label: "Etten-Leur", value: "Etten-Leur" },
    		{
    			label: "Geertruidenberg",
    			value: "Geertruidenberg"
    		},
    		{
    			label: "Geldrop-Mierlo",
    			value: "Geldrop-Mierlo"
    		},
    		{
    			label: "Gemert-Bakel",
    			value: "Gemert-Bakel"
    		},
    		{ label: "Gennep", value: "Gennep" },
    		{
    			label: "Gilze en Rijen",
    			value: "Gilze en Rijen"
    		},
    		{
    			label: "Goeree-Overflakkee",
    			value: "Goeree-Overflakkee"
    		},
    		{ label: "Goes", value: "Goes" },
    		{ label: "Goirle", value: "Goirle" },
    		{
    			label: "Gooise Meren",
    			value: "Gooise Meren"
    		},
    		{ label: "Gorinchem", value: "Gorinchem" },
    		{ label: "Gouda", value: "Gouda" },
    		{ label: "Grave", value: "Grave" },
    		{ label: "Groningen", value: "Groningen" },
    		{
    			label: "Gulpen-Wittem",
    			value: "Gulpen-Wittem"
    		},
    		{
    			label: "Haaksbergen",
    			value: "Haaksbergen"
    		},
    		{ label: "Haaren", value: "Haaren" },
    		{ label: "Haarlem", value: "Haarlem" },
    		{
    			label: "Haarlemmermeer",
    			value: "Haarlemmermeer"
    		},
    		{
    			label: "Halderberge",
    			value: "Halderberge"
    		},
    		{ label: "Hardenberg", value: "Hardenberg" },
    		{ label: "Harderwijk", value: "Harderwijk" },
    		{
    			label: "Hardinxveld-Giessendam",
    			value: "Hardinxveld-Giessendam"
    		},
    		{ label: "Harlingen", value: "Harlingen" },
    		{ label: "Hattem", value: "Hattem" },
    		{ label: "Heemskerk", value: "Heemskerk" },
    		{ label: "Heemstede", value: "Heemstede" },
    		{ label: "Heerde", value: "Heerde" },
    		{ label: "Heerenveen", value: "Heerenveen" },
    		{
    			label: "Heerhugowaard",
    			value: "Heerhugowaard"
    		},
    		{ label: "Heerlen", value: "Heerlen" },
    		{
    			label: "Heeze-Leende",
    			value: "Heeze-Leende"
    		},
    		{ label: "Heiloo", value: "Heiloo" },
    		{
    			label: "Hellendoorn",
    			value: "Hellendoorn"
    		},
    		{
    			label: "Hellevoetsluis",
    			value: "Hellevoetsluis"
    		},
    		{ label: "Helmond", value: "Helmond" },
    		{
    			label: "Hendrik-Ido-Ambacht",
    			value: "Hendrik-Ido-Ambacht"
    		},
    		{ label: "Hengelo", value: "Hengelo" },
    		{
    			label: "Het Hogeland",
    			value: "Het Hogeland"
    		},
    		{ label: "Heumen", value: "Heumen" },
    		{ label: "Heusden", value: "Heusden" },
    		{ label: "Hillegom", value: "Hillegom" },
    		{
    			label: "Hilvarenbeek",
    			value: "Hilvarenbeek"
    		},
    		{ label: "Hilversum", value: "Hilversum" },
    		{
    			label: "Hoeksche Waard",
    			value: "Hoeksche Waard"
    		},
    		{
    			label: "Hof van Twente",
    			value: "Hof van Twente"
    		},
    		{
    			label: "Hollands Kroon",
    			value: "Hollands Kroon"
    		},
    		{ label: "Hoogeveen", value: "Hoogeveen" },
    		{ label: "Hoorn", value: "Hoorn" },
    		{
    			label: "Horst aan de Maas",
    			value: "Horst aan de Maas"
    		},
    		{ label: "Houten", value: "Houten" },
    		{ label: "Huizen", value: "Huizen" },
    		{ label: "Hulst", value: "Hulst" },
    		{
    			label: "IJsselstein",
    			value: "IJsselstein"
    		},
    		{
    			label: "Kaag en Braassem",
    			value: "Kaag en Braassem"
    		},
    		{ label: "Kampen", value: "Kampen" },
    		{ label: "Kapelle", value: "Kapelle" },
    		{ label: "Katwijk", value: "Katwijk" },
    		{ label: "Kerkrade", value: "Kerkrade" },
    		{ label: "Koggenland", value: "Koggenland" },
    		{
    			label: "Krimpen aan den IJssel",
    			value: "Krimpen aan den IJssel"
    		},
    		{
    			label: "Krimpenerwaard",
    			value: "Krimpenerwaard"
    		},
    		{ label: "Laarbeek", value: "Laarbeek" },
    		{ label: "Landerd", value: "Landerd" },
    		{ label: "Landgraaf", value: "Landgraaf" },
    		{ label: "Landsmeer", value: "Landsmeer" },
    		{ label: "Langedijk", value: "Langedijk" },
    		{
    			label: "Lansingerland",
    			value: "Lansingerland"
    		},
    		{ label: "Laren", value: "Laren" },
    		{ label: "Leeuwarden", value: "Leeuwarden" },
    		{ label: "Leiden", value: "Leiden" },
    		{ label: "Leiderdorp", value: "Leiderdorp" },
    		{
    			label: "Leidschendam-Voorburg",
    			value: "Leidschendam-Voorburg"
    		},
    		{ label: "Lelystad", value: "Lelystad" },
    		{ label: "Leudal", value: "Leudal" },
    		{ label: "Leusden", value: "Leusden" },
    		{ label: "Lingewaard", value: "Lingewaard" },
    		{ label: "Lisse", value: "Lisse" },
    		{ label: "Lochem", value: "Lochem" },
    		{
    			label: "Loon op Zand",
    			value: "Loon op Zand"
    		},
    		{ label: "Lopik", value: "Lopik" },
    		{ label: "Loppersum", value: "Loppersum" },
    		{ label: "Losser", value: "Losser" },
    		{ label: "Maasdriel", value: "Maasdriel" },
    		{ label: "Maasgouw", value: "Maasgouw" },
    		{ label: "Maassluis", value: "Maassluis" },
    		{ label: "Maastricht", value: "Maastricht" },
    		{ label: "Medemblik", value: "Medemblik" },
    		{ label: "Meerssen", value: "Meerssen" },
    		{
    			label: "Meierijstad",
    			value: "Meierijstad"
    		},
    		{ label: "Meppel", value: "Meppel" },
    		{ label: "Middelburg", value: "Middelburg" },
    		{
    			label: "Midden-Delfland",
    			value: "Midden-Delfland"
    		},
    		{
    			label: "Midden-Drenthe",
    			value: "Midden-Drenthe"
    		},
    		{
    			label: "Midden-Groningen",
    			value: "Midden-Groningen"
    		},
    		{
    			label: "Mill en Sint Hubert",
    			value: "Mill en Sint Hubert"
    		},
    		{ label: "Moerdijk", value: "Moerdijk" },
    		{
    			label: "Molenlanden",
    			value: "Molenlanden"
    		},
    		{
    			label: "Montferland",
    			value: "Montferland"
    		},
    		{ label: "Montfoort", value: "Montfoort" },
    		{
    			label: "Mook en Middelaar",
    			value: "Mook en Middelaar"
    		},
    		{
    			label: "Neder-Betuwe",
    			value: "Neder-Betuwe"
    		},
    		{ label: "Nederweert", value: "Nederweert" },
    		{ label: "Nieuwegein", value: "Nieuwegein" },
    		{ label: "Nieuwkoop", value: "Nieuwkoop" },
    		{ label: "Nijkerk", value: "Nijkerk" },
    		{ label: "Nijmegen", value: "Nijmegen" },
    		{ label: "Nissewaard", value: "Nissewaard" },
    		{
    			label: "Noardeast-Fryslân",
    			value: "Noardeast-Fryslân"
    		},
    		{
    			label: "Noord-Beveland",
    			value: "Noord-Beveland"
    		},
    		{
    			label: "Noordenveld",
    			value: "Noordenveld"
    		},
    		{
    			label: "Noordoostpolder",
    			value: "Noordoostpolder"
    		},
    		{ label: "Noordwijk", value: "Noordwijk" },
    		{
    			label: "Nuenen Gerwen en Nederwetten",
    			value: "Nuenen Gerwen en Nederwetten"
    		},
    		{ label: "Nunspeet", value: "Nunspeet" },
    		{ label: "Oegstgeest", value: "Oegstgeest" },
    		{ label: "Oirschot", value: "Oirschot" },
    		{ label: "Oisterwijk", value: "Oisterwijk" },
    		{ label: "Oldambt", value: "Oldambt" },
    		{ label: "Oldebroek", value: "Oldebroek" },
    		{ label: "Oldenzaal", value: "Oldenzaal" },
    		{ label: "Olst-Wijhe", value: "Olst-Wijhe" },
    		{ label: "Ommen", value: "Ommen" },
    		{ label: "Oost Gelre", value: "Oost Gelre" },
    		{ label: "Oosterhout", value: "Oosterhout" },
    		{
    			label: "Ooststellingwerf",
    			value: "Ooststellingwerf"
    		},
    		{ label: "Oostzaan", value: "Oostzaan" },
    		{ label: "Opmeer", value: "Opmeer" },
    		{ label: "Opsterland", value: "Opsterland" },
    		{ label: "Oss", value: "Oss" },
    		{
    			label: "Oude IJsselstreek",
    			value: "Oude IJsselstreek"
    		},
    		{
    			label: "Ouder-Amstel",
    			value: "Ouder-Amstel"
    		},
    		{ label: "Oudewater", value: "Oudewater" },
    		{ label: "Overbetuwe", value: "Overbetuwe" },
    		{
    			label: "Papendrecht",
    			value: "Papendrecht"
    		},
    		{
    			label: "Peel en Maas",
    			value: "Peel en Maas"
    		},
    		{ label: "Pekela", value: "Pekela" },
    		{
    			label: "Pijnacker-Nootdorp",
    			value: "Pijnacker-Nootdorp"
    		},
    		{ label: "Purmerend", value: "Purmerend" },
    		{ label: "Putten", value: "Putten" },
    		{ label: "Raalte", value: "Raalte" },
    		{
    			label: "Reimerswaal",
    			value: "Reimerswaal"
    		},
    		{ label: "Renkum", value: "Renkum" },
    		{ label: "Renswoude", value: "Renswoude" },
    		{
    			label: "Reusel-De Mierden",
    			value: "Reusel-De Mierden"
    		},
    		{ label: "Rheden", value: "Rheden" },
    		{ label: "Rhenen", value: "Rhenen" },
    		{ label: "Ridderkerk", value: "Ridderkerk" },
    		{
    			label: "Rijssen-Holten",
    			value: "Rijssen-Holten"
    		},
    		{ label: "Rijswijk", value: "Rijswijk" },
    		{ label: "Roerdalen", value: "Roerdalen" },
    		{ label: "Roermond", value: "Roermond" },
    		{ label: "Roosendaal", value: "Roosendaal" },
    		{ label: "Rotterdam", value: "Rotterdam" },
    		{ label: "Rozendaal", value: "Rozendaal" },
    		{ label: "Rucphen", value: "Rucphen" },
    		{
    			label: "s-Gravenhage",
    			value: "s-Gravenhage"
    		},
    		{
    			label: "s-Hertogenbosch",
    			value: "s-Hertogenbosch"
    		},
    		{ label: "Schagen", value: "Schagen" },
    		{
    			label: "Scherpenzeel",
    			value: "Scherpenzeel"
    		},
    		{ label: "Schiedam", value: "Schiedam" },
    		{
    			label: "Schiermonnikoog",
    			value: "Schiermonnikoog"
    		},
    		{
    			label: "Schouwen-Duiveland",
    			value: "Schouwen-Duiveland"
    		},
    		{ label: "Simpelveld", value: "Simpelveld" },
    		{
    			label: "Sint Anthonis",
    			value: "Sint Anthonis"
    		},
    		{
    			label: "Sint-Michielsgestel",
    			value: "Sint-Michielsgestel"
    		},
    		{
    			label: "Sittard-Geleen",
    			value: "Sittard-Geleen"
    		},
    		{ label: "Sliedrecht", value: "Sliedrecht" },
    		{ label: "Sluis", value: "Sluis" },
    		{
    			label: "Smallingerland",
    			value: "Smallingerland"
    		},
    		{ label: "Soest", value: "Soest" },
    		{ label: "Someren", value: "Someren" },
    		{
    			label: "Son en Breugel",
    			value: "Son en Breugel"
    		},
    		{
    			label: "Stadskanaal",
    			value: "Stadskanaal"
    		},
    		{ label: "Staphorst", value: "Staphorst" },
    		{
    			label: "Stede Broec",
    			value: "Stede Broec"
    		},
    		{
    			label: "Steenbergen",
    			value: "Steenbergen"
    		},
    		{
    			label: "Steenwijkerland",
    			value: "Steenwijkerland"
    		},
    		{ label: "Stein", value: "Stein" },
    		{
    			label: "Stichtse Vecht",
    			value: "Stichtse Vecht"
    		},
    		{
    			label: "Súdwest-Fryslân",
    			value: "Súdwest-Fryslân"
    		},
    		{ label: "Terneuzen", value: "Terneuzen" },
    		{
    			label: "Terschelling",
    			value: "Terschelling"
    		},
    		{ label: "Texel", value: "Texel" },
    		{ label: "Teylingen", value: "Teylingen" },
    		{ label: "Tholen", value: "Tholen" },
    		{ label: "Tiel", value: "Tiel" },
    		{ label: "Tilburg", value: "Tilburg" },
    		{ label: "Tubbergen", value: "Tubbergen" },
    		{ label: "Twenterand", value: "Twenterand" },
    		{ label: "Tynaarlo", value: "Tynaarlo" },
    		{
    			label: "Tytsjerksteradiel",
    			value: "Tytsjerksteradiel"
    		},
    		{ label: "Uden", value: "Uden" },
    		{ label: "Uitgeest", value: "Uitgeest" },
    		{ label: "Uithoorn", value: "Uithoorn" },
    		{ label: "Urk", value: "Urk" },
    		{ label: "Utrecht", value: "Utrecht" },
    		{
    			label: "Utrechtse Heuvelrug",
    			value: "Utrechtse Heuvelrug"
    		},
    		{ label: "Vaals", value: "Vaals" },
    		{
    			label: "Valkenburg aan de Geul",
    			value: "Valkenburg aan de Geul"
    		},
    		{
    			label: "Valkenswaard",
    			value: "Valkenswaard"
    		},
    		{ label: "Veendam", value: "Veendam" },
    		{ label: "Veenendaal", value: "Veenendaal" },
    		{ label: "Veere", value: "Veere" },
    		{ label: "Veldhoven", value: "Veldhoven" },
    		{ label: "Velsen", value: "Velsen" },
    		{ label: "Venlo", value: "Venlo" },
    		{ label: "Venray", value: "Venray" },
    		{
    			label: "Vijfheerenlanden",
    			value: "Vijfheerenlanden"
    		},
    		{
    			label: "Vlaardingen",
    			value: "Vlaardingen"
    		},
    		{ label: "Vlieland", value: "Vlieland" },
    		{ label: "Vlissingen", value: "Vlissingen" },
    		{ label: "Voerendaal", value: "Voerendaal" },
    		{
    			label: "Voorschoten",
    			value: "Voorschoten"
    		},
    		{ label: "Voorst", value: "Voorst" },
    		{ label: "Vught", value: "Vught" },
    		{ label: "Waadhoeke", value: "Waadhoeke" },
    		{ label: "Waalre", value: "Waalre" },
    		{ label: "Waalwijk", value: "Waalwijk" },
    		{
    			label: "Waddinxveen",
    			value: "Waddinxveen"
    		},
    		{ label: "Wageningen", value: "Wageningen" },
    		{ label: "Wassenaar", value: "Wassenaar" },
    		{ label: "Waterland", value: "Waterland" },
    		{ label: "Weert", value: "Weert" },
    		{ label: "Weesp", value: "Weesp" },
    		{
    			label: "West Betuwe",
    			value: "West Betuwe"
    		},
    		{
    			label: "West Maas en Waal",
    			value: "West Maas en Waal"
    		},
    		{
    			label: "Westerkwartier",
    			value: "Westerkwartier"
    		},
    		{ label: "Westerveld", value: "Westerveld" },
    		{
    			label: "Westervoort",
    			value: "Westervoort"
    		},
    		{
    			label: "Westerwolde",
    			value: "Westerwolde"
    		},
    		{ label: "Westland", value: "Westland" },
    		{
    			label: "Weststellingwerf",
    			value: "Weststellingwerf"
    		},
    		{ label: "Westvoorne", value: "Westvoorne" },
    		{ label: "Wierden", value: "Wierden" },
    		{ label: "Wijchen", value: "Wijchen" },
    		{ label: "Wijdemeren", value: "Wijdemeren" },
    		{
    			label: "Wijk bij Duurstede",
    			value: "Wijk bij Duurstede"
    		},
    		{
    			label: "Winterswijk",
    			value: "Winterswijk"
    		},
    		{
    			label: "Woensdrecht",
    			value: "Woensdrecht"
    		},
    		{ label: "Woerden", value: "Woerden" },
    		{ label: "Wormerland", value: "Wormerland" },
    		{ label: "Woudenberg", value: "Woudenberg" },
    		{ label: "Zaanstad", value: "Zaanstad" },
    		{ label: "Zaltbommel", value: "Zaltbommel" },
    		{ label: "Zandvoort", value: "Zandvoort" },
    		{ label: "Zeewolde", value: "Zeewolde" },
    		{ label: "Zeist", value: "Zeist" },
    		{ label: "Zevenaar", value: "Zevenaar" },
    		{ label: "Zoetermeer", value: "Zoetermeer" },
    		{
    			label: "Zoeterwoude",
    			value: "Zoeterwoude"
    		},
    		{ label: "Zuidplas", value: "Zuidplas" },
    		{ label: "Zundert", value: "Zundert" },
    		{ label: "Zutphen", value: "Zutphen" },
    		{
    			label: "Zwartewaterland",
    			value: "Zwartewaterland"
    		},
    		{
    			label: "Zwijndrecht",
    			value: "Zwijndrecht"
    		},
    		{ label: "Zwolle", value: "Zwolle" }
    	];

    	function handleSelect(event) {
    		value = event.detail.value; // gemeentenaam  
    		store_selectie_gemeentenaam.update(n => value);

    		if (value != "" && value != "Selecteer...") {
    			d3.csv("csv/gemeenten_2020.csv").then(function (datagemeenten, error) {
    				var selectie_gm_code;
    				var i;

    				for (i = 0; i < datagemeenten.length; i++) {
    					if (datagemeenten[i].gm_naam == value) {
    						selectie_gm_code = datagemeenten[i].gm_code;
    					}
    				}

    				start_analysis(selectie_gm_code);
    				draw_contextlaag(); //achtergrondkaart met indicatie bebouwingsdichtheid op straatniveau
    				d3.select("#welkomstScherm").remove();
    				d3.select("#OutputPanel").style("visibility", "visible");
    				d3.select("#InputPanel").style("visibility", "visible");
    				d3.select("#LegendaPanel").style("visibility", "visible");
    				d3.selectAll(".leaflet-control-container").style("visibility", "visible");
    				d3.select("#InputPanel").transition().duration(1500).style("top", "0px");
    				d3.select("#mapcontext_radiobuttons").transition().duration(1500).style("left", "3px");
    				d3.select("#button_handleiding").transition().duration(1500).style("left", "3px");
    				d3.selectAll(".leaflet-control").transition().duration(1200).style("top", "85px");
    				toggle_legenda(1);
    				d3.select("#SliderPanel").transition().duration(1500).style("top", "-80px");
    			});
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GemeenteSelector> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MaterialApp,
    		Select,
    		onMount,
    		store_selectie_gemeentenaam,
    		theme,
    		value,
    		items,
    		handleSelect
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("value" in $$props) value = $$props.value;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, items, handleSelect];
    }

    class GemeenteSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GemeenteSelector",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    function create_fragment$y(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const component0 = new Calculations({
    			target: document.querySelector("#InputPanel")
    		});

    	const component1 = new DonutChart_weq({
    			target: document.querySelector("#donutChart")
    		});

    	const component2 = new DonutChart_bouwperiode({ target: document.querySelector("body") });
    	const component3 = new DonutChart_woningtype({ target: document.querySelector("body") });

    	const component4 = new InputPanel({
    			target: document.querySelector("#InputPanel")
    		});

    	const component5 = new SliderPanel({
    			target: document.querySelector("#SliderPanel")
    		});

    	const component6 = new OutputPanel({
    			target: document.querySelector("#OutputPanel")
    		});

    	const component7 = new LegendaPanel({
    			target: document.querySelector("#LegendaPanel")
    		});

    	const component8 = new Map$1({ target: document.querySelector("#map") });
    	const component9 = new GemeenteSelector({ target: document.querySelector("#main") });

    	onMount(() => {
    		window.onresize(); // init
    	});

    	window.onresize = () => {
    		window.resize_sliderpanel();
    		window.redraw_topbar();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Calculations,
    		DonutChartWeq: DonutChart_weq,
    		DonutChartBouwperiode: DonutChart_bouwperiode,
    		DonutChartWoningtype: DonutChart_woningtype,
    		InputPanel,
    		SliderPanel,
    		OutputPanel,
    		LegendaPanel,
    		Map: Map$1,
    		GemeenteSelector,
    		onMount,
    		component0,
    		component1,
    		component2,
    		component3,
    		component4,
    		component5,
    		component6,
    		component7,
    		component8,
    		component9
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
