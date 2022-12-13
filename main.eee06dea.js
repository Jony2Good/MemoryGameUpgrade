// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/redom/dist/redom.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = exports.el = exports.Router = exports.Place = exports.ListPool = exports.List = void 0;
exports.html = html;
exports.list = list;
exports.listPool = listPool;
exports.mount = mount;
exports.place = place;
exports.router = router;
exports.s = void 0;
exports.setAttr = setAttr;
exports.setChildren = setChildren;
exports.setData = setData;
exports.setStyle = setStyle;
exports.setXlink = setXlink;
exports.svg = svg;
exports.text = text;
exports.unmount = unmount;
function createElement(query, ns) {
  var ref = parse(query);
  var tag = ref.tag;
  var id = ref.id;
  var className = ref.className;
  var element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
  if (id) {
    element.id = id;
  }
  if (className) {
    if (ns) {
      element.setAttribute('class', className);
    } else {
      element.className = className;
    }
  }
  return element;
}
function parse(query) {
  var chunks = query.split(/([.#])/);
  var className = '';
  var id = '';
  for (var i = 1; i < chunks.length; i += 2) {
    switch (chunks[i]) {
      case '.':
        className += " " + chunks[i + 1];
        break;
      case '#':
        id = chunks[i + 1];
    }
  }
  return {
    className: className.trim(),
    tag: chunks[0] || 'div',
    id: id
  };
}
function unmount(parent, child) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);
  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }
  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);
    parentEl.removeChild(childEl);
  }
  return child;
}
function doUnmount(child, childEl, parentEl) {
  var hooks = childEl.__redom_lifecycle;
  if (hooksAreEmpty(hooks)) {
    childEl.__redom_lifecycle = {};
    return;
  }
  var traverse = parentEl;
  if (childEl.__redom_mounted) {
    trigger(childEl, 'onunmount');
  }
  while (traverse) {
    var parentHooks = traverse.__redom_lifecycle || {};
    for (var hook in hooks) {
      if (parentHooks[hook]) {
        parentHooks[hook] -= hooks[hook];
      }
    }
    if (hooksAreEmpty(parentHooks)) {
      traverse.__redom_lifecycle = null;
    }
    traverse = traverse.parentNode;
  }
}
function hooksAreEmpty(hooks) {
  if (hooks == null) {
    return true;
  }
  for (var key in hooks) {
    if (hooks[key]) {
      return false;
    }
  }
  return true;
}

/* global Node, ShadowRoot */

var hookNames = ['onmount', 'onremount', 'onunmount'];
var shadowRootAvailable = typeof window !== 'undefined' && 'ShadowRoot' in window;
function mount(parent, child, before, replace) {
  var parentEl = getEl(parent);
  var childEl = getEl(child);
  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }
  if (child !== childEl) {
    childEl.__redom_view = child;
  }
  var wasMounted = childEl.__redom_mounted;
  var oldParent = childEl.parentNode;
  if (wasMounted && oldParent !== parentEl) {
    doUnmount(child, childEl, oldParent);
  }
  if (before != null) {
    if (replace) {
      var beforeEl = getEl(before);
      if (beforeEl.__redom_mounted) {
        trigger(beforeEl, 'onunmount');
      }
      parentEl.replaceChild(childEl, beforeEl);
    } else {
      parentEl.insertBefore(childEl, getEl(before));
    }
  } else {
    parentEl.appendChild(childEl);
  }
  doMount(child, childEl, parentEl, oldParent);
  return child;
}
function trigger(el, eventName) {
  if (eventName === 'onmount' || eventName === 'onremount') {
    el.__redom_mounted = true;
  } else if (eventName === 'onunmount') {
    el.__redom_mounted = false;
  }
  var hooks = el.__redom_lifecycle;
  if (!hooks) {
    return;
  }
  var view = el.__redom_view;
  var hookCount = 0;
  view && view[eventName] && view[eventName]();
  for (var hook in hooks) {
    if (hook) {
      hookCount++;
    }
  }
  if (hookCount) {
    var traverse = el.firstChild;
    while (traverse) {
      var next = traverse.nextSibling;
      trigger(traverse, eventName);
      traverse = next;
    }
  }
}
function doMount(child, childEl, parentEl, oldParent) {
  var hooks = childEl.__redom_lifecycle || (childEl.__redom_lifecycle = {});
  var remount = parentEl === oldParent;
  var hooksFound = false;
  for (var i = 0, list = hookNames; i < list.length; i += 1) {
    var hookName = list[i];
    if (!remount) {
      // if already mounted, skip this phase
      if (child !== childEl) {
        // only Views can have lifecycle events
        if (hookName in child) {
          hooks[hookName] = (hooks[hookName] || 0) + 1;
        }
      }
    }
    if (hooks[hookName]) {
      hooksFound = true;
    }
  }
  if (!hooksFound) {
    childEl.__redom_lifecycle = {};
    return;
  }
  var traverse = parentEl;
  var triggered = false;
  if (remount || traverse && traverse.__redom_mounted) {
    trigger(childEl, remount ? 'onremount' : 'onmount');
    triggered = true;
  }
  while (traverse) {
    var parent = traverse.parentNode;
    var parentHooks = traverse.__redom_lifecycle || (traverse.__redom_lifecycle = {});
    for (var hook in hooks) {
      parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
    }
    if (triggered) {
      break;
    } else {
      if (traverse.nodeType === Node.DOCUMENT_NODE || shadowRootAvailable && traverse instanceof ShadowRoot || parent && parent.__redom_mounted) {
        trigger(traverse, remount ? 'onremount' : 'onmount');
        triggered = true;
      }
      traverse = parent;
    }
  }
}
function setStyle(view, arg1, arg2) {
  var el = getEl(view);
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setStyleValue(el, key, arg1[key]);
    }
  } else {
    setStyleValue(el, arg1, arg2);
  }
}
function setStyleValue(el, key, value) {
  el.style[key] = value == null ? '' : value;
}

/* global SVGElement */

var xlinkns = 'http://www.w3.org/1999/xlink';
function setAttr(view, arg1, arg2) {
  setAttrInternal(view, arg1, arg2);
}
function setAttrInternal(view, arg1, arg2, initial) {
  var el = getEl(view);
  var isObj = typeof arg1 === 'object';
  if (isObj) {
    for (var key in arg1) {
      setAttrInternal(el, key, arg1[key], initial);
    }
  } else {
    var isSVG = el instanceof SVGElement;
    var isFunc = typeof arg2 === 'function';
    if (arg1 === 'style' && typeof arg2 === 'object') {
      setStyle(el, arg2);
    } else if (isSVG && isFunc) {
      el[arg1] = arg2;
    } else if (arg1 === 'dataset') {
      setData(el, arg2);
    } else if (!isSVG && (arg1 in el || isFunc) && arg1 !== 'list') {
      el[arg1] = arg2;
    } else {
      if (isSVG && arg1 === 'xlink') {
        setXlink(el, arg2);
        return;
      }
      if (initial && arg1 === 'class') {
        arg2 = el.className + ' ' + arg2;
      }
      if (arg2 == null) {
        el.removeAttribute(arg1);
      } else {
        el.setAttribute(arg1, arg2);
      }
    }
  }
}
function setXlink(el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setXlink(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.setAttributeNS(xlinkns, arg1, arg2);
    } else {
      el.removeAttributeNS(xlinkns, arg1, arg2);
    }
  }
}
function setData(el, arg1, arg2) {
  if (typeof arg1 === 'object') {
    for (var key in arg1) {
      setData(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.dataset[arg1] = arg2;
    } else {
      delete el.dataset[arg1];
    }
  }
}
function text(str) {
  return document.createTextNode(str != null ? str : '');
}
function parseArgumentsInternal(element, args, initial) {
  for (var i = 0, list = args; i < list.length; i += 1) {
    var arg = list[i];
    if (arg !== 0 && !arg) {
      continue;
    }
    var type = typeof arg;
    if (type === 'function') {
      arg(element);
    } else if (type === 'string' || type === 'number') {
      element.appendChild(text(arg));
    } else if (isNode(getEl(arg))) {
      mount(element, arg);
    } else if (arg.length) {
      parseArgumentsInternal(element, arg, initial);
    } else if (type === 'object') {
      setAttrInternal(element, arg, null, initial);
    }
  }
}
function ensureEl(parent) {
  return typeof parent === 'string' ? html(parent) : getEl(parent);
}
function getEl(parent) {
  return parent.nodeType && parent || !parent.el && parent || getEl(parent.el);
}
function isNode(arg) {
  return arg && arg.nodeType;
}
function html(query) {
  var args = [],
    len = arguments.length - 1;
  while (len-- > 0) args[len] = arguments[len + 1];
  var element;
  var type = typeof query;
  if (type === 'string') {
    element = createElement(query);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply(Query, [null].concat(args)))();
  } else {
    throw new Error('At least one argument required');
  }
  parseArgumentsInternal(getEl(element), args, true);
  return element;
}
var el = html;
exports.el = el;
var h = html;
exports.h = h;
html.extend = function extendHtml() {
  var args = [],
    len = arguments.length;
  while (len--) args[len] = arguments[len];
  return html.bind.apply(html, [this].concat(args));
};
function setChildren(parent) {
  var children = [],
    len = arguments.length - 1;
  while (len-- > 0) children[len] = arguments[len + 1];
  var parentEl = getEl(parent);
  var current = traverse(parent, children, parentEl.firstChild);
  while (current) {
    var next = current.nextSibling;
    unmount(parent, current);
    current = next;
  }
}
function traverse(parent, children, _current) {
  var current = _current;
  var childEls = Array(children.length);
  for (var i = 0; i < children.length; i++) {
    childEls[i] = children[i] && getEl(children[i]);
  }
  for (var i$1 = 0; i$1 < children.length; i$1++) {
    var child = children[i$1];
    if (!child) {
      continue;
    }
    var childEl = childEls[i$1];
    if (childEl === current) {
      current = current.nextSibling;
      continue;
    }
    if (isNode(childEl)) {
      var next = current && current.nextSibling;
      var exists = child.__redom_index != null;
      var replace = exists && next === childEls[i$1 + 1];
      mount(parent, child, current, replace);
      if (replace) {
        current = next;
      }
      continue;
    }
    if (child.length != null) {
      current = traverse(parent, child, current);
    }
  }
  return current;
}
function listPool(View, key, initData) {
  return new ListPool(View, key, initData);
}
var ListPool = function ListPool(View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.oldLookup = {};
  this.lookup = {};
  this.oldViews = [];
  this.views = [];
  if (key != null) {
    this.key = typeof key === 'function' ? key : propKey(key);
  }
};
exports.ListPool = ListPool;
ListPool.prototype.update = function update(data, context) {
  var ref = this;
  var View = ref.View;
  var key = ref.key;
  var initData = ref.initData;
  var keySet = key != null;
  var oldLookup = this.lookup;
  var newLookup = {};
  var newViews = Array(data.length);
  var oldViews = this.views;
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var view = void 0;
    if (keySet) {
      var id = key(item);
      view = oldLookup[id] || new View(initData, item, i, data);
      newLookup[id] = view;
      view.__redom_id = id;
    } else {
      view = oldViews[i] || new View(initData, item, i, data);
    }
    view.update && view.update(item, i, data, context);
    var el = getEl(view.el);
    el.__redom_view = view;
    newViews[i] = view;
  }
  this.oldViews = oldViews;
  this.views = newViews;
  this.oldLookup = oldLookup;
  this.lookup = newLookup;
};
function propKey(key) {
  return function (item) {
    return item[key];
  };
}
function list(parent, View, key, initData) {
  return new List(parent, View, key, initData);
}
var List = function List(parent, View, key, initData) {
  this.View = View;
  this.initData = initData;
  this.views = [];
  this.pool = new ListPool(View, key, initData);
  this.el = ensureEl(parent);
  this.keySet = key != null;
};
exports.List = List;
List.prototype.update = function update(data, context) {
  if (data === void 0) data = [];
  var ref = this;
  var keySet = ref.keySet;
  var oldViews = this.views;
  this.pool.update(data, context);
  var ref$1 = this.pool;
  var views = ref$1.views;
  var lookup = ref$1.lookup;
  if (keySet) {
    for (var i = 0; i < oldViews.length; i++) {
      var oldView = oldViews[i];
      var id = oldView.__redom_id;
      if (lookup[id] == null) {
        oldView.__redom_index = null;
        unmount(this, oldView);
      }
    }
  }
  for (var i$1 = 0; i$1 < views.length; i$1++) {
    var view = views[i$1];
    view.__redom_index = i$1;
  }
  setChildren(this, views);
  if (keySet) {
    this.lookup = lookup;
  }
  this.views = views;
};
List.extend = function extendList(parent, View, key, initData) {
  return List.bind(List, parent, View, key, initData);
};
list.extend = List.extend;

/* global Node */

function place(View, initData) {
  return new Place(View, initData);
}
var Place = function Place(View, initData) {
  this.el = text('');
  this.visible = false;
  this.view = null;
  this._placeholder = this.el;
  if (View instanceof Node) {
    this._el = View;
  } else if (View.el instanceof Node) {
    this._el = View;
    this.view = View;
  } else {
    this._View = View;
  }
  this._initData = initData;
};
exports.Place = Place;
Place.prototype.update = function update(visible, data) {
  var placeholder = this._placeholder;
  var parentNode = this.el.parentNode;
  if (visible) {
    if (!this.visible) {
      if (this._el) {
        mount(parentNode, this._el, placeholder);
        unmount(parentNode, placeholder);
        this.el = getEl(this._el);
        this.visible = visible;
      } else {
        var View = this._View;
        var view = new View(this._initData);
        this.el = getEl(view);
        this.view = view;
        mount(parentNode, view, placeholder);
        unmount(parentNode, placeholder);
      }
    }
    this.view && this.view.update && this.view.update(data);
  } else {
    if (this.visible) {
      if (this._el) {
        mount(parentNode, placeholder, this._el);
        unmount(parentNode, this._el);
        this.el = placeholder;
        this.visible = visible;
        return;
      }
      mount(parentNode, placeholder, this.view);
      unmount(parentNode, this.view);
      this.el = placeholder;
      this.view = null;
    }
  }
  this.visible = visible;
};

/* global Node */

function router(parent, Views, initData) {
  return new Router(parent, Views, initData);
}
var Router = function Router(parent, Views, initData) {
  this.el = ensureEl(parent);
  this.Views = Views;
  this.initData = initData;
};
exports.Router = Router;
Router.prototype.update = function update(route, data) {
  if (route !== this.route) {
    var Views = this.Views;
    var View = Views[route];
    this.route = route;
    if (View && (View instanceof Node || View.el instanceof Node)) {
      this.view = View;
    } else {
      this.view = View && new View(this.initData, data);
    }
    setChildren(this.el, [this.view]);
  }
  this.view && this.view.update && this.view.update(data, route);
};
var ns = 'http://www.w3.org/2000/svg';
function svg(query) {
  var args = [],
    len = arguments.length - 1;
  while (len-- > 0) args[len] = arguments[len + 1];
  var element;
  var type = typeof query;
  if (type === 'string') {
    element = createElement(query, ns);
  } else if (type === 'function') {
    var Query = query;
    element = new (Function.prototype.bind.apply(Query, [null].concat(args)))();
  } else {
    throw new Error('At least one argument required');
  }
  parseArgumentsInternal(getEl(element), args, true);
  return element;
}
var s = svg;
exports.s = s;
svg.extend = function extendSvg() {
  var args = [],
    len = arguments.length;
  while (len--) args[len] = arguments[len];
  return svg.bind.apply(svg, [this].concat(args));
};
svg.ns = ns;
},{}],"src/module/main.js":[function(require,module,exports) {
"use strict";

var _redom = require("redom");
/**создание блока с инпутами */
function createInputs() {
  var title = (0, _redom.el)("h1.wrapper__input-descr", "А ты достоин Зевса? Проверь себя:");
  var textTimer = (0, _redom.el)("p.text", "Твое время, Смертный - ", (0, _redom.el)("span.time", " 60"));
  var bodyInputFirst = (0, _redom.el)(".form-check.form-check-inline", [(0, _redom.el)("label.form-check-label", {
    for: "first"
  }, "Уровень Сатира", (0, _redom.el)("input.js-input.first.form-check-input", {
    type: "radio",
    id: "first",
    value: "option1"
  }))]);
  var bodyInputSecond = (0, _redom.el)(".form-check.form-check-inline", [(0, _redom.el)("label.form-check-label", {
    for: "second"
  }, "Уровень Нимфы", (0, _redom.el)("input.js-input.form-check-input", {
    type: "radio",
    id: "second",
    value: "option2"
  }))]);
  var bodyInputThird = (0, _redom.el)(".form-check.form-check-inline", [(0, _redom.el)("label.form-check-label", {
    for: "third"
  }, "Уровень Мантикора", (0, _redom.el)("input.js-input.form-check-input", {
    type: "radio",
    id: "third",
    value: "option3"
  }))]);
  var bodyInputFourth = (0, _redom.el)(".form-check.form-check-inline", [(0, _redom.el)("label.form-check-label", {
    for: "first"
  }, "Уровень Божества", (0, _redom.el)("input.js-input.form-check-input", {
    type: "radio",
    id: "fourth",
    value: "option4"
  }))]);
  var form = (0, _redom.el)("form.form-input");
  (0, _redom.setChildren)(form, [bodyInputFirst, bodyInputSecond, bodyInputThird, bodyInputFourth]);
  var body = (0, _redom.el)(".wrapper__input");
  (0, _redom.setChildren)(body, [title, form, textTimer]);
  var container = (0, _redom.el)("div.container");
  (0, _redom.setChildren)(container, [body]);
  return container;
}
document.querySelector(".main").append(createInputs());
var container = document.getElementById("game");
var btnOfChoice = document.querySelectorAll(".js-input");
var timer = document.querySelector(".time");
var openCard = false;
var boardLocked = false;
var firstCard, secondCard, interval;
var openCardArr = [];

//создание карточек
var createCard = function createCard(id) {
  var scene = document.createElement("div");
  var card = document.createElement("div");
  var frontCard = document.createElement("div");
  var backCard = document.createElement("div");
  scene.classList.add("scene");
  card.classList.add("card");
  card.setAttribute("data-id", id);
  frontCard.classList.add("card__face", "card-closed");
  backCard.classList.add("card__face", "card-open");
  backCard.textContent = id;
  backCard.id = id;
  card.append(frontCard);
  card.append(backCard);
  scene.append(card);
  container.append(scene);
  return {
    scene: scene,
    card: card,
    frontCard: frontCard,
    backCard: backCard
  };
};

// создание data-id и цифры для карточки
var cardId = function cardId(numberOfcard, arr) {
  for (var j = 0; j < numberOfcard / 2; j++) {
    arr.push(j);
    arr.push(j);
  }
};

// Перемешивание карточек
var shuffleCards = function shuffleCards(array) {
  var i = 0;
  var j = 0;
  var temp = null;
  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

/*сравниваем карточки на идентичность - условие если id карточки равны,
то на первую и вторую карточку вешется обработчик с логикой функцией flipCard и функцией победа
в массив пушатся карточки. Если условие не выполняется */
var checkForMatch = function checkForMatch() {
  if (firstCard.dataset.id === secondCard.dataset.id) {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    openCardArr.push(firstCard, secondCard);
    finishedGame();
  } else {
    //исправлена ошибка, когда можно было кликать по другим карточкам и нарушать схему проверки
    boardLocked = true;
    //чтобы не было мгновенного переворачивания карточки в случае не совпадения id
    setTimeout(function () {
      firstCard.classList.remove("open");
      secondCard.classList.remove("open");
      resetBoard();
    }, 500);
  }
};

//логика работы с карточками
function flipCard() {
  if (boardLocked) return;
  if (this === firstCard) {
    // защита от двойного клика
    return;
  }
  this.classList.add("open");

  //выяснем через условие - это первая карточка или вторая
  //если вторая то запускаем проверку через функцию на совместимость
  if (!openCard) {
    openCard = true;
    firstCard = this;
  } else {
    openCard = false;
    secondCard = this;
    checkForMatch();
  }
}

//функция запускает механизм - если нет перевернутой первой карточки и игровое поле не закрыто
//первые и вторые карточки равны ничему.Нет никакого присвоенного дом элемента к карточкам
var resetBoard = function resetBoard() {
  openCard = boardLocked = false;
  firstCard = secondCard = null;
};

//устанавливаем таймер - навешивается обработчик события на вес инпуты
//при нажатии на один из которых запускается обратный отсчет времени
//время запускается заново при нажатии на инпут
//по истечении 60 секнуд запускается функция с уведомлением об окончании игры
var setTimer = function setTimer() {
  btnOfChoice.forEach(function (btn) {
    btn.addEventListener("click", function () {
      clearInterval(interval);
      timer.innerHTML = 60;
    });
  });
  interval = setInterval(function () {
    timer.innerHTML--;
    gameIsOver(interval);
  }, 1000);
};

//отчистка поля от карточек
var clearGame = function clearGame() {
  container.innerHTML = "";
};

/*функция запускает условие - если значение таймера меньше нуля, то
таймер равен нулю и выводится окно с сообщением, значение присваиваем переменной.
Если результат равен true, то таймер равен 60(возвращаем значение), отчищаем поле. В противном случае повторяем
Допонительно останавливаем время на случай ошибки*/
var gameIsOver = function gameIsOver() {
  if (timer.innerHTML < 0) {
    timer.innerHTML = 0;
    var result = confirm("Игра закончилась, тебя ждет Аид!");
    if (result) {
      timer.innerHTML = 60;
      clearGame();
    } else {
      timer.innerHTML = 60;
      clearGame();
    }
    clearInterval(interval);
  }
};

/*Ищем все карточки. Запускаем задержку времени - если количество карточек равна колиеству карточек в массиве
то выводится сообщение с победой и запускается функция отчистки поля, таймер возвращает исходное значение
 отсатанвливается время*/
var finishedGame = function finishedGame() {
  var cards = document.querySelectorAll(".card");
  setTimeout(function () {
    if (cards.length == openCardArr.length) {
      alert("Ну что же - это было не плохо!");
      clearGame();
      timer.innerHTML = 60;
      clearInterval(interval);
    }
  }, 1000);
};

/*логика игры. На инпуты навешиваем функцию, которая будет выполнятся для каждого инпута с аргументом
аргументу навешиваем обработчик событий с функицей, в которой создан массив и пустая переменная
Условие если у инпута айди равен 1 то создаются 4 карточкиб отчищается поле(если было заполнено)
запускается таймер и функция, создающая пары в которую передаются аргументом количество карточек и массив
в массив передается результата выполнения функции перемешивания с аргументом массива
на массив навешивается функция, запускающая к каждому элементу массива с айди функцию создать карточки с выбранным айди
получаем значение черезменную созданных карточек,навешиваем на них функицю
котрая для каждого элемента присвоит обработчик событий с функцией открытия карточек*/

var createScene = function createScene() {
  btnOfChoice.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var arr = [];
      var numberOfcard;
      if (btn.id == "first") {
        numberOfcard = 4;
        clearGame();
        setTimer(interval);
        cardId(numberOfcard, arr);
        arr = shuffleCards(arr);
        arr.forEach(function (id) {
          return createCard(id);
        });
      }
      if (btn.id == "second") {
        numberOfcard = 8;
        clearGame();
        setTimer(interval);
        cardId(numberOfcard, arr);
        arr = shuffleCards(arr);
        arr.forEach(function (id) {
          return createCard(id);
        });
      }
      if (btn.id == "third") {
        numberOfcard = 12;
        clearGame();
        setTimer(interval);
        cardId(numberOfcard, arr);
        arr = shuffleCards(arr);
        arr.forEach(function (id) {
          return createCard(id);
        });
      }
      if (btn.id == "fourth") {
        numberOfcard = 16;
        clearGame();
        setTimer(interval);
        cardId(numberOfcard, arr);
        arr = shuffleCards(arr);
        arr.forEach(function (id) {
          return createCard(id);
        });
      }
      var cards = document.querySelectorAll(".card");
      cards.forEach(function (card) {
        card.addEventListener("click", flipCard);
      });
    });
  });
};
createScene();
},{"redom":"node_modules/redom/dist/redom.es.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58399" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/module/main.js"], null)
//# sourceMappingURL=main.eee06dea.js.map