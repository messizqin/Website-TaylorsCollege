const rit = val => Math.round(val * 100) / 100;

function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
  }
}


/* timeline */
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
    return this.from_.lt(to.from_);
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
}
// end of import

class TextRocket{
  constructor(
    parent_el, // connected
    child_els, // any text wrapper that has not been connected yet
  ){
    this.parent_el = parent_el;
    this.parent_el.style.overflow = 'hidden';
    this.child_els = child_els;
    this.child_wrapper = document.createElement('div');
    // must have flex row set
    render_element({
      position: 'absolute',
      width: '100%',
      height: '100%',
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
    this.width = rit(this.rect().height);

    this.parent_el.appendChild(this.child_wrapper);
    this.parent_el.appendChild(this.rocket_wrapper);
    render_element({
      position: 'absolute',
      width: '100%',
      height: '100%',
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
    this.rocket_wrapper.style.width = '100%';
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
  }
}

// const [c1, c2, c3] = Array.from({length: 3}, ii=>{
//   var ce = document.createElement('div');
//   ce.setAttribute('class', 'content');
//   return ce;
// });
// c1.innerHTML = 'start';
// c2.innerHTML = 'duration';
// c3.innerHTML = 'finish';

// const tr = new TextRocket(
//   document.querySelector('#wrapper'),
//   [c1, c2, c3],
// );

// var fl = true;
// window.addEventListener('click', ()=>{
//   if(fl){
//     tr.show();
//   }else{
//     tr.hide();
//   }
//   fl = !fl;
// });
 
// var cl1 = ;
// var cl2 = new Clock('12:00');
// var pd1 = new Period(cl1, cl2);
// console.log(pd1.gap());

var tb = new TimeBar(
  document.querySelector('#wrapper'), 
  new Period(new Clock('11:00'), new Clock('12:00')),
  '1.5em',
);

window.addEventListener('click', ()=>{
  tb.show();
});



















