
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
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

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
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
                block.p(changed, child_ctx);
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
    /**
     * Get the current value from a store by subscribing and immediately unsubscribing.
     * @param store readable
     */
    function get_store_value(store) {
        let value;
        const unsubscribe = store.subscribe(_ => value = _);
        if (unsubscribe.unsubscribe)
            unsubscribe.unsubscribe();
        else
            unsubscribe();
        return value;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
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
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.6.10 */

    const file = "node_modules/svelte-icons/components/IconBase.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = 'svelte-c8tyih-style';
    	style.textContent = "svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNvbkJhc2Uuc3ZlbHRlIiwic291cmNlcyI6WyJJY29uQmFzZS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCB0aXRsZSA9IG51bGw7XG4gIGV4cG9ydCBsZXQgdmlld0JveDtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIHN2ZyB7XG4gICAgc3Ryb2tlOiBjdXJyZW50Q29sb3I7XG4gICAgZmlsbDogY3VycmVudENvbG9yO1xuICAgIHN0cm9rZS13aWR0aDogMDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IGF1dG87XG4gICAgbWF4LWhlaWdodDogMTAwJTtcbiAgfSAgXG48L3N0eWxlPlxuXG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB7dmlld0JveH0+XG4gIHsjaWYgdGl0bGV9XG4gICAgPHRpdGxlPnt0aXRsZX08L3RpdGxlPlxuICB7L2lmfVxuICA8c2xvdCAvPlxuPC9zdmc+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUUsR0FBRyxjQUFDLENBQUMsQUFDSCxNQUFNLENBQUUsWUFBWSxDQUNwQixJQUFJLENBQUUsWUFBWSxDQUNsQixZQUFZLENBQUUsQ0FBQyxDQUNmLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLElBQUksQ0FDWixVQUFVLENBQUUsSUFBSSxBQUNsQixDQUFDIn0= */";
    	append(document.head, style);
    }

    // (18:2) {#if title}
    function create_if_block(ctx) {
    	var title_1, t;

    	return {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(ctx.title);
    			add_location(title_1, file, 18, 4, 298);
    		},

    		m: function mount(target, anchor) {
    			insert(target, title_1, anchor);
    			append(title_1, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data(t, ctx.title);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(title_1);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var svg, if_block_anchor, current;

    	var if_block = (ctx.title) && create_if_block(ctx);

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();

    			if (default_slot) default_slot.c();

    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", ctx.viewBox);
    			attr(svg, "class", "svelte-c8tyih");
    			add_location(svg, file, 16, 0, 229);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(svg_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.title) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.viewBox) {
    				attr(svg, "viewBox", ctx.viewBox);
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
    			if (detaching) {
    				detach(svg);
    			}

    			if (if_block) if_block.d();

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { title = null, viewBox } = $$props;

    	const writable_props = ['title', 'viewBox'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('viewBox' in $$props) $$invalidate('viewBox', viewBox = $$props.viewBox);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { title, viewBox, $$slots, $$scope };
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-c8tyih-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, ["title", "viewBox"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.viewBox === undefined && !('viewBox' in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/md/MdCompareArrows.svelte generated by Svelte v3.6.10 */

    const file$1 = "node_modules/svelte-icons/md/MdCompareArrows.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot(ctx) {
    	var path;

    	return {
    		c: function create() {
    			path = svg_element("path");
    			attr(path, "d", "M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z");
    			add_location(path, file$1, 4, 10, 151);
    		},

    		m: function mount(target, anchor) {
    			insert(target, path, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(path);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var current;

    	var iconbase_spread_levels = [
    		{ viewBox: "0 0 24 24" },
    		ctx.$$props
    	];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};
    	for (var i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}
    	var iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	return {
    		c: function create() {
    			iconbase.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var iconbase_changes = changed.$$props ? get_spread_update(iconbase_spread_levels, [
    				iconbase_spread_levels[0],
    				ctx.$$props
    			]) : {};
    			if (changed.$$scope) iconbase_changes.$$scope = { changed, ctx };
    			iconbase.$set(iconbase_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    	};

    	return {
    		$$props,
    		$$props: $$props = exclude_internal_props($$props)
    	};
    }

    class MdCompareArrows extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function() {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active && !(this instanceof domain.Domain)) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n))
        throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn)
        handler.call(self);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self);
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn)
        handler.call(self, arg1);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1);
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn)
        handler.call(self, arg1, arg2);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2);
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn)
        handler.call(self, arg1, arg2, arg3);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2, arg3);
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn)
        handler.apply(self, args);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].apply(self, args);
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = (type === 'error');

      events = this._events;
      if (events)
        doError = (doError && events.error == null);
      else if (!doError)
        return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er)
            er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler)
        return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] :
                                              [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + type + ' listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = this._events;
          if (!events)
            return this;

          list = events[type];
          if (!list)
            return this;

          if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length; i-- > 0;) {
              if (list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (list.length === 1) {
              list[0] = undefined;
              if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
              } else {
                delete events[type];
              }
            } else {
              spliceOne(list, position);
            }

            if (events.removeListener)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events;

          events = this._events;
          if (!events)
            return this;

          // not listening for removeListener, no need to emit
          if (!events.removeListener) {
            if (arguments.length === 0) {
              this._events = new EventHandlers();
              this._eventsCount = 0;
            } else if (events[type]) {
              if (--this._eventsCount === 0)
                this._events = new EventHandlers();
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            for (var i = 0, key; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = new EventHandlers();
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners) {
            // LIFO order
            do {
              this.removeListener(type, listeners[listeners.length - 1]);
            } while (listeners[0]);
          }

          return this;
        };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events)
        ret = [];
      else {
        evlistener = events[type];
        if (!evlistener)
          ret = [];
        else if (typeof evlistener === 'function')
          ret = [evlistener.listener || evlistener];
        else
          ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
        list[i] = list[k];
      list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--)
        copy[i] = arr[i];
      return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    const JsonRpc = {
        messageId: 0,
    };
    const validateSingleMessage = message => !!message &&
        !message.error &&
        message.jsonrpc === '2.0' &&
        (typeof message.id === 'number' || typeof message.id === 'string') &&
        message.result !== undefined;
    /**
     * Should be called to valid json create payload object
     */
    function createJsonRpcPayload(method, params) {
        JsonRpc.messageId++;
        return {
            jsonrpc: '2.0',
            id: JsonRpc.messageId,
            method,
            params: params || [],
        };
    }
    /**
     * Should be called to check if jsonrpc response is valid
     */
    function isValidJsonRpcResponse(response) {
        return Array.isArray(response) ? response.every(validateSingleMessage) : validateSingleMessage(response);
    }

    class LegacyProviderAdapter {
        constructor(provider) {
            this.provider = provider;
            this.eventEmitter = new EventEmitter();
        }
        subscribeToLegacyProvider() {
            if (!this.provider.on) {
                throw new Error('Legacy provider does not support subscriptions.');
            }
            this.provider.on('data', (result, deprecatedResult) => {
                result = result || deprecatedResult;
                if (!result.method) {
                    return;
                }
                this.eventEmitter.emit('notification', result.params);
            });
        }
        send(method, params) {
            return new Promise((resolve, reject) => {
                const payload = createJsonRpcPayload(method, params);
                this.provider.send(payload, (err, message) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!message) {
                        return reject(new Error('No response.'));
                    }
                    if (!isValidJsonRpcResponse(message)) {
                        const msg = message.error && message.error.message
                            ? message.error.message
                            : 'Invalid JSON RPC response: ' + JSON.stringify(message);
                        return reject(new Error(msg));
                    }
                    const response = message;
                    if (response.error) {
                        const message = response.error.message ? response.error.message : JSON.stringify(response);
                        return reject(new Error('Returned error: ' + message));
                    }
                    if (response.id && payload.id !== response.id) {
                        return reject(new Error(`Wrong response id ${payload.id} != ${response.id} in ${JSON.stringify(payload)}`));
                    }
                    resolve(response.result);
                });
            });
        }
        on(notification, listener) {
            if (notification !== 'notification') {
                throw new Error('Legacy providers only support notification event.');
            }
            if (this.eventEmitter.listenerCount('notification') === 0) {
                this.subscribeToLegacyProvider();
            }
            this.eventEmitter.on('notification', listener);
            return this;
        }
        removeListener(notification, listener) {
            if (!this.provider.removeListener) {
                throw new Error('Legacy provider does not support subscriptions.');
            }
            if (notification !== 'notification') {
                throw new Error('Legacy providers only support notification event.');
            }
            this.eventEmitter.removeListener('notification', listener);
            if (this.eventEmitter.listenerCount('notification') === 0) {
                this.provider.removeAllListeners('data');
            }
            return this;
        }
        removeAllListeners(notification) {
            this.eventEmitter.removeAllListeners('notification');
            if (this.provider.removeAllListeners) {
                this.provider.removeAllListeners('data');
            }
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init$1 () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init$1();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init$1();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    var _kMaxLength = kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }

    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer.alloc(+length)
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    var bufferEs6 = /*#__PURE__*/Object.freeze({
        INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
        kMaxLength: _kMaxLength,
        Buffer: Buffer,
        SlowBuffer: SlowBuffer,
        isBuffer: isBuffer
    });

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // NOTE: These type checking functions intentionally don't use `instanceof`
    // because it is fragile and can be easily faked with `Object.create()`.
    function isArray$1(ar) {
      return Array.isArray(ar);
    }

    function isBoolean(arg) {
      return typeof arg === 'boolean';
    }

    function isString(arg) {
      return typeof arg === 'string';
    }

    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }

    /**
     * This software is released under the MIT License.
     * https://opensource.org/licenses/MIT
     */
    // This was ported from https://github.com/emn178/js-sha3, with some minor
    // modifications and pruning. It is licensed under MIT:
    //
    // Copyright 2015-2016 Chen, Yi-Cyuan
    //
    // Permission is hereby granted, free of charge, to any person obtaining
    // a copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to
    // permit persons to whom the Software is furnished to do so, subject to
    // the following conditions:
    //
    // The above copyright notice and this permission notice shall be
    // included in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    // EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    // LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    // OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    const HEX_CHARS = '0123456789abcdef'.split('');
    const KECCAK_PADDING = [1, 256, 65536, 16777216];
    const SHIFT = [0, 8, 16, 24];
    const RC = [
        1,
        0,
        32898,
        0,
        32906,
        2147483648,
        2147516416,
        2147483648,
        32907,
        0,
        2147483649,
        0,
        2147516545,
        2147483648,
        32777,
        2147483648,
        138,
        0,
        136,
        0,
        2147516425,
        0,
        2147483658,
        0,
        2147516555,
        0,
        139,
        2147483648,
        32905,
        2147483648,
        32771,
        2147483648,
        32770,
        2147483648,
        128,
        2147483648,
        32778,
        0,
        2147483658,
        2147483648,
        2147516545,
        2147483648,
        32896,
        2147483648,
        2147483649,
        0,
        2147516424,
        2147483648,
    ];
    const Keccak = bits => ({
        blocks: [],
        reset: true,
        block: 0,
        start: 0,
        blockCount: (1600 - (bits << 1)) >> 5,
        outputBlocks: bits >> 5,
        s: ((s) => {
            let x = [];
            return x.concat(s, s, s, s, s);
        })([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    });
    const update$1 = (state, message) => {
        var length = message.length, blocks = state.blocks, byteCount = state.blockCount << 2, blockCount = state.blockCount, outputBlocks = state.outputBlocks, s = state.s, index = 0, i, code;
        // update
        while (index < length) {
            if (state.reset) {
                state.reset = false;
                blocks[0] = state.block;
                for (i = 1; i < blockCount + 1; ++i) {
                    blocks[i] = 0;
                }
            }
            if (typeof message !== 'string') {
                for (i = state.start; index < length && i < byteCount; ++index) {
                    blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
                }
            }
            else {
                for (i = state.start; index < length && i < byteCount; ++index) {
                    code = message.charCodeAt(index);
                    if (code < 0x80) {
                        blocks[i >> 2] |= code << SHIFT[i++ & 3];
                    }
                    else if (code < 0x800) {
                        blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                    else if (code < 0xd800 || code >= 0xe000) {
                        blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                    else {
                        code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
                        blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                }
            }
            state.lastByteIndex = i;
            if (i >= byteCount) {
                state.start = i - byteCount;
                state.block = blocks[blockCount];
                for (i = 0; i < blockCount; ++i) {
                    s[i] ^= blocks[i];
                }
                f(s);
                state.reset = true;
            }
            else {
                state.start = i;
            }
        }
        // finalize
        i = state.lastByteIndex;
        blocks[i >> 2] |= KECCAK_PADDING[i & 3];
        if (state.lastByteIndex === byteCount) {
            blocks[0] = blocks[blockCount];
            for (i = 1; i < blockCount + 1; ++i) {
                blocks[i] = 0;
            }
        }
        blocks[blockCount - 1] |= 0x80000000;
        for (i = 0; i < blockCount; ++i) {
            s[i] ^= blocks[i];
        }
        f(s);
        // toString
        var hex = '', i = 0, j = 0, block;
        while (j < outputBlocks) {
            for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                block = s[i];
                hex +=
                    HEX_CHARS[(block >> 4) & 0x0f] +
                        HEX_CHARS[block & 0x0f] +
                        HEX_CHARS[(block >> 12) & 0x0f] +
                        HEX_CHARS[(block >> 8) & 0x0f] +
                        HEX_CHARS[(block >> 20) & 0x0f] +
                        HEX_CHARS[(block >> 16) & 0x0f] +
                        HEX_CHARS[(block >> 28) & 0x0f] +
                        HEX_CHARS[(block >> 24) & 0x0f];
            }
            if (j % blockCount === 0) {
                f(s);
                i = 0;
            }
        }
        return '0x' + hex;
    };
    const f = s => {
        var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
        for (n = 0; n < 48; n += 2) {
            c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
            c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
            c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
            c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
            c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
            c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
            c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
            c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
            c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
            c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
            h = c8 ^ ((c2 << 1) | (c3 >>> 31));
            l = c9 ^ ((c3 << 1) | (c2 >>> 31));
            s[0] ^= h;
            s[1] ^= l;
            s[10] ^= h;
            s[11] ^= l;
            s[20] ^= h;
            s[21] ^= l;
            s[30] ^= h;
            s[31] ^= l;
            s[40] ^= h;
            s[41] ^= l;
            h = c0 ^ ((c4 << 1) | (c5 >>> 31));
            l = c1 ^ ((c5 << 1) | (c4 >>> 31));
            s[2] ^= h;
            s[3] ^= l;
            s[12] ^= h;
            s[13] ^= l;
            s[22] ^= h;
            s[23] ^= l;
            s[32] ^= h;
            s[33] ^= l;
            s[42] ^= h;
            s[43] ^= l;
            h = c2 ^ ((c6 << 1) | (c7 >>> 31));
            l = c3 ^ ((c7 << 1) | (c6 >>> 31));
            s[4] ^= h;
            s[5] ^= l;
            s[14] ^= h;
            s[15] ^= l;
            s[24] ^= h;
            s[25] ^= l;
            s[34] ^= h;
            s[35] ^= l;
            s[44] ^= h;
            s[45] ^= l;
            h = c4 ^ ((c8 << 1) | (c9 >>> 31));
            l = c5 ^ ((c9 << 1) | (c8 >>> 31));
            s[6] ^= h;
            s[7] ^= l;
            s[16] ^= h;
            s[17] ^= l;
            s[26] ^= h;
            s[27] ^= l;
            s[36] ^= h;
            s[37] ^= l;
            s[46] ^= h;
            s[47] ^= l;
            h = c6 ^ ((c0 << 1) | (c1 >>> 31));
            l = c7 ^ ((c1 << 1) | (c0 >>> 31));
            s[8] ^= h;
            s[9] ^= l;
            s[18] ^= h;
            s[19] ^= l;
            s[28] ^= h;
            s[29] ^= l;
            s[38] ^= h;
            s[39] ^= l;
            s[48] ^= h;
            s[49] ^= l;
            b0 = s[0];
            b1 = s[1];
            b32 = (s[11] << 4) | (s[10] >>> 28);
            b33 = (s[10] << 4) | (s[11] >>> 28);
            b14 = (s[20] << 3) | (s[21] >>> 29);
            b15 = (s[21] << 3) | (s[20] >>> 29);
            b46 = (s[31] << 9) | (s[30] >>> 23);
            b47 = (s[30] << 9) | (s[31] >>> 23);
            b28 = (s[40] << 18) | (s[41] >>> 14);
            b29 = (s[41] << 18) | (s[40] >>> 14);
            b20 = (s[2] << 1) | (s[3] >>> 31);
            b21 = (s[3] << 1) | (s[2] >>> 31);
            b2 = (s[13] << 12) | (s[12] >>> 20);
            b3 = (s[12] << 12) | (s[13] >>> 20);
            b34 = (s[22] << 10) | (s[23] >>> 22);
            b35 = (s[23] << 10) | (s[22] >>> 22);
            b16 = (s[33] << 13) | (s[32] >>> 19);
            b17 = (s[32] << 13) | (s[33] >>> 19);
            b48 = (s[42] << 2) | (s[43] >>> 30);
            b49 = (s[43] << 2) | (s[42] >>> 30);
            b40 = (s[5] << 30) | (s[4] >>> 2);
            b41 = (s[4] << 30) | (s[5] >>> 2);
            b22 = (s[14] << 6) | (s[15] >>> 26);
            b23 = (s[15] << 6) | (s[14] >>> 26);
            b4 = (s[25] << 11) | (s[24] >>> 21);
            b5 = (s[24] << 11) | (s[25] >>> 21);
            b36 = (s[34] << 15) | (s[35] >>> 17);
            b37 = (s[35] << 15) | (s[34] >>> 17);
            b18 = (s[45] << 29) | (s[44] >>> 3);
            b19 = (s[44] << 29) | (s[45] >>> 3);
            b10 = (s[6] << 28) | (s[7] >>> 4);
            b11 = (s[7] << 28) | (s[6] >>> 4);
            b42 = (s[17] << 23) | (s[16] >>> 9);
            b43 = (s[16] << 23) | (s[17] >>> 9);
            b24 = (s[26] << 25) | (s[27] >>> 7);
            b25 = (s[27] << 25) | (s[26] >>> 7);
            b6 = (s[36] << 21) | (s[37] >>> 11);
            b7 = (s[37] << 21) | (s[36] >>> 11);
            b38 = (s[47] << 24) | (s[46] >>> 8);
            b39 = (s[46] << 24) | (s[47] >>> 8);
            b30 = (s[8] << 27) | (s[9] >>> 5);
            b31 = (s[9] << 27) | (s[8] >>> 5);
            b12 = (s[18] << 20) | (s[19] >>> 12);
            b13 = (s[19] << 20) | (s[18] >>> 12);
            b44 = (s[29] << 7) | (s[28] >>> 25);
            b45 = (s[28] << 7) | (s[29] >>> 25);
            b26 = (s[38] << 8) | (s[39] >>> 24);
            b27 = (s[39] << 8) | (s[38] >>> 24);
            b8 = (s[48] << 14) | (s[49] >>> 18);
            b9 = (s[49] << 14) | (s[48] >>> 18);
            s[0] = b0 ^ (~b2 & b4);
            s[1] = b1 ^ (~b3 & b5);
            s[10] = b10 ^ (~b12 & b14);
            s[11] = b11 ^ (~b13 & b15);
            s[20] = b20 ^ (~b22 & b24);
            s[21] = b21 ^ (~b23 & b25);
            s[30] = b30 ^ (~b32 & b34);
            s[31] = b31 ^ (~b33 & b35);
            s[40] = b40 ^ (~b42 & b44);
            s[41] = b41 ^ (~b43 & b45);
            s[2] = b2 ^ (~b4 & b6);
            s[3] = b3 ^ (~b5 & b7);
            s[12] = b12 ^ (~b14 & b16);
            s[13] = b13 ^ (~b15 & b17);
            s[22] = b22 ^ (~b24 & b26);
            s[23] = b23 ^ (~b25 & b27);
            s[32] = b32 ^ (~b34 & b36);
            s[33] = b33 ^ (~b35 & b37);
            s[42] = b42 ^ (~b44 & b46);
            s[43] = b43 ^ (~b45 & b47);
            s[4] = b4 ^ (~b6 & b8);
            s[5] = b5 ^ (~b7 & b9);
            s[14] = b14 ^ (~b16 & b18);
            s[15] = b15 ^ (~b17 & b19);
            s[24] = b24 ^ (~b26 & b28);
            s[25] = b25 ^ (~b27 & b29);
            s[34] = b34 ^ (~b36 & b38);
            s[35] = b35 ^ (~b37 & b39);
            s[44] = b44 ^ (~b46 & b48);
            s[45] = b45 ^ (~b47 & b49);
            s[6] = b6 ^ (~b8 & b0);
            s[7] = b7 ^ (~b9 & b1);
            s[16] = b16 ^ (~b18 & b10);
            s[17] = b17 ^ (~b19 & b11);
            s[26] = b26 ^ (~b28 & b20);
            s[27] = b27 ^ (~b29 & b21);
            s[36] = b36 ^ (~b38 & b30);
            s[37] = b37 ^ (~b39 & b31);
            s[46] = b46 ^ (~b48 & b40);
            s[47] = b47 ^ (~b49 & b41);
            s[8] = b8 ^ (~b0 & b2);
            s[9] = b9 ^ (~b1 & b3);
            s[18] = b18 ^ (~b10 & b12);
            s[19] = b19 ^ (~b11 & b13);
            s[28] = b28 ^ (~b20 & b22);
            s[29] = b29 ^ (~b21 & b23);
            s[38] = b38 ^ (~b30 & b32);
            s[39] = b39 ^ (~b31 & b33);
            s[48] = b48 ^ (~b40 & b42);
            s[49] = b49 ^ (~b41 & b43);
            s[0] ^= RC[n];
            s[1] ^= RC[n + 1];
        }
    };
    const keccak = bits => str => {
        var msg;
        if (str.slice(0, 2) === '0x') {
            msg = [];
            for (var i = 2, l = str.length; i < l; i += 2)
                msg.push(parseInt(str.slice(i, i + 2), 16));
        }
        else {
            msg = str;
        }
        return update$1(Keccak(bits), msg);
    };
    const keccak256 = keccak(256);
    const keccak512 = keccak(512);
    const keccak256s = keccak(256);
    const keccak512s = keccak(512);
    var Hash = {
        keccak256,
        keccak512,
        keccak256s,
        keccak512s,
    };

    /**
     * Hashes values to a sha3 hash using keccak 256
     *
     * To hash a HEX string the hex must have 0x in front.
     *
     * @method sha3
     * @return {String} the sha3 string
     */
    function sha3(value) {
        return Hash.keccak256(value);
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        'default': _nodeResolve_empty
    });

    var require$$0 = getCjsExportFromNamespace(_nodeResolve_empty$1);

    var bn = createCommonjsModule(function (module) {
    (function (module, exports) {

      // Utils
      function assert (val, msg) {
        if (!val) throw new Error(msg || 'Assertion failed');
      }

      // Could use `inherits` module, but don't want to move from single file
      // architecture yet.
      function inherits (ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }

      // BN

      function BN (number, base, endian) {
        if (BN.isBN(number)) {
          return number;
        }

        this.negative = 0;
        this.words = null;
        this.length = 0;

        // Reduction context
        this.red = null;

        if (number !== null) {
          if (base === 'le' || base === 'be') {
            endian = base;
            base = 10;
          }

          this._init(number || 0, base || 10, endian || 'be');
        }
      }
      if (typeof module === 'object') {
        module.exports = BN;
      } else {
        exports.BN = BN;
      }

      BN.BN = BN;
      BN.wordSize = 26;

      var Buffer;
      try {
        Buffer = require$$0.Buffer;
      } catch (e) {
      }

      BN.isBN = function isBN (num) {
        if (num instanceof BN) {
          return true;
        }

        return num !== null && typeof num === 'object' &&
          num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      };

      BN.max = function max (left, right) {
        if (left.cmp(right) > 0) return left;
        return right;
      };

      BN.min = function min (left, right) {
        if (left.cmp(right) < 0) return left;
        return right;
      };

      BN.prototype._init = function init (number, base, endian) {
        if (typeof number === 'number') {
          return this._initNumber(number, base, endian);
        }

        if (typeof number === 'object') {
          return this._initArray(number, base, endian);
        }

        if (base === 'hex') {
          base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);

        number = number.toString().replace(/\s+/g, '');
        var start = 0;
        if (number[0] === '-') {
          start++;
        }

        if (base === 16) {
          this._parseHex(number, start);
        } else {
          this._parseBase(number, base, start);
        }

        if (number[0] === '-') {
          this.negative = 1;
        }

        this.strip();

        if (endian !== 'le') return;

        this._initArray(this.toArray(), base, endian);
      };

      BN.prototype._initNumber = function _initNumber (number, base, endian) {
        if (number < 0) {
          this.negative = 1;
          number = -number;
        }
        if (number < 0x4000000) {
          this.words = [ number & 0x3ffffff ];
          this.length = 1;
        } else if (number < 0x10000000000000) {
          this.words = [
            number & 0x3ffffff,
            (number / 0x4000000) & 0x3ffffff
          ];
          this.length = 2;
        } else {
          assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
          this.words = [
            number & 0x3ffffff,
            (number / 0x4000000) & 0x3ffffff,
            1
          ];
          this.length = 3;
        }

        if (endian !== 'le') return;

        // Reverse the bytes
        this._initArray(this.toArray(), base, endian);
      };

      BN.prototype._initArray = function _initArray (number, base, endian) {
        // Perhaps a Uint8Array
        assert(typeof number.length === 'number');
        if (number.length <= 0) {
          this.words = [ 0 ];
          this.length = 1;
          return this;
        }

        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }

        var j, w;
        var off = 0;
        if (endian === 'be') {
          for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
            w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
            this.words[j] |= (w << off) & 0x3ffffff;
            this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        } else if (endian === 'le') {
          for (i = 0, j = 0; i < number.length; i += 3) {
            w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
            this.words[j] |= (w << off) & 0x3ffffff;
            this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        }
        return this.strip();
      };

      function parseHex (str, start, end) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;

          r <<= 4;

          // 'a' - 'f'
          if (c >= 49 && c <= 54) {
            r |= c - 49 + 0xa;

          // 'A' - 'F'
          } else if (c >= 17 && c <= 22) {
            r |= c - 17 + 0xa;

          // '0' - '9'
          } else {
            r |= c & 0xf;
          }
        }
        return r;
      }

      BN.prototype._parseHex = function _parseHex (number, start) {
        // Create possibly bigger array to ensure that it fits the number
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }

        var j, w;
        // Scan 24-bit chunks and add them to the number
        var off = 0;
        for (i = number.length - 6, j = 0; i >= start; i -= 6) {
          w = parseHex(number, i, i + 6);
          this.words[j] |= (w << off) & 0x3ffffff;
          // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
          this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
        if (i + 6 !== start) {
          w = parseHex(number, start, i + 6);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
        }
        this.strip();
      };

      function parseBase (str, start, end, mul) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;

          r *= mul;

          // 'a'
          if (c >= 49) {
            r += c - 49 + 0xa;

          // 'A'
          } else if (c >= 17) {
            r += c - 17 + 0xa;

          // '0' - '9'
          } else {
            r += c;
          }
        }
        return r;
      }

      BN.prototype._parseBase = function _parseBase (number, base, start) {
        // Initialize as zero
        this.words = [ 0 ];
        this.length = 1;

        // Find length of limb in base
        for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
          limbLen++;
        }
        limbLen--;
        limbPow = (limbPow / base) | 0;

        var total = number.length - start;
        var mod = total % limbLen;
        var end = Math.min(total, total - mod) + start;

        var word = 0;
        for (var i = start; i < end; i += limbLen) {
          word = parseBase(number, i, i + limbLen, base);

          this.imuln(limbPow);
          if (this.words[0] + word < 0x4000000) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }

        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i, number.length, base);

          for (i = 0; i < mod; i++) {
            pow *= base;
          }

          this.imuln(pow);
          if (this.words[0] + word < 0x4000000) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
      };

      BN.prototype.copy = function copy (dest) {
        dest.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          dest.words[i] = this.words[i];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
      };

      BN.prototype.clone = function clone () {
        var r = new BN(null);
        this.copy(r);
        return r;
      };

      BN.prototype._expand = function _expand (size) {
        while (this.length < size) {
          this.words[this.length++] = 0;
        }
        return this;
      };

      // Remove leading `0` from `this`
      BN.prototype.strip = function strip () {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--;
        }
        return this._normSign();
      };

      BN.prototype._normSign = function _normSign () {
        // -0 = 0
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0;
        }
        return this;
      };

      BN.prototype.inspect = function inspect () {
        return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
      };

      /*

      var zeros = [];
      var groupSizes = [];
      var groupBases = [];

      var s = '';
      var i = -1;
      while (++i < BN.wordSize) {
        zeros[i] = s;
        s += '0';
      }
      groupSizes[0] = 0;
      groupSizes[1] = 0;
      groupBases[0] = 0;
      groupBases[1] = 0;
      var base = 2 - 1;
      while (++base < 36 + 1) {
        var groupSize = 0;
        var groupBase = 1;
        while (groupBase < (1 << BN.wordSize) / base) {
          groupBase *= base;
          groupSize += 1;
        }
        groupSizes[base] = groupSize;
        groupBases[base] = groupBase;
      }

      */

      var zeros = [
        '',
        '0',
        '00',
        '000',
        '0000',
        '00000',
        '000000',
        '0000000',
        '00000000',
        '000000000',
        '0000000000',
        '00000000000',
        '000000000000',
        '0000000000000',
        '00000000000000',
        '000000000000000',
        '0000000000000000',
        '00000000000000000',
        '000000000000000000',
        '0000000000000000000',
        '00000000000000000000',
        '000000000000000000000',
        '0000000000000000000000',
        '00000000000000000000000',
        '000000000000000000000000',
        '0000000000000000000000000'
      ];

      var groupSizes = [
        0, 0,
        25, 16, 12, 11, 10, 9, 8,
        8, 7, 7, 7, 7, 6, 6,
        6, 6, 6, 6, 6, 5, 5,
        5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5
      ];

      var groupBases = [
        0, 0,
        33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
        43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
        16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
        6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
        24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
      ];

      BN.prototype.toString = function toString (base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;

        var out;
        if (base === 16 || base === 'hex') {
          out = '';
          var off = 0;
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = this.words[i];
            var word = (((w << off) | carry) & 0xffffff).toString(16);
            carry = (w >>> (24 - off)) & 0xffffff;
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out;
            } else {
              out = word + out;
            }
            off += 2;
            if (off >= 26) {
              off -= 26;
              i--;
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out;
          }
          while (out.length % padding !== 0) {
            out = '0' + out;
          }
          if (this.negative !== 0) {
            out = '-' + out;
          }
          return out;
        }

        if (base === (base | 0) && base >= 2 && base <= 36) {
          // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
          var groupSize = groupSizes[base];
          // var groupBase = Math.pow(base, groupSize);
          var groupBase = groupBases[base];
          out = '';
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            c = c.idivn(groupBase);

            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out;
            } else {
              out = r + out;
            }
          }
          if (this.isZero()) {
            out = '0' + out;
          }
          while (out.length % padding !== 0) {
            out = '0' + out;
          }
          if (this.negative !== 0) {
            out = '-' + out;
          }
          return out;
        }

        assert(false, 'Base should be between 2 and 36');
      };

      BN.prototype.toNumber = function toNumber () {
        var ret = this.words[0];
        if (this.length === 2) {
          ret += this.words[1] * 0x4000000;
        } else if (this.length === 3 && this.words[2] === 0x01) {
          // NOTE: at this stage it is known that the top bit is set
          ret += 0x10000000000000 + (this.words[1] * 0x4000000);
        } else if (this.length > 2) {
          assert(false, 'Number can only safely store up to 53 bits');
        }
        return (this.negative !== 0) ? -ret : ret;
      };

      BN.prototype.toJSON = function toJSON () {
        return this.toString(16);
      };

      BN.prototype.toBuffer = function toBuffer (endian, length) {
        assert(typeof Buffer !== 'undefined');
        return this.toArrayLike(Buffer, endian, length);
      };

      BN.prototype.toArray = function toArray (endian, length) {
        return this.toArrayLike(Array, endian, length);
      };

      BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
        var byteLength = this.byteLength();
        var reqLength = length || Math.max(1, byteLength);
        assert(byteLength <= reqLength, 'byte array longer than desired length');
        assert(reqLength > 0, 'Requested array length <= 0');

        this.strip();
        var littleEndian = endian === 'le';
        var res = new ArrayType(reqLength);

        var b, i;
        var q = this.clone();
        if (!littleEndian) {
          // Assume big-endian
          for (i = 0; i < reqLength - byteLength; i++) {
            res[i] = 0;
          }

          for (i = 0; !q.isZero(); i++) {
            b = q.andln(0xff);
            q.iushrn(8);

            res[reqLength - i - 1] = b;
          }
        } else {
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(0xff);
            q.iushrn(8);

            res[i] = b;
          }

          for (; i < reqLength; i++) {
            res[i] = 0;
          }
        }

        return res;
      };

      if (Math.clz32) {
        BN.prototype._countBits = function _countBits (w) {
          return 32 - Math.clz32(w);
        };
      } else {
        BN.prototype._countBits = function _countBits (w) {
          var t = w;
          var r = 0;
          if (t >= 0x1000) {
            r += 13;
            t >>>= 13;
          }
          if (t >= 0x40) {
            r += 7;
            t >>>= 7;
          }
          if (t >= 0x8) {
            r += 4;
            t >>>= 4;
          }
          if (t >= 0x02) {
            r += 2;
            t >>>= 2;
          }
          return r + t;
        };
      }

      BN.prototype._zeroBits = function _zeroBits (w) {
        // Short-cut
        if (w === 0) return 26;

        var t = w;
        var r = 0;
        if ((t & 0x1fff) === 0) {
          r += 13;
          t >>>= 13;
        }
        if ((t & 0x7f) === 0) {
          r += 7;
          t >>>= 7;
        }
        if ((t & 0xf) === 0) {
          r += 4;
          t >>>= 4;
        }
        if ((t & 0x3) === 0) {
          r += 2;
          t >>>= 2;
        }
        if ((t & 0x1) === 0) {
          r++;
        }
        return r;
      };

      // Return number of used bits in a BN
      BN.prototype.bitLength = function bitLength () {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };

      function toBitArray (num) {
        var w = new Array(num.bitLength());

        for (var bit = 0; bit < w.length; bit++) {
          var off = (bit / 26) | 0;
          var wbit = bit % 26;

          w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
        }

        return w;
      }

      // Number of trailing zero bits
      BN.prototype.zeroBits = function zeroBits () {
        if (this.isZero()) return 0;

        var r = 0;
        for (var i = 0; i < this.length; i++) {
          var b = this._zeroBits(this.words[i]);
          r += b;
          if (b !== 26) break;
        }
        return r;
      };

      BN.prototype.byteLength = function byteLength () {
        return Math.ceil(this.bitLength() / 8);
      };

      BN.prototype.toTwos = function toTwos (width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
      };

      BN.prototype.fromTwos = function fromTwos (width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
      };

      BN.prototype.isNeg = function isNeg () {
        return this.negative !== 0;
      };

      // Return negative clone of `this`
      BN.prototype.neg = function neg () {
        return this.clone().ineg();
      };

      BN.prototype.ineg = function ineg () {
        if (!this.isZero()) {
          this.negative ^= 1;
        }

        return this;
      };

      // Or `num` with `this` in-place
      BN.prototype.iuor = function iuor (num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0;
        }

        for (var i = 0; i < num.length; i++) {
          this.words[i] = this.words[i] | num.words[i];
        }

        return this.strip();
      };

      BN.prototype.ior = function ior (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
      };

      // Or `num` with `this`
      BN.prototype.or = function or (num) {
        if (this.length > num.length) return this.clone().ior(num);
        return num.clone().ior(this);
      };

      BN.prototype.uor = function uor (num) {
        if (this.length > num.length) return this.clone().iuor(num);
        return num.clone().iuor(this);
      };

      // And `num` with `this` in-place
      BN.prototype.iuand = function iuand (num) {
        // b = min-length(num, this)
        var b;
        if (this.length > num.length) {
          b = num;
        } else {
          b = this;
        }

        for (var i = 0; i < b.length; i++) {
          this.words[i] = this.words[i] & num.words[i];
        }

        this.length = b.length;

        return this.strip();
      };

      BN.prototype.iand = function iand (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
      };

      // And `num` with `this`
      BN.prototype.and = function and (num) {
        if (this.length > num.length) return this.clone().iand(num);
        return num.clone().iand(this);
      };

      BN.prototype.uand = function uand (num) {
        if (this.length > num.length) return this.clone().iuand(num);
        return num.clone().iuand(this);
      };

      // Xor `num` with `this` in-place
      BN.prototype.iuxor = function iuxor (num) {
        // a.length > b.length
        var a;
        var b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        for (var i = 0; i < b.length; i++) {
          this.words[i] = a.words[i] ^ b.words[i];
        }

        if (this !== a) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        this.length = a.length;

        return this.strip();
      };

      BN.prototype.ixor = function ixor (num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
      };

      // Xor `num` with `this`
      BN.prototype.xor = function xor (num) {
        if (this.length > num.length) return this.clone().ixor(num);
        return num.clone().ixor(this);
      };

      BN.prototype.uxor = function uxor (num) {
        if (this.length > num.length) return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      };

      // Not ``this`` with ``width`` bitwidth
      BN.prototype.inotn = function inotn (width) {
        assert(typeof width === 'number' && width >= 0);

        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;

        // Extend the buffer with leading zeroes
        this._expand(bytesNeeded);

        if (bitsLeft > 0) {
          bytesNeeded--;
        }

        // Handle complete words
        for (var i = 0; i < bytesNeeded; i++) {
          this.words[i] = ~this.words[i] & 0x3ffffff;
        }

        // Handle the residue
        if (bitsLeft > 0) {
          this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
        }

        // And remove leading zeroes
        return this.strip();
      };

      BN.prototype.notn = function notn (width) {
        return this.clone().inotn(width);
      };

      // Set `bit` of `this`
      BN.prototype.setn = function setn (bit, val) {
        assert(typeof bit === 'number' && bit >= 0);

        var off = (bit / 26) | 0;
        var wbit = bit % 26;

        this._expand(off + 1);

        if (val) {
          this.words[off] = this.words[off] | (1 << wbit);
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit);
        }

        return this.strip();
      };

      // Add `num` to `this` in-place
      BN.prototype.iadd = function iadd (num) {
        var r;

        // negative + positive
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0;
          r = this.isub(num);
          this.negative ^= 1;
          return this._normSign();

        // positive + negative
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0;
          r = this.isub(num);
          num.negative = 1;
          return r._normSign();
        }

        // a.length > b.length
        var a, b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
          this.words[i] = r & 0x3ffffff;
          carry = r >>> 26;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          this.words[i] = r & 0x3ffffff;
          carry = r >>> 26;
        }

        this.length = a.length;
        if (carry !== 0) {
          this.words[this.length] = carry;
          this.length++;
        // Copy the rest of the words
        } else if (a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        return this;
      };

      // Add `num` to `this`
      BN.prototype.add = function add (num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0;
          res = this.sub(num);
          num.negative ^= 1;
          return res;
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0;
          res = num.sub(this);
          this.negative = 1;
          return res;
        }

        if (this.length > num.length) return this.clone().iadd(num);

        return num.clone().iadd(this);
      };

      // Subtract `num` from `this` in-place
      BN.prototype.isub = function isub (num) {
        // this - (-num) = this + num
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          num.negative = 1;
          return r._normSign();

        // -this - num = -(this + num)
        } else if (this.negative !== 0) {
          this.negative = 0;
          this.iadd(num);
          this.negative = 1;
          return this._normSign();
        }

        // At this point both numbers are positive
        var cmp = this.cmp(num);

        // Optimization - zeroify
        if (cmp === 0) {
          this.negative = 0;
          this.length = 1;
          this.words[0] = 0;
          return this;
        }

        // a > b
        var a, b;
        if (cmp > 0) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }

        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 0x3ffffff;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 0x3ffffff;
        }

        // Copy rest of the words
        if (carry === 0 && i < a.length && a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }

        this.length = Math.max(this.length, i);

        if (a !== this) {
          this.negative = 1;
        }

        return this.strip();
      };

      // Subtract `num` from `this`
      BN.prototype.sub = function sub (num) {
        return this.clone().isub(num);
      };

      function smallMulTo (self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len = (self.length + num.length) | 0;
        out.length = len;
        len = (len - 1) | 0;

        // Peel one iteration (compiler can't do it, because of code complexity)
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        var carry = (r / 0x4000000) | 0;
        out.words[0] = lo;

        for (var k = 1; k < len; k++) {
          // Sum all words with the same `i + j = k` and accumulate `ncarry`,
          // note that ncarry could be >= 0x3ffffff
          var ncarry = carry >>> 26;
          var rword = carry & 0x3ffffff;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = (k - j) | 0;
            a = self.words[i] | 0;
            b = num.words[j] | 0;
            r = a * b + rword;
            ncarry += (r / 0x4000000) | 0;
            rword = r & 0x3ffffff;
          }
          out.words[k] = rword | 0;
          carry = ncarry | 0;
        }
        if (carry !== 0) {
          out.words[k] = carry | 0;
        } else {
          out.length--;
        }

        return out.strip();
      }

      // TODO(indutny): it may be reasonable to omit it for users who don't need
      // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
      // multiplication (like elliptic secp256k1).
      var comb10MulTo = function comb10MulTo (self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 0x1fff;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 0x1fff;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 0x1fff;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 0x1fff;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 0x1fff;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 0x1fff;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 0x1fff;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 0x1fff;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 0x1fff;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 0x1fff;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 0x1fff;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 0x1fff;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 0x1fff;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 0x1fff;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 0x1fff;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 0x1fff;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 0x1fff;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 0x1fff;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 0x1fff;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 0x1fff;
        var bh9 = b9 >>> 13;

        out.negative = self.negative ^ num.negative;
        out.length = 19;
        /* k = 0 */
        lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = (mid + Math.imul(ah0, bl0)) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
        w0 &= 0x3ffffff;
        /* k = 1 */
        lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = (mid + Math.imul(ah1, bl0)) | 0;
        hi = Math.imul(ah1, bh0);
        lo = (lo + Math.imul(al0, bl1)) | 0;
        mid = (mid + Math.imul(al0, bh1)) | 0;
        mid = (mid + Math.imul(ah0, bl1)) | 0;
        hi = (hi + Math.imul(ah0, bh1)) | 0;
        var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
        w1 &= 0x3ffffff;
        /* k = 2 */
        lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = (mid + Math.imul(ah2, bl0)) | 0;
        hi = Math.imul(ah2, bh0);
        lo = (lo + Math.imul(al1, bl1)) | 0;
        mid = (mid + Math.imul(al1, bh1)) | 0;
        mid = (mid + Math.imul(ah1, bl1)) | 0;
        hi = (hi + Math.imul(ah1, bh1)) | 0;
        lo = (lo + Math.imul(al0, bl2)) | 0;
        mid = (mid + Math.imul(al0, bh2)) | 0;
        mid = (mid + Math.imul(ah0, bl2)) | 0;
        hi = (hi + Math.imul(ah0, bh2)) | 0;
        var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
        w2 &= 0x3ffffff;
        /* k = 3 */
        lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = (mid + Math.imul(ah3, bl0)) | 0;
        hi = Math.imul(ah3, bh0);
        lo = (lo + Math.imul(al2, bl1)) | 0;
        mid = (mid + Math.imul(al2, bh1)) | 0;
        mid = (mid + Math.imul(ah2, bl1)) | 0;
        hi = (hi + Math.imul(ah2, bh1)) | 0;
        lo = (lo + Math.imul(al1, bl2)) | 0;
        mid = (mid + Math.imul(al1, bh2)) | 0;
        mid = (mid + Math.imul(ah1, bl2)) | 0;
        hi = (hi + Math.imul(ah1, bh2)) | 0;
        lo = (lo + Math.imul(al0, bl3)) | 0;
        mid = (mid + Math.imul(al0, bh3)) | 0;
        mid = (mid + Math.imul(ah0, bl3)) | 0;
        hi = (hi + Math.imul(ah0, bh3)) | 0;
        var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
        w3 &= 0x3ffffff;
        /* k = 4 */
        lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = (mid + Math.imul(ah4, bl0)) | 0;
        hi = Math.imul(ah4, bh0);
        lo = (lo + Math.imul(al3, bl1)) | 0;
        mid = (mid + Math.imul(al3, bh1)) | 0;
        mid = (mid + Math.imul(ah3, bl1)) | 0;
        hi = (hi + Math.imul(ah3, bh1)) | 0;
        lo = (lo + Math.imul(al2, bl2)) | 0;
        mid = (mid + Math.imul(al2, bh2)) | 0;
        mid = (mid + Math.imul(ah2, bl2)) | 0;
        hi = (hi + Math.imul(ah2, bh2)) | 0;
        lo = (lo + Math.imul(al1, bl3)) | 0;
        mid = (mid + Math.imul(al1, bh3)) | 0;
        mid = (mid + Math.imul(ah1, bl3)) | 0;
        hi = (hi + Math.imul(ah1, bh3)) | 0;
        lo = (lo + Math.imul(al0, bl4)) | 0;
        mid = (mid + Math.imul(al0, bh4)) | 0;
        mid = (mid + Math.imul(ah0, bl4)) | 0;
        hi = (hi + Math.imul(ah0, bh4)) | 0;
        var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
        w4 &= 0x3ffffff;
        /* k = 5 */
        lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = (mid + Math.imul(ah5, bl0)) | 0;
        hi = Math.imul(ah5, bh0);
        lo = (lo + Math.imul(al4, bl1)) | 0;
        mid = (mid + Math.imul(al4, bh1)) | 0;
        mid = (mid + Math.imul(ah4, bl1)) | 0;
        hi = (hi + Math.imul(ah4, bh1)) | 0;
        lo = (lo + Math.imul(al3, bl2)) | 0;
        mid = (mid + Math.imul(al3, bh2)) | 0;
        mid = (mid + Math.imul(ah3, bl2)) | 0;
        hi = (hi + Math.imul(ah3, bh2)) | 0;
        lo = (lo + Math.imul(al2, bl3)) | 0;
        mid = (mid + Math.imul(al2, bh3)) | 0;
        mid = (mid + Math.imul(ah2, bl3)) | 0;
        hi = (hi + Math.imul(ah2, bh3)) | 0;
        lo = (lo + Math.imul(al1, bl4)) | 0;
        mid = (mid + Math.imul(al1, bh4)) | 0;
        mid = (mid + Math.imul(ah1, bl4)) | 0;
        hi = (hi + Math.imul(ah1, bh4)) | 0;
        lo = (lo + Math.imul(al0, bl5)) | 0;
        mid = (mid + Math.imul(al0, bh5)) | 0;
        mid = (mid + Math.imul(ah0, bl5)) | 0;
        hi = (hi + Math.imul(ah0, bh5)) | 0;
        var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
        w5 &= 0x3ffffff;
        /* k = 6 */
        lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = (mid + Math.imul(ah6, bl0)) | 0;
        hi = Math.imul(ah6, bh0);
        lo = (lo + Math.imul(al5, bl1)) | 0;
        mid = (mid + Math.imul(al5, bh1)) | 0;
        mid = (mid + Math.imul(ah5, bl1)) | 0;
        hi = (hi + Math.imul(ah5, bh1)) | 0;
        lo = (lo + Math.imul(al4, bl2)) | 0;
        mid = (mid + Math.imul(al4, bh2)) | 0;
        mid = (mid + Math.imul(ah4, bl2)) | 0;
        hi = (hi + Math.imul(ah4, bh2)) | 0;
        lo = (lo + Math.imul(al3, bl3)) | 0;
        mid = (mid + Math.imul(al3, bh3)) | 0;
        mid = (mid + Math.imul(ah3, bl3)) | 0;
        hi = (hi + Math.imul(ah3, bh3)) | 0;
        lo = (lo + Math.imul(al2, bl4)) | 0;
        mid = (mid + Math.imul(al2, bh4)) | 0;
        mid = (mid + Math.imul(ah2, bl4)) | 0;
        hi = (hi + Math.imul(ah2, bh4)) | 0;
        lo = (lo + Math.imul(al1, bl5)) | 0;
        mid = (mid + Math.imul(al1, bh5)) | 0;
        mid = (mid + Math.imul(ah1, bl5)) | 0;
        hi = (hi + Math.imul(ah1, bh5)) | 0;
        lo = (lo + Math.imul(al0, bl6)) | 0;
        mid = (mid + Math.imul(al0, bh6)) | 0;
        mid = (mid + Math.imul(ah0, bl6)) | 0;
        hi = (hi + Math.imul(ah0, bh6)) | 0;
        var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
        w6 &= 0x3ffffff;
        /* k = 7 */
        lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = (mid + Math.imul(ah7, bl0)) | 0;
        hi = Math.imul(ah7, bh0);
        lo = (lo + Math.imul(al6, bl1)) | 0;
        mid = (mid + Math.imul(al6, bh1)) | 0;
        mid = (mid + Math.imul(ah6, bl1)) | 0;
        hi = (hi + Math.imul(ah6, bh1)) | 0;
        lo = (lo + Math.imul(al5, bl2)) | 0;
        mid = (mid + Math.imul(al5, bh2)) | 0;
        mid = (mid + Math.imul(ah5, bl2)) | 0;
        hi = (hi + Math.imul(ah5, bh2)) | 0;
        lo = (lo + Math.imul(al4, bl3)) | 0;
        mid = (mid + Math.imul(al4, bh3)) | 0;
        mid = (mid + Math.imul(ah4, bl3)) | 0;
        hi = (hi + Math.imul(ah4, bh3)) | 0;
        lo = (lo + Math.imul(al3, bl4)) | 0;
        mid = (mid + Math.imul(al3, bh4)) | 0;
        mid = (mid + Math.imul(ah3, bl4)) | 0;
        hi = (hi + Math.imul(ah3, bh4)) | 0;
        lo = (lo + Math.imul(al2, bl5)) | 0;
        mid = (mid + Math.imul(al2, bh5)) | 0;
        mid = (mid + Math.imul(ah2, bl5)) | 0;
        hi = (hi + Math.imul(ah2, bh5)) | 0;
        lo = (lo + Math.imul(al1, bl6)) | 0;
        mid = (mid + Math.imul(al1, bh6)) | 0;
        mid = (mid + Math.imul(ah1, bl6)) | 0;
        hi = (hi + Math.imul(ah1, bh6)) | 0;
        lo = (lo + Math.imul(al0, bl7)) | 0;
        mid = (mid + Math.imul(al0, bh7)) | 0;
        mid = (mid + Math.imul(ah0, bl7)) | 0;
        hi = (hi + Math.imul(ah0, bh7)) | 0;
        var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
        w7 &= 0x3ffffff;
        /* k = 8 */
        lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = (mid + Math.imul(ah8, bl0)) | 0;
        hi = Math.imul(ah8, bh0);
        lo = (lo + Math.imul(al7, bl1)) | 0;
        mid = (mid + Math.imul(al7, bh1)) | 0;
        mid = (mid + Math.imul(ah7, bl1)) | 0;
        hi = (hi + Math.imul(ah7, bh1)) | 0;
        lo = (lo + Math.imul(al6, bl2)) | 0;
        mid = (mid + Math.imul(al6, bh2)) | 0;
        mid = (mid + Math.imul(ah6, bl2)) | 0;
        hi = (hi + Math.imul(ah6, bh2)) | 0;
        lo = (lo + Math.imul(al5, bl3)) | 0;
        mid = (mid + Math.imul(al5, bh3)) | 0;
        mid = (mid + Math.imul(ah5, bl3)) | 0;
        hi = (hi + Math.imul(ah5, bh3)) | 0;
        lo = (lo + Math.imul(al4, bl4)) | 0;
        mid = (mid + Math.imul(al4, bh4)) | 0;
        mid = (mid + Math.imul(ah4, bl4)) | 0;
        hi = (hi + Math.imul(ah4, bh4)) | 0;
        lo = (lo + Math.imul(al3, bl5)) | 0;
        mid = (mid + Math.imul(al3, bh5)) | 0;
        mid = (mid + Math.imul(ah3, bl5)) | 0;
        hi = (hi + Math.imul(ah3, bh5)) | 0;
        lo = (lo + Math.imul(al2, bl6)) | 0;
        mid = (mid + Math.imul(al2, bh6)) | 0;
        mid = (mid + Math.imul(ah2, bl6)) | 0;
        hi = (hi + Math.imul(ah2, bh6)) | 0;
        lo = (lo + Math.imul(al1, bl7)) | 0;
        mid = (mid + Math.imul(al1, bh7)) | 0;
        mid = (mid + Math.imul(ah1, bl7)) | 0;
        hi = (hi + Math.imul(ah1, bh7)) | 0;
        lo = (lo + Math.imul(al0, bl8)) | 0;
        mid = (mid + Math.imul(al0, bh8)) | 0;
        mid = (mid + Math.imul(ah0, bl8)) | 0;
        hi = (hi + Math.imul(ah0, bh8)) | 0;
        var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
        w8 &= 0x3ffffff;
        /* k = 9 */
        lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = (mid + Math.imul(ah9, bl0)) | 0;
        hi = Math.imul(ah9, bh0);
        lo = (lo + Math.imul(al8, bl1)) | 0;
        mid = (mid + Math.imul(al8, bh1)) | 0;
        mid = (mid + Math.imul(ah8, bl1)) | 0;
        hi = (hi + Math.imul(ah8, bh1)) | 0;
        lo = (lo + Math.imul(al7, bl2)) | 0;
        mid = (mid + Math.imul(al7, bh2)) | 0;
        mid = (mid + Math.imul(ah7, bl2)) | 0;
        hi = (hi + Math.imul(ah7, bh2)) | 0;
        lo = (lo + Math.imul(al6, bl3)) | 0;
        mid = (mid + Math.imul(al6, bh3)) | 0;
        mid = (mid + Math.imul(ah6, bl3)) | 0;
        hi = (hi + Math.imul(ah6, bh3)) | 0;
        lo = (lo + Math.imul(al5, bl4)) | 0;
        mid = (mid + Math.imul(al5, bh4)) | 0;
        mid = (mid + Math.imul(ah5, bl4)) | 0;
        hi = (hi + Math.imul(ah5, bh4)) | 0;
        lo = (lo + Math.imul(al4, bl5)) | 0;
        mid = (mid + Math.imul(al4, bh5)) | 0;
        mid = (mid + Math.imul(ah4, bl5)) | 0;
        hi = (hi + Math.imul(ah4, bh5)) | 0;
        lo = (lo + Math.imul(al3, bl6)) | 0;
        mid = (mid + Math.imul(al3, bh6)) | 0;
        mid = (mid + Math.imul(ah3, bl6)) | 0;
        hi = (hi + Math.imul(ah3, bh6)) | 0;
        lo = (lo + Math.imul(al2, bl7)) | 0;
        mid = (mid + Math.imul(al2, bh7)) | 0;
        mid = (mid + Math.imul(ah2, bl7)) | 0;
        hi = (hi + Math.imul(ah2, bh7)) | 0;
        lo = (lo + Math.imul(al1, bl8)) | 0;
        mid = (mid + Math.imul(al1, bh8)) | 0;
        mid = (mid + Math.imul(ah1, bl8)) | 0;
        hi = (hi + Math.imul(ah1, bh8)) | 0;
        lo = (lo + Math.imul(al0, bl9)) | 0;
        mid = (mid + Math.imul(al0, bh9)) | 0;
        mid = (mid + Math.imul(ah0, bl9)) | 0;
        hi = (hi + Math.imul(ah0, bh9)) | 0;
        var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
        w9 &= 0x3ffffff;
        /* k = 10 */
        lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = (mid + Math.imul(ah9, bl1)) | 0;
        hi = Math.imul(ah9, bh1);
        lo = (lo + Math.imul(al8, bl2)) | 0;
        mid = (mid + Math.imul(al8, bh2)) | 0;
        mid = (mid + Math.imul(ah8, bl2)) | 0;
        hi = (hi + Math.imul(ah8, bh2)) | 0;
        lo = (lo + Math.imul(al7, bl3)) | 0;
        mid = (mid + Math.imul(al7, bh3)) | 0;
        mid = (mid + Math.imul(ah7, bl3)) | 0;
        hi = (hi + Math.imul(ah7, bh3)) | 0;
        lo = (lo + Math.imul(al6, bl4)) | 0;
        mid = (mid + Math.imul(al6, bh4)) | 0;
        mid = (mid + Math.imul(ah6, bl4)) | 0;
        hi = (hi + Math.imul(ah6, bh4)) | 0;
        lo = (lo + Math.imul(al5, bl5)) | 0;
        mid = (mid + Math.imul(al5, bh5)) | 0;
        mid = (mid + Math.imul(ah5, bl5)) | 0;
        hi = (hi + Math.imul(ah5, bh5)) | 0;
        lo = (lo + Math.imul(al4, bl6)) | 0;
        mid = (mid + Math.imul(al4, bh6)) | 0;
        mid = (mid + Math.imul(ah4, bl6)) | 0;
        hi = (hi + Math.imul(ah4, bh6)) | 0;
        lo = (lo + Math.imul(al3, bl7)) | 0;
        mid = (mid + Math.imul(al3, bh7)) | 0;
        mid = (mid + Math.imul(ah3, bl7)) | 0;
        hi = (hi + Math.imul(ah3, bh7)) | 0;
        lo = (lo + Math.imul(al2, bl8)) | 0;
        mid = (mid + Math.imul(al2, bh8)) | 0;
        mid = (mid + Math.imul(ah2, bl8)) | 0;
        hi = (hi + Math.imul(ah2, bh8)) | 0;
        lo = (lo + Math.imul(al1, bl9)) | 0;
        mid = (mid + Math.imul(al1, bh9)) | 0;
        mid = (mid + Math.imul(ah1, bl9)) | 0;
        hi = (hi + Math.imul(ah1, bh9)) | 0;
        var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
        w10 &= 0x3ffffff;
        /* k = 11 */
        lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = (mid + Math.imul(ah9, bl2)) | 0;
        hi = Math.imul(ah9, bh2);
        lo = (lo + Math.imul(al8, bl3)) | 0;
        mid = (mid + Math.imul(al8, bh3)) | 0;
        mid = (mid + Math.imul(ah8, bl3)) | 0;
        hi = (hi + Math.imul(ah8, bh3)) | 0;
        lo = (lo + Math.imul(al7, bl4)) | 0;
        mid = (mid + Math.imul(al7, bh4)) | 0;
        mid = (mid + Math.imul(ah7, bl4)) | 0;
        hi = (hi + Math.imul(ah7, bh4)) | 0;
        lo = (lo + Math.imul(al6, bl5)) | 0;
        mid = (mid + Math.imul(al6, bh5)) | 0;
        mid = (mid + Math.imul(ah6, bl5)) | 0;
        hi = (hi + Math.imul(ah6, bh5)) | 0;
        lo = (lo + Math.imul(al5, bl6)) | 0;
        mid = (mid + Math.imul(al5, bh6)) | 0;
        mid = (mid + Math.imul(ah5, bl6)) | 0;
        hi = (hi + Math.imul(ah5, bh6)) | 0;
        lo = (lo + Math.imul(al4, bl7)) | 0;
        mid = (mid + Math.imul(al4, bh7)) | 0;
        mid = (mid + Math.imul(ah4, bl7)) | 0;
        hi = (hi + Math.imul(ah4, bh7)) | 0;
        lo = (lo + Math.imul(al3, bl8)) | 0;
        mid = (mid + Math.imul(al3, bh8)) | 0;
        mid = (mid + Math.imul(ah3, bl8)) | 0;
        hi = (hi + Math.imul(ah3, bh8)) | 0;
        lo = (lo + Math.imul(al2, bl9)) | 0;
        mid = (mid + Math.imul(al2, bh9)) | 0;
        mid = (mid + Math.imul(ah2, bl9)) | 0;
        hi = (hi + Math.imul(ah2, bh9)) | 0;
        var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
        w11 &= 0x3ffffff;
        /* k = 12 */
        lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = (mid + Math.imul(ah9, bl3)) | 0;
        hi = Math.imul(ah9, bh3);
        lo = (lo + Math.imul(al8, bl4)) | 0;
        mid = (mid + Math.imul(al8, bh4)) | 0;
        mid = (mid + Math.imul(ah8, bl4)) | 0;
        hi = (hi + Math.imul(ah8, bh4)) | 0;
        lo = (lo + Math.imul(al7, bl5)) | 0;
        mid = (mid + Math.imul(al7, bh5)) | 0;
        mid = (mid + Math.imul(ah7, bl5)) | 0;
        hi = (hi + Math.imul(ah7, bh5)) | 0;
        lo = (lo + Math.imul(al6, bl6)) | 0;
        mid = (mid + Math.imul(al6, bh6)) | 0;
        mid = (mid + Math.imul(ah6, bl6)) | 0;
        hi = (hi + Math.imul(ah6, bh6)) | 0;
        lo = (lo + Math.imul(al5, bl7)) | 0;
        mid = (mid + Math.imul(al5, bh7)) | 0;
        mid = (mid + Math.imul(ah5, bl7)) | 0;
        hi = (hi + Math.imul(ah5, bh7)) | 0;
        lo = (lo + Math.imul(al4, bl8)) | 0;
        mid = (mid + Math.imul(al4, bh8)) | 0;
        mid = (mid + Math.imul(ah4, bl8)) | 0;
        hi = (hi + Math.imul(ah4, bh8)) | 0;
        lo = (lo + Math.imul(al3, bl9)) | 0;
        mid = (mid + Math.imul(al3, bh9)) | 0;
        mid = (mid + Math.imul(ah3, bl9)) | 0;
        hi = (hi + Math.imul(ah3, bh9)) | 0;
        var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
        w12 &= 0x3ffffff;
        /* k = 13 */
        lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = (mid + Math.imul(ah9, bl4)) | 0;
        hi = Math.imul(ah9, bh4);
        lo = (lo + Math.imul(al8, bl5)) | 0;
        mid = (mid + Math.imul(al8, bh5)) | 0;
        mid = (mid + Math.imul(ah8, bl5)) | 0;
        hi = (hi + Math.imul(ah8, bh5)) | 0;
        lo = (lo + Math.imul(al7, bl6)) | 0;
        mid = (mid + Math.imul(al7, bh6)) | 0;
        mid = (mid + Math.imul(ah7, bl6)) | 0;
        hi = (hi + Math.imul(ah7, bh6)) | 0;
        lo = (lo + Math.imul(al6, bl7)) | 0;
        mid = (mid + Math.imul(al6, bh7)) | 0;
        mid = (mid + Math.imul(ah6, bl7)) | 0;
        hi = (hi + Math.imul(ah6, bh7)) | 0;
        lo = (lo + Math.imul(al5, bl8)) | 0;
        mid = (mid + Math.imul(al5, bh8)) | 0;
        mid = (mid + Math.imul(ah5, bl8)) | 0;
        hi = (hi + Math.imul(ah5, bh8)) | 0;
        lo = (lo + Math.imul(al4, bl9)) | 0;
        mid = (mid + Math.imul(al4, bh9)) | 0;
        mid = (mid + Math.imul(ah4, bl9)) | 0;
        hi = (hi + Math.imul(ah4, bh9)) | 0;
        var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
        w13 &= 0x3ffffff;
        /* k = 14 */
        lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = (mid + Math.imul(ah9, bl5)) | 0;
        hi = Math.imul(ah9, bh5);
        lo = (lo + Math.imul(al8, bl6)) | 0;
        mid = (mid + Math.imul(al8, bh6)) | 0;
        mid = (mid + Math.imul(ah8, bl6)) | 0;
        hi = (hi + Math.imul(ah8, bh6)) | 0;
        lo = (lo + Math.imul(al7, bl7)) | 0;
        mid = (mid + Math.imul(al7, bh7)) | 0;
        mid = (mid + Math.imul(ah7, bl7)) | 0;
        hi = (hi + Math.imul(ah7, bh7)) | 0;
        lo = (lo + Math.imul(al6, bl8)) | 0;
        mid = (mid + Math.imul(al6, bh8)) | 0;
        mid = (mid + Math.imul(ah6, bl8)) | 0;
        hi = (hi + Math.imul(ah6, bh8)) | 0;
        lo = (lo + Math.imul(al5, bl9)) | 0;
        mid = (mid + Math.imul(al5, bh9)) | 0;
        mid = (mid + Math.imul(ah5, bl9)) | 0;
        hi = (hi + Math.imul(ah5, bh9)) | 0;
        var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
        w14 &= 0x3ffffff;
        /* k = 15 */
        lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = (mid + Math.imul(ah9, bl6)) | 0;
        hi = Math.imul(ah9, bh6);
        lo = (lo + Math.imul(al8, bl7)) | 0;
        mid = (mid + Math.imul(al8, bh7)) | 0;
        mid = (mid + Math.imul(ah8, bl7)) | 0;
        hi = (hi + Math.imul(ah8, bh7)) | 0;
        lo = (lo + Math.imul(al7, bl8)) | 0;
        mid = (mid + Math.imul(al7, bh8)) | 0;
        mid = (mid + Math.imul(ah7, bl8)) | 0;
        hi = (hi + Math.imul(ah7, bh8)) | 0;
        lo = (lo + Math.imul(al6, bl9)) | 0;
        mid = (mid + Math.imul(al6, bh9)) | 0;
        mid = (mid + Math.imul(ah6, bl9)) | 0;
        hi = (hi + Math.imul(ah6, bh9)) | 0;
        var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
        w15 &= 0x3ffffff;
        /* k = 16 */
        lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = (mid + Math.imul(ah9, bl7)) | 0;
        hi = Math.imul(ah9, bh7);
        lo = (lo + Math.imul(al8, bl8)) | 0;
        mid = (mid + Math.imul(al8, bh8)) | 0;
        mid = (mid + Math.imul(ah8, bl8)) | 0;
        hi = (hi + Math.imul(ah8, bh8)) | 0;
        lo = (lo + Math.imul(al7, bl9)) | 0;
        mid = (mid + Math.imul(al7, bh9)) | 0;
        mid = (mid + Math.imul(ah7, bl9)) | 0;
        hi = (hi + Math.imul(ah7, bh9)) | 0;
        var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
        w16 &= 0x3ffffff;
        /* k = 17 */
        lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = (mid + Math.imul(ah9, bl8)) | 0;
        hi = Math.imul(ah9, bh8);
        lo = (lo + Math.imul(al8, bl9)) | 0;
        mid = (mid + Math.imul(al8, bh9)) | 0;
        mid = (mid + Math.imul(ah8, bl9)) | 0;
        hi = (hi + Math.imul(ah8, bh9)) | 0;
        var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
        w17 &= 0x3ffffff;
        /* k = 18 */
        lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = (mid + Math.imul(ah9, bl9)) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
        c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
        w18 &= 0x3ffffff;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
          o[19] = c;
          out.length++;
        }
        return out;
      };

      // Polyfill comb
      if (!Math.imul) {
        comb10MulTo = smallMulTo;
      }

      function bigMulTo (self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;

        var carry = 0;
        var hncarry = 0;
        for (var k = 0; k < out.length - 1; k++) {
          // Sum all words with the same `i + j = k` and accumulate `ncarry`,
          // note that ncarry could be >= 0x3ffffff
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 0x3ffffff;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j;
            var a = self.words[i] | 0;
            var b = num.words[j] | 0;
            var r = a * b;

            var lo = r & 0x3ffffff;
            ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
            lo = (lo + rword) | 0;
            rword = lo & 0x3ffffff;
            ncarry = (ncarry + (lo >>> 26)) | 0;

            hncarry += ncarry >>> 26;
            ncarry &= 0x3ffffff;
          }
          out.words[k] = rword;
          carry = ncarry;
          ncarry = hncarry;
        }
        if (carry !== 0) {
          out.words[k] = carry;
        } else {
          out.length--;
        }

        return out.strip();
      }

      function jumboMulTo (self, num, out) {
        var fftm = new FFTM();
        return fftm.mulp(self, num, out);
      }

      BN.prototype.mulTo = function mulTo (num, out) {
        var res;
        var len = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out);
        } else if (len < 63) {
          res = smallMulTo(this, num, out);
        } else if (len < 1024) {
          res = bigMulTo(this, num, out);
        } else {
          res = jumboMulTo(this, num, out);
        }

        return res;
      };

      // Cooley-Tukey algorithm for FFT
      // slightly revisited to rely on looping instead of recursion

      function FFTM (x, y) {
        this.x = x;
        this.y = y;
      }

      FFTM.prototype.makeRBT = function makeRBT (N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for (var i = 0; i < N; i++) {
          t[i] = this.revBin(i, l, N);
        }

        return t;
      };

      // Returns binary-reversed representation of `x`
      FFTM.prototype.revBin = function revBin (x, l, N) {
        if (x === 0 || x === N - 1) return x;

        var rb = 0;
        for (var i = 0; i < l; i++) {
          rb |= (x & 1) << (l - i - 1);
          x >>= 1;
        }

        return rb;
      };

      // Performs "tweedling" phase, therefore 'emulating'
      // behaviour of the recursive algorithm
      FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
        for (var i = 0; i < N; i++) {
          rtws[i] = rws[rbt[i]];
          itws[i] = iws[rbt[i]];
        }
      };

      FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);

        for (var s = 1; s < N; s <<= 1) {
          var l = s << 1;

          var rtwdf = Math.cos(2 * Math.PI / l);
          var itwdf = Math.sin(2 * Math.PI / l);

          for (var p = 0; p < N; p += l) {
            var rtwdf_ = rtwdf;
            var itwdf_ = itwdf;

            for (var j = 0; j < s; j++) {
              var re = rtws[p + j];
              var ie = itws[p + j];

              var ro = rtws[p + j + s];
              var io = itws[p + j + s];

              var rx = rtwdf_ * ro - itwdf_ * io;

              io = rtwdf_ * io + itwdf_ * ro;
              ro = rx;

              rtws[p + j] = re + ro;
              itws[p + j] = ie + io;

              rtws[p + j + s] = re - ro;
              itws[p + j + s] = ie - io;

              /* jshint maxdepth : false */
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_;

                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                rtwdf_ = rx;
              }
            }
          }
        }
      };

      FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i = 0;
        for (N = N / 2 | 0; N; N = N >>> 1) {
          i++;
        }

        return 1 << i + 1 + odd;
      };

      FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
        if (N <= 1) return;

        for (var i = 0; i < N / 2; i++) {
          var t = rws[i];

          rws[i] = rws[N - i - 1];
          rws[N - i - 1] = t;

          t = iws[i];

          iws[i] = -iws[N - i - 1];
          iws[N - i - 1] = -t;
        }
      };

      FFTM.prototype.normalize13b = function normalize13b (ws, N) {
        var carry = 0;
        for (var i = 0; i < N / 2; i++) {
          var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
            Math.round(ws[2 * i] / N) +
            carry;

          ws[i] = w & 0x3ffffff;

          if (w < 0x4000000) {
            carry = 0;
          } else {
            carry = w / 0x4000000 | 0;
          }
        }

        return ws;
      };

      FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
        var carry = 0;
        for (var i = 0; i < len; i++) {
          carry = carry + (ws[i] | 0);

          rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
          rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
        }

        // Pad with zeroes
        for (i = 2 * len; i < N; ++i) {
          rws[i] = 0;
        }

        assert(carry === 0);
        assert((carry & ~0x1fff) === 0);
      };

      FFTM.prototype.stub = function stub (N) {
        var ph = new Array(N);
        for (var i = 0; i < N; i++) {
          ph[i] = 0;
        }

        return ph;
      };

      FFTM.prototype.mulp = function mulp (x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);

        var rbt = this.makeRBT(N);

        var _ = this.stub(N);

        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);

        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);

        var rmws = out.words;
        rmws.length = N;

        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);

        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);

        for (var i = 0; i < N; i++) {
          var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
          iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
          rwst[i] = rx;
        }

        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);

        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out.strip();
      };

      // Multiply `this` by `num`
      BN.prototype.mul = function mul (num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
      };

      // Multiply employing FFT
      BN.prototype.mulf = function mulf (num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
      };

      // In-place Multiplication
      BN.prototype.imul = function imul (num) {
        return this.clone().mulTo(num, this);
      };

      BN.prototype.imuln = function imuln (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);

        // Carry
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = (this.words[i] | 0) * num;
          var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
          carry >>= 26;
          carry += (w / 0x4000000) | 0;
          // NOTE: lo is 27bit maximum
          carry += lo >>> 26;
          this.words[i] = lo & 0x3ffffff;
        }

        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }

        return this;
      };

      BN.prototype.muln = function muln (num) {
        return this.clone().imuln(num);
      };

      // `this` * `this`
      BN.prototype.sqr = function sqr () {
        return this.mul(this);
      };

      // `this` * `this` in-place
      BN.prototype.isqr = function isqr () {
        return this.imul(this.clone());
      };

      // Math.pow(`this`, `num`)
      BN.prototype.pow = function pow (num) {
        var w = toBitArray(num);
        if (w.length === 0) return new BN(1);

        // Skip leading zeroes
        var res = this;
        for (var i = 0; i < w.length; i++, res = res.sqr()) {
          if (w[i] !== 0) break;
        }

        if (++i < w.length) {
          for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
            if (w[i] === 0) continue;

            res = res.mul(q);
          }
        }

        return res;
      };

      // Shift-left in-place
      BN.prototype.iushln = function iushln (bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
        var i;

        if (r !== 0) {
          var carry = 0;

          for (i = 0; i < this.length; i++) {
            var newCarry = this.words[i] & carryMask;
            var c = ((this.words[i] | 0) - newCarry) << r;
            this.words[i] = c | carry;
            carry = newCarry >>> (26 - r);
          }

          if (carry) {
            this.words[i] = carry;
            this.length++;
          }
        }

        if (s !== 0) {
          for (i = this.length - 1; i >= 0; i--) {
            this.words[i + s] = this.words[i];
          }

          for (i = 0; i < s; i++) {
            this.words[i] = 0;
          }

          this.length += s;
        }

        return this.strip();
      };

      BN.prototype.ishln = function ishln (bits) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushln(bits);
      };

      // Shift-right in-place
      // NOTE: `hint` is a lowest bit before trailing zeroes
      // NOTE: if `extended` is present - it will be filled with destroyed bits
      BN.prototype.iushrn = function iushrn (bits, hint, extended) {
        assert(typeof bits === 'number' && bits >= 0);
        var h;
        if (hint) {
          h = (hint - (hint % 26)) / 26;
        } else {
          h = 0;
        }

        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
        var maskedWords = extended;

        h -= s;
        h = Math.max(0, h);

        // Extended mode, copy masked part
        if (maskedWords) {
          for (var i = 0; i < s; i++) {
            maskedWords.words[i] = this.words[i];
          }
          maskedWords.length = s;
        }

        if (s === 0) ; else if (this.length > s) {
          this.length -= s;
          for (i = 0; i < this.length; i++) {
            this.words[i] = this.words[i + s];
          }
        } else {
          this.words[0] = 0;
          this.length = 1;
        }

        var carry = 0;
        for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
          var word = this.words[i] | 0;
          this.words[i] = (carry << (26 - r)) | (word >>> r);
          carry = word & mask;
        }

        // Push carried bits as a mask
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry;
        }

        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }

        return this.strip();
      };

      BN.prototype.ishrn = function ishrn (bits, hint, extended) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
      };

      // Shift-left
      BN.prototype.shln = function shln (bits) {
        return this.clone().ishln(bits);
      };

      BN.prototype.ushln = function ushln (bits) {
        return this.clone().iushln(bits);
      };

      // Shift-right
      BN.prototype.shrn = function shrn (bits) {
        return this.clone().ishrn(bits);
      };

      BN.prototype.ushrn = function ushrn (bits) {
        return this.clone().iushrn(bits);
      };

      // Test if n bit is set
      BN.prototype.testn = function testn (bit) {
        assert(typeof bit === 'number' && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;

        // Fast case: bit is much higher than all existing words
        if (this.length <= s) return false;

        // Check bit and return
        var w = this.words[s];

        return !!(w & q);
      };

      // Return only lowers bits of number (in-place)
      BN.prototype.imaskn = function imaskn (bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;

        assert(this.negative === 0, 'imaskn works only with positive numbers');

        if (this.length <= s) {
          return this;
        }

        if (r !== 0) {
          s++;
        }
        this.length = Math.min(s, this.length);

        if (r !== 0) {
          var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
          this.words[this.length - 1] &= mask;
        }

        return this.strip();
      };

      // Return only lowers bits of number
      BN.prototype.maskn = function maskn (bits) {
        return this.clone().imaskn(bits);
      };

      // Add plain number `num` to `this`
      BN.prototype.iaddn = function iaddn (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.isubn(-num);

        // Possible sign change
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num) {
            this.words[0] = num - (this.words[0] | 0);
            this.negative = 0;
            return this;
          }

          this.negative = 0;
          this.isubn(num);
          this.negative = 1;
          return this;
        }

        // Add without checks
        return this._iaddn(num);
      };

      BN.prototype._iaddn = function _iaddn (num) {
        this.words[0] += num;

        // Carry
        for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
          this.words[i] -= 0x4000000;
          if (i === this.length - 1) {
            this.words[i + 1] = 1;
          } else {
            this.words[i + 1]++;
          }
        }
        this.length = Math.max(this.length, i + 1);

        return this;
      };

      // Subtract plain number `num` from `this`
      BN.prototype.isubn = function isubn (num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.iaddn(-num);

        if (this.negative !== 0) {
          this.negative = 0;
          this.iaddn(num);
          this.negative = 1;
          return this;
        }

        this.words[0] -= num;

        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0];
          this.negative = 1;
        } else {
          // Carry
          for (var i = 0; i < this.length && this.words[i] < 0; i++) {
            this.words[i] += 0x4000000;
            this.words[i + 1] -= 1;
          }
        }

        return this.strip();
      };

      BN.prototype.addn = function addn (num) {
        return this.clone().iaddn(num);
      };

      BN.prototype.subn = function subn (num) {
        return this.clone().isubn(num);
      };

      BN.prototype.iabs = function iabs () {
        this.negative = 0;

        return this;
      };

      BN.prototype.abs = function abs () {
        return this.clone().iabs();
      };

      BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
        var len = num.length + shift;
        var i;

        this._expand(len);

        var w;
        var carry = 0;
        for (i = 0; i < num.length; i++) {
          w = (this.words[i + shift] | 0) + carry;
          var right = (num.words[i] | 0) * mul;
          w -= right & 0x3ffffff;
          carry = (w >> 26) - ((right / 0x4000000) | 0);
          this.words[i + shift] = w & 0x3ffffff;
        }
        for (; i < this.length - shift; i++) {
          w = (this.words[i + shift] | 0) + carry;
          carry = w >> 26;
          this.words[i + shift] = w & 0x3ffffff;
        }

        if (carry === 0) return this.strip();

        // Subtraction overflow
        assert(carry === -1);
        carry = 0;
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry;
          carry = w >> 26;
          this.words[i] = w & 0x3ffffff;
        }
        this.negative = 1;

        return this.strip();
      };

      BN.prototype._wordDiv = function _wordDiv (num, mode) {
        var shift = this.length - num.length;

        var a = this.clone();
        var b = num;

        // Normalize
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
          b = b.ushln(shift);
          a.iushln(shift);
          bhi = b.words[b.length - 1] | 0;
        }

        // Initialize quotient
        var m = a.length - b.length;
        var q;

        if (mode !== 'mod') {
          q = new BN(null);
          q.length = m + 1;
          q.words = new Array(q.length);
          for (var i = 0; i < q.length; i++) {
            q.words[i] = 0;
          }
        }

        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          a = diff;
          if (q) {
            q.words[m] = 1;
          }
        }

        for (var j = m - 1; j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 0x4000000 +
            (a.words[b.length + j - 1] | 0);

          // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
          // (0x7ffffff)
          qj = Math.min((qj / bhi) | 0, 0x3ffffff);

          a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0) {
            qj--;
            a.negative = 0;
            a._ishlnsubmul(b, 1, j);
            if (!a.isZero()) {
              a.negative ^= 1;
            }
          }
          if (q) {
            q.words[j] = qj;
          }
        }
        if (q) {
          q.strip();
        }
        a.strip();

        // Denormalize
        if (mode !== 'div' && shift !== 0) {
          a.iushrn(shift);
        }

        return {
          div: q || null,
          mod: a
        };
      };

      // NOTE: 1) `mode` can be set to `mod` to request mod only,
      //       to `div` to request div only, or be absent to
      //       request both div & mod
      //       2) `positive` is true if unsigned mod is requested
      BN.prototype.divmod = function divmod (num, mode, positive) {
        assert(!num.isZero());

        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0)
          };
        }

        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode);

          if (mode !== 'mod') {
            div = res.div.neg();
          }

          if (mode !== 'div') {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.iadd(num);
            }
          }

          return {
            div: div,
            mod: mod
          };
        }

        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode);

          if (mode !== 'mod') {
            div = res.div.neg();
          }

          return {
            div: div,
            mod: res.mod
          };
        }

        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode);

          if (mode !== 'div') {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.isub(num);
            }
          }

          return {
            div: res.div,
            mod: mod
          };
        }

        // Both numbers are positive at this point

        // Strip both numbers to approximate shift value
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this
          };
        }

        // Very short reduction
        if (num.length === 1) {
          if (mode === 'div') {
            return {
              div: this.divn(num.words[0]),
              mod: null
            };
          }

          if (mode === 'mod') {
            return {
              div: null,
              mod: new BN(this.modn(num.words[0]))
            };
          }

          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modn(num.words[0]))
          };
        }

        return this._wordDiv(num, mode);
      };

      // Find `this` / `num`
      BN.prototype.div = function div (num) {
        return this.divmod(num, 'div', false).div;
      };

      // Find `this` % `num`
      BN.prototype.mod = function mod (num) {
        return this.divmod(num, 'mod', false).mod;
      };

      BN.prototype.umod = function umod (num) {
        return this.divmod(num, 'mod', true).mod;
      };

      // Find Round(`this` / `num`)
      BN.prototype.divRound = function divRound (num) {
        var dm = this.divmod(num);

        // Fast case - exact division
        if (dm.mod.isZero()) return dm.div;

        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

        var half = num.ushrn(1);
        var r2 = num.andln(1);
        var cmp = mod.cmp(half);

        // Round down
        if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

        // Round up
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      };

      BN.prototype.modn = function modn (num) {
        assert(num <= 0x3ffffff);
        var p = (1 << 26) % num;

        var acc = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num;
        }

        return acc;
      };

      // In-place division by number
      BN.prototype.idivn = function idivn (num) {
        assert(num <= 0x3ffffff);

        var carry = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 0x4000000;
          this.words[i] = (w / num) | 0;
          carry = w % num;
        }

        return this.strip();
      };

      BN.prototype.divn = function divn (num) {
        return this.clone().idivn(num);
      };

      BN.prototype.egcd = function egcd (p) {
        assert(p.negative === 0);
        assert(!p.isZero());

        var x = this;
        var y = p.clone();

        if (x.negative !== 0) {
          x = x.umod(p);
        } else {
          x = x.clone();
        }

        // A * x + B * y = x
        var A = new BN(1);
        var B = new BN(0);

        // C * x + D * y = y
        var C = new BN(0);
        var D = new BN(1);

        var g = 0;

        while (x.isEven() && y.isEven()) {
          x.iushrn(1);
          y.iushrn(1);
          ++g;
        }

        var yp = y.clone();
        var xp = x.clone();

        while (!x.isZero()) {
          for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
          if (i > 0) {
            x.iushrn(i);
            while (i-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp);
                B.isub(xp);
              }

              A.iushrn(1);
              B.iushrn(1);
            }
          }

          for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp);
                D.isub(xp);
              }

              C.iushrn(1);
              D.iushrn(1);
            }
          }

          if (x.cmp(y) >= 0) {
            x.isub(y);
            A.isub(C);
            B.isub(D);
          } else {
            y.isub(x);
            C.isub(A);
            D.isub(B);
          }
        }

        return {
          a: C,
          b: D,
          gcd: y.iushln(g)
        };
      };

      // This is reduced incarnation of the binary EEA
      // above, designated to invert members of the
      // _prime_ fields F(p) at a maximal speed
      BN.prototype._invmp = function _invmp (p) {
        assert(p.negative === 0);
        assert(!p.isZero());

        var a = this;
        var b = p.clone();

        if (a.negative !== 0) {
          a = a.umod(p);
        } else {
          a = a.clone();
        }

        var x1 = new BN(1);
        var x2 = new BN(0);

        var delta = b.clone();

        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
          if (i > 0) {
            a.iushrn(i);
            while (i-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta);
              }

              x1.iushrn(1);
            }
          }

          for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta);
              }

              x2.iushrn(1);
            }
          }

          if (a.cmp(b) >= 0) {
            a.isub(b);
            x1.isub(x2);
          } else {
            b.isub(a);
            x2.isub(x1);
          }
        }

        var res;
        if (a.cmpn(1) === 0) {
          res = x1;
        } else {
          res = x2;
        }

        if (res.cmpn(0) < 0) {
          res.iadd(p);
        }

        return res;
      };

      BN.prototype.gcd = function gcd (num) {
        if (this.isZero()) return num.abs();
        if (num.isZero()) return this.abs();

        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;

        // Remove common factor of two
        for (var shift = 0; a.isEven() && b.isEven(); shift++) {
          a.iushrn(1);
          b.iushrn(1);
        }

        do {
          while (a.isEven()) {
            a.iushrn(1);
          }
          while (b.isEven()) {
            b.iushrn(1);
          }

          var r = a.cmp(b);
          if (r < 0) {
            // Swap `a` and `b` to make `a` always bigger than `b`
            var t = a;
            a = b;
            b = t;
          } else if (r === 0 || b.cmpn(1) === 0) {
            break;
          }

          a.isub(b);
        } while (true);

        return b.iushln(shift);
      };

      // Invert number in the field F(num)
      BN.prototype.invm = function invm (num) {
        return this.egcd(num).a.umod(num);
      };

      BN.prototype.isEven = function isEven () {
        return (this.words[0] & 1) === 0;
      };

      BN.prototype.isOdd = function isOdd () {
        return (this.words[0] & 1) === 1;
      };

      // And first word and num
      BN.prototype.andln = function andln (num) {
        return this.words[0] & num;
      };

      // Increment at the bit position in-line
      BN.prototype.bincn = function bincn (bit) {
        assert(typeof bit === 'number');
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;

        // Fast case: bit is much higher than all existing words
        if (this.length <= s) {
          this._expand(s + 1);
          this.words[s] |= q;
          return this;
        }

        // Add bit and propagate, if needed
        var carry = q;
        for (var i = s; carry !== 0 && i < this.length; i++) {
          var w = this.words[i] | 0;
          w += carry;
          carry = w >>> 26;
          w &= 0x3ffffff;
          this.words[i] = w;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        return this;
      };

      BN.prototype.isZero = function isZero () {
        return this.length === 1 && this.words[0] === 0;
      };

      BN.prototype.cmpn = function cmpn (num) {
        var negative = num < 0;

        if (this.negative !== 0 && !negative) return -1;
        if (this.negative === 0 && negative) return 1;

        this.strip();

        var res;
        if (this.length > 1) {
          res = 1;
        } else {
          if (negative) {
            num = -num;
          }

          assert(num <= 0x3ffffff, 'Number is too big');

          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0) return -res | 0;
        return res;
      };

      // Compare two numbers and return:
      // 1 - if `this` > `num`
      // 0 - if `this` == `num`
      // -1 - if `this` < `num`
      BN.prototype.cmp = function cmp (num) {
        if (this.negative !== 0 && num.negative === 0) return -1;
        if (this.negative === 0 && num.negative !== 0) return 1;

        var res = this.ucmp(num);
        if (this.negative !== 0) return -res | 0;
        return res;
      };

      // Unsigned comparison
      BN.prototype.ucmp = function ucmp (num) {
        // At this point both numbers have the same sign
        if (this.length > num.length) return 1;
        if (this.length < num.length) return -1;

        var res = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var a = this.words[i] | 0;
          var b = num.words[i] | 0;

          if (a === b) continue;
          if (a < b) {
            res = -1;
          } else if (a > b) {
            res = 1;
          }
          break;
        }
        return res;
      };

      BN.prototype.gtn = function gtn (num) {
        return this.cmpn(num) === 1;
      };

      BN.prototype.gt = function gt (num) {
        return this.cmp(num) === 1;
      };

      BN.prototype.gten = function gten (num) {
        return this.cmpn(num) >= 0;
      };

      BN.prototype.gte = function gte (num) {
        return this.cmp(num) >= 0;
      };

      BN.prototype.ltn = function ltn (num) {
        return this.cmpn(num) === -1;
      };

      BN.prototype.lt = function lt (num) {
        return this.cmp(num) === -1;
      };

      BN.prototype.lten = function lten (num) {
        return this.cmpn(num) <= 0;
      };

      BN.prototype.lte = function lte (num) {
        return this.cmp(num) <= 0;
      };

      BN.prototype.eqn = function eqn (num) {
        return this.cmpn(num) === 0;
      };

      BN.prototype.eq = function eq (num) {
        return this.cmp(num) === 0;
      };

      //
      // A reduce context, could be using montgomery or something better, depending
      // on the `m` itself.
      //
      BN.red = function red (num) {
        return new Red(num);
      };

      BN.prototype.toRed = function toRed (ctx) {
        assert(!this.red, 'Already a number in reduction context');
        assert(this.negative === 0, 'red works only with positives');
        return ctx.convertTo(this)._forceRed(ctx);
      };

      BN.prototype.fromRed = function fromRed () {
        assert(this.red, 'fromRed works only with numbers in reduction context');
        return this.red.convertFrom(this);
      };

      BN.prototype._forceRed = function _forceRed (ctx) {
        this.red = ctx;
        return this;
      };

      BN.prototype.forceRed = function forceRed (ctx) {
        assert(!this.red, 'Already a number in reduction context');
        return this._forceRed(ctx);
      };

      BN.prototype.redAdd = function redAdd (num) {
        assert(this.red, 'redAdd works only with red numbers');
        return this.red.add(this, num);
      };

      BN.prototype.redIAdd = function redIAdd (num) {
        assert(this.red, 'redIAdd works only with red numbers');
        return this.red.iadd(this, num);
      };

      BN.prototype.redSub = function redSub (num) {
        assert(this.red, 'redSub works only with red numbers');
        return this.red.sub(this, num);
      };

      BN.prototype.redISub = function redISub (num) {
        assert(this.red, 'redISub works only with red numbers');
        return this.red.isub(this, num);
      };

      BN.prototype.redShl = function redShl (num) {
        assert(this.red, 'redShl works only with red numbers');
        return this.red.shl(this, num);
      };

      BN.prototype.redMul = function redMul (num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.mul(this, num);
      };

      BN.prototype.redIMul = function redIMul (num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.imul(this, num);
      };

      BN.prototype.redSqr = function redSqr () {
        assert(this.red, 'redSqr works only with red numbers');
        this.red._verify1(this);
        return this.red.sqr(this);
      };

      BN.prototype.redISqr = function redISqr () {
        assert(this.red, 'redISqr works only with red numbers');
        this.red._verify1(this);
        return this.red.isqr(this);
      };

      // Square root over p
      BN.prototype.redSqrt = function redSqrt () {
        assert(this.red, 'redSqrt works only with red numbers');
        this.red._verify1(this);
        return this.red.sqrt(this);
      };

      BN.prototype.redInvm = function redInvm () {
        assert(this.red, 'redInvm works only with red numbers');
        this.red._verify1(this);
        return this.red.invm(this);
      };

      // Return negative clone of `this` % `red modulo`
      BN.prototype.redNeg = function redNeg () {
        assert(this.red, 'redNeg works only with red numbers');
        this.red._verify1(this);
        return this.red.neg(this);
      };

      BN.prototype.redPow = function redPow (num) {
        assert(this.red && !num.red, 'redPow(normalNum)');
        this.red._verify1(this);
        return this.red.pow(this, num);
      };

      // Prime numbers with efficient reduction
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
      };

      // Pseudo-Mersenne prime
      function MPrime (name, p) {
        // P = 2 ^ N - K
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);

        this.tmp = this._tmp();
      }

      MPrime.prototype._tmp = function _tmp () {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
      };

      MPrime.prototype.ireduce = function ireduce (num) {
        // Assumes that `num` is less than `P^2`
        // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
        var r = num;
        var rlen;

        do {
          this.split(r, this.tmp);
          r = this.imulK(r);
          r = r.iadd(this.tmp);
          rlen = r.bitLength();
        } while (rlen > this.n);

        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
          r.words[0] = 0;
          r.length = 1;
        } else if (cmp > 0) {
          r.isub(this.p);
        } else {
          r.strip();
        }

        return r;
      };

      MPrime.prototype.split = function split (input, out) {
        input.iushrn(this.n, 0, out);
      };

      MPrime.prototype.imulK = function imulK (num) {
        return num.imul(this.k);
      };

      function K256 () {
        MPrime.call(
          this,
          'k256',
          'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
      }
      inherits(K256, MPrime);

      K256.prototype.split = function split (input, output) {
        // 256 = 9 * 26 + 22
        var mask = 0x3fffff;

        var outLen = Math.min(input.length, 9);
        for (var i = 0; i < outLen; i++) {
          output.words[i] = input.words[i];
        }
        output.length = outLen;

        if (input.length <= 9) {
          input.words[0] = 0;
          input.length = 1;
          return;
        }

        // Shift by 9 limbs
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;

        for (i = 10; i < input.length; i++) {
          var next = input.words[i] | 0;
          input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
          prev = next;
        }
        prev >>>= 22;
        input.words[i - 10] = prev;
        if (prev === 0 && input.length > 10) {
          input.length -= 10;
        } else {
          input.length -= 9;
        }
      };

      K256.prototype.imulK = function imulK (num) {
        // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;

        // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
        var lo = 0;
        for (var i = 0; i < num.length; i++) {
          var w = num.words[i] | 0;
          lo += w * 0x3d1;
          num.words[i] = lo & 0x3ffffff;
          lo = w * 0x40 + ((lo / 0x4000000) | 0);
        }

        // Fast length reduction
        if (num.words[num.length - 1] === 0) {
          num.length--;
          if (num.words[num.length - 1] === 0) {
            num.length--;
          }
        }
        return num;
      };

      function P224 () {
        MPrime.call(
          this,
          'p224',
          'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
      }
      inherits(P224, MPrime);

      function P192 () {
        MPrime.call(
          this,
          'p192',
          'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
      }
      inherits(P192, MPrime);

      function P25519 () {
        // 2 ^ 255 - 19
        MPrime.call(
          this,
          '25519',
          '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
      }
      inherits(P25519, MPrime);

      P25519.prototype.imulK = function imulK (num) {
        // K = 0x13
        var carry = 0;
        for (var i = 0; i < num.length; i++) {
          var hi = (num.words[i] | 0) * 0x13 + carry;
          var lo = hi & 0x3ffffff;
          hi >>>= 26;

          num.words[i] = lo;
          carry = hi;
        }
        if (carry !== 0) {
          num.words[num.length++] = carry;
        }
        return num;
      };

      // Exported mostly for testing purposes, use plain name instead
      BN._prime = function prime (name) {
        // Cached version of prime
        if (primes[name]) return primes[name];

        var prime;
        if (name === 'k256') {
          prime = new K256();
        } else if (name === 'p224') {
          prime = new P224();
        } else if (name === 'p192') {
          prime = new P192();
        } else if (name === 'p25519') {
          prime = new P25519();
        } else {
          throw new Error('Unknown prime ' + name);
        }
        primes[name] = prime;

        return prime;
      };

      //
      // Base reduction engine
      //
      function Red (m) {
        if (typeof m === 'string') {
          var prime = BN._prime(m);
          this.m = prime.p;
          this.prime = prime;
        } else {
          assert(m.gtn(1), 'modulus must be greater than 1');
          this.m = m;
          this.prime = null;
        }
      }

      Red.prototype._verify1 = function _verify1 (a) {
        assert(a.negative === 0, 'red works only with positives');
        assert(a.red, 'red works only with red numbers');
      };

      Red.prototype._verify2 = function _verify2 (a, b) {
        assert((a.negative | b.negative) === 0, 'red works only with positives');
        assert(a.red && a.red === b.red,
          'red works only with red numbers');
      };

      Red.prototype.imod = function imod (a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      };

      Red.prototype.neg = function neg (a) {
        if (a.isZero()) {
          return a.clone();
        }

        return this.m.sub(a)._forceRed(this);
      };

      Red.prototype.add = function add (a, b) {
        this._verify2(a, b);

        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res._forceRed(this);
      };

      Red.prototype.iadd = function iadd (a, b) {
        this._verify2(a, b);

        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res;
      };

      Red.prototype.sub = function sub (a, b) {
        this._verify2(a, b);

        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res._forceRed(this);
      };

      Red.prototype.isub = function isub (a, b) {
        this._verify2(a, b);

        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res;
      };

      Red.prototype.shl = function shl (a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
      };

      Red.prototype.imul = function imul (a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
      };

      Red.prototype.mul = function mul (a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
      };

      Red.prototype.isqr = function isqr (a) {
        return this.imul(a, a.clone());
      };

      Red.prototype.sqr = function sqr (a) {
        return this.mul(a, a);
      };

      Red.prototype.sqrt = function sqrt (a) {
        if (a.isZero()) return a.clone();

        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);

        // Fast case
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }

        // Tonelli-Shanks algorithm (Totally unoptimized and slow)
        //
        // Find Q and S, that Q * 2 ^ S = (P - 1)
        var q = this.m.subn(1);
        var s = 0;
        while (!q.isZero() && q.andln(1) === 0) {
          s++;
          q.iushrn(1);
        }
        assert(!q.isZero());

        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();

        // Find quadratic non-residue
        // NOTE: Max is such because of generalized Riemann hypothesis.
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);

        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne);
        }

        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i = 0; tmp.cmp(one) !== 0; i++) {
            tmp = tmp.redSqr();
          }
          assert(i < m);
          var b = this.pow(c, new BN(1).iushln(m - i - 1));

          r = r.redMul(b);
          c = b.redSqr();
          t = t.redMul(c);
          m = i;
        }

        return r;
      };

      Red.prototype.invm = function invm (a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
          inv.negative = 0;
          return this.imod(inv).redNeg();
        } else {
          return this.imod(inv);
        }
      };

      Red.prototype.pow = function pow (a, num) {
        if (num.isZero()) return new BN(1).toRed(this);
        if (num.cmpn(1) === 0) return a.clone();

        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for (var i = 2; i < wnd.length; i++) {
          wnd[i] = this.mul(wnd[i - 1], a);
        }

        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
          start = 26;
        }

        for (i = num.length - 1; i >= 0; i--) {
          var word = num.words[i];
          for (var j = start - 1; j >= 0; j--) {
            var bit = (word >> j) & 1;
            if (res !== wnd[0]) {
              res = this.sqr(res);
            }

            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }

            current <<= 1;
            current |= bit;
            currentLen++;
            if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

            res = this.mul(res, wnd[current]);
            currentLen = 0;
            current = 0;
          }
          start = 26;
        }

        return res;
      };

      Red.prototype.convertTo = function convertTo (num) {
        var r = num.umod(this.m);

        return r === num ? r.clone() : r;
      };

      Red.prototype.convertFrom = function convertFrom (num) {
        var res = num.clone();
        res.red = null;
        return res;
      };

      //
      // Montgomery method engine
      //

      BN.mont = function mont (num) {
        return new Mont(num);
      };

      function Mont (m) {
        Red.call(this, m);

        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
          this.shift += 26 - (this.shift % 26);
        }

        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);

        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
      }
      inherits(Mont, Red);

      Mont.prototype.convertTo = function convertTo (num) {
        return this.imod(num.ushln(this.shift));
      };

      Mont.prototype.convertFrom = function convertFrom (num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
      };

      Mont.prototype.imul = function imul (a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0;
          a.length = 1;
          return a;
        }

        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;

        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }

        return res._forceRed(this);
      };

      Mont.prototype.mul = function mul (a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }

        return res._forceRed(this);
      };

      Mont.prototype.invm = function invm (a) {
        // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })( module, commonjsGlobal);
    });

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function stripHexPrefix(str) {
        return str.replace('0x', '');
    }
    function numberToBN(arg) {
        if (typeof arg === 'string' || typeof arg === 'number') {
            let multiplier = new bn(1); // eslint-disable-line
            const formattedString = String(arg)
                .toLowerCase()
                .trim();
            const isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
            let stringArg = stripHexPrefix(formattedString); // eslint-disable-line
            if (stringArg.substr(0, 1) === '-') {
                stringArg = stripHexPrefix(stringArg.slice(1));
                multiplier = new bn(-1, 10);
            }
            stringArg = stringArg === '' ? '0' : stringArg;
            if ((!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/)) ||
                stringArg.match(/^[a-fA-F]+$/) ||
                (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))) {
                return new bn(stringArg, 16).mul(multiplier);
            }
            if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
                return new bn(stringArg, 10).mul(multiplier);
            }
        }
        else if (typeof arg === 'object' && arg.toString && (!arg.pop && !arg.push)) {
            if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
                return new bn(arg.toString(10), 10);
            }
        }
        throw new Error('[number-to-bn] while converting number ' +
            JSON.stringify(arg) +
            ' to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.');
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Takes an input and transforms it into an BN
     *
     * @method toBN
     * @param {Number|String|BN} num, string, HEX string or BN
     * @return {BN} BN
     */
    function toBN(num) {
        try {
            return numberToBN(num);
        }
        catch (e) {
            throw new Error(e + ' Given value: "' + num + '"');
        }
    }

    var safeBuffer = createCommonjsModule(function (module, exports) {
    /* eslint-disable node/no-deprecated-api */

    var Buffer = bufferEs6.Buffer;

    // alternative to using Object.keys for old browsers
    function copyProps (src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
      module.exports = bufferEs6;
    } else {
      // Copy properties from require('buffer')
      copyProps(bufferEs6, exports);
      exports.Buffer = SafeBuffer;
    }

    function SafeBuffer (arg, encodingOrOffset, length) {
      return Buffer(arg, encodingOrOffset, length)
    }

    // Copy static methods from Buffer
    copyProps(Buffer, SafeBuffer);

    SafeBuffer.from = function (arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number')
      }
      return Buffer(arg, encodingOrOffset, length)
    };

    SafeBuffer.alloc = function (size, fill, encoding) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      var buf = Buffer(size);
      if (fill !== undefined) {
        if (typeof encoding === 'string') {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf
    };

    SafeBuffer.allocUnsafe = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return Buffer(size)
    };

    SafeBuffer.allocUnsafeSlow = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return bufferEs6.SlowBuffer(size)
    };
    });
    var safeBuffer_1 = safeBuffer.Buffer;

    var browser = createCommonjsModule(function (module) {

    // limit of Crypto.getRandomValues()
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    var MAX_BYTES = 65536;

    // Node supports requesting up to this number of bytes
    // https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
    var MAX_UINT32 = 4294967295;

    function oldBrowser () {
      throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
    }

    var Buffer = safeBuffer.Buffer;
    var crypto = commonjsGlobal.crypto || commonjsGlobal.msCrypto;

    if (crypto && crypto.getRandomValues) {
      module.exports = randomBytes;
    } else {
      module.exports = oldBrowser;
    }

    function randomBytes (size, cb) {
      // phantomjs needs to throw
      if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

      var bytes = Buffer.allocUnsafe(size);

      if (size > 0) {  // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
          // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
          for (var generated = 0; generated < size; generated += MAX_BYTES) {
            // buffer.slice automatically checks if the end is past the end of
            // the buffer so we don't have to here
            crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
          }
        } else {
          crypto.getRandomValues(bytes);
        }
      }

      if (typeof cb === 'function') {
        return nextTick(function () {
          cb(null, bytes);
        })
      }

      return bytes
    }
    });

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Converts value to it's number representation
     *
     * @method hexToNumber
     * @param {String|Number|BN} value
     * @return {String}
     */
    function hexToNumber(value) {
        return toBN(value).toNumber();
    }
    /**
     * Converts value to it's decimal representation in string
     *
     * @method hexToNumberString
     * @param {String|Number|BN} value
     * @return {String}
     */
    function hexToNumberString(value) {
        return toBN(value).toString(10);
    }
    /**
     * Converts value to it's hex representation
     *
     * @method numberToHex
     * @param {String|Number|BN} value
     * @return {String}
     */
    function numberToHex(value) {
        const num = toBN(value);
        const result = num.toString(16);
        return num.lt(new bn(0)) ? '-0x' + result.substr(1) : '0x' + result;
    }

    var utf8 = createCommonjsModule(function (module, exports) {
    (function(root) {

    	var stringFromCharCode = String.fromCharCode;

    	// Taken from https://mths.be/punycode
    	function ucs2decode(string) {
    		var output = [];
    		var counter = 0;
    		var length = string.length;
    		var value;
    		var extra;
    		while (counter < length) {
    			value = string.charCodeAt(counter++);
    			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
    				// high surrogate, and there is a next character
    				extra = string.charCodeAt(counter++);
    				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
    					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
    				} else {
    					// unmatched surrogate; only append this code unit, in case the next
    					// code unit is the high surrogate of a surrogate pair
    					output.push(value);
    					counter--;
    				}
    			} else {
    				output.push(value);
    			}
    		}
    		return output;
    	}

    	// Taken from https://mths.be/punycode
    	function ucs2encode(array) {
    		var length = array.length;
    		var index = -1;
    		var value;
    		var output = '';
    		while (++index < length) {
    			value = array[index];
    			if (value > 0xFFFF) {
    				value -= 0x10000;
    				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
    				value = 0xDC00 | value & 0x3FF;
    			}
    			output += stringFromCharCode(value);
    		}
    		return output;
    	}

    	function checkScalarValue(codePoint) {
    		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    			throw Error(
    				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
    				' is not a scalar value'
    			);
    		}
    	}
    	/*--------------------------------------------------------------------------*/

    	function createByte(codePoint, shift) {
    		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
    	}

    	function encodeCodePoint(codePoint) {
    		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
    			return stringFromCharCode(codePoint);
    		}
    		var symbol = '';
    		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
    			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
    		}
    		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
    			checkScalarValue(codePoint);
    			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
    			symbol += createByte(codePoint, 6);
    		}
    		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
    			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
    			symbol += createByte(codePoint, 12);
    			symbol += createByte(codePoint, 6);
    		}
    		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
    		return symbol;
    	}

    	function utf8encode(string) {
    		var codePoints = ucs2decode(string);
    		var length = codePoints.length;
    		var index = -1;
    		var codePoint;
    		var byteString = '';
    		while (++index < length) {
    			codePoint = codePoints[index];
    			byteString += encodeCodePoint(codePoint);
    		}
    		return byteString;
    	}

    	/*--------------------------------------------------------------------------*/

    	function readContinuationByte() {
    		if (byteIndex >= byteCount) {
    			throw Error('Invalid byte index');
    		}

    		var continuationByte = byteArray[byteIndex] & 0xFF;
    		byteIndex++;

    		if ((continuationByte & 0xC0) == 0x80) {
    			return continuationByte & 0x3F;
    		}

    		// If we end up here, it’s not a continuation byte
    		throw Error('Invalid continuation byte');
    	}

    	function decodeSymbol() {
    		var byte1;
    		var byte2;
    		var byte3;
    		var byte4;
    		var codePoint;

    		if (byteIndex > byteCount) {
    			throw Error('Invalid byte index');
    		}

    		if (byteIndex == byteCount) {
    			return false;
    		}

    		// Read first byte
    		byte1 = byteArray[byteIndex] & 0xFF;
    		byteIndex++;

    		// 1-byte sequence (no continuation bytes)
    		if ((byte1 & 0x80) == 0) {
    			return byte1;
    		}

    		// 2-byte sequence
    		if ((byte1 & 0xE0) == 0xC0) {
    			byte2 = readContinuationByte();
    			codePoint = ((byte1 & 0x1F) << 6) | byte2;
    			if (codePoint >= 0x80) {
    				return codePoint;
    			} else {
    				throw Error('Invalid continuation byte');
    			}
    		}

    		// 3-byte sequence (may include unpaired surrogates)
    		if ((byte1 & 0xF0) == 0xE0) {
    			byte2 = readContinuationByte();
    			byte3 = readContinuationByte();
    			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
    			if (codePoint >= 0x0800) {
    				checkScalarValue(codePoint);
    				return codePoint;
    			} else {
    				throw Error('Invalid continuation byte');
    			}
    		}

    		// 4-byte sequence
    		if ((byte1 & 0xF8) == 0xF0) {
    			byte2 = readContinuationByte();
    			byte3 = readContinuationByte();
    			byte4 = readContinuationByte();
    			codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
    				(byte3 << 0x06) | byte4;
    			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
    				return codePoint;
    			}
    		}

    		throw Error('Invalid UTF-8 detected');
    	}

    	var byteArray;
    	var byteCount;
    	var byteIndex;
    	function utf8decode(byteString) {
    		byteArray = ucs2decode(byteString);
    		byteCount = byteArray.length;
    		byteIndex = 0;
    		var codePoints = [];
    		var tmp;
    		while ((tmp = decodeSymbol()) !== false) {
    			codePoints.push(tmp);
    		}
    		return ucs2encode(codePoints);
    	}

    	/*--------------------------------------------------------------------------*/

    	root.version = '3.0.0';
    	root.encode = utf8encode;
    	root.decode = utf8decode;

    }( exports));
    });

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Should be called to get hex representation (prefixed by 0x) of utf8 string
     *
     * @method utf8ToHex
     * @param {String} str
     * @returns {String} hex representation of input string
     */
    let utf8ToHex = (str) => {
        str = utf8.encode(str);
        let hex = '';
        // remove \u0000 padding from either side
        str = str.replace(/^(?:\u0000)*/, '');
        str = str
            .split('')
            .reverse()
            .join('');
        str = str.replace(/^(?:\u0000)*/, '');
        str = str
            .split('')
            .reverse()
            .join('');
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            // if (code !== 0) {
            const n = code.toString(16);
            hex += n.length < 2 ? '0' + n : n;
            // }
        }
        return '0x' + hex;
    };

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Check if string is HEX, requires a 0x in front
     */
    function isHexStrict(hex) {
        return /^(-)?0x[0-9a-f]*$/i.test(hex);
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Should be called to pad string to expected length
     *
     * @method leftPad
     * @param {String} str to be padded
     * @param {Number} chars that result string should have
     * @param {String} sign, by default 0
     * @returns {String} right aligned string
     */
    let leftPad = (str, chars, sign = '0') => {
        const hasPrefix = /^0x/i.test(str) || typeof str === 'number';
        str = str.toString().replace(/^0x/i, '');
        const padding = chars - str.length + 1 >= 0 ? chars - str.length + 1 : 0;
        return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : '0') + str;
    };

    function hexToBuffer(value) {
        if (!isHexStrict(value)) {
            throw new Error('Not a 0x formatted hex string');
        }
        if (value.length % 2 !== 0) {
            value = leftPad(value, value.length - 1);
        }
        return Buffer.from(value.slice(2), 'hex');
    }
    function bufferToHex(value) {
        return '0x' + value.toString('hex');
    }

    class Address {
        constructor(buffer) {
            this.buffer = buffer;
            if (buffer.length === 32) {
                if (!buffer.slice(0, 12).equals(Buffer.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0))) {
                    throw new Error('Invalid address buffer.');
                }
                else {
                    this.buffer = buffer.slice(12);
                }
            }
            else if (buffer.length !== 20) {
                throw new Error('Invalid address buffer.');
            }
        }
        static fromString(address) {
            if (!Address.isAddress(address)) {
                throw new Error(`Invalid address string: ${address}`);
            }
            return new Address(Buffer.from(address.replace(/^0x/i, ''), 'hex'));
        }
        static isAddress(address) {
            if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
                // Does not have the basic requirements of an address.
                return false;
            }
            else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
                // It's ALL lowercase or ALL upppercase.
                return true;
            }
            else {
                return Address.checkAddressChecksum(address);
            }
        }
        static checkAddressChecksum(address) {
            address = address.replace(/^0x/i, '');
            const addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '');
            for (let i = 0; i < 40; i++) {
                // The nth letter should be uppercase if the nth digit of casemap is 1.
                if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
                    (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                    return false;
                }
            }
            return true;
        }
        static toChecksumAddress(address) {
            if (!Address.isAddress(address)) {
                throw new Error('Invalid address string.');
            }
            address = address.toLowerCase().replace(/^0x/i, '');
            const addressHash = sha3(address).replace(/^0x/i, '');
            let checksumAddress = '0x';
            for (let i = 0; i < address.length; i++) {
                // If ith character is 9 to f then make it uppercase.
                if (parseInt(addressHash[i], 16) > 7) {
                    checksumAddress += address[i].toUpperCase();
                }
                else {
                    checksumAddress += address[i];
                }
            }
            return checksumAddress;
        }
        equals(rhs) {
            return this.buffer.equals(rhs.buffer);
        }
        toJSON() {
            return this.toString();
        }
        toString() {
            return Address.toChecksumAddress(bufferToHex(this.buffer));
        }
        toBuffer() {
            return this.buffer;
        }
        toBuffer32() {
            const buffer = Buffer.alloc(32);
            this.buffer.copy(buffer, 12);
            return buffer;
        }
    }
    Address.ZERO = new Address(Buffer.alloc(20));

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function toRawCallRequest(tx) {
        const { from, to, gas, gasPrice, value, data } = tx;
        return {
            from: from ? from.toString().toLowerCase() : undefined,
            to: to.toString().toLowerCase(),
            data: data ? bufferToHex(data) : undefined,
            value: value ? numberToHex(value) : undefined,
            gas: gas ? numberToHex(gas) : undefined,
            gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
        };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function toRawEstimateRequest(tx) {
        const { from, to, gas, gasPrice, value, data } = tx;
        return {
            from: from ? from.toString().toLowerCase() : undefined,
            to: to ? to.toString().toLowerCase() : undefined,
            data: data ? bufferToHex(data) : undefined,
            value: value ? numberToHex(value) : undefined,
            gas: gas ? numberToHex(gas) : undefined,
            gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
        };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function inputBlockNumberFormatter(block) {
        if (block === undefined) {
            return;
        }
        else if (block === 'genesis' || block === 'earliest') {
            return '0x0';
        }
        else if (block === 'latest' || block === 'pending') {
            return block;
        }
        else if (isString(block) && isHexStrict(block)) {
            return block.toLowerCase();
        }
        return numberToHex(block);
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function toRawLogRequest(logRequest = {}) {
        const rawLogRequest = {};
        if (logRequest.fromBlock !== undefined) {
            rawLogRequest.fromBlock = inputBlockNumberFormatter(logRequest.fromBlock);
        }
        if (logRequest.toBlock !== undefined) {
            rawLogRequest.toBlock = inputBlockNumberFormatter(logRequest.toBlock);
        }
        // Convert topics to hex.
        rawLogRequest.topics = (logRequest.topics || []).map(topic => {
            const toTopic = value => {
                if (value === null || typeof value === 'undefined') {
                    return null;
                }
                value = String(value);
                return value.indexOf('0x') === 0 ? value : utf8ToHex(value);
            };
            return isArray$1(topic) ? topic.map(toTopic) : toTopic(topic);
        });
        if (logRequest.address) {
            rawLogRequest.address = isArray$1(logRequest.address)
                ? logRequest.address.map(a => a.toString().toLowerCase())
                : logRequest.address.toString().toLowerCase();
        }
        return rawLogRequest;
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Hex encodes the data passed to eth_sign and personal_sign
     *
     * @method inputSignFormatter
     * @param {String} data
     * @returns {String}
     */
    function inputSignFormatter(data) {
        return isHexStrict(data) ? data : utf8ToHex(data);
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function toRawTransactionRequest(tx) {
        const { from, to, gas, gasPrice, value, nonce, data } = tx;
        return {
            from: from.toString().toLowerCase(),
            to: to ? to.toString().toLowerCase() : undefined,
            gas: gas ? numberToHex(gas) : undefined,
            gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
            value: value ? numberToHex(value) : undefined,
            data: data ? bufferToHex(data) : undefined,
            nonce: nonce ? numberToHex(nonce) : undefined,
        };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Should the format output to a big number
     *
     * @method outputBigNumberFormatter
     * @param {String|Number|BigNumber} number
     * @returns {BigNumber} object
     */
    function outputBigNumberFormatter(num) {
        return toBN(num).toString(10);
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function fromRawTransactionResponse(tx) {
        return {
            ...tx,
            blockNumber: tx.blockNumber ? hexToNumber(tx.blockNumber) : null,
            transactionIndex: tx.transactionIndex ? hexToNumber(tx.transactionIndex) : null,
            nonce: hexToNumber(tx.nonce),
            gas: hexToNumber(tx.gas),
            gasPrice: outputBigNumberFormatter(tx.gasPrice),
            value: outputBigNumberFormatter(tx.value),
            to: tx.to ? Address.fromString(tx.to) : null,
            from: Address.fromString(tx.from),
        };
    }

    function fromRawBlockHeaderResponse(block) {
        return {
            hash: block.hash ? hexToBuffer(block.hash) : null,
            parentHash: hexToBuffer(block.parentHash),
            sha3Uncles: hexToBuffer(block.sha3Uncles),
            miner: Address.fromString(block.miner),
            stateRoot: hexToBuffer(block.stateRoot),
            transactionsRoot: hexToBuffer(block.transactionsRoot),
            receiptsRoot: hexToBuffer(block.receiptsRoot),
            logsBloom: block.logsBloom ? hexToBuffer(block.logsBloom) : null,
            difficulty: hexToNumberString(block.difficulty),
            number: block.number ? hexToNumber(block.number) : null,
            gasLimit: hexToNumber(block.gasLimit),
            gasUsed: hexToNumber(block.gasUsed),
            timestamp: hexToNumber(block.timestamp),
            extraData: hexToBuffer(block.extraData),
            nonce: block.nonce ? hexToBuffer(block.nonce) : null,
        };
    }
    function fromRawBlockResponse(block) {
        return {
            ...fromRawBlockHeaderResponse(block),
            totalDifficulty: hexToNumberString(block.totalDifficulty),
            size: hexToNumber(block.size),
            transactions: block.transactions.map(tx => (isString(tx) ? hexToBuffer(tx) : fromRawTransactionResponse(tx))),
            uncles: block.uncles,
        };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function fromRawLogResponse(log) {
        let id = log.id || null;
        // Generate a custom log id.
        if (typeof log.blockHash === 'string' &&
            typeof log.transactionHash === 'string' &&
            typeof log.logIndex === 'string') {
            const shaId = sha3(log.blockHash.replace('0x', '') + log.transactionHash.replace('0x', '') + log.logIndex.replace('0x', ''));
            id = 'log_' + shaId.replace('0x', '').substr(0, 8);
        }
        const blockNumber = log.blockNumber !== null ? hexToNumber(log.blockNumber) : null;
        const transactionIndex = log.transactionIndex !== null ? hexToNumber(log.transactionIndex) : null;
        const logIndex = log.logIndex !== null ? hexToNumber(log.logIndex) : null;
        const address = isString(log.address) ? Address.fromString(log.address) : log.address;
        return { ...log, id, blockNumber, transactionIndex, logIndex, address };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function outputSyncingFormatter(result) {
        if (isBoolean(result)) {
            return result;
        }
        result.startingBlock = hexToNumber(result.startingBlock);
        result.currentBlock = hexToNumber(result.currentBlock);
        result.highestBlock = hexToNumber(result.highestBlock);
        if (result.knownStates) {
            result.knownStates = hexToNumber(result.knownStates);
            result.pulledStates = hexToNumber(result.pulledStates);
        }
        return result;
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function fromRawTransactionReceipt(receipt) {
        if (!receipt || !receipt.blockHash) {
            return null;
        }
        return {
            ...receipt,
            to: receipt.to ? Address.fromString(receipt.to) : undefined,
            from: Address.fromString(receipt.from),
            blockNumber: hexToNumber(receipt.blockNumber),
            transactionIndex: hexToNumber(receipt.transactionIndex),
            cumulativeGasUsed: hexToNumber(receipt.cumulativeGasUsed),
            gasUsed: hexToNumber(receipt.gasUsed),
            logs: isArray$1(receipt.logs) ? receipt.logs.map(fromRawLogResponse) : undefined,
            contractAddress: receipt.contractAddress ? Address.fromString(receipt.contractAddress) : undefined,
            status: isString(receipt.status) ? Boolean(hexToNumber(receipt.status)) : undefined,
        };
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    const identity = () => (result) => result;
    class EthRequestPayloads {
        constructor(defaultFromAddress, defaultBlock = 'latest') {
            this.defaultFromAddress = defaultFromAddress;
            this.defaultBlock = defaultBlock;
        }
        getDefaultBlock() {
            return this.defaultBlock;
        }
        setDefaultBlock(block) {
            this.defaultBlock = block;
        }
        getId() {
            return {
                method: 'net_version',
                format: hexToNumber,
            };
        }
        getNodeInfo() {
            return {
                method: 'web3_clientVersion',
                format: identity(),
            };
        }
        getProtocolVersion() {
            return {
                method: 'eth_protocolVersion',
                format: identity(),
            };
        }
        getCoinbase() {
            return {
                method: 'eth_coinbase',
                format: Address.fromString,
            };
        }
        isMining() {
            return {
                method: 'eth_mining',
                format: identity(),
            };
        }
        getHashrate() {
            return {
                method: 'eth_hashrate',
                format: hexToNumber,
            };
        }
        isSyncing() {
            return {
                method: 'eth_syncing',
                format: outputSyncingFormatter,
            };
        }
        getGasPrice() {
            return {
                method: 'eth_gasPrice',
                format: outputBigNumberFormatter,
            };
        }
        getAccounts() {
            return {
                method: 'eth_accounts',
                format: (result) => result.map(Address.fromString),
            };
        }
        getBlockNumber() {
            return {
                method: 'eth_blockNumber',
                format: hexToNumber,
            };
        }
        getBalance(address, block) {
            return {
                method: 'eth_getBalance',
                params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
                format: outputBigNumberFormatter,
            };
        }
        getStorageAt(address, position, block) {
            return {
                method: 'eth_getStorageAt',
                params: [
                    address.toString().toLowerCase(),
                    numberToHex(position),
                    inputBlockNumberFormatter(this.resolveBlock(block)),
                ],
                format: identity(),
            };
        }
        getCode(address, block) {
            return {
                method: 'eth_getCode',
                params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
                format: identity(),
            };
        }
        getBlock(block, returnTransactionObjects = false) {
            return {
                method: isString(block) && isHexStrict(block) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber',
                params: [inputBlockNumberFormatter(this.resolveBlock(block)), returnTransactionObjects],
                format: fromRawBlockResponse,
            };
        }
        getUncle(block, uncleIndex, returnTransactionObjects = false) {
            return {
                method: isString(block) && isHexStrict(block) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex',
                params: [inputBlockNumberFormatter(this.resolveBlock(block)), numberToHex(uncleIndex), returnTransactionObjects],
                format: fromRawBlockResponse,
            };
        }
        getBlockTransactionCount(block) {
            return {
                method: isString(block) && isHexStrict(block)
                    ? 'eth_getBlockTransactionCountByHash'
                    : 'eth_getBlockTransactionCountByNumber',
                params: [inputBlockNumberFormatter(this.resolveBlock(block))],
                format: hexToNumber,
            };
        }
        getBlockUncleCount(block) {
            return {
                method: isString(block) && isHexStrict(block) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber',
                params: [inputBlockNumberFormatter(this.resolveBlock(block))],
                format: hexToNumber,
            };
        }
        getTransaction(hash) {
            return {
                method: 'eth_getTransactionByHash',
                params: [hash],
                format: fromRawTransactionResponse,
            };
        }
        getTransactionFromBlock(block, index) {
            return {
                method: isString(block) && isHexStrict(block)
                    ? 'eth_getTransactionByBlockHashAndIndex'
                    : 'eth_getTransactionByBlockNumberAndIndex',
                params: [inputBlockNumberFormatter(block), numberToHex(index)],
                format: fromRawTransactionResponse,
            };
        }
        getTransactionReceipt(hash) {
            return {
                method: 'eth_getTransactionReceipt',
                params: [hash],
                format: fromRawTransactionReceipt,
            };
        }
        getTransactionCount(address, block) {
            return {
                method: 'eth_getTransactionCount',
                params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
                format: hexToNumber,
            };
        }
        signTransaction(tx) {
            tx.from = tx.from || this.defaultFromAddress;
            return {
                method: 'eth_signTransaction',
                params: [toRawTransactionRequest(tx)],
                format: identity(),
            };
        }
        sendSignedTransaction(data) {
            return {
                method: 'eth_sendRawTransaction',
                params: [data],
                format: identity(),
            };
        }
        sendTransaction(tx) {
            const from = tx.from || this.defaultFromAddress;
            if (!from) {
                throw new Error('No from addres specified.');
            }
            return {
                method: 'eth_sendTransaction',
                params: [toRawTransactionRequest({ ...tx, from })],
                format: identity(),
            };
        }
        sign(address, dataToSign) {
            return {
                method: 'eth_sign',
                params: [address.toString().toLowerCase(), inputSignFormatter(dataToSign)],
                format: identity(),
            };
        }
        signTypedData(address, dataToSign) {
            return {
                method: 'eth_signTypedData',
                params: [dataToSign, address.toString().toLowerCase()],
                format: identity(),
            };
        }
        call(tx, block) {
            tx.from = tx.from || this.defaultFromAddress;
            return {
                method: 'eth_call',
                params: [toRawCallRequest(tx), inputBlockNumberFormatter(this.resolveBlock(block))],
                format: identity(),
            };
        }
        estimateGas(tx) {
            tx.from = tx.from || this.defaultFromAddress;
            return {
                method: 'eth_estimateGas',
                params: [toRawEstimateRequest(tx)],
                format: hexToNumber,
            };
        }
        submitWork(nonce, powHash, digest) {
            return {
                method: 'eth_submitWork',
                params: [nonce, powHash, digest],
                format: identity(),
            };
        }
        getWork() {
            return {
                method: 'eth_getWork',
                format: identity(),
            };
        }
        getPastLogs(options) {
            return {
                method: 'eth_getLogs',
                params: [toRawLogRequest(options)],
                format: (result) => result.map(fromRawLogResponse),
            };
        }
        resolveBlock(block) {
            return block === undefined ? this.defaultBlock : block;
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class SentTransaction {
        constructor(eth, txHashPromise) {
            this.eth = eth;
            this.txHashPromise = txHashPromise;
            this.blocksSinceSent = 0;
        }
        async getTxHash() {
            return this.txHashPromise;
        }
        async getReceipt(numConfirmations = 1, confirmationCallback) {
            if (this.receipt) {
                return this.receipt;
            }
            return new Promise(async (resolve, reject) => {
                try {
                    const txHash = await this.getTxHash();
                    this.receipt = await this.eth.getTransactionReceipt(txHash);
                    if (this.receipt) {
                        this.receipt = await this.handleReceipt(this.receipt);
                        if (numConfirmations === 1) {
                            if (confirmationCallback) {
                                confirmationCallback(1, this.receipt);
                            }
                            resolve(this.receipt);
                            return;
                        }
                    }
                    this.eth
                        .subscribe('newBlockHeaders')
                        .on('data', async (blockHeader, sub) => {
                        try {
                            this.blocksSinceSent++;
                            if (!this.receipt) {
                                this.receipt = await this.eth.getTransactionReceipt(txHash);
                                if (this.receipt) {
                                    this.receipt = await this.handleReceipt(this.receipt);
                                }
                            }
                            if (!this.receipt) {
                                if (this.blocksSinceSent > 50) {
                                    sub.unsubscribe();
                                    reject(new Error('No receipt after 50 blocks.'));
                                }
                                return;
                            }
                            const confirmations = 1 + blockHeader.number - this.receipt.blockNumber;
                            if (confirmationCallback) {
                                confirmationCallback(confirmations, this.receipt);
                            }
                            if (confirmations >= numConfirmations) {
                                sub.unsubscribe();
                                resolve(this.receipt);
                            }
                        }
                        catch (err) {
                            sub.unsubscribe();
                            reject(err);
                        }
                    })
                        .on('error', reject);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        async handleReceipt(receipt) {
            if (receipt.status === false) {
                throw new Error('Transaction has been reverted by the EVM.');
            }
            return receipt;
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class Subscription extends EventEmitter {
        constructor(type, subscription, params, provider, callback, subscribeImmediately = true) {
            super();
            this.type = type;
            this.subscription = subscription;
            this.params = params;
            this.provider = provider;
            this.callback = callback;
            if (subscribeImmediately) {
                this.subscribe();
            }
        }
        async subscribe() {
            if (this.id) {
                this.unsubscribe();
            }
            try {
                this.listener = params => this.notificationHandler(params);
                this.provider.on('notification', this.listener);
                this.id = await this.provider.send(`${this.type}_subscribe`, [this.subscription, ...this.params]);
                if (!this.id) {
                    throw new Error(`Failed to subscribe to ${this.subscription}.`);
                }
            }
            catch (err) {
                this.emit('error', err, this);
            }
            return this;
        }
        notificationHandler(params) {
            const { subscription, result } = params;
            if (subscription !== this.id) {
                return;
            }
            if (result instanceof Error) {
                this.unsubscribe();
                this.emit('error', result, this);
                return;
            }
            const resultArr = isArray$1(result) ? result : [result];
            resultArr.forEach(resultItem => {
                this.callback(resultItem, this);
            });
        }
        unsubscribe() {
            if (this.listener) {
                this.provider.removeListener('notification', this.listener);
            }
            if (this.id) {
                this.provider.send(`${this.type}_unsubscribe`, [this.id]);
            }
            this.id = undefined;
            this.listener = undefined;
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function subscribeForLogs(eth, logRequest = {}) {
        const { fromBlock, ...subscriptionLogRequest } = logRequest;
        const params = [toRawLogRequest(subscriptionLogRequest)];
        const subscription = new Subscription('eth', 'logs', params, eth.provider, (result, sub) => {
            const output = fromRawLogResponse(result);
            sub.emit(output.removed ? 'changed' : 'data', output, sub);
        }, false);
        if (fromBlock !== undefined) {
            eth
                .getPastLogs(logRequest)
                .then(logs => {
                logs.forEach(log => subscription.emit('data', log, subscription));
                subscription.subscribe();
            })
                .catch(err => {
                subscription.emit('error', err, subscription);
            });
        }
        else {
            subscription.subscribe();
        }
        return subscription;
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function subscribeForNewHeads(provider) {
        return new Subscription('eth', 'newHeads', [], provider, (result, sub) => {
            const output = fromRawBlockHeaderResponse(result);
            sub.emit('data', output, sub);
        });
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function subscribeForNewPendingTransactions(provider) {
        return new Subscription('eth', 'newPendingTransactions', [], provider, (result, sub) => {
            sub.emit('data', result, sub);
        });
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    function subscribeForSyncing(provider) {
        return new Subscription('eth', 'newHeads', [], provider, (result, sub) => {
            const output = outputSyncingFormatter(result);
            sub.emit(isBoolean(output) ? 'changed' : 'data', output, sub);
        });
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class Eth {
        constructor(provider) {
            this.provider = provider;
            this.request = new EthRequestPayloads(undefined, 'latest');
        }
        static fromCurrentProvider() {
            if (typeof web3 === 'undefined') {
                return;
            }
            const provider = web3.currentProvider || web3.ethereumProvider;
            if (!provider) {
                return;
            }
            return new Eth(new LegacyProviderAdapter(provider));
        }
        get defaultFromAddress() {
            return this.request.defaultFromAddress;
        }
        set defaultFromAddress(address) {
            this.request.defaultFromAddress = address;
        }
        async send({ method, params, format }) {
            return format(await this.provider.send(method, params));
        }
        async getId() {
            return await this.send(this.request.getId());
        }
        async getNodeInfo() {
            return await this.send(this.request.getNodeInfo());
        }
        async getProtocolVersion() {
            return await this.send(this.request.getProtocolVersion());
        }
        async getCoinbase() {
            return await this.send(this.request.getCoinbase());
        }
        async isMining() {
            return await this.send(this.request.isMining());
        }
        async getHashrate() {
            return await this.send(this.request.getHashrate());
        }
        async isSyncing() {
            return await this.send(this.request.isSyncing());
        }
        async getGasPrice() {
            return await this.send(this.request.getGasPrice());
        }
        async getAccounts() {
            return await this.send(this.request.getAccounts());
        }
        async getBlockNumber() {
            return await this.send(this.request.getBlockNumber());
        }
        async getBalance(address, block) {
            return await this.send(this.request.getBalance(address, block));
        }
        async getStorageAt(address, position, block) {
            return await this.send(this.request.getStorageAt(address, position, block));
        }
        async getCode(address, block) {
            return await this.send(this.request.getCode(address, block));
        }
        async getBlock(block, returnTxs) {
            return await this.send(this.request.getBlock(block, returnTxs));
        }
        async getUncle(block, uncleIndex, returnTxs) {
            return await this.send(this.request.getUncle(block, uncleIndex, returnTxs));
        }
        async getBlockTransactionCount(block) {
            return await this.send(this.request.getBlockTransactionCount(block));
        }
        async getBlockUncleCount(block) {
            return await this.send(this.request.getBlockUncleCount(block));
        }
        async getTransaction(hash) {
            return await this.send(this.request.getTransaction(hash));
        }
        async getTransactionFromBlock(block, index) {
            return await this.send(this.request.getTransactionFromBlock(block, index));
        }
        async getTransactionReceipt(txHash) {
            return await this.send(this.request.getTransactionReceipt(txHash));
        }
        async getTransactionCount(address, block) {
            return await this.send(this.request.getTransactionCount(address, block));
        }
        async signTransaction(tx) {
            return await this.send(this.request.signTransaction(tx));
        }
        sendSignedTransaction(data) {
            const { method, params } = this.request.sendSignedTransaction(data);
            const txHashPromise = this.provider.send(method, params);
            return new SentTransaction(this, txHashPromise);
        }
        sendTransaction(tx) {
            const promise = new Promise(async (resolve, reject) => {
                try {
                    if (!tx.gasPrice) {
                        tx.gasPrice = await this.getGasPrice();
                    }
                    const account = this.getAccount(tx.from);
                    if (!account) {
                        const { method, params, format } = this.request.sendTransaction(tx);
                        const txHash = format(await this.provider.send(method, params));
                        resolve(txHash);
                    }
                    else {
                        const { from, ...fromlessTx } = tx;
                        const signedTx = await account.signTransaction(fromlessTx, this);
                        const { method, params, format } = this.request.sendSignedTransaction(signedTx.rawTransaction);
                        const txHash = format(await this.provider.send(method, params));
                        resolve(txHash);
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
            return new SentTransaction(this, promise);
        }
        getAccount(address) {
            address = address || this.defaultFromAddress;
            if (this.wallet && address) {
                return this.wallet.get(address);
            }
        }
        async sign(address, dataToSign) {
            const account = this.getAccount(address);
            if (!account) {
                return await this.send(this.request.sign(address, dataToSign));
            }
            else {
                const sig = account.sign(dataToSign);
                return sig.signature;
            }
        }
        async signTypedData(address, dataToSign) {
            return await this.send(this.request.signTypedData(address, dataToSign));
        }
        async call(tx, block) {
            return await this.send(this.request.call(tx, block));
        }
        async estimateGas(tx) {
            return await this.send(this.request.estimateGas(tx));
        }
        async submitWork(nonce, powHash, digest) {
            return await this.send(this.request.submitWork(nonce, powHash, digest));
        }
        async getWork() {
            return await this.send(this.request.getWork());
        }
        async getPastLogs(options) {
            return await this.send(this.request.getPastLogs(options));
        }
        subscribe(type, ...args) {
            switch (type) {
                case 'logs':
                    return subscribeForLogs(this, ...args);
                case 'syncing':
                    return subscribeForSyncing(this.provider);
                case 'newBlockHeaders':
                    return subscribeForNewHeads(this.provider);
                case 'pendingTransactions':
                    return subscribeForNewPendingTransactions(this.provider);
                default:
                    throw new Error(`Unknown subscription type: ${type}`);
            }
        }
    }

    const eth = writable(undefined);
    const installed = writable(false);
    const accepted = writable(false);
    const account = writable(undefined);
    const networkId = writable(undefined);
    const isLoggedIn = derived(account, v => !!v);

    const getEth = async () => {
      let _eth = undefined;

      if (window.ethereum) {
        console.log(`Injected ethereum detected.`);
        _eth = new Eth(new LegacyProviderAdapter(window.ethereum));
      } else if (window.web3) {
        console.log(`Injected web3 detected.`);
        _eth = new Eth(new LegacyProviderAdapter(window.web3.currentProvider));
      }

      if (_eth) {
        eth.update(() => _eth);
        installed.update(() => true);
      }

      return _eth;
    };

    const getNetworkId = async () => {
      const _eth = get_store_value(eth);
      if (!_eth) return undefined;

      return _eth.getId();
    };

    const getAccount = async () => {
      const accounts = (await get_store_value(eth).eth.getAccounts()) || [];

      return accounts[0] || undefined;
    };

    const sync = async () => {
      const _networkId = await getNetworkId();
      networkId.update(() => _networkId);

      if (get_store_value(accepted)) {
        const _account = await getAccount();
        account.update(() => _account);
      }
    };

    const init$2 = async () => {
      const _eth = await getEth();
      await sync();

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", accounts => {
          account.update(() => accounts[0] || undefined);
        });

        window.ethereum.on("networkChanged", _networkId => {
          networkId.update(() => _networkId);
        });
      } else {
        setInterval(sync, 1e3);
      }

      return _eth;
    };

    const safeFetch = async (...args) => {
      return fetch(...args).then(res => {
        if (res.ok) {
          return res.json();
        }

        throw Error("response not ok");
      });
    };

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class SentContractTx extends SentTransaction {
        constructor(eth, contractAbi, promise) {
            super(eth, promise);
            this.contractAbi = contractAbi;
        }
        async handleReceipt(receipt) {
            receipt = await super.handleReceipt(receipt);
            const { logs, to, contractAddress = to } = receipt;
            if (!isArray$1(logs)) {
                return receipt;
            }
            const isAnonymous = log => !log.address.equals(contractAddress) || !this.contractAbi.findEntryForLog(log);
            const anonymousLogs = logs.filter(isAnonymous);
            const events = logs.reduce((a, log) => {
                if (isAnonymous(log)) {
                    return a;
                }
                const ev = this.contractAbi.decodeEvent(log);
                a[ev.event] = a[ev.event] || [];
                a[ev.event].push(ev);
                return a;
            }, {});
            delete receipt.logs;
            return { ...receipt, anonymousLogs, events };
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class Tx {
        constructor(eth, contractEntry, contractAbi, contractAddress, args = [], defaultOptions = {}) {
            this.eth = eth;
            this.contractEntry = contractEntry;
            this.contractAbi = contractAbi;
            this.contractAddress = contractAddress;
            this.args = args;
            this.defaultOptions = defaultOptions;
        }
        async estimateGas(options = {}) {
            return await this.eth.estimateGas(this.getTx(options));
        }
        async call(options = {}, block) {
            const result = await this.eth.call(this.getTx(options), block);
            return this.contractEntry.decodeReturnValue(result);
        }
        getCallRequestPayload(options, block) {
            const result = this.eth.request.call(this.getTx(options), block);
            return {
                ...result,
                format: (result) => this.contractEntry.decodeReturnValue(result),
            };
        }
        send(options) {
            const tx = this.getTx(options);
            if (!this.contractEntry.payable && tx.value !== undefined && tx.value > 0) {
                throw new Error('Can not send value to non-payable contract method.');
            }
            const promise = this.eth.sendTransaction(tx).getTxHash();
            return new SentContractTx(this.eth, this.contractAbi, promise);
        }
        getSendRequestPayload(options) {
            return this.eth.request.sendTransaction(this.getTx(options));
        }
        encodeABI() {
            return this.contractEntry.encodeABI(this.args);
        }
        getTx(options = {}) {
            return {
                to: this.contractAddress,
                from: options.from || this.defaultOptions.from,
                gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
                gas: options.gas || this.defaultOptions.gas,
                value: options.value,
                data: this.encodeABI(),
                nonce: options.nonce,
            };
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class SentDeployContractTx extends SentContractTx {
        constructor(eth, contractAbi, promise, onDeployed) {
            super(eth, contractAbi, promise);
            this.onDeployed = onDeployed;
        }
        async handleReceipt(receipt) {
            receipt = await super.handleReceipt(receipt);
            if (!receipt.contractAddress) {
                throw new Error('The contract deployment receipt did not contain a contract address.');
            }
            const code = await this.eth.getCode(receipt.contractAddress);
            if (code.length <= 2) {
                throw new Error(`Contract code could not be stored at ${receipt.contractAddress}.`);
            }
            this.onDeployed(receipt.contractAddress);
            return receipt;
        }
        async getContract() {
            const receipt = await this.getReceipt();
            return new Contract(this.eth, this.contractAbi, receipt.contractAddress);
        }
    }

    class TxDeploy extends Tx {
        constructor(eth, contractEntry, contractAbi, deployData, args = [], defaultOptions = {}, onDeployed = x => x) {
            super(eth, contractEntry, contractAbi, undefined, args, defaultOptions);
            this.deployData = deployData;
            this.onDeployed = onDeployed;
        }
        send(options) {
            const sentTx = super.send(options);
            return new SentDeployContractTx(this.eth, this.contractAbi, sentTx.getTxHash(), this.onDeployed);
        }
        encodeABI() {
            return Buffer.concat([this.deployData, this.contractEntry.encodeParameters(this.args)]);
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * Should be called to create new contract instance
     *
     * @method Contract
     * @constructor
     * @param {Array} jsonInterface
     * @param {String} address
     * @param {Object} options
     */
    class Contract {
        constructor(eth, contractAbi, address, defaultOptions = {}) {
            this.eth = eth;
            this.contractAbi = contractAbi;
            this.address = address;
            this.defaultOptions = defaultOptions;
            this.linkTable = {};
            this.methods = this.buildMethods();
            this.events = this.buildEvents();
        }
        link(name, address) {
            this.linkTable[name] = address;
        }
        deployBytecode(data, ...args) {
            const linkedData = Object.entries(this.linkTable).reduce((data, [name, address]) => data.replace(new RegExp(`_+${name}_+`, 'gi'), address
                .toString()
                .slice(2)
                .toLowerCase()), data);
            if (linkedData.includes('_')) {
                throw new Error('Bytecode has not been fully linked.');
            }
            return new TxDeploy(this.eth, this.contractAbi.ctor, this.contractAbi, hexToBuffer(linkedData), args, this.defaultOptions, addr => (this.address = addr));
        }
        once(event, options, callback) {
            this.on(event, options, (err, res, sub) => {
                sub.unsubscribe();
                callback(err, res, sub);
            });
        }
        async getPastEvents(event, options = {}) {
            const logOptions = this.getLogOptions(event, options);
            const result = await this.eth.getPastLogs(logOptions);
            return result.map(log => this.contractAbi.decodeEvent(log));
        }
        on(event, options = {}, callback) {
            const logOptions = this.getLogOptions(event, options);
            const { fromBlock, ...subLogOptions } = logOptions;
            const params = [toRawLogRequest(subLogOptions)];
            const subscription = new Subscription('eth', 'logs', params, this.eth.provider, (result, sub) => {
                const output = fromRawLogResponse(result);
                const eventLog = this.contractAbi.decodeEvent(output);
                sub.emit(output.removed ? 'changed' : 'data', eventLog);
                if (callback) {
                    callback(undefined, eventLog, sub);
                }
            }, false);
            subscription.on('error', err => {
                if (callback) {
                    callback(err, undefined, subscription);
                }
            });
            if (fromBlock !== undefined) {
                this.eth
                    .getPastLogs(logOptions)
                    .then(logs => {
                    logs.forEach(result => {
                        const output = this.contractAbi.decodeEvent(result);
                        subscription.emit('data', output);
                    });
                    subscription.subscribe();
                })
                    .catch(err => {
                    subscription.emit('error', err);
                });
            }
            else {
                subscription.subscribe();
            }
            return subscription;
        }
        executorFactory(functions) {
            return (...args) => {
                if (!this.address) {
                    throw new Error('No contract address.');
                }
                const firstMatchingOverload = functions.find(f => args.length === f.numArgs());
                if (!firstMatchingOverload) {
                    throw new Error(`No matching method with ${args.length} arguments for ${functions[0].name}.`);
                }
                return new Tx(this.eth, firstMatchingOverload, this.contractAbi, this.address, args, this.defaultOptions);
            };
        }
        buildMethods() {
            const methods = {};
            this.contractAbi.functions.forEach(f => {
                const executor = this.executorFactory([f]);
                methods[f.asString()] = executor;
                methods[f.signature] = executor;
            });
            const grouped = this.contractAbi.functions.reduce((acc, method) => {
                const funcs = [...(acc[method.name] || []), method];
                return { ...acc, [method.name]: funcs };
            }, {});
            Object.entries(grouped).map(([name, funcs]) => {
                methods[name] = this.executorFactory(funcs);
            });
            return methods;
        }
        buildEvents() {
            const events = {};
            this.contractAbi.events.forEach(e => {
                const event = this.on.bind(this, e.signature);
                if (!events[e.name]) {
                    events[e.name] = event;
                }
                events[e.asString()] = event;
                events[e.signature] = event;
            });
            events.allEvents = this.on.bind(this, 'allevents');
            return events;
        }
        getLogOptions(eventName = 'allevents', options) {
            if (!this.address) {
                throw new Error('No contract address.');
            }
            if (eventName.toLowerCase() === 'allevents') {
                return {
                    ...options,
                    address: this.address,
                };
            }
            const event = this.contractAbi.events.find(e => e.name === eventName || e.signature === '0x' + eventName.replace('0x', ''));
            if (!event) {
                throw new Error(`Event ${eventName} not found.`);
            }
            return {
                ...options,
                address: this.address,
                topics: event.getEventTopics(options.filter),
            };
        }
    }

    // Unknown Error
    const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
    // Missing new operator to an object
    //  - name: The name of the class
    const MISSING_NEW = 'MISSING_NEW';
    // Invalid argument (e.g. value is incompatible with type) to a function:
    //   - arg: The argument name that was invalid
    //   - value: The value of the argument
    const INVALID_ARGUMENT = 'INVALID_ARGUMENT';
    // Missing argument to a function:
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    const MISSING_ARGUMENT = 'MISSING_ARGUMENT';
    // Too many arguments
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    const UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT';
    // Numeric Fault
    //   - operation: the operation being executed
    //   - fault: the reason this faulted
    const NUMERIC_FAULT = 'NUMERIC_FAULT';
    let _censorErrors = false;
    // @TODO: Enum
    function throwError(message, code = UNKNOWN_ERROR, params = {}) {
        if (_censorErrors) {
            throw new Error('unknown error');
        }
        let messageDetails = [];
        Object.keys(params).forEach(key => {
            try {
                messageDetails.push(key + '=' + JSON.stringify(params[key]));
            }
            catch (error) {
                messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
            }
        });
        messageDetails.push('version=1');
        let reason = message;
        if (messageDetails.length) {
            message += ' (' + messageDetails.join(', ') + ')';
        }
        // @TODO: Any??
        let error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
            error[key] = params[key];
        });
        throw error;
    }
    function checkNew(self, kind) {
        if (!(self instanceof kind)) {
            throwError('missing new', MISSING_NEW, { name: kind.name });
        }
    }
    function checkArgumentCount(count, expectedCount, suffix) {
        if (!suffix) {
            suffix = '';
        }
        if (count < expectedCount) {
            throwError('missing argument' + suffix, MISSING_ARGUMENT, { count: count, expectedCount: expectedCount });
        }
        if (count > expectedCount) {
            throwError('too many arguments' + suffix, UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount });
        }
    }

    /**
     *  Conversion Utilities
     *
     */
    ///////////////////////////////
    function isHexable(value) {
        return !!value.toHexString;
    }
    function addSlice(array) {
        if (array.slice) {
            return array;
        }
        array.slice = function () {
            var args = Array.prototype.slice.call(arguments);
            return new Uint8Array(Array.prototype.slice.apply(array, args));
        };
        return array;
    }
    function isArrayish(value) {
        if (!value || parseInt(String(value.length)) != value.length || typeof value === 'string') {
            return false;
        }
        for (var i = 0; i < value.length; i++) {
            var v = value[i];
            if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
                return false;
            }
        }
        return true;
    }
    function arrayify(value) {
        if (value == null) {
            throwError('cannot convert null value to array', INVALID_ARGUMENT, { arg: 'value', value: value });
        }
        if (isHexable(value)) {
            value = value.toHexString();
        }
        if (typeof value === 'string') {
            let match = value.match(/^(0x)?[0-9a-fA-F]*$/);
            if (!match) {
                return throwError('invalid hexidecimal string', INVALID_ARGUMENT, { arg: 'value', value: value });
            }
            if (match[1] !== '0x') {
                return throwError('hex string must have 0x prefix', INVALID_ARGUMENT, {
                    arg: 'value',
                    value: value,
                });
            }
            value = value.substring(2);
            if (value.length % 2) {
                value = '0' + value;
            }
            var result = [];
            for (var i = 0; i < value.length; i += 2) {
                result.push(parseInt(value.substr(i, 2), 16));
            }
            return addSlice(new Uint8Array(result));
        }
        if (isArrayish(value)) {
            return addSlice(new Uint8Array(value));
        }
        return throwError('invalid arrayify value', undefined, { arg: 'value', value: value, type: typeof value });
    }
    function concat(objects) {
        var arrays = [];
        var length = 0;
        for (var i = 0; i < objects.length; i++) {
            var object = arrayify(objects[i]);
            arrays.push(object);
            length += object.length;
        }
        var result = new Uint8Array(length);
        var offset = 0;
        for (var i = 0; i < arrays.length; i++) {
            result.set(arrays[i], offset);
            offset += arrays[i].length;
        }
        return addSlice(result);
    }
    function padZeros(value, length) {
        value = arrayify(value);
        if (length < value.length) {
            throw new Error('cannot pad');
        }
        var result = new Uint8Array(length);
        result.set(value, length - value.length);
        return addSlice(result);
    }
    function isHexString(value, length) {
        if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
            return false;
        }
        if (length && value.length !== 2 + 2 * length) {
            return false;
        }
        return true;
    }
    const HexCharacters = '0123456789abcdef';
    function hexlify(value) {
        if (isHexable(value)) {
            return value.toHexString();
        }
        if (typeof value === 'number') {
            if (value < 0) {
                throwError('cannot hexlify negative value', INVALID_ARGUMENT, { arg: 'value', value: value });
            }
            var hex = '';
            while (value) {
                hex = HexCharacters[value & 0x0f] + hex;
                value = Math.floor(value / 16);
            }
            if (hex.length) {
                if (hex.length % 2) {
                    hex = '0' + hex;
                }
                return '0x' + hex;
            }
            return '0x00';
        }
        if (typeof value === 'string') {
            let match = value.match(/^(0x)?[0-9a-fA-F]*$/);
            if (!match) {
                return throwError('invalid hexidecimal string', INVALID_ARGUMENT, { arg: 'value', value: value });
            }
            if (match[1] !== '0x') {
                return throwError('hex string must have 0x prefix', INVALID_ARGUMENT, {
                    arg: 'value',
                    value: value,
                });
            }
            if (value.length % 2) {
                value = '0x0' + value.substring(2);
            }
            return value;
        }
        if (isArrayish(value)) {
            var result = [];
            for (var i = 0; i < value.length; i++) {
                var v = value[i];
                result.push(HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f]);
            }
            return '0x' + result.join('');
        }
        return throwError('invalid hexlify value', undefined, { arg: 'value', value: value });
    }

    function defineReadOnly(object, name, value) {
        Object.defineProperty(object, name, {
            enumerable: true,
            value: value,
            writable: false,
        });
    }
    // There are some issues with instanceof with npm link, so we use this
    // to ensure types are what we expect.
    function setType(object, type) {
        Object.defineProperty(object, '_ethersType', { configurable: false, value: type, writable: false });
    }
    function isType(object, type) {
        return object && object._ethersType === type;
    }
    function shallowCopy(object) {
        let result = {};
        for (var key in object) {
            result[key] = object[key];
        }
        return result;
    }
    let opaque = { boolean: true, number: true, string: true };
    function deepCopy(object, frozen) {
        // Opaque objects are not mutable, so safe to copy by assignment
        if (object === undefined || object === null || opaque[typeof object]) {
            return object;
        }
        // Arrays are mutable, so we need to create a copy
        if (Array.isArray(object)) {
            let result = object.map(item => deepCopy(item, frozen));
            if (frozen) {
                Object.freeze(result);
            }
            return result;
        }
        if (typeof object === 'object') {
            // Some internal objects, which are already immutable
            if (isType(object, 'BigNumber')) {
                return object;
            }
            if (isType(object, 'Description')) {
                return object;
            }
            if (isType(object, 'Indexed')) {
                return object;
            }
            let result = {};
            for (let key in object) {
                let value = object[key];
                if (value === undefined) {
                    continue;
                }
                defineReadOnly(result, key, deepCopy(value, frozen));
            }
            if (frozen) {
                Object.freeze(result);
            }
            return result;
        }
        // The function type is also immutable, so safe to copy by assignment
        if (typeof object === 'function') {
            return object;
        }
        throw new Error('Cannot deepCopy ' + typeof object);
    }

    const BN_1 = new bn(-1);
    function toHex$1(bn) {
        let value = bn.toString(16);
        if (value[0] === '-') {
            if (value.length % 2 === 0) {
                return '-0x0' + value.substring(1);
            }
            return '-0x' + value.substring(1);
        }
        if (value.length % 2 === 1) {
            return '0x0' + value;
        }
        return '0x' + value;
    }
    function toBN$1(value) {
        return _bnify(bigNumberify(value));
    }
    function toBigNumber(bn) {
        return new BigNumber(toHex$1(bn));
    }
    function _bnify(value) {
        let hex = value._hex;
        if (hex[0] === '-') {
            return new bn(hex.substring(3), 16).mul(BN_1);
        }
        return new bn(hex.substring(2), 16);
    }
    class BigNumber {
        constructor(value) {
            this._hex = '';
            checkNew(this, BigNumber);
            setType(this, 'BigNumber');
            if (typeof value === 'string') {
                if (isHexString(value)) {
                    if (value == '0x') {
                        value = '0x0';
                    }
                    defineReadOnly(this, '_hex', value);
                }
                else if (value[0] === '-' && isHexString(value.substring(1))) {
                    defineReadOnly(this, '_hex', value);
                }
                else if (value.match(/^-?[0-9]*$/)) {
                    if (value == '') {
                        value = '0';
                    }
                    defineReadOnly(this, '_hex', toHex$1(new bn(value)));
                }
                else {
                    throwError('invalid BigNumber string value', INVALID_ARGUMENT, { arg: 'value', value: value });
                }
            }
            else if (typeof value === 'number') {
                if (parseInt(String(value)) !== value) {
                    throwError('underflow', NUMERIC_FAULT, {
                        operation: 'setValue',
                        fault: 'underflow',
                        value: value,
                        outputValue: parseInt(String(value)),
                    });
                }
                try {
                    defineReadOnly(this, '_hex', toHex$1(new bn(value)));
                }
                catch (error) {
                    throwError('overflow', NUMERIC_FAULT, {
                        operation: 'setValue',
                        fault: 'overflow',
                        details: error.message,
                    });
                }
            }
            else if (value instanceof BigNumber) {
                defineReadOnly(this, '_hex', value._hex);
            }
            else if (value.toHexString) {
                defineReadOnly(this, '_hex', toHex$1(toBN$1(value.toHexString())));
            }
            else if (value._hex && isHexString(value._hex)) {
                defineReadOnly(this, '_hex', value._hex);
            }
            else if (isArrayish(value)) {
                defineReadOnly(this, '_hex', toHex$1(new bn(hexlify(value).substring(2), 16)));
            }
            else {
                throwError('invalid BigNumber value', INVALID_ARGUMENT, { arg: 'value', value: value });
            }
        }
        fromTwos(value) {
            return toBigNumber(_bnify(this).fromTwos(value));
        }
        toTwos(value) {
            return toBigNumber(_bnify(this).toTwos(value));
        }
        add(other) {
            return toBigNumber(_bnify(this).add(toBN$1(other)));
        }
        sub(other) {
            return toBigNumber(_bnify(this).sub(toBN$1(other)));
        }
        div(other) {
            let o = bigNumberify(other);
            if (o.isZero()) {
                throwError('division by zero', NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
            }
            return toBigNumber(_bnify(this).div(toBN$1(other)));
        }
        mul(other) {
            return toBigNumber(_bnify(this).mul(toBN$1(other)));
        }
        mod(other) {
            return toBigNumber(_bnify(this).mod(toBN$1(other)));
        }
        pow(other) {
            return toBigNumber(_bnify(this).pow(toBN$1(other)));
        }
        maskn(value) {
            return toBigNumber(_bnify(this).maskn(value));
        }
        eq(other) {
            return _bnify(this).eq(toBN$1(other));
        }
        lt(other) {
            return _bnify(this).lt(toBN$1(other));
        }
        lte(other) {
            return _bnify(this).lte(toBN$1(other));
        }
        gt(other) {
            return _bnify(this).gt(toBN$1(other));
        }
        gte(other) {
            return _bnify(this).gte(toBN$1(other));
        }
        isZero() {
            return _bnify(this).isZero();
        }
        toNumber() {
            try {
                return _bnify(this).toNumber();
            }
            catch (error) {
                return throwError('overflow', NUMERIC_FAULT, {
                    operation: 'setValue',
                    fault: 'overflow',
                    details: error.message,
                });
            }
        }
        toString() {
            return _bnify(this).toString(10);
        }
        toHexString() {
            return this._hex;
        }
        static isBigNumber(value) {
            return isType(value, 'BigNumber');
        }
    }
    function bigNumberify(value) {
        if (bn.isBN(value)) {
            return new BigNumber(value.toString());
        }
        if (BigNumber.isBigNumber(value)) {
            return value;
        }
        return new BigNumber(value);
    }

    const NegativeOne = bigNumberify(-1);
    const Zero = bigNumberify(0);
    const One = bigNumberify(1);
    const Two = bigNumberify(2);
    const WeiPerEther = bigNumberify('1000000000000000000');
    const MaxUint256 = bigNumberify('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    ///////////////////////////////
    // Shims for environments that are missing some required constants and functions
    var MAX_SAFE_INTEGER = 0x1fffffffffffff;
    function log10(x) {
        if (Math.log10) {
            return Math.log10(x);
        }
        return Math.log(x) / Math.LN10;
    }
    // See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
    // Create lookup table
    var ibanLookup = {};
    for (var i = 0; i < 10; i++) {
        ibanLookup[String(i)] = String(i);
    }
    for (var i = 0; i < 26; i++) {
        ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
    }
    // How many decimal digits can we process? (for 64-bit float, this is 15)
    var safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
    function ibanChecksum(address) {
        address = address.toUpperCase();
        address = address.substring(4) + address.substring(0, 2) + '00';
        var expanded = '';
        address.split('').forEach(function (c) {
            expanded += ibanLookup[c];
        });
        // Javascript can handle integers safely up to 15 (decimal) digits
        while (expanded.length >= safeDigits) {
            var block = expanded.substring(0, safeDigits);
            expanded = (parseInt(block, 10) % 97) + expanded.substring(block.length);
        }
        var checksum = String(98 - (parseInt(expanded, 10) % 97));
        while (checksum.length < 2) {
            checksum = '0' + checksum;
        }
        return checksum;
    }
    function getAddress(address) {
        if (typeof address !== 'string') {
            throwError('invalid address', INVALID_ARGUMENT, { arg: 'address', value: address });
        }
        if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
            // Missing the 0x prefix
            if (address.substring(0, 2) !== '0x') {
                address = '0x' + address;
            }
            const result = Address.fromString(address);
            return result;
        }
        else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
            // It is an ICAP address with a bad checksum
            if (address.substring(2, 4) !== ibanChecksum(address)) {
                throwError('bad icap checksum', INVALID_ARGUMENT, { arg: 'address', value: address });
            }
            let result = new bn(address.substring(4), 36).toString(16);
            while (result.length < 40) {
                result = '0' + result;
            }
            return Address.fromString(result);
        }
        else {
            return throwError('invalid address', INVALID_ARGUMENT, { arg: 'address', value: address });
        }
    }

    ///////////////////////////////
    var UnicodeNormalizationForm;
    (function (UnicodeNormalizationForm) {
        UnicodeNormalizationForm["current"] = "";
        UnicodeNormalizationForm["NFC"] = "NFC";
        UnicodeNormalizationForm["NFD"] = "NFD";
        UnicodeNormalizationForm["NFKC"] = "NFKC";
        UnicodeNormalizationForm["NFKD"] = "NFKD";
    })(UnicodeNormalizationForm || (UnicodeNormalizationForm = {}));
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUtf8Bytes(str, form = UnicodeNormalizationForm.current) {
        if (form != UnicodeNormalizationForm.current) {
            str = str.normalize(form);
        }
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 0x80) {
                result.push(c);
            }
            else if (c < 0x800) {
                result.push((c >> 6) | 0xc0);
                result.push((c & 0x3f) | 0x80);
            }
            else if ((c & 0xfc00) == 0xd800) {
                i++;
                let c2 = str.charCodeAt(i);
                if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
                    throw new Error('invalid utf-8 string');
                }
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
                result.push((c >> 18) | 0xf0);
                result.push(((c >> 12) & 0x3f) | 0x80);
                result.push(((c >> 6) & 0x3f) | 0x80);
                result.push((c & 0x3f) | 0x80);
            }
            else {
                result.push((c >> 12) | 0xe0);
                result.push(((c >> 6) & 0x3f) | 0x80);
                result.push((c & 0x3f) | 0x80);
            }
        }
        return arrayify(result);
    }
    // http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
    function toUtf8String(bytes, ignoreErrors) {
        bytes = arrayify(bytes);
        let result = '';
        let i = 0;
        // Invalid bytes are ignored
        while (i < bytes.length) {
            var c = bytes[i++];
            // 0xxx xxxx
            if (c >> 7 === 0) {
                result += String.fromCharCode(c);
                continue;
            }
            // Multibyte; how many bytes left for this character?
            let extraLength;
            let overlongMask;
            // 110x xxxx 10xx xxxx
            if ((c & 0xe0) === 0xc0) {
                extraLength = 1;
                overlongMask = 0x7f;
                // 1110 xxxx 10xx xxxx 10xx xxxx
            }
            else if ((c & 0xf0) === 0xe0) {
                extraLength = 2;
                overlongMask = 0x7ff;
                // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
            }
            else if ((c & 0xf8) === 0xf0) {
                extraLength = 3;
                overlongMask = 0xffff;
            }
            else {
                if (!ignoreErrors) {
                    if ((c & 0xc0) === 0x80) {
                        throw new Error('invalid utf8 byte sequence; unexpected continuation byte');
                    }
                    throw new Error('invalid utf8 byte sequence; invalid prefix');
                }
                continue;
            }
            // Do we have enough bytes in our data?
            if (i + extraLength > bytes.length) {
                if (!ignoreErrors) {
                    throw new Error('invalid utf8 byte sequence; too short');
                }
                // If there is an invalid unprocessed byte, skip continuation bytes
                for (; i < bytes.length; i++) {
                    if (bytes[i] >> 6 !== 0x02) {
                        break;
                    }
                }
                continue;
            }
            // Remove the length prefix from the char
            let res = c & ((1 << (8 - extraLength - 1)) - 1);
            for (let j = 0; j < extraLength; j++) {
                var nextChar = bytes[i];
                // Invalid continuation byte
                if ((nextChar & 0xc0) != 0x80) {
                    res = null;
                    break;
                }
                res = (res << 6) | (nextChar & 0x3f);
                i++;
            }
            if (res === null) {
                if (!ignoreErrors) {
                    throw new Error('invalid utf8 byte sequence; invalid continuation byte');
                }
                continue;
            }
            // Check for overlong seuences (more bytes than needed)
            if (res <= overlongMask) {
                if (!ignoreErrors) {
                    throw new Error('invalid utf8 byte sequence; overlong');
                }
                continue;
            }
            // Maximum code point
            if (res > 0x10ffff) {
                if (!ignoreErrors) {
                    throw new Error('invalid utf8 byte sequence; out-of-range');
                }
                continue;
            }
            // Reserved for UTF-16 surrogate halves
            if (res >= 0xd800 && res <= 0xdfff) {
                if (!ignoreErrors) {
                    throw new Error('invalid utf8 byte sequence; utf-16 surrogate');
                }
                continue;
            }
            if (res <= 0xffff) {
                result += String.fromCharCode(res);
                continue;
            }
            res -= 0x10000;
            result += String.fromCharCode(((res >> 10) & 0x3ff) + 0xd800, (res & 0x3ff) + 0xdc00);
        }
        return result;
    }

    ///////////////////////////////
    const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
    const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
    const paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
    const defaultCoerceFunc = function (type, value) {
        var match = type.match(paramTypeNumber);
        if (match && parseInt(match[2]) <= 48) {
            return value.toNumber();
        }
        return value;
    };
    function verifyType(type) {
        // These need to be transformed to their full description
        if (type.match(/^uint($|[^1-9])/)) {
            type = 'uint256' + type.substring(4);
        }
        else if (type.match(/^int($|[^1-9])/)) {
            type = 'int256' + type.substring(3);
        }
        return type;
    }
    function parseParam(param, allowIndexed) {
        function throwError(i) {
            throw new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"');
        }
        var parent = { type: '', name: '', state: { allowType: true } };
        var node = parent;
        for (var i = 0; i < param.length; i++) {
            var c = param[i];
            switch (c) {
                case '(':
                    if (!node.state.allowParams) {
                        throwError(i);
                    }
                    node.state.allowType = false;
                    node.type = verifyType(node.type);
                    node.components = [{ type: '', name: '', parent: node, state: { allowType: true } }];
                    node = node.components[0];
                    break;
                case ')':
                    delete node.state;
                    if (allowIndexed && node.name === 'indexed') {
                        node.indexed = true;
                        node.name = '';
                    }
                    node.type = verifyType(node.type);
                    var child = node;
                    node = node.parent;
                    if (!node) {
                        throwError(i);
                    }
                    delete child.parent;
                    node.state.allowParams = false;
                    node.state.allowName = true;
                    node.state.allowArray = true;
                    break;
                case ',':
                    delete node.state;
                    if (allowIndexed && node.name === 'indexed') {
                        node.indexed = true;
                        node.name = '';
                    }
                    node.type = verifyType(node.type);
                    var sibling = { type: '', name: '', parent: node.parent, state: { allowType: true } };
                    node.parent.components.push(sibling);
                    delete node.parent;
                    node = sibling;
                    break;
                // Hit a space...
                case ' ':
                    // If reading type, the type is done and may read a param or name
                    if (node.state.allowType) {
                        if (node.type !== '') {
                            node.type = verifyType(node.type);
                            delete node.state.allowType;
                            node.state.allowName = true;
                            node.state.allowParams = true;
                        }
                    }
                    // If reading name, the name is done
                    if (node.state.allowName) {
                        if (node.name !== '') {
                            if (allowIndexed && node.name === 'indexed') {
                                node.indexed = true;
                                node.name = '';
                            }
                            else {
                                node.state.allowName = false;
                            }
                        }
                    }
                    break;
                case '[':
                    if (!node.state.allowArray) {
                        throwError(i);
                    }
                    node.type += c;
                    node.state.allowArray = false;
                    node.state.allowName = false;
                    node.state.readArray = true;
                    break;
                case ']':
                    if (!node.state.readArray) {
                        throwError(i);
                    }
                    node.type += c;
                    node.state.readArray = false;
                    node.state.allowArray = true;
                    node.state.allowName = true;
                    break;
                default:
                    if (node.state.allowType) {
                        node.type += c;
                        node.state.allowParams = true;
                        node.state.allowArray = true;
                    }
                    else if (node.state.allowName) {
                        node.name += c;
                        delete node.state.allowArray;
                    }
                    else if (node.state.readArray) {
                        node.type += c;
                    }
                    else {
                        throwError(i);
                    }
            }
        }
        if (node.parent) {
            throw new Error('unexpected eof');
        }
        delete parent.state;
        if (allowIndexed && node.name === 'indexed') {
            node.indexed = true;
            node.name = '';
        }
        parent.type = verifyType(parent.type);
        return parent;
    }
    class Coder {
        constructor(coerceFunc, name, type, localName = '', dynamic) {
            this.coerceFunc = coerceFunc;
            this.name = name;
            this.type = type;
            this.localName = localName;
            this.dynamic = dynamic;
        }
    }
    // Clones the functionality of an existing Coder, but without a localName
    class CoderAnonymous extends Coder {
        constructor(coder) {
            super(coder.coerceFunc, coder.name, coder.type, undefined, coder.dynamic);
            defineReadOnly(this, 'coder', coder);
        }
        encode(value) {
            return this.coder.encode(value);
        }
        decode(data, offset) {
            return this.coder.decode(data, offset);
        }
    }
    class CoderNull extends Coder {
        constructor(coerceFunc, localName) {
            super(coerceFunc, 'null', '', localName, false);
        }
        encode(value) {
            return arrayify([]);
        }
        decode(data, offset) {
            if (offset > data.length) {
                throw new Error('invalid null');
            }
            return {
                consumed: 0,
                value: this.coerceFunc('null', undefined),
            };
        }
    }
    class CoderNumber extends Coder {
        constructor(coerceFunc, size, signed, localName) {
            const name = (signed ? 'int' : 'uint') + size * 8;
            super(coerceFunc, name, name, localName, false);
            this.size = size;
            this.signed = signed;
        }
        encode(value) {
            try {
                let v = bigNumberify(value);
                if (this.signed) {
                    let bounds = MaxUint256.maskn(this.size * 8 - 1);
                    if (v.gt(bounds)) {
                        throw new Error('out-of-bounds');
                    }
                    bounds = bounds.add(One).mul(NegativeOne);
                    if (v.lt(bounds)) {
                        throw new Error('out-of-bounds');
                    }
                }
                else if (v.lt(Zero) || v.gt(MaxUint256.maskn(this.size * 8))) {
                    throw new Error('out-of-bounds');
                }
                v = v.toTwos(this.size * 8).maskn(this.size * 8);
                if (this.signed) {
                    v = v.fromTwos(this.size * 8).toTwos(256);
                }
                return padZeros(arrayify(v), 32);
            }
            catch (error) {
                return throwError('invalid number value', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: this.name,
                    value: value,
                });
            }
        }
        decode(data, offset) {
            if (data.length < offset + 32) {
                throwError('insufficient data for ' + this.name + ' type', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: this.name,
                    value: hexlify(data.slice(offset, offset + 32)),
                });
            }
            var junkLength = 32 - this.size;
            var value = bigNumberify(data.slice(offset + junkLength, offset + 32));
            if (this.signed) {
                value = value.fromTwos(this.size * 8);
            }
            else {
                value = value.maskn(this.size * 8);
            }
            return {
                consumed: 32,
                value: this.coerceFunc(this.name, value),
            };
        }
    }
    var uint256Coder = new CoderNumber(function (type, value) {
        return value;
    }, 32, false, 'none');
    class CoderBoolean extends Coder {
        constructor(coerceFunc, localName) {
            super(coerceFunc, 'bool', 'bool', localName, false);
        }
        encode(value) {
            return uint256Coder.encode(!!value ? 1 : 0);
        }
        decode(data, offset) {
            try {
                var result = uint256Coder.decode(data, offset);
            }
            catch (error) {
                if (error.reason === 'insufficient data for uint256 type') {
                    throwError('insufficient data for boolean type', INVALID_ARGUMENT, {
                        arg: this.localName,
                        coderType: 'boolean',
                        value: error.value,
                    });
                }
                throw error;
            }
            return {
                consumed: result.consumed,
                value: this.coerceFunc('bool', !result.value.isZero()),
            };
        }
    }
    class CoderFixedBytes extends Coder {
        constructor(coerceFunc, length, localName) {
            const name = 'bytes' + length;
            super(coerceFunc, name, name, localName, false);
            this.length = length;
        }
        encode(value) {
            var result = new Uint8Array(32);
            try {
                if (value.length % 2 !== 0) {
                    throw new Error(`hex string cannot be odd-length`);
                }
                let data = arrayify(value);
                if (data.length > this.length) {
                    throw new Error(`incorrect data length`);
                }
                result.set(data);
            }
            catch (error) {
                throwError('invalid ' + this.name + ' value', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: this.name,
                    value: error.value || value,
                });
            }
            return result;
        }
        decode(data, offset) {
            if (data.length < offset + 32) {
                throwError('insufficient data for ' + name + ' type', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: this.name,
                    value: hexlify(data.slice(offset, offset + 32)),
                });
            }
            return {
                consumed: 32,
                value: this.coerceFunc(this.name, hexlify(data.slice(offset, offset + this.length))),
            };
        }
    }
    class CoderAddress extends Coder {
        constructor(coerceFunc, localName) {
            super(coerceFunc, 'address', 'address', localName, false);
        }
        encode(value) {
            let result = new Uint8Array(32);
            value = isString(value) ? Address.fromString(value) : value;
            try {
                result.set(arrayify(value.toBuffer()), 12);
            }
            catch (error) {
                throwError(`invalid address (${error.message})`, INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'address',
                    value: value,
                });
            }
            return result;
        }
        decode(data, offset) {
            if (data.length < offset + 32) {
                throwError('insufficuent data for address type', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'address',
                    value: hexlify(data.slice(offset, offset + 32)),
                });
            }
            return {
                consumed: 32,
                value: this.coerceFunc('address', getAddress(hexlify(data.slice(offset + 12, offset + 32)))),
            };
        }
    }
    function _encodeDynamicBytes(value) {
        var dataLength = 32 * Math.ceil(value.length / 32);
        var padding = new Uint8Array(dataLength - value.length);
        return concat([uint256Coder.encode(value.length), value, padding]);
    }
    function _decodeDynamicBytes(data, offset, localName) {
        if (data.length < offset + 32) {
            throwError('insufficient data for dynamicBytes length', INVALID_ARGUMENT, {
                arg: localName,
                coderType: 'dynamicBytes',
                value: hexlify(data.slice(offset, offset + 32)),
            });
        }
        var length = uint256Coder.decode(data, offset).value;
        try {
            length = length.toNumber();
        }
        catch (error) {
            throwError('dynamic bytes count too large', INVALID_ARGUMENT, {
                arg: localName,
                coderType: 'dynamicBytes',
                value: length.toString(),
            });
        }
        if (data.length < offset + 32 + length) {
            throwError('insufficient data for dynamicBytes type', INVALID_ARGUMENT, {
                arg: localName,
                coderType: 'dynamicBytes',
                value: hexlify(data.slice(offset, offset + 32 + length)),
            });
        }
        return {
            consumed: 32 + 32 * Math.ceil(length / 32),
            value: data.slice(offset + 32, offset + 32 + length),
        };
    }
    class CoderDynamicBytes extends Coder {
        constructor(coerceFunc, localName) {
            super(coerceFunc, 'bytes', 'bytes', localName, true);
        }
        encode(value) {
            try {
                return _encodeDynamicBytes(arrayify(value));
            }
            catch (error) {
                return throwError('invalid bytes value', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'bytes',
                    value: error.value,
                });
            }
        }
        decode(data, offset) {
            var result = _decodeDynamicBytes(data, offset, this.localName);
            result.value = this.coerceFunc('bytes', hexlify(result.value));
            return result;
        }
    }
    class CoderString extends Coder {
        constructor(coerceFunc, localName) {
            super(coerceFunc, 'string', 'string', localName, true);
        }
        encode(value) {
            if (typeof value !== 'string') {
                throwError('invalid string value', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'string',
                    value: value,
                });
            }
            return _encodeDynamicBytes(toUtf8Bytes(value));
        }
        decode(data, offset) {
            var result = _decodeDynamicBytes(data, offset, this.localName);
            result.value = this.coerceFunc('string', toUtf8String(result.value));
            return result;
        }
    }
    function alignSize(size) {
        return 32 * Math.ceil(size / 32);
    }
    function pack(coders, values) {
        if (Array.isArray(values)) ;
        else if (values && typeof values === 'object') {
            var arrayValues = [];
            coders.forEach(function (coder) {
                arrayValues.push(values[coder.localName]);
            });
            values = arrayValues;
        }
        else {
            throwError('invalid tuple value', INVALID_ARGUMENT, {
                coderType: 'tuple',
                value: values,
            });
        }
        if (coders.length !== values.length) {
            throwError('types/value length mismatch', INVALID_ARGUMENT, {
                coderType: 'tuple',
                value: values,
            });
        }
        var parts = [];
        coders.forEach(function (coder, index) {
            parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) });
        });
        var staticSize = 0, dynamicSize = 0;
        parts.forEach(function (part) {
            if (part.dynamic) {
                staticSize += 32;
                dynamicSize += alignSize(part.value.length);
            }
            else {
                staticSize += alignSize(part.value.length);
            }
        });
        var offset = 0, dynamicOffset = staticSize;
        var data = new Uint8Array(staticSize + dynamicSize);
        parts.forEach(function (part) {
            if (part.dynamic) {
                //uint256Coder.encode(dynamicOffset).copy(data, offset);
                data.set(uint256Coder.encode(dynamicOffset), offset);
                offset += 32;
                //part.value.copy(data, dynamicOffset);  @TODO
                data.set(part.value, dynamicOffset);
                dynamicOffset += alignSize(part.value.length);
            }
            else {
                //part.value.copy(data, offset);  @TODO
                data.set(part.value, offset);
                offset += alignSize(part.value.length);
            }
        });
        return data;
    }
    function unpack(coders, data, offset) {
        var baseOffset = offset;
        var consumed = 0;
        var value = [];
        coders.forEach(function (coder) {
            if (coder.dynamic) {
                var dynamicOffset = uint256Coder.decode(data, offset);
                var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber());
                // The dynamic part is leap-frogged somewhere else; doesn't count towards size
                result.consumed = dynamicOffset.consumed;
            }
            else {
                var result = coder.decode(data, offset);
            }
            if (result.value != undefined) {
                value.push(result.value);
            }
            offset += result.consumed;
            consumed += result.consumed;
        });
        coders.forEach(function (coder, index) {
            let name = coder.localName;
            if (!name) {
                return;
            }
            if (name === 'length') {
                name = '_length';
            }
            if (value[name] != null) {
                return;
            }
            value[name] = value[index];
        });
        return {
            value: value,
            consumed: consumed,
        };
    }
    class CoderArray extends Coder {
        constructor(coerceFunc, coder, length, localName) {
            const type = coder.type + '[' + (length >= 0 ? length : '') + ']';
            const dynamic = length === -1 || coder.dynamic;
            super(coerceFunc, 'array', type, localName, dynamic);
            this.coder = coder;
            this.length = length;
        }
        encode(value) {
            if (!Array.isArray(value)) {
                throwError('expected array value', INVALID_ARGUMENT, {
                    arg: this.localName,
                    coderType: 'array',
                    value: value,
                });
            }
            var count = this.length;
            var result = new Uint8Array(0);
            if (count === -1) {
                count = value.length;
                result = uint256Coder.encode(count);
            }
            checkArgumentCount(count, value.length, 'in coder array' + (this.localName ? ' ' + this.localName : ''));
            var coders = [];
            for (var i = 0; i < value.length; i++) {
                coders.push(this.coder);
            }
            return concat([result, pack(coders, value)]);
        }
        decode(data, offset) {
            // @TODO:
            //if (data.length < offset + length * 32) { throw new Error('invalid array'); }
            var consumed = 0;
            var count = this.length;
            if (count === -1) {
                try {
                    var decodedLength = uint256Coder.decode(data, offset);
                }
                catch (error) {
                    return throwError('insufficient data for dynamic array length', INVALID_ARGUMENT, {
                        arg: this.localName,
                        coderType: 'array',
                        value: error.value,
                    });
                }
                try {
                    count = decodedLength.value.toNumber();
                }
                catch (error) {
                    throwError('array count too large', INVALID_ARGUMENT, {
                        arg: this.localName,
                        coderType: 'array',
                        value: decodedLength.value.toString(),
                    });
                }
                consumed += decodedLength.consumed;
                offset += decodedLength.consumed;
            }
            var coders = [];
            for (var i = 0; i < count; i++) {
                coders.push(new CoderAnonymous(this.coder));
            }
            var result = unpack(coders, data, offset);
            result.consumed += consumed;
            result.value = this.coerceFunc(this.type, result.value);
            return result;
        }
    }
    class CoderTuple extends Coder {
        constructor(coerceFunc, coders, localName) {
            var dynamic = false;
            var types = [];
            coders.forEach(function (coder) {
                if (coder.dynamic) {
                    dynamic = true;
                }
                types.push(coder.type);
            });
            var type = 'tuple(' + types.join(',') + ')';
            super(coerceFunc, 'tuple', type, localName, dynamic);
            this.coders = coders;
        }
        encode(value) {
            return pack(this.coders, value);
        }
        decode(data, offset) {
            var result = unpack(this.coders, data, offset);
            result.value = this.coerceFunc(this.type, result.value);
            return result;
        }
    }
    // @TODO: Is there a way to return "class"?
    const paramTypeSimple = {
        address: CoderAddress,
        bool: CoderBoolean,
        string: CoderString,
        bytes: CoderDynamicBytes,
    };
    function getTupleParamCoder(coerceFunc, components, localName) {
        if (!components) {
            components = [];
        }
        var coders = [];
        components.forEach(function (component) {
            coders.push(getParamCoder(coerceFunc, component));
        });
        return new CoderTuple(coerceFunc, coders, localName);
    }
    function getParamCoder(coerceFunc, param) {
        var coder = paramTypeSimple[param.type];
        if (coder) {
            return new coder(coerceFunc, param.name);
        }
        var match = param.type.match(paramTypeNumber);
        if (match) {
            let size = parseInt(match[2] || '256');
            if (size === 0 || size > 256 || size % 8 !== 0) {
                return throwError('invalid ' + match[1] + ' bit length', INVALID_ARGUMENT, {
                    arg: 'param',
                    value: param,
                });
            }
            return new CoderNumber(coerceFunc, size / 8, match[1] === 'int', param.name);
        }
        var match = param.type.match(paramTypeBytes);
        if (match) {
            let size = parseInt(match[1]);
            if (size === 0 || size > 32) {
                throwError('invalid bytes length', INVALID_ARGUMENT, {
                    arg: 'param',
                    value: param,
                });
            }
            return new CoderFixedBytes(coerceFunc, size, param.name);
        }
        var match = param.type.match(paramTypeArray);
        if (match) {
            let size = parseInt(match[2] || '-1');
            param = shallowCopy(param);
            param.type = match[1];
            param = deepCopy(param);
            return new CoderArray(coerceFunc, getParamCoder(coerceFunc, param), size, param.name);
        }
        if (param.type.substring(0, 5) === 'tuple') {
            return getTupleParamCoder(coerceFunc, param.components, param.name);
        }
        if (param.type === '') {
            return new CoderNull(coerceFunc, param.name);
        }
        return throwError('invalid type', INVALID_ARGUMENT, {
            arg: 'type',
            value: param.type,
        });
    }
    class AbiCoder {
        constructor(coerceFunc) {
            checkNew(this, AbiCoder);
            if (!coerceFunc) {
                coerceFunc = defaultCoerceFunc;
            }
            defineReadOnly(this, 'coerceFunc', coerceFunc);
        }
        encode(types, values) {
            if (types.length !== values.length) {
                throwError('types/values length mismatch', INVALID_ARGUMENT, {
                    count: { types: types.length, values: values.length },
                    value: { types: types, values: values },
                });
            }
            var coders = [];
            types.forEach(function (type) {
                // Convert types to type objects
                //   - "uint foo" => { type: "uint", name: "foo" }
                //   - "tuple(uint, uint)" => { type: "tuple", components: [ { type: "uint" }, { type: "uint" }, ] }
                let typeObject;
                if (typeof type === 'string') {
                    typeObject = parseParam(type);
                }
                else {
                    typeObject = type;
                }
                coders.push(getParamCoder(this.coerceFunc, typeObject));
            }, this);
            return hexlify(new CoderTuple(this.coerceFunc, coders, '_').encode(values));
        }
        decode(types, data) {
            var coders = [];
            types.forEach(function (type) {
                // See encode for details
                let typeObject;
                if (typeof type === 'string') {
                    typeObject = parseParam(type);
                }
                else {
                    typeObject = deepCopy(type);
                }
                coders.push(getParamCoder(this.coerceFunc, typeObject));
            }, this);
            return new CoderTuple(this.coerceFunc, coders, '_').decode(arrayify(data), 0).value;
        }
    }
    const defaultAbiCoder = new AbiCoder();

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    /**
     * ABICoder prototype should be used to encode/decode solidity params of any type
     */
    class ABICoder {
        constructor() {
            this.ethersAbiCoder = new AbiCoder((type, value) => {
                if (type.match(/^u?int/) && !isArray$1(value) && (!isObject(value) || value.constructor.name !== 'BN')) {
                    return value.toString();
                }
                return value;
            });
        }
        /**
         * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
         *
         * @method encodeFunctionSignature
         * @param {String|Object} functionName
         * @return {String} encoded function name
         */
        encodeFunctionSignature(functionName) {
            if (isObject(functionName)) {
                functionName = this.abiMethodToString(functionName);
            }
            return sha3(functionName).slice(0, 10);
        }
        /**
         * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
         *
         * @method encodeEventSignature
         * @param {String|Object} functionName
         * @return {String} encoded function name
         */
        encodeEventSignature(functionName) {
            if (isObject(functionName)) {
                functionName = this.abiMethodToString(functionName);
            }
            return sha3(functionName);
        }
        /**
         * Should be used to encode plain param
         *
         * @method encodeParameter
         * @param {String} type
         * @param {Object} param
         * @return {String} encoded plain param
         */
        encodeParameter(type, param) {
            return this.encodeParameters([type], [param]);
        }
        /**
         * Should be used to encode list of params
         *
         * @method encodeParameters
         * @param {Array} types
         * @param {Array} params
         * @return {String} encoded list of params
         */
        encodeParameters(types, params) {
            return this.ethersAbiCoder.encode(this.mapTypes(types), params);
        }
        /**
         * Encodes a function call from its json interface and parameters.
         *
         * @method encodeFunctionCall
         * @param {Array} jsonInterface
         * @param {Array} params
         * @return {String} The encoded ABI for this function call
         */
        encodeFunctionCall(jsonInterface, params) {
            return (this.encodeFunctionSignature(jsonInterface) +
                this.encodeParameters(jsonInterface.inputs, params).replace('0x', ''));
        }
        /**
         * Should be used to decode bytes to plain param
         *
         * @method decodeParameter
         * @param {String} type
         * @param {String} bytes
         * @return {Object} plain param
         */
        decodeParameter(type, bytes) {
            return this.decodeParameters([type], bytes)[0];
        }
        /**
         * Should be used to decode list of params
         *
         * @method decodeParameter
         * @param {Array} outputs
         * @param {String} bytes
         * @return {Array} array of plain params
         */
        decodeParameters(outputs, bytes) {
            if (!bytes || bytes === '0x' || bytes === '0X') {
                throw new Error("Returned values aren't valid, did it run Out of Gas?");
            }
            const res = this.ethersAbiCoder.decode(this.mapTypes(outputs), '0x' + bytes.replace(/0x/i, ''));
            const returnValue = {};
            returnValue.__length__ = 0;
            outputs.forEach((output, i) => {
                let decodedValue = res[returnValue.__length__];
                decodedValue = decodedValue === '0x' ? null : decodedValue;
                returnValue[i] = decodedValue;
                if (isObject(output) && output.name) {
                    returnValue[output.name] = decodedValue;
                }
                returnValue.__length__++;
            });
            return returnValue;
        }
        /**
         * Decodes events non- and indexed parameters.
         *
         * @method decodeLog
         * @param {Object} inputs
         * @param {String} data
         * @param {Array} topics
         * @return {Array} array of plain params
         */
        decodeLog(inputs, data, topics) {
            topics = isArray$1(topics) ? topics : [topics];
            data = data || '';
            const notIndexedInputs = [];
            const indexedParams = [];
            let topicCount = 0;
            // TODO check for anonymous logs?
            inputs.forEach((input, i) => {
                if (input.indexed) {
                    indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].some(t => input.type.includes(t))
                        ? this.decodeParameter(input.type, topics[topicCount])
                        : topics[topicCount];
                    topicCount++;
                }
                else {
                    notIndexedInputs[i] = input;
                }
            });
            const nonIndexedData = data;
            const notIndexedParams = nonIndexedData && nonIndexedData !== '0x' ? this.decodeParameters(notIndexedInputs, nonIndexedData) : [];
            const returnValue = {};
            returnValue.__length__ = 0;
            inputs.forEach((res, i) => {
                returnValue[i] = res.type === 'string' ? '' : null;
                if (typeof notIndexedParams[i] !== 'undefined') {
                    returnValue[i] = notIndexedParams[i];
                }
                if (typeof indexedParams[i] !== 'undefined') {
                    returnValue[i] = indexedParams[i];
                }
                if (res.name) {
                    returnValue[res.name] = returnValue[i];
                }
                returnValue.__length__++;
            });
            return returnValue;
        }
        /**
         * Map types if simplified format is used
         *
         * @method mapTypes
         * @param {Array} types
         * @return {Array}
         */
        mapTypes(types) {
            const mappedTypes = [];
            types.forEach(type => {
                if (this.isSimplifiedStructFormat(type)) {
                    const structName = Object.keys(type)[0];
                    mappedTypes.push(Object.assign(this.mapStructNameAndType(structName), {
                        components: this.mapStructToCoderFormat(type[structName]),
                    }));
                    return;
                }
                mappedTypes.push(type);
            });
            return mappedTypes;
        }
        /**
         * Check if type is simplified struct format
         *
         * @method isSimplifiedStructFormat
         * @param {string | Object} type
         * @returns {boolean}
         */
        isSimplifiedStructFormat(type) {
            return typeof type === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined';
        }
        /**
         * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
         *
         * @method mapStructNameAndType
         * @param {string} structName
         * @return {{type: string, name: *}}
         */
        mapStructNameAndType(structName) {
            let type = 'tuple';
            if (structName.indexOf('[]') > -1) {
                type = 'tuple[]';
                structName = structName.slice(0, -2);
            }
            return { type, name: structName };
        }
        /**
         * Maps the simplified format in to the expected format of the ABICoder
         *
         * @method mapStructToCoderFormat
         * @param {Object} struct
         * @return {Array}
         */
        mapStructToCoderFormat(struct) {
            const components = [];
            Object.keys(struct).forEach(key => {
                if (typeof struct[key] === 'object') {
                    components.push(Object.assign(this.mapStructNameAndType(key), {
                        components: this.mapStructToCoderFormat(struct[key]),
                    }));
                    return;
                }
                components.push({
                    name: key,
                    type: struct[key],
                });
            });
            return components;
        }
        /**
         * Should be used to create full function/event name from json abi
         *
         * @method jsonInterfaceMethodToString
         * @param {Object} json
         * @return {String} full function/event name
         */
        abiMethodToString(json) {
            if (isObject(json) && json.name && json.name.indexOf('(') !== -1) {
                return json.name;
            }
            return json.name + '(' + flattenTypes(false, json.inputs).join(',') + ')';
        }
    }
    /**
     * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
     *
     * @method flattenTypes
     * @param {bool} includeTuple
     * @param {Object} puts
     * @return {Array} parameters as strings
     */
    function flattenTypes(includeTuple, puts) {
        // console.log("entered _flattenTypes. inputs/outputs: " + puts)
        const types = [];
        puts.forEach(param => {
            if (typeof param.components === 'object') {
                if (param.type.substring(0, 5) !== 'tuple') {
                    throw new Error('components found but type is not tuple; report on GitHub');
                }
                let suffix = '';
                const arrayBracket = param.type.indexOf('[');
                if (arrayBracket >= 0) {
                    suffix = param.type.substring(arrayBracket);
                }
                const result = flattenTypes(includeTuple, param.components);
                // console.log("result should have things: " + result)
                if (isArray$1(result) && includeTuple) {
                    // console.log("include tuple word, and its an array. joining...: " + result.types)
                    types.push('tuple(' + result.join(',') + ')' + suffix);
                }
                else if (!includeTuple) {
                    // console.log("don't include tuple, but its an array. joining...: " + result)
                    types.push('(' + result.join(',') + ')' + suffix);
                }
                else {
                    // console.log("its a single type within a tuple: " + result.types)
                    types.push('(' + result + ')');
                }
            }
            else {
                // console.log("its a type and not directly in a tuple: " + param.type)
                types.push(param.type);
            }
        });
        return types;
    }
    const abiCoder = new ABICoder();

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class ContractEntry {
        constructor(entry) {
            this.entry = entry;
        }
        get name() {
            return this.entry.name;
        }
        get anonymous() {
            return this.entry.anonymous || false;
        }
        asString() {
            return abiCoder.abiMethodToString(this.entry);
        }
    }

    class ContractFunctionEntry extends ContractEntry {
        constructor(entry) {
            entry.inputs = entry.inputs || [];
            super(entry);
            this.signature =
                entry.type === 'constructor'
                    ? 'constructor'
                    : abiCoder.encodeFunctionSignature(abiCoder.abiMethodToString(entry));
        }
        get constant() {
            return this.entry.stateMutability === 'view' || this.entry.stateMutability === 'pure' || this.entry.constant;
        }
        get payable() {
            return this.entry.stateMutability === 'payable' || this.entry.payable;
        }
        numArgs() {
            return this.entry.inputs ? this.entry.inputs.length : 0;
        }
        decodeReturnValue(returnValue) {
            if (!returnValue) {
                return null;
            }
            const result = abiCoder.decodeParameters(this.entry.outputs, returnValue);
            if (result.__length__ === 1) {
                return result[0];
            }
            else {
                delete result.__length__;
                return result;
            }
        }
        encodeABI(args) {
            return Buffer.concat([hexToBuffer(this.signature), this.encodeParameters(args)]);
        }
        encodeParameters(args) {
            return hexToBuffer(abiCoder.encodeParameters(this.entry.inputs, args));
        }
        decodeParameters(bytes) {
            return abiCoder.decodeParameters(this.entry.inputs, bufferToHex(bytes));
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class ContractEventEntry extends ContractEntry {
        constructor(entry) {
            super(entry);
            this.signature = abiCoder.encodeEventSignature(abiCoder.abiMethodToString(entry));
        }
        getEventTopics(filter = {}) {
            const topics = [];
            if (!this.entry.anonymous && this.signature) {
                topics.push(this.signature);
            }
            const indexedTopics = (this.entry.inputs || [])
                .filter(input => input.indexed === true)
                .map(input => {
                const value = filter[input.name];
                if (!value) {
                    return null;
                }
                // TODO: https://github.com/ethereum/web3.js/issues/344
                // TODO: deal properly with components
                if (isArray$1(value)) {
                    return value.map(v => abiCoder.encodeParameter(input.type, v));
                }
                else {
                    return abiCoder.encodeParameter(input.type, value);
                }
            });
            return [...topics, ...indexedTopics];
        }
        decodeEvent(log) {
            const { data = '', topics = [], ...formattedLog } = log;
            const { anonymous, inputs = [], name = '' } = this.entry;
            const argTopics = anonymous ? topics : topics.slice(1);
            const returnValues = abiCoder.decodeLog(inputs, data, argTopics);
            delete returnValues.__length__;
            return {
                ...formattedLog,
                event: name,
                returnValues,
                signature: anonymous || !topics[0] ? null : topics[0],
                raw: {
                    data,
                    topics,
                },
            };
        }
    }

    /*
      This file is part of web3x.

      web3x is free software: you can redistribute it and/or modify
      it under the terms of the GNU Lesser General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      web3x is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Lesser General Public License for more details.

      You should have received a copy of the GNU Lesser General Public License
      along with web3x.  If not, see <http://www.gnu.org/licenses/>.
    */
    class ContractAbi {
        constructor(definition) {
            this.functions = definition.filter(e => e.type === 'function').map(entry => new ContractFunctionEntry(entry));
            this.events = definition.filter(e => e.type === 'event').map(entry => new ContractEventEntry(entry));
            const ctor = definition.find(e => e.type === 'constructor');
            this.ctor = new ContractFunctionEntry(ctor || { type: 'constructor' });
            const fallback = definition.find(e => e.type === 'fallback');
            if (fallback) {
                this.fallback = new ContractFunctionEntry(fallback);
            }
        }
        findEntryForLog(log) {
            return this.events.find(abiDef => abiDef.signature === log.topics[0]);
        }
        decodeEvent(log) {
            const event = this.findEntryForLog(log);
            if (!event) {
                throw new Error(`Unable to find matching event signature for log: ${log.id}`);
            }
            return event.decodeEvent(log);
        }
        decodeFunctionData(data) {
            const funcSig = bufferToHex(data.slice(0, 4));
            const func = this.functions.find(f => f.signature === funcSig);
            return func ? func.decodeParameters(data.slice(4)) : undefined;
        }
    }

    const commit = "528425775d9b72a63bf96b8c574c175c45c1efaa";

    const addresses = {
      "1": {
        BancorConverterRegistry: "0x0DDFF327ddF7fE838e3e63d02001ef23ad1EdE8e"
      }
    };

    const abis = {};

    const Contract$1 = async (eth, name, address) => {
      if (!abis[name]) {
        const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.abi`;

        abis[name] = await safeFetch(url).then(abi => new ContractAbi(abi));
      }

      return new Contract(eth, abis[name], address, {});
    };

    const registry = writable(undefined);
    const numberOfTokens = writable(0);
    const tokens = writable(new Map());

    const getTokenData = async (eth, address) => {
      const token = await Contract$1(eth, "ERC20Token", address);

      const [name, symbol] = await Promise.all([
        token.methods.name().call(),
        token.methods.symbol().call()
      ]);

      const img = await safeFetch(
        `https://api.bancor.network/0.1/currencies/${symbol}`
      ).then(res => {
        const imgFile = res.data.primaryCommunityImageName || "";
        const [name, ext] = imgFile.split(".");

        return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
      });

      return {
        address,
        name,
        symbol,
        img
      };
    };

    const init$3 = async eth => {
      const name = "BancorConverterRegistry";
      const address = addresses["1"][name];

      const _registry = await Contract$1(eth, name, address);
      registry.update(() => _registry);

      const _numberOfTokens = await _registry.methods.tokenCount().call();
      numberOfTokens.update(() => _numberOfTokens);

      let i = Number(_numberOfTokens);
      while (--i >= 0) {
        const address = await _registry.methods
          .tokens(i)
          .call()
          .then(res => bufferToHex(res.buffer));

        const data = await getTokenData(eth, address);

        tokens.update(v => {
          v.set(address, data);

          return v;
        });
      }
    };

    const toItems = tokens => {
      return Array.from(tokens.values()).map(token => ({
        value: token.address,
        label: token.name
      }));
    };

    const derivedPluck = (tokens, token) => {
      return derived([tokens, token], ([tokens, token]) => {
        if (token) {
          tokens.delete(token.address);
        }

        return toItems(tokens);
      });
    };

    const tokenA = writable(undefined);
    const tokenB = writable(undefined);
    const tokensA = derivedPluck(tokens, tokenB);
    const tokensB = derivedPluck(tokens, tokenA);

    const Required = name => {
      throw new Error(`prop ${name} not provided`);
    };

    /* src/components/Icon.svelte generated by Svelte v3.6.10 */

    const file$2 = "src/components/Icon.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = 'svelte-1aj6ok5-style';
    	style.textContent = ".vertical.svelte-1aj6ok5{transform:rotate(-90deg);margin-left:100px}div.svelte-1aj6ok5:hover{opacity:0.7 !important}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNvbi5zdmVsdGUiLCJzb3VyY2VzIjpbIkljb24uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciB9IGZyb20gXCJzdmVsdGVcIjtcbiAgaW1wb3J0IFJlcXVpcmVkIGZyb20gXCIuLi91dGlscy9SZXF1aXJlZFwiO1xuXG4gIGV4cG9ydCBsZXQgY29sb3IgPSBSZXF1aXJlZChcImNvbG9yXCIpO1xuICBleHBvcnQgbGV0IG9yaWVudGF0aW9uID0gUmVxdWlyZWQoXCJvcmllbnRhdGlvblwiKTtcbiAgZXhwb3J0IGxldCBzaXplID0gXCI0MHB4XCI7XG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcblxuICBjb25zdCBpY29uU3R5bGUgPSBgXG4gICAgd2lkdGg6ICR7c2l6ZX07XG4gICAgaGVpZ2h0OiAke3NpemV9O1xuICAgIGNvbG9yOiAke2NvbG9yfTtcbiAgICBjdXJzb3I6ICR7ZGlzYWJsZWQgPyBcImRlZmF1bHRcIiA6IFwicG9pbnRlclwifTtcbiAgYDtcblxuICBjb25zdCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuXG4gIGNvbnN0IG9uQ2xpY2sgPSBlID0+IHtcbiAgICBpZiAoZGlzYWJsZWQpIHJldHVybjtcblxuICAgIGRpc3BhdGNoKFwiY2xpY2tcIiwgZSk7XG4gIH07XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAudmVydGljYWwge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKC05MGRlZyk7XG4gICAgbWFyZ2luLWxlZnQ6IDEwMHB4O1xuICB9XG4gIGRpdjpob3ZlciB7XG4gICAgb3BhY2l0eTogMC43ICFpbXBvcnRhbnQ7XG4gIH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9e29yaWVudGF0aW9ufSBzdHlsZT17aWNvblN0eWxlfSBvbjpjbGljaz17b25DbGlja30+XG4gIDxzbG90IC8+XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEwQkUsU0FBUyxlQUFDLENBQUMsQUFDVCxTQUFTLENBQUUsT0FBTyxNQUFNLENBQUMsQ0FDekIsV0FBVyxDQUFFLEtBQUssQUFDcEIsQ0FBQyxBQUNELGtCQUFHLE1BQU0sQUFBQyxDQUFDLEFBQ1QsT0FBTyxDQUFFLEdBQUcsQ0FBQyxVQUFVLEFBQ3pCLENBQUMifQ== */";
    	append(document.head, style);
    }

    function create_fragment$2(ctx) {
    	var div, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", "" + ctx.orientation + " svelte-1aj6ok5");
    			attr(div, "style", ctx.iconStyle);
    			add_location(div, file$2, 35, 0, 672);
    			dispose = listen(div, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.orientation) {
    				attr(div, "class", "" + ctx.orientation + " svelte-1aj6ok5");
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
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let { color = Required("color"), orientation = Required("orientation"), size = "40px", disabled = false } = $$props;

      const iconStyle = `
    width: ${size};
    height: ${size};
    color: ${color};
    cursor: ${disabled ? "default" : "pointer"};
  `;

      const dispatch = createEventDispatcher();

      const onClick = e => {
        if (disabled) return;

        dispatch("click", e);
      };

    	const writable_props = ['color', 'orientation', 'size', 'disabled'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('orientation' in $$props) $$invalidate('orientation', orientation = $$props.orientation);
    		if ('size' in $$props) $$invalidate('size', size = $$props.size);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		color,
    		orientation,
    		size,
    		disabled,
    		iconStyle,
    		onClick,
    		$$slots,
    		$$scope
    	};
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1aj6ok5-style")) add_css$1();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["color", "orientation", "size", "disabled"]);
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get orientation() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orientation(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Button.svelte generated by Svelte v3.6.10 */

    const file$3 = "src/components/Button.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = 'svelte-kkctia-style';
    	style.textContent = "div.svelte-kkctia{display:flex;justify-content:center;align-items:center;width:90px;height:33px;font-size:1em;border-radius:20px;padding-top:1px;box-shadow:0px 2px 4px rgba(0, 0, 0, 0.25)}div.svelte-kkctia:hover{opacity:0.8 !important}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQnV0dG9uLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxyXG4gIGltcG9ydCB7IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciB9IGZyb20gXCJzdmVsdGVcIjtcclxuICBpbXBvcnQgUmVxdWlyZWQgZnJvbSBcIi4uL3V0aWxzL1JlcXVpcmVkXCI7XHJcblxyXG4gIGV4cG9ydCBsZXQgYmdDb2xvciA9IFJlcXVpcmVkKFwiYmdDb2xvclwiKTtcclxuICBleHBvcnQgbGV0IGZvbnRDb2xvciA9IFJlcXVpcmVkKFwiZm9udENvbG9yXCIpO1xyXG4gIGV4cG9ydCBsZXQgYm9yZGVyQ29sb3IgPSBSZXF1aXJlZChcImJvcmRlckNvbG9yXCIpO1xyXG4gIGV4cG9ydCBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgYnV0dG9uU3R5bGUgPSBgXHJcbiAgICBjb2xvcjogJHtmb250Q29sb3J9O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtiZ0NvbG9yfTtcclxuICAgIG9wYWNpdHk6ICR7ZGlzYWJsZWQgPyAwLjc1IDogMX07XHJcbiAgICBib3JkZXI6ICR7Ym9yZGVyQ29sb3J9IHNvbGlkIDFweDtcclxuICAgIGN1cnNvcjogJHtkaXNhYmxlZCA/IFwiZGVmYXVsdFwiIDogXCJwb2ludGVyXCJ9O1xyXG4gIGA7XHJcblxyXG4gIGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XHJcblxyXG4gIGNvbnN0IG9uQ2xpY2sgPSBlID0+IHtcclxuICAgIGlmIChkaXNhYmxlZCkgcmV0dXJuO1xyXG5cclxuICAgIGRpc3BhdGNoKFwiY2xpY2tcIiwgZSk7XHJcbiAgfTtcclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGU+XHJcbiAgZGl2IHtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICB3aWR0aDogOTBweDtcclxuICAgIGhlaWdodDogMzNweDtcclxuICAgIGZvbnQtc2l6ZTogMWVtO1xyXG4gICAgYm9yZGVyLXJhZGl1czogMjBweDtcclxuICAgIHBhZGRpbmctdG9wOiAxcHg7XHJcbiAgICBib3gtc2hhZG93OiAwcHggMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xyXG4gIH1cclxuICBkaXY6aG92ZXIge1xyXG4gICAgb3BhY2l0eTogMC44ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG48L3N0eWxlPlxyXG5cclxuPGRpdiBvbjpjbGljaz17b25DbGlja30gc3R5bGU9e2J1dHRvblN0eWxlfT5cclxuICA8c2xvdCAvPlxyXG48L2Rpdj5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJCRSxHQUFHLGNBQUMsQ0FBQyxBQUNILE9BQU8sQ0FBRSxJQUFJLENBQ2IsZUFBZSxDQUFFLE1BQU0sQ0FDdkIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsS0FBSyxDQUFFLElBQUksQ0FDWCxNQUFNLENBQUUsSUFBSSxDQUNaLFNBQVMsQ0FBRSxHQUFHLENBQ2QsYUFBYSxDQUFFLElBQUksQ0FDbkIsV0FBVyxDQUFFLEdBQUcsQ0FDaEIsVUFBVSxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEFBQzdDLENBQUMsQUFDRCxpQkFBRyxNQUFNLEFBQUMsQ0FBQyxBQUNULE9BQU8sQ0FBRSxHQUFHLENBQUMsVUFBVSxBQUN6QixDQUFDIn0= */";
    	append(document.head, style);
    }

    function create_fragment$3(ctx) {
    	var div, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "style", ctx.buttonStyle);
    			attr(div, "class", "svelte-kkctia");
    			add_location(div, file$3, 43, 0, 976);
    			dispose = listen(div, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
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
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { bgColor = Required("bgColor"), fontColor = Required("fontColor"), borderColor = Required("borderColor"), disabled = false } = $$props;

      const buttonStyle = `
    color: ${fontColor};
    background-color: ${bgColor};
    opacity: ${disabled ? 0.75 : 1};
    border: ${borderColor} solid 1px;
    cursor: ${disabled ? "default" : "pointer"};
  `;

      const dispatch = createEventDispatcher();

      const onClick = e => {
        if (disabled) return;

        dispatch("click", e);
      };

    	const writable_props = ['bgColor', 'fontColor', 'borderColor', 'disabled'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('fontColor' in $$props) $$invalidate('fontColor', fontColor = $$props.fontColor);
    		if ('borderColor' in $$props) $$invalidate('borderColor', borderColor = $$props.borderColor);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		bgColor,
    		fontColor,
    		borderColor,
    		disabled,
    		buttonStyle,
    		onClick,
    		$$slots,
    		$$scope
    	};
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-kkctia-style")) add_css$2();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["bgColor", "fontColor", "borderColor", "disabled"]);
    	}

    	get bgColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Label.svelte generated by Svelte v3.6.10 */

    const file$4 = "src/components/Label.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = 'svelte-1ju4qdw-style';
    	style.textContent = ".container.svelte-1ju4qdw{display:flex;align-items:center;justify-content:space-between}.horizontal.svelte-1ju4qdw{flex-direction:column;padding-bottom:18px}.vertical.svelte-1ju4qdw{flex-direction:row;width:100%;text-align:center;justify-content:flex-start}.vertical.svelte-1ju4qdw>span.svelte-1ju4qdw{width:140px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFiZWwuc3ZlbHRlIiwic291cmNlcyI6WyJMYWJlbC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBpbXBvcnQgUmVxdWlyZWQgZnJvbSBcIi4uL3V0aWxzL1JlcXVpcmVkXCI7XHJcblxyXG4gIGV4cG9ydCBsZXQgb3JpZW50YXRpb24gPSBSZXF1aXJlZChcIm9yaWVudGF0aW9uXCIpO1xyXG4gIGV4cG9ydCBsZXQgY29sb3IgPSBSZXF1aXJlZChcImNvbG9yXCIpO1xyXG4gIGV4cG9ydCBsZXQgdGV4dCA9IFwiXCI7XHJcbjwvc2NyaXB0PlxyXG5cclxuPHN0eWxlPlxyXG4gIC5jb250YWluZXIge1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XHJcbiAgfVxyXG5cclxuICAuaG9yaXpvbnRhbCB7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgcGFkZGluZy1ib3R0b206IDE4cHg7XHJcbiAgfVxyXG5cclxuICAudmVydGljYWwge1xyXG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xyXG4gIH1cclxuXHJcbiAgLnZlcnRpY2FsID4gc3BhbiB7XHJcbiAgICB3aWR0aDogMTQwcHg7XHJcbiAgfVxyXG48L3N0eWxlPlxyXG5cclxuPGRpdiBjbGFzcz1cImNvbnRhaW5lciB7b3JpZW50YXRpb259XCI+XHJcbiAgeyNpZiB0ZXh0fVxyXG4gICAgPHNwYW4gc3R5bGU9XCJjb2xvcjoge2NvbG9yfTtcIj57dGV4dH08L3NwYW4+XHJcbiAgey9pZn1cclxuICA8c2xvdCAvPlxyXG48L2Rpdj5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNFLFVBQVUsZUFBQyxDQUFDLEFBQ1YsT0FBTyxDQUFFLElBQUksQ0FDYixXQUFXLENBQUUsTUFBTSxDQUNuQixlQUFlLENBQUUsYUFBYSxBQUNoQyxDQUFDLEFBRUQsV0FBVyxlQUFDLENBQUMsQUFDWCxjQUFjLENBQUUsTUFBTSxDQUN0QixjQUFjLENBQUUsSUFBSSxBQUN0QixDQUFDLEFBRUQsU0FBUyxlQUFDLENBQUMsQUFDVCxjQUFjLENBQUUsR0FBRyxDQUNuQixLQUFLLENBQUUsSUFBSSxDQUNYLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLGVBQWUsQ0FBRSxVQUFVLEFBQzdCLENBQUMsQUFFRCx3QkFBUyxDQUFHLElBQUksZUFBQyxDQUFDLEFBQ2hCLEtBQUssQ0FBRSxLQUFLLEFBQ2QsQ0FBQyJ9 */";
    	append(document.head, style);
    }

    // (34:2) {#if text}
    function create_if_block$1(ctx) {
    	var span, t;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.text);
    			set_style(span, "color", ctx.color);
    			attr(span, "class", "svelte-1ju4qdw");
    			add_location(span, file$4, 34, 4, 624);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.text) {
    				set_data(t, ctx.text);
    			}

    			if (changed.color) {
    				set_style(span, "color", ctx.color);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div, t, div_class_value, current;

    	var if_block = (ctx.text) && create_if_block$1(ctx);

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			if (default_slot) default_slot.c();

    			attr(div, "class", div_class_value = "container " + ctx.orientation + " svelte-1ju4qdw");
    			add_location(div, file$4, 32, 0, 567);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.text) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.orientation) && div_class_value !== (div_class_value = "container " + ctx.orientation + " svelte-1ju4qdw")) {
    				attr(div, "class", div_class_value);
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
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { orientation = Required("orientation"), color = Required("color"), text = "" } = $$props;

    	const writable_props = ['orientation', 'color', 'text'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('orientation' in $$props) $$invalidate('orientation', orientation = $$props.orientation);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		orientation,
    		color,
    		text,
    		$$slots,
    		$$scope
    	};
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1ju4qdw-style")) add_css$3();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["orientation", "color", "text"]);
    	}

    	get orientation() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orientation(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/NumberInput.svelte generated by Svelte v3.6.10 */

    const file$5 = "src/components/NumberInput.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = 'svelte-ormhbi-style';
    	style.textContent = "input.svelte-ormhbi{height:41px;width:175px;border:none;border-radius:5px;margin:0;outline:none;background-color:transparent;text-align:center}input[type=\"number\"].svelte-ormhbi::-webkit-inner-spin-button,input[type=\"number\"].svelte-ormhbi::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.container.svelte-ormhbi{display:flex;align-items:center;justify-content:space-between;flex-direction:row;height:45px;width:270px;border-radius:5px;box-shadow:0px 2px 4px rgba(0, 0, 0, 0.25)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTnVtYmVySW5wdXQuc3ZlbHRlIiwic291cmNlcyI6WyJOdW1iZXJJbnB1dC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cclxuICBpbXBvcnQgUmVxdWlyZWQgZnJvbSBcIi4uL3V0aWxzL1JlcXVpcmVkXCI7XHJcblxyXG4gIGV4cG9ydCBsZXQgYmdDb2xvciA9IFJlcXVpcmVkKFwiYmdDb2xvclwiKTtcclxuICBleHBvcnQgbGV0IGZvbnRDb2xvciA9IFJlcXVpcmVkKFwiZm9udENvbG9yXCIpO1xyXG4gIGV4cG9ydCBsZXQgYm9yZGVyQ29sb3IgPSBSZXF1aXJlZChcImJvcmRlckNvbG9yXCIpO1xyXG4gIGV4cG9ydCBsZXQgdmFsdWUgPSAwO1xyXG5cclxuICBjb25zdCBjb250YWluZXJTdHlsZSA9IGBcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICR7YmdDb2xvcn07XHJcbiAgICBib3JkZXI6ICR7Ym9yZGVyQ29sb3J9IHNvbGlkIDFweDtcclxuICBgO1xyXG5cclxuICBjb25zdCBpbnB1dFN0eWxlID0gYGNvbG9yOiAke2ZvbnRDb2xvcn07YDtcclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGU+XHJcbiAgaW5wdXQge1xyXG4gICAgaGVpZ2h0OiA0MXB4O1xyXG4gICAgd2lkdGg6IDE3NXB4O1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xyXG4gICAgbWFyZ2luOiAwO1xyXG4gICAgb3V0bGluZTogbm9uZTtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gIH1cclxuICBpbnB1dFt0eXBlPVwibnVtYmVyXCJdOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxyXG4gIGlucHV0W3R5cGU9XCJudW1iZXJcIl06Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xyXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xyXG4gICAgbWFyZ2luOiAwO1xyXG4gIH1cclxuXHJcbiAgLmNvbnRhaW5lciB7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XHJcbiAgICBoZWlnaHQ6IDQ1cHg7XHJcbiAgICB3aWR0aDogMjcwcHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XHJcbiAgICBib3gtc2hhZG93OiAwcHggMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xyXG4gIH1cclxuPC9zdHlsZT5cclxuXHJcbjxkaXYgY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxyXG4gIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgc3R5bGU9e2lucHV0U3R5bGV9IG1pbj1cIjBcIiBiaW5kOnZhbHVlIG9uOmNoYW5nZSAvPlxyXG4gIDxzbG90IC8+XHJcbjwvZGl2PlxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJFLEtBQUssY0FBQyxDQUFDLEFBQ0wsTUFBTSxDQUFFLElBQUksQ0FDWixLQUFLLENBQUUsS0FBSyxDQUNaLE1BQU0sQ0FBRSxJQUFJLENBQ1osYUFBYSxDQUFFLEdBQUcsQ0FDbEIsTUFBTSxDQUFFLENBQUMsQ0FDVCxPQUFPLENBQUUsSUFBSSxDQUNiLGdCQUFnQixDQUFFLFdBQVcsQ0FDN0IsVUFBVSxDQUFFLE1BQU0sQUFDcEIsQ0FBQyxBQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxlQUFDLDJCQUEyQixDQUMvQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsZUFBQywyQkFBMkIsQUFBQyxDQUFDLEFBQy9DLGtCQUFrQixDQUFFLElBQUksQ0FDeEIsTUFBTSxDQUFFLENBQUMsQUFDWCxDQUFDLEFBRUQsVUFBVSxjQUFDLENBQUMsQUFDVixPQUFPLENBQUUsSUFBSSxDQUNiLFdBQVcsQ0FBRSxNQUFNLENBQ25CLGVBQWUsQ0FBRSxhQUFhLENBQzlCLGNBQWMsQ0FBRSxHQUFHLENBQ25CLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLEtBQUssQ0FDWixhQUFhLENBQUUsR0FBRyxDQUNsQixVQUFVLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQUFDN0MsQ0FBQyJ9 */";
    	append(document.head, style);
    }

    function create_fragment$5(ctx) {
    	var div, input, t, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();

    			if (default_slot) default_slot.c();
    			attr(input, "type", "number");
    			attr(input, "style", ctx.inputStyle);
    			attr(input, "min", "0");
    			attr(input, "class", "svelte-ormhbi");
    			add_location(input, file$5, 46, 2, 1068);

    			attr(div, "class", "container svelte-ormhbi");
    			attr(div, "style", ctx.containerStyle);
    			add_location(div, file$5, 45, 0, 1018);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "change", ctx.change_handler)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			input.value = ctx.value;

    			append(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) input.value = ctx.value;

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
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
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { bgColor = Required("bgColor"), fontColor = Required("fontColor"), borderColor = Required("borderColor"), value = 0 } = $$props;

      const containerStyle = `
    background-color: ${bgColor};
    border: ${borderColor} solid 1px;
  `;

      const inputStyle = `color: ${fontColor};`;

    	const writable_props = ['bgColor', 'fontColor', 'borderColor', 'value'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NumberInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$props => {
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('fontColor' in $$props) $$invalidate('fontColor', fontColor = $$props.fontColor);
    		if ('borderColor' in $$props) $$invalidate('borderColor', borderColor = $$props.borderColor);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		bgColor,
    		fontColor,
    		borderColor,
    		value,
    		containerStyle,
    		inputStyle,
    		change_handler,
    		input_input_handler,
    		$$slots,
    		$$scope
    	};
    }

    class NumberInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-ormhbi-style")) add_css$4();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["bgColor", "fontColor", "borderColor", "value"]);
    	}

    	get bgColor() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontColor() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontColor(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.6.10 */

    const file$6 = "node_modules/svelte-select/src/Item.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = 'svelte-1xfc328-style';
    	style.textContent = ".item.svelte-1xfc328{cursor:default;height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--itemPadding, 0 20px);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.groupHeader.svelte-1xfc328{text-transform:var(--groupTitleTextTransform, uppercase)}.groupItem.svelte-1xfc328{padding-left:40px}.item.svelte-1xfc328:active{background:var(--itemActiveBackground, #b9daff)}.item.active.svelte-1xfc328{background:var(--itemIsActiveBG, #007aff);color:var(--itemIsActiveColor, #fff)}.item.first.svelte-1xfc328{border-radius:var(--itemFirstBorderRadius, 4px 4px 0 0)}.item.hover.svelte-1xfc328:not(.active){background:var(--itemHoverBG, #e7f2ff)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5zdmVsdGUiLCJzb3VyY2VzIjpbIkl0ZW0uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgaXNBY3RpdmUgPSBmYWxzZTtcbiAgZXhwb3J0IGxldCBpc0ZpcnN0ID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgaXNIb3ZlciA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGdldE9wdGlvbkxhYmVsID0gdW5kZWZpbmVkO1xuICBleHBvcnQgbGV0IGl0ZW0gPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgZmlsdGVyVGV4dCA9ICcnO1xuXG4gIGxldCBpdGVtQ2xhc3NlcyA9ICcnO1xuXG4gICQ6IHtcbiAgICBjb25zdCBjbGFzc2VzID0gW107XG4gICAgaWYgKGlzQWN0aXZlKSB7IGNsYXNzZXMucHVzaCgnYWN0aXZlJyk7IH1cbiAgICBpZiAoaXNGaXJzdCkgeyBjbGFzc2VzLnB1c2goJ2ZpcnN0Jyk7IH1cbiAgICBpZiAoaXNIb3ZlcikgeyBjbGFzc2VzLnB1c2goJ2hvdmVyJyk7IH1cbiAgICBpZiAoaXRlbS5pc0dyb3VwSGVhZGVyKSB7IGNsYXNzZXMucHVzaCgnZ3JvdXBIZWFkZXInKTsgfVxuICAgIGlmIChpdGVtLmlzR3JvdXBJdGVtKSB7IGNsYXNzZXMucHVzaCgnZ3JvdXBJdGVtJyk7IH1cbiAgICBpdGVtQ2xhc3NlcyA9IGNsYXNzZXMuam9pbignICcpO1xuICB9XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAuaXRlbSB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIGhlaWdodDogdmFyKC0taGVpZ2h0LCA0MnB4KTtcbiAgICBsaW5lLWhlaWdodDogdmFyKC0taGVpZ2h0LCA0MnB4KTtcbiAgICBwYWRkaW5nOiB2YXIoLS1pdGVtUGFkZGluZywgMCAyMHB4KTtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIH1cblxuICAuZ3JvdXBIZWFkZXIge1xuICAgIHRleHQtdHJhbnNmb3JtOiB2YXIoLS1ncm91cFRpdGxlVGV4dFRyYW5zZm9ybSwgdXBwZXJjYXNlKTtcbiAgfVxuXG4gIC5ncm91cEl0ZW0ge1xuICAgIHBhZGRpbmctbGVmdDogNDBweDtcbiAgfVxuXG4gIC5pdGVtOmFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taXRlbUFjdGl2ZUJhY2tncm91bmQsICNiOWRhZmYpO1xuICB9XG5cbiAgLml0ZW0uYWN0aXZlIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1pdGVtSXNBY3RpdmVCRywgIzAwN2FmZik7XG4gICAgY29sb3I6IHZhcigtLWl0ZW1Jc0FjdGl2ZUNvbG9yLCAjZmZmKTtcbiAgfVxuXG4gIC5pdGVtLmZpcnN0IHtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1pdGVtRmlyc3RCb3JkZXJSYWRpdXMsIDRweCA0cHggMCAwKTtcbiAgfVxuXG4gIC5pdGVtLmhvdmVyOm5vdCguYWN0aXZlKSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taXRlbUhvdmVyQkcsICNlN2YyZmYpO1xuICB9XG48L3N0eWxlPlxuXG5cblxuPGRpdiBjbGFzcz1cIml0ZW0ge2l0ZW1DbGFzc2VzfVwiPlxuICB7QGh0bWwgZ2V0T3B0aW9uTGFiZWwoaXRlbSwgZmlsdGVyVGV4dCl9XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFzQkUsS0FBSyxlQUFDLENBQUMsQUFDTCxNQUFNLENBQUUsT0FBTyxDQUNmLE1BQU0sQ0FBRSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDM0IsV0FBVyxDQUFFLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUNoQyxPQUFPLENBQUUsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQ25DLGFBQWEsQ0FBRSxRQUFRLENBQ3ZCLFFBQVEsQ0FBRSxNQUFNLENBQ2hCLFdBQVcsQ0FBRSxNQUFNLEFBQ3JCLENBQUMsQUFFRCxZQUFZLGVBQUMsQ0FBQyxBQUNaLGNBQWMsQ0FBRSxJQUFJLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxBQUMzRCxDQUFDLEFBRUQsVUFBVSxlQUFDLENBQUMsQUFDVixZQUFZLENBQUUsSUFBSSxBQUNwQixDQUFDLEFBRUQsb0JBQUssT0FBTyxBQUFDLENBQUMsQUFDWixVQUFVLENBQUUsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQUFDbEQsQ0FBQyxBQUVELEtBQUssT0FBTyxlQUFDLENBQUMsQUFDWixVQUFVLENBQUUsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FDMUMsS0FBSyxDQUFFLElBQUksbUJBQW1CLENBQUMsS0FBSyxDQUFDLEFBQ3ZDLENBQUMsQUFFRCxLQUFLLE1BQU0sZUFBQyxDQUFDLEFBQ1gsYUFBYSxDQUFFLElBQUksdUJBQXVCLENBQUMsWUFBWSxDQUFDLEFBQzFELENBQUMsQUFFRCxLQUFLLHFCQUFNLEtBQUssT0FBTyxDQUFDLEFBQUMsQ0FBQyxBQUN4QixVQUFVLENBQUUsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLEFBQ3pDLENBQUMifQ== */";
    	append(document.head, style);
    }

    function create_fragment$6(ctx) {
    	var div, raw_value = ctx.getOptionLabel(ctx.item, ctx.filterText), div_class_value;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", div_class_value = "item " + ctx.itemClasses + " svelte-1xfc328");
    			add_location(div, file$6, 60, 0, 1286);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.getOptionLabel || changed.item || changed.filterText) && raw_value !== (raw_value = ctx.getOptionLabel(ctx.item, ctx.filterText))) {
    				div.innerHTML = raw_value;
    			}

    			if ((changed.itemClasses) && div_class_value !== (div_class_value = "item " + ctx.itemClasses + " svelte-1xfc328")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { isActive = false, isFirst = false, isHover = false, getOptionLabel = undefined, item = undefined, filterText = '' } = $$props;

      let itemClasses = '';

    	const writable_props = ['isActive', 'isFirst', 'isHover', 'getOptionLabel', 'item', 'filterText'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('isActive' in $$props) $$invalidate('isActive', isActive = $$props.isActive);
    		if ('isFirst' in $$props) $$invalidate('isFirst', isFirst = $$props.isFirst);
    		if ('isHover' in $$props) $$invalidate('isHover', isHover = $$props.isHover);
    		if ('getOptionLabel' in $$props) $$invalidate('getOptionLabel', getOptionLabel = $$props.getOptionLabel);
    		if ('item' in $$props) $$invalidate('item', item = $$props.item);
    		if ('filterText' in $$props) $$invalidate('filterText', filterText = $$props.filterText);
    	};

    	$$self.$$.update = ($$dirty = { isActive: 1, isFirst: 1, isHover: 1, item: 1 }) => {
    		if ($$dirty.isActive || $$dirty.isFirst || $$dirty.isHover || $$dirty.item) { {
            const classes = [];
            if (isActive) { classes.push('active'); }
            if (isFirst) { classes.push('first'); }
            if (isHover) { classes.push('hover'); }
            if (item.isGroupHeader) { classes.push('groupHeader'); }
            if (item.isGroupItem) { classes.push('groupItem'); }
            $$invalidate('itemClasses', itemClasses = classes.join(' '));
          } }
    	};

    	return {
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	};
    }

    class Item$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1xfc328-style")) add_css$5();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"]);
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

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.6.10 */

    const file$7 = "node_modules/svelte-select/src/VirtualList.svelte";

    function add_css$6() {
    	var style = element("style");
    	style.id = 'svelte-p6ehlv-style';
    	style.textContent = "svelte-virtual-list-viewport.svelte-p6ehlv{position:relative;overflow-y:auto;-webkit-overflow-scrolling:touch;display:block}svelte-virtual-list-contents.svelte-p6ehlv,svelte-virtual-list-row.svelte-p6ehlv{display:block}svelte-virtual-list-row.svelte-p6ehlv{overflow:hidden}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlydHVhbExpc3Quc3ZlbHRlIiwic291cmNlcyI6WyJWaXJ0dWFsTGlzdC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblx0aW1wb3J0IHsgb25Nb3VudCwgdGljayB9IGZyb20gJ3N2ZWx0ZSc7XG5cblx0Ly8gcHJvcHNcblx0ZXhwb3J0IGxldCBpdGVtcyA9IHVuZGVmaW5lZDtcblx0ZXhwb3J0IGxldCBoZWlnaHQgPSAnMTAwJSc7XG5cdGV4cG9ydCBsZXQgaXRlbUhlaWdodCA9IDQwO1xuXHRleHBvcnQgbGV0IGhvdmVySXRlbUluZGV4ID0gMDtcblxuXHQvLyByZWFkLW9ubHksIGJ1dCB2aXNpYmxlIHRvIGNvbnN1bWVycyB2aWEgYmluZDpzdGFydFxuXHRleHBvcnQgbGV0IHN0YXJ0ID0gMDtcblx0ZXhwb3J0IGxldCBlbmQgPSAwO1xuXG5cdC8vIGxvY2FsIHN0YXRlXG5cdGxldCBoZWlnaHRfbWFwID0gW107XG5cdGxldCByb3dzO1xuXHRsZXQgdmlld3BvcnQ7XG5cdGxldCBjb250ZW50cztcblx0bGV0IHZpZXdwb3J0X2hlaWdodCA9IDA7XG5cdGxldCB2aXNpYmxlO1xuXHRsZXQgbW91bnRlZDtcblxuXHRsZXQgdG9wID0gMDtcblx0bGV0IGJvdHRvbSA9IDA7XG5cdGxldCBhdmVyYWdlX2hlaWdodDtcblxuXHQkOiB2aXNpYmxlID0gaXRlbXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKChkYXRhLCBpKSA9PiB7XG5cdFx0cmV0dXJuIHsgaW5kZXg6IGkgKyBzdGFydCwgZGF0YSB9O1xuXHR9KTtcblxuXHQvLyB3aGVuZXZlciBgaXRlbXNgIGNoYW5nZXMsIGludmFsaWRhdGUgdGhlIGN1cnJlbnQgaGVpZ2h0bWFwXG5cdCQ6IGlmIChtb3VudGVkKSByZWZyZXNoKGl0ZW1zLCB2aWV3cG9ydF9oZWlnaHQsIGl0ZW1IZWlnaHQpO1xuXG5cdGFzeW5jIGZ1bmN0aW9uIHJlZnJlc2goaXRlbXMsIHZpZXdwb3J0X2hlaWdodCwgaXRlbUhlaWdodCkge1xuXHRcdGNvbnN0IHsgc2Nyb2xsVG9wIH0gPSB2aWV3cG9ydDtcblxuXHRcdGF3YWl0IHRpY2soKTsgLy8gd2FpdCB1bnRpbCB0aGUgRE9NIGlzIHVwIHRvIGRhdGVcblxuXHRcdGxldCBjb250ZW50X2hlaWdodCA9IHRvcCAtIHNjcm9sbFRvcDtcblx0XHRsZXQgaSA9IHN0YXJ0O1xuXG5cdFx0d2hpbGUgKGNvbnRlbnRfaGVpZ2h0IDwgdmlld3BvcnRfaGVpZ2h0ICYmIGkgPCBpdGVtcy5sZW5ndGgpIHtcblx0XHRcdGxldCByb3cgPSByb3dzW2kgLSBzdGFydF07XG5cblx0XHRcdGlmICghcm93KSB7XG5cdFx0XHRcdGVuZCA9IGkgKyAxO1xuXHRcdFx0XHRhd2FpdCB0aWNrKCk7IC8vIHJlbmRlciB0aGUgbmV3bHkgdmlzaWJsZSByb3dcblx0XHRcdFx0cm93ID0gcm93c1tpIC0gc3RhcnRdO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCByb3dfaGVpZ2h0ID0gaGVpZ2h0X21hcFtpXSA9IGl0ZW1IZWlnaHQgfHwgcm93Lm9mZnNldEhlaWdodDtcblx0XHRcdGNvbnRlbnRfaGVpZ2h0ICs9IHJvd19oZWlnaHQ7XG5cdFx0XHRpICs9IDE7XG5cdFx0fVxuXG5cdFx0ZW5kID0gaTtcblxuXHRcdGNvbnN0IHJlbWFpbmluZyA9IGl0ZW1zLmxlbmd0aCAtIGVuZDtcblx0XHRhdmVyYWdlX2hlaWdodCA9ICh0b3AgKyBjb250ZW50X2hlaWdodCkgLyBlbmQ7XG5cblx0XHRib3R0b20gPSByZW1haW5pbmcgKiBhdmVyYWdlX2hlaWdodDtcblx0XHRoZWlnaHRfbWFwLmxlbmd0aCA9IGl0ZW1zLmxlbmd0aDtcblxuXHR9XG5cblx0YXN5bmMgZnVuY3Rpb24gaGFuZGxlX3Njcm9sbCgpIHtcblx0XHRjb25zdCB7IHNjcm9sbFRvcCB9ID0gdmlld3BvcnQ7XG5cblx0XHRjb25zdCBvbGRfc3RhcnQgPSBzdGFydDtcblxuXHRcdGZvciAobGV0IHYgPSAwOyB2IDwgcm93cy5sZW5ndGg7IHYgKz0gMSkge1xuXHRcdFx0aGVpZ2h0X21hcFtzdGFydCArIHZdID0gaXRlbUhlaWdodCB8fCByb3dzW3ZdLm9mZnNldEhlaWdodDtcblx0XHR9XG5cblx0XHRsZXQgaSA9IDA7XG5cdFx0bGV0IHkgPSAwO1xuXG5cdFx0d2hpbGUgKGkgPCBpdGVtcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHJvd19oZWlnaHQgPSBoZWlnaHRfbWFwW2ldIHx8IGF2ZXJhZ2VfaGVpZ2h0O1xuXHRcdFx0aWYgKHkgKyByb3dfaGVpZ2h0ID4gc2Nyb2xsVG9wKSB7XG5cdFx0XHRcdHN0YXJ0ID0gaTtcblx0XHRcdFx0dG9wID0geTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0eSArPSByb3dfaGVpZ2h0O1xuXHRcdFx0aSArPSAxO1xuXHRcdH1cblxuXHRcdHdoaWxlIChpIDwgaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHR5ICs9IGhlaWdodF9tYXBbaV0gfHwgYXZlcmFnZV9oZWlnaHQ7XG5cdFx0XHRpICs9IDE7XG5cblx0XHRcdGlmICh5ID4gc2Nyb2xsVG9wICsgdmlld3BvcnRfaGVpZ2h0KSBicmVhaztcblx0XHR9XG5cblx0XHRlbmQgPSBpO1xuXG5cdFx0Y29uc3QgcmVtYWluaW5nID0gaXRlbXMubGVuZ3RoIC0gZW5kO1xuXHRcdGF2ZXJhZ2VfaGVpZ2h0ID0geSAvIGVuZDtcblxuXHRcdHdoaWxlIChpIDwgaXRlbXMubGVuZ3RoKSBoZWlnaHRfbWFwW2krK10gPSBhdmVyYWdlX2hlaWdodDtcblx0XHRib3R0b20gPSByZW1haW5pbmcgKiBhdmVyYWdlX2hlaWdodDtcblxuXHRcdC8vIHByZXZlbnQganVtcGluZyBpZiB3ZSBzY3JvbGxlZCB1cCBpbnRvIHVua25vd24gdGVycml0b3J5XG5cdFx0aWYgKHN0YXJ0IDwgb2xkX3N0YXJ0KSB7XG5cdFx0XHRhd2FpdCB0aWNrKCk7XG5cblx0XHRcdGxldCBleHBlY3RlZF9oZWlnaHQgPSAwO1xuXHRcdFx0bGV0IGFjdHVhbF9oZWlnaHQgPSAwO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBvbGRfc3RhcnQ7IGkgKz0gMSkge1xuXHRcdFx0XHRpZiAocm93c1tpIC0gc3RhcnRdKSB7XG5cdFx0XHRcdFx0ZXhwZWN0ZWRfaGVpZ2h0ICs9IGhlaWdodF9tYXBbaV07XG5cdFx0XHRcdFx0YWN0dWFsX2hlaWdodCArPSBpdGVtSGVpZ2h0IHx8IHJvd3NbaSAtIHN0YXJ0XS5vZmZzZXRIZWlnaHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZCA9IGFjdHVhbF9oZWlnaHQgLSBleHBlY3RlZF9oZWlnaHQ7XG5cdFx0XHR2aWV3cG9ydC5zY3JvbGxUbygwLCBzY3JvbGxUb3AgKyBkKTtcblx0XHR9XG5cblx0XHQvLyBUT0RPIGlmIHdlIG92ZXJlc3RpbWF0ZWQgdGhlIHNwYWNlIHRoZXNlXG5cdFx0Ly8gcm93cyB3b3VsZCBvY2N1cHkgd2UgbWF5IG5lZWQgdG8gYWRkIHNvbWVcblx0XHQvLyBtb3JlLiBtYXliZSB3ZSBjYW4ganVzdCBjYWxsIGhhbmRsZV9zY3JvbGwgYWdhaW4/XG5cdH1cblxuXHQvLyB0cmlnZ2VyIGluaXRpYWwgcmVmcmVzaFxuXHRvbk1vdW50KCgpID0+IHtcblx0XHRyb3dzID0gY29udGVudHMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZWx0ZS12aXJ0dWFsLWxpc3Qtcm93Jyk7XG5cdFx0bW91bnRlZCA9IHRydWU7XG5cdH0pO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0c3ZlbHRlLXZpcnR1YWwtbGlzdC12aWV3cG9ydCB7XG5cdFx0cG9zaXRpb246IHJlbGF0aXZlO1xuXHRcdG92ZXJmbG93LXk6IGF1dG87XG5cdFx0LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuXHRcdGRpc3BsYXk6IGJsb2NrO1xuXHR9XG5cblx0c3ZlbHRlLXZpcnR1YWwtbGlzdC1jb250ZW50cyxcblx0c3ZlbHRlLXZpcnR1YWwtbGlzdC1yb3cge1xuXHRcdGRpc3BsYXk6IGJsb2NrO1xuXHR9XG5cblx0c3ZlbHRlLXZpcnR1YWwtbGlzdC1yb3cge1xuXHRcdG92ZXJmbG93OiBoaWRkZW47XG5cdH1cbjwvc3R5bGU+XG5cbjxzdmVsdGUtdmlydHVhbC1saXN0LXZpZXdwb3J0IGJpbmQ6dGhpcz17dmlld3BvcnR9IGJpbmQ6b2Zmc2V0SGVpZ2h0PXt2aWV3cG9ydF9oZWlnaHR9IG9uOnNjcm9sbD17aGFuZGxlX3Njcm9sbH1cblx0c3R5bGU9XCJoZWlnaHQ6IHtoZWlnaHR9O1wiPlxuXHQ8c3ZlbHRlLXZpcnR1YWwtbGlzdC1jb250ZW50cyBiaW5kOnRoaXM9e2NvbnRlbnRzfSBzdHlsZT1cInBhZGRpbmctdG9wOiB7dG9wfXB4OyBwYWRkaW5nLWJvdHRvbToge2JvdHRvbX1weDtcIj5cblx0XHR7I2VhY2ggdmlzaWJsZSBhcyByb3cgKHJvdy5pbmRleCl9XG5cdFx0XHQ8c3ZlbHRlLXZpcnR1YWwtbGlzdC1yb3c+XG5cdFx0XHRcdDxzbG90IGl0ZW09e3Jvdy5kYXRhfSBpPXtyb3cuaW5kZXh9IHtob3Zlckl0ZW1JbmRleH0+TWlzc2luZyB0ZW1wbGF0ZTwvc2xvdD5cblx0XHRcdDwvc3ZlbHRlLXZpcnR1YWwtbGlzdC1yb3c+XG5cdFx0ey9lYWNofVxuXHQ8L3N2ZWx0ZS12aXJ0dWFsLWxpc3QtY29udGVudHM+XG48L3N2ZWx0ZS12aXJ0dWFsLWxpc3Qtdmlld3BvcnQ+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXdJQyw0QkFBNEIsY0FBQyxDQUFDLEFBQzdCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLDBCQUEwQixDQUFFLEtBQUssQ0FDakMsT0FBTyxDQUFFLEtBQUssQUFDZixDQUFDLEFBRUQsMENBQTRCLENBQzVCLHVCQUF1QixjQUFDLENBQUMsQUFDeEIsT0FBTyxDQUFFLEtBQUssQUFDZixDQUFDLEFBRUQsdUJBQXVCLGNBQUMsQ0FBQyxBQUN4QixRQUFRLENBQUUsTUFBTSxBQUNqQixDQUFDIn0= */";
    	append(document.head, style);
    }

    const get_default_slot_changes = ({ row, visible, hoverItemIndex }) => ({
    	item: visible,
    	i: visible,
    	hoverItemIndex: hoverItemIndex
    });
    const get_default_slot_context = ({ row, visible, hoverItemIndex }) => ({
    	item: row.data,
    	i: row.index,
    	hoverItemIndex: hoverItemIndex
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    // (157:2) {#each visible as row (row.index)}
    function create_each_block(key_1, ctx) {
    	var svelte_virtual_list_row, t0, t1, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, get_default_slot_context);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");

    			if (!default_slot) {
    				t0 = text("Missing template");
    			}

    			if (default_slot) default_slot.c();
    			t1 = space();

    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_row, file$7, 157, 3, 3488);
    			this.first = svelte_virtual_list_row;
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(svelte_virtual_list_row_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, svelte_virtual_list_row, anchor);

    			if (!default_slot) {
    				append(svelte_virtual_list_row, t0);
    			}

    			else {
    				default_slot.m(svelte_virtual_list_row, null);
    			}

    			append(svelte_virtual_list_row, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.visible || changed.hoverItemIndex)) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, get_default_slot_changes), get_slot_context(default_slot_1, ctx, get_default_slot_context));
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
    			if (detaching) {
    				detach(svelte_virtual_list_row);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var svelte_virtual_list_viewport, svelte_virtual_list_contents, each_blocks = [], each_1_lookup = new Map(), svelte_virtual_list_viewport_resize_listener, current, dispose;

    	var each_value = ctx.visible;

    	const get_key = ctx => ctx.row.index;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			set_style(svelte_virtual_list_contents, "padding-top", "" + ctx.top + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", "" + ctx.bottom + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_contents, file$7, 155, 1, 3338);
    			add_render_callback(() => ctx.svelte_virtual_list_viewport_resize_handler.call(svelte_virtual_list_viewport));
    			set_style(svelte_virtual_list_viewport, "height", ctx.height);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_viewport, file$7, 153, 0, 3196);
    			dispose = listen(svelte_virtual_list_viewport, "scroll", ctx.handle_scroll);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svelte_virtual_list_viewport, anchor);
    			append(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(svelte_virtual_list_contents, null);

    			ctx.svelte_virtual_list_contents_binding(svelte_virtual_list_contents);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, ctx.svelte_virtual_list_viewport_resize_handler.bind(svelte_virtual_list_viewport));
    			ctx.svelte_virtual_list_viewport_binding(svelte_virtual_list_viewport);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.visible;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();

    			if (!current || changed.top) {
    				set_style(svelte_virtual_list_contents, "padding-top", "" + ctx.top + "px");
    			}

    			if (!current || changed.bottom) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", "" + ctx.bottom + "px");
    			}

    			if (!current || changed.height) {
    				set_style(svelte_virtual_list_viewport, "height", ctx.height);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svelte_virtual_list_viewport);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			ctx.svelte_virtual_list_contents_binding(null);
    			svelte_virtual_list_viewport_resize_listener.cancel();
    			ctx.svelte_virtual_list_viewport_binding(null);
    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	// props
    	let { items = undefined, height = '100%', itemHeight = 40, hoverItemIndex = 0, start = 0, end = 0 } = $$props;

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
    				$$invalidate('end', end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;			i += 1;
    		}

    		$$invalidate('end', end = i);

    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;

    		$$invalidate('bottom', bottom = remaining * average_height);
    		height_map.length = items.length;
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;

    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;
    			if (y + row_height > scrollTop) {
    				$$invalidate('start', start = i);
    				$$invalidate('top', top = y);

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

    		$$invalidate('end', end = i);

    		const remaining = items.length - end;
    		average_height = y / end;

    		while (i < items.length) { height_map[i++] = average_height; }
    		$$invalidate('bottom', bottom = remaining * average_height);

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

    		// TODO if we overestimated the space these
    		// rows would occupy we may need to add some
    		// more. maybe we can just call handle_scroll again?
    	}

    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName('svelte-virtual-list-row');
    		$$invalidate('mounted', mounted = true);
    	});

    	const writable_props = ['items', 'height', 'itemHeight', 'hoverItemIndex', 'start', 'end'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('contents', contents = $$value);
    		});
    	}

    	function svelte_virtual_list_viewport_resize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate('viewport_height', viewport_height);
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('viewport', viewport = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('itemHeight' in $$props) $$invalidate('itemHeight', itemHeight = $$props.itemHeight);
    		if ('hoverItemIndex' in $$props) $$invalidate('hoverItemIndex', hoverItemIndex = $$props.hoverItemIndex);
    		if ('start' in $$props) $$invalidate('start', start = $$props.start);
    		if ('end' in $$props) $$invalidate('end', end = $$props.end);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { items: 1, start: 1, end: 1, mounted: 1, viewport_height: 1, itemHeight: 1 }) => {
    		if ($$dirty.items || $$dirty.start || $$dirty.end) { $$invalidate('visible', visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			})); }
    		if ($$dirty.mounted || $$dirty.items || $$dirty.viewport_height || $$dirty.itemHeight) { if (mounted) refresh(items, viewport_height, itemHeight); }
    	};

    	return {
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_resize_handler,
    		svelte_virtual_list_viewport_binding,
    		$$slots,
    		$$scope
    	};
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-p6ehlv-style")) add_css$6();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"]);
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

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.6.10 */

    const file$8 = "node_modules/svelte-select/src/List.svelte";

    function add_css$7() {
    	var style = element("style");
    	style.id = 'svelte-bqv8jo-style';
    	style.textContent = ".listContainer.svelte-bqv8jo{box-shadow:var(--listShadow, 0 2px 3px 0 rgba(44, 62, 80, 0.24));border-radius:var(--listBorderRadius, 4px);max-height:var(--listMaxHeight, 250px);overflow-y:auto;background:var(--listBackground, #fff)}.virtualList.svelte-bqv8jo{height:var(--virtualListHeight, 200px)}.listGroupTitle.svelte-bqv8jo{color:var(--groupTitleColor, #8f8f8f);cursor:default;font-size:var(--groupTitleFontSize, 12px);height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--groupTitlePadding, 0 20px);text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;text-transform:var(--groupTitleTextTransform, uppercase)}.empty.svelte-bqv8jo{text-align:var(--listEmptyTextAlign, center);padding:var(--listEmptyPadding, 20px 0);color:var(--listEmptyColor, #78848F)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdC5zdmVsdGUiLCJzb3VyY2VzIjpbIkxpc3Quc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGJlZm9yZVVwZGF0ZSwgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBvbkRlc3Ryb3ksIG9uTW91bnQsIHRpY2sgfSBmcm9tICdzdmVsdGUnO1xuXG4gIGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cbiAgZXhwb3J0IGxldCBjb250YWluZXIgPSB1bmRlZmluZWQ7XG5cbiAgaW1wb3J0IEl0ZW1Db21wb25lbnQgZnJvbSAnLi9JdGVtLnN2ZWx0ZSc7XG4gIGltcG9ydCBWaXJ0dWFsTGlzdCBmcm9tICcuL1ZpcnR1YWxMaXN0LnN2ZWx0ZSc7XG5cbiAgZXhwb3J0IGxldCBJdGVtID0gSXRlbUNvbXBvbmVudDtcbiAgZXhwb3J0IGxldCBpc1ZpcnR1YWxMaXN0ID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgaXRlbXMgPSBbXTtcbiAgZXhwb3J0IGxldCBnZXRPcHRpb25MYWJlbCA9IChvcHRpb24sIGZpbHRlclRleHQpID0+IHtcbiAgICBpZiAob3B0aW9uKSByZXR1cm4gb3B0aW9uLmlzQ3JlYXRvciA/IGBDcmVhdGUgXFxcIiR7ZmlsdGVyVGV4dH1cXFwiYCA6IG9wdGlvbi5sYWJlbDtcbiAgfTtcbiAgZXhwb3J0IGxldCBnZXRHcm91cEhlYWRlckxhYmVsID0gKG9wdGlvbikgPT4geyByZXR1cm4gb3B0aW9uLmxhYmVsIH07XG4gIGV4cG9ydCBsZXQgaXRlbUhlaWdodCA9IDQwO1xuICBleHBvcnQgbGV0IGhvdmVySXRlbUluZGV4ID0gMDtcbiAgZXhwb3J0IGxldCBzZWxlY3RlZFZhbHVlID0gdW5kZWZpbmVkO1xuICBleHBvcnQgbGV0IHN0YXJ0ID0gMDtcbiAgZXhwb3J0IGxldCBlbmQgPSAwO1xuICBleHBvcnQgbGV0IG9wdGlvbklkZW50aWZpZXIgPSAndmFsdWUnO1xuICBleHBvcnQgbGV0IGhpZGVFbXB0eVN0YXRlID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgbm9PcHRpb25zTWVzc2FnZSA9ICdObyBvcHRpb25zJztcbiAgZXhwb3J0IGxldCBnZXRPcHRpb25TdHJpbmcgPSAob3B0aW9uKSA9PiBvcHRpb247XG4gIGV4cG9ydCBsZXQgaXNNdWx0aSA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGFjdGl2ZUl0ZW1JbmRleCA9IDA7XG4gIGV4cG9ydCBsZXQgZmlsdGVyVGV4dCA9ICcnO1xuICBleHBvcnQgbGV0IGlzQ3JlYXRhYmxlID0gZmFsc2U7XG5cbiAgbGV0IGlzU2Nyb2xsaW5nVGltZXIgPSAwO1xuICBsZXQgaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgbGV0IHByZXZfaXRlbXM7XG4gIGxldCBwcmV2X2FjdGl2ZUl0ZW1JbmRleDtcbiAgbGV0IHByZXZfc2VsZWN0ZWRWYWx1ZTtcblxuICBvbk1vdW50KCgpID0+IHtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID4gMCAmJiAhaXNNdWx0aSAmJiBzZWxlY3RlZFZhbHVlKSB7XG4gICAgICBjb25zdCBfaG92ZXJJdGVtSW5kZXggPSBpdGVtcy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW1bb3B0aW9uSWRlbnRpZmllcl0gPT09IHNlbGVjdGVkVmFsdWVbb3B0aW9uSWRlbnRpZmllcl0pO1xuXG4gICAgICBpZiAoX2hvdmVySXRlbUluZGV4KSB7XG4gICAgICAgIGhvdmVySXRlbUluZGV4ID0gX2hvdmVySXRlbUluZGV4O1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjcm9sbFRvQWN0aXZlSXRlbSgnYWN0aXZlJyk7XG5cblxuICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoaXNTY3JvbGxpbmdUaW1lcik7XG5cbiAgICAgIGlzU2Nyb2xsaW5nVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfSwgZmFsc2UpO1xuICB9KTtcblxuICBvbkRlc3Ryb3koKCkgPT4ge1xuICAgIC8vIGNsZWFyVGltZW91dChpc1Njcm9sbGluZ1RpbWVyKTtcbiAgfSk7XG5cbiAgYmVmb3JlVXBkYXRlKCgpID0+IHtcblxuICAgIGlmIChpdGVtcyAhPT0gcHJldl9pdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBob3Zlckl0ZW1JbmRleCA9IDA7XG4gICAgfVxuXG5cbiAgICAvLyBpZiAocHJldl9hY3RpdmVJdGVtSW5kZXggJiYgYWN0aXZlSXRlbUluZGV4ID4gLTEpIHtcbiAgICAvLyAgIGhvdmVySXRlbUluZGV4ID0gYWN0aXZlSXRlbUluZGV4O1xuXG4gICAgLy8gICBzY3JvbGxUb0FjdGl2ZUl0ZW0oJ2FjdGl2ZScpO1xuICAgIC8vIH1cbiAgICAvLyBpZiAocHJldl9zZWxlY3RlZFZhbHVlICYmIHNlbGVjdGVkVmFsdWUpIHtcbiAgICAvLyAgIHNjcm9sbFRvQWN0aXZlSXRlbSgnYWN0aXZlJyk7XG5cbiAgICAvLyAgIGlmIChpdGVtcyAmJiAhaXNNdWx0aSkge1xuICAgIC8vICAgICBjb25zdCBob3Zlckl0ZW1JbmRleCA9IGl0ZW1zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbVtvcHRpb25JZGVudGlmaWVyXSA9PT0gc2VsZWN0ZWRWYWx1ZVtvcHRpb25JZGVudGlmaWVyXSk7XG5cbiAgICAvLyAgICAgaWYgKGhvdmVySXRlbUluZGV4KSB7XG4gICAgLy8gICAgICAgaG92ZXJJdGVtSW5kZXggPSBob3Zlckl0ZW1JbmRleDtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH1cblxuICAgIHByZXZfaXRlbXMgPSBpdGVtcztcbiAgICBwcmV2X2FjdGl2ZUl0ZW1JbmRleCA9IGFjdGl2ZUl0ZW1JbmRleDtcbiAgICBwcmV2X3NlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlO1xuICB9KTtcblxuICBmdW5jdGlvbiBpdGVtQ2xhc3Nlcyhob3Zlckl0ZW1JbmRleCwgaXRlbSwgaXRlbUluZGV4LCBpdGVtcywgc2VsZWN0ZWRWYWx1ZSwgb3B0aW9uSWRlbnRpZmllciwgaXNNdWx0aSkge1xuICAgIHJldHVybiBgJHtzZWxlY3RlZFZhbHVlICYmICFpc011bHRpICYmIChzZWxlY3RlZFZhbHVlW29wdGlvbklkZW50aWZpZXJdID09PSBpdGVtW29wdGlvbklkZW50aWZpZXJdKSA/ICdhY3RpdmUgJyA6ICcnfSR7aG92ZXJJdGVtSW5kZXggPT09IGl0ZW1JbmRleCB8fCBpdGVtcy5sZW5ndGggPT09IDEgPyAnaG92ZXInIDogJyd9YDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNlbGVjdChpdGVtKSB7XG4gICAgaWYgKGl0ZW0uaXNDcmVhdG9yKSByZXR1cm47XG4gICAgZGlzcGF0Y2goJ2l0ZW1TZWxlY3RlZCcsIGl0ZW0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlSG92ZXIoaSkge1xuICAgIGlmIChpc1Njcm9sbGluZykgcmV0dXJuO1xuICAgIGhvdmVySXRlbUluZGV4ID0gaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUNsaWNrKGFyZ3MpIHtcbiAgICBjb25zdCB7IGl0ZW0sIGksIGV2ZW50IH0gPSBhcmdzO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgaWYgKHNlbGVjdGVkVmFsdWUgJiYgIWlzTXVsdGkgJiYgc2VsZWN0ZWRWYWx1ZVtvcHRpb25JZGVudGlmaWVyXSA9PT0gaXRlbVtvcHRpb25JZGVudGlmaWVyXSkgcmV0dXJuO1xuXG4gICAgaWYgKGl0ZW0uaXNDcmVhdG9yKSB7XG4gICAgICBkaXNwYXRjaCgnaXRlbUNyZWF0ZWQnLCBmaWx0ZXJUZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aXZlSXRlbUluZGV4ID0gaTtcbiAgICAgIGhvdmVySXRlbUluZGV4ID0gaTtcbiAgICAgIGhhbmRsZVNlbGVjdChpdGVtKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiB1cGRhdGVIb3Zlckl0ZW0oaW5jcmVtZW50KSB7XG4gICAgaWYgKGlzVmlydHVhbExpc3QpIHJldHVybjtcblxuICAgIGxldCBpc05vblNlbGVjdGFibGVJdGVtID0gdHJ1ZTtcblxuICAgIHdoaWxlIChpc05vblNlbGVjdGFibGVJdGVtKSB7XG4gICAgICBpZiAoaW5jcmVtZW50ID4gMCAmJiBob3Zlckl0ZW1JbmRleCA9PT0gKGl0ZW1zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgIGhvdmVySXRlbUluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGluY3JlbWVudCA8IDAgJiYgaG92ZXJJdGVtSW5kZXggPT09IDApIHtcbiAgICAgICAgaG92ZXJJdGVtSW5kZXggPSBpdGVtcy5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGhvdmVySXRlbUluZGV4ID0gaG92ZXJJdGVtSW5kZXggKyBpbmNyZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIGlzTm9uU2VsZWN0YWJsZUl0ZW0gPSBpdGVtc1tob3Zlckl0ZW1JbmRleF0uaXNHcm91cEhlYWRlciAmJiAhaXRlbXNbaG92ZXJJdGVtSW5kZXhdLmlzU2VsZWN0YWJsZTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aWNrKCk7XG5cbiAgICBzY3JvbGxUb0FjdGl2ZUl0ZW0oJ2hvdmVyJyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVLZXlEb3duKGUpIHtcbiAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGl0ZW1zLmxlbmd0aCAmJiB1cGRhdGVIb3Zlckl0ZW0oMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaXRlbXMubGVuZ3RoICYmIHVwZGF0ZUhvdmVySXRlbSgtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChpdGVtcy5sZW5ndGggPT09IDApIGJyZWFrO1xuICAgICAgICBjb25zdCBob3Zlckl0ZW0gPSBpdGVtc1tob3Zlckl0ZW1JbmRleF07XG4gICAgICAgIGlmIChzZWxlY3RlZFZhbHVlICYmICFpc011bHRpICYmIHNlbGVjdGVkVmFsdWVbb3B0aW9uSWRlbnRpZmllcl0gPT09IGhvdmVySXRlbVtvcHRpb25JZGVudGlmaWVyXSkgYnJlYWs7XG5cbiAgICAgICAgaWYgKGhvdmVySXRlbS5pc0NyZWF0b3IpIHtcbiAgICAgICAgICBkaXNwYXRjaCgnaXRlbUNyZWF0ZWQnLCBmaWx0ZXJUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVJdGVtSW5kZXggPSBob3Zlckl0ZW1JbmRleDtcbiAgICAgICAgICBoYW5kbGVTZWxlY3QoaXRlbXNbaG92ZXJJdGVtSW5kZXhdKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1RhYic6XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkgYnJlYWs7XG4gICAgICAgIGlmIChzZWxlY3RlZFZhbHVlICYmIHNlbGVjdGVkVmFsdWVbb3B0aW9uSWRlbnRpZmllcl0gPT09IGl0ZW1zW2hvdmVySXRlbUluZGV4XVtvcHRpb25JZGVudGlmaWVyXSkgcmV0dXJuO1xuICAgICAgICBhY3RpdmVJdGVtSW5kZXggPSBob3Zlckl0ZW1JbmRleDtcbiAgICAgICAgaGFuZGxlU2VsZWN0KGl0ZW1zW2hvdmVySXRlbUluZGV4XSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbFRvQWN0aXZlSXRlbShjbGFzc05hbWUpIHtcbiAgICBpZiAoaXNWaXJ0dWFsTGlzdCB8fCAhY29udGFpbmVyKSByZXR1cm47XG5cbiAgICBsZXQgb2Zmc2V0Qm91bmRpbmc7XG4gICAgY29uc3QgZm9jdXNlZEVsZW1Cb3VuZGluZyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAubGlzdEl0ZW0gLiR7Y2xhc3NOYW1lfWApO1xuXG4gICAgaWYgKGZvY3VzZWRFbGVtQm91bmRpbmcpIHtcbiAgICAgIG9mZnNldEJvdW5kaW5nID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSAtIGZvY3VzZWRFbGVtQm91bmRpbmcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgLT0gb2Zmc2V0Qm91bmRpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpc0l0ZW1BY3RpdmUoaXRlbSwgc2VsZWN0ZWRWYWx1ZSwgb3B0aW9uSWRlbnRpZmllcikge1xuICAgIHJldHVybiBzZWxlY3RlZFZhbHVlICYmIChzZWxlY3RlZFZhbHVlW29wdGlvbklkZW50aWZpZXJdID09PSBpdGVtW29wdGlvbklkZW50aWZpZXJdKTtcbiAgfTtcblxuICBmdW5jdGlvbiBpc0l0ZW1GaXJzdChpdGVtSW5kZXgpIHtcbiAgICByZXR1cm4gaXRlbUluZGV4ID09PSAwO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzSXRlbUhvdmVyKGhvdmVySXRlbUluZGV4LCBpdGVtLCBpdGVtSW5kZXgsIGl0ZW1zKSB7XG4gICAgcmV0dXJuIGhvdmVySXRlbUluZGV4ID09PSBpdGVtSW5kZXggfHwgaXRlbXMubGVuZ3RoID09PSAxO1xuICB9XG5cbjwvc2NyaXB0PlxuXG48c3ZlbHRlOndpbmRvdyBvbjprZXlkb3duPVwie2hhbmRsZUtleURvd259XCIgLz5cblxueyNpZiBpc1ZpcnR1YWxMaXN0fVxuPGRpdiBjbGFzcz1cImxpc3RDb250YWluZXIgdmlydHVhbExpc3RcIiBiaW5kOnRoaXM9e2NvbnRhaW5lcn0+XG5cbiAgPFZpcnR1YWxMaXN0IHtpdGVtc30ge2l0ZW1IZWlnaHR9IGxldDppdGVtIGxldDppPlxuICBcbiAgICA8ZGl2IG9uOm1vdXNlb3Zlcj1cInsoKSA9PiBoYW5kbGVIb3ZlcihpKX1cIiBvbjpjbGljaz1cIntldmVudCA9PiBoYW5kbGVDbGljayh7aXRlbSwgaSwgZXZlbnR9KX1cIlxuICAgICAgICBjbGFzcz1cImxpc3RJdGVtXCI+XG4gICAgICAgICAgPHN2ZWx0ZTpjb21wb25lbnQgXG4gICAgICAgICAgICB0aGlzPVwie0l0ZW19XCJcbiAgICAgICAgICAgIHtpdGVtfVxuICAgICAgICAgICAge2ZpbHRlclRleHR9XG4gICAgICAgICAgICB7Z2V0T3B0aW9uTGFiZWx9XG4gICAgICAgICAgICBpc0ZpcnN0PVwie2lzSXRlbUZpcnN0KGkpfVwiXG4gICAgICAgICAgICBpc0FjdGl2ZT1cIntpc0l0ZW1BY3RpdmUoaXRlbSwgc2VsZWN0ZWRWYWx1ZSwgb3B0aW9uSWRlbnRpZmllcil9XCJcbiAgICAgICAgICAgIGlzSG92ZXI9XCJ7aXNJdGVtSG92ZXIoaG92ZXJJdGVtSW5kZXgsIGl0ZW0sIGksIGl0ZW1zKX1cIlxuICAgICAgICAgIC8+XG4gICAgPC9kaXY+XG4gIFxuPC9WaXJ0dWFsTGlzdD5cbjwvZGl2Plxuey9pZn1cblxueyNpZiAhaXNWaXJ0dWFsTGlzdH1cbjxkaXYgY2xhc3M9XCJsaXN0Q29udGFpbmVyXCIgYmluZDp0aGlzPXtjb250YWluZXJ9PlxuICB7I2VhY2ggaXRlbXMgYXMgaXRlbSwgaX1cbiAgICB7I2lmIGl0ZW0uaXNHcm91cEhlYWRlciAmJiAhaXRlbS5pc1NlbGVjdGFibGV9XG4gICAgICA8ZGl2IGNsYXNzPVwibGlzdEdyb3VwVGl0bGVcIj57Z2V0R3JvdXBIZWFkZXJMYWJlbChpdGVtKX08L2Rpdj5cbiAgICB7IDplbHNlIH1cbiAgICA8ZGl2IFxuICAgICAgb246bW91c2VvdmVyPVwieygpID0+IGhhbmRsZUhvdmVyKGkpfVwiIFxuICAgICAgb246Y2xpY2s9XCJ7ZXZlbnQgPT4gaGFuZGxlQ2xpY2soe2l0ZW0sIGksIGV2ZW50fSl9XCJcbiAgICAgIGNsYXNzPVwibGlzdEl0ZW1cIlxuICAgID5cbiAgICAgIDxzdmVsdGU6Y29tcG9uZW50IFxuICAgICAgICB0aGlzPVwie0l0ZW19XCJcbiAgICAgICAge2l0ZW19XG4gICAgICAgIHtmaWx0ZXJUZXh0fVxuICAgICAgICB7Z2V0T3B0aW9uTGFiZWx9XG4gICAgICAgIGlzRmlyc3Q9XCJ7aXNJdGVtRmlyc3QoaSl9XCJcbiAgICAgICAgaXNBY3RpdmU9XCJ7aXNJdGVtQWN0aXZlKGl0ZW0sIHNlbGVjdGVkVmFsdWUsIG9wdGlvbklkZW50aWZpZXIpfVwiXG4gICAgICAgIGlzSG92ZXI9XCJ7aXNJdGVtSG92ZXIoaG92ZXJJdGVtSW5kZXgsIGl0ZW0sIGksIGl0ZW1zKX1cIlxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgICB7L2lmfVxuICB7OmVsc2V9XG4gICAgeyNpZiAhaGlkZUVtcHR5U3RhdGV9XG4gICAgICA8ZGl2IGNsYXNzPVwiZW1wdHlcIj57bm9PcHRpb25zTWVzc2FnZX08L2Rpdj5cbiAgICB7L2lmfVxuICB7L2VhY2h9XG48L2Rpdj5cbnsvaWZ9XG5cbjxzdHlsZT5cbiAgLmxpc3RDb250YWluZXIge1xuICAgIGJveC1zaGFkb3c6IHZhcigtLWxpc3RTaGFkb3csIDAgMnB4IDNweCAwIHJnYmEoNDQsIDYyLCA4MCwgMC4yNCkpO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWxpc3RCb3JkZXJSYWRpdXMsIDRweCk7XG4gICAgbWF4LWhlaWdodDogdmFyKC0tbGlzdE1heEhlaWdodCwgMjUwcHgpO1xuICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgYmFja2dyb3VuZDogdmFyKC0tbGlzdEJhY2tncm91bmQsICNmZmYpO1xuICB9XG5cbiAgLnZpcnR1YWxMaXN0IHtcbiAgICBoZWlnaHQ6IHZhcigtLXZpcnR1YWxMaXN0SGVpZ2h0LCAyMDBweCk7XG4gIH1cblxuICAubGlzdEdyb3VwVGl0bGUge1xuICAgIGNvbG9yOiB2YXIoLS1ncm91cFRpdGxlQ29sb3IsICM4ZjhmOGYpO1xuICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICBmb250LXNpemU6IHZhcigtLWdyb3VwVGl0bGVGb250U2l6ZSwgMTJweCk7XG4gICAgaGVpZ2h0OiB2YXIoLS1oZWlnaHQsIDQycHgpO1xuICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1oZWlnaHQsIDQycHgpO1xuICAgIHBhZGRpbmc6IHZhcigtLWdyb3VwVGl0bGVQYWRkaW5nLCAwIDIwcHgpO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIHRleHQtdHJhbnNmb3JtOiB2YXIoLS1ncm91cFRpdGxlVGV4dFRyYW5zZm9ybSwgdXBwZXJjYXNlKTtcbiAgfVxuXG4gIC5lbXB0eSB7XG4gICAgdGV4dC1hbGlnbjogdmFyKC0tbGlzdEVtcHR5VGV4dEFsaWduLCBjZW50ZXIpO1xuICAgIHBhZGRpbmc6IHZhcigtLWxpc3RFbXB0eVBhZGRpbmcsIDIwcHggMCk7XG4gICAgY29sb3I6IHZhcigtLWxpc3RFbXB0eUNvbG9yLCAjNzg4NDhGKTtcbiAgfVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtUUUsY0FBYyxjQUFDLENBQUMsQUFDZCxVQUFVLENBQUUsSUFBSSxZQUFZLENBQUMsbUNBQW1DLENBQUMsQ0FDakUsYUFBYSxDQUFFLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQzNDLFVBQVUsQ0FBRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FDdkMsVUFBVSxDQUFFLElBQUksQ0FDaEIsVUFBVSxDQUFFLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEFBQ3pDLENBQUMsQUFFRCxZQUFZLGNBQUMsQ0FBQyxBQUNaLE1BQU0sQ0FBRSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxBQUN6QyxDQUFDLEFBRUQsZUFBZSxjQUFDLENBQUMsQUFDZixLQUFLLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FDdEMsTUFBTSxDQUFFLE9BQU8sQ0FDZixTQUFTLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FDMUMsTUFBTSxDQUFFLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUMzQixXQUFXLENBQUUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQ2hDLE9BQU8sQ0FBRSxJQUFJLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUN6QyxhQUFhLENBQUUsUUFBUSxDQUN2QixVQUFVLENBQUUsTUFBTSxDQUNsQixXQUFXLENBQUUsTUFBTSxDQUNuQixjQUFjLENBQUUsSUFBSSx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQUFDM0QsQ0FBQyxBQUVELE1BQU0sY0FBQyxDQUFDLEFBQ04sVUFBVSxDQUFFLElBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQzdDLE9BQU8sQ0FBRSxJQUFJLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUN4QyxLQUFLLENBQUUsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQUFDdkMsQ0FBQyJ9 */";
    	append(document.head, style);
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (207:0) {#if isVirtualList}
    function create_if_block_3(ctx) {
    	var div, current;

    	var virtuallist = new VirtualList({
    		props: {
    		items: ctx.items,
    		itemHeight: ctx.itemHeight,
    		$$slots: {
    		default: [create_default_slot$1, ({ item, i }) => ({ item, i })]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			virtuallist.$$.fragment.c();
    			attr(div, "class", "listContainer virtualList svelte-bqv8jo");
    			add_location(div, file$8, 207, 0, 5855);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			ctx.div_binding(div);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var virtuallist_changes = {};
    			if (changed.items) virtuallist_changes.items = ctx.items;
    			if (changed.itemHeight) virtuallist_changes.itemHeight = ctx.itemHeight;
    			if (changed.$$scope || changed.Item || changed.filterText || changed.getOptionLabel || changed.selectedValue || changed.optionIdentifier || changed.hoverItemIndex || changed.items) virtuallist_changes.$$scope = { changed, ctx };
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
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(virtuallist);

    			ctx.div_binding(null);
    		}
    	};
    }

    // (210:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot$1(ctx) {
    	var div, current, dispose;

    	var switch_value = ctx.Item;

    	function switch_props(ctx) {
    		return {
    			props: {
    			item: ctx.item,
    			filterText: ctx.filterText,
    			getOptionLabel: ctx.getOptionLabel,
    			isFirst: isItemFirst(ctx.i),
    			isActive: isItemActive(ctx.item, ctx.selectedValue, ctx.optionIdentifier),
    			isHover: isItemHover(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items)
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler() {
    		return ctx.mouseover_handler(ctx);
    	}

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			attr(div, "class", "listItem");
    			add_location(div, file$8, 211, 4, 5977);

    			dispose = [
    				listen(div, "mouseover", mouseover_handler),
    				listen(div, "click", click_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var switch_instance_changes = {};
    			if (changed.item) switch_instance_changes.item = ctx.item;
    			if (changed.filterText) switch_instance_changes.filterText = ctx.filterText;
    			if (changed.getOptionLabel) switch_instance_changes.getOptionLabel = ctx.getOptionLabel;
    			if (changed.isItemFirst || changed.i) switch_instance_changes.isFirst = isItemFirst(ctx.i);
    			if (changed.isItemActive || changed.item || changed.selectedValue || changed.optionIdentifier) switch_instance_changes.isActive = isItemActive(ctx.item, ctx.selectedValue, ctx.optionIdentifier);
    			if (changed.isItemHover || changed.hoverItemIndex || changed.item || changed.i || changed.items) switch_instance_changes.isHover = isItemHover(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items);

    			if (switch_value !== (switch_value = ctx.Item)) {
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

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
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
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance);
    			run_all(dispose);
    		}
    	};
    }

    // (229:0) {#if !isVirtualList}
    function create_if_block$2(ctx) {
    	var div, current;

    	var each_value = ctx.items;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	var each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    		each_1_else.c();
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "listContainer svelte-bqv8jo");
    			add_location(div, file$8, 229, 0, 6487);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			ctx.div_binding_1(div);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.items || changed.getGroupHeaderLabel || changed.Item || changed.filterText || changed.getOptionLabel || changed.isItemFirst || changed.isItemActive || changed.selectedValue || changed.optionIdentifier || changed.isItemHover || changed.hoverItemIndex || changed.hideEmptyState || changed.noOptionsMessage) {
    				each_value = ctx.items;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}

    			if (!each_value.length && each_1_else) {
    				each_1_else.p(changed, ctx);
    			} else if (!each_value.length) {
    				each_1_else = create_else_block_1(ctx);
    				each_1_else.c();
    				each_1_else.m(div, null);
    			} else if (each_1_else) {
    				each_1_else.d(1);
    				each_1_else = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();

    			ctx.div_binding_1(null);
    		}
    	};
    }

    // (251:2) {:else}
    function create_else_block_1(ctx) {
    	var if_block_anchor;

    	var if_block = (!ctx.hideEmptyState) && create_if_block_2(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.hideEmptyState) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
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

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (252:4) {#if !hideEmptyState}
    function create_if_block_2(ctx) {
    	var div, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.noOptionsMessage);
    			attr(div, "class", "empty svelte-bqv8jo");
    			add_location(div, file$8, 252, 6, 7191);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.noOptionsMessage) {
    				set_data(t, ctx.noOptionsMessage);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (234:4) { :else }
    function create_else_block(ctx) {
    	var div, t, current, dispose;

    	var switch_value = ctx.Item;

    	function switch_props(ctx) {
    		return {
    			props: {
    			item: ctx.item,
    			filterText: ctx.filterText,
    			getOptionLabel: ctx.getOptionLabel,
    			isFirst: isItemFirst(ctx.i),
    			isActive: isItemActive(ctx.item, ctx.selectedValue, ctx.optionIdentifier),
    			isHover: isItemHover(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items)
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1() {
    		return ctx.mouseover_handler_1(ctx);
    	}

    	function click_handler_1(...args) {
    		return ctx.click_handler_1(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t = space();
    			attr(div, "class", "listItem");
    			add_location(div, file$8, 234, 4, 6701);

    			dispose = [
    				listen(div, "mouseover", mouseover_handler_1),
    				listen(div, "click", click_handler_1)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append(div, t);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var switch_instance_changes = {};
    			if (changed.items) switch_instance_changes.item = ctx.item;
    			if (changed.filterText) switch_instance_changes.filterText = ctx.filterText;
    			if (changed.getOptionLabel) switch_instance_changes.getOptionLabel = ctx.getOptionLabel;
    			if (changed.isItemFirst) switch_instance_changes.isFirst = isItemFirst(ctx.i);
    			if (changed.isItemActive || changed.items || changed.selectedValue || changed.optionIdentifier) switch_instance_changes.isActive = isItemActive(ctx.item, ctx.selectedValue, ctx.optionIdentifier);
    			if (changed.isItemHover || changed.hoverItemIndex || changed.items) switch_instance_changes.isHover = isItemHover(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items);

    			if (switch_value !== (switch_value = ctx.Item)) {
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

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
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
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance);
    			run_all(dispose);
    		}
    	};
    }

    // (232:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1(ctx) {
    	var div, t_value = ctx.getGroupHeaderLabel(ctx.item), t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "listGroupTitle svelte-bqv8jo");
    			add_location(div, file$8, 232, 6, 6621);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.getGroupHeaderLabel || changed.items) && t_value !== (t_value = ctx.getGroupHeaderLabel(ctx.item))) {
    				set_data(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (231:2) {#each items as item, i}
    function create_each_block$1(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.item.isGroupHeader && !ctx.item.isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
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

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var t, if_block1_anchor, current, dispose;

    	var if_block0 = (ctx.isVirtualList) && create_if_block_3(ctx);

    	var if_block1 = (!ctx.isVirtualList) && create_if_block$2(ctx);

    	return {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			dispose = listen(window, "keydown", ctx.handleKeyDown);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.isVirtualList) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
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

    			if (!ctx.isVirtualList) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$2(ctx);
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

    			if (detaching) {
    				detach(t);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(if_block1_anchor);
    			}

    			dispose();
    		}
    	};
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
      return selectedValue && (selectedValue[optionIdentifier] === item[optionIdentifier]);
    }

    function isItemFirst(itemIndex) {
      return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
      return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let { container = undefined } = $$props;

      let { Item = Item$1, isVirtualList = false, items = [], getOptionLabel = (option, filterText) => {
        if (option) return option.isCreator ? `Create \"${filterText}\"` : option.label;
      } } = $$props;
      let { getGroupHeaderLabel = (option) => { return option.label } } = $$props;
      let { itemHeight = 40, hoverItemIndex = 0, selectedValue = undefined, start = 0, end = 0, optionIdentifier = 'value', hideEmptyState = false, noOptionsMessage = 'No options', getOptionString = (option) => option } = $$props;
      let { isMulti = false, activeItemIndex = 0, filterText = '', isCreatable = false } = $$props;

      let isScrollingTimer = 0;
      let isScrolling = false;
      let prev_items;

      onMount(() => {
        if (items.length > 0 && !isMulti && selectedValue) {
          const _hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);

          if (_hoverItemIndex) {
            $$invalidate('hoverItemIndex', hoverItemIndex = _hoverItemIndex);
          }
        }

        scrollToActiveItem('active');


        container.addEventListener('scroll', () => {
          clearTimeout(isScrollingTimer);

          isScrollingTimer = setTimeout(() => {
            isScrolling = false;
          }, 100);
        }, false);
      });

      onDestroy(() => {
        // clearTimeout(isScrollingTimer);
      });

      beforeUpdate(() => {

        if (items !== prev_items && items.length > 0) {
          $$invalidate('hoverItemIndex', hoverItemIndex = 0);
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
      });

      function handleSelect(item) {
        if (item.isCreator) return;
        dispatch('itemSelected', item);
      }

      function handleHover(i) {
        if (isScrolling) return;
        $$invalidate('hoverItemIndex', hoverItemIndex = i);
      }

      function handleClick(args) {
        const { item, i, event } = args;
        event.stopPropagation();

        if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return;

        if (item.isCreator) {
          dispatch('itemCreated', filterText);
        } else {
          $$invalidate('activeItemIndex', activeItemIndex = i);
          $$invalidate('hoverItemIndex', hoverItemIndex = i);
          handleSelect(item);
        }
      }

      async function updateHoverItem(increment) {
        if (isVirtualList) return;

        let isNonSelectableItem = true;

        while (isNonSelectableItem) {
          if (increment > 0 && hoverItemIndex === (items.length - 1)) {
            $$invalidate('hoverItemIndex', hoverItemIndex = 0);
          }
          else if (increment < 0 && hoverItemIndex === 0) {
            $$invalidate('hoverItemIndex', hoverItemIndex = items.length - 1);
          }
          else {
            $$invalidate('hoverItemIndex', hoverItemIndex = hoverItemIndex + increment);
          }

          isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
        }

        await tick();

        scrollToActiveItem('hover');
      }

      function handleKeyDown(e) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            items.length && updateHoverItem(1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            items.length && updateHoverItem(-1);
            break;
          case 'Enter':
            e.preventDefault();
            if (items.length === 0) break;
            const hoverItem = items[hoverItemIndex];
            if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) break;

            if (hoverItem.isCreator) {
              dispatch('itemCreated', filterText);
            } else {
              $$invalidate('activeItemIndex', activeItemIndex = hoverItemIndex);
              handleSelect(items[hoverItemIndex]);
            }
            break;
          case 'Tab':
            e.preventDefault();
            if (items.length === 0) break;
            if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return;
            $$invalidate('activeItemIndex', activeItemIndex = hoverItemIndex);
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

        container.scrollTop -= offsetBounding; $$invalidate('container', container);
      }
    	const writable_props = ['container', 'Item', 'isVirtualList', 'items', 'getOptionLabel', 'getGroupHeaderLabel', 'itemHeight', 'hoverItemIndex', 'selectedValue', 'start', 'end', 'optionIdentifier', 'hideEmptyState', 'noOptionsMessage', 'getOptionString', 'isMulti', 'activeItemIndex', 'filterText', 'isCreatable'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	function mouseover_handler({ i }) {
    		return handleHover(i);
    	}

    	function click_handler({ item, i }, event) {
    		return handleClick({item, i, event});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('container', container = $$value);
    		});
    	}

    	function mouseover_handler_1({ i }) {
    		return handleHover(i);
    	}

    	function click_handler_1({ item, i }, event) {
    		return handleClick({item, i, event});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('container', container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('container' in $$props) $$invalidate('container', container = $$props.container);
    		if ('Item' in $$props) $$invalidate('Item', Item = $$props.Item);
    		if ('isVirtualList' in $$props) $$invalidate('isVirtualList', isVirtualList = $$props.isVirtualList);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('getOptionLabel' in $$props) $$invalidate('getOptionLabel', getOptionLabel = $$props.getOptionLabel);
    		if ('getGroupHeaderLabel' in $$props) $$invalidate('getGroupHeaderLabel', getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ('itemHeight' in $$props) $$invalidate('itemHeight', itemHeight = $$props.itemHeight);
    		if ('hoverItemIndex' in $$props) $$invalidate('hoverItemIndex', hoverItemIndex = $$props.hoverItemIndex);
    		if ('selectedValue' in $$props) $$invalidate('selectedValue', selectedValue = $$props.selectedValue);
    		if ('start' in $$props) $$invalidate('start', start = $$props.start);
    		if ('end' in $$props) $$invalidate('end', end = $$props.end);
    		if ('optionIdentifier' in $$props) $$invalidate('optionIdentifier', optionIdentifier = $$props.optionIdentifier);
    		if ('hideEmptyState' in $$props) $$invalidate('hideEmptyState', hideEmptyState = $$props.hideEmptyState);
    		if ('noOptionsMessage' in $$props) $$invalidate('noOptionsMessage', noOptionsMessage = $$props.noOptionsMessage);
    		if ('getOptionString' in $$props) $$invalidate('getOptionString', getOptionString = $$props.getOptionString);
    		if ('isMulti' in $$props) $$invalidate('isMulti', isMulti = $$props.isMulti);
    		if ('activeItemIndex' in $$props) $$invalidate('activeItemIndex', activeItemIndex = $$props.activeItemIndex);
    		if ('filterText' in $$props) $$invalidate('filterText', filterText = $$props.filterText);
    		if ('isCreatable' in $$props) $$invalidate('isCreatable', isCreatable = $$props.isCreatable);
    	};

    	return {
    		container,
    		Item,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		start,
    		end,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		getOptionString,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isCreatable,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	};
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-bqv8jo-style")) add_css$7();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["container", "Item", "isVirtualList", "items", "getOptionLabel", "getGroupHeaderLabel", "itemHeight", "hoverItemIndex", "selectedValue", "start", "end", "optionIdentifier", "hideEmptyState", "noOptionsMessage", "getOptionString", "isMulti", "activeItemIndex", "filterText", "isCreatable"]);
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

    	get start() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
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

    	get getOptionString() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionString(value) {
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

    	get isCreatable() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.6.10 */

    const file$9 = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$9(ctx) {
    	var div, raw_value = ctx.getSelectionLabel(ctx.item);

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "selection");
    			add_location(div, file$9, 5, 0, 95);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.getSelectionLabel || changed.item) && raw_value !== (raw_value = ctx.getSelectionLabel(ctx.item))) {
    				div.innerHTML = raw_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { getSelectionLabel = undefined, item = undefined } = $$props;

    	const writable_props = ['getSelectionLabel', 'item'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('getSelectionLabel' in $$props) $$invalidate('getSelectionLabel', getSelectionLabel = $$props.getSelectionLabel);
    		if ('item' in $$props) $$invalidate('item', item = $$props.item);
    	};

    	return { getSelectionLabel, item };
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["getSelectionLabel", "item"]);
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

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.6.10 */

    const file$a = "node_modules/svelte-select/src/MultiSelection.svelte";

    function add_css$8() {
    	var style = element("style");
    	style.id = 'svelte-rtzfov-style';
    	style.textContent = ".multiSelectItem.svelte-rtzfov{background:var(--multiItemBG, #EBEDEF);margin:var(--multiItemMargin, 5px 5px 0 0);border-radius:var(--multiItemBorderRadius, 16px);height:var(--multiItemHeight, 32px);line-height:var(--multiItemHeight, 32px);display:flex;cursor:default;padding:var(--multiItemPadding, 0 10px 0 15px)}.multiSelectItem_label.svelte-rtzfov{margin:var(--multiLabelMargin, 0 5px 0 0)}.multiSelectItem.svelte-rtzfov:hover,.multiSelectItem.active.svelte-rtzfov{background-color:var(--multiItemActiveBG, #006FFF);color:var(--multiItemActiveColor, #fff)}.multiSelectItem.disabled.svelte-rtzfov:hover{background:var(--multiItemDisabledHoverBg, #EBEDEF);color:var(--multiItemDisabledHoverColor, #C1C6CC)}.multiSelectItem_clear.svelte-rtzfov{border-radius:var(--multiClearRadius, 50%);background:var(--multiClearBG, #52616F);width:var(--multiClearWidth, 16px);height:var(--multiClearHeight, 16px);position:relative;top:var(--multiClearTop, 8px);text-align:var(--multiClearTextAlign, center);padding:var(--multiClearPadding, 1px)}.multiSelectItem_clear.svelte-rtzfov:hover,.active.svelte-rtzfov .multiSelectItem_clear.svelte-rtzfov{background:var(--multiClearHoverBG, #fff)}.multiSelectItem_clear.svelte-rtzfov:hover svg.svelte-rtzfov,.active.svelte-rtzfov .multiSelectItem_clear svg.svelte-rtzfov{fill:var(--multiClearHoverFill, #006FFF)}.multiSelectItem_clear.svelte-rtzfov svg.svelte-rtzfov{fill:var(--multiClearFill, #EBEDEF);vertical-align:top}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXVsdGlTZWxlY3Rpb24uc3ZlbHRlIiwic291cmNlcyI6WyJNdWx0aVNlbGVjdGlvbi5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyIH0gZnJvbSAnc3ZlbHRlJztcblxuICBjb25zdCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuXG4gIGV4cG9ydCBsZXQgc2VsZWN0ZWRWYWx1ZSA9IFtdO1xuICBleHBvcnQgbGV0IGFjdGl2ZVNlbGVjdGVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgaXNEaXNhYmxlZCA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGdldFNlbGVjdGlvbkxhYmVsID0gdW5kZWZpbmVkO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZUNsZWFyKGksIGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZGlzcGF0Y2goJ211bHRpSXRlbUNsZWFyJywge2l9KTtcbiAgfVxuPC9zY3JpcHQ+XG5cbnsjZWFjaCBzZWxlY3RlZFZhbHVlIGFzIHZhbHVlLCBpfVxuPGRpdiBjbGFzcz1cIm11bHRpU2VsZWN0SXRlbSB7YWN0aXZlU2VsZWN0ZWRWYWx1ZSA9PT0gaSA/ICdhY3RpdmUnIDogJyd9IHtpc0Rpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnfVwiPlxuICA8ZGl2IGNsYXNzPVwibXVsdGlTZWxlY3RJdGVtX2xhYmVsXCI+XG4gICAge0BodG1sIGdldFNlbGVjdGlvbkxhYmVsKHZhbHVlKX1cbiAgPC9kaXY+XG4gIHsjaWYgIWlzRGlzYWJsZWR9XG4gIDxkaXYgY2xhc3M9XCJtdWx0aVNlbGVjdEl0ZW1fY2xlYXJcIiBvbjpjbGljaz1cIntldmVudCA9PiBoYW5kbGVDbGVhcihpLCBldmVudCl9XCI+XG4gICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0yIC0yIDUwIDUwXCIgZm9jdXNhYmxlPVwiZmFsc2VcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTM0LjkyMywzNy4yNTFMMjQsMjYuMzI4TDEzLjA3NywzNy4yNTFMOS40MzYsMzMuNjFsMTAuOTIzLTEwLjkyM0w5LjQzNiwxMS43NjVsMy42NDEtMy42NDFMMjQsMTkuMDQ3TDM0LjkyMyw4LjEyNCBsMy42NDEsMy42NDFMMjcuNjQxLDIyLjY4OEwzOC41NjQsMzMuNjFMMzQuOTIzLDM3LjI1MXpcIj48L3BhdGg+XG4gICAgPC9zdmc+XG4gIDwvZGl2PlxuICB7L2lmfVxuPC9kaXY+XG57L2VhY2h9XG5cblxuXG48c3R5bGU+XG4gIC5tdWx0aVNlbGVjdEl0ZW0ge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLW11bHRpSXRlbUJHLCAjRUJFREVGKTtcbiAgICBtYXJnaW46IHZhcigtLW11bHRpSXRlbU1hcmdpbiwgNXB4IDVweCAwIDApO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLW11bHRpSXRlbUJvcmRlclJhZGl1cywgMTZweCk7XG4gICAgaGVpZ2h0OiB2YXIoLS1tdWx0aUl0ZW1IZWlnaHQsIDMycHgpO1xuICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1tdWx0aUl0ZW1IZWlnaHQsIDMycHgpO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIHBhZGRpbmc6IHZhcigtLW11bHRpSXRlbVBhZGRpbmcsIDAgMTBweCAwIDE1cHgpO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0SXRlbV9sYWJlbCB7XG4gICAgbWFyZ2luOiB2YXIoLS1tdWx0aUxhYmVsTWFyZ2luLCAwIDVweCAwIDApO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0SXRlbTpob3ZlcixcbiAgLm11bHRpU2VsZWN0SXRlbS5hY3RpdmUge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLW11bHRpSXRlbUFjdGl2ZUJHLCAjMDA2RkZGKTtcbiAgICBjb2xvcjogdmFyKC0tbXVsdGlJdGVtQWN0aXZlQ29sb3IsICNmZmYpO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0SXRlbS5kaXNhYmxlZDpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tbXVsdGlJdGVtRGlzYWJsZWRIb3ZlckJnLCAjRUJFREVGKTtcbiAgICBjb2xvcjogdmFyKC0tbXVsdGlJdGVtRGlzYWJsZWRIb3ZlckNvbG9yLCAjQzFDNkNDKTtcbiAgfVxuXG4gIC5tdWx0aVNlbGVjdEl0ZW1fY2xlYXIge1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLW11bHRpQ2xlYXJSYWRpdXMsIDUwJSk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tbXVsdGlDbGVhckJHLCAjNTI2MTZGKTtcbiAgICB3aWR0aDogdmFyKC0tbXVsdGlDbGVhcldpZHRoLCAxNnB4KTtcbiAgICBoZWlnaHQ6IHZhcigtLW11bHRpQ2xlYXJIZWlnaHQsIDE2cHgpO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB0b3A6IHZhcigtLW11bHRpQ2xlYXJUb3AsIDhweCk7XG4gICAgdGV4dC1hbGlnbjogdmFyKC0tbXVsdGlDbGVhclRleHRBbGlnbiwgY2VudGVyKTtcbiAgICBwYWRkaW5nOiB2YXIoLS1tdWx0aUNsZWFyUGFkZGluZywgMXB4KTtcbiAgfVxuXG4gIC5tdWx0aVNlbGVjdEl0ZW1fY2xlYXI6aG92ZXIsXG4gIC5hY3RpdmUgLm11bHRpU2VsZWN0SXRlbV9jbGVhciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tbXVsdGlDbGVhckhvdmVyQkcsICNmZmYpO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0SXRlbV9jbGVhcjpob3ZlciBzdmcsXG4gIC5hY3RpdmUgLm11bHRpU2VsZWN0SXRlbV9jbGVhciBzdmcge1xuICAgIGZpbGw6IHZhcigtLW11bHRpQ2xlYXJIb3ZlckZpbGwsICMwMDZGRkYpO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0SXRlbV9jbGVhciBzdmcge1xuICAgIGZpbGw6IHZhcigtLW11bHRpQ2xlYXJGaWxsLCAjRUJFREVGKTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogdG9wO1xuICB9XG48L3N0eWxlPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1DRSxnQkFBZ0IsY0FBQyxDQUFDLEFBQ2hCLFVBQVUsQ0FBRSxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FDdkMsTUFBTSxDQUFFLElBQUksaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQzNDLGFBQWEsQ0FBRSxJQUFJLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUNqRCxNQUFNLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FDcEMsV0FBVyxDQUFFLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQ3pDLE9BQU8sQ0FBRSxJQUFJLENBQ2IsTUFBTSxDQUFFLE9BQU8sQ0FDZixPQUFPLENBQUUsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQUFDakQsQ0FBQyxBQUVELHNCQUFzQixjQUFDLENBQUMsQUFDdEIsTUFBTSxDQUFFLElBQUksa0JBQWtCLENBQUMsVUFBVSxDQUFDLEFBQzVDLENBQUMsQUFFRCw4QkFBZ0IsTUFBTSxDQUN0QixnQkFBZ0IsT0FBTyxjQUFDLENBQUMsQUFDdkIsZ0JBQWdCLENBQUUsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FDbkQsS0FBSyxDQUFFLElBQUksc0JBQXNCLENBQUMsS0FBSyxDQUFDLEFBQzFDLENBQUMsQUFFRCxnQkFBZ0IsdUJBQVMsTUFBTSxBQUFDLENBQUMsQUFDL0IsVUFBVSxDQUFFLElBQUksMEJBQTBCLENBQUMsUUFBUSxDQUFDLENBQ3BELEtBQUssQ0FBRSxJQUFJLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxBQUNwRCxDQUFDLEFBRUQsc0JBQXNCLGNBQUMsQ0FBQyxBQUN0QixhQUFhLENBQUUsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FDM0MsVUFBVSxDQUFFLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUN4QyxLQUFLLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FDbkMsTUFBTSxDQUFFLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQ3JDLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEdBQUcsQ0FBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FDOUIsVUFBVSxDQUFFLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQzlDLE9BQU8sQ0FBRSxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxBQUN4QyxDQUFDLEFBRUQsb0NBQXNCLE1BQU0sQ0FDNUIscUJBQU8sQ0FBQyxzQkFBc0IsY0FBQyxDQUFDLEFBQzlCLFVBQVUsQ0FBRSxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxBQUM1QyxDQUFDLEFBRUQsb0NBQXNCLE1BQU0sQ0FBQyxpQkFBRyxDQUNoQyxxQkFBTyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsY0FBQyxDQUFDLEFBQ2xDLElBQUksQ0FBRSxJQUFJLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxBQUMzQyxDQUFDLEFBRUQsb0NBQXNCLENBQUMsR0FBRyxjQUFDLENBQUMsQUFDMUIsSUFBSSxDQUFFLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQ3BDLGNBQWMsQ0FBRSxHQUFHLEFBQ3JCLENBQUMifQ== */";
    	append(document.head, style);
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.value = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (22:2) {#if !isDisabled}
    function create_if_block$3(ctx) {
    	var div, svg, path, dispose;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$a, 24, 6, 806);
    			attr(svg, "width", "100%");
    			attr(svg, "height", "100%");
    			attr(svg, "viewBox", "-2 -2 50 50");
    			attr(svg, "focusable", "false");
    			attr(svg, "role", "presentation");
    			attr(svg, "class", "svelte-rtzfov");
    			add_location(svg, file$a, 23, 4, 707);
    			attr(div, "class", "multiSelectItem_clear svelte-rtzfov");
    			add_location(div, file$a, 22, 2, 623);
    			dispose = listen(div, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, svg);
    			append(svg, path);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (17:0) {#each selectedValue as value, i}
    function create_each_block$2(ctx) {
    	var div1, div0, raw_value = ctx.getSelectionLabel(ctx.value), t0, t1, div1_class_value;

    	var if_block = (!ctx.isDisabled) && create_if_block$3(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr(div0, "class", "multiSelectItem_label svelte-rtzfov");
    			add_location(div0, file$a, 18, 2, 519);
    			attr(div1, "class", div1_class_value = "multiSelectItem " + (ctx.activeSelectedValue === ctx.i ? 'active' : '') + " " + (ctx.isDisabled ? 'disabled' : '') + " svelte-rtzfov");
    			add_location(div1, file$a, 17, 0, 412);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			div0.innerHTML = raw_value;
    			append(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.getSelectionLabel || changed.selectedValue) && raw_value !== (raw_value = ctx.getSelectionLabel(ctx.value))) {
    				div0.innerHTML = raw_value;
    			}

    			if (!ctx.isDisabled) {
    				if (!if_block) {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.activeSelectedValue || changed.isDisabled) && div1_class_value !== (div1_class_value = "multiSelectItem " + (ctx.activeSelectedValue === ctx.i ? 'active' : '') + " " + (ctx.isDisabled ? 'disabled' : '') + " svelte-rtzfov")) {
    				attr(div1, "class", div1_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var each_1_anchor;

    	var each_value = ctx.selectedValue;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.activeSelectedValue || changed.isDisabled || changed.getSelectionLabel || changed.selectedValue) {
    				each_value = ctx.selectedValue;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
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

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let { selectedValue = [], activeSelectedValue = undefined, isDisabled = false, getSelectionLabel = undefined } = $$props;

      function handleClear(i, event) {
        event.stopPropagation();
        dispatch('multiItemClear', {i});
      }

    	const writable_props = ['selectedValue', 'activeSelectedValue', 'isDisabled', 'getSelectionLabel'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ i }, event) {
    		return handleClear(i, event);
    	}

    	$$self.$set = $$props => {
    		if ('selectedValue' in $$props) $$invalidate('selectedValue', selectedValue = $$props.selectedValue);
    		if ('activeSelectedValue' in $$props) $$invalidate('activeSelectedValue', activeSelectedValue = $$props.activeSelectedValue);
    		if ('isDisabled' in $$props) $$invalidate('isDisabled', isDisabled = $$props.isDisabled);
    		if ('getSelectionLabel' in $$props) $$invalidate('getSelectionLabel', getSelectionLabel = $$props.getSelectionLabel);
    	};

    	return {
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear,
    		click_handler
    	};
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-rtzfov-style")) add_css$8();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["selectedValue", "activeSelectedValue", "isDisabled", "getSelectionLabel"]);
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

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.6.10 */
    const { Object: Object_1, document: document_1 } = globals;

    const file$b = "node_modules/svelte-select/src/Select.svelte";

    function add_css$9() {
    	var style = element("style");
    	style.id = 'svelte-1ik40xa-style';
    	style.textContent = ".selectContainer.svelte-1ik40xa{border:var(--border, 1px solid #D8DBDF);border-radius:var(--borderRadius, 3px);height:var(--height, 42px);position:relative;display:flex;padding:var(--padding, 0 16px);background:var(--background, #fff)}.selectContainer.svelte-1ik40xa input.svelte-1ik40xa{cursor:default;border:none;color:var(--inputColor, #3F4F5F);height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--padding, 0 16px);width:100%;background:transparent;font-size:var(--inputFontSize, 14px);letter-spacing:var(--inputLetterSpacing, -0.08px);position:absolute;left:0}.selectContainer.svelte-1ik40xa input.svelte-1ik40xa::placeholder{color:var(--placeholderColor, #78848F)}.selectContainer.svelte-1ik40xa input.svelte-1ik40xa:focus{outline:none}.selectContainer.svelte-1ik40xa:hover{border-color:var(--borderHoverColor, #b2b8bf)}.selectContainer.focused.svelte-1ik40xa{border-color:var(--borderFocusColor, #006FE8)}.selectContainer.disabled.svelte-1ik40xa{background:var(--disabledBackground, #EBEDEF);border-color:var(--disabledBorderColor, #EBEDEF);color:var(--disabledColor, #C1C6CC)}.selectContainer.disabled.svelte-1ik40xa input.svelte-1ik40xa::placeholder{color:var(--disabledPlaceholderColor, #C1C6CC)}.selectedItem.svelte-1ik40xa{line-height:var(--height, 42px);height:var(--height, 42px);text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;padding:var(--selectedItemPadding, 0 20px 0 0)}.selectedItem.svelte-1ik40xa:focus{outline:none}.clearSelect.svelte-1ik40xa{position:absolute;right:var(--clearSelectRight, 10px);top:var(--clearSelectTop, 11px);bottom:var(--clearSelectBottom, 11px);width:var(--clearSelectWidth, 20px);color:var(--clearSelectColor, #c5cacf);flex:none !important}.clearSelect.svelte-1ik40xa:hover{color:var(--clearSelectHoverColor, #2c3e50)}.selectContainer.focused.svelte-1ik40xa .clearSelect.svelte-1ik40xa{color:var(--clearSelectFocusColor, #3F4F5F)\n  }.indicator.svelte-1ik40xa{position:absolute;right:var(--indicatorRight, 10px);top:var(--indicatorTop, 11px);width:var(--indicatorWidth, 20px);height:var(--indicatorHeight, 20px);color:var(--indicatorColor, #c5cacf)}.indicator.svelte-1ik40xa svg.svelte-1ik40xa{display:inline-block;fill:var(--indicatorFill, currentcolor);line-height:1;stroke:var(--indicatorStroke, currentcolor);stroke-width:0}.spinner.svelte-1ik40xa{position:absolute;right:var(--spinnerRight, 10px);top:var(--spinnerLeft, 11px);width:var(--spinnerWidth, 20px);height:var(--spinnerHeight, 20px);color:var(--spinnerColor, #51ce6c);animation:svelte-1ik40xa-rotate 0.75s linear infinite}.spinner_icon.svelte-1ik40xa{display:block;height:100%;transform-origin:center center;width:100%;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;-webkit-transform:none}.spinner_path.svelte-1ik40xa{stroke-dasharray:90;stroke-linecap:round}.multiSelect.svelte-1ik40xa{display:flex;padding:var(--multiSelectPadding, 0 35px 0 16px);height:auto;flex-wrap:wrap}.multiSelect.svelte-1ik40xa>.svelte-1ik40xa{flex:1 1 50px}.selectContainer.multiSelect.svelte-1ik40xa input.svelte-1ik40xa{padding:var(--multiSelectInputPadding, 0);position:relative;margin:var(--multiSelectInputMargin, 0)}.hasError.svelte-1ik40xa{border:var(--errorBorder, 1px solid #FF2D55)}@keyframes svelte-1ik40xa-rotate{100%{transform:rotate(360deg)}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0LnN2ZWx0ZSIsInNvdXJjZXMiOlsiU2VsZWN0LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBiZWZvcmVVcGRhdGUsIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciwgb25EZXN0cm95LCBvbk1vdW50LCB0aWNrIH0gZnJvbSAnc3ZlbHRlJztcbiAgaW1wb3J0IExpc3QgZnJvbSAnLi9MaXN0LnN2ZWx0ZSc7XG4gIGltcG9ydCBJdGVtQ29tcG9uZW50IGZyb20gJy4vSXRlbS5zdmVsdGUnO1xuICBpbXBvcnQgU2VsZWN0aW9uQ29tcG9uZW50IGZyb20gJy4vU2VsZWN0aW9uLnN2ZWx0ZSc7XG4gIGltcG9ydCBNdWx0aVNlbGVjdGlvbkNvbXBvbmVudCBmcm9tICcuL011bHRpU2VsZWN0aW9uLnN2ZWx0ZSc7XG4gIGltcG9ydCBpc091dE9mVmlld3BvcnQgZnJvbSAnLi91dGlscy9pc091dE9mVmlld3BvcnQnO1xuICBpbXBvcnQgZGVib3VuY2UgZnJvbSAnLi91dGlscy9kZWJvdW5jZSc7XG5cbiAgY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcbiAgZXhwb3J0IGxldCBjb250YWluZXIgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgaW5wdXQgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgSXRlbSA9IEl0ZW1Db21wb25lbnQ7XG4gIGV4cG9ydCBsZXQgU2VsZWN0aW9uID0gU2VsZWN0aW9uQ29tcG9uZW50O1xuICBleHBvcnQgbGV0IE11bHRpU2VsZWN0aW9uID0gTXVsdGlTZWxlY3Rpb25Db21wb25lbnQ7XG4gIGV4cG9ydCBsZXQgaXNNdWx0aSA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGlzRGlzYWJsZWQgPSBmYWxzZTtcbiAgZXhwb3J0IGxldCBpc0NyZWF0YWJsZSA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGlzRm9jdXNlZCA9IGZhbHNlO1xuICBleHBvcnQgbGV0IHNlbGVjdGVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgZmlsdGVyVGV4dCA9ICcnO1xuICBleHBvcnQgbGV0IHBsYWNlaG9sZGVyID0gJ1NlbGVjdC4uLic7XG4gIGV4cG9ydCBsZXQgaXRlbXMgPSBbXTtcbiAgZXhwb3J0IGxldCBncm91cEJ5ID0gdW5kZWZpbmVkO1xuICBleHBvcnQgbGV0IGdyb3VwRmlsdGVyID0gKGdyb3VwcykgPT4gZ3JvdXBzO1xuICBleHBvcnQgbGV0IGlzR3JvdXBIZWFkZXJTZWxlY3RhYmxlID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgZ2V0R3JvdXBIZWFkZXJMYWJlbCA9IChvcHRpb24pID0+IHtcbiAgICByZXR1cm4gb3B0aW9uLmxhYmVsXG4gIH07XG4gIGV4cG9ydCBsZXQgZ2V0T3B0aW9uTGFiZWwgPSAob3B0aW9uLCBmaWx0ZXJUZXh0KSA9PiB7XG4gICAgcmV0dXJuIG9wdGlvbi5pc0NyZWF0b3IgPyBgQ3JlYXRlIFxcXCIke2ZpbHRlclRleHR9XFxcImAgOiBvcHRpb24ubGFiZWw7XG4gIH07XG4gIGV4cG9ydCBsZXQgb3B0aW9uSWRlbnRpZmllciA9ICd2YWx1ZSc7XG4gIGV4cG9ydCBsZXQgbG9hZE9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgaGFzRXJyb3IgPSBmYWxzZTtcbiAgZXhwb3J0IGxldCBjb250YWluZXJTdHlsZXMgPSAnJztcbiAgZXhwb3J0IGxldCBnZXRTZWxlY3Rpb25MYWJlbCA9IChvcHRpb24pID0+IHtcbiAgICBpZiAob3B0aW9uKSByZXR1cm4gb3B0aW9uLmxhYmVsXG4gIH07XG5cbiAgZXhwb3J0IGxldCBjcmVhdGVHcm91cEhlYWRlckl0ZW0gPSAoZ3JvdXBWYWx1ZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogZ3JvdXBWYWx1ZSxcbiAgICAgIGxhYmVsOiBncm91cFZhbHVlXG4gICAgfVxuICB9O1xuXG4gIGV4cG9ydCBsZXQgY3JlYXRlSXRlbSA9IChmaWx0ZXJUZXh0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBmaWx0ZXJUZXh0LFxuICAgICAgbGFiZWw6IGZpbHRlclRleHRcbiAgICB9O1xuICB9O1xuXG4gIGV4cG9ydCBsZXQgaXNTZWFyY2hhYmxlID0gdHJ1ZTtcbiAgZXhwb3J0IGxldCBpbnB1dFN0eWxlcyA9ICcnO1xuICBleHBvcnQgbGV0IGlzQ2xlYXJhYmxlID0gdHJ1ZTtcbiAgZXhwb3J0IGxldCBpc1dhaXRpbmcgPSBmYWxzZTtcbiAgZXhwb3J0IGxldCBsaXN0UGxhY2VtZW50ID0gJ2F1dG8nO1xuICBleHBvcnQgbGV0IGxpc3RPcGVuID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgbGlzdCA9IHVuZGVmaW5lZDtcbiAgZXhwb3J0IGxldCBpc1ZpcnR1YWxMaXN0ID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgbG9hZE9wdGlvbnNJbnRlcnZhbCA9IDMwMDtcbiAgZXhwb3J0IGxldCBub09wdGlvbnNNZXNzYWdlID0gJ05vIG9wdGlvbnMnO1xuICBleHBvcnQgbGV0IGhpZGVFbXB0eVN0YXRlID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgZmlsdGVyZWRJdGVtcyA9IFtdO1xuICBleHBvcnQgbGV0IGlucHV0QXR0cmlidXRlcyA9IHt9O1xuICBcblxuICBsZXQgdGFyZ2V0O1xuICBsZXQgYWN0aXZlU2VsZWN0ZWRWYWx1ZTtcbiAgbGV0IF9pdGVtcyA9IFtdO1xuICBsZXQgb3JpZ2luYWxJdGVtc0Nsb25lO1xuICBsZXQgY29udGFpbmVyQ2xhc3NlcyA9ICcnO1xuICBsZXQgcHJldl9zZWxlY3RlZFZhbHVlO1xuICBsZXQgcHJldl9saXN0T3BlbjtcbiAgbGV0IHByZXZfZmlsdGVyVGV4dDtcbiAgbGV0IHByZXZfaXNGb2N1c2VkO1xuICBsZXQgcHJldl9maWx0ZXJlZEl0ZW1zO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHJlc2V0RmlsdGVyKCkge1xuICAgIGF3YWl0IHRpY2soKTtcbiAgICBmaWx0ZXJUZXh0ID0gJyc7XG4gIH1cblxuICBjb25zdCBnZXRJdGVtcyA9IGRlYm91bmNlKGFzeW5jICgpID0+IHtcbiAgICBpc1dhaXRpbmcgPSB0cnVlO1xuICAgIFxuICAgIGl0ZW1zID0gYXdhaXQgbG9hZE9wdGlvbnMoZmlsdGVyVGV4dCk7XG4gIFxuICAgIGlzV2FpdGluZyA9IGZhbHNlO1xuICAgIGlzRm9jdXNlZCA9IHRydWU7XG4gICAgbGlzdE9wZW4gPSB0cnVlO1xuICB9LCBsb2FkT3B0aW9uc0ludGVydmFsKTtcblxuICAkOiB7XG4gICAgY29udGFpbmVyQ2xhc3NlcyA9IGBzZWxlY3RDb250YWluZXJgO1xuICAgIGNvbnRhaW5lckNsYXNzZXMgKz0gaXNNdWx0aSA/ICcgbXVsdGlTZWxlY3QnIDogJyc7XG4gICAgY29udGFpbmVyQ2xhc3NlcyArPSBpc0Rpc2FibGVkID8gJyBkaXNhYmxlZCcgOiAnJztcbiAgICBjb250YWluZXJDbGFzc2VzICs9IGlzRm9jdXNlZCA/ICcgZm9jdXNlZCcgOiAnJztcbiAgfVxuXG4gICQ6IHNob3dTZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZFZhbHVlICYmIGZpbHRlclRleHQubGVuZ3RoID09PSAwO1xuXG4gICQ6IHBsYWNlaG9sZGVyVGV4dCA9IHNlbGVjdGVkVmFsdWUgPyAnJyA6IHBsYWNlaG9sZGVyO1xuXG4gIGxldCBfaW5wdXRBdHRyaWJ1dGVzID0ge307XG4gICQ6IHtcbiAgICBfaW5wdXRBdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbihpbnB1dEF0dHJpYnV0ZXMsIHtcbiAgICAgIGF1dG9jb21wbGV0ZTogJ29mZicsXG4gICAgICBhdXRvY29ycmVjdDogJ29mZicsXG4gICAgICBzcGVsbGNoZWNrOiBmYWxzZVxuICAgIH0pXG5cbiAgICBpZiAoIWlzU2VhcmNoYWJsZSkge1xuICAgICAgX2lucHV0QXR0cmlidXRlcy5yZWFkb25seSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgJDoge1xuICAgIGxldCBfZmlsdGVyZWRJdGVtcztcbiAgICBsZXQgX2l0ZW1zID0gaXRlbXM7XG5cbiAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiB0eXBlb2YgaXRlbXNbMF0gIT09ICdvYmplY3QnKSB7XG4gICAgICBfaXRlbXMgPSBpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgdmFsdWU6IGl0ZW0sXG4gICAgICAgICAgbGFiZWw6IGl0ZW1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAobG9hZE9wdGlvbnMgJiYgZmlsdGVyVGV4dC5sZW5ndGggPT09IDAgJiYgb3JpZ2luYWxJdGVtc0Nsb25lKSB7XG4gICAgICBfZmlsdGVyZWRJdGVtcyA9IEpTT04ucGFyc2Uob3JpZ2luYWxJdGVtc0Nsb25lKTtcbiAgICAgIF9pdGVtcyA9IEpTT04ucGFyc2Uob3JpZ2luYWxJdGVtc0Nsb25lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX2ZpbHRlcmVkSXRlbXMgPSBsb2FkT3B0aW9ucyA/IGZpbHRlclRleHQubGVuZ3RoID09PSAwID8gW10gOiBfaXRlbXMgOiBfaXRlbXMuZmlsdGVyKGl0ZW0gPT4ge1xuXG4gICAgICAgIGxldCBrZWVwSXRlbSA9IHRydWU7XG5cbiAgICAgICAgaWYgKGlzTXVsdGkgJiYgc2VsZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgIGtlZXBJdGVtID0gIXNlbGVjdGVkVmFsdWUuZmluZCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVtvcHRpb25JZGVudGlmaWVyXSA9PT0gaXRlbVtvcHRpb25JZGVudGlmaWVyXVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtlZXBJdGVtICYmIGZpbHRlclRleHQubGVuZ3RoIDwgMSkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgcmV0dXJuIGtlZXBJdGVtICYmIGdldE9wdGlvbkxhYmVsKGl0ZW0sIGZpbHRlclRleHQpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChncm91cEJ5KSB7XG4gICAgICBjb25zdCBncm91cFZhbHVlcyA9IFtdO1xuICAgICAgY29uc3QgZ3JvdXBzID0ge307XG5cbiAgICAgIF9maWx0ZXJlZEl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBWYWx1ZSA9IGdyb3VwQnkoaXRlbSk7XG5cbiAgICAgICAgaWYgKCFncm91cFZhbHVlcy5pbmNsdWRlcyhncm91cFZhbHVlKSkge1xuICAgICAgICAgIGdyb3VwVmFsdWVzLnB1c2goZ3JvdXBWYWx1ZSk7XG4gICAgICAgICAgZ3JvdXBzW2dyb3VwVmFsdWVdID0gW107XG5cbiAgICAgICAgICBpZihncm91cFZhbHVlKSB7XG4gICAgICAgICAgICBncm91cHNbZ3JvdXBWYWx1ZV0ucHVzaChPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICBjcmVhdGVHcm91cEhlYWRlckl0ZW0oZ3JvdXBWYWx1ZSwgaXRlbSksIFxuICAgICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgIGlkOiBncm91cFZhbHVlLCBcbiAgICAgICAgICAgICAgICBpc0dyb3VwSGVhZGVyOiB0cnVlLCBcbiAgICAgICAgICAgICAgICBpc1NlbGVjdGFibGU6IGlzR3JvdXBIZWFkZXJTZWxlY3RhYmxlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ3JvdXBzW2dyb3VwVmFsdWVdLnB1c2goT2JqZWN0LmFzc2lnbih7IGlzR3JvdXBJdGVtOiAhIWdyb3VwVmFsdWUgfSwgaXRlbSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNvcnRlZEdyb3VwZWRJdGVtcyA9IFtdO1xuXG4gICAgICBncm91cEZpbHRlcihncm91cFZhbHVlcykuZm9yRWFjaCgoZ3JvdXBWYWx1ZSkgPT4ge1xuICAgICAgICBzb3J0ZWRHcm91cGVkSXRlbXMucHVzaCguLi5ncm91cHNbZ3JvdXBWYWx1ZV0pO1xuICAgICAgfSk7XG5cbiAgICAgIGZpbHRlcmVkSXRlbXMgPSBzb3J0ZWRHcm91cGVkSXRlbXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbHRlcmVkSXRlbXMgPSBfZmlsdGVyZWRJdGVtcztcbiAgICB9XG4gIH1cblxuICBiZWZvcmVVcGRhdGUoKCkgPT4ge1xuICAgIGlmIChpc011bHRpICYmIHNlbGVjdGVkVmFsdWUgJiYgc2VsZWN0ZWRWYWx1ZSAmJiBzZWxlY3RlZFZhbHVlLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNoZWNrU2VsZWN0ZWRWYWx1ZUZvckR1cGxpY2F0ZXMoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzTXVsdGkgJiYgc2VsZWN0ZWRWYWx1ZSAmJiBwcmV2X3NlbGVjdGVkVmFsdWUgIT09IHNlbGVjdGVkVmFsdWUpIHtcbiAgICAgIGlmICghcHJldl9zZWxlY3RlZFZhbHVlIHx8IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkVmFsdWVbb3B0aW9uSWRlbnRpZmllcl0pICE9PSBKU09OLnN0cmluZ2lmeShwcmV2X3NlbGVjdGVkVmFsdWVbb3B0aW9uSWRlbnRpZmllcl0pKSB7XG4gICAgICAgIGRpc3BhdGNoKCdzZWxlY3QnLCBzZWxlY3RlZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNNdWx0aSAmJiBKU09OLnN0cmluZ2lmeShzZWxlY3RlZFZhbHVlKSAhPT0gSlNPTi5zdHJpbmdpZnkocHJldl9zZWxlY3RlZFZhbHVlKSkge1xuICAgICAgaWYgKGNoZWNrU2VsZWN0ZWRWYWx1ZUZvckR1cGxpY2F0ZXMoKSkge1xuICAgICAgICBkaXNwYXRjaCgnc2VsZWN0Jywgc2VsZWN0ZWRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbnRhaW5lciAmJiBsaXN0T3BlbiAhPT0gcHJldl9saXN0T3Blbikge1xuICAgICAgaWYgKGxpc3RPcGVuKSB7XG4gICAgICAgIGxvYWRMaXN0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmVMaXN0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbHRlclRleHQgIT09IHByZXZfZmlsdGVyVGV4dCkge1xuICAgICAgaWYgKGZpbHRlclRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpc0ZvY3VzZWQgPSB0cnVlO1xuICAgICAgICBsaXN0T3BlbiA9IHRydWU7XG5cbiAgICAgICAgaWYgKGxvYWRPcHRpb25zKSB7XG4gICAgICAgICAgZ2V0SXRlbXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2FkTGlzdCgpO1xuICAgICAgICAgIGxpc3RPcGVuID0gdHJ1ZTtcblxuICAgICAgICAgIGlmIChpc011bHRpKSB7XG4gICAgICAgICAgICBhY3RpdmVTZWxlY3RlZFZhbHVlID0gdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRMaXN0KFtdKVxuICAgICAgfVxuXG4gICAgICBpZiAobGlzdCkge1xuICAgICAgICBsaXN0LiRzZXQoe1xuICAgICAgICAgIGZpbHRlclRleHRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzRm9jdXNlZCAhPT0gcHJldl9pc0ZvY3VzZWQpIHtcbiAgICAgIGlmIChpc0ZvY3VzZWQgfHwgbGlzdE9wZW4pIHtcbiAgICAgICAgaGFuZGxlRm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc2V0RmlsdGVyKCk7XG4gICAgICAgIGlmIChpbnB1dCkgaW5wdXQuYmx1cigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcmV2X2ZpbHRlcmVkSXRlbXMgIT09IGZpbHRlcmVkSXRlbXMpIHtcbiAgICAgIGxldCBfZmlsdGVyZWRJdGVtcyA9IFsuLi5maWx0ZXJlZEl0ZW1zXTtcblxuICAgICAgaWYgKGlzQ3JlYXRhYmxlICYmIGZpbHRlclRleHQpIHtcbiAgICAgICAgY29uc3QgaXRlbVRvQ3JlYXRlID0ge1xuICAgICAgICAgIC4uLmNyZWF0ZUl0ZW0oZmlsdGVyVGV4dCksXG4gICAgICAgICAgaXNDcmVhdG9yOiB0cnVlXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZXhpc3RpbmdJdGVtV2l0aEZpbHRlclZhbHVlID0gX2ZpbHRlcmVkSXRlbXMuZmluZCgoaXRlbSkgPT4ge1xuICAgICAgICAgIHJldHVybiBpdGVtW29wdGlvbklkZW50aWZpZXJdID09PSBpdGVtVG9DcmVhdGVbb3B0aW9uSWRlbnRpZmllcl07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBleGlzdGluZ1NlbGVjdGlvbldpdGhGaWx0ZXJWYWx1ZTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgIGlmIChpc011bHRpKSB7XG4gICAgICAgICAgICBleGlzdGluZ1NlbGVjdGlvbldpdGhGaWx0ZXJWYWx1ZSA9IHNlbGVjdGVkVmFsdWUuZmluZCgoc2VsZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25bb3B0aW9uSWRlbnRpZmllcl0gPT09IGl0ZW1Ub0NyZWF0ZVtvcHRpb25JZGVudGlmaWVyXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRWYWx1ZVtvcHRpb25JZGVudGlmaWVyXSA9PT0gaXRlbVRvQ3JlYXRlW29wdGlvbklkZW50aWZpZXJdKSB7XG4gICAgICAgICAgICBleGlzdGluZ1NlbGVjdGlvbldpdGhGaWx0ZXJWYWx1ZSA9IHNlbGVjdGVkVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFleGlzdGluZ0l0ZW1XaXRoRmlsdGVyVmFsdWUgJiYgIWV4aXN0aW5nU2VsZWN0aW9uV2l0aEZpbHRlclZhbHVlKSB7XG4gICAgICAgICAgX2ZpbHRlcmVkSXRlbXMgPSBbLi4uX2ZpbHRlcmVkSXRlbXMsIGl0ZW1Ub0NyZWF0ZV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2V0TGlzdChfZmlsdGVyZWRJdGVtcyk7XG4gICAgfVxuXG4gICAgcHJldl9zZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRWYWx1ZTtcbiAgICBwcmV2X2xpc3RPcGVuID0gbGlzdE9wZW47XG4gICAgcHJldl9maWx0ZXJUZXh0ID0gZmlsdGVyVGV4dDtcbiAgICBwcmV2X2lzRm9jdXNlZCA9IGlzRm9jdXNlZDtcbiAgICBwcmV2X2ZpbHRlcmVkSXRlbXMgPSBmaWx0ZXJlZEl0ZW1zO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja1NlbGVjdGVkVmFsdWVGb3JEdXBsaWNhdGVzKCkge1xuICAgIGxldCBub0R1cGxpY2F0ZXMgPSB0cnVlO1xuICAgIGlmIChzZWxlY3RlZFZhbHVlKSB7XG4gICAgICBjb25zdCBpZHMgPSBbXTtcbiAgICAgIGNvbnN0IHVuaXF1ZVZhbHVlcyA9IFtdO1xuXG4gICAgICBzZWxlY3RlZFZhbHVlLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgaWYgKCFpZHMuaW5jbHVkZXModmFsW29wdGlvbklkZW50aWZpZXJdKSkge1xuICAgICAgICAgIGlkcy5wdXNoKHZhbFtvcHRpb25JZGVudGlmaWVyXSk7XG4gICAgICAgICAgdW5pcXVlVmFsdWVzLnB1c2godmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub0R1cGxpY2F0ZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHVuaXF1ZVZhbHVlc1xuICAgIH1cbiAgICByZXR1cm4gbm9EdXBsaWNhdGVzO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gc2V0TGlzdChpdGVtcykge1xuICAgIGF3YWl0IHRpY2soKTtcbiAgICBpZiAobGlzdCkgcmV0dXJuIGxpc3QuJHNldCh7IGl0ZW1zIH0pXG4gICAgaWYgKGxvYWRPcHRpb25zICYmIGl0ZW1zLmxlbmd0aCA+IDApIGxvYWRMaXN0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNdWx0aUl0ZW1DbGVhcihldmVudCkge1xuICAgIGNvbnN0IHsgZGV0YWlsIH0gPSBldmVudDtcbiAgICBjb25zdCBpdGVtVG9SZW1vdmUgPSBzZWxlY3RlZFZhbHVlW2RldGFpbCA/IGRldGFpbC5pIDogc2VsZWN0ZWRWYWx1ZS5sZW5ndGggLSAxXTtcblxuICAgIGlmIChzZWxlY3RlZFZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkVmFsdWUuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtICE9PSBpdGVtVG9SZW1vdmU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCgnY2xlYXInLCBpdGVtVG9SZW1vdmUpO1xuICAgIFxuICAgIGdldFBvc2l0aW9uKCk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcbiAgICBhd2FpdCB0aWNrKCk7XG4gICAgaWYgKCF0YXJnZXQgfHwgIWNvbnRhaW5lcikgcmV0dXJuO1xuICAgIGNvbnN0IHsgdG9wLCBoZWlnaHQsIHdpZHRoIH0gPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0YXJnZXQuc3R5bGVbJ21pbi13aWR0aCddID0gYCR7d2lkdGh9cHhgO1xuICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IGBhdXRvYDtcbiAgICB0YXJnZXQuc3R5bGUubGVmdCA9ICcwJztcblxuICAgIGlmIChsaXN0UGxhY2VtZW50ID09PSAndG9wJykge1xuICAgICAgdGFyZ2V0LnN0eWxlLmJvdHRvbSA9IGAke2hlaWdodCArIDV9cHhgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQuc3R5bGUudG9wID0gYCR7aGVpZ2h0ICsgNX1weGA7XG4gICAgfVxuXG4gICAgdGFyZ2V0ID0gdGFyZ2V0O1xuXG4gICAgaWYgKGxpc3RQbGFjZW1lbnQgPT09ICdhdXRvJyAmJiBpc091dE9mVmlld3BvcnQodGFyZ2V0KS5ib3R0b20pIHtcbiAgICAgIHRhcmdldC5zdHlsZS50b3AgPSBgYDtcbiAgICAgIHRhcmdldC5zdHlsZS5ib3R0b20gPSBgJHtoZWlnaHQgKyA1fXB4YDtcbiAgICB9XG5cbiAgICB0YXJnZXQuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlS2V5RG93bihlKSB7XG4gICAgaWYgKCFpc0ZvY3VzZWQpIHJldHVybjtcblxuICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGlzdE9wZW4gPSB0cnVlO1xuICAgICAgICBhY3RpdmVTZWxlY3RlZFZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxpc3RPcGVuID0gdHJ1ZTtcbiAgICAgICAgYWN0aXZlU2VsZWN0ZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUYWInOlxuICAgICAgICBpZiAoIWxpc3RPcGVuKSBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdCYWNrc3BhY2UnOlxuICAgICAgICBpZiAoIWlzTXVsdGkgfHwgZmlsdGVyVGV4dC5sZW5ndGggPiAwKSByZXR1cm47XG4gICAgICAgIGlmIChpc011bHRpICYmIHNlbGVjdGVkVmFsdWUgJiYgc2VsZWN0ZWRWYWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaGFuZGxlTXVsdGlJdGVtQ2xlYXIoYWN0aXZlU2VsZWN0ZWRWYWx1ZSAhPT0gdW5kZWZpbmVkID8gYWN0aXZlU2VsZWN0ZWRWYWx1ZSA6IHNlbGVjdGVkVmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgaWYgKGFjdGl2ZVNlbGVjdGVkVmFsdWUgPT09IDAgfHwgYWN0aXZlU2VsZWN0ZWRWYWx1ZSA9PT0gdW5kZWZpbmVkKSBicmVhaztcbiAgICAgICAgICBhY3RpdmVTZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRWYWx1ZS5sZW5ndGggPiBhY3RpdmVTZWxlY3RlZFZhbHVlID8gYWN0aXZlU2VsZWN0ZWRWYWx1ZSAtIDEgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICBpZiAobGlzdCkgbGlzdC4kc2V0KHsgaG92ZXJJdGVtSW5kZXg6IC0xIH0pO1xuICAgICAgICBpZiAoIWlzTXVsdGkgfHwgZmlsdGVyVGV4dC5sZW5ndGggPiAwKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGFjdGl2ZVNlbGVjdGVkVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFjdGl2ZVNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlLmxlbmd0aCAtIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRWYWx1ZS5sZW5ndGggPiBhY3RpdmVTZWxlY3RlZFZhbHVlICYmIGFjdGl2ZVNlbGVjdGVkVmFsdWUgIT09IDApIHtcbiAgICAgICAgICBhY3RpdmVTZWxlY3RlZFZhbHVlIC09IDFcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICBpZiAobGlzdCkgbGlzdC4kc2V0KHsgaG92ZXJJdGVtSW5kZXg6IC0xIH0pO1xuICAgICAgICBpZiAoIWlzTXVsdGkgfHwgZmlsdGVyVGV4dC5sZW5ndGggPiAwIHx8IGFjdGl2ZVNlbGVjdGVkVmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBpZiAoYWN0aXZlU2VsZWN0ZWRWYWx1ZSA9PT0gc2VsZWN0ZWRWYWx1ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgYWN0aXZlU2VsZWN0ZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVTZWxlY3RlZFZhbHVlIDwgc2VsZWN0ZWRWYWx1ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgYWN0aXZlU2VsZWN0ZWRWYWx1ZSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUZvY3VzKCkge1xuICAgIGlzRm9jdXNlZCA9IHRydWU7XG4gICAgaWYgKGlucHV0KSBpbnB1dC5mb2N1cygpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTGlzdCgpIHtcbiAgICByZXNldEZpbHRlcigpO1xuICAgIGFjdGl2ZVNlbGVjdGVkVmFsdWUgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIWxpc3QpIHJldHVybjtcbiAgICBsaXN0LiRkZXN0cm95KCk7XG4gICAgbGlzdCA9IHVuZGVmaW5lZDtcblxuICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG4gICAgaWYgKHRhcmdldC5wYXJlbnROb2RlKSB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpO1xuICAgIHRhcmdldCA9IHVuZGVmaW5lZDtcblxuICAgIGxpc3QgPSBsaXN0O1xuICAgIHRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVdpbmRvd0NsaWNrKGV2ZW50KSB7XG4gICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcbiAgICBpZiAoY29udGFpbmVyLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICBsaXN0T3BlbiA9IGZhbHNlO1xuICAgIGFjdGl2ZVNlbGVjdGVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGlucHV0KSBpbnB1dC5ibHVyKCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVDbGljaygpIHtcbiAgICBpZiAoaXNEaXNhYmxlZCkgcmV0dXJuO1xuICAgIGlzRm9jdXNlZCA9IHRydWU7XG4gICAgbGlzdE9wZW4gPSAhbGlzdE9wZW47XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gaGFuZGxlQ2xlYXIoKSB7XG4gICAgZGlzcGF0Y2goJ2NsZWFyJywgc2VsZWN0ZWRWYWx1ZSk7XG4gICAgc2VsZWN0ZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICBsaXN0T3BlbiA9IGZhbHNlO1xuICAgIGhhbmRsZUZvY3VzKCk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBsb2FkTGlzdCgpIHtcbiAgICBhd2FpdCB0aWNrKCk7XG4gICAgaWYgKHRhcmdldCAmJiBsaXN0KSByZXR1cm47XG5cbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgSXRlbSxcbiAgICAgIGZpbHRlclRleHQsXG4gICAgICBvcHRpb25JZGVudGlmaWVyLFxuICAgICAgbm9PcHRpb25zTWVzc2FnZSxcbiAgICAgIGhpZGVFbXB0eVN0YXRlLFxuICAgICAgaXNDcmVhdGFibGUsXG4gICAgICBpc1ZpcnR1YWxMaXN0LFxuICAgICAgc2VsZWN0ZWRWYWx1ZSxcbiAgICAgIGlzTXVsdGksXG4gICAgICBnZXRHcm91cEhlYWRlckxhYmVsLFxuICAgICAgaXRlbXM6IGZpbHRlcmVkSXRlbXNcbiAgICB9O1xuXG4gICAgaWYgKGdldE9wdGlvbkxhYmVsKSB7XG4gICAgICBkYXRhLmdldE9wdGlvbkxhYmVsID0gZ2V0T3B0aW9uTGFiZWw7XG4gICAgfVxuXG4gICAgdGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICBPYmplY3QuYXNzaWduKHRhcmdldC5zdHlsZSwge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAnei1pbmRleCc6IDIsXG4gICAgICAndmlzaWJpbGl0eSc6ICdoaWRkZW4nXG4gICAgfSk7XG5cbiAgICBsaXN0ID0gbGlzdDtcbiAgICB0YXJnZXQgPSB0YXJnZXQ7XG4gICAgaWYgKGNvbnRhaW5lcikgY29udGFpbmVyLmFwcGVuZENoaWxkKHRhcmdldCk7XG5cbiAgICBsaXN0ID0gbmV3IExpc3Qoe1xuICAgICAgdGFyZ2V0LFxuICAgICAgcHJvcHM6IGRhdGFcbiAgICB9KTtcblxuICAgIGxpc3QuJG9uKCdpdGVtU2VsZWN0ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgZGV0YWlsIH0gPSBldmVudDtcblxuICAgICAgaWYgKGRldGFpbCkge1xuICAgICAgICBjb25zdCBpdGVtID0gT2JqZWN0LmFzc2lnbih7fSwgZGV0YWlsKTtcblxuICAgICAgICBpZiAoaXNNdWx0aSkge1xuICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlID8gc2VsZWN0ZWRWYWx1ZS5jb25jYXQoW2l0ZW1dKSA6IFtpdGVtXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gaXRlbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc2V0RmlsdGVyKCk7XG4gICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGxpc3RPcGVuID0gZmFsc2U7XG4gICAgICAgICAgYWN0aXZlU2VsZWN0ZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsaXN0LiRvbignaXRlbUNyZWF0ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgZGV0YWlsIH0gPSBldmVudDtcbiAgICAgIGlmIChpc011bHRpKSB7XG4gICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlIHx8IFtdO1xuICAgICAgICBzZWxlY3RlZFZhbHVlID0gWy4uLnNlbGVjdGVkVmFsdWUsIGNyZWF0ZUl0ZW0oZGV0YWlsKV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGVkVmFsdWUgPSBjcmVhdGVJdGVtKGRldGFpbClcbiAgICAgIH1cblxuICAgICAgbGlzdE9wZW4gPSBmYWxzZTtcbiAgICAgIGFjdGl2ZVNlbGVjdGVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICByZXNldEZpbHRlcigpO1xuICAgIH0pO1xuXG4gICAgbGlzdCA9IGxpc3QsXG4gICAgdGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGdldFBvc2l0aW9uKCk7XG4gIH1cblxuICBvbk1vdW50KCgpID0+IHtcbiAgICBpZiAoaXNGb2N1c2VkKSBpbnB1dC5mb2N1cygpO1xuICAgIGlmIChsaXN0T3BlbikgbG9hZExpc3QoKTtcblxuICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBvcmlnaW5hbEl0ZW1zQ2xvbmUgPSBKU09OLnN0cmluZ2lmeShpdGVtcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdGVkVmFsdWUpIHtcbiAgICAgIGlmIChpc011bHRpKSB7XG4gICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZFZhbHVlLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogaXRlbSwgbGFiZWw6IGl0ZW0gfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGVkVmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHsgdmFsdWU6IHNlbGVjdGVkVmFsdWUsIGxhYmVsOiBzZWxlY3RlZFZhbHVlIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgb25EZXN0cm95KCgpID0+IHtcbiAgICByZW1vdmVMaXN0KClcbiAgfSk7XG48L3NjcmlwdD5cblxuPHN2ZWx0ZTp3aW5kb3cgb246Y2xpY2s9XCJ7aGFuZGxlV2luZG93Q2xpY2t9XCIgb246a2V5ZG93bj1cIntoYW5kbGVLZXlEb3dufVwiIG9uOnJlc2l6ZT1cIntnZXRQb3NpdGlvbn1cIiAvPlxuXG48ZGl2IGNsYXNzPVwie2NvbnRhaW5lckNsYXNzZXN9IHtoYXNFcnJvciA/ICdoYXNFcnJvcicgOiAnJ31cIiBzdHlsZT1cIntjb250YWluZXJTdHlsZXN9XCIgb246Y2xpY2s9XCJ7aGFuZGxlQ2xpY2t9XCJcbiAgYmluZDp0aGlzPXtjb250YWluZXJ9PlxuXG4gIHsjaWYgaXNNdWx0aSAmJiBzZWxlY3RlZFZhbHVlICYmIHNlbGVjdGVkVmFsdWUubGVuZ3RoID4gMH1cbiAgPHN2ZWx0ZTpjb21wb25lbnRcbiAgICB0aGlzPVwie011bHRpU2VsZWN0aW9ufVwiXG4gICAge3NlbGVjdGVkVmFsdWV9XG4gICAge2dldFNlbGVjdGlvbkxhYmVsfVxuICAgIHthY3RpdmVTZWxlY3RlZFZhbHVlfVxuICAgIHtpc0Rpc2FibGVkfVxuICAgIG9uOm11bHRpSXRlbUNsZWFyPVwie2hhbmRsZU11bHRpSXRlbUNsZWFyfVwiXG4gICAgb246Zm9jdXM9XCJ7aGFuZGxlRm9jdXN9XCJcbiAgLz5cbiAgey9pZn1cblxuICA8aW5wdXRcbiAgICB7Li4uX2lucHV0QXR0cmlidXRlc31cbiAgICBiaW5kOnRoaXM9e2lucHV0fVxuICAgIG9uOmZvY3VzPVwie2hhbmRsZUZvY3VzfVwiXG4gICAgYmluZDp2YWx1ZT1cIntmaWx0ZXJUZXh0fVwiICAgIFxuICAgIHBsYWNlaG9sZGVyPVwie3BsYWNlaG9sZGVyVGV4dH1cIlxuICAgIGRpc2FibGVkPVwie2lzRGlzYWJsZWR9XCJcbiAgICBzdHlsZT1cIntpbnB1dFN0eWxlc31cIlxuICA+XG5cbiAgeyNpZiAhaXNNdWx0aSAmJiBzaG93U2VsZWN0ZWRJdGVtIH1cbiAgPGRpdiBjbGFzcz1cInNlbGVjdGVkSXRlbVwiIG9uOmZvY3VzPVwie2hhbmRsZUZvY3VzfVwiPlxuICAgIDxzdmVsdGU6Y29tcG9uZW50IHRoaXM9XCJ7U2VsZWN0aW9ufVwiIGl0ZW09e3NlbGVjdGVkVmFsdWV9IHtnZXRTZWxlY3Rpb25MYWJlbH0vPlxuICA8L2Rpdj5cbiAgey9pZn1cblxuICB7I2lmIHNob3dTZWxlY3RlZEl0ZW0gJiYgaXNDbGVhcmFibGUgJiYgIWlzRGlzYWJsZWQgJiYgIWlzV2FpdGluZ31cbiAgPGRpdiBjbGFzcz1cImNsZWFyU2VsZWN0XCIgb246Y2xpY2t8cHJldmVudERlZmF1bHQ9XCJ7aGFuZGxlQ2xlYXJ9XCI+XG4gICAgPHN2ZyB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIi0yIC0yIDUwIDUwXCIgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiPlxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICBkPVwiTTM0LjkyMywzNy4yNTFMMjQsMjYuMzI4TDEzLjA3NywzNy4yNTFMOS40MzYsMzMuNjFsMTAuOTIzLTEwLjkyM0w5LjQzNiwxMS43NjVsMy42NDEtMy42NDFMMjQsMTkuMDQ3TDM0LjkyMyw4LjEyNCBsMy42NDEsMy42NDFMMjcuNjQxLDIyLjY4OEwzOC41NjQsMzMuNjFMMzQuOTIzLDM3LjI1MXpcIj48L3BhdGg+XG4gICAgPC9zdmc+XG4gIDwvZGl2PlxuICB7L2lmfVxuXG4gIHsjaWYgIWlzU2VhcmNoYWJsZSAmJiAhaXNEaXNhYmxlZCAmJiAhaXNXYWl0aW5nICYmIChzaG93U2VsZWN0ZWRJdGVtICYmICFpc0NsZWFyYWJsZSB8fCAhc2hvd1NlbGVjdGVkSXRlbSl9XG4gIDxkaXYgY2xhc3M9XCJpbmRpY2F0b3JcIj5cbiAgICA8c3ZnIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgZm9jdXNhYmxlPVwiZmFsc2VcIiBjbGFzcz1cImNzcy0xOWJxaDJyXCI+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTQuNTE2IDcuNTQ4YzAuNDM2LTAuNDQ2IDEuMDQzLTAuNDgxIDEuNTc2IDBsMy45MDggMy43NDcgMy45MDgtMy43NDdjMC41MzMtMC40ODEgMS4xNDEtMC40NDYgMS41NzQgMCAwLjQzNiAwLjQ0NSAwLjQwOCAxLjE5NyAwIDEuNjE1LTAuNDA2IDAuNDE4LTQuNjk1IDQuNTAyLTQuNjk1IDQuNTAyLTAuMjE3IDAuMjIzLTAuNTAyIDAuMzM1LTAuNzg3IDAuMzM1cy0wLjU3LTAuMTEyLTAuNzg5LTAuMzM1YzAgMC00LjI4Ny00LjA4NC00LjY5NS00LjUwMnMtMC40MzYtMS4xNyAwLTEuNjE1elwiPjwvcGF0aD5cbiAgICA8L3N2Zz5cbiAgPC9kaXY+XG4gIHsvaWZ9XG5cbiAgeyNpZiBpc1dhaXRpbmd9XG4gIDxkaXYgY2xhc3M9XCJzcGlubmVyXCI+XG4gICAgPHN2ZyBjbGFzcz1cInNwaW5uZXJfaWNvblwiIHZpZXdCb3g9XCIyNSAyNSA1MCA1MFwiPlxuICAgICAgPGNpcmNsZSBjbGFzcz1cInNwaW5uZXJfcGF0aFwiIGN4PVwiNTBcIiBjeT1cIjUwXCIgcj1cIjIwXCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCI1XCJcbiAgICAgICAgICAgICAgc3Ryb2tlLW1pdGVybGltaXQ9XCIxMFwiPjwvY2lyY2xlPlxuICAgIDwvc3ZnPlxuICA8L2Rpdj5cbiAgey9pZn1cbjwvZGl2PlxuXG48c3R5bGU+XG4gIC5zZWxlY3RDb250YWluZXIge1xuICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLCAxcHggc29saWQgI0Q4REJERik7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyUmFkaXVzLCAzcHgpO1xuICAgIGhlaWdodDogdmFyKC0taGVpZ2h0LCA0MnB4KTtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBwYWRkaW5nOiB2YXIoLS1wYWRkaW5nLCAwIDE2cHgpO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQsICNmZmYpO1xuICB9XG5cbiAgLnNlbGVjdENvbnRhaW5lciBpbnB1dCB7XG4gICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBjb2xvcjogdmFyKC0taW5wdXRDb2xvciwgIzNGNEY1Rik7XG4gICAgaGVpZ2h0OiB2YXIoLS1oZWlnaHQsIDQycHgpO1xuICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1oZWlnaHQsIDQycHgpO1xuICAgIHBhZGRpbmc6IHZhcigtLXBhZGRpbmcsIDAgMTZweCk7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgZm9udC1zaXplOiB2YXIoLS1pbnB1dEZvbnRTaXplLCAxNHB4KTtcbiAgICBsZXR0ZXItc3BhY2luZzogdmFyKC0taW5wdXRMZXR0ZXJTcGFjaW5nLCAtMC4wOHB4KTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogMDtcbiAgfVxuXG4gIC5zZWxlY3RDb250YWluZXIgaW5wdXQ6OnBsYWNlaG9sZGVyIHtcbiAgICBjb2xvcjogdmFyKC0tcGxhY2Vob2xkZXJDb2xvciwgIzc4ODQ4Rik7XG4gIH1cblxuICAuc2VsZWN0Q29udGFpbmVyIGlucHV0OmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lO1xuICB9XG5cbiAgLnNlbGVjdENvbnRhaW5lcjpob3ZlciB7XG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXJIb3ZlckNvbG9yLCAjYjJiOGJmKTtcbiAgfVxuXG4gIC5zZWxlY3RDb250YWluZXIuZm9jdXNlZCB7XG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXJGb2N1c0NvbG9yLCAjMDA2RkU4KTtcbiAgfVxuXG4gIC5zZWxlY3RDb250YWluZXIuZGlzYWJsZWQge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWRpc2FibGVkQmFja2dyb3VuZCwgI0VCRURFRik7XG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1kaXNhYmxlZEJvcmRlckNvbG9yLCAjRUJFREVGKTtcbiAgICBjb2xvcjogdmFyKC0tZGlzYWJsZWRDb2xvciwgI0MxQzZDQyk7XG4gIH1cblxuICAuc2VsZWN0Q29udGFpbmVyLmRpc2FibGVkIGlucHV0OjpwbGFjZWhvbGRlciB7XG4gICAgY29sb3I6IHZhcigtLWRpc2FibGVkUGxhY2Vob2xkZXJDb2xvciwgI0MxQzZDQyk7XG4gIH1cblxuICAuc2VsZWN0ZWRJdGVtIHtcbiAgICBsaW5lLWhlaWdodDogdmFyKC0taGVpZ2h0LCA0MnB4KTtcbiAgICBoZWlnaHQ6IHZhcigtLWhlaWdodCwgNDJweCk7XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgcGFkZGluZzogdmFyKC0tc2VsZWN0ZWRJdGVtUGFkZGluZywgMCAyMHB4IDAgMCk7XG4gIH1cblxuICAuc2VsZWN0ZWRJdGVtOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lO1xuICB9XG5cbiAgLmNsZWFyU2VsZWN0IHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgcmlnaHQ6IHZhcigtLWNsZWFyU2VsZWN0UmlnaHQsIDEwcHgpO1xuICAgIHRvcDogdmFyKC0tY2xlYXJTZWxlY3RUb3AsIDExcHgpO1xuICAgIGJvdHRvbTogdmFyKC0tY2xlYXJTZWxlY3RCb3R0b20sIDExcHgpO1xuICAgIHdpZHRoOiB2YXIoLS1jbGVhclNlbGVjdFdpZHRoLCAyMHB4KTtcbiAgICBjb2xvcjogdmFyKC0tY2xlYXJTZWxlY3RDb2xvciwgI2M1Y2FjZik7XG4gICAgZmxleDogbm9uZSAhaW1wb3J0YW50O1xuICB9XG5cbiAgLmNsZWFyU2VsZWN0OmhvdmVyIHtcbiAgICBjb2xvcjogdmFyKC0tY2xlYXJTZWxlY3RIb3ZlckNvbG9yLCAjMmMzZTUwKTtcbiAgfVxuXG4gIC5zZWxlY3RDb250YWluZXIuZm9jdXNlZCAuY2xlYXJTZWxlY3Qge1xuICAgIGNvbG9yOiB2YXIoLS1jbGVhclNlbGVjdEZvY3VzQ29sb3IsICMzRjRGNUYpXG4gIH1cblxuICAuaW5kaWNhdG9yIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgcmlnaHQ6IHZhcigtLWluZGljYXRvclJpZ2h0LCAxMHB4KTtcbiAgICB0b3A6IHZhcigtLWluZGljYXRvclRvcCwgMTFweCk7XG4gICAgd2lkdGg6IHZhcigtLWluZGljYXRvcldpZHRoLCAyMHB4KTtcbiAgICBoZWlnaHQ6IHZhcigtLWluZGljYXRvckhlaWdodCwgMjBweCk7XG4gICAgY29sb3I6IHZhcigtLWluZGljYXRvckNvbG9yLCAjYzVjYWNmKTtcbiAgfVxuXG4gIC5pbmRpY2F0b3Igc3ZnIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgZmlsbDogdmFyKC0taW5kaWNhdG9yRmlsbCwgY3VycmVudGNvbG9yKTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICBzdHJva2U6IHZhcigtLWluZGljYXRvclN0cm9rZSwgY3VycmVudGNvbG9yKTtcbiAgICBzdHJva2Utd2lkdGg6IDA7XG4gIH1cblxuICAuc3Bpbm5lciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHJpZ2h0OiB2YXIoLS1zcGlubmVyUmlnaHQsIDEwcHgpO1xuICAgIHRvcDogdmFyKC0tc3Bpbm5lckxlZnQsIDExcHgpO1xuICAgIHdpZHRoOiB2YXIoLS1zcGlubmVyV2lkdGgsIDIwcHgpO1xuICAgIGhlaWdodDogdmFyKC0tc3Bpbm5lckhlaWdodCwgMjBweCk7XG4gICAgY29sb3I6IHZhcigtLXNwaW5uZXJDb2xvciwgIzUxY2U2Yyk7XG4gICAgYW5pbWF0aW9uOiByb3RhdGUgMC43NXMgbGluZWFyIGluZmluaXRlO1xuICB9XG5cbiAgLnNwaW5uZXJfaWNvbiB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBtYXJnaW46IGF1dG87XG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IG5vbmU7XG4gIH1cblxuICAuc3Bpbm5lcl9wYXRoIHtcbiAgICBzdHJva2UtZGFzaGFycmF5OiA5MDtcbiAgICBzdHJva2UtbGluZWNhcDogcm91bmQ7XG4gIH1cblxuICAubXVsdGlTZWxlY3Qge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgcGFkZGluZzogdmFyKC0tbXVsdGlTZWxlY3RQYWRkaW5nLCAwIDM1cHggMCAxNnB4KTtcbiAgICBoZWlnaHQ6IGF1dG87XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICB9XG5cbiAgLm11bHRpU2VsZWN0ID4gKiB7XG4gICAgZmxleDogMSAxIDUwcHg7XG4gIH1cblxuICAuc2VsZWN0Q29udGFpbmVyLm11bHRpU2VsZWN0IGlucHV0IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1tdWx0aVNlbGVjdElucHV0UGFkZGluZywgMCk7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG1hcmdpbjogdmFyKC0tbXVsdGlTZWxlY3RJbnB1dE1hcmdpbiwgMCk7XG4gIH1cblxuICAuaGFzRXJyb3Ige1xuICAgIGJvcmRlcjogdmFyKC0tZXJyb3JCb3JkZXIsIDFweCBzb2xpZCAjRkYyRDU1KTtcbiAgfVxuXG4gIEBrZXlmcmFtZXMgcm90YXRlIHtcbiAgICAxMDAlIHtcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgfVxuICB9XG48L3N0eWxlPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQThtQkUsZ0JBQWdCLGVBQUMsQ0FBQyxBQUNoQixNQUFNLENBQUUsSUFBSSxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FDeEMsYUFBYSxDQUFFLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUN2QyxNQUFNLENBQUUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQzNCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsT0FBTyxDQUFFLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUMvQixVQUFVLENBQUUsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEFBQ3JDLENBQUMsQUFFRCwrQkFBZ0IsQ0FBQyxLQUFLLGVBQUMsQ0FBQyxBQUN0QixNQUFNLENBQUUsT0FBTyxDQUNmLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUNqQyxNQUFNLENBQUUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQzNCLFdBQVcsQ0FBRSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDaEMsT0FBTyxDQUFFLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUMvQixLQUFLLENBQUUsSUFBSSxDQUNYLFVBQVUsQ0FBRSxXQUFXLENBQ3ZCLFNBQVMsQ0FBRSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FDckMsY0FBYyxDQUFFLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQ2xELFFBQVEsQ0FBRSxRQUFRLENBQ2xCLElBQUksQ0FBRSxDQUFDLEFBQ1QsQ0FBQyxBQUVELCtCQUFnQixDQUFDLG9CQUFLLGFBQWEsQUFBQyxDQUFDLEFBQ25DLEtBQUssQ0FBRSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxBQUN6QyxDQUFDLEFBRUQsK0JBQWdCLENBQUMsb0JBQUssTUFBTSxBQUFDLENBQUMsQUFDNUIsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBRUQsK0JBQWdCLE1BQU0sQUFBQyxDQUFDLEFBQ3RCLFlBQVksQ0FBRSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxBQUNoRCxDQUFDLEFBRUQsZ0JBQWdCLFFBQVEsZUFBQyxDQUFDLEFBQ3hCLFlBQVksQ0FBRSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxBQUNoRCxDQUFDLEFBRUQsZ0JBQWdCLFNBQVMsZUFBQyxDQUFDLEFBQ3pCLFVBQVUsQ0FBRSxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUM5QyxZQUFZLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FDakQsS0FBSyxDQUFFLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxBQUN0QyxDQUFDLEFBRUQsZ0JBQWdCLHdCQUFTLENBQUMsb0JBQUssYUFBYSxBQUFDLENBQUMsQUFDNUMsS0FBSyxDQUFFLElBQUksMEJBQTBCLENBQUMsUUFBUSxDQUFDLEFBQ2pELENBQUMsQUFFRCxhQUFhLGVBQUMsQ0FBQyxBQUNiLFdBQVcsQ0FBRSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDaEMsTUFBTSxDQUFFLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUMzQixhQUFhLENBQUUsUUFBUSxDQUN2QixVQUFVLENBQUUsTUFBTSxDQUNsQixXQUFXLENBQUUsTUFBTSxDQUNuQixPQUFPLENBQUUsSUFBSSxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQUFDakQsQ0FBQyxBQUVELDRCQUFhLE1BQU0sQUFBQyxDQUFDLEFBQ25CLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyxBQUVELFlBQVksZUFBQyxDQUFDLEFBQ1osUUFBUSxDQUFFLFFBQVEsQ0FDbEIsS0FBSyxDQUFFLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQ3BDLEdBQUcsQ0FBRSxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUNoQyxNQUFNLENBQUUsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FDdEMsS0FBSyxDQUFFLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQ3BDLEtBQUssQ0FBRSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUN2QyxJQUFJLENBQUUsSUFBSSxDQUFDLFVBQVUsQUFDdkIsQ0FBQyxBQUVELDJCQUFZLE1BQU0sQUFBQyxDQUFDLEFBQ2xCLEtBQUssQ0FBRSxJQUFJLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxBQUM5QyxDQUFDLEFBRUQsZ0JBQWdCLHVCQUFRLENBQUMsWUFBWSxlQUFDLENBQUMsQUFDckMsS0FBSyxDQUFFLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDO0VBQzlDLENBQUMsQUFFRCxVQUFVLGVBQUMsQ0FBQyxBQUNWLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEtBQUssQ0FBRSxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUNsQyxHQUFHLENBQUUsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQzlCLEtBQUssQ0FBRSxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUNsQyxNQUFNLENBQUUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FDcEMsS0FBSyxDQUFFLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEFBQ3ZDLENBQUMsQUFFRCx5QkFBVSxDQUFDLEdBQUcsZUFBQyxDQUFDLEFBQ2QsT0FBTyxDQUFFLFlBQVksQ0FDckIsSUFBSSxDQUFFLElBQUksZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUN4QyxXQUFXLENBQUUsQ0FBQyxDQUNkLE1BQU0sQ0FBRSxJQUFJLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUM1QyxZQUFZLENBQUUsQ0FBQyxBQUNqQixDQUFDLEFBRUQsUUFBUSxlQUFDLENBQUMsQUFDUixRQUFRLENBQUUsUUFBUSxDQUNsQixLQUFLLENBQUUsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQ2hDLEdBQUcsQ0FBRSxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FDN0IsS0FBSyxDQUFFLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUNoQyxNQUFNLENBQUUsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQ2xDLEtBQUssQ0FBRSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FDbkMsU0FBUyxDQUFFLHFCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEFBQ3pDLENBQUMsQUFFRCxhQUFhLGVBQUMsQ0FBQyxBQUNiLE9BQU8sQ0FBRSxLQUFLLENBQ2QsTUFBTSxDQUFFLElBQUksQ0FDWixnQkFBZ0IsQ0FBRSxNQUFNLENBQUMsTUFBTSxDQUMvQixLQUFLLENBQUUsSUFBSSxDQUNYLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEdBQUcsQ0FBRSxDQUFDLENBQ04sTUFBTSxDQUFFLENBQUMsQ0FDVCxJQUFJLENBQUUsQ0FBQyxDQUNQLEtBQUssQ0FBRSxDQUFDLENBQ1IsTUFBTSxDQUFFLElBQUksQ0FDWixpQkFBaUIsQ0FBRSxJQUFJLEFBQ3pCLENBQUMsQUFFRCxhQUFhLGVBQUMsQ0FBQyxBQUNiLGdCQUFnQixDQUFFLEVBQUUsQ0FDcEIsY0FBYyxDQUFFLEtBQUssQUFDdkIsQ0FBQyxBQUVELFlBQVksZUFBQyxDQUFDLEFBQ1osT0FBTyxDQUFFLElBQUksQ0FDYixPQUFPLENBQUUsSUFBSSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FDakQsTUFBTSxDQUFFLElBQUksQ0FDWixTQUFTLENBQUUsSUFBSSxBQUNqQixDQUFDLEFBRUQsMkJBQVksQ0FBRyxlQUFFLENBQUMsQUFDaEIsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxBQUNoQixDQUFDLEFBRUQsZ0JBQWdCLDJCQUFZLENBQUMsS0FBSyxlQUFDLENBQUMsQUFDbEMsT0FBTyxDQUFFLElBQUkseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQzFDLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE1BQU0sQ0FBRSxJQUFJLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxBQUMxQyxDQUFDLEFBRUQsU0FBUyxlQUFDLENBQUMsQUFDVCxNQUFNLENBQUUsSUFBSSxhQUFhLENBQUMsa0JBQWtCLENBQUMsQUFDL0MsQ0FBQyxBQUVELFdBQVcscUJBQU8sQ0FBQyxBQUNqQixJQUFJLEFBQUMsQ0FBQyxBQUNKLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxBQUMzQixDQUFDLEFBQ0gsQ0FBQyJ9 */";
    	append(document_1.head, style);
    }

    // (565:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_4(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.MultiSelection;

    	function switch_props(ctx) {
    		return {
    			props: {
    			selectedValue: ctx.selectedValue,
    			getSelectionLabel: ctx.getSelectionLabel,
    			activeSelectedValue: ctx.activeSelectedValue,
    			isDisabled: ctx.isDisabled
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", ctx.handleMultiItemClear);
    		switch_instance.$on("focus", ctx.handleFocus);
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target_1, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target_1, anchor);
    			}

    			insert(target_1, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.selectedValue) switch_instance_changes.selectedValue = ctx.selectedValue;
    			if (changed.getSelectionLabel) switch_instance_changes.getSelectionLabel = ctx.getSelectionLabel;
    			if (changed.activeSelectedValue) switch_instance_changes.activeSelectedValue = ctx.activeSelectedValue;
    			if (changed.isDisabled) switch_instance_changes.isDisabled = ctx.isDisabled;

    			if (switch_value !== (switch_value = ctx.MultiSelection)) {
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
    					switch_instance.$on("multiItemClear", ctx.handleMultiItemClear);
    					switch_instance.$on("focus", ctx.handleFocus);

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
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
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (587:2) {#if !isMulti && showSelectedItem }
    function create_if_block_3$1(ctx) {
    	var div, current, dispose;

    	var switch_value = ctx.Selection;

    	function switch_props(ctx) {
    		return {
    			props: {
    			item: ctx.selectedValue,
    			getSelectionLabel: ctx.getSelectionLabel
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			attr(div, "class", "selectedItem svelte-1ik40xa");
    			add_location(div, file$b, 587, 2, 15285);
    			dispose = listen(div, "focus", ctx.handleFocus);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.selectedValue) switch_instance_changes.item = ctx.selectedValue;
    			if (changed.getSelectionLabel) switch_instance_changes.getSelectionLabel = ctx.getSelectionLabel;

    			if (switch_value !== (switch_value = ctx.Selection)) {
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

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
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
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance);
    			dispose();
    		}
    	};
    }

    // (593:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_2$1(ctx) {
    	var div, svg, path, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill", "currentColor");
    			attr(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$b, 596, 6, 15688);
    			attr(svg, "width", "100%");
    			attr(svg, "height", "100%");
    			attr(svg, "viewBox", "-2 -2 50 50");
    			attr(svg, "focusable", "false");
    			attr(svg, "role", "presentation");
    			attr(svg, "class", "svelte-1ik40xa");
    			add_location(svg, file$b, 594, 4, 15580);
    			attr(div, "class", "clearSelect svelte-1ik40xa");
    			add_location(div, file$b, 593, 2, 15510);
    			dispose = listen(div, "click", prevent_default(ctx.handleClear));
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div, anchor);
    			append(div, svg);
    			append(svg, path);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (603:2) {#if !isSearchable && !isDisabled && !isWaiting && (showSelectedItem && !isClearable || !showSelectedItem)}
    function create_if_block_1$1(ctx) {
    	var div, svg, path;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$b, 605, 6, 16172);
    			attr(svg, "width", "100%");
    			attr(svg, "height", "100%");
    			attr(svg, "viewBox", "0 0 20 20");
    			attr(svg, "focusable", "false");
    			attr(svg, "class", "css-19bqh2r svelte-1ik40xa");
    			add_location(svg, file$b, 604, 4, 16075);
    			attr(div, "class", "indicator svelte-1ik40xa");
    			add_location(div, file$b, 603, 2, 16047);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div, anchor);
    			append(div, svg);
    			append(svg, path);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (612:2) {#if isWaiting}
    function create_if_block$4(ctx) {
    	var div, svg, circle;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr(circle, "class", "spinner_path svelte-1ik40xa");
    			attr(circle, "cx", "50");
    			attr(circle, "cy", "50");
    			attr(circle, "r", "20");
    			attr(circle, "fill", "none");
    			attr(circle, "stroke", "currentColor");
    			attr(circle, "stroke-width", "5");
    			attr(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$b, 614, 6, 16606);
    			attr(svg, "class", "spinner_icon svelte-1ik40xa");
    			attr(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$b, 613, 4, 16551);
    			attr(div, "class", "spinner svelte-1ik40xa");
    			add_location(div, file$b, 612, 2, 16525);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div, anchor);
    			append(div, svg);
    			append(svg, circle);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var div, t0, input_1, t1, t2, t3, t4, div_class_value, current, dispose;

    	var if_block0 = (ctx.isMulti && ctx.selectedValue && ctx.selectedValue.length > 0) && create_if_block_4(ctx);

    	var input_1_levels = [
    		ctx._inputAttributes,
    		{ placeholder: ctx.placeholderText },
    		{ disabled: ctx.isDisabled },
    		{ style: ctx.inputStyles },
    		{ class: "svelte-1ik40xa" }
    	];

    	var input_1_data = {};
    	for (var i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	var if_block1 = (!ctx.isMulti && ctx.showSelectedItem) && create_if_block_3$1(ctx);

    	var if_block2 = (ctx.showSelectedItem && ctx.isClearable && !ctx.isDisabled && !ctx.isWaiting) && create_if_block_2$1(ctx);

    	var if_block3 = (!ctx.isSearchable && !ctx.isDisabled && !ctx.isWaiting && (ctx.showSelectedItem && !ctx.isClearable || !ctx.showSelectedItem)) && create_if_block_1$1();

    	var if_block4 = (ctx.isWaiting) && create_if_block$4();

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input_1 = element("input");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			set_attributes(input_1, input_1_data);
    			add_location(input_1, file$b, 576, 2, 15032);
    			attr(div, "class", div_class_value = "" + ctx.containerClasses + " " + (ctx.hasError ? 'hasError' : '') + " svelte-1ik40xa");
    			attr(div, "style", ctx.containerStyles);
    			add_location(div, file$b, 561, 0, 14606);

    			dispose = [
    				listen(window, "click", ctx.handleWindowClick),
    				listen(window, "keydown", ctx.handleKeyDown),
    				listen(window, "resize", ctx.getPosition),
    				listen(input_1, "input", ctx.input_1_input_handler),
    				listen(input_1, "focus", ctx.handleFocus),
    				listen(div, "click", ctx.handleClick)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t0);
    			append(div, input_1);

    			input_1.value = ctx.filterText;

    			ctx.input_1_binding(input_1);
    			append(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t2);
    			if (if_block2) if_block2.m(div, null);
    			append(div, t3);
    			if (if_block3) if_block3.m(div, null);
    			append(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			ctx.div_binding(div);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.isMulti && ctx.selectedValue && ctx.selectedValue.length > 0) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_4(ctx);
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

    			if (changed.filterText && (input_1.value !== ctx.filterText)) input_1.value = ctx.filterText;

    			set_attributes(input_1, get_spread_update(input_1_levels, [
    				(changed._inputAttributes) && ctx._inputAttributes,
    				(changed.placeholderText) && { placeholder: ctx.placeholderText },
    				(changed.isDisabled) && { disabled: ctx.isDisabled },
    				(changed.inputStyles) && { style: ctx.inputStyles },
    				{ class: "svelte-1ik40xa" }
    			]));

    			if (!ctx.isMulti && ctx.showSelectedItem) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t2);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.showSelectedItem && ctx.isClearable && !ctx.isDisabled && !ctx.isWaiting) {
    				if (!if_block2) {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(div, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!ctx.isSearchable && !ctx.isDisabled && !ctx.isWaiting && (ctx.showSelectedItem && !ctx.isClearable || !ctx.showSelectedItem)) {
    				if (!if_block3) {
    					if_block3 = create_if_block_1$1();
    					if_block3.c();
    					if_block3.m(div, t4);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (ctx.isWaiting) {
    				if (!if_block4) {
    					if_block4 = create_if_block$4();
    					if_block4.c();
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if ((!current || changed.containerClasses || changed.hasError) && div_class_value !== (div_class_value = "" + ctx.containerClasses + " " + (ctx.hasError ? 'hasError' : '') + " svelte-1ik40xa")) {
    				attr(div, "class", div_class_value);
    			}

    			if (!current || changed.containerStyles) {
    				attr(div, "style", ctx.containerStyles);
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
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block0) if_block0.d();
    			ctx.input_1_binding(null);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			ctx.div_binding(null);
    			run_all(dispose);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();
      let { container = undefined, input = undefined, Item = Item$1, Selection: Selection$1 = Selection, MultiSelection: MultiSelection$1 = MultiSelection, isMulti = false, isDisabled = false, isCreatable = false, isFocused = false, selectedValue = undefined, filterText = '', placeholder = 'Select...', items = [], groupBy = undefined, groupFilter = (groups) => groups } = $$props;
      let { isGroupHeaderSelectable = false, getGroupHeaderLabel = (option) => {
        return option.label
      } } = $$props;
      let { getOptionLabel = (option, filterText) => {
        return option.isCreator ? `Create \"${filterText}\"` : option.label;
      } } = $$props;
      let { optionIdentifier = 'value', loadOptions = undefined, hasError = false, containerStyles = '', getSelectionLabel = (option) => {
        if (option) return option.label
      } } = $$props;

      let { createGroupHeaderItem = (groupValue) => {
        return {
          value: groupValue,
          label: groupValue
        }
      } } = $$props;

      let { createItem = (filterText) => {
        return {
          value: filterText,
          label: filterText
        };
      } } = $$props;

      let { isSearchable = true, inputStyles = '', isClearable = true, isWaiting = false, listPlacement = 'auto', listOpen = false, list = undefined, isVirtualList = false, loadOptionsInterval = 300, noOptionsMessage = 'No options', hideEmptyState = false, filteredItems = [], inputAttributes = {} } = $$props;
      

      let target;
      let activeSelectedValue;
      let originalItemsClone;
      let containerClasses = '';
      let prev_selectedValue;
      let prev_listOpen;
      let prev_filterText;
      let prev_isFocused;
      let prev_filteredItems;

      async function resetFilter() {
        await tick();
        $$invalidate('filterText', filterText = '');
      }

      const getItems = debounce(async () => {
        $$invalidate('isWaiting', isWaiting = true);
        
        $$invalidate('items', items = await loadOptions(filterText));
      
        $$invalidate('isWaiting', isWaiting = false);
        $$invalidate('isFocused', isFocused = true);
        $$invalidate('listOpen', listOpen = true);
      }, loadOptionsInterval);

      let _inputAttributes = {};

      beforeUpdate(() => {
        if (isMulti && selectedValue && selectedValue && selectedValue.length > 1) {
          checkSelectedValueForDuplicates();
        }

        if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
          if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
            dispatch('select', selectedValue);
          }
        }

        if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
          if (checkSelectedValueForDuplicates()) {
            dispatch('select', selectedValue);
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
            $$invalidate('isFocused', isFocused = true);
            $$invalidate('listOpen', listOpen = true);

            if (loadOptions) {
              getItems();
            } else {
              loadList();
              $$invalidate('listOpen', listOpen = true);

              if (isMulti) {
                $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
              }
            }
          } else {
            setList([]);
          }

          if (list) {
            list.$set({
              filterText
            });
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
            const itemToCreate = {
              ...createItem(filterText),
              isCreator: true
            };

            const existingItemWithFilterValue = _filteredItems.find((item) => {
              return item[optionIdentifier] === itemToCreate[optionIdentifier];
            });

            let existingSelectionWithFilterValue;

            if (selectedValue) {
              if (isMulti) {
                existingSelectionWithFilterValue = selectedValue.find((selection) => {
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

          $$invalidate('selectedValue', selectedValue = uniqueValues);
        }
        return noDuplicates;
      }

      async function setList(items) {
        await tick();
        if (list) return list.$set({ items })
        if (loadOptions && items.length > 0) loadList();
      }

      function handleMultiItemClear(event) {
        const { detail } = event;
        const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

        if (selectedValue.length === 1) {
          $$invalidate('selectedValue', selectedValue = undefined);
        } else {
          $$invalidate('selectedValue', selectedValue = selectedValue.filter((item) => {
            return item !== itemToRemove;
          }));
        }

        dispatch('clear', itemToRemove);
        
        getPosition();
      }

      async function getPosition() {
        await tick();
        if (!target || !container) return;
        const { top, height, width } = container.getBoundingClientRect();

        target.style['min-width'] = `${width}px`;    target.style.width = `auto`;    target.style.left = '0';
        if (listPlacement === 'top') {
          target.style.bottom = `${height + 5}px`;    } else {
          target.style.top = `${height + 5}px`;    }

        if (listPlacement === 'auto' && isOutOfViewport(target).bottom) {
          target.style.top = ``;      target.style.bottom = `${height + 5}px`;    }

        target.style.visibility = '';  }

      function handleKeyDown(e) {
        if (!isFocused) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            $$invalidate('listOpen', listOpen = true);
            $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
            break;
          case 'ArrowUp':
            e.preventDefault();
            $$invalidate('listOpen', listOpen = true);
            $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
            break;
          case 'Tab':
            if (!listOpen) $$invalidate('isFocused', isFocused = false);
            break;
          case 'Backspace':
            if (!isMulti || filterText.length > 0) return;
            if (isMulti && selectedValue && selectedValue.length > 0) {
              handleMultiItemClear(activeSelectedValue !== undefined ? activeSelectedValue : selectedValue.length - 1);
              if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;
              $$invalidate('activeSelectedValue', activeSelectedValue = selectedValue.length > activeSelectedValue ? activeSelectedValue - 1 : undefined);
            }
            break;
          case 'ArrowLeft':
            if (list) list.$set({ hoverItemIndex: -1 });
            if (!isMulti || filterText.length > 0) return;

            if (activeSelectedValue === undefined) {
              $$invalidate('activeSelectedValue', activeSelectedValue = selectedValue.length - 1);
            } else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
              $$invalidate('activeSelectedValue', activeSelectedValue -= 1);
            }
            break;
          case 'ArrowRight':
            if (list) list.$set({ hoverItemIndex: -1 });
            if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
            if (activeSelectedValue === selectedValue.length - 1) {
              $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
            } else if (activeSelectedValue < selectedValue.length - 1) {
              $$invalidate('activeSelectedValue', activeSelectedValue += 1);
            }
            break;
        }
      }

      function handleFocus() {
        $$invalidate('isFocused', isFocused = true);
        if (input) input.focus();
      }

      function removeList() {
        resetFilter();
        $$invalidate('activeSelectedValue', activeSelectedValue = undefined);

        if (!list) return;
        list.$destroy();
        $$invalidate('list', list = undefined);

        if (!target) return;
        if (target.parentNode) target.parentNode.removeChild(target);
        target = undefined;

        $$invalidate('list', list);
      }

      function handleWindowClick(event) {
        if (!container) return;
        if (container.contains(event.target)) return;
        $$invalidate('isFocused', isFocused = false);
        $$invalidate('listOpen', listOpen = false);
        $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
        if (input) input.blur();
      }

      function handleClick() {
        if (isDisabled) return;
        $$invalidate('isFocused', isFocused = true);
        $$invalidate('listOpen', listOpen = !listOpen);
      }

      function handleClear() {
        dispatch('clear', selectedValue);
        $$invalidate('selectedValue', selectedValue = undefined);
        $$invalidate('listOpen', listOpen = false);
        handleFocus();
      }

      async function loadList() {
        await tick();
        if (target && list) return;

        const data = {
          Item,
          filterText,
          optionIdentifier,
          noOptionsMessage,
          hideEmptyState,
          isCreatable,
          isVirtualList,
          selectedValue,
          isMulti,
          getGroupHeaderLabel,
          items: filteredItems
        };

        if (getOptionLabel) {
          data.getOptionLabel = getOptionLabel;
        }

        target = document.createElement('div');

        Object.assign(target.style, {
          position: 'absolute',
          'z-index': 2,
          'visibility': 'hidden'
        });

        $$invalidate('list', list);
        if (container) container.appendChild(target);

        $$invalidate('list', list = new List({
          target,
          props: data
        }));

        list.$on('itemSelected', (event) => {
          const { detail } = event;

          if (detail) {
            const item = Object.assign({}, detail);

            if (isMulti) {
              $$invalidate('selectedValue', selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
            } else {
              $$invalidate('selectedValue', selectedValue = item);
            }

            resetFilter();
            $$invalidate('selectedValue', selectedValue);

            setTimeout(() => {
              $$invalidate('listOpen', listOpen = false);
              $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
            });
          }
        });

        list.$on('itemCreated', (event) => {
          const { detail } = event;
          if (isMulti) {
            $$invalidate('selectedValue', selectedValue = selectedValue || []);
            $$invalidate('selectedValue', selectedValue = [...selectedValue, createItem(detail)]);
          } else {
            $$invalidate('selectedValue', selectedValue = createItem(detail));
          }

          $$invalidate('listOpen', listOpen = false);
          $$invalidate('activeSelectedValue', activeSelectedValue = undefined);
          resetFilter();
        });

        $$invalidate('list', list),
        target;
        getPosition();
      }

      onMount(() => {
        if (isFocused) input.focus();
        if (listOpen) loadList();

        if (items && items.length > 0) {
          $$invalidate('originalItemsClone', originalItemsClone = JSON.stringify(items));
        }

        if (selectedValue) {
          if (isMulti) {
            $$invalidate('selectedValue', selectedValue = selectedValue.map(item => {
              if (typeof item === 'string') {
                return { value: item, label: item }
              } else {
                return item;
              }
            }));
          } else {
            if (typeof selectedValue === 'string') {
              $$invalidate('selectedValue', selectedValue = { value: selectedValue, label: selectedValue });
            }
          }
        }
      });

      onDestroy(() => {
        removeList();
      });

    	const writable_props = ['container', 'input', 'Item', 'Selection', 'MultiSelection', 'isMulti', 'isDisabled', 'isCreatable', 'isFocused', 'selectedValue', 'filterText', 'placeholder', 'items', 'groupBy', 'groupFilter', 'isGroupHeaderSelectable', 'getGroupHeaderLabel', 'getOptionLabel', 'optionIdentifier', 'loadOptions', 'hasError', 'containerStyles', 'getSelectionLabel', 'createGroupHeaderItem', 'createItem', 'isSearchable', 'inputStyles', 'isClearable', 'isWaiting', 'listPlacement', 'listOpen', 'list', 'isVirtualList', 'loadOptionsInterval', 'noOptionsMessage', 'hideEmptyState', 'filteredItems', 'inputAttributes'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate('filterText', filterText);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('input', input = $$value);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('container', container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('container' in $$props) $$invalidate('container', container = $$props.container);
    		if ('input' in $$props) $$invalidate('input', input = $$props.input);
    		if ('Item' in $$props) $$invalidate('Item', Item = $$props.Item);
    		if ('Selection' in $$props) $$invalidate('Selection', Selection$1 = $$props.Selection);
    		if ('MultiSelection' in $$props) $$invalidate('MultiSelection', MultiSelection$1 = $$props.MultiSelection);
    		if ('isMulti' in $$props) $$invalidate('isMulti', isMulti = $$props.isMulti);
    		if ('isDisabled' in $$props) $$invalidate('isDisabled', isDisabled = $$props.isDisabled);
    		if ('isCreatable' in $$props) $$invalidate('isCreatable', isCreatable = $$props.isCreatable);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    		if ('selectedValue' in $$props) $$invalidate('selectedValue', selectedValue = $$props.selectedValue);
    		if ('filterText' in $$props) $$invalidate('filterText', filterText = $$props.filterText);
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('groupBy' in $$props) $$invalidate('groupBy', groupBy = $$props.groupBy);
    		if ('groupFilter' in $$props) $$invalidate('groupFilter', groupFilter = $$props.groupFilter);
    		if ('isGroupHeaderSelectable' in $$props) $$invalidate('isGroupHeaderSelectable', isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ('getGroupHeaderLabel' in $$props) $$invalidate('getGroupHeaderLabel', getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ('getOptionLabel' in $$props) $$invalidate('getOptionLabel', getOptionLabel = $$props.getOptionLabel);
    		if ('optionIdentifier' in $$props) $$invalidate('optionIdentifier', optionIdentifier = $$props.optionIdentifier);
    		if ('loadOptions' in $$props) $$invalidate('loadOptions', loadOptions = $$props.loadOptions);
    		if ('hasError' in $$props) $$invalidate('hasError', hasError = $$props.hasError);
    		if ('containerStyles' in $$props) $$invalidate('containerStyles', containerStyles = $$props.containerStyles);
    		if ('getSelectionLabel' in $$props) $$invalidate('getSelectionLabel', getSelectionLabel = $$props.getSelectionLabel);
    		if ('createGroupHeaderItem' in $$props) $$invalidate('createGroupHeaderItem', createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ('createItem' in $$props) $$invalidate('createItem', createItem = $$props.createItem);
    		if ('isSearchable' in $$props) $$invalidate('isSearchable', isSearchable = $$props.isSearchable);
    		if ('inputStyles' in $$props) $$invalidate('inputStyles', inputStyles = $$props.inputStyles);
    		if ('isClearable' in $$props) $$invalidate('isClearable', isClearable = $$props.isClearable);
    		if ('isWaiting' in $$props) $$invalidate('isWaiting', isWaiting = $$props.isWaiting);
    		if ('listPlacement' in $$props) $$invalidate('listPlacement', listPlacement = $$props.listPlacement);
    		if ('listOpen' in $$props) $$invalidate('listOpen', listOpen = $$props.listOpen);
    		if ('list' in $$props) $$invalidate('list', list = $$props.list);
    		if ('isVirtualList' in $$props) $$invalidate('isVirtualList', isVirtualList = $$props.isVirtualList);
    		if ('loadOptionsInterval' in $$props) $$invalidate('loadOptionsInterval', loadOptionsInterval = $$props.loadOptionsInterval);
    		if ('noOptionsMessage' in $$props) $$invalidate('noOptionsMessage', noOptionsMessage = $$props.noOptionsMessage);
    		if ('hideEmptyState' in $$props) $$invalidate('hideEmptyState', hideEmptyState = $$props.hideEmptyState);
    		if ('filteredItems' in $$props) $$invalidate('filteredItems', filteredItems = $$props.filteredItems);
    		if ('inputAttributes' in $$props) $$invalidate('inputAttributes', inputAttributes = $$props.inputAttributes);
    	};

    	let showSelectedItem, placeholderText;

    	$$self.$$.update = ($$dirty = { isMulti: 1, isDisabled: 1, isFocused: 1, selectedValue: 1, filterText: 1, placeholder: 1, inputAttributes: 1, isSearchable: 1, items: 1, loadOptions: 1, originalItemsClone: 1, optionIdentifier: 1, getOptionLabel: 1, groupBy: 1, createGroupHeaderItem: 1, isGroupHeaderSelectable: 1, groupFilter: 1 }) => {
    		if ($$dirty.isMulti || $$dirty.isDisabled || $$dirty.isFocused) { {
            $$invalidate('containerClasses', containerClasses = `selectContainer`);
            $$invalidate('containerClasses', containerClasses += isMulti ? ' multiSelect' : '');
            $$invalidate('containerClasses', containerClasses += isDisabled ? ' disabled' : '');
            $$invalidate('containerClasses', containerClasses += isFocused ? ' focused' : '');
          } }
    		if ($$dirty.selectedValue || $$dirty.filterText) { $$invalidate('showSelectedItem', showSelectedItem = selectedValue && filterText.length === 0); }
    		if ($$dirty.selectedValue || $$dirty.placeholder) { $$invalidate('placeholderText', placeholderText = selectedValue ? '' : placeholder); }
    		if ($$dirty.inputAttributes || $$dirty.isSearchable) { {
            $$invalidate('_inputAttributes', _inputAttributes = Object.assign(inputAttributes, {
              autocomplete: 'off',
              autocorrect: 'off',
              spellcheck: false
            }));
        
            if (!isSearchable) {
              _inputAttributes.readonly = true; $$invalidate('_inputAttributes', _inputAttributes), $$invalidate('inputAttributes', inputAttributes), $$invalidate('isSearchable', isSearchable);
            }
          } }
    		if ($$dirty.items || $$dirty.loadOptions || $$dirty.filterText || $$dirty.originalItemsClone || $$dirty.isMulti || $$dirty.selectedValue || $$dirty.optionIdentifier || $$dirty.getOptionLabel || $$dirty.groupBy || $$dirty.createGroupHeaderItem || $$dirty.isGroupHeaderSelectable || $$dirty.groupFilter) { {
            let _filteredItems;
            let _items = items;
        
            if (items && items.length > 0 && typeof items[0] !== 'object') {
              _items = items.map((item, index) => {
                return {
                  index,
                  value: item,
                  label: item
                }
              });
            }
        
            if (loadOptions && filterText.length === 0 && originalItemsClone) {
              _filteredItems = JSON.parse(originalItemsClone);
              _items = JSON.parse(originalItemsClone);
            } else {
              _filteredItems = loadOptions ? filterText.length === 0 ? [] : _items : _items.filter(item => {
        
                let keepItem = true;
        
                if (isMulti && selectedValue) {
                  keepItem = !selectedValue.find((value) => {
                    return value[optionIdentifier] === item[optionIdentifier]
                  });
                }
        
                if (keepItem && filterText.length < 1) return true;
        
                return keepItem && getOptionLabel(item, filterText).toLowerCase().includes(filterText.toLowerCase());
              });
            }
        
            if (groupBy) {
              const groupValues = [];
              const groups = {};
        
              _filteredItems.forEach((item) => {
                const groupValue = groupBy(item);
        
                if (!groupValues.includes(groupValue)) {
                  groupValues.push(groupValue);
                  groups[groupValue] = [];
        
                  if(groupValue) {
                    groups[groupValue].push(Object.assign(
                      createGroupHeaderItem(groupValue, item), 
                      { 
                        id: groupValue, 
                        isGroupHeader: true, 
                        isSelectable: isGroupHeaderSelectable
                      }
                    ));
                  }
                }
                
                groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
              });
        
              const sortedGroupedItems = [];
        
              groupFilter(groupValues).forEach((groupValue) => {
                sortedGroupedItems.push(...groups[groupValue]);
              });
        
              $$invalidate('filteredItems', filteredItems = sortedGroupedItems);
            } else {
              $$invalidate('filteredItems', filteredItems = _filteredItems);
            }
          } }
    	};

    	return {
    		container,
    		input,
    		Item,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
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
    		activeSelectedValue,
    		containerClasses,
    		_inputAttributes,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		showSelectedItem,
    		placeholderText,
    		input_1_input_handler,
    		input_1_binding,
    		div_binding
    	};
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document_1.getElementById("svelte-1ik40xa-style")) add_css$9();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["container", "input", "Item", "Selection", "MultiSelection", "isMulti", "isDisabled", "isCreatable", "isFocused", "selectedValue", "filterText", "placeholder", "items", "groupBy", "groupFilter", "isGroupHeaderSelectable", "getGroupHeaderLabel", "getOptionLabel", "optionIdentifier", "loadOptions", "hasError", "containerStyles", "getSelectionLabel", "createGroupHeaderItem", "createItem", "isSearchable", "inputStyles", "isClearable", "isWaiting", "listPlacement", "listOpen", "list", "isVirtualList", "loadOptionsInterval", "noOptionsMessage", "hideEmptyState", "filteredItems", "inputAttributes", "handleClear"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.handleClear === undefined && !('handleClear' in props)) {
    			console.warn("<Select> was created without expected prop 'handleClear'");
    		}
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

    	get handleClear() {
    		return this.$$.ctx.handleClear;
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/md/MdArrowDropDown.svelte generated by Svelte v3.6.10 */

    const file$c = "node_modules/svelte-icons/md/MdArrowDropDown.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$2(ctx) {
    	var path;

    	return {
    		c: function create() {
    			path = svg_element("path");
    			attr(path, "d", "M7 10l5 5 5-5z");
    			add_location(path, file$c, 4, 10, 151);
    		},

    		m: function mount(target, anchor) {
    			insert(target, path, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(path);
    			}
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	var current;

    	var iconbase_spread_levels = [
    		{ viewBox: "0 0 24 24" },
    		ctx.$$props
    	];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};
    	for (var i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}
    	var iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	return {
    		c: function create() {
    			iconbase.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var iconbase_changes = changed.$$props ? get_spread_update(iconbase_spread_levels, [
    				iconbase_spread_levels[0],
    				ctx.$$props
    			]) : {};
    			if (changed.$$scope) iconbase_changes.$$scope = { changed, ctx };
    			iconbase.$set(iconbase_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    	};

    	return {
    		$$props,
    		$$props: $$props = exclude_internal_props($$props)
    	};
    }

    class MdArrowDropDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, []);
    	}
    }

    /* src/components/OpenSelect.svelte generated by Svelte v3.6.10 */

    const file$d = "src/components/OpenSelect.svelte";

    function add_css$a() {
    	var style = element("style");
    	style.id = 'svelte-1aaw8l0-style';
    	style.textContent = "img.svelte-1aaw8l0{border-radius:50px;height:25px;margin:4px}.container.svelte-1aaw8l0{height:30px;border-radius:5px;display:flex;justify-content:center;align-items:center;margin-right:6px}.container.svelte-1aaw8l0:hover{opacity:0.7 !important}.button.svelte-1aaw8l0{border:none;background-color:transparent;padding:0;margin:0;width:85px;display:flex;justify-content:space-between;align-items:center}.arrowContainer.svelte-1aaw8l0{height:21px;width:16px}@keyframes svelte-1aaw8l0-lds-rolling{0%{-webkit-transform:translate(-50%, -50%) rotate(0deg);transform:translate(-50%, -50%) rotate(0deg)}100%{-webkit-transform:translate(-50%, -50%) rotate(360deg);transform:translate(-50%, -50%) rotate(360deg)}}@-webkit-keyframes svelte-1aaw8l0-lds-rolling{0%{-webkit-transform:translate(-50%, -50%) rotate(0deg);transform:translate(-50%, -50%) rotate(0deg)}100%{-webkit-transform:translate(-50%, -50%) rotate(360deg);transform:translate(-50%, -50%) rotate(360deg)}}.lds-rolling.svelte-1aaw8l0{position:relative}.lds-rolling.svelte-1aaw8l0 div.svelte-1aaw8l0,.lds-rolling.svelte-1aaw8l0 div.svelte-1aaw8l0:after{position:absolute;width:100px;height:100px;border:14px solid black;border-top-color:transparent;border-radius:50%}.lds-rolling.svelte-1aaw8l0 div.svelte-1aaw8l0{-webkit-animation:svelte-1aaw8l0-lds-rolling 1.3s linear infinite;animation:svelte-1aaw8l0-lds-rolling 1.3s linear infinite;top:100px;left:100px}.lds-rolling.svelte-1aaw8l0 div.svelte-1aaw8l0:after{-webkit-transform:rotate(90deg);transform:rotate(90deg)}.lds-rolling.svelte-1aaw8l0{width:24px !important;height:24px !important;-webkit-transform:translate(-12px, -12px) scale(0.12) translate(12px, 12px);transform:translate(-12px, -12px) scale(0.12) translate(12px, 12px)}.loadingContainer.svelte-1aaw8l0{border:none;background-color:transparent;width:85px;display:flex;justify-content:center;align-items:center}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlblNlbGVjdC5zdmVsdGUiLCJzb3VyY2VzIjpbIk9wZW5TZWxlY3Quc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciB9IGZyb20gXCJzdmVsdGVcIjtcbiAgaW1wb3J0IFNlbGVjdCBmcm9tIFwic3ZlbHRlLXNlbGVjdFwiO1xuICBpbXBvcnQgTWRBcnJvd0Ryb3BEb3duIGZyb20gXCJzdmVsdGUtaWNvbnMvbWQvTWRBcnJvd0Ryb3BEb3duLnN2ZWx0ZVwiO1xuICBpbXBvcnQgUmVxdWlyZWQgZnJvbSBcIi4uL3V0aWxzL1JlcXVpcmVkXCI7XG5cbiAgZXhwb3J0IGxldCBiZ0NvbG9yID0gUmVxdWlyZWQoXCJiZ0NvbG9yXCIpO1xuICBleHBvcnQgbGV0IGZvbnRDb2xvciA9IFJlcXVpcmVkKFwiZm9udENvbG9yXCIpO1xuICBleHBvcnQgbGV0IGJvcmRlckNvbG9yID0gUmVxdWlyZWQoXCJib3JkZXJDb2xvclwiKTtcbiAgZXhwb3J0IGxldCBhcnJvd0NvbG9yID0gUmVxdWlyZWQoXCJhcnJvd0NvbG9yXCIpO1xuICBleHBvcnQgbGV0IHRva2VuID0gUmVxdWlyZWQoXCJ0b2tlblwiKTtcbiAgZXhwb3J0IGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuICBleHBvcnQgbGV0IGxvYWRpbmcgPSB0cnVlO1xuXG4gIGNvbnN0IGN1c3RvbVNlbGVjdFN0eWxlID0gYFxuICAgIGJhY2tncm91bmQtY29sb3I6ICR7YmdDb2xvcn07XG4gICAgYm9yZGVyOiAke2JvcmRlckNvbG9yfSBzb2xpZCAxcHg7XG4gICAgb3BhY2l0eTogJHtkaXNhYmxlZCA/IDAuNzUgOiAxfTtcbiAgICAkeyFsb2FkaW5nID8gXCJjdXJzb3I6IHBvaW50ZXJcIiA6IG51bGx9O1xuICBgO1xuXG4gIGNvbnN0IHNlbGVjdEFycm93U3R5bGUgPSBgXG4gICAgY29sb3I6ICR7YXJyb3dDb2xvcn07XG4gIGA7XG5cbiAgY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcblxuICBjb25zdCBvbkNsaWNrID0gZSA9PiB7XG4gICAgaWYgKGRpc2FibGVkKSByZXR1cm47XG5cbiAgICBkaXNwYXRjaChcImNsaWNrXCIsIGUpO1xuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgaW1nIHtcbiAgICBib3JkZXItcmFkaXVzOiA1MHB4O1xuICAgIGhlaWdodDogMjVweDtcbiAgICBtYXJnaW46IDRweDtcbiAgfVxuXG4gIC5jb250YWluZXIge1xuICAgIGhlaWdodDogMzBweDtcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIG1hcmdpbi1yaWdodDogNnB4O1xuICB9XG5cbiAgLmNvbnRhaW5lcjpob3ZlciB7XG4gICAgb3BhY2l0eTogMC43ICFpbXBvcnRhbnQ7XG4gIH1cblxuICAuYnV0dG9uIHtcbiAgICBib3JkZXI6IG5vbmU7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW46IDA7XG4gICAgd2lkdGg6IDg1cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuXG4gIC5hcnJvd0NvbnRhaW5lciB7XG4gICAgaGVpZ2h0OiAyMXB4O1xuICAgIHdpZHRoOiAxNnB4O1xuICB9XG5cbiAgQGtleWZyYW1lcyBsZHMtcm9sbGluZyB7XG4gICAgMCUge1xuICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGUoMGRlZyk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGUoMGRlZyk7XG4gICAgfVxuICAgIDEwMCUge1xuICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGUoMzYwZGVnKTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZSgzNjBkZWcpO1xuICAgIH1cbiAgfVxuICBALXdlYmtpdC1rZXlmcmFtZXMgbGRzLXJvbGxpbmcge1xuICAgIDAlIHtcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKDBkZWcpO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKDBkZWcpO1xuICAgIH1cbiAgICAxMDAlIHtcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgcm90YXRlKDM2MGRlZyk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSByb3RhdGUoMzYwZGVnKTtcbiAgICB9XG4gIH1cbiAgLmxkcy1yb2xsaW5nIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIH1cbiAgLmxkcy1yb2xsaW5nIGRpdixcbiAgLmxkcy1yb2xsaW5nIGRpdjphZnRlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHdpZHRoOiAxMDBweDtcbiAgICBoZWlnaHQ6IDEwMHB4O1xuICAgIGJvcmRlcjogMTRweCBzb2xpZCBibGFjaztcbiAgICBib3JkZXItdG9wLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIH1cbiAgLmxkcy1yb2xsaW5nIGRpdiB7XG4gICAgLXdlYmtpdC1hbmltYXRpb246IGxkcy1yb2xsaW5nIDEuM3MgbGluZWFyIGluZmluaXRlO1xuICAgIGFuaW1hdGlvbjogbGRzLXJvbGxpbmcgMS4zcyBsaW5lYXIgaW5maW5pdGU7XG4gICAgdG9wOiAxMDBweDtcbiAgICBsZWZ0OiAxMDBweDtcbiAgfVxuICAubGRzLXJvbGxpbmcgZGl2OmFmdGVyIHtcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDkwZGVnKTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7XG4gIH1cbiAgLmxkcy1yb2xsaW5nIHtcbiAgICB3aWR0aDogMjRweCAhaW1wb3J0YW50O1xuICAgIGhlaWdodDogMjRweCAhaW1wb3J0YW50O1xuICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTEycHgsIC0xMnB4KSBzY2FsZSgwLjEyKSB0cmFuc2xhdGUoMTJweCwgMTJweCk7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTEycHgsIC0xMnB4KSBzY2FsZSgwLjEyKSB0cmFuc2xhdGUoMTJweCwgMTJweCk7XG4gIH1cbiAgLmxvYWRpbmdDb250YWluZXIge1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICB3aWR0aDogODVweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cbjwvc3R5bGU+XG5cbjxkaXZcbiAgY2xhc3M9XCJjb250YWluZXJcIlxuICBzdHlsZT17Y3VzdG9tU2VsZWN0U3R5bGV9XG4gIG9uOmNsaWNrPXshbG9hZGluZyA/IG9uQ2xpY2sgOiBudWxsfT5cblxuICB7I2lmICFsb2FkaW5nfVxuICAgIDxkaXYgY2xhc3M9XCJidXR0b25cIj5cbiAgICAgIDxpbWcgc3JjPXt0b2tlbi5pbWd9IGFsdD1cInt0b2tlbi5zeW1ib2x9IGxvZ29cIiAvPlxuICAgICAgPGRpdiBzdHlsZT1cImNvbG9yOiB7Zm9udENvbG9yfTtcIj57dG9rZW4uc3ltYm9sfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImFycm93Q29udGFpbmVyXCIgc3R5bGU9e3NlbGVjdEFycm93U3R5bGV9PlxuICAgICAgICA8TWRBcnJvd0Ryb3BEb3duIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgezplbHNlfVxuICAgIDxkaXYgY2xhc3M9XCJsb2FkaW5nQ29udGFpbmVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibGRzLWNzcyBuZy1zY29wZVwiPlxuICAgICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTAwJVwiIGNsYXNzPVwibGRzLXJvbGxpbmdcIj5cbiAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIHsvaWZ9XG5cbjwvZGl2PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1DRSxHQUFHLGVBQUMsQ0FBQyxBQUNILGFBQWEsQ0FBRSxJQUFJLENBQ25CLE1BQU0sQ0FBRSxJQUFJLENBQ1osTUFBTSxDQUFFLEdBQUcsQUFDYixDQUFDLEFBRUQsVUFBVSxlQUFDLENBQUMsQUFDVixNQUFNLENBQUUsSUFBSSxDQUNaLGFBQWEsQ0FBRSxHQUFHLENBQ2xCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsZUFBZSxDQUFFLE1BQU0sQ0FDdkIsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsWUFBWSxDQUFFLEdBQUcsQUFDbkIsQ0FBQyxBQUVELHlCQUFVLE1BQU0sQUFBQyxDQUFDLEFBQ2hCLE9BQU8sQ0FBRSxHQUFHLENBQUMsVUFBVSxBQUN6QixDQUFDLEFBRUQsT0FBTyxlQUFDLENBQUMsQUFDUCxNQUFNLENBQUUsSUFBSSxDQUNaLGdCQUFnQixDQUFFLFdBQVcsQ0FDN0IsT0FBTyxDQUFFLENBQUMsQ0FDVixNQUFNLENBQUUsQ0FBQyxDQUNULEtBQUssQ0FBRSxJQUFJLENBQ1gsT0FBTyxDQUFFLElBQUksQ0FDYixlQUFlLENBQUUsYUFBYSxDQUM5QixXQUFXLENBQUUsTUFBTSxBQUNyQixDQUFDLEFBRUQsZUFBZSxlQUFDLENBQUMsQUFDZixNQUFNLENBQUUsSUFBSSxDQUNaLEtBQUssQ0FBRSxJQUFJLEFBQ2IsQ0FBQyxBQUVELFdBQVcsMEJBQVksQ0FBQyxBQUN0QixFQUFFLEFBQUMsQ0FBQyxBQUNGLGlCQUFpQixDQUFFLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FDckQsU0FBUyxDQUFFLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQUFDL0MsQ0FBQyxBQUNELElBQUksQUFBQyxDQUFDLEFBQ0osaUJBQWlCLENBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUN2RCxTQUFTLENBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxBQUNqRCxDQUFDLEFBQ0gsQ0FBQyxBQUNELG1CQUFtQiwwQkFBWSxDQUFDLEFBQzlCLEVBQUUsQUFBQyxDQUFDLEFBQ0YsaUJBQWlCLENBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUNyRCxTQUFTLENBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxBQUMvQyxDQUFDLEFBQ0QsSUFBSSxBQUFDLENBQUMsQUFDSixpQkFBaUIsQ0FBRSxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQ3ZELFNBQVMsQ0FBRSxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLEFBQ2pELENBQUMsQUFDSCxDQUFDLEFBQ0QsWUFBWSxlQUFDLENBQUMsQUFDWixRQUFRLENBQUUsUUFBUSxBQUNwQixDQUFDLEFBQ0QsMkJBQVksQ0FBQyxrQkFBRyxDQUNoQiwyQkFBWSxDQUFDLGtCQUFHLE1BQU0sQUFBQyxDQUFDLEFBQ3RCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEtBQUssQ0FBRSxLQUFLLENBQ1osTUFBTSxDQUFFLEtBQUssQ0FDYixNQUFNLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ3hCLGdCQUFnQixDQUFFLFdBQVcsQ0FDN0IsYUFBYSxDQUFFLEdBQUcsQUFDcEIsQ0FBQyxBQUNELDJCQUFZLENBQUMsR0FBRyxlQUFDLENBQUMsQUFDaEIsaUJBQWlCLENBQUUsMEJBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDbkQsU0FBUyxDQUFFLDBCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQzNDLEdBQUcsQ0FBRSxLQUFLLENBQ1YsSUFBSSxDQUFFLEtBQUssQUFDYixDQUFDLEFBQ0QsMkJBQVksQ0FBQyxrQkFBRyxNQUFNLEFBQUMsQ0FBQyxBQUN0QixpQkFBaUIsQ0FBRSxPQUFPLEtBQUssQ0FBQyxDQUNoQyxTQUFTLENBQUUsT0FBTyxLQUFLLENBQUMsQUFDMUIsQ0FBQyxBQUNELFlBQVksZUFBQyxDQUFDLEFBQ1osS0FBSyxDQUFFLElBQUksQ0FBQyxVQUFVLENBQ3RCLE1BQU0sQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUN2QixpQkFBaUIsQ0FBRSxVQUFVLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDNUUsU0FBUyxDQUFFLFVBQVUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxBQUN0RSxDQUFDLEFBQ0QsaUJBQWlCLGVBQUMsQ0FBQyxBQUNqQixNQUFNLENBQUUsSUFBSSxDQUNaLGdCQUFnQixDQUFFLFdBQVcsQ0FDN0IsS0FBSyxDQUFFLElBQUksQ0FDWCxPQUFPLENBQUUsSUFBSSxDQUNiLGVBQWUsQ0FBRSxNQUFNLENBQ3ZCLFdBQVcsQ0FBRSxNQUFNLEFBQ3JCLENBQUMifQ== */";
    	append(document.head, style);
    }

    // (142:2) {:else}
    function create_else_block$1(ctx) {
    	var div3, div2, div1, div0;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "svelte-1aaw8l0");
    			add_location(div0, file$d, 145, 10, 3491);
    			set_style(div1, "width", "100%");
    			set_style(div1, "height", "100%");
    			attr(div1, "class", "lds-rolling svelte-1aaw8l0");
    			add_location(div1, file$d, 144, 8, 3424);
    			attr(div2, "class", "lds-css ng-scope");
    			add_location(div2, file$d, 143, 6, 3385);
    			attr(div3, "class", "loadingContainer svelte-1aaw8l0");
    			add_location(div3, file$d, 142, 4, 3348);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    // (134:2) {#if !loading}
    function create_if_block$5(ctx) {
    	var div2, img, img_src_value, img_alt_value, t0, div0, t1_value = ctx.token.symbol, t1, t2, div1, current;

    	var mdarrowdropdown = new MdArrowDropDown({ $$inline: true });

    	return {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			mdarrowdropdown.$$.fragment.c();
    			attr(img, "src", img_src_value = ctx.token.img);
    			attr(img, "alt", img_alt_value = "" + ctx.token.symbol + " logo");
    			attr(img, "class", "svelte-1aaw8l0");
    			add_location(img, file$d, 135, 6, 3112);
    			set_style(div0, "color", ctx.fontColor);
    			add_location(div0, file$d, 136, 6, 3168);
    			attr(div1, "class", "arrowContainer svelte-1aaw8l0");
    			attr(div1, "style", ctx.selectArrowStyle);
    			add_location(div1, file$d, 137, 6, 3228);
    			attr(div2, "class", "button svelte-1aaw8l0");
    			add_location(div2, file$d, 134, 4, 3085);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, img);
    			append(div2, t0);
    			append(div2, div0);
    			append(div0, t1);
    			append(div2, t2);
    			append(div2, div1);
    			mount_component(mdarrowdropdown, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.token) && img_src_value !== (img_src_value = ctx.token.img)) {
    				attr(img, "src", img_src_value);
    			}

    			if ((!current || changed.token) && img_alt_value !== (img_alt_value = "" + ctx.token.symbol + " logo")) {
    				attr(img, "alt", img_alt_value);
    			}

    			if ((!current || changed.token) && t1_value !== (t1_value = ctx.token.symbol)) {
    				set_data(t1, t1_value);
    			}

    			if (!current || changed.fontColor) {
    				set_style(div0, "color", ctx.fontColor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdarrowdropdown.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(mdarrowdropdown.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(mdarrowdropdown);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	var div, current_block_type_index, if_block, current, dispose;

    	var if_block_creators = [
    		create_if_block$5,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (!ctx.loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "container svelte-1aaw8l0");
    			attr(div, "style", ctx.customSelectStyle);
    			add_location(div, file$d, 128, 0, 2970);
    			dispose = listen(div, "click", !ctx.loading ? ctx.onClick : null);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
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
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, null);
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
    			if (detaching) {
    				detach(div);
    			}

    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	

      let { bgColor = Required("bgColor"), fontColor = Required("fontColor"), borderColor = Required("borderColor"), arrowColor = Required("arrowColor"), token = Required("token"), disabled = false, loading = true } = $$props;

      const customSelectStyle = `
    background-color: ${bgColor};
    border: ${borderColor} solid 1px;
    opacity: ${disabled ? 0.75 : 1};
    ${!loading ? "cursor: pointer" : null};
  `;

      const selectArrowStyle = `
    color: ${arrowColor};
  `;

      const dispatch = createEventDispatcher();

      const onClick = e => {
        if (disabled) return;

        dispatch("click", e);
      };

    	const writable_props = ['bgColor', 'fontColor', 'borderColor', 'arrowColor', 'token', 'disabled', 'loading'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<OpenSelect> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('fontColor' in $$props) $$invalidate('fontColor', fontColor = $$props.fontColor);
    		if ('borderColor' in $$props) $$invalidate('borderColor', borderColor = $$props.borderColor);
    		if ('arrowColor' in $$props) $$invalidate('arrowColor', arrowColor = $$props.arrowColor);
    		if ('token' in $$props) $$invalidate('token', token = $$props.token);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('loading' in $$props) $$invalidate('loading', loading = $$props.loading);
    	};

    	return {
    		bgColor,
    		fontColor,
    		borderColor,
    		arrowColor,
    		token,
    		disabled,
    		loading,
    		customSelectStyle,
    		selectArrowStyle,
    		onClick
    	};
    }

    class OpenSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1aaw8l0-style")) add_css$a();
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["bgColor", "fontColor", "borderColor", "arrowColor", "token", "disabled", "loading"]);
    	}

    	get bgColor() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontColor() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontColor(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrowColor() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrowColor(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get token() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set token(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<OpenSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<OpenSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var index=(e,t)=>{let r=new Set(Object.keys(t));return r.forEach(r=>{e.style.setProperty(`--${r}`,t[r]);}),{update(t){const s=new Set(Object.keys(t));s.forEach(s=>{e.style.setProperty(`--${s}`,t[s]),r.delete(s);}),r.forEach(t=>e.style.removeProperty(`--${t}`)),r=s;}}};var dist=index;

    /* src/components/SelectItem.svelte generated by Svelte v3.6.10 */

    const file$e = "src/components/SelectItem.svelte";

    function add_css$b() {
    	var style = element("style");
    	style.id = 'svelte-1c205bn-style';
    	style.textContent = ".container.svelte-1c205bn{background-color:var(--backgroundColor);width:270px;height:50px;justify-content:flex-start;align-items:center;flex-direction:row;display:flex;color:var(--fontColor)}img.svelte-1c205bn{border-radius:50px;height:30px;margin:10px}.container.svelte-1c205bn:hover{background-color:var(--hoverColor)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0SXRlbS5zdmVsdGUiLCJzb3VyY2VzIjpbIlNlbGVjdEl0ZW0uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XHJcbiAgaW1wb3J0IGNzc1ZhcnMgZnJvbSBcInN2ZWx0ZS1jc3MtdmFyc1wiO1xyXG5cclxuICBleHBvcnQgbGV0IGJhY2tncm91bmRDb2xvciA9IFwid2hpdGVcIjtcclxuICBleHBvcnQgbGV0IGhvdmVyQ29sb3IgPSBcImxpZ2h0Z3JheVwiO1xyXG4gIGV4cG9ydCBsZXQgZm9udENvbG9yID0gXCJibGFja1wiO1xyXG5cclxuICAkOiBiYWNrZ3JvdW5kQ29sb3JzID0ge1xyXG4gICAgYmFja2dyb3VuZENvbG9yLFxyXG4gICAgaG92ZXJDb2xvcixcclxuICAgIGZvbnRDb2xvclxyXG4gIH07XHJcblxyXG4gIGxldCB0b2tlbiA9IHtcclxuICAgIGltZzogXCJodHRwczovL3d3dy5iYW5jb3IubmV0d29yay9zdGF0aWMvaW1hZ2VzL29nX2ltYWdlLmpwZ1wiLFxyXG4gICAgbmFtZTogXCJFdGhlcmV1bVwiXHJcbiAgfTtcclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGU+XHJcbiAgLmNvbnRhaW5lciB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgd2lkdGg6IDI3MHB4O1xyXG4gICAgaGVpZ2h0OiA1MHB4O1xyXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgY29sb3I6IHZhcigtLWZvbnRDb2xvcik7XHJcbiAgfVxyXG4gIGltZyB7XHJcbiAgICBib3JkZXItcmFkaXVzOiA1MHB4O1xyXG4gICAgaGVpZ2h0OiAzMHB4O1xyXG4gICAgbWFyZ2luOiAxMHB4O1xyXG4gIH1cclxuICAuY29udGFpbmVyOmhvdmVyIHtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyQ29sb3IpO1xyXG4gIH1cclxuPC9zdHlsZT5cclxuXHJcbjxkaXYgY2xhc3M9XCJjb250YWluZXJcIiB1c2U6Y3NzVmFycz17YmFja2dyb3VuZENvbG9yc30+XHJcbiAgPGltZyBzcmM9e3Rva2VuLmltZ30gYWx0PVwie3Rva2VuLm5hbWV9IGxvZ29cIiAvPlxyXG4gIDxkaXYgY2xhc3M9XCJsYWJlbFwiPnt0b2tlbi5uYW1lfTwvZGl2PlxyXG48L2Rpdj5cclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9CRSxVQUFVLGVBQUMsQ0FBQyxBQUNWLGdCQUFnQixDQUFFLElBQUksaUJBQWlCLENBQUMsQ0FDeEMsS0FBSyxDQUFFLEtBQUssQ0FDWixNQUFNLENBQUUsSUFBSSxDQUNaLGVBQWUsQ0FBRSxVQUFVLENBQzNCLFdBQVcsQ0FBRSxNQUFNLENBQ25CLGNBQWMsQ0FBRSxHQUFHLENBQ25CLE9BQU8sQ0FBRSxJQUFJLENBQ2IsS0FBSyxDQUFFLElBQUksV0FBVyxDQUFDLEFBQ3pCLENBQUMsQUFDRCxHQUFHLGVBQUMsQ0FBQyxBQUNILGFBQWEsQ0FBRSxJQUFJLENBQ25CLE1BQU0sQ0FBRSxJQUFJLENBQ1osTUFBTSxDQUFFLElBQUksQUFDZCxDQUFDLEFBQ0QseUJBQVUsTUFBTSxBQUFDLENBQUMsQUFDaEIsZ0JBQWdCLENBQUUsSUFBSSxZQUFZLENBQUMsQUFDckMsQ0FBQyJ9 */";
    	append(document.head, style);
    }

    function create_fragment$e(ctx) {
    	var div1, img, img_src_value, img_alt_value, t0, div0, t1_value = ctx.token.name, t1, cssVars_action;

    	return {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			attr(img, "src", img_src_value = ctx.token.img);
    			attr(img, "alt", img_alt_value = "" + ctx.token.name + " logo");
    			attr(img, "class", "svelte-1c205bn");
    			add_location(img, file$e, 41, 2, 854);
    			attr(div0, "class", "label");
    			add_location(div0, file$e, 42, 2, 905);
    			attr(div1, "class", "container svelte-1c205bn");
    			add_location(div1, file$e, 40, 0, 796);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, img);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    			cssVars_action = dist.call(null, div1, ctx.backgroundColors) || {};
    		},

    		p: function update(changed, ctx) {
    			if (typeof cssVars_action.update === 'function' && changed.backgroundColors) {
    				cssVars_action.update.call(null, ctx.backgroundColors);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (cssVars_action && typeof cssVars_action.destroy === 'function') cssVars_action.destroy();
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { backgroundColor = "white", hoverColor = "lightgray", fontColor = "black" } = $$props;

      let token = {
        img: "https://www.bancor.network/static/images/og_image.jpg",
        name: "Ethereum"
      };

    	const writable_props = ['backgroundColor', 'hoverColor', 'fontColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SelectItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('backgroundColor' in $$props) $$invalidate('backgroundColor', backgroundColor = $$props.backgroundColor);
    		if ('hoverColor' in $$props) $$invalidate('hoverColor', hoverColor = $$props.hoverColor);
    		if ('fontColor' in $$props) $$invalidate('fontColor', fontColor = $$props.fontColor);
    	};

    	let backgroundColors;

    	$$self.$$.update = ($$dirty = { backgroundColor: 1, hoverColor: 1, fontColor: 1 }) => {
    		if ($$dirty.backgroundColor || $$dirty.hoverColor || $$dirty.fontColor) { $$invalidate('backgroundColors', backgroundColors = {
            backgroundColor,
            hoverColor,
            fontColor
          }); }
    	};

    	return {
    		backgroundColor,
    		hoverColor,
    		fontColor,
    		token,
    		backgroundColors
    	};
    }

    class SelectItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1c205bn-style")) add_css$b();
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, ["backgroundColor", "hoverColor", "fontColor"]);
    	}

    	get backgroundColor() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverColor() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverColor(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontColor() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontColor(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Select.svelte generated by Svelte v3.6.10 */

    function create_fragment$f(ctx) {
    	var current;

    	let select_props = {
    		items: ctx.items,
    		containerStyles: ctx.style,
    		listOpen: ctx.open,
    		isFocused: ctx.open,
    		Item: ctx.Item
    	};
    	var select = new Select({ props: select_props, $$inline: true });

    	ctx.select_binding(select);
    	select.$on("select", ctx.select_handler);

    	return {
    		c: function create() {
    			select.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var select_changes = {};
    			if (changed.items) select_changes.items = ctx.items;
    			if (changed.style) select_changes.containerStyles = ctx.style;
    			if (changed.open) select_changes.listOpen = ctx.open;
    			if (changed.open) select_changes.isFocused = ctx.open;
    			if (changed.Item) select_changes.Item = ctx.Item;
    			select.$set(select_changes);
    		},

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
    			ctx.select_binding(null);

    			destroy_component(select, detaching);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	

      let { listBgColor = Required("listBgColor"), bgColor = Required("bgColor"), fontColor = Required("fontColor"), borderColor = Required("borderColor"), hoverBackgroundColor = Required("hoverBackgroundColor"), open = false, items = [] } = $$props;

      class Item extends SelectItem {
        constructor(ops) {
          super({
            ...ops,
            props: {
              ...ops.props,
              backgroundColor: listBgColor,
              hoverColor: hoverBackgroundColor,
              fontColor
            }
          });
        }
      }

      let elem;

      onMount(() => {
        // focus select
        elem.$$.ctx.container.click();
      });

      const style = `
    width: 236px;
    color: ${fontColor};
    border-radius: 5px;
    border: ${borderColor} solid 1px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    background: ${listBgColor};
    --inputColor: ${fontColor};
    --placeholderColor: ${fontColor};
    --listBackground: ${listBgColor};
    --itemActiveBackground: ${listBgColor};
    --itemHoverBG: ${hoverBackgroundColor};
    --itemIsActiveBG: ${listBgColor};
    --itemIsActiveColor: ${fontColor};
    --clearSelectColor: ${fontColor};
    --clearSelectHoverColor: ${fontColor};

  `;

    	const writable_props = ['listBgColor', 'bgColor', 'fontColor', 'borderColor', 'hoverBackgroundColor', 'open', 'items'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_handler(event) {
    		bubble($$self, event);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('elem', elem = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('listBgColor' in $$props) $$invalidate('listBgColor', listBgColor = $$props.listBgColor);
    		if ('bgColor' in $$props) $$invalidate('bgColor', bgColor = $$props.bgColor);
    		if ('fontColor' in $$props) $$invalidate('fontColor', fontColor = $$props.fontColor);
    		if ('borderColor' in $$props) $$invalidate('borderColor', borderColor = $$props.borderColor);
    		if ('hoverBackgroundColor' in $$props) $$invalidate('hoverBackgroundColor', hoverBackgroundColor = $$props.hoverBackgroundColor);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    	};

    	return {
    		listBgColor,
    		bgColor,
    		fontColor,
    		borderColor,
    		hoverBackgroundColor,
    		open,
    		items,
    		Item,
    		elem,
    		style,
    		select_handler,
    		select_binding
    	};
    }

    class Select_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, ["listBgColor", "bgColor", "fontColor", "borderColor", "hoverBackgroundColor", "open", "items"]);
    	}

    	get listBgColor() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listBgColor(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontColor() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontColor(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverBackgroundColor() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverBackgroundColor(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Token.svelte generated by Svelte v3.6.10 */

    // (44:2) {:else}
    function create_else_block$2(ctx) {
    	var current;

    	var select = new Select_1({
    		props: {
    		items: ctx.tokens,
    		bgColor: ctx.colors.selectBg,
    		fontColor: ctx.colors.selectFont,
    		borderColor: ctx.colors.inputBorder,
    		listBgColor: ctx.colors.inputBg,
    		hoverBackgroundColor: ctx.colors.selectBg,
    		open: ctx.open
    	},
    		$$inline: true
    	});
    	select.$on("select", ctx.onSelect);

    	return {
    		c: function create() {
    			select.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var select_changes = {};
    			if (changed.tokens) select_changes.items = ctx.tokens;
    			if (changed.colors) select_changes.bgColor = ctx.colors.selectBg;
    			if (changed.colors) select_changes.fontColor = ctx.colors.selectFont;
    			if (changed.colors) select_changes.borderColor = ctx.colors.inputBorder;
    			if (changed.colors) select_changes.listBgColor = ctx.colors.inputBg;
    			if (changed.colors) select_changes.hoverBackgroundColor = ctx.colors.selectBg;
    			if (changed.open) select_changes.open = ctx.open;
    			select.$set(select_changes);
    		},

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
    			destroy_component(select, detaching);
    		}
    	};
    }

    // (30:2) {#if !open}
    function create_if_block$6(ctx) {
    	var current;

    	var numberinput = new NumberInput({
    		props: {
    		bgColor: ctx.colors.inputBg,
    		fontColor: ctx.colors.inputFont,
    		borderColor: ctx.colors.inputBorder,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			numberinput.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(numberinput, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var numberinput_changes = {};
    			if (changed.colors) numberinput_changes.bgColor = ctx.colors.inputBg;
    			if (changed.colors) numberinput_changes.fontColor = ctx.colors.inputFont;
    			if (changed.colors) numberinput_changes.borderColor = ctx.colors.inputBorder;
    			if (changed.$$scope || changed.colors || changed.selectedToken || changed.loading) numberinput_changes.$$scope = { changed, ctx };
    			numberinput.$set(numberinput_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(numberinput.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(numberinput, detaching);
    		}
    	};
    }

    // (31:4) <NumberInput       bgColor={colors.inputBg}       fontColor={colors.inputFont}       borderColor={colors.inputBorder}>
    function create_default_slot_1(ctx) {
    	var current;

    	var openselect = new OpenSelect({
    		props: {
    		bgColor: ctx.colors.selectBg,
    		fontColor: ctx.colors.selectFont,
    		borderColor: ctx.colors.selectBorder,
    		arrowColor: ctx.colors.selectArrow,
    		token: ctx.selectedToken,
    		loading: ctx.loading
    	},
    		$$inline: true
    	});
    	openselect.$on("click", ctx.click_handler);

    	return {
    		c: function create() {
    			openselect.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(openselect, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var openselect_changes = {};
    			if (changed.colors) openselect_changes.bgColor = ctx.colors.selectBg;
    			if (changed.colors) openselect_changes.fontColor = ctx.colors.selectFont;
    			if (changed.colors) openselect_changes.borderColor = ctx.colors.selectBorder;
    			if (changed.colors) openselect_changes.arrowColor = ctx.colors.selectArrow;
    			if (changed.selectedToken) openselect_changes.token = ctx.selectedToken;
    			if (changed.loading) openselect_changes.loading = ctx.loading;
    			openselect.$set(openselect_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(openselect.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(openselect.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(openselect, detaching);
    		}
    	};
    }

    // (29:0) <Label {orientation} color={colors.containerFont} {text}>
    function create_default_slot$3(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$6,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (!ctx.open) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
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

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	var current;

    	var label = new Label({
    		props: {
    		orientation: ctx.orientation,
    		color: ctx.colors.containerFont,
    		text: ctx.text,
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			label.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var label_changes = {};
    			if (changed.orientation) label_changes.orientation = ctx.orientation;
    			if (changed.colors) label_changes.color = ctx.colors.containerFont;
    			if (changed.text) label_changes.text = ctx.text;
    			if (changed.$$scope || changed.open || changed.colors || changed.selectedToken || changed.loading || changed.tokens) label_changes.$$scope = { changed, ctx };
    			label.$set(label_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	

      let { orientation = Required("orientation"), colors = Required("colors"), text = Required("text"), tokens = Required("items"), loading = false, open = false, selectedToken = {
        name: "?",
        symbol: "?",
        img: ""
      } } = $$props;

      const dispatch = createEventDispatcher();

      const onSelect = e => {
        $$invalidate('open', open = false);
        dispatch("select", e.detail);
      };

    	const writable_props = ['orientation', 'colors', 'text', 'tokens', 'loading', 'open', 'selectedToken'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Token> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		const $$result = (open = true);
    		$$invalidate('open', open);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('orientation' in $$props) $$invalidate('orientation', orientation = $$props.orientation);
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('tokens' in $$props) $$invalidate('tokens', tokens = $$props.tokens);
    		if ('loading' in $$props) $$invalidate('loading', loading = $$props.loading);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    		if ('selectedToken' in $$props) $$invalidate('selectedToken', selectedToken = $$props.selectedToken);
    	};

    	return {
    		orientation,
    		colors,
    		text,
    		tokens,
    		loading,
    		open,
    		selectedToken,
    		onSelect,
    		click_handler
    	};
    }

    class Token extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, ["orientation", "colors", "text", "tokens", "loading", "open", "selectedToken"]);
    	}

    	get orientation() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orientation(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tokens() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tokens(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedToken() {
    		throw new Error("<Token>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedToken(value) {
    		throw new Error("<Token>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const lightTheme = {
      containerBg: "#FFFEFE",
      containerFont: "black",
      containerBorder: "rgba(11, 46, 87, 0.4)",
      inputBg: "#FFFEFE",
      inputFont: "black",
      inputBorder: "#0B2E57",
      selectBg: "#F0F0F0",
      selectFont: "black",
      selectBorder: "#0B2E57",
      buttonBg: "#0B2E57",
      buttonFont: "white",
      buttonBorder: "#000000",
      compareArrows: "#0B2E57",
      selectArrow: "black"
    };

    const darkTheme = {
      containerBg: "#6B6B6B",
      containerFont: "white",
      containerBorder: "#A5A5A5",
      inputBg: "#353535",
      inputFont: "white",
      inputBorder: "#102644",
      selectBg: "#474747",
      selectFont: "white",
      selectBorder: "#102644",
      buttonBg: "#474747",
      buttonFont: "white",
      buttonBorder: "#363636",
      compareArrows: "white",
      selectArrow: "white"
    };

    const Colors = (theme, colors) => {
      return {
        ...(theme === "dark" ? darkTheme : lightTheme),
        ...colors
      };
    };

    /* src/App.svelte generated by Svelte v3.6.10 */

    const file$f = "src/App.svelte";

    function add_css$c() {
    	var style = element("style");
    	style.id = 'svelte-s7ycs4-style';
    	style.textContent = ".container.svelte-s7ycs4{display:flex;justify-content:space-evenly;align-items:center;border-radius:10px}.horizontal.svelte-s7ycs4{flex-direction:row;width:900px;height:110px}.vertical.svelte-s7ycs4{flex-direction:column;width:450px;height:325px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXBwLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBnZXQgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XG4gIGltcG9ydCBNZENvbXBhcmVBcnJvd3MgZnJvbSBcInN2ZWx0ZS1pY29ucy9tZC9NZENvbXBhcmVBcnJvd3Muc3ZlbHRlXCI7XG4gIGltcG9ydCAqIGFzIGV0aFN0b3JlIGZyb20gXCIuL3N0b3Jlcy9ldGhcIjtcbiAgaW1wb3J0IHsgaW5pdCBhcyByZWdpc3RyeUluaXQsIHRva2VucyBhcyB0b2tlbnNNYXAgfSBmcm9tIFwiLi9zdG9yZXMvcmVnaXN0cnlcIjtcbiAgaW1wb3J0IHsgdG9rZW5BLCB0b2tlbnNBLCB0b2tlbkIsIHRva2Vuc0IgfSBmcm9tIFwiLi9zdG9yZXMvd2lkZ2V0LmpzXCI7XG4gIGltcG9ydCBJY29uIGZyb20gXCIuL2NvbXBvbmVudHMvSWNvbi5zdmVsdGVcIjtcbiAgaW1wb3J0IEJ1dHRvbiBmcm9tIFwiLi9jb21wb25lbnRzL0J1dHRvbi5zdmVsdGVcIjtcbiAgaW1wb3J0IFRva2VuIGZyb20gXCIuL2NvbXBvbmVudHMvVG9rZW4uc3ZlbHRlXCI7XG4gIGltcG9ydCBTZWxlY3QgZnJvbSBcIi4vY29tcG9uZW50cy9TZWxlY3Quc3ZlbHRlXCI7XG4gIGltcG9ydCBDb2xvcnMgZnJvbSBcIi4vdXRpbHMvQ29sb3JzLmpzXCI7XG5cbiAgZXhwb3J0IGxldCBvcmllbnRhdGlvbiA9IFwiaG9yaXpvbnRhbFwiO1xuICBleHBvcnQgbGV0IHRoZW1lID0gXCJsaWdodFwiO1xuICBleHBvcnQgbGV0IGNvbG9ycyA9IHt9O1xuICBleHBvcnQgbGV0IHByZWZldGNoID0gdHJ1ZTtcblxuICBjb2xvcnMgPSBDb2xvcnModGhlbWUsIGNvbG9ycyk7XG5cbiAgY29uc3QgY29udGFpbmVyU3R5bGUgPSBgXG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcnMuY29udGFpbmVyQmd9O1xuICAgIGJvcmRlcjogJHtjb2xvcnMuY29udGFpbmVyQm9yZGVyfSBzb2xpZCAxcHg7XG4gIGA7XG5cbiAgb25Nb3VudChhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZXRoID0gYXdhaXQgZXRoU3RvcmUuaW5pdCgpO1xuXG4gICAgaWYgKHByZWZldGNoKSB7XG4gICAgICByZWdpc3RyeUluaXQoZXRoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IE9uU2VsZWN0ID0gdG9rZW4gPT4gZSA9PiB7XG4gICAgdG9rZW4udXBkYXRlKCgpID0+ICR0b2tlbnNNYXAuZ2V0KGUuZGV0YWlsLnZhbHVlKSk7XG4gIH07XG5cbiAgY29uc3Qgb25Td2FwID0gKCkgPT4ge1xuICAgIGNvbnN0IF90b2tlbkEgPSAkdG9rZW5BO1xuICAgIGNvbnN0IF90b2tlbkIgPSAkdG9rZW5CO1xuXG4gICAgdG9rZW5BLnVwZGF0ZSgoKSA9PiBfdG9rZW5CKTtcbiAgICB0b2tlbkIudXBkYXRlKCgpID0+IF90b2tlbkEpO1xuICB9O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgLmNvbnRhaW5lciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gIH1cblxuICAuaG9yaXpvbnRhbCB7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICB3aWR0aDogOTAwcHg7XG4gICAgaGVpZ2h0OiAxMTBweDtcbiAgfVxuXG4gIC52ZXJ0aWNhbCB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB3aWR0aDogNDUwcHg7XG4gICAgaGVpZ2h0OiAzMjVweDtcbiAgfVxuPC9zdHlsZT5cblxuPGRpdiBjbGFzcz1cImNvbnRhaW5lciB7b3JpZW50YXRpb259XCIgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cbiAgPFRva2VuXG4gICAge29yaWVudGF0aW9ufVxuICAgIHtjb2xvcnN9XG4gICAgdGV4dD1cIlNFTkRcIlxuICAgIHRva2Vucz17JHRva2Vuc0F9XG4gICAgc2VsZWN0ZWRUb2tlbj17JHRva2VuQX1cbiAgICBvbjpzZWxlY3Q9e09uU2VsZWN0KHRva2VuQSl9IC8+XG4gIDxJY29uIHtvcmllbnRhdGlvbn0gY29sb3I9e2NvbG9ycy5jb21wYXJlQXJyb3dzfSBvbjpjbGljaz17b25Td2FwfT5cbiAgICA8TWRDb21wYXJlQXJyb3dzIC8+XG4gIDwvSWNvbj5cbiAgPFRva2VuXG4gICAge29yaWVudGF0aW9ufVxuICAgIHtjb2xvcnN9XG4gICAgdGV4dD1cIlJFQ0VJVkVcIlxuICAgIHRva2Vucz17JHRva2Vuc0J9XG4gICAgc2VsZWN0ZWRUb2tlbj17JHRva2VuQn1cbiAgICBvbjpzZWxlY3Q9e09uU2VsZWN0KHRva2VuQil9IC8+XG4gIDxCdXR0b25cbiAgICBiZ0NvbG9yPXtjb2xvcnMuYnV0dG9uQmd9XG4gICAgZm9udENvbG9yPXtjb2xvcnMuYnV0dG9uRm9udH1cbiAgICBib3JkZXJDb2xvcj17Y29sb3JzLmJ1dHRvbkJvcmRlcn0+XG4gICAgQ29udmVydFxuICA8L0J1dHRvbj5cbjwvZGl2PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQStDRSxVQUFVLGNBQUMsQ0FBQyxBQUNWLE9BQU8sQ0FBRSxJQUFJLENBQ2IsZUFBZSxDQUFFLFlBQVksQ0FDN0IsV0FBVyxDQUFFLE1BQU0sQ0FDbkIsYUFBYSxDQUFFLElBQUksQUFDckIsQ0FBQyxBQUVELFdBQVcsY0FBQyxDQUFDLEFBQ1gsY0FBYyxDQUFFLEdBQUcsQ0FDbkIsS0FBSyxDQUFFLEtBQUssQ0FDWixNQUFNLENBQUUsS0FBSyxBQUNmLENBQUMsQUFFRCxTQUFTLGNBQUMsQ0FBQyxBQUNULGNBQWMsQ0FBRSxNQUFNLENBQ3RCLEtBQUssQ0FBRSxLQUFLLENBQ1osTUFBTSxDQUFFLEtBQUssQUFDZixDQUFDIn0= */";
    	append(document.head, style);
    }

    // (76:2) <Icon {orientation} color={colors.compareArrows} on:click={onSwap}>
    function create_default_slot_1$1(ctx) {
    	var current;

    	var mdcomparearrows = new MdCompareArrows({ $$inline: true });

    	return {
    		c: function create() {
    			mdcomparearrows.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(mdcomparearrows, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdcomparearrows.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(mdcomparearrows.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(mdcomparearrows, detaching);
    		}
    	};
    }

    // (86:2) <Button     bgColor={colors.buttonBg}     fontColor={colors.buttonFont}     borderColor={colors.buttonBorder}>
    function create_default_slot$4(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Convert");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	var div, t0, t1, t2, div_class_value, current;

    	var token0 = new Token({
    		props: {
    		orientation: ctx.orientation,
    		colors: ctx.colors,
    		text: "SEND",
    		tokens: ctx.$tokensA,
    		selectedToken: ctx.$tokenA
    	},
    		$$inline: true
    	});
    	token0.$on("select", ctx.OnSelect(tokenA));

    	var icon = new Icon({
    		props: {
    		orientation: ctx.orientation,
    		color: ctx.colors.compareArrows,
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	icon.$on("click", ctx.onSwap);

    	var token1 = new Token({
    		props: {
    		orientation: ctx.orientation,
    		colors: ctx.colors,
    		text: "RECEIVE",
    		tokens: ctx.$tokensB,
    		selectedToken: ctx.$tokenB
    	},
    		$$inline: true
    	});
    	token1.$on("select", ctx.OnSelect(tokenB));

    	var button = new Button({
    		props: {
    		bgColor: ctx.colors.buttonBg,
    		fontColor: ctx.colors.buttonFont,
    		borderColor: ctx.colors.buttonBorder,
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			token0.$$.fragment.c();
    			t0 = space();
    			icon.$$.fragment.c();
    			t1 = space();
    			token1.$$.fragment.c();
    			t2 = space();
    			button.$$.fragment.c();
    			attr(div, "class", div_class_value = "container " + ctx.orientation + " svelte-s7ycs4");
    			attr(div, "style", ctx.containerStyle);
    			add_location(div, file$f, 67, 0, 1579);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(token0, div, null);
    			append(div, t0);
    			mount_component(icon, div, null);
    			append(div, t1);
    			mount_component(token1, div, null);
    			append(div, t2);
    			mount_component(button, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var token0_changes = {};
    			if (changed.orientation) token0_changes.orientation = ctx.orientation;
    			if (changed.colors) token0_changes.colors = ctx.colors;
    			if (changed.$tokensA) token0_changes.tokens = ctx.$tokensA;
    			if (changed.$tokenA) token0_changes.selectedToken = ctx.$tokenA;
    			token0.$set(token0_changes);

    			var icon_changes = {};
    			if (changed.orientation) icon_changes.orientation = ctx.orientation;
    			if (changed.colors) icon_changes.color = ctx.colors.compareArrows;
    			if (changed.$$scope) icon_changes.$$scope = { changed, ctx };
    			icon.$set(icon_changes);

    			var token1_changes = {};
    			if (changed.orientation) token1_changes.orientation = ctx.orientation;
    			if (changed.colors) token1_changes.colors = ctx.colors;
    			if (changed.$tokensB) token1_changes.tokens = ctx.$tokensB;
    			if (changed.$tokenB) token1_changes.selectedToken = ctx.$tokenB;
    			token1.$set(token1_changes);

    			var button_changes = {};
    			if (changed.colors) button_changes.bgColor = ctx.colors.buttonBg;
    			if (changed.colors) button_changes.fontColor = ctx.colors.buttonFont;
    			if (changed.colors) button_changes.borderColor = ctx.colors.buttonBorder;
    			if (changed.$$scope) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);

    			if ((!current || changed.orientation) && div_class_value !== (div_class_value = "container " + ctx.orientation + " svelte-s7ycs4")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(token0.$$.fragment, local);

    			transition_in(icon.$$.fragment, local);

    			transition_in(token1.$$.fragment, local);

    			transition_in(button.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(token0.$$.fragment, local);
    			transition_out(icon.$$.fragment, local);
    			transition_out(token1.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(token0);

    			destroy_component(icon);

    			destroy_component(token1);

    			destroy_component(button);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $tokensMap, $tokenA, $tokenB, $tokensA, $tokensB;

    	validate_store(tokens, 'tokensMap');
    	subscribe($$self, tokens, $$value => { $tokensMap = $$value; $$invalidate('$tokensMap', $tokensMap); });
    	validate_store(tokenA, 'tokenA');
    	subscribe($$self, tokenA, $$value => { $tokenA = $$value; $$invalidate('$tokenA', $tokenA); });
    	validate_store(tokenB, 'tokenB');
    	subscribe($$self, tokenB, $$value => { $tokenB = $$value; $$invalidate('$tokenB', $tokenB); });
    	validate_store(tokensA, 'tokensA');
    	subscribe($$self, tokensA, $$value => { $tokensA = $$value; $$invalidate('$tokensA', $tokensA); });
    	validate_store(tokensB, 'tokensB');
    	subscribe($$self, tokensB, $$value => { $tokensB = $$value; $$invalidate('$tokensB', $tokensB); });

    	

      let { orientation = "horizontal", theme = "light", colors = {}, prefetch = true } = $$props;

      $$invalidate('colors', colors = Colors(theme, colors));

      const containerStyle = `
    background-color: ${colors.containerBg};
    border: ${colors.containerBorder} solid 1px;
  `;

      onMount(async () => {
        const eth = await init$2();

        if (prefetch) {
          init$3(eth);
        }
      });

      const OnSelect = token => e => {
        token.update(() => $tokensMap.get(e.detail.value));
      };

      const onSwap = () => {
        const _tokenA = $tokenA;
        const _tokenB = $tokenB;

        tokenA.update(() => _tokenB);
        tokenB.update(() => _tokenA);
      };

    	const writable_props = ['orientation', 'theme', 'colors', 'prefetch'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('orientation' in $$props) $$invalidate('orientation', orientation = $$props.orientation);
    		if ('theme' in $$props) $$invalidate('theme', theme = $$props.theme);
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('prefetch' in $$props) $$invalidate('prefetch', prefetch = $$props.prefetch);
    	};

    	return {
    		orientation,
    		theme,
    		colors,
    		prefetch,
    		containerStyle,
    		OnSelect,
    		onSwap,
    		$tokenA,
    		$tokenB,
    		$tokensA,
    		$tokensB
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-s7ycs4-style")) add_css$c();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, ["orientation", "theme", "colors", "prefetch"]);
    	}

    	get orientation() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orientation(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefetch() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefetch(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // custom element
    // export { default as App } from "./App.svelte";
    // *****************************************
    // * Notice that the component is not instantiated and mounted to the document <body className="">
    // * Since the compiler is creating a custom element, we instead define and use the custom element
    // * in the index.html file to simulate the end-user experience.
    // ******************************************

    const app = new App({
      target: document.body,
      props: {
        orientation: "horizontal", // horizontal, vertical
        theme: "dark", // light, dark
        colors: {},
        prefetch: true
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
