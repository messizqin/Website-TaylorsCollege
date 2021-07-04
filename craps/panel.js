/*
start of import
*/

const rit = val => Math.round(val * 100) / 100;

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

class Clock{
  constructor(str){
    if(str instanceof Clock)return str;
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

  concat(){
    return new Clock(this.parse());
  }

  // convert clock h, min to min
  minutes(){
    return this.h * 60 + this.min;
  }

  // pass in a clock, return gap in minute
  gap(clock){
    return Math.abs(this.minutes() - clock.minutes());
  }

  gaplength(clock, h, min, length){
    return this.gap(clock) / (h * 60 + min) * length;
  }

  parse(){
    var h = this.h.toString();
    var min = this.min.toString();
    min = min.length == 1 ? min + '0' : min;
    return h + ':' + min;
  }

  iadd(clock){
    if(typeof clock === 'number'){
      this.iadd(new Clock('0:' + clock.toString()))
    }else{      
      this.shift_min(clock.min);
      this.shift_h(clock.h);
    }
    return this;
  }

  isub(clock){
    if(typeof clock === 'number'){
      this.isub(new Clock('0:' + clock.toString()));
    }else{
      this.shift_min(-clock.min);
      this.shift_h(-clock.h);
    }
    return this;
  }

  add(clock){
    return this.concat().iadd(clock);
  }

  sub(clock){
    return this.concat().isub(clock);
  }

  shift_h(h){
    this.h += h;
    while(this.h >= 24){
      this.h -= 24;
    }
    while(this.h < 0){
      this.h += 24;
    }
  }

  shift_min(min){
    this.min += min;
    while(this.min >= 60){
      this.min -= 60;
      this.h += 1;
      if(this.h >= 24){
        this.h -= 24;
      }
    }
    while(this.min < 0){
      this.min += 60;
      this.h -= 1;
      if(this.h < 0){
        this.h += 24;
      }
    }
  }

  lt(clock){
    // less than
    var tmin = this.minutes();
    var imin = clock.minutes();
    return tmin !== imin && tmin < imin;
  }

  ge(clock){
    // greater than or equal to
    var tmin = this.minutes();
    var imin = clock.minutes();
    return tmin === imin || tmin > imin;
  }

  clean(){
    this.shift_min(0);
    this.shift_h(0);
  }

  eq(clock){
    // equal to
    this.clean();
    clock.clean();
    return this.h === clock.h && this.min === clock.min;
  }

  toMin(){
    this.clean();
    return this.h * 60 + this.min;
  }

  static max(arr){
    var mses = arr.map(cl=>cl.toMin());
    return arr[mses.indexOf(Math.max.apply(Math, mses))]
  }

  static min(arr){
    var mses = arr.map(cl=>cl.toMin());
    return arr[mses.indexOf(Math.min.apply(Math, mses))]
  }
}

class Period{
  // pass in two clock object
  constructor(from_, to_){
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

  concat(){
    return new Period(this.from_.concat(), this.to_.concat());
  }

  gap(){
    return this.from_.gap(this.to_);
  }

  gaplength(h, min, length){
    return this.from_.gaplength(this.to_, h, min, length);
  }

  shift_min(min){
    this.from_.shift_min(min);
    this.to_.shift_min(min);
  }

  parse(){
    return `${this.from_.parse()}~${this.to_.parse()} [${this.gap()}]`;
  }

  lt(period){
    // less than
    return this.from_.lt(period.from_);
  }

  eq(period){
    return this.from_.eq(period.from_) && this.to_.eq(period.to_);
  }

  segment(){
    var sh = this.from_.h;
    var fh = this.to_.min > 0 ? this.to_.h + 1 : this.to_.h;
    return Array.from({length: fh - sh + 1}, (dd, ii)=>sh+ii);
  }

  // pass in a period, return {left, width}
  rectReference(contained){
    var large_gap = this.gap();
    var small_gap = contained.gap();
    var to_gap = new Period(this.from_, contained.from_).gap();
    return {left: rit(to_gap / large_gap * 100), width: rit(small_gap / large_gap * 100)};
  }

  split(){
    return [this.from_, this.to_];
  }

  static sort(periods){
    return periods.sort((p1, p2)=>!p1.lt(p2));
  }
}

class SideButton{
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

  ){
    this.width = width;
    this.height = height;
    this.fontSize = fontSize;
    this.itag = itag;
    this.content = content;
    this.r = r;
    this.g = g;
    this.b = b;
    this.fc = fontColor;
    this.hfc = hoverFontColor;
    this.callback = callback;

    this.ensix = function(val){return val < 0 ? 0 : val > 255 ? 255 : val;}.bind(this);
    this.rgb = function(dif){return `rgb(${this.ensix(this.r + dif)},${this.ensix(this.g + dif)},${this.ensix(this.b + dif)})`}.bind(this);
    this.rgba = function(dif, a){return `rgb(${this.ensix(this.r + dif)},${this.ensix(this.g + dif)},${this.ensix(this.b + dif)},${a})`}.bind(this);
    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);

    this.el = document.createElement('div');
    render_element({
      width: this.width.toString() + 'px',
      height: this.height.toString() + 'px',
      display: 'flex',
      flexDirection: 'row',
      borderRadius: '20px',
      boxShadow: '4px 8px 0px ' + this.rgba(-50, 0.4),
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
      background: this.rgba(0, 0.8),    
    }, this.el_left);
    this.el_left.innerHTML = this.content;
    this.el.appendChild(this.el_left);

    this.el_right = document.createElement('div');
    render_element({
      width: this.height.toString() + 'px',
      height: this.height.toString() + 'px',
      background: this.rgba(20, 0.4),    
      fontSize: this.fontSize,
      display: 'flex',
      borderRadius: '0 20px 20px 0',
      justifyContent: 'center',
      alignItems: 'center',      
    }, this.el_right);
    this.el_right.innerHTML = this.itag;
    this.el.appendChild(this.el_right);

    this.config = this.config.bind(this);

    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);
    this.el.addEventListener('click', this.callback);
  }

  config(click_callback){
    this.el.removeEventListener(this.callback);
    this.callback = click_callback;
    this.el.addEventListener(this.callback);
  }

  mouseenter(){
    render_element({
      transform: 'translate(4px, 8px)',
      boxShadow: 'none',
      color: this.hfc,
    }, this.el)
  }

  mouseleave(){
    render_element({
      transform: 'none',
      boxShadow: '4px 8px 0px ' + this.rgba(-50, 0.4),
      color: this.fc,
    }, this.el)
  }

  becomeChildOf(parent_el){
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  }
}


class Depandable{
  constructor(
    els, // array of elements
    evt, // event in string
    activate, // active function
    dismiss, // inactive function
    el, // default to which element
  ){
    this.els = els;
    this.evt = evt;
    this.activate = activate;
    this.dismiss = dismiss;
    this.el = el;

    this.activate(this.el);

    this.els.forEach(ele=>{
      ele.addEventListener(evt, function(){
        this.els.forEach(el2=>{
          this.dismiss(el2);
        });
        this.activate(ele);
      }.bind(this));
    });
  }
}


class CheckboxNormal{
  constructor(
    content,
    width_px,
    height_px,
    fontSize,
    borderRadius,
    color,
    bg,
    shadowColor,
    checked=false,
  ){
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

  svgmouseenter(){
    if(this.checked)return;
    this.svg_el.style.color = this.color;
  }

  svgmouseleave(){
    if(this.checked)return;
    this.svg_el.style.color = 'black';
  }

  mouseenter(){
    render_element({
      transform: 'translate(4px, 8px)',
      boxShadow: 'none',
    }, this.el)
  }

  mouseleave(){
    render_element({
      transform: 'none',
      boxShadow: '4px 8px 0px ' + this.shadowColor,
    }, this.el)
  }

  click(){
    this.checked = !this.checked;
    if(this.checked){
      this.svg_el.style.color = this.color;
      this.label_el.style.color = this.color;
    }else{
      this.svg_el.style.color = 'black';
      this.label_el.style.color = 'black';
    }  
  }

  becomeChildOf(parent_el){
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  }
}


class Path{
  constructor(path){
    this.arr = path.split('/');
  }

  url(){
    return this.arr.join('/');
  }

  concat(){
    return new Path(this.arr.join('/'));
  }

  backward(n){
    var np = this.concat();
    for(let ii = 0; ii < n; ii++){
      np.arr.pop();
    }
    return np;
  }

  forward(arr_or_str){
    var np = this.concat();
    if(arr_or_str instanceof Array){
      arr_or_str.forEach(st=>{
        np.arr.push(st);
      });
    }else{
      // string
      np.arr.push(arr_or_str);
    }
    return np;
  }
}

class CourseLink{
  constructor(val, prop){
    switch(prop){
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

  is_null(){
    return this.id == null || this.course == null || this.calendar == null;
  }
}

class ZoomLink{
  constructor(url){
    this.url = url;
    this.id = url.split('/').pop().split('?').shift();
  }

  static wrap(zoomlinks){
    /* {id: url} */
    var res = {};
    zoomlinks.forEach(zk=>{
      res[zk.id] = zk.url;
    });
    return res;
  }
}

class Agenda{
  constructor(obj){
    this.obj = obj;
    // this.arr = this.obj[2].map(ar=>ar[1].map(br=>{return {[br[0]]: br[3]}}));
    // console.log(this.arr);

    this.arr = [];
    this.obj[2].forEach(ar=>{
      var cc = {};
      ar[1].forEach(br=>{
        cc[br[0]] = br[3];
      });
      this.arr.push(cc);
    });

    this.__initArr();
  }

  /* only exec once in constructor */
  __initArr(){
    this.removals = [];
    this.arr.forEach((obj, ii) =>{
      try{
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

        for(let jj = 0; jj < ii; jj ++){
          if(obj.desc === this.arr[jj].desc && obj.name === this.arr[jj].name && obj.period.eq(this.arr[jj].period) && this.zoomlink.id === this.arr[jj].zoomlink.id){
            this.removals.push(jj);
            continue;
          }
        }
      }catch(e){
        this.removals.push(ii);
      }
    });
    this.removals.reverse().forEach(ind=>{
      this.arr.splice(ind, 1);
    });
  }

  static filterByPeriod(arr, period){
    return arr.filter(obj=>obj.period.eq(period));
  }

  static filterByName(arr, name){
    return arr.filter(obj=>obj.name === name);
  }
}

class Database{
  constructor(){
    if(Database._instance)return Database._instance;
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
        this.agenda.arr.forEach(obj=>{
          this.course[obj.name] = {
            teachers: [],
          }
        });
        /* timeline
        [7:00, 8:00],
        [9:00, 10:00]
        */
        this.timeline = this.agenda.arr.map(ar=>ar.period).concat();
        /* zoomlink */
        this.zoomlink = ZoomLink.wrap(this.agenda.arr.map(ar=>ar.zoomlink));
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
        Object.values(this.calendar).forEach(ar=>ar.forEach(obj=>{
          sts.push(new Clock(obj.start));
          fhs.push(new Clock(obj.finish));
        }));
        this.period = new Period(Clock.min(sts), Clock.max(fhs));
        // sec el quantity
        this.sec = Math.max.apply(Math, Object.values(this.calendar).map(ar=>ar.length));
        setTimeout(()=>{
          // rectReference for auto grid
          var height = rit(100 / this.sec);
          this.hgrid = this.timeline.map(pd=>this.period.rectReference(pd));
          this.vgrid = Array.from({length: this.sec}, (dd, ii)=>{return {top: ii * height, height: height}});
        }, 500);
      });
    Database._instance = this;
  }
}

class Config extends Database{
  // User Config
  constructor(){
    if(Config._instance)return Config._instance;
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
        setTimeout(()=>{
          for(const [kk, vv] of Object.entries(course)){
            if(this.course[kk]){
              this.course[kk].teachers += vv.teachers;
              this.course[kk].img = vv.img;
            }else{
              this.course[kk] = vv;
            }
          }
          var delkeys = [];
          for(const [kk, vv] of Object.entries(this.course)){
            if(vv.img == null){
              delkeys.push(kk);
            }
          }
          delkeys.forEach(kk=>{
            delete this.course[kk];
          });
        }, 1000);
      });
    fetch(this.json_path.forward("id.json").url())
      .then(res => res.json())
      .then(id => {
        this.id = id;
      });
    Config._instance = this;
  }
}

new Config();
// end of import

function validateInput(input_el){
  // return false if input is none or whitespace
  var val = input_el.value;
  if(val){
    var res = val.trim();
    if(res.length > 1){
      return res;
    }
  }
}

function parsedToPeriod(str){
  // pass in period.parse(), return period
  var s1 = str.split('~');
  var s2 = s1[1].split('[');
  return new Period(new Clock(s1[0]), new Clock(s2[0].trim()));
}

// text rocket effect and time bar
class TextRocket{
  constructor(
    parent_el, // connected
    child_els, // any text wrapper that has not been connected yet
  ){
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
    this.child_els.forEach(el=>{
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

  rect(){
    return this.parent_el.getBoundingClientRect();
  }

  show(){
    this.rocket_wrapper.style.width = '0';
  }

  hide(){
    this.rocket_wrapper.style.transition = 'all 0s ease 0s';
    this.rocket_wrapper.style.width = '100%';
    this.rocket_wrapper.style.transition = 'width 1500ms ease-in-out';
  }
}

class PillBar{
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
  ){
    [this.el, this.left_el, this.right_el] = Array.from({length: 3}, ii=>document.createElement('div'));
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

    this.left_el.addEventListener('mouseenter', ()=>{this.mouseenter(this.left_el)});
    this.left_el.addEventListener('mouseleave', ()=>{this.mouseleave(this.left_el)});
    this.right_el.addEventListener('mouseenter', ()=>{this.mouseenter(this.right_el)});
    this.right_el.addEventListener('mouseleave', ()=>{this.mouseleave(this.right_el)});
  }

  mouseenter(el){
    render_element({
      opacity: '0.8',
    }, el);
  }

  mouseleave(el){
    render_element({
      opacity: '1',
    }, el);
  }
}

class TimeBar extends TextRocket{
  constructor(
    parent_el,
    period,
    fontSize,
  ){
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

  config(period){
    this.child_els[0].querySelectorAll('div')[1].innerHTML = period.from_.parse();
    this.child_els[1].querySelectorAll('div')[1].innerHTML = period.gap().toString() + ' mins';
    this.child_els[2].querySelectorAll('div')[1].innerHTML = period.to_.parse();
  }
}

function once(arr){
  var res = [];
  arr.forEach(br=>{
    if(!res.includes(br)){
      res.push(br);
    }
  });  
  return res;
}

// search
class Search{
  constructor(
    el, // textarea or input
    ocean, // array containing mapping string, return index
    btn, // search btn
    func, 
    cover=2,
  ){
    this.el = el;
    this.ocean = once(ocean); // array does not have duplicated element
    this.btn = btn;
    this.func = func;
    this.cover = cover;

    this.search = this.search.bind(this);

    this.btn.addEventListener('click', function(){
      this.func(this.sort());
    }.bind(this));

    this.config = this.config.bind(this);
  }

  static pick(
    ind, // current at
    cover, // range
    len, // upper boundary
  ){
    var inds = [];
    var pris = [];
    for(let ii = ind - cover; ii <= ind + cover; ii++){
      if(ii >= 0 && ii <= len){
        inds.push(ii);
        pris.push(cover - Math.abs(ind - ii) + 1);
      }
    }
    return [inds, pris];
  }

  static rate(input, output, cover){
    // return a numeric indicator to similarity
    var ratio = 0;
    for(let ii = 0; ii < input.length; ii++){
      var [inds, pris] = Search.pick(ii, cover, input.length);
      for(let jj = 0; jj < inds.length; jj++){
        let ind = inds[jj];
        let pri = pris[jj];
        if(input[ind] === output[ind]){
          ratio += pri;
        }
      }
    }
    return ratio;
  }

  search(){
    let indices = this.ocean.map(str=>Search.rate(this.el.value, str, this.cover));
    let maxval = indices.indexOf(Math.max(...indices));
    return this.ocean[maxval];
  }

  sort(){
    var res = [];
    var indices = this.ocean.map(str=>Search.rate(this.el.value, str, this.cover));
    for(let ii = 0; ii < indices.length; ii++){
      let ma = Math.max(...indices);
      let ma_at = indices.indexOf(ma);
      indices[ma_at] = -1;
      res.push(this.ocean[ma_at]);
    }
    return res;
  }

  config(ocean){
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
    preFocus=()=>{}, // focus first event handler
    aftBlur=()=>{}, // blur last event handler
    free=5, 
    cover=2,
  ){
    this.host = host;
    this.is_array = Array.isArray(ocean);
    this.parent_el = parent_el;
    this.width_px = width_px;
    this.fontSize = fontSize;
    this.preFocus = preFocus;
    this.aftBlur = aftBlur;

    this.free = free;
    this.sub_styles = sub_styles;

    if(Array.isArray(ocean)){
      this.is_array = true;
      this.ocean_length = ocean.length;
    }else{
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
      ()=>{}, 
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
    
    this.el.addEventListener('keyup', e=>{
      if(e.key === 'Enter'){
        var val = this.el.value;
        this.btn_click();
        this.el.value = val;
      }
    });
    this.el.addEventListener('focus', this.btn_click);
    this.el.addEventListener('blur', this.hide_subs);

    this.config = this.config.bind(this);
  }

  get value(){
    return this.el.value
  }

  set value(v){
    this.el.value = v;
  }

  rect(){
    return this.wrapper.getBoundingClientRect();
  }

  show_subs(){
    var rect = this.rect();
    this.sub_wrapper.style.display = 'block';
    this.sub_wrapper.style.top = (rect.top + rect.height).toString() + 'px';
    this.sub_wrapper.style.left = (rect.left).toString() + 'px';
  }

  hide_subs(){
    this.sub_wrapper.style.display = 'none';
    this.sub_wrapper.style.top = window.screen.width.toString() + 'px';
    this.sub_wrapper.style.left = window.screen.height.toString() + 'px';
    if(!this.host.autofill_checkbox.checked)this.aftBlur();
  }

  btn_mouseenter(){
    render_element({
      background: 'black',
      color: 'white',
    }, this.btn);
  }

  btn_mouseleave(){
    render_element({
      background: 'white',
      color: 'black',
    }, this.btn);
  }

  btn_click(){
    if(!this.host.autofill_checkbox.checked)this.preFocus();
    var res = once(this.search_engine.sort());
    /*
    res.length: how many results are there
    this.free: how many at maximum indicates rectangle
    */
    var free = res.length < this.free ? res.length : this.free;
    var rect = this.rect();
    this.sub_wrapper.innerHTML = '';
    this.sub_wrapper.style.height = (rect.height * this.free).toString() + 'px';
    this.subs = Array.from({length: free === 0 ? 0 : free + 3}, ii=>{
      let div = document.createElement('div');
      render_element(Object.assign(this.sub_styles, {
        width: '100%',
        height: rect.height.toString() + 'px',
        cursor: 'pointer',
        borderBottom: '0.2px solid',
        background: 'lightgray',
      }), div);
      div.addEventListener('mouseenter', function(){
        this.sub_mouseenter(div);
      }.bind(this));
      div.addEventListener('mouseleave', function(){
        this.sub_mouseleave(div);
      }.bind(this));
      /* event bubbling priority: mousedown then blur then click */
      div.addEventListener('mousedown', function(){
        this.sub_click(div);
      }.bind(this));
      this.sub_wrapper.appendChild(div);
      return div;
    });
    this.show_subs();

    for(let ii = 0; ii < free; ii++){
      this.subs[ii].innerHTML = res[ii];
    }
  }

  get value(){
    return this.is_array ? this.el.value : this.ocean[this.el.value];
  }

  sub_mouseenter(div){
    render_element({
      background: 'lightblue',
      color: 'darkorchid',
    }, div);
  }

  sub_mouseleave(div){
    render_element({
      background: 'lightgray',
      color: 'black',
    }, div);
  }

  sub_click(div){
    this.el.value = div.innerHTML;
    this.hide_subs();
  }

  config(ocean){
    if(ocean === this.search_engine.ocean)return;
    if(Array.isArray(ocean)){
      this.is_array = true;
      this.search_engine.config(ocean);
      this.ocean_length = ocean.length;
    }else{
      this.is_array = false;
      var kks = Object.keys(ocean);
      this.search_engine.config(kks);
      this.ocean_length = kks.length;
    }
    this.ocean = ocean;
    var rect = this.rect();
  }
}


// label normal widget
class LabelNormal{
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
  ){
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

  mouseenter(){
    render_element({
      color: this.colorHover,
      background: this.bgHover,
    }, this.el);
  }

  mouseleave(){
    render_element({
      color: this.color,
      background: this.bg,
    }, this.el);
  }
}


// main panel

class PanelMain{
  // applied Config, init after fetch
	constructor(
		// percentage
		width, 
		height,
		header_width, 

    period,
    name,
    course,
    teacher,
    zoomlink, 
	){
		this.width = width;
		this.height = height;
		this.header_width = header_width;

    this.period = period;
    this.name = name;
    this.course = course;
    this.teacher = teacher;
    this.zoomlink = zoomlink;

    this.courselink = new CourseLink(
      new Config().id[this.name],
      'id',
    );

		this.el = document.createElement('div');
		render_element({
			position: 'fixed',
			zIndex: '10000',
			left: (50 - this.width / 2).toString() + 'vw',
			top: (50 - this.height / 2).toString() + 'vh',
			width: this.width.toString() + 'vw',
			height: this.height.toString() + 'vh',
			border: '1px solid',
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
      function(el){
        render_element({
          textDecoration: 'underline',
          fontWeight: 'bold',
        }, el);
      },// activate
      function(el){
        render_element({
          textDecoration: 'none',
          fontWeight: 'normal',
        }, el);
      },// dismiss 
      this.headerInfo// el
    )

    /*
    frame functions are set-up functions,
    which should be called only once in contsructor
    */
		this.__info_frame();
    this.__edit_frame();
    // this.el.style.display = 'none';
    // this.hide();
    this.info_view();

		this.info_view = this.info_view.bind(this);
    this.edit_view = this.edit_view.bind(this);

    this.headerInfo.addEventListener('click', this.info_view);
    this.headerEdit.addEventListener('click', this.edit_view);

    this.config = this.config.bind(this);

    this.visible = false;
    this.el.style.display = 'none';
    this.hide();
  }

  config(
    period,
    name,
    course,
    teacher,
    zoomlink,
  ){
    this.period = period;
    this.name = name;
    this.course = course;
    this.teacher = teacher;
    this.zoomlink = zoomlink;

    if(this.visible){
      switch(this.view){
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

  hide(){
    this.visible = false;
    this.el.style.opacity = '0';
    setTimeout(()=>{
      render_element({
        left: '100vw',
        top: '100vh',
        display: 'none',
      }, this.el);
    }, 400);
  }

  show(){
    this.visible = true;
    render_element({
      left: '25vw',
      top: '25vh',
      display: 'block',
    }, this.el);
    setTimeout(()=>{
      this.el.style.opacity = '1';
    }, 0);
    if(this.view === 'info'){
      this.timebar.hide();
      setTimeout(()=>{
        this.timebar.show();
      }, 500);
    }
  }

	static newHeader(
		parent_el,
		text, 
		color,
	){
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

		header.addEventListener('mouseenter', function(){
			render_element({
				opacity: '0.8',
			}, header);
		});
		header.addEventListener('mouseleave', function(){
			render_element({
				opacity: '1',
			}, header);
		});
		parent_el.appendChild(header);
		return header;
	}

  // info
	__info_frame(){
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
		] = ['course', 'zoom', 'calendar'].map((str, ii)=>{
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

    this.info_btn_zoom.oneEventListener('click', function(){
      window.open(this.zoomlink.url);
    }.bind(this));

    this.info_btn_course.oneEventListener('click', function(){
      window.open(this.courselink.course);
    }.bind(this));

    this.info_btn_calendar.oneEventListener('click', function(){
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
	){
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
    if(this.view === 'info')return;
    this.view = 'info';
		this.main_el.innerHTML = '';
		this.info_name.innerHTML = this.name;
		this.info_course.innerHTML = this.course + '&nbsp;&nbsp;';
		this.main_el.appendChild(this.info_el);
    this.timebar.config(this.period);

    this.info_btn_zoom.oneEventListener('click', function(){
      window.open(this.zoomlink.url);
    }.bind(this));

    this.info_btn_course.oneEventListener('click', function(){
      window.open(this.courselink.course);
    }.bind(this));

    this.info_btn_calendar.oneEventListener('click', function(){
      window.open(this.courselink.calendar);
    }.bind(this));

    setTimeout(()=>{
      this.timebar.show();
    }, 250);
	}

  // edit
  __edit_frame(){
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
      flexDirection:  'row',
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
      function(){
        this.name = this.input_course_el.value;
        this.teacher = this.input_teacher_el.value;
        this.period = parsedToPeriod(this.input_period_el.value);
        this.zoomid = this.input_zoomId_el.value;
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
      ()=>{console.log('delete btn clicked')},
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
      ()=>{console.log('clear btn clicked')}, 
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
      '1.2em',
      {
        border: '1px solid',
      },
      Object.keys(new Config().course),
      {
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function(){
        var di = new Config().course[this.input_course_el.value];
        if(di == null)return;
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function(){
        var arr = Agenda.filterByName(new Config().agenda.arr, this.input_course_el.value);
        if(arr.length === 0){
          arr = new Config().timeline;
        }else{
          arr = arr.map(ar=>ar.period);
        }
        this.input_period_el.config(Period.sort(arr).map(ar=>ar.parse()));
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      function(){
        var arr = new Config().agenda.arr.concat();
        var course = validateInput(this.input_course_el);
        var period = validateInput(this.input_period_el);
        if(course){
          arr = Agenda.filterByName(arr, course);
        }
        if(period){
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      ()=>{},
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      ()=>{},
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
      '1.2em',
      {
        border: '1px solid',
      },
      [],
      {
        fontSize: '1.2em',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '5px',
        overflow: 'auto',
      },
      ()=>{},
      this.calendarlink_blur,
    );

    this.main_el.innerHTML = '';
  }

  zoomlink_autofill(){
    var id = this.input_zoomId_el.el.value;
    if(id != null && id.trim().length > 1){
      id = id.trim();
      var zoomlink = new Config().zoomlink[id];
      if(zoomlink == null){
        zoomlink = "https://studygroup.zoom.us/j/" + id;
      }
      this.input_zoomLink_el.value = zoomlink;
    }
  }

  zoomid_autofill(){
    var link = this.input_zoomLink_el.el.value;
    if(link != null && link.trim().length > 1){
      link = link.trim();
      try{
        var zoomid = new ZoomLink(link).id;
        this.input_zoomId_el.value = zoomid;
      }catch(e){return}
    }
  }

  courseid_blur(){
    this.courselink = new CourseLink(this.input_courseId_el.value, 'id');
    this.render_courselink();
  }

  courselink_blur(){
    this.courselink = new CourseLink(this.input_courseLink_el.value, 'course');
    this.render_courselink();
  }

  calendarlink_blur(){
    this.courselink = new CourseLink(this.input_calendarLink_el.value, 'calendar');
    this.render_courselink();
  }

  render_courselink(){
    if(!this.courselink.is_null()){
      this.input_courseId_el.value = this.courselink.id;
      this.input_courseLink_el.value = this.courselink.course;
      this.input_calendarLink_el.value = this.courselink.calendar;
    }
  }

  edit_view(){
    if(this.view === 'edit')return;
    this.view = 'edit';
    this.main_el.innerHTML = '';
    this.input_course_el.value = this.name;
    this.input_teacher_el.value = this.teacher;
    this.input_period_el.value = this.period.parse();
    this.input_zoomId_el.value = this.zoomlink.id;
    
    this.render_courselink();

    this.zoomlink_autofill();
    this.main_el.appendChild(this.edit_el);
  }
}


setTimeout(()=>{
  var pm = new PanelMain(
    50, 
    50, 
    10,
    new Period(new Clock("14:00"), new Clock("15:00")),
    "USFP English A",
    "21.SEA4/5",
    "Freda Pappas",
    new ZoomLink("https://studygroup.zoom.us/j/96653377807?pwd=U050aUdvK3lOUWx5MkttMUtIWkJxZz09"),
  );

  document.querySelector('#btn1').addEventListener('click', ()=>{
    if(!pm.visible){
      pm.show();
    }else{
      pm.hide();
    }
  });
  document.querySelector('#btn2').addEventListener('click', ()=>{
    pm.config(
      new Period(new Clock("16:00"), new Clock("17:00")),
      "USFP Mathematics for Science A",
      "21.MSA9/10",
      "Colin Baker",
      new ZoomLink("https://studygroup.zoom.us/j/92673619214?pwd=Rjc4Tm9XbWZwVGJsU0I4Y01PbTBSQT09"),
    );
  });
}, 500);

// setTimeout(()=>{
//   pm.show();
// }, 2000);

