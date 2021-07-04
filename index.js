/* todo
secDragOver should replace h/r ruler mousemove and grid mouse move
*/

// round to 2 decimal places
const rit = val => Math.round(val * 100) / 100;

// [1, 3], 3 -> [1, 2, 3]
const linespace = (tar, den) => Array.from({
  length: den
}, (x, i) => tar[0] + i * (tar[1] - tar[0]) / (den - 1));

// querySelector -> element
function proxy(el) {
  el.oneEventListener = (event, func) => {
    if (el.lastEventListener == null) {
      el.lastEventListener = {};
    }
    if (el.lastEventListener[event] != null) {
      el.removeEventListener(event, el.lastEventListener[event]);
    }
    el.addEventListener(event, func);
    el.lastEventListener[event] = func;
  }
  return el;
}

// querySelectorAll -> NodeList
function proxyAll(el) {
  el.forEach(ele => {
    ele = proxy(ele);
  });
  return el;
}

// proxy query selector
const pqs = function(str) {
  return proxy(document.querySelector(str));
}

// proxy query selector all
const pqsa = function(str) {
  return proxyAll(document.querySelectorAll(str));
}

function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
  }
}

const sydTime = function() {
  return moment().tz("Australia/Sydney").format('HH:mm')
};

function validateInput(input_el) {
  // return false if input is none or whitespace
  var val = input_el.value;
  if (val) {
    var res = val.trim();
    if (res.length > 1) {
      return res;
    }
  }
}

function parsedToPeriod(str) {
  // pass in period.parse(), return period
  var s1 = str.split('~');
  var s2 = s1[1].split('[');
  return new Period(new Clock(s1[0]), new Clock(s2[0].trim()));
}

function once(arr) {
  var res = [];
  arr.forEach(br => {
    if (!res.includes(br)) {
      res.push(br);
    }
  });
  return res;
}

class RGBA{
  static ensix(val){
    return val < 0 ? 0 : val > 255 ? 255 : val;
  }
 
  constructor(
    r,
    g,
    b,
  ){
    this.r = r;
    this.g = g;
    this.b = b;

    this.rgb = this.rgb.bind(this);
    this.rgba = this.rgba.bind(this);
  }

  rgb(dif=0){
    return `rgb(${RGBA.ensix(this.r + dif)},${RGBA.ensix(this.g + dif)},${RGBA.ensix(this.b + dif)})`
  }

  rgba(a, dif=0){
      return `rgb(${RGBA.ensix(this.r + dif)},${RGBA.ensix(this.g + dif)},${RGBA.ensix(this.b + dif)},${a})`
  }
}

var paragraphs = [
  'Getting tired of joining lessons by looking across the timetable?',
  'We provide you with a digital timetable with all the links to your lessons!',
];

const loader = document.querySelector('.loader');
const main = document.querySelector('#main');
const img_logo = document.querySelector('#img-wrapper-logo');
const img_front_door = document.querySelector('#img-wrapper-front-door');
const img_school = document.querySelector('#img-wrapper-school');
const nav_bar = document.querySelector('#navigate');
const [
  nav,
  nav_sch,
  nav_git,
  nav_info,
  nav_tb,
  nav_form
] = nav_bar.querySelectorAll('.nav');
const navs = [
  nav_sch,
  nav_git,
  nav_info,
  nav_tb,
  nav_form
];
const info_card = document.querySelector('#info-card');
const info_card_left = document.querySelector('#info-card-left');
const info_card_right = document.querySelector('#info-card-right');
const info_intro_paths = document.querySelectorAll("#introduce path");
const info_contents = document.querySelectorAll('#info-card-right p');
const section_intro = document.querySelector('#intro');
const section_tb = document.querySelector('#timetable');

// return array segment from 0 to ind
function sliceTo(arr, ind) {
  // null is excepted
  return Array.from({
    length: ind
  }, (bb, ii) => arr[ii] ? arr[ii] : 0);
}

// sum(0...ind of the array)
function sumTo(arr, ind) {
  return sliceTo(arr, ind + 1).reduce((a, b) => a + b, 0)
}

// if it's in page, display it
function topbottom(element, show, hide, shown) {
  var dif = window.innerHeight;
  var tt = window.scrollY;
  var bb = tt + dif;
  if (element.getBoundingClientRect().top > 0 && element.getBoundingClientRect().bottom < window.innerHeight) {
    if (!shown) {
      show()
    }
  } else {
    if (shown) {
      hide()
    }
  }
}

function hide_svg(paths) {
  paths.forEach(the_path => {
    the_path.style.animation = 'none';
    the_path.style.display = 'none';
  });
}

function show_svg(paths) {
  var fs = 0;
  paths.forEach(the_path => {
    the_path.style.animation = 'anime 2s ease forwards ' + fs + 's';
    fs += 0.3;
    setTimeout(() => {
      the_path.style.display = 'block';
    }, fs * 1000);
  });
}

function loader_show() {
  loader.style.display = 'flex';
  setTimeout(() => {
    loader.style.opacity = '1';
  }, 0);
}

function loader_dismiss() {
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none'
  }, 1000);
}


class Superior {
  constructor() {
    this.befores = [];
    this.agos = [];
    this.afters = [];
    this.futures = [];
  }

  addBefore(task, duration) {
    this.befores.push(task);
    this.agos.push(duration);
  }

  addBeforeGap(duration) {
    this.addBefore(() => {}, duration);
  }

  addAfter(task, duration) {
    this.afters.push(task);
    this.futures.push(duration);
  }

  addAfterGap(duration) {
    this.addAfter(() => {}, duration);
  }

  run() {
    for (let ii = 0; ii < this.befores.length; ii++) {
      if (this.agos[ii] == null) {
        this.befores[ii]();
      } else {
        setTimeout(() => {
          this.befores[ii]();
        }, sumTo(this.agos, ii));
      }
    }
    setTimeout(() => {
      main.style.display = 'block';
      loader_dismiss();
      for (let ii = 0; ii < this.afters.length; ii++) {
        if (this.futures[ii] == null) {
          this.afters[ii]();
        } else {
          setTimeout(() => {
            this.afters[ii]();
          }, sumTo(this.futures, ii));
        }
      }
    }, sumTo(this.agos, this.agos.length));
  }
}


const superior = new Superior();


const status = new(class Status {
  constructor() {
    this.st = {
      nav: false,
      frontin: false,
      info: true,
      typing: false,
      route: true,
      hruler: true,
      vruler: true,
    }
  }

  getter(key) {
    return this.st[key]
  }

  setter(key, value) {
    this.st[key] = value;
  }

  reverse(name) {
    this.st[name] = !this.st[name];
  }
})();

// BACKEND
class Backend {
  static courseHorizontalMove(
    day, // mon, tue
    n, // 0~config.sec
    period, // new period
  ) {
    // write into Config (but not json)
    [
      new Config().calendar[day][n].start,
      new Config().calendar[day][n].finish,
    ] = period.split().map(cl => cl.parse());
  }

  static courseVerticalSwitch(
    day, // mon, tue
    i1, // 0~config.sec
    i2,
  ) {
    // write into Config (but not json)
    var o1 = Object.assign({}, new Config().calendar[day][i1]);
    var o2 = Object.assign({}, new Config().calendar[day][i2]);
    new Config().calendar[day][i1] = o2;
    new Config().calendar[day][i2] = o1;
  }
}

// MANAGE
class HRuler {
  constructor(
    parent_el,
    n,
    small,
    large,
    color,
    hovercolor,
    expand_left,
    expand_right,
    strokewidth,
    glow_rate, // time in ms, how fast updation is 100 suggested
    width_percentage,
  ) {
    this.parent_el = parent_el;
    this.n = n;
    this.small = small;
    this.large = large;
    this.color = color;
    this.hovercolor = hovercolor;
    this.expand_left = expand_left;
    this.expand_right = expand_right;
    this.strokewidth = strokewidth;
    this.glow_rate = glow_rate;
    this.width_percentage = width_percentage;
    this.glowed = false;
    this.ds = '';
    this.d = '';
    this.xx = 0;
    this.yy = 0;

    this.init();
    this.svg = this.parent_el.querySelector('svg');
    this.paths = this.svg.querySelectorAll('path');

    this.deduce = this.deduce.bind(this);
    this.render = this.render.bind(this);
    this.dash = this.dash.bind(this);
    this.glow = this.glow.bind(this);
  }

  deduce(left) {
    var rect = this.svg.getBoundingClientRect();
    var rleft = rect.left;
    var rwidth = rect.width;
    if (rleft < left && left < rleft + rwidth) {
      // inwidth: left - rleft
      // each bar: rwidth / this.n
      return Math.floor((left - rleft) / rwidth * this.n);
    }
    return null;
  }

  render(n) {
    // render nth bar to show color
    if (n == null) return;
    this.paths.forEach((pa, ii) => {
      if (n - this.expand_left <= ii && ii <= n + this.expand_right) {
        pa.setAttribute('stroke', this.hovercolor);
      } else {
        pa.setAttribute('stroke', this.color);
      }
    });
  }

  dash() {
    this.paths.forEach(pa => {
      pa.setAttribute('stroke', this.color);
    });
  }

  glow(e) {
    if (!status.getter('hruler') || this.glowed) return;
    this.glowed = true;
    this.render(this.deduce(e.clientX));
    setTimeout(() => {
      this.glowed = false;
    }, this.glow_rate);
  }

  finishBar() {
    // no bind
    this.ds += '<path d="' + this.d + '" stroke="' + this.color + '" fill="none" stroke-width="' + this.strokewidth.toString() + '" stroke-linecap="round" />';
  }

  parseBar(n) {
    // no bind
    var cc = 0;
    this.xx = 5 * this.small * n - this.small;
    this.yy = 0;
    this.d = 'M' + (this.xx + this.small).toString() + ' 0';
    for (let ii = n + 1; ii < n + 18; ii++) {
      this.yy = 0;
      if (cc % 3 === 0) {
        this.xx += this.small;
      }
      if ((cc - 1) % 3 === 0) {
        if ((cc - 1) % 15 === 0) {
          this.yy = this.large;
        } else {
          this.yy = this.small;
        }
      } else {
        this.yy = 0;
      }
      this.d += 'L' + this.xx.toString() + ' ' + this.yy.toString();
      cc++;
    }
  }

  init() {
    // no bind
    for (let ii = 0; ii < this.n; ii++) {
      this.parseBar(ii);
      this.finishBar();
    }
    this.parent_el.innerHTML = '<svg viewbox="0 0 ' + (this.xx + 2 * this.strokewidth).toString() + ' ' + this.large.toString() + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="white">' + this.ds + '</svg>';
    render_element({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.parent_el);
    render_element({
      height: '100%',
      width: this.width_percentage.toString() + '%',
    }, this.parent_el.querySelector('svg'));
  }

  static manage(
    active, // default control before event handler is triggered
    parent_el, // which element should this ruler be appended to
    n, // how many bars should this ruler consist
    width_percentage,
    small = 50, // bar shorter side length
    large = 75, // bar edge side length
    color = 'black', // default color
    hovercolor = 'cyan', // hover color
    expand_left = 1, // how many bars should be included as extra on the left
    expand_right = 1,
    strokewidth = 5, // ruler linewidth
    glow_rate = 100, // time segment for updating the ruler style
  ) {
    if (active) {
      status.setter('hruler', true);
    } else {
      status.setter('hruler', false);
    }
    var r = new HRuler(
      parent_el,
      n,
      small,
      large,
      color,
      hovercolor,
      expand_left,
      expand_right,
      strokewidth,
      glow_rate,
      width_percentage,
    );
    // returns an event handler to turn on and turn off active ruling
    // and a function takes element and event name as param
    return [
      function() {
        this.dash();
        status.setter('hruler', true);
      }.bind(r),
      function() {
        this.dash();
        status.setter('hruler', false);
      }.bind(r),
      r.glow.bind(r),
    ]
  }
}

class VRuler {
  constructor(
    parent_el,
    n,
    small,
    large,
    color,
    hovercolor,
    expand_left,
    expand_right,
    strokewidth,
    glow_rate, // time in ms, how fast updation is 100 suggested
    height_percentage,
  ) {
    this.parent_el = parent_el;
    this.n = n;
    this.small = small;
    this.large = large;
    this.color = color;
    this.hovercolor = hovercolor;
    this.expand_left = expand_left;
    this.expand_right = expand_right;
    this.strokewidth = strokewidth;
    this.glow_rate = glow_rate;
    this.height_percentage = height_percentage;
    this.glowed = false;
    this.ds = '';
    this.d = '';
    this.xx = 0;
    this.yy = 0;

    this.init();
    this.svg = this.parent_el.querySelector('svg');
    this.paths = this.svg.querySelectorAll('path');

    this.deduce = this.deduce.bind(this);
    this.render = this.render.bind(this);
    this.dash = this.dash.bind(this);
    this.glow = this.glow.bind(this);
  }

  deduce(top) {
    var rect = this.svg.getBoundingClientRect();
    var rtop = rect.top;
    var rheight = rect.height;
    if (rtop < top && top < rtop + rheight) {
      // inheight: top - rtop
      // each bar: rheight / this.n
      return Math.floor((top - rtop) / rheight * this.n);
    }
    return null;
  }

  render(n) {
    // render nth bar to show color
    if (n == null) return;
    this.paths.forEach((pa, ii) => {
      if (n - this.expand_left <= ii && ii <= n + this.expand_right) {
        pa.setAttribute('stroke', this.hovercolor);
      } else {
        pa.setAttribute('stroke', this.color);
      }
    });
  }

  dash() {
    this.paths.forEach(pa => {
      pa.setAttribute('stroke', this.color);
    });
  }

  glow(e) {
    if (!status.getter('vruler') || this.glowed) return;
    this.glowed = true;
    this.render(this.deduce(e.clientY));
    setTimeout(() => {
      this.glowed = false;
    }, this.glow_rate);
  }

  finishBar() {
    // no bind
    this.ds += '<path d="' + this.d + '" stroke="' + this.color + '" fill="none" stroke-width="' + this.strokewidth.toString() + '" stroke-linecap="round" />';
  }

  parseBar(n) {
    // no bind
    var cc = 0;
    this.xx = 0;
    this.yy = 5 * this.small * n - this.small;
    this.d = 'M0 ' + (this.yy + this.small).toString();
    for (let ii = n + 1; ii < n + 18; ii++) {
      this.xx = 0;
      if (cc % 3 === 0) {
        this.yy += this.small;
      }
      if ((cc - 1) % 3 === 0) {
        if ((cc - 1) % 15 === 0) {
          this.xx = this.large;
        } else {
          this.xx = this.small;
        }
      } else {
        this.xx = 0;
      }
      this.d += 'L' + this.xx.toString() + ' ' + this.yy.toString();
      cc++;
    }
  }

  init() {
    // no bind
    for (let ii = 0; ii < this.n; ii++) {
      this.parseBar(ii);
      this.finishBar();
    }
    this.parent_el.innerHTML = '<svg viewbox="0 0 ' + this.large.toString() + ' ' + (this.yy + 2 * this.strokewidth).toString() + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="white">' + this.ds + '</svg>';
    render_element({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.parent_el);
    render_element({
      width: '100%',
      height: this.height_percentage.toString() + '%',
    }, this.parent_el.querySelector('svg'));
  }

  static manage(
    active, // default control before event handler is triggered
    parent_el, // which element should this ruler be appended to
    n, // how many bars should this ruler consist
    height_percentage,
    small = 50, // bar shorter side length
    large = 75, // bar edge side length
    color = 'black', // default color
    hovercolor = 'cyan', // hover color
    expand_left = 1, // how many bars should be included as extra on the left
    expand_right = 1,
    strokewidth = 5, // ruler linewidth
    glow_rate = 100, // time segment for updating the ruler style
  ) {
    if (active) {
      status.setter('vruler', true);
    } else {
      status.setter('vruler', false);
    }
    var r = new VRuler(
      parent_el,
      n,
      small,
      large,
      color,
      hovercolor,
      expand_left,
      expand_right,
      strokewidth,
      glow_rate,
      height_percentage,
    );
    // returns an event handler to turn on and turn off active ruling
    return [
      function() {
        this.dash();
        status.setter('vruler', true);
      }.bind(r),
      function() {
        this.dash();
        status.setter('vruler', false);
      }.bind(r),
      r.glow.bind(r),
    ]
  }
}

class FrameTopLeft {
  constructor(
    parent_el,
    width_px,
  ) {
    this.parent_el = parent_el;
    this.width_px = width_px;
    this.top_frame = document.createElement('div');
    render_element({
      width: "100%",
      height: this.width_px.toString() + 'px',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
    }, this.top_frame);
    this.parent_el.appendChild(this.top_frame);
    this.top_left_el = document.createElement('div');
    render_element({
      width: this.width_px.toString() + 'px',
      height: this.width_px.toString() + 'px',
      border: '1px solid',
    }, this.top_left_el);
    this.top_frame.appendChild(this.top_left_el);
    this.top_right_el = document.createElement('div');
    render_element({
      width: `calc(100% - ${this.width_px}px)`,
      height: '100%',
    }, this.top_right_el);
    this.top_frame.appendChild(this.top_right_el);
    this.bottom_frame = document.createElement('div');
    render_element({
      height: `calc(100% - ${this.width_px}px)`,
      width: '100%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
    }, this.bottom_frame);
    this.parent_el.appendChild(this.bottom_frame);
    this.bottom_left_el = document.createElement('div');
    render_element({
      width: this.width_px.toString() + 'px',
      height: '100%',
      border: '1px solid',
    }, this.bottom_left_el);
    this.bottom_frame.appendChild(this.bottom_left_el);
    this.el = document.createElement('div');
    render_element({
      width: `calc(100% - ${this.width_px}px)`,
      height: '100%',
      border: '1px solid',
    }, this.el);
    this.bottom_frame.appendChild(this.el);
    /*
    top left: this.top_left_el
    top: this.top_right_el
    left: this.bottom_left_el
    */
  }
}

class HStripe {
  constructor(
    parent_el,
    width,
    color,
    buffer, // ms
    grids, // array of rect positions
  ) {
    this.parent_el = parent_el;
    this.width = width;
    this.color = color;
    this.buffer = buffer;
    this.grids = grids;

    this.el = document.createElement('div');
    render_element({
      position: 'absolute',
      opacity: '0.5',
      background: color,
      width: width.toString() + 'px',
      height: '100%',
      transition: 'width 0.25s ease-in',
      zIndex: '-100',
    }, this.el);

    this.parent_el.appendChild(this.el);

    this.mousemoved = false;
    this.mousemove = this.mousemove.bind(this);
    this.oMouseLeft = this.oMouseLeft.bind(this);
    this.oMouseDrop = this.oMouseDrop.bind(this); // VStripe doesn't have this because config.sec handles all
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
  }

  oMouseLeft(e) {
    var rect = this.parent_el.getBoundingClientRect();
    var lf = e.clientX - rect.left;
    if (lf > rect.width - this.width) {
      return rect.width - this.width
    } else {
      for (let ii = 0; ii < this.grids.length; ii++) {
        var wd = this.grids[ii].left * rect.width / 100;
        if (wd < lf && lf < wd + this.grids[ii].width * rect.width / 100) {
          this.el.style.width = this.grids[ii].width.toString() + '%';
          return wd;
        }
      }
      this.el.style.width = this.width.toString() + 'px';
      return lf;
    }
  }

  // return rectReference ind supports horizontal movement
  oMouseDrop(e) {
    var rect = this.parent_el.getBoundingClientRect();
    var lf = e.clientX - rect.left;
    for (let ii = 0; ii < this.grids.length; ii++) {
      var wd = this.grids[ii].left * rect.width / 100;
      if (wd < lf && lf < wd + this.grids[ii].width * rect.width / 100) {
        return ii;
      }
    }
  }

  mousemove(e) {
    if (this.mousemoved) return;
    this.mousemoved = true;
    var lf = this.oMouseLeft(e);
    this.el.style.left = lf.toString() + 'px';
    setTimeout(() => {
      this.mousemoved = false;
    }, this.buffer);
  }

  hide() {
    this.el.style.display = 'none';
  }

  show() {
    this.el.style.display = 'block';
  }
}

class VStripe {
  constructor(
    parent_el,
    height,
    color,
    buffer,
    grids, // array of rect positions
  ) {
    this.parent_el = parent_el;
    this.height = height;
    this.color = color;
    this.buffer = buffer;
    this.grids = grids;

    this.el = document.createElement('div');
    render_element({
      position: 'absolute',
      opacity: '0.5',
      background: color,
      width: '100%',
      height: height.toString() + 'px',
      transition: 'height 0.25s ease-in',
      zIndex: '-100',
    }, this.el);

    this.parent_el.appendChild(this.el);

    this.mousemoved = false;
    this.mousemove = this.mousemove.bind(this);
    this.oMouseTop = this.oMouseTop.bind(this);
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
  }

  oMouseTop(e) {
    var rect = this.parent_el.getBoundingClientRect();
    var tp = e.clientY - rect.top;
    if (tp > rect.height - this.height) {
      return rect.height - this.height
    } else {
      for (let ii = 0; ii < this.grids.length; ii++) {
        var ht = this.grids[ii].top * rect.height / 100;
        if (ht < tp && tp < ht + this.grids[ii].height * rect.height / 100) {
          this.el.style.height = this.grids[ii].height.toString() + '%';
          return ht;
        }
      }
      this.el.style.height = this.height.toString() + 'px';
      return tp;
    }
  }

  mousemove(e) {
    if (this.mousemoved) return;
    this.mousemoved = true;
    var tp = this.oMouseTop(e);
    this.el.style.top = tp.toString() + 'px';
    setTimeout(() => {
      this.mousemoved = false;
    }, this.buffer);
  }

  hide() {
    this.el.style.display = 'none';
  }

  show() {
    this.el.style.display = 'block';
  }
}

class StripeBar {
  constructor(
    parent_el,
    width,
    height,
    buffer, // ms
    hgrid,
    vgrid,
    hcolor,
    vcolor,
  ) {
    this.hstripe = new HStripe(
      parent_el,
      width,
      hcolor,
      buffer,
      hgrid,
    );

    this.vstripe = new VStripe(
      parent_el,
      height,
      vcolor,
      buffer,
      vgrid,
    );

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.mousemove = this.mousemove.bind(this);
  }

  hide() {
    this.hstripe.hide();
    this.vstripe.hide();
  }

  show() {
    this.hstripe.show();
    this.vstripe.show();
  }

  mousemove(e) {
    this.hstripe.mousemove(e);
    this.vstripe.mousemove(e);
  }

  static manage(
    parent_el,
    width,
    height,
    buffer, // ms
    hgrid,
    vgrid,
    hcolor,
    vcolor,

    shown,
  ) {
    var sb = new StripeBar(
      parent_el,
      width,
      height,
      buffer, // ms
      hgrid,
      vgrid,
      hcolor,
      vcolor,
    );
    if (!shown) sb.hide();
    return [sb.show, sb.hide, sb.mousemove, sb.hstripe.oMouseDrop];
  }
}

class Manage {
  constructor(
    parent_el,
    grid_width,
    time_segments,
    period_segments,
  ) {
    this.parent_el = parent_el;
    this.grid_width = grid_width;
    this.time_segments = time_segments;
    this.period_segments = period_segments;

    this.frame = new FrameTopLeft(this.parent_el, this.grid_width);
    // divide frame into two
    [
      this.top_top_el,
      this.top_bottom_el,
      this.left_left_el,
      this.left_right_el,
    ] = Array.from({
      length: 4
    }, ii => document.createElement('div'));
    render_element({
      display: 'flex',
      flexDirection: 'column',
    }, this.frame.top_right_el);
    render_element({
      display: 'flex',
      flexDirection: 'row',
    }, this.frame.bottom_left_el);
    render_element({
      width: '100%',
      height: '50%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, this.top_top_el);
    render_element({
      width: '100%',
      height: '50%',
    }, this.top_bottom_el);
    render_element({
      width: '50%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    }, this.left_left_el);
    render_element({
      width: '50%',
      height: '100%',
    }, this.left_right_el);

    this.frame.top_right_el.appendChild(this.top_top_el);
    this.frame.top_right_el.appendChild(this.top_bottom_el);
    this.frame.bottom_left_el.appendChild(this.left_left_el);
    this.frame.bottom_left_el.appendChild(this.left_right_el);

    // add ruler
    [this.hruler_start, this.hruler_finish, this.hruler_mousemove] = HRuler.manage(
      false,
      this.top_bottom_el,
      (this.time_segments.length - 1) * 4,
      100,
      50,
      75,
      new Config().theme.timetable.hruler[0],
      new Config().theme.timetable.hruler[1],
    );

    [this.vruler_start, this.vruler_finish, this.vruler_mousemove] = VRuler.manage(
      false,
      this.left_right_el,
      this.period_segments.length * 2,
      100,
      50,
      75,
      new Config().theme.timetable.vruler[0],
      new Config().theme.timetable.vruler[1],
    );

    // label axis
    this.time_segments.forEach(str => {
      var div = document.createElement('div');
      div.innerHTML = str;
      this.top_top_el.appendChild(div);
    });

    this.period_segments.forEach(str => {
      var div = document.createElement('div');
      div.innerHTML = str;
      this.left_left_el.appendChild(div);
    });

    this.init = this.init.bind(this);

    // background indicator
    this.frame.el.style.position = 'relative';
    this.main_el = document.createElement('div');
    render_element({
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: '100',
      opacity: '0.9',
    }, this.main_el);
    this.frame.el.appendChild(this.main_el);
    this.indicator_el = document.createElement('div');
    render_element({
      position: 'absolute',
      height: '100%',
      background: new Config().theme.timetable.timer,
      zIndex: '10',
      opacity: '0.2',
    }, this.indicator_el);
    this.frame.el.appendChild(this.indicator_el);

    // stripe
    [this.showStripe, this.hideStripe, this.stripe_mousemove, this.stripe_mousedrop] = StripeBar.manage(
      this.frame.el,
      50, // width
      50, // height
      0, // delay in ms
      new Config().hgrid, // {left, width}
      new Config().vgrid, // {top, height}
      new Config().theme.timetable.hstripe,
      new Config().theme.timetable.vstripe,
      false,
    );

    // sections oneEventListener
    this.sec_els = Array.from({
      length: new Config().sec
    }, ii => {
      let div = document.createElement('div');
      this.main_el.appendChild(div);
      render_element({
        width: '100%',
        height: '20%',
        border: '1px solid',
      }, div);
      return proxy(div);
    });

    this.date_els = document.querySelectorAll('.date-tag');

    this.workweek = new Workweek(
      this,
      this.frame.el,
      this.sec_els,
      this.date_els,
    );
    /* on subjectCard dragstart, activate rulers and stripes, this -> Manage*/

    this.indicateTime = this.indicateTime.bind(this);
    this.intervalTimer = this.intervalTimer.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.endTimer = this.endTimer.bind(this);
  }

  init(card_els) {
    card_els.forEach(el => {
      el.addEventListener('dragstart', function() {
        this.hruler_start();
        this.vruler_start();
      }.bind(this));

      el.addEventListener('dragend', function() {
        this.hruler_finish();
        this.vruler_finish();
      }.bind(this));
    });
  }

  indicateTime(percent) {
    this.indicator_el.style.width = percent.toString() + '%';
  }

  intervalTimer() {
    var ct = new Clock(this.time_func());
    var [st, ft] = new Config().period.split();
    var percent;
    if (ct.lt(st)) {
      // current time less than start time
      percent = 0;
    } else if (ct.ge(ft)) {
      // current time greater than or equal to finish time
      percent = 100;
    } else {
      // current time is between start and finish time
      percent = ct.gap(st) / ft.gap(st);
    }
    this.indicateTime(percent);
  }

  startTimer(func) {
    if (this.timer) this.endTimer();
    this.time_func = func;
    this.intervalTimer();
    this.timer = setInterval(this.intervalTimer, 60 * 1000);
  }

  endTimer() {
    clearInterval(this.timer);
  }
}

// NAV
function nav_show() {
  nav_bar.style.height = '100vh';
  navs.forEach(nv => {
    nv.classList.remove('nav-vanish');
    nv.style.display = 'flex';
    nv.classList.add('nav-appear');
  })
}

function nav_hide() {
  navs.forEach(nv => {
    nv.classList.remove('nav-appear');
    nv.classList.add('nav-vanish');
  })
  setTimeout(() => {
    navs.forEach(nv => {
      nv.style.display = 'none';
    })
    nav.style.display = 'flex';
    nav_bar.style.height = '8vh';
  }, 350);
}

nav.addEventListener('click', function() {
  if (status.getter('nav')) {
    nav_hide();
  } else {
    nav_show();
  }
  status.reverse('nav');
});

function intro_setup() {
  info_intro_paths.forEach(the_path => {
    var len = the_path.getTotalLength();
    the_path.style.strokeDasharray = len;
    the_path.style.strokeDashoffset = len;
  });
}

function intro_show() {
  show_svg(info_intro_paths);
}

function intro_hide() {
  hide_svg(info_intro_paths);
}

superior.addBefore(intro_setup);

function imgFrontDoorSetup() {
  let styles = {
    transform: 'translateX(100vw)',
    opacity: '1',
    transition: 'initial',
  };
  render_element(styles, img_front_door);
  render_element(styles, img_school);
}

function imgFrontDoorLeftIn() {
  render_element({
    transform: 'translateX(0)',
    transition: 'transform 1s',
  }, img_front_door);
  setTimeout(() => {
    render_element({
      opacity: '0.2',
      transition: 'all 2s',
    }, img_front_door);
  }, 500);

  setTimeout(() => {
    render_element({
      transform: 'translateX(50vw)',
      transition: 'transform 1s',
    }, img_school);
    setTimeout(() => {
      render_element({
        opacity: '0.2',
        transition: 'all 2s',
      }, img_school);
    }, 500);
  }, 1000);
}

function imgFrontDoorRightOut() {
  render_element({
    transform: 'translateX(100vw)',
    transition: 'transform 1s',
  }, img_school);
  setTimeout(() => {
    imgFrontDoorSetup();
  }, 1200);

  setTimeout(() => {
    render_element({
      transform: 'translateX(100vw)',
      transition: 'transform 1s',
    }, img_front_door);
    setTimeout(() => {
      imgFrontDoorSetup();
    }, 1200);
  }, 500);
}

superior.addAfter(imgFrontDoorLeftIn, 1000);
superior.addBefore(imgFrontDoorSetup, 500);

function infoCardShow() {
  info_card.style.display = 'flex';
  setTimeout(() => {
    info_card_left.style.opacity = '0.7';
    setTimeout(() => {
      info_card_right.style.opacity = '0.7';
    }, 500);
  }, 0);
}

function infoCardHide() {
  info_card_left.style.opacity = '0';
  info_card_right.style.opacity = '0';
  setTimeout(() => {
    info_card.style.display = 'none';
  }, 400);
}

superior.addBefore(infoCardHide);
superior.addAfter(infoCardShow, 2000);
superior.addAfter(intro_show, 0);

function autoType(el, paragraph, delay = 1000, speed = 50) {
  el.innerHTML = '';
  var i = 0;
  setTimeout(function() {
    var interval = setInterval(function() {
      el.innerHTML += paragraph.charAt(i);
      i++;
      if (i >= paragraph.length) {
        clearInterval(interval)
      }
    }, speed);
  }, delay);
}

function max_length_at(arr) {
  // pass in a list of string, return an index indicating max length
  var ind = 0;
  arr.forEach((ar, ii) => {
    if (ar.length > arr[ind].length) {
      ind = ii;
    }
  });
  return ind;
}

function type_info_content() {
  if (!status.getter('typing')) {
    status.setter('typing', true);
    info_contents.forEach((el, ii) => {
      autoType(el, paragraphs[ii]);
    });
    setTimeout(() => {
      status.setter('typing', false);
    }, paragraphs[max_length_at(paragraphs)].length * 50 + 1000);
  }
}

superior.addAfter(type_info_content, 0);

function info_route_hide() {
  if (!status.getter('route')) return;
  /*
  hide the contents on the cards, left svg and right p
  dismiss the two cards
  move the two images to the right
  */
  intro_hide();
  imgFrontDoorRightOut();
  infoCardHide();
  status.setter('info', false);
  setTimeout(() => {
    status.setter('route', false);
  }, 1000);
}

function info_route_show() {
  if (status.getter('route')) return;
  imgFrontDoorLeftIn();
  setTimeout(() => {
    infoCardShow();
    setTimeout(() => {
      intro_show();
      type_info_content();
    }, 500);
  }, 1000);
  status.setter('info', true);
  setTimeout(() => {
    status.setter('route', true);
  }, 2000);
}

function info_section_handle() {
  topbottom(section_intro, info_route_show, info_route_hide, status.getter('info'));
}

main.addEventListener('scroll', info_section_handle);

// weekbar

class ProcessBar {
  constructor(
    el, // bar element 
    bars, // the went across elements
    at, // init position at which, Mon -> 1, Tue -> 2
    at_styles, // this day is fixed
    callbacks, // a list of functions, index map to bars, click to day, what to happen
  ) {
    render_element(at_styles, bars[at - 1].el);

    this.el = el;
    this.n = bars.length;
    this.bars = bars;
    this.at = at;
    this.callbacks = callbacks;

    this.init = this.init.bind(this);
    this.load = this.load.bind(this);
    this.move = this.move.bind(this);
    this.moveTo = this.moveTo.bind(this);

    this.move(this.at);
  }

  move(at) {
    this.bars.forEach((wb, ii) => {
      wb.el.oneEventListener('click', function() {
        this.moveTo(ii + 1);
        this.callbacks[ii]();
      }.bind(this));
    });
  }

  moveTo(at) {
    for (let ii = 0; ii < this.n; ii++) {
      if (ii < at - 1) {
        this.bars[ii].past();
      } else if (ii == at - 1) {
        this.bars[ii].now();
      } else {
        this.bars[ii].future();
      }
    }
  }

  init() {
    for (let ii = 0; ii < this.n; ii++) {
      this.bars[ii].init();
    }
    this.el.style.transition = 'all 0s';
    this.el.style.width = '0';
  }

  load(n) {
    this.el.style.transition = 'all 2s';
    for (let ii = 0; ii < this.n; ii++) {
      if (ii < n - 1) {
        this.bars[ii].past();
      } else if (ii == n - 1) {
        this.bars[ii].now();
      } else {
        this.bars[ii].future();
      }
    }
    this.el.style.width = `${50 / this.n + (n - 1) * (100 / this.n)}%`;
    this.at = n;
  }
}

class WeekBar {
  constructor(el) {
    this.el = el;

    this.init = this.init.bind(this);
    this.past = this.past.bind(this);
    this.now = this.now.bind(this);
    this.future = this.future.bind(this);
  }

  init() {
    this.el.classList.remove('bar-now');
    this.el.classList.remove('bar-future');
    this.el.classList.remove('bar-past');
  }

  past() {
    this.el.classList.remove('bar-now');
    this.el.classList.remove('bar-future');
    this.el.classList.add('bar-past');
  }

  now() {
    this.el.classList.remove('bar-past');
    this.el.classList.remove('bar-future');
    this.el.classList.add('bar-now');
  }

  future() {
    this.el.classList.remove('bar-past');
    this.el.classList.remove('bar-now');
    this.el.classList.add('bar-future');
  }
}

function init_weekbar() {
  var dd = new Date().getDay();
  if (dd > 5) {
    dd = 1;
  }
  dd = 1;
  var pb = new ProcessBar(
    document.querySelector('#process-bar'),
    Array.prototype.slice.call(pqsa('#date-main span')).map(el => new WeekBar(el)),
    dd, {
      color: 'black',
    }, // today's style (won't change)
    [
      () => {
        console.log('Mon')
      },
      () => {
        console.log('Tue')
      },
      () => {
        console.log('Wed')
      },
      () => {
        console.log('Thu')
      },
      () => {
        console.log('Fri')
      },
    ],
  )
  pb.load(dd);
}

superior.addAfter(init_weekbar, 0);

/* timeline */
class Clock {
  constructor(str) {
    if (str instanceof Clock) return str;
    var [h, min] = str.split(':');
    this.h = parseInt(h);
    this.min = parseInt(min);

    this.concat = this.concat.bind(this);
    this.minutes = this.minutes.bind(this);
    this.gap = this.gap.bind(this);
    this.gaplength = this.gaplength.bind(this);
    this.parse = this.parse.bind(this);
    this.shift_h = this.shift_h.bind(this);
    this.shift_min = this.shift_min.bind(this);
    this.lt = this.lt.bind(this);
    this.clean = this.clean.bind(this);
    this.eq = this.eq.bind(this);

    this.isub = this.isub.bind(this);
    this.iadd = this.iadd.bind(this);
    this.sub = this.sub.bind(this);
    this.add = this.add.bind(this);

    this.toMin = this.toMin.bind(this);
  }

  concat() {
    return new Clock(this.parse());
  }

  // convert clock h, min to min
  minutes() {
    return this.h * 60 + this.min;
  }

  // pass in a clock, return gap in minute
  gap(clock) {
    return Math.abs(this.minutes() - clock.minutes());
  }

  gaplength(clock, h, min, length) {
    return this.gap(clock) / (h * 60 + min) * length;
  }

  parse() {
    var h = this.h.toString();
    var min = this.min.toString();
    min = min.length == 1 ? min + '0' : min;
    return h + ':' + min;
  }

  iadd(clock) {
    if (typeof clock === 'number') {
      this.iadd(new Clock('0:' + clock.toString()))
    } else {
      this.shift_min(clock.min);
      this.shift_h(clock.h);
    }
    return this;
  }

  isub(clock) {
    if (typeof clock === 'number') {
      this.isub(new Clock('0:' + clock.toString()));
    } else {
      this.shift_min(-clock.min);
      this.shift_h(-clock.h);
    }
    return this;
  }

  add(clock) {
    return this.concat().iadd(clock);
  }

  sub(clock) {
    return this.concat().isub(clock);
  }

  shift_h(h) {
    this.h += h;
    while (this.h >= 24) {
      this.h -= 24;
    }
    while (this.h < 0) {
      this.h += 24;
    }
  }

  shift_min(min) {
    this.min += min;
    while (this.min >= 60) {
      this.min -= 60;
      this.h += 1;
      if (this.h >= 24) {
        this.h -= 24;
      }
    }
    while (this.min < 0) {
      this.min += 60;
      this.h -= 1;
      if (this.h < 0) {
        this.h += 24;
      }
    }
  }

  lt(clock) {
    // less than
    var tmin = this.minutes();
    var imin = clock.minutes();
    return tmin !== imin && tmin < imin;
  }

  ge(clock) {
    // greater than or equal to
    var tmin = this.minutes();
    var imin = clock.minutes();
    return tmin === imin || tmin > imin;
  }

  clean() {
    this.shift_min(0);
    this.shift_h(0);
  }

  eq(clock) {
    // equal to
    this.clean();
    clock.clean();
    return this.h === clock.h && this.min === clock.min;
  }

  toMin() {
    this.clean();
    return this.h * 60 + this.min;
  }

  static max(arr) {
    var mses = arr.map(cl => cl.toMin());
    return arr[mses.indexOf(Math.max.apply(Math, mses))]
  }

  static min(arr) {
    var mses = arr.map(cl => cl.toMin());
    return arr[mses.indexOf(Math.min.apply(Math, mses))]
  }
}

class Period {
  // pass in two clock object
  constructor(from_, to_) {
    this.from_ = from_;
    this.to_ = to_;

    this.concat = this.concat.bind(this);
    this.gap = this.gap.bind(this);
    this.gaplength = this.gaplength.bind(this);
    this.shift_min = this.shift_min.bind(this);
    this.parse = this.parse.bind(this);
    this.lt = this.lt.bind(this);
    this.eq = this.eq.bind(this);
    this.segment = this.segment.bind(this);
    this.rectReference = this.rectReference.bind(this);
    this.split = this.split.bind(this);
  }

  concat() {
    return new Period(this.from_.concat(), this.to_.concat());
  }

  gap() {
    return this.from_.gap(this.to_);
  }

  gaplength(h, min, length) {
    return this.from_.gaplength(this.to_, h, min, length);
  }

  shift_min(min) {
    this.from_.shift_min(min);
    this.to_.shift_min(min);
  }

  parse() {
    return `${this.from_.parse()}~${this.to_.parse()} [${this.gap()}]`;
  }

  lt(period) {
    // less than
    return this.from_.lt(period.from_);
  }

  eq(period) {
    return this.from_.eq(period.from_) && this.to_.eq(period.to_);
  }

  segment() {
    var sh = this.from_.h;
    var fh = this.to_.min > 0 ? this.to_.h + 1 : this.to_.h;
    return Array.from({
      length: fh - sh + 1
    }, (dd, ii) => sh + ii);
  }

  // pass in a period, return {left, width}
  rectReference(contained) {
    var large_gap = this.gap();
    var small_gap = contained.gap();
    var to_gap = new Period(this.from_, contained.from_).gap();
    return {
      left: rit(to_gap / large_gap * 100),
      width: rit(small_gap / large_gap * 100)
    };
  }

  split() {
    return [this.from_, this.to_];
  }

  static sort(periods) {
    return periods.sort((p1, p2) => !p1.lt(p2));
  }
}

/* All Courses
VisualArts
Physics
Music
Media
MathScience
MathBusiness
InternationalStudies
IT
Law
SocialScience
Economics
Chemistry
Biology
AustralianStudies
Accounting
MathFurther
English
*/

class Subject {
  constructor(
    host, // workday instance
    bg_url,
    start, // string, e.g. 12:45
    finish,
    name,
    course,
    teacher,
    r,
    g,
    b,
  ) {
    this.host = host;
    this.bg_url = 'img/' + bg_url;
    this.start = new Clock(start);
    this.finish = new Clock(finish);
    this.name = name;
    this.course = course;
    this.teacher = teacher;
    this.rgba = new RGBA(r, g, b);

    this.duration = new Period(this.start, this.finish);
    // percents
    this.left = rit(this.start.gaplength(new Config().period.from_, 7, 0, 100));
    this.width = rit(this.duration.gaplength(7, 0, 100));

    this.card_style = {
      position: 'relative',
      top: '2%',
      left: `${this.left}%`,
      width: `calc(${this.width}% - 10px)`,
      height: 'calc(90% - 10px)',
      borderRadius: '20px',
      border: '5px solid darkgray',
      transition: 'all 0.5s ease-in-out',
      overflow: 'hidden',
      zIndex: '10000',
    };

    this.card_mouseenter_style = {
      boxShadow: '0 0',
      transform: 'translate(7.5px, 5px)',
    };

    this.card_mouseleave_style = {
      boxShadow: '7.5px 5px gray',
      transform: 'translate(0, 0)',
    };

    this.img_style = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      zIndex: '-100',
      opacity: '0.5',
    };

    this.card_content_style = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      zIndex: '100',
    };

    this.h1_style = {
      width: '100%',
      height: '20%',
      fontSize: '1.2em',
      padding: '0 5px 5px 5px',
      color: this.rgba.rgb(),
    };

    this.course_style = {
      width: '100%',
      height: '5%',
      textAlign: 'center',
      fontSize: '1em',
      fontWeight: 'bold',
      color: this.rgba.rgb(),
    };

    this.teacher_style = {
      width: '100%',
      height: '5%',
      fontSize: '1.2em',
      fontStyle: 'italic',
      textAlign: 'right',
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: this.rgba.rgb(),
    };

    this.card_el = proxy(document.createElement('div'));
    this.card_el.setAttribute('draggable', true);
    this.card_el.cls = this;
    render_element(this.card_style, this.card_el);
    this.img_el = document.createElement('img');
    this.img_el.setAttribute('src', this.bg_url);
    render_element(this.img_style, this.img_el);
    this.card_content_el = document.createElement('div');
    render_element(this.card_content_style, this.card_content_el)
    this.h1_el = document.createElement('h1');
    this.h1_el.innerHTML = this.name;
    render_element(this.h1_style, this.h1_el);
    this.course_el = document.createElement('p');
    this.course_el.innerHTML = this.course;
    render_element(this.course_style, this.course_el);
    this.teacher_el = document.createElement('p');
    this.teacher_el.innerHTML = this.teacher;
    render_element(this.teacher_style, this.teacher_el);

    this.card_el.appendChild(this.img_el);
    this.card_el.appendChild(this.card_content_el);
    this.card_content_el.appendChild(this.h1_el);
    this.card_content_el.appendChild(this.course_el);
    this.card_content_el.appendChild(this.teacher_el);

    this.shift_min = this.shift_min.bind(this);
    this.becomeChildOf = this.becomeChildOf.bind(this);
    this.switchChildBetween = this.switchChildBetween.bind(this);
    this.cardMouseEnter = this.cardMouseEnter.bind(this);
    this.cardMouseLeave = this.cardMouseLeave.bind(this);
    this.cardDragStart = this.cardDragStart.bind(this);
    this.setSecIndex = this.setSecIndex.bind(this);

    // inits card with styles
    this.cardMouseLeave();

    this.card_el.addEventListener('mouseenter', this.cardMouseEnter);
    this.card_el.addEventListener('mouseleave', this.cardMouseLeave);
    this.card_el.addEventListener('dragstart', this.cardDragStart);

    // binds
    this.eq = this.eq.bind(this);
    this.concat = this.concat.bind(this);
    this.moveCard = this.moveCard.bind(this);

    this.enable_click = this.enable_click.bind(this);
    this.config = this.config.bind(this);

    /* this.host.host.host -> Manage
    on dragstart, activate rulers and stripes
    on dragend, dismiss all of them
    	[this.hruler_start, this.hruler_finish]
    	[this.vruler_start, this.vruler_finish]
    	[this.showStripe, this.hideStripe]
    */
  }

  shift_min(min) {
    this.duration.shift_min(min);
    this.left = rit(this.start.gaplength(new Clock('11:00'), 7, 0, 100));
    this.width = rit(this.duration.gaplength(7, 0, 100));

    this.card_style.left = `${this.left}%`;
    this.card_style.width = `calc(${this.width}% - 10px)`;
    this.card_el.style.left = this.card_style.left;
    this.card_el.style.width = this.card_style.width;
  }

  becomeChildOf(parent_el) {
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.card_el);
  }

  switchChildBetween(sub) {
    // switch card
    var sparent_el = sub.parent_el;
    var parent_el = this.parent_el;
    this.parent_el.removeChild(this.card_el);
    sub.parent_el.removeChild(sub.card_el);
    this.becomeChildOf(sparent_el);
    sub.becomeChildOf(parent_el);
    // switch sec el index
    // is done in host
  }

  moveCard(period) {
    this.start = period.from_;
    this.finish = period.to_;
    this.duration = period;
    // percents
    this.left = rit(this.start.gaplength(new Config().period.from_, 7, 0, 100));
    this.width = rit(this.duration.gaplength(7, 0, 100));
    this.card_style.left = `${this.left}%`;
    this.card_style.width = `calc(${this.width}%)`;
    this.card_el.style.left = this.card_style.left;
    this.card_el.style.width = this.card_style.width;
  }

  cardMouseEnter() {
    render_element(this.card_mouseenter_style, this.card_el);
  }

  cardMouseLeave() {
    render_element(this.card_mouseleave_style, this.card_el);
  }

  cardDragStart(e) {
    // store position and communicate to parent
    this.host.setDragStart(this.sec_index, e, this);
    // activate ruler and grid
    this.host.host.host.hruler_start();
    this.host.host.host.vruler_start();
    this.host.host.host.showStripe();
  }

  eq(sub) {
    return this.start.eq(sub.start) && this.finish.eq(sub.finish) && this.name === sub.name && this.course === sub.course && this.teacher === sub.teacher;
  }

  concat() {
    return new Subject(
      this.host,
      this.bg_url,
      this.start, // string, e.g. 12:45
      this.finish,
      this.name,
      this.course,
      this.teacher,
      this.r,
      this.g,
      this.b,
    );
  }

  setSecIndex(ind) {
    this.sec_index = ind;
  }

  enable_click(){
    this.card_el.oneEventListener('click', function(){
      console.log('cl');
      panelmain.show();
      panelmain.config(
        this, // subject
        new Period(this.start, this.finish), // period,
        this.name, // name,
        this.course, // course,
        this.teacher, // teacher,
      );
      panelmain.info_view();
    }.bind(this));
  }

  // shit
  config(
    period,
    name,
    course,
    teacher,
  ){
    this.start = period.from_;
    this.finish = period.to_;
    this.name = name;
    this.course = course;
    this.teacher = teacher;
    // refresh dom elements
    this.h1_el.innerHTML = this.name;
    this.course_el.innerHTML = this.course;
    this.teacher_el.innerHTML = this.teacher;
  }
}

class Path {
  constructor(path) {
    this.arr = path.split('/');
  }

  url() {
    return this.arr.join('/');
  }

  concat() {
    return new Path(this.arr.join('/'));
  }

  backward(n) {
    var np = this.concat();
    for (let ii = 0; ii < n; ii++) {
      np.arr.pop();
    }
    return np;
  }

  forward(arr_or_str) {
    var np = this.concat();
    if (arr_or_str instanceof Array) {
      arr_or_str.forEach(st => {
        np.arr.push(st);
      });
    } else {
      // string
      np.arr.push(arr_or_str);
    }
    return np;
  }
}


class CourseLink {
  constructor(val, prop) {
    switch (prop) {
      case "id":
        this.id = val;
        this.course = "https://studysmart.taylorscollege.edu.au/course/view.php?id=" + this.id;
        this.calendar = "https://studysmart.taylorscollege.edu.au/calendar/view.php?view=upcoming&course=" + this.id;
        break;

      case "course":
        var ca = val.split('=');
        this.id = ca[ca.length - 1];
        this.course = val;
        this.calendar = "https://studysmart.taylorscollege.edu.au/calendar/view.php?view=upcoming&course=" + this.id;
        break;

      case "calendar":
        var ca = val.split('=');
        this.id = ca[ca.length - 1];
        this.course = "https://studysmart.taylorscollege.edu.au/course/view.php?id=" + this.id;
        this.calendar = val;
        break;
    }

    this.is_null = this.is_null.bind(this);
  }

  is_null() {
    return this.id == null || this.course == null || this.calendar == null;
  }
}

class ZoomLink {
  constructor(url) {
    if(url == null){
      this.url = null;
      this.id = null;
    }else{
      this.url = url;
      this.id = url.split('/').pop().split('?').shift();
    }

    this.is_null = this.is_null.bind(this);
  }

  is_null(){
    return this.url == null;
  }

  static wrap(zoomlinks) {
    /* {id: url} */
    var res = {};
    zoomlinks.forEach(zk => {
      res[zk.id] = zk.url;
    });
    return res;
  }
}

class Agenda {
  constructor(obj) {
    this.obj = obj;
    // this.arr = this.obj[2].map(ar=>ar[1].map(br=>{return {[br[0]]: br[3]}}));
    // console.log(this.arr);

    this.arr = [];
    this.obj[2].forEach(ar => {
      var cc = {};
      ar[1].forEach(br => {
        cc[br[0]] = br[3];
      });
      this.arr.push(cc);
    });

    this.__initArr();
  }

  /* only exec once in constructor */
  __initArr() {
    this.removals = [];
    this.arr.forEach((obj, ii) => {
      try {
        obj.zoomlink = new ZoomLink(obj.description.split('\n')[5].substring(4));
        var startdate = new Date(obj.dtstart);
        var enddate = new Date(obj.dtend);
        obj.period = new Period(
          new Clock(`${startdate.getHours()}:${startdate.getMinutes()}`),
          new Clock(`${enddate.getHours()}:${enddate.getMinutes()}`),
        );

        // delete
        delete obj.uid;
        delete obj.description;
        delete obj.dtstart;
        delete obj.dtend;
        delete obj.dtstamp;
        delete obj['last-modified'];
        delete obj.class;

        // switch
        obj.name = obj.categories;
        delete obj.categories;
        obj.desc = obj.summary;
        delete obj.summary;

        for (let jj = 0; jj < ii; jj++) {
          if (obj.desc === this.arr[jj].desc && obj.name === this.arr[jj].name && obj.period.eq(this.arr[jj].period) && this.zoomlink.id === this.arr[jj].zoomlink.id) {
            this.removals.push(jj);
            continue;
          }
        }
      } catch (e) {
        this.removals.push(ii);
      }
    });
    this.removals.reverse().forEach(ind => {
      this.arr.splice(ind, 1);
    });
  }

  static filterByPeriod(arr, period) {
    return arr.filter(obj => obj.period.eq(period));
  }

  static filterByName(arr, name) {
    return arr.filter(obj => obj.name === name);
  }
}

class Database {
  constructor() {
    if (Database._instance) return Database._instance;
    this.abs_path = new Path(window.location.href).backward(1);
    this.db_path = this.abs_path.forward('db');

    // load entire calendar
    this.calendar_path = this.abs_path.forward('calendar');
    fetch(this.calendar_path.forward('icalexport.ics').url())
      .then(res => res.text())
      .then(agenda => {
        this.agenda = new Agenda(ICAL.parse(agenda));
        /* course
        {
          course: {
            img: str,
            teachers: array,
          }
        }
        */
        this.course = {};
        this.agenda.arr.forEach(obj => {
          this.course[obj.name] = {
            teachers: [],
          }
        });
        // /* timeline
        // [7:00, 8:00],
        // [9:00, 10:00]
        // */
        // this.timeline = [];
        // this.agenda.arr.forEach(ar=>{
        // 	var pd = ar.period;
        // 	var na = false;
        // 	this.timeline.forEach(ed=>{
        // 		if(pd.parse() === ed.parse()){
        // 			na = true;
        // 		}
        // 	});
        // 	if(!na){
        // 		this.timeline.push(pd);
        // 	}
        // });

        /* zoomlink */
        this.zoomlink = ZoomLink.wrap(this.agenda.arr.map(ar => ar.zoomlink));
      });
    // load user course
    fetch(this.db_path.forward('calendar.json').url())
      .then(res => res.json())
      .then(calendar => {
        this.calendar = calendar;
        // load start and finsh (SYD)
        var sts = [];
        var fhs = [];
        // Object.values(this.calendar).forEach(ar=>ar.forEach(obj=>{
        Object.values(this.calendar).forEach(ar => ar.forEach(obj => {
          sts.push(new Clock(obj.start));
          fhs.push(new Clock(obj.finish));
        }));
        this.period = new Period(Clock.min(sts), Clock.max(fhs));
      });
    Database._instance = this;
  }
}

class Config extends Database {
  // User Config
  constructor() {
    if (Config._instance) return Config._instance;
    super();
    this.json_path = this.abs_path.forward('json');
    fetch(this.json_path.forward("theme.json").url())
      .then(res => res.json())
      .then(theme => {
        this.theme = theme;
      });
    fetch(this.json_path.forward("course.json").url())
      .then(res => res.json())
      .then(course => {
        /*
        {
          course: {
            img: str,
            teachers: array,
          }
        }
        */
        setTimeout(() => {
          for (const [kk, vv] of Object.entries(course)) {
            if (this.course[kk]) {
              this.course[kk].teachers += vv.teachers;
              this.course[kk].img = vv.img;
            } else {
              this.course[kk] = vv;
            }
          }
          var delkeys = [];
          for (const [kk, vv] of Object.entries(this.course)) {
            if (vv.img == null) {
              delkeys.push(kk);
            }
          }
          delkeys.forEach(kk => {
            delete this.course[kk];
          });
        }, 1000);
      });
    fetch(this.json_path.forward("id.json").url())
      .then(res => res.json())
      .then(id => {
        this.id = id;
      });
    fetch(this.json_path.forward("timeline.json").url())
      .then(res => res.json())
      .then(timeline => {
        this.timeline = timeline.map(ar => new Period(new Clock(ar[0]), new Clock(ar[1])));
        // sec el quantity
        setTimeout(() => {
          this.sec = Math.max.apply(Math, Object.values(this.calendar).map(ar => ar.length));
          // rectReference for auto grid
          var height = rit(100 / this.sec);
          this.hgrid = this.timeline.map(pd => this.period.rectReference(pd));
          this.vgrid = Array.from({
            length: this.sec
          }, (dd, ii) => {
            return {
              top: ii * height,
              height: height
            }
          });
        }, 500);
      });

    Config._instance = this;
  }
}

new Config();

// text rocket effect and time bar
class TextRocket {
  constructor(
    parent_el, // connected
    child_els, // any text wrapper that has not been connected yet
  ) {
    this.parent_el = parent_el;
    this.parent_el.style.overflow = 'hidden';
    this.child_els = child_els;
    this.child_wrapper = document.createElement('div');
    this.width = rit(this.rect().height);
    // must have flex row set
    render_element({
      position: 'absolute',
      width: '100%',
      height: this.width.toString() + 'px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'hidden',
    }, this.child_wrapper);
    this.child_els.forEach(el => {
      this.child_wrapper.appendChild(el);
    });
    this.parent_el.appendChild(this.child_wrapper);
    this.rocket_wrapper = document.createElement('div');
    this.rocket_wrapper.innerHTML = `
<svg id="rocket" viewBox="900 400 100 400">
  <g id="fire">
    <path id="red_fire" fill="#EB6736" d="M921,714.8c0-18.3,14.8-33.1,33.1-33.1c18.3,0,33.1,14.8,33.1,33.1
      c0,18.3-33.1,59.2-33.1,59.2S921,733.1,921,714.8" />
    <path id="yellow_fire" fill="#ECA643" d="M954.8,690.9c-9.4,0-16.9,7.6-16.9,17c0,9.4,17,44.5,17,44.5s16.9-35.2,16.9-44.6
      C971.7,698.4,964.1,690.9,954.8,690.9" />
  </g>

  <g id="cosmonaut">
    <rect id="XMLID_59_" x="929.7" y="608.4" transform="matrix(-1 2.445246e-04 -2.445246e-04 -1 1911.4962 1241.0038)" fill="#059F9F" width="51.9" height="24.5" />
    <circle id="XMLID_58_" fill="#F2F2F2" cx="936.6" cy="613.6" r="2.6" />
    <circle id="XMLID_57_" fill="#FF662C" cx="943.1" cy="613.6" r="2.6" />
    <circle id="XMLID_56_" fill="#F5B547" cx="949.6" cy="613.6" r="2.6" />
    <path id="XMLID_55_" fill="#059F9F" d="M985.5,598c0,1.9-1.6,3.5-3.5,3.5l-50.2,0c-1.9,0-3.5-1.6-3.5-3.5l0-46.8
      c0-1.9,1.6-3.5,3.5-3.5l50.2,0c1.9,0,3.5,1.6,3.5,3.5L985.5,598z" />
    <path id="XMLID_54_" fill="#D8D1C3" d="M981.4,579.2c0,2.1-1.7,3.7-3.7,3.7l-41.5,0c-2,0-3.7-1.7-3.7-3.7l0-19.8
      c0-2,1.7-3.7,3.7-3.7l41.5,0c2,0,3.7,1.7,3.7,3.7L981.4,579.2z" />
    <path id="XMLID_43_" fill="#79552D" d="M977.7,555.7l-41.5,0c-2,0-3.7,1.7-3.7,3.7l0,8.7c3.8,2.7,8.4,4.3,13.4,4.3
      c10.4,0,19.1-6.8,22-16.2c0.9,6.8,6.5,12.1,13.4,12.5l0-9.3C981.4,557.4,979.8,555.7,977.7,555.7" />
    <path id="XMLID_35_" fill="#79552D" d="M967.3,558.8c0,3.8-2,7.2-5.1,9c5.3-0.6,9.4-5,9.4-10.4c0-0.5-0.1-1-0.1-1.6l-4.6,0
      C967.1,556.7,967.3,557.7,967.3,558.8" />
    <path id="XMLID_34_" fill="#79552D" d="M970.2,579.4c-0.6,0-1-0.4-1-1c0-1.5-1.2-2.7-2.7-2.7c-1.5,0-2.7,1.2-2.7,2.7
      c0,0.6-0.4,1-1,1c-0.6,0-1-0.4-1-1c0-2.6,2.1-4.7,4.7-4.7c2.6,0,4.7,2.1,4.7,4.7C971.2,578.9,970.7,579.4,970.2,579.4z" />
    <path id="XMLID_33_" fill="#79552D" d="M951.2,579.4c-0.6,0-1-0.4-1-1c0-1.5-1.2-2.7-2.7-2.7c-1.5,0-2.7,1.2-2.7,2.7
      c0,0.6-0.4,1-1,1c-0.6,0-1-0.4-1-1c0-2.6,2.1-4.7,4.7-4.7c2.6,0,4.7,2.1,4.7,4.7C952.2,578.9,951.8,579.4,951.2,579.4z" />
    <circle id="XMLID_32_" fill="#F5B547" cx="978.5" cy="593.1" r="2" />
    <circle id="XMLID_31_" fill="#FF662C" cx="972" cy="593.1" r="2" />
    <path id="XMLID_30_" fill="#5B5757" d="M985.5,564.4l0,10.1c8.4,1.9,14.7,9.4,14.7,18.4c0,10.4-8.4,18.8-18.8,18.8
      c-10.4,0-18.8-8.4-18.8-18.8c0-2.8-2.2-5-5-5c-2.8,0-5,2.2-5,5c0,15.9,12.9,28.8,28.8,28.8c15.9,0,28.8-12.9,28.8-28.8
      C1010.2,578.4,999.5,566.4,985.5,564.4z" />
    <path id="XMLID_29_" opacity="0.3" fill="#F2F2F2" d="M945,555.8l-12.5,19.4l0,4.1c0,2.1,1.7,3.7,3.7,3.7l7,0l17.5-27.2L945,555.8
      z" />
  </g>
  <g id="cabin">
    <path id="XMLID_28_" fill="#0E9E9F" d="M855.9,722c-16-43-5.9-87.3,21.3-120.3l24.8,66.5c-17.5,6.5-26.2,26.4-19.7,43.9L855.9,722
      z" />
    <path id="XMLID_27_" fill="#0E9E9F" d="M1054.6,721.9c16-43,5.8-87.3-21.5-120.3l-24.7,66.6c17.5,6.5,26.3,26.4,19.8,43.9
      L1054.6,721.9z" />

    <rect id="XMLID_26_" x="896.4" y="552" transform="matrix(0.7067 -0.7075 0.7075 0.7067 -122.3782 822.5777)" opacity="0.2" fill="#FFFFFF" width="69" height="13.8" />

    <rect id="XMLID_25_" x="899.7" y="567.4" transform="matrix(0.7067 -0.7075 0.7075 0.7067 -126.8512 833.3998)" opacity="0.2" fill="#FFFFFF" width="84" height="4.5" />
    <path id="XMLID_19_" fill="#0A7370" d="M955.5,430.6c-52.1,30.2-87.1,86.5-87,150.9c0,32.5,8.9,62.9,24.4,88.9l125.5-0.1
      c15.5-26,24.3-56.4,24.3-88.9C1042.6,517,1007.5,460.7,955.5,430.6z M955.6,625.4c-26.2,0-47.5-21.2-47.5-47.5
      c0-26.2,21.2-47.5,47.5-47.5c26.2,0,47.5,21.2,47.5,47.5C1003.1,604.1,981.8,625.4,955.6,625.4z" />
    <path id="XMLID_16_" fill="#0E9E9F" d="M959.1,426c-2.2,1.3-4.3,2.6-6.4,3.9l0.1,96.3c2.1-0.3,4.3-0.4,6.4-0.4
      c26.2,0,47.5,21.2,47.5,47.5c0,8.9-2.5,17.3-6.7,24.4l45.1,0c0.8-6.8,1.2-13.8,1.2-20.8C1046.3,512.3,1011.2,456.1,959.1,426z" />
    <path id="XMLID_13_" fill="#2B2A2A" d="M955.5,520.8c-32.5,0-58.9,26.4-58.8,58.9c0,32.5,26.4,58.9,58.9,58.8
      c32.5,0,58.9-26.4,58.8-58.9C1014.4,547.2,988,520.8,955.5,520.8z M955.6,620.5c-22.5,0-40.8-18.2-40.8-40.7
      c0-22.5,18.2-40.8,40.7-40.8c22.5,0,40.8,18.2,40.8,40.7C996.3,602.2,978.1,620.5,955.6,620.5z" />
    <g id="XMLID_10_">
      <path id="XMLID_12_" fill="#FFFFFF" d="M905.3,591.7c-0.4,0-0.8-0.2-1-0.5l-17.2-21.3c-0.5-0.6-0.4-1.4,0.2-1.8
        c0.6-0.5,1.4-0.4,1.8,0.2l17.2,21.3c0.5,0.6,0.4,1.4-0.2,1.8C905.9,591.6,905.6,591.7,905.3,591.7" />
      <path id="XMLID_11_" fill="#FFFFFF" d="M887.5,591.7c-0.3,0-0.6-0.1-0.9-0.3c-0.5-0.5-0.6-1.3-0.1-1.8l18.4-21.3
        c0.5-0.5,1.3-0.6,1.8-0.1c0.5,0.5,0.6,1.3,0.1,1.8l-18.4,21.3C888.2,591.5,887.8,591.7,887.5,591.7" />
    </g>
    <circle id="XMLID_9_" fill="#2B2A2A" cx="959.9" cy="442.8" r="4.5" />
    <circle id="XMLID_8_" fill="#2B2A2A" cx="959.9" cy="475.5" r="4.5" />
    <circle id="XMLID_7_" fill="#2B2A2A" cx="959.9" cy="508.1" r="4.5" />
    <circle id="XMLID_6_" fill="#2B2A2A" cx="1039" cy="590.9" r="3.7" />
    <rect id="XMLID_5_" x="1009.4" y="558.8" fill="#2B2A2A" width="12.7" height="43" />
    <rect id="XMLID_4_" x="934.3" y="670.4" fill="#2B2A2A" width="42.6" height="4.4" />
    <circle id="XMLID_3_" fill="#2B2A2A" cx="1044.4" cy="704.2" r="4.5" />
    <circle id="XMLID_2_" fill="#2B2A2A" cx="867" cy="709" r="4.5" />
  </g>
</svg>
    `;
    this.rocket = this.rocket_wrapper.querySelector('svg');

    this.parent_el.appendChild(this.child_wrapper);
    this.parent_el.appendChild(this.rocket_wrapper);
    render_element({
      position: 'absolute',
      width: '100%',
      height: this.width.toString() + 'px',
      transition: 'width 1500ms ease-in-out',
      overflow: 'hidden',
      background: 'white',
    }, this.rocket_wrapper);

    render_element({
      float: 'right',
      transform: 'rotate(-90deg)',
      width: this.width.toString() + 'px',
      height: this.width.toString() + 'px',
      zIndex: '1000',
    }, this.rocket);

    this.rect = this.rect.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  rect() {
    return this.parent_el.getBoundingClientRect();
  }

  show() {
    this.rocket_wrapper.style.width = '0';
  }

  hide() {
    this.rocket_wrapper.style.transition = 'all 0s ease 0s';
    this.rocket_wrapper.style.width = '100%';
    this.rocket_wrapper.style.transition = 'width 1500ms ease-in-out';
  }
}

class PillBar {
  constructor(
    str1,
    str2,
    borderRadius,
    padding,
    fontSize,
    fontFamily,
    color1,
    color2,
    bg1,
    bg2,
  ) {
    [this.el, this.left_el, this.right_el] = Array.from({
      length: 3
    }, ii => document.createElement('div'));
    render_element({
      display: 'flex',
      flexDirection: 'row',
      cursor: 'pointer',
      fontSize: fontSize,
      borderRadius: borderRadius,
    }, this.el);
    render_element({
      color: color1,
      background: bg1,
      padding: padding,
      borderRadius: `${borderRadius} 0 0 ${borderRadius}`,
    }, this.left_el);
    this.left_el.innerHTML = str1;
    render_element({
      color: color2,
      background: bg2,
      padding: padding,
      borderRadius: `0 ${borderRadius} ${borderRadius} 0`,
    }, this.right_el);
    this.right_el.innerHTML = str2;
    this.el.appendChild(this.left_el);
    this.el.appendChild(this.right_el);

    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);

    this.left_el.addEventListener('mouseenter', () => {
      this.mouseenter(this.left_el)
    });
    this.left_el.addEventListener('mouseleave', () => {
      this.mouseleave(this.left_el)
    });
    this.right_el.addEventListener('mouseenter', () => {
      this.mouseenter(this.right_el)
    });
    this.right_el.addEventListener('mouseleave', () => {
      this.mouseleave(this.right_el)
    });
  }

  mouseenter(el) {
    render_element({
      opacity: '0.8',
    }, el);
  }

  mouseleave(el) {
    render_element({
      opacity: '1',
    }, el);
  }
}

class TimeBar extends TextRocket {
  constructor(
    parent_el,
    period,
    fontSize,
  ) {
    super(
      parent_el,
      [
        new PillBar(
          'start',
          period.from_.parse(),
          '20px',
          '5px',
          fontSize,
          'Arial',
          '#deeaee',
          '#deeaee',
          '#c94c4c',
          '#f7786b',
        ).el,
        new PillBar(
          'duration',
          period.gap().toString() + 'min',
          '20px',
          '5px',
          fontSize,
          'Arial',
          '#645a6c',
          '#645a6c',
          '#86af49',
          '#b5e7a0',
        ).el,
        new PillBar(
          'finish',
          period.to_.parse(),
          '20px',
          '5px',
          fontSize,
          'Arial',
          '#f4e1d2',
          '#f4e1d2',
          '#618685',
          '#92a8d1',
        ).el,
      ]
    );
    this.config = this.config.bind(this);
  }

  config(period) {
    this.child_els[0].querySelectorAll('div')[1].innerHTML = period.from_.parse();
    this.child_els[1].querySelectorAll('div')[1].innerHTML = period.gap().toString() + ' mins';
    this.child_els[2].querySelectorAll('div')[1].innerHTML = period.to_.parse();
  }
}


// search
class Search {
  constructor(
    el, // textarea or input
    ocean, // array containing mapping string, return index
    btn, // search btn
    func,
    cover = 2,
  ) {
    this.el = el;
    this.ocean = once(ocean); // array does not have duplicated element
    this.btn = btn;
    this.func = func;
    this.cover = cover;

    this.search = this.search.bind(this);

    this.btn.addEventListener('click', function() {
      this.func(this.sort());
    }.bind(this));

    this.config = this.config.bind(this);
  }

  static pick(
    ind, // current at
    cover, // range
    len, // upper boundary
  ) {
    var inds = [];
    var pris = [];
    for (let ii = ind - cover; ii <= ind + cover; ii++) {
      if (ii >= 0 && ii <= len) {
        inds.push(ii);
        pris.push(cover - Math.abs(ind - ii) + 1);
      }
    }
    return [inds, pris];
  }

  static rate(input, output, cover) {
    // return a numeric indicator to similarity
    var ratio = 0;
    for (let ii = 0; ii < input.length; ii++) {
      var [inds, pris] = Search.pick(ii, cover, input.length);
      for (let jj = 0; jj < inds.length; jj++) {
        let ind = inds[jj];
        let pri = pris[jj];
        if (input[ind] === output[ind]) {
          ratio += pri;
        }
      }
    }
    return ratio;
  }

  search() {
    let indices = this.ocean.map(str => Search.rate(this.el.value, str, this.cover));
    let maxval = indices.indexOf(Math.max(...indices));
    return this.ocean[maxval];
  }

  sort() {
    var res = [];
    var indices = this.ocean.map(str => Search.rate(this.el.value, str, this.cover));
    for (let ii = 0; ii < indices.length; ii++) {
      let ma = Math.max(...indices);
      let ma_at = indices.indexOf(ma);
      indices[ma_at] = -1;
      res.push(this.ocean[ma_at]);
    }
    return res;
  }

  config(ocean) {
    this.ocean = once(ocean);
  }
}

class InputSearch {
  constructor(
    host, // parent class
    parent_el,
    width_px,
    fontSize,
    styles,
    ocean, // array containing mapping string, return index
    sub_styles,
    preFocus = () => {}, // focus first event handler
    aftBlur = () => {}, // blur last event handler
    free = 5,
    cover = 2,
  ) {
    this.host = host;
    this.is_array = Array.isArray(ocean);
    this.parent_el = parent_el;
    this.width_px = width_px;
    this.fontSize = fontSize;
    this.preFocus = preFocus;
    this.aftBlur = aftBlur;

    this.free = free;
    this.sub_styles = sub_styles;

    if (Array.isArray(ocean)) {
      this.is_array = true;
      this.ocean_length = ocean.length;
    } else {
      this.is_array = false;
      var kks = Object.keys(ocean);
      this.ocean_length = kks.length;
    }
    this.ocean = ocean;

    this.wrapper = document.createElement('div');
    render_element(Object.assign(styles, {
      width: this.width_px.toString() + 'px',
      fontSize: this.fontSize,
      display: 'flex',
      flexDirection: 'row',
    }), this.wrapper);
    this.el = document.createElement('input');
    this.el.setAttribute('type', 'text');
    this.el.style.fontSize = fontSize;
    this.wrapper.appendChild(this.el);
    this.parent_el.appendChild(this.wrapper);
    this.btn = document.createElement('i');
    this.btn.setAttribute('class', 'fas fa-search');
    render_element({
      cursor: 'pointer',
      borderRadius: '10px',
    }, this.btn);
    this.wrapper.appendChild(this.btn);

    this.search_engine = new Search(
      this.el,
      this.is_array ? ocean : Object.keys(ocean),
      this.btn,
      () => {},
      cover,
    );

    var rect = this.rect();
    // search bar and btn
    this.el.style.width = (rect.width - rect.height - 7.5).toString() + 'px';
    this.el.style.height = (rect.height).toString() + 'px';
    this.btn.style.fontSize = (rect.height).toString() + 'px';
    /* subsidaries */
    this.sub_wrapper = document.createElement('div');
    render_element({
      position: 'fixed',
      width: this.width_px.toString() + 'px',
      overflow: 'auto',
      zIndex: '20000',
      padding: '5px',
      display: 'none',
    }, this.sub_wrapper);

    this.show_subs = this.show_subs.bind(this);
    this.hide_subs = this.hide_subs.bind(this);
    this.sub_mouseenter = this.sub_mouseenter.bind(this);
    this.sub_mouseleave = this.sub_mouseleave.bind(this);
    this.sub_click = this.sub_click.bind(this);
    document.body.appendChild(this.sub_wrapper);
    /* bind */
    this.rect = this.rect.bind(this);
    this.btn_mouseenter = this.btn_mouseenter.bind(this);
    this.btn_mouseleave = this.btn_mouseleave.bind(this);
    this.btn_click = this.btn_click.bind(this);

    window.addEventListener('resize', this.maintain);
    this.btn.addEventListener('mouseenter', this.btn_mouseenter);
    this.btn.addEventListener('mouseleave', this.btn_mouseleave);
    this.btn.addEventListener('click', this.btn_click);

    this.el.addEventListener('keyup', e => {
      if (e.key === 'Enter') {
        var val = this.el.value;
        this.btn_click();
        this.el.value = val;
      }
    });
    this.el.addEventListener('focus', this.btn_click);
    this.el.addEventListener('blur', this.hide_subs);

    this.config = this.config.bind(this);
  }

  get value() {
    return this.el.value
  }

  set value(v) {
    this.el.value = v;
  }

  rect() {
    return this.wrapper.getBoundingClientRect();
  }

  show_subs() {
    var rect = this.rect();
    this.sub_wrapper.style.display = 'block';
    this.sub_wrapper.style.top = (rect.top + rect.height).toString() + 'px';
    this.sub_wrapper.style.left = (rect.left).toString() + 'px';
  }

  hide_subs() {
    this.sub_wrapper.style.display = 'none';
    this.sub_wrapper.style.top = window.screen.width.toString() + 'px';
    this.sub_wrapper.style.left = window.screen.height.toString() + 'px';
    if (this.host.autofill_checkbox.checked) this.aftBlur();
  }

  btn_mouseenter() {
    render_element({
      background: 'black',
      color: 'white',
    }, this.btn);
  }

  btn_mouseleave() {
    render_element({
      background: 'white',
      color: 'black',
    }, this.btn);
  }

  btn_click() {
    if (this.host.autofill_checkbox.checked) this.preFocus();
    var res = once(this.search_engine.sort());
    /*
    res.length: how many results are there
    this.free: how many at maximum indicates rectangle
    */
    var free = res.length < this.free ? res.length : this.free;
    var rect = this.rect();
    this.sub_wrapper.innerHTML = '';
    this.sub_wrapper.style.height = (rect.height * this.free).toString() + 'px';
    this.subs = Array.from({
      length: free === 0 ? 0 : free + 3
    }, ii => {
      let div = document.createElement('div');
      render_element(Object.assign(this.sub_styles, {
        width: '100%',
        height: rect.height.toString() + 'px',
        cursor: 'pointer',
        borderBottom: '0.2px solid',
        background: 'lightgray',
      }), div);
      div.addEventListener('mouseenter', function() {
        this.sub_mouseenter(div);
      }.bind(this));
      div.addEventListener('mouseleave', function() {
        this.sub_mouseleave(div);
      }.bind(this));
      /* event bubbling priority: mousedown then blur then click */
      div.addEventListener('mousedown', function() {
        this.sub_click(div);
      }.bind(this));
      this.sub_wrapper.appendChild(div);
      return div;
    });
    this.show_subs();

    for (let ii = 0; ii < free; ii++) {
      this.subs[ii].innerHTML = res[ii];
    }
  }

  get value() {
    return this.is_array ? this.el.value : this.ocean[this.el.value];
  }

  sub_mouseenter(div) {
    render_element({
      background: 'lightblue',
      color: 'darkorchid',
    }, div);
  }

  sub_mouseleave(div) {
    render_element({
      background: 'lightgray',
      color: 'black',
    }, div);
  }

  sub_click(div) {
    this.el.value = div.innerHTML;
    this.hide_subs();
  }

  config(ocean) {
    if (ocean === this.search_engine.ocean) return;
    if (Array.isArray(ocean)) {
      this.is_array = true;
      this.search_engine.config(ocean);
      this.ocean_length = ocean.length;
    } else {
      this.is_array = false;
      var kks = Object.keys(ocean);
      this.search_engine.config(kks);
      this.ocean_length = kks.length;
    }
    this.ocean = ocean;
    var rect = this.rect();
  }
}


// header

class Depandable {
  constructor(
    els, // array of elements
    evt, // event in string
    activate, // active function
    dismiss, // inactive function
    el, // default to which element
  ) {
    this.els = els;
    this.evt = evt;
    this.activate = activate;
    this.dismiss = dismiss;
    this.el = el;

    this.activate(this.el);

    this.els.forEach(ele => {
      ele.addEventListener(evt, function() {
        this.els.forEach(el2 => {
          this.dismiss(el2);
        });
        this.activate(ele);
      }.bind(this));
    });
  }
}


// label normal widget
class LabelNormal {
  constructor(
    parent_el,
    content,
    fontSize,
    width,
    height,
    borderRadius,
    marginRight,
    color,
    colorHover,
    bg,
    bgHover,
  ) {
    this.parent_el = parent_el;
    this.color = color;
    this.bg = bg;
    this.colorHover = colorHover;
    this.bgHover = bgHover;

    this.el = document.createElement('div');
    render_element({
      width: width,
      height: height,
      fontSize: fontSize,
      borderRadius: borderRadius,
      marginRight: marginRight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'default',
      textTransform: 'uppercase',
    }, this.el);

    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);

    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);

    this.mouseleave();
    this.el.innerHTML = content;
    this.parent_el.appendChild(this.el);
  }

  mouseenter() {
    render_element({
      color: this.colorHover,
      background: this.bgHover,
    }, this.el);
  }

  mouseleave() {
    render_element({
      color: this.color,
      background: this.bg,
    }, this.el);
  }
}


class SideButton {
  constructor(
    width,
    height,
    fontSize,
    itag,
    content,
    r,
    g,
    b,
    fontColor,
    hoverFontColor,
    callback,

  ) {
    this.width = width;
    this.height = height;
    this.fontSize = fontSize;
    this.itag = itag;
    this.content = content;
    this.rgba = new RGBA(r, g, b);
    this.fc = fontColor;
    this.hfc = hoverFontColor;
    this.callback = callback;

    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);

    this.el = document.createElement('div');
    render_element({
      width: this.width.toString() + 'px',
      height: this.height.toString() + 'px',
      display: 'flex',
      flexDirection: 'row',
      borderRadius: '20px',
      boxShadow: '4px 8px 0px ' + this.rgba.rgba(0.4, -50),
      transition: 'all 200ms ease-in',
      cursor: 'pointer',
      color: this.fc,
    }, this.el);

    this.el_left = document.createElement('div');
    render_element({
      width: (this.width - this.height).toString() + 'px',
      height: this.height.toString() + 'px',
      fontSize: this.fontSize,
      display: 'flex',
      justifyContent: 'center',
      borderRadius: '20px 0 0 20px',
      alignItems: 'center',
      background: this.rgba.rgba(0.8, 0),
    }, this.el_left);
    this.el_left.innerHTML = this.content;
    this.el.appendChild(this.el_left);

    this.el_right = document.createElement('div');
    render_element({
      width: this.height.toString() + 'px',
      height: this.height.toString() + 'px',
      background: this.rgba.rgba(0.4, 20),
      fontSize: this.fontSize,
      display: 'flex',
      borderRadius: '0 20px 20px 0',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.el_right);
    this.el_right.innerHTML = this.itag;
    this.el.appendChild(this.el_right);

    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);
    this.el.addEventListener('click', this.callback);
  }

  mouseenter() {
    render_element({
      transform: 'translate(4px, 8px)',
      boxShadow: 'none',
      color: this.hfc,
    }, this.el)
  }

  mouseleave() {
    render_element({
      transform: 'none',
      boxShadow: '4px 8px 0px ' + this.rgba.rgba(0.4, -50),
      color: this.fc,
    }, this.el)
  }

  becomeChildOf(parent_el) {
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  }
}


class CheckboxNormal {
  constructor(
    content,
    width_px,
    height_px,
    fontSize,
    borderRadius,
    color,
    bg,
    shadowColor,
    checked = false,
  ) {
    this.content = content;
    this.width_px = width_px;
    this.height_px = height_px;
    this.fontSize = fontSize;
    this.borderRadius = borderRadius;
    this.color = color;
    this.bg = bg;
    this.shadowColor = shadowColor;
    this.checked = checked;

    this.el = document.createElement('div');
    render_element({
      width: this.width_px.toString() + 'px',
      height: this.height_px.toString() + 'px',
      background: this.bg,
      borderRadius: this.borderRadius,
      transition: 'all 200ms ease-in',
      display: 'flex',
      flexDirection: 'row',
      boxShadow: '4px 8px 0px ' + this.shadowColor,
      cursor: 'default',
    }, this.el);

    this.label_el = document.createElement('div');
    render_element({
      width: (this.width_px - this.height_px).toString() + 'px',
      height: this.height_px.toString() + 'px',
      fontSize: this.fontSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.label_el);
    this.label_el.innerHTML = content;
    this.el.appendChild(this.label_el);

    this.box_el = document.createElement('div');
    render_element({
      width: this.height_px.toString() + 'px',
      height: this.height_px.toString() + 'px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: (this.height_px * 0.9).toString() + 'px',
    }, this.box_el);
    this.box_el.innerHTML = '<i class="fas fa-check-circle"></i>';
    this.el.appendChild(this.box_el);

    this.svg_el = this.box_el.querySelector('i');
    this.svg_el.style.cursor = 'pointer';
    this.svgmouseenter = this.svgmouseenter.bind(this);
    this.svgmouseleave = this.svgmouseleave.bind(this);
    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.click = this.click.bind(this);
    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);
    this.svg_el.addEventListener('mouseenter', this.svgmouseenter);
    this.svg_el.addEventListener('mouseleave', this.svgmouseleave);
    this.svg_el.addEventListener('click', this.click);

    this.becomeChildOf = this.becomeChildOf.bind(this);

    if(this.checked){
      this.svg_el.style.color = this.color;
      this.label_el.style.color = this.color;
    }
  }

  svgmouseenter() {
    if (this.checked) return;
    this.svg_el.style.color = this.color;
  }

  svgmouseleave() {
    if (this.checked) return;
    this.svg_el.style.color = 'black';
  }

  mouseenter() {
    render_element({
      transform: 'translate(4px, 8px)',
      boxShadow: 'none',
    }, this.el)
  }

  mouseleave() {
    render_element({
      transform: 'none',
      boxShadow: '4px 8px 0px ' + this.shadowColor,
    }, this.el)
  }

  click() {
    this.checked = !this.checked;
    if (this.checked) {
      this.svg_el.style.color = this.color;
      this.label_el.style.color = this.color;
    } else {
      this.svg_el.style.color = 'black';
      this.label_el.style.color = 'black';
    }
  }

  becomeChildOf(parent_el) {
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  }
}


class FrameVisual {
  constructor() {
    this.el = document.createElement('div');
    this.shown = false;
    render_element({
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      transition: 'opacity 500ms ease-in',
    }, this.el);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.el.style.display = 'none';
    this.el.style.opacity = '0';
  }

  show() {
    if (this.shown) return;
    this.el.style.display = 'flex';
    setTimeout(() => {
      this.el.style.opacity = '1';
      this.el.style.zIndex = '10';
    }, 0)
    this.shown = true;
  }

  hide() {
    if (!this.shown) return;
    this.el.style.opacity = '0';
    this.shown = false;
    setTimeout(() => {
      this.el.style.display = 'none';
      this.el.style.zIndex = '0';
    }, 400);
  }

  appendChild(el) {
    this.el.appendChild(el);
  }

  becomeChildOf(parent_el) {
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  }
}


// panel main 
class PanelMain {
  // applied Config, init after fetch
  constructor(
    // percentage
    width,
    height,
    header_width,
  ) {
    this.width = width;
    this.height = height;
    this.header_width = header_width;

    this.el = document.createElement('div');
    render_element({
      position: 'fixed',
      zIndex: '10000',
      left: (50 - this.width / 2).toString() + 'vw',
      top: (50 - this.height / 2).toString() + 'vh',
      width: this.width.toString() + 'vw',
      height: this.height.toString() + 'vh',
      transition: 'opacity 500ms ease-out',
    }, this.el);
    this.header_el = document.createElement('div');
    render_element({
      width: '100%',
      height: this.header_width.toString() + '%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
    }, this.header_el);
    this.header_dismiss_btn = document.createElement('div');
    this.header_dismiss_btn.setAttribute('class', 'panel-dismiss');
    this.header_el.appendChild(this.header_dismiss_btn);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.header_dismiss_btn.addEventListener('click', this.hide);

    this.el.appendChild(this.header_el);

    this.main_el = document.createElement('div');
    render_element({
      width: '100%',
      height: (100 - this.header_width).toString() + '%',
    }, this.main_el);
    this.el.appendChild(this.main_el);

    document.body.appendChild(this.el);

    [
      this.headerInfo,
      // this.headerHomework,
      this.headerEdit,
      // this.headerComment,
    ] = [
      PanelMain.newHeader(this.header_el, 'Info', 'Red'),
      // PanelMain.newHeader(this.header_el, 'Homework', 'blue'),
      PanelMain.newHeader(this.header_el, 'Edit', 'green'),
      // PanelMain.newHeader(this.header_el, 'Comment', 'orange'),
    ];

    new Depandable(
      [this.headerInfo, this.headerEdit], // els
      'click', // evt
      function(el) {
        render_element({
          textDecoration: 'underline',
          fontWeight: 'bold',
        }, el);
      }, // activate
      function(el) {
        render_element({
          textDecoration: 'none',
          fontWeight: 'normal',
        }, el);
      }, // dismiss 
      this.headerInfo // el
    )

    /*
    frame functions are set-up functions,
    which should be called only once in contsructor
    */
    this.__info_frame();
    this.__edit_frame();
    // this.el.style.display = 'none';
    // this.hide();
    // this.info_view();

    this.info_view = this.info_view.bind(this);
    this.edit_view = this.edit_view.bind(this);

    this.headerInfo.addEventListener('click', this.info_view);
    this.headerEdit.addEventListener('click', this.edit_view);

    this.config = this.config.bind(this);

    this.visible = false;
    this.el.style.display = 'none';
    this.hide();
  }

  // pnconfig
  config(
    subject, 
    period,
    name,
    course,
    teacher,
    zoomlink,
  ) {
    this.subject = subject;
    this.period = period;
    this.name = name;
    this.course = course;
    this.teacher = teacher;
    this.zoomlink = new ZoomLink(zoomlink);
    this.courselink = new CourseLink(
      new Config().id[this.name],
      'id',
    );

    if (this.visible) {
      switch (this.view) {
        case 'info':
          this.view = 'config';
          this.info_view();
          break;

        case 'edit':
          this.view = 'config';
          this.edit_view();
          break;
      }
    }
  }

  hide() {
    this.visible = false;
    this.el.style.opacity = '0';
    setTimeout(() => {
      render_element({
        left: '100vw',
        top: '100vh',
        display: 'none',
      }, this.el);
    }, 400);
  }

  show() {
    this.visible = true;
    render_element({
      left: '25vw',
      top: '25vh',
      display: 'block',
    }, this.el);
    setTimeout(() => {
      this.el.style.opacity = '1';
    }, 0);
    if (this.view === 'info') {
      this.timebar.hide();
      setTimeout(() => {
        this.timebar.show();
      }, 500);
    }
  }

  static newHeader(
    parent_el,
    text,
    color,
  ) {
    var header = document.createElement('div');
    render_element({
      height: '100%',
      background: color,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '5% 50% 0 0',
      color: 'white',
      fontSize: '1.5em',
      padding: '0 15px 0 15px',
      cursor: 'pointer',
    }, header);
    header.innerHTML = text;

    header.addEventListener('mouseenter', function() {
      render_element({
        opacity: '0.8',
      }, header);
    });
    header.addEventListener('mouseleave', function() {
      render_element({
        opacity: '1',
      }, header);
    });
    parent_el.appendChild(header);
    return header;
  }

  // info
  __info_frame() {
    this.info_el = document.createElement('div');
    this.main_el.appendChild(this.info_el);
    render_element({
      width: '100%',
      height: '100%',
      overflow: 'auto',
    }, this.info_el);
    this.info_header = document.createElement('div');
    render_element({
      width: '100%',
      height: '80px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid',
    }, this.info_header);
    this.info_el.appendChild(this.info_header);

    this.info_name = document.createElement('div');
    render_element({
      fontFamily: 'Arial',
      fontStyle: 'italic',
      textDecoration: 'underline',
      fontSize: '1.5em',
      marginLeft: '20px',
    }, this.info_name);
    this.info_header.appendChild(this.info_name)

    this.info_course = document.createElement('div');
    render_element({
      fontSize: '1.2em',
    }, this.info_course);
    this.info_header.appendChild(this.info_course);

    this.info_btn_sec = document.createElement('div');
    this.info_btn_sec.setAttribute('id', 'info-btn-sec');
    render_element({
      width: '100%',
      height: 'calc(100% - 130px)',
    }, this.info_btn_sec);
    this.info_el.appendChild(this.info_btn_sec);

    [
      this.info_btn_course,
      this.info_btn_zoom,
      this.info_btn_calendar,
    ] = ['course', 'zoom', 'calendar'].map((str, ii) => {
      var a_el = document.createElement('a');
      this.info_btn_sec.appendChild(a_el);
      a_el.setAttribute('id', 'info-btn-' + str);
      a_el.setAttribute('class', 'square-button');
      a_el.setAttribute('href', '#');
      a_el.setAttribute('title', str);
      render_element({
        padding: '15px 40px',
        border: '3px solid #000',
      }, a_el);
      a_el.innerHTML = str;
      var rect = a_el.getBoundingClientRect();
      var editidth = rit(rect.width) / 2;
      var hheight = rit(rect.height / 2);
      render_element({
        left: `calc(50% - ${editidth}px)`,
        top: `calc(${ii * 33}% + 5px)`,
        padding: '0',
        border: '0',
      }, a_el);
      a_el.innerHTML = '';
      return proxy(a_el);
    });

    this.info_btn_zoom.oneEventListener('click', function() {
      window.open(this.zoomlink.url);
    }.bind(this));

    this.info_btn_course.oneEventListener('click', function() {
      window.open(this.courselink.course);
    }.bind(this));

    this.info_btn_calendar.oneEventListener('click', function() {
      window.open(this.courselink.calendar);
    }.bind(this));

    this.info_time_sec = document.createElement('div');
    render_element({
      width: '100%',
      height: '40px',
    }, this.info_time_sec);
    this.info_el.appendChild(this.info_time_sec);

    this.timebar = new TimeBar(
      this.info_time_sec, // parent el
      new Period(new Clock('11:00'), new Clock('12:00')), // period
      1.2, // fontSize
    );

    this.main_el.innerHTML = '';
  }

  static info_sec(
    parent_el,
    child_el,
    width,
    height,
  ) {
    var sec = document.createElement('section');
    sec.appendChild(child_el);
    parent_el.appendChild(sec);
    render_element({
      width: width,
      height: height,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid',
    }, sec);
    return sec;
  }

  info_view(){
    if (this.view === 'info') return;
    this.view = 'info';
    this.main_el.innerHTML = '';
    this.info_name.innerHTML = this.name;
    this.info_course.innerHTML = this.course + '&nbsp;&nbsp;';
    this.main_el.appendChild(this.info_el);
    this.timebar.config(this.period);

    // background image
    var bg_name = new Config().course[this.name];
    if(bg_name == null || bg_name.img == null){
      this.bg_url = 'img/learn.jpg';
    }else{
      this.bg_url = 'img/' + bg_name.img;
    }
    if(this.img_el){
      this.info_btn_sec.removeChild(this.img_el);
    }
    this.img_el = document.createElement('img');
    this.img_el.setAttribute('src', this.bg_url);
    render_element({
      position: 'absolute',
      width: '100%',
      height: 'calc(' + (100 - this.header_width).toString() + '% - 130px)',
      opacity: '0.5',
      zIndex: '-100',
    }, this.img_el);
    this.info_btn_sec.appendChild(this.img_el);

    // color
    var rgb = new Config().theme.course[this.name];
    if(rgb == null){
      this.rgba = new RGBA(128, 128, 128);
    }else{
      this.rgba = new RGBA(rgb.r, rgb.g, rgb.b);
    }
    render_element({
      background: this.rgba.rgb(200),
      boxShadow: '10px 16px 8px ' + this.rgba.rgb(),
    }, this.el);

    // btn 
    this.info_btn_zoom.oneEventListener('click', function() {
      window.open(this.zoomlink.url);
    }.bind(this));

    this.info_btn_course.oneEventListener('click', function() {
      window.open(this.courselink.course);
    }.bind(this));

    this.info_btn_calendar.oneEventListener('click', function() {
      window.open(this.courselink.calendar);
    }.bind(this));

    setTimeout(() => {
      this.timebar.show();
    }, 250);
  }

  // edit
  __edit_frame() {
    this.edit_el = document.createElement('div');
    this.main_el.appendChild(this.edit_el);
    render_element({
      width: '100%',
      height: '100%',
      overflow: 'auto',
    }, this.edit_el);

    this.edit_btn_sec = document.createElement('div');
    render_element({
      width: '100%',
      height: '60px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      border: '1px solid',
    }, this.edit_btn_sec);
    this.edit_el.appendChild(this.edit_btn_sec);

    var btn_config = {
      width: 100,
      height: 30,
      fontSize: '1.2em',
      color: 'white',
      hovercolor: 'lightgray',
    };

    this.edit_save_btn = new SideButton(
      btn_config.width,
      btn_config.height,
      btn_config.fontSize,
      '<i class="far fa-save"></i>', // itag
      'Save',
      110, // r
      120, // g
      190, // b
      btn_config.color,
      btn_config.hovercolor,
      function() {
        // save
        this.name = this.input_course_el.value;
        this.teacher = this.input_teacher_el.value;
        this.period = parsedToPeriod(this.input_period_el.value);
        this.zoomid = this.input_zoomId_el.value;
        this.zoomlink_autofill();
        this.subject.config(
          this.period,
          this.name,
          this.course,
          this.teacher,
          this.zoomlink,
        );
      }.bind(this),
    );

    this.edit_delete_btn = new SideButton(
      btn_config.width,
      btn_config.height,
      btn_config.fontSize,
      '<i class="fas fa-trash"></i>', // itag
      'Delete',
      225, // r
      90, // g
      150, // b
      btn_config.color,
      btn_config.hovercolor,
      function(){
        // delete
      }.bind(this),
    );

    this.edit_clear_btn = new SideButton(
      btn_config.width,
      btn_config.height,
      btn_config.fontSize,
      '<i class="fas fa-hand-sparkles"></i>', // itag
      'Clear',
      40, // r
      185, // g
      40, // b
      btn_config.color,
      btn_config.hovercolor,
      function(){
        // clear
        this.input_course_el.value = "";
        this.input_teacher_el.value = "";
        this.input_period_el.value = "";
        this.input_zoomId_el.value = "";
        this.input_zoomLink_el.value = "";
        this.input_courseId_el.value = "";
        this.input_courseLink_el.value = "";
        this.input_calendarLink_el.value = "";
      }.bind(this),
    );

    this.edit_save_btn.becomeChildOf(this.edit_btn_sec);
    this.edit_delete_btn.becomeChildOf(this.edit_btn_sec);
    this.edit_clear_btn.becomeChildOf(this.edit_btn_sec);

    // checkbox
    this.autofill_checkbox = new CheckboxNormal(
      'autofill',
      100,
      30,
      '1.2em',
      '20px',
      'red',
      'lightgray',
      'darkgray',
      true,
    );

    this.autofill_checkbox.becomeChildOf(this.edit_btn_sec);

    // input course
    this.input_course = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_course);
    this.edit_el.appendChild(this.input_course);

    this.input_course_label = new LabelNormal(
      this.input_course, // parent_el
      'course',
      '1.2em', // fontSize
      '100px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#618685', // color
      '#fefbd8', // hovercolor
      '#d5f4e6', // bg
      '#80ced6', // hoverbg
    );

    this.input_course_el = new InputSearch(
      this,
      this.input_course,
      220,
      '1.2em', {
        border: '1px solid',
      },
      Object.keys(new Config().course), {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
    );

    // input teacher
    this.input_teacher = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_teacher);
    this.edit_el.appendChild(this.input_teacher);

    this.input_teacher_label = new LabelNormal(
      this.input_teacher, // parent_el
      'teacher',
      '1.2em', // fontSize
      '120px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#f4e1d2', // color
      '#b2b2b2', // hovercolor
      '#f18973', // bg
      '#f7cac9', // hoverbg
    );

    this.input_teacher_el = new InputSearch(
      this,
      this.input_teacher,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function() {
        var di = new Config().course[this.input_course_el.value];
        if (di == null) return;
        this.input_teacher_el.config(di.teachers.split(','));
      }.bind(this),
    );

    // input period
    this.input_period = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_period);
    this.edit_el.appendChild(this.input_period);

    this.input_period_label = new LabelNormal(
      this.input_period, // parent_el
      'period',
      '1.2em', // fontSize
      '100px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#e3eaa7', // color
      '#c1946a', // hovercolor
      '#86af49', // bg
      '#b5e7a0', // hoverbg
    );

    this.input_period_el = new InputSearch(
      this,
      this.input_period,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function() {
        var arr = Agenda.filterByName(new Config().agenda.arr, this.input_course_el.value);
        if (arr.length === 0) {
          arr = new Config().timeline;
        } else {
          arr = arr.map(ar => ar.period);
        }
        this.input_period_el.config(Period.sort(arr).map(ar => ar.parse()));
      }.bind(this),
    );

    // input zoom id
    this.input_zoomId = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_zoomId);
    this.edit_el.appendChild(this.input_zoomId);

    this.input_zoomId_label = new LabelNormal(
      this.input_zoomId, // parent_el
      'zoom id',
      '1.2em', // fontSize
      '150px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#EFEFEF', // color
      '#37371F', // hovercolor
      '#EA9010', // bg
      '#EAEFBD', // hoverbg
    );

    this.zoomlink_autofill = this.zoomlink_autofill.bind(this);
    this.zoomid_autofill = this.zoomid_autofill.bind(this);

    this.input_zoomId_el = new InputSearch(
      this,
      this.input_zoomId,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function() {
        var arr = new Config().agenda.arr.concat();
        var course = validateInput(this.input_course_el);
        var period = validateInput(this.input_period_el);
        if (course) {
          arr = Agenda.filterByName(arr, course);
        }
        if (period) {
          arr = Agenda.filterByPeriod(arr, parsedToPeriod(period));
        }
        this.input_zoomId_el.config(new Config().zoomlink);
        this.zoomid_autofill();
      }.bind(this),
      this.zoomlink_autofill,
    );

    // input zoom link
    this.input_zoomLink = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_zoomLink);
    this.edit_el.appendChild(this.input_zoomLink);

    this.input_zoomLink_label = new LabelNormal(
      this.input_zoomLink, // parent_el
      'zoom link',
      '1.2em', // fontSize
      '150px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#0D2818', // color
      '#fff', // hovercolor
      '#16DB65', // bg
      '#058C42', // hoverbg
    );

    this.input_zoomLink_el = new InputSearch(
      this,
      this.input_zoomLink,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      this.zoomlink_autofill,
      this.zoomid_autofill,
    );

    this.courseid_blur = this.courseid_blur.bind(this);
    this.courselink_blur = this.courselink_blur.bind(this);
    this.calendarlink_blur = this.calendarlink_blur.bind(this);
    this.render_courselink = this.render_courselink.bind(this);

    // input course id
    this.input_courseId = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_courseId);
    this.edit_el.appendChild(this.input_courseId);

    this.input_courseId_label = new LabelNormal(
      this.input_courseId, // parent_el
      'course id',
      '1.2em', // fontSize
      '150px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#fff', // color
      '#eee', // hovercolor
      '#6666ff', // bg
      '#6699ff', // hoverbg
    );

    this.input_courseId_el = new InputSearch(
      this,
      this.input_courseId,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      () => {},
      this.courseid_blur,
    );

    // input course link
    this.input_courseLink = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_courseLink);
    this.edit_el.appendChild(this.input_courseLink);

    this.input_courseLink_label = new LabelNormal(
      this.input_courseLink, // parent_el
      'course link',
      '1.2em', // fontSize
      '150px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#ABE2BA', // color
      '#eee', // hovercolor
      '#e74c3c', // bg
      '#a41909', // hoverbg
    );

    this.input_courseLink_el = new InputSearch(
      this,
      this.input_courseLink,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      () => {},
      this.courselink_blur,
    );

    // input calendar link
    this.input_calendarLink = document.createElement('div');
    render_element({
      width: '100%',
      height: '25%',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.input_calendarLink);
    this.edit_el.appendChild(this.input_calendarLink);

    this.input_courseLink_label = new LabelNormal(
      this.input_calendarLink, // parent_el
      'calendar link',
      '1.2em', // fontSize
      '180px', // width
      '40px', // height
      '0', // borderRadius
      '20px', // marginRight
      '#fff', // color
      '#eee', // hovercolor
      '#ffcc00', // bg
      '#806600', // hoverbg
    );

    this.input_calendarLink_el = new InputSearch(
      this,
      this.input_calendarLink,
      220,
      '1.2em', {
        border: '1px solid',
      },
      [], {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      () => {},
      this.calendarlink_blur,
    );

    this.main_el.innerHTML = '';
  }

  zoomlink_autofill() {
    var id = this.input_zoomId_el.el.value;
    if (id != null && id.trim().length > 1) {
      id = id.trim();
      var zoomlink = new Config().zoomlink[id];
      if (zoomlink == null) {
        zoomlink = "https://studygroup.zoom.us/j/" + id;
      }
      this.input_zoomLink_el.value = zoomlink;
      this.zoomlink = new ZoomLink(zoomlink);
    }
  }

  zoomid_autofill() {
    var link = this.input_zoomLink_el.el.value;
    if (link != null && link.trim().length > 1) {
      link = link.trim();
      try {
        this.zoomlink = new ZoomLink(link);
        this.input_zoomId_el.value = this.zoomlink.id;
      } catch (e) {
        return
      }
    }
  }

  courseid_blur() {
    this.courselink = new CourseLink(this.input_courseId_el.value, 'id');
    this.render_courselink();
  }

  courselink_blur() {
    this.courselink = new CourseLink(this.input_courseLink_el.value, 'course');
    this.render_courselink();
  }

  calendarlink_blur() {
    this.courselink = new CourseLink(this.input_calendarLink_el.value, 'calendar');
    this.render_courselink();
  }

  render_courselink() {
    if (!this.courselink.is_null()) {
      this.input_courseId_el.value = this.courselink.id;
      this.input_courseLink_el.value = this.courselink.course;
      this.input_calendarLink_el.value = this.courselink.calendar;
    }
  }

  edit_view() {
    if (this.view === 'edit') return;
    this.view = 'edit';
    this.main_el.innerHTML = '';
    this.input_course_el.value = this.name;
    this.input_teacher_el.value = this.teacher;
    this.input_period_el.value = this.period.parse();

    if(!this.zoomlink.is_null()){
      this.input_zoomId_el.value = this.zoomlink.id;
      this.zoomlink_autofill();
    }

    this.render_courselink();

    this.main_el.appendChild(this.edit_el);
  }
}


class Workday {
  constructor(
    host,
    day,
    sec_els,
    course_objs,
  ) {
    this.host = host;
    this.day = day;
    this.parent_el = proxy(this.host.host.main_el);
    this.sec_els = sec_els;
    this.course_objs = course_objs;

    this.subjects = this.course_objs.map(obj => new Subject(
      this,
      new Config().course[obj.name].img,
      obj.start,
      obj.finish,
      obj.name,
      obj.course,
      obj.teacher,
      new Config().theme.course[obj.name].r,
      new Config().theme.course[obj.name].g,
      new Config().theme.course[obj.name].b,
    ));
    this.subjects.forEach((sub, ii) => {
      sub.becomeChildOf(this.sec_els[ii]);
      sub.setSecIndex(ii);
    });

    this.sortSubjectBySecIndex = this.sortSubjectBySecIndex.bind(this);
    this.switchCard = this.switchCard.bind(this);

    this.secDragOver = this.secDragOver.bind(this);
    this.secDrop = this.secDrop.bind(this);
    this.setDragStart = this.setDragStart.bind(this);
    this.getSubjectBySec = this.getSubjectBySec.bind(this);
    this.moveCard = this.moveCard.bind(this);

    this.sec_els.forEach((el, ind) => {
      el.oneEventListener('dragover', this.secDragOver);
      el.oneEventListener('drop', function(e) {
        this.secDrop(e, ind)
      }.bind(this));
    });
  }

  sortSubjectBySecIndex() {
    this.subjects.sort((s1, s2) => s1.sec_index > s2.sec_index);
  }

  switchCard(ind1, ind2) {
    // horizontal change
    this.sortSubjectBySecIndex();
    this.subjects[ind1].switchChildBetween(this.subjects[ind2]);
    this.subjects[ind1].setSecIndex(ind2);
    this.subjects[ind2].setSecIndex(ind1);
  }

  setDragStart(sec_el_ind, e, subject) {
    this.start_sec_ind = sec_el_ind;
    this.start_pos = {
      x: e.clientX,
      y: e.clientY
    };
    this.active_subject = subject;
  }

  secDragOver(e) {
    e.preventDefault();
    this.host.host.hruler_mousemove(e);
    this.host.host.vruler_mousemove(e);
    this.host.host.stripe_mousemove(e);
  }

  getSubjectBySec(sec_el) {
    return this.subjects.filter(sb => sb.parent_el === sec_el)[0];
  }

  moveCard(e, ind) {
    // return a new period
    var rect_ind = this.host.host.stripe_mousedrop(e);
    if (rect_ind == null) return;
    var np = new Config().timeline[rect_ind];
    this.active_subject.moveCard(np);
    return np;
  }

  secDrop(e, ind) {
    e.preventDefault();
    /* 
    position: this.start_pos -> e
    col: this.start_sec_ind -> ind
    target: this.active_subject
    */
    var x1 = this.start_pos.x;
    var x2 = e.clientX;
    var i1 = this.start_sec_ind;
    var i2 = ind;
    var dragged_subject = this.active_subject;
    var passive_subject = this.getSubjectBySec(this.sec_els[i2]);
    if (i1 !== i2) {
      // the perform horizontal move of dragged_subject
      var np = this.moveCard(e, i1);
      if (np != null) {
        Backend.courseHorizontalMove(this.day, i1, np);

        this.switchCard(i1, i2);
        Backend.courseVerticalSwitch(this.day, i1, i2);
      }
    } else {
      // change this only
      var np = this.moveCard(e, ind);
      if (np != null) {
        Backend.courseHorizontalMove(this.day, ind, np);
      }
    }

    // dismiss ruler and stripes
    this.host.host.hruler_finish();
    this.host.host.vruler_finish();
    this.host.host.hideStripe();
  }
}

class Workweek {
  static dayToInt(day) {
    return day <= 5 && day >= 0 ? {
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5
    } [day] : 1;
  }

  static intToDay(integer) {
    return integer <= 4 && integer >= 0 ? ['mon', 'tue', 'wed', 'thu', 'fri'][integer] : 'mon';
  }

  constructor(
    host, // Manage instance
    container,
    sec_els,
    tags,
  ) {
    this.host = host;
    this.container = container;
    this.sec_els = sec_els;
    this.tags = tags;
    this.dayInt = new Date().getDay() - 1;
    this.at = this.dayInt;
    this.dayInt = this.dayInt <= 4 ? this.dayInt : 1;
    this.workday = new Workday(
      this,
      Workweek.intToDay(this.at),
      this.sec_els,
      new Config().calendar[Workweek.intToDay(this.at)],
    );

    this.loadDay = this.loadDay.bind(this);
    this.tags.forEach((el, ii) => {
      el.addEventListener('click', function() {
        this.loadDay(ii);
      }.bind(this));
    });
  }

  loadDay(dayInt) {
    if (this.at === dayInt) return;
    this.sec_els.forEach(el => {
      el.innerHTML = '';
    });
    this.at = dayInt;
    this.workday = new Workday(
      this,
      Workweek.intToDay(this.at),
      this.sec_els,
      new Config().calendar[Workweek.intToDay(this.at)],
    );
  }
}


class Menu {
  /* tb-footer 
  static view
  	edit 
  	homework
  edit view
  	add course
  	copy all to another day
  focus view
  	timeline 
  	remove
  */
  constructor(
    parent_el,
  ) {
    this.parent_el = parent_el;
    this.frame_static = new FrameVisual();
    this.frame_edit = new FrameVisual();
    this.frame_focus = new FrameVisual();
    this.frame_static.becomeChildOf(this.parent_el);
    this.frame_edit.becomeChildOf(this.parent_el);
    this.frame_focus.becomeChildOf(this.parent_el);

    this.btn_assignment = new SideButton(
      250, // width 
      50, // height
      '2em', // fontSize
      '<i class="far fa-edit"></i>', // itag
      'Assignment',
      120, // r
      130, // g
      0, // b
      'white',
      'lightgray',
      () => {
        console.log('assignment btn clicked')
      },
    );
    this.btn_homework = new SideButton(
      250, // width 
      50, // height
      '2em', // fontSize
      '<i class="fas fa-tasks"></i>', // itag
      'Homework',
      0, // r
      130, // g
      210, // b
      'white',
      'lightgray',
      () => {
        console.log('homework btn clicked')
      },
    );
    this.btn_exam = new SideButton(
      250, // width 
      50, // height
      '2em', // fontSize
      '<i class="fas fa-user-graduate"></i>', // itag
      'Exam',
      130, // r
      0, // g
      210, // b
      'white',
      'lightgray',
      () => {
        console.log('exam btn clicked')
      },
    );
    this.frame_static.appendChild(this.btn_assignment.el);
    this.frame_static.appendChild(this.btn_homework.el);
    this.frame_static.appendChild(this.btn_exam.el);
    this.view_static = this.view_static.bind(this);
  }

  view_static() {
    // edit
    // homework
    setTimeout(() => {
      this.frame_static.show();
    }, 500);
  }
}


// menu
const menu = new Menu(
  document.querySelector('#menu'),
);

setTimeout(() => {
  menu.view_static()  // edit homework
}, 2500)
// setTimeout(()=>{menu.view_static()}, 2500)
// setTimeout(()=>{menu.view_focus()}, 2500)



// grid manage
var manage;
// panel main
var panelmain;

superior.addAfter(() => {
  manage = new Manage(
    document.querySelector('.timetable-wrapper'),
    50,
    new Config().period.segment(),
    Array.from({
      length: new Config().sec
    }, (dd, ii) => ii + 1),
  );
  manage.startTimer(sydTime);
  document.querySelector('.timetable-wrapper').style.opacity = '1';

  panelmain = new PanelMain(
    50, // width
    50, // height
    10, // panel height
  );
  manage.workweek.workday.subjects.forEach(sub=>{
    sub.enable_click();
  });
}, 0);


// superior.addAfter(() => {
//   console.log('then');
  // panelmain.config(
  //   new Period(new Clock("14:00"), new Clock("15:00")),
  //   "USFP English A",
  //   "21.SEA4/5",
  //   "Freda Pappas",
  //   new ZoomLink("https://studygroup.zoom.us/j/96653377807?pwd=U050aUdvK3lOUWx5MkttMUtIWkJxZz09"),
  // );

//   setTimeout(()=>{
//     panelmain.config(
//       new Period(new Clock("16:00"), new Clock("17:00")),
//       "USFP Mathematics for Science A",
//       "21.MSA9/10",
//       "Colin Baker",
//       new ZoomLink("https://studygroup.zoom.us/j/92673619214?pwd=Rjc4Tm9XbWZwVGJsU0I4Y01PbTBSQT09"),
//     );
//   }, 5000);

  // panelmain.info_view();

  // document.querySelector('#btn1').addEventListener('click', ()=>{
  //   if(!pm.visible){
  //     pm.show();
  //   }else{
  //     pm.hide();
  //   }
  // });
  // document.querySelector('#btn2').addEventListener('click', ()=>{
  //   pm.config(
  //     new Period(new Clock("16:00"), new Clock("17:00")),
  //     "USFP Mathematics for Science A",
  //     "21.MSA9/10",
  //     "Colin Baker",
  //     new ZoomLink("https://studygroup.zoom.us/j/92673619214?pwd=Rjc4Tm9XbWZwVGJsU0I4Y01PbTBSQT09"),
  //   );
  // });
// }, 0);


superior.addBeforeGap(2000);
superior.run();

