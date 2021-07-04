function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
  }
}

const rit = val => Math.round(val * 100) / 100;

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

// end of import

const isInt = value => !isNaN(value) && (function(x) {
  return (x | 0) === x;
})(parseFloat(value));

// message
class InfoPiece{
  constructor(
    bg, 
    color,
    fontSize,
    width_percent,
    padding, 
    borderRadius,
    marginBottom,
    timeOut,
    content,
    clickCallback,
  ){
    this.bg = bg;
    this.color = color;
    this.fontSize = fontSize;
    this.width_percent = width_percent;
    this.padding = padding;
    this.borderRadius = borderRadius;
    this.marginBottom = marginBottom;
    this.timeOut = timeOut;
    this.content = content;
    this.clickCallback = clickCallback;

    [
      this.el,
      this.text_wrapper,
      this.btn_wrapper,
    ] = Array.from({length: 3}, ii=>document.createElement('div'));
    this.el.appendChild(this.text_wrapper);
    this.el.appendChild(this.btn_wrapper);
    render_element({
      color: this.color,
      padding: this.padding,
      fontSize: this.fontSize,
      marginBottom: this.marginBottom,
      left: (50 - this.width_percent / 2).toString() + '%',
      width: this.width_percent.toString() + "%",
      background: this.bg,
      zIndex: '10000000000',
      borderRadius: this.borderRadius,
      display: 'none',
      flexDirection: 'row',
      alignItems: 'center',
      opacity: '0',
      transition: 'opacity 500ms ease-out',
    }, this.el);
    render_element({
      width: `calc(100% - ${this.fontSize})`,
    }, this.text_wrapper);
    this.text_wrapper.innerHTML = this.content;
    render_element({
      width: this.fontSize,
      height: this.fontSize,
      fontSize: this.fontSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }, this.btn_wrapper);
    this.btn_wrapper.innerHTML = '<i class="fas fa-times-circle"></i>';
    this.dismiss_btn = this.btn_wrapper.querySelector('i');
    this.dismiss_btn.style.cursor = 'pointer';

    this.fade_in = this.fade_in.bind(this);
    this.fade_out = this.fade_out.bind(this);

    this.btn_mouseenter = this.btn_mouseenter.bind(this);
    this.btn_mouseleave = this.btn_mouseleave.bind(this);
    this.btn_click = this.btn_click.bind(this);
    this.dismiss_btn.addEventListener('mouseenter', this.btn_mouseenter);
    this.dismiss_btn.addEventListener('mouseleave', this.btn_mouseleave);
    this.dismiss_btn.addEventListener('click', this.btn_click);

    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.el.addEventListener('click', function(){this.clickCallback();this.btn_click()}.bind(this));
    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);

    this.becomeChildOf = this.becomeChildOf.bind(this);
    this.removeChildFrom = this.removeChildFrom.bind(this);
    
    this.fade_in();
    this.hovered = false;
  }

  fade_in(){
    this.el.style.display = 'flex';
    setTimeout(()=>{
      this.el.style.opacity = '1';
    }, 0);
  }

  fade_out(){
    this.el.style.opacity = '0';
    setTimeout(()=>{
      this.el.style.display = 'none';
    }, 350);
  }

  btn_mouseenter(){
    this.dismiss_btn.style.color = 'black';
  }

  btn_mouseleave(){
    this.dismiss_btn.style.color = 'white';
  }

  btn_click(){
    this.fade_out();
  }

  mouseenter(){
    this.hovered = true;
    this.el.style.opacity = '0.75';
  }

  mouseleave(){
    this.el.style.opacity = '1';
  }

  becomeChildOf(parent_el){
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);

    setTimeout(()=>{
      if(!this.hovered)new Info().removeInfo(this);
    }, this.timeOut);
  }

  removeChildFrom(){
    this.parent_el.removeChild(this.el);
    this.parent_el = null;
  }
}

var info_config = {
  fontSize: '1.5em',
  width_percent: 100,
  padding: '10px',
  borderRadius: '15px',
  marginBottom: '15px',
  timeOut: 5000,
};

class InfoWarn extends InfoPiece{
  constructor(content, click){
    super("orange", "white", info_config.fontSize, info_config.width_percent, info_config.padding, info_config.borderRadius, info_config.marginBottom, info_config.timeOut, content, click);
  }
}

class InfoError extends InfoPiece{
  constructor(content, click){
    super("pink", "black", info_config.fontSize, info_config.width_percent, info_config.padding, info_config.borderRadius, info_config.marginBottom, info_config.timeOut, content, click);
  }
}

class InfoMessage extends InfoPiece{
  constructor(content, click){
    super("skyblue", "black", info_config.fontSize, info_config.width_percent, info_config.padding, info_config.borderRadius, info_config.marginBottom, info_config.timeOut, content, click);
  }
}

class InfoNotice extends InfoPiece{
  constructor(content, click){
    super("green", "white", info_config.fontSize, info_config.width_percent, info_config.padding, info_config.borderRadius, info_config.marginBottom, info_config.timeOut, content, click);
  }
}

class Info{
  constructor(){
    if(Info._instance)return Info._instance;
    this.info = [];
    this.el = document.createElement('div');
    render_element({
      position: 'fixed',
      top: '0',
      left: '0',
      left: "15%",
      width: '70%',
      zIndex: '1000000',
    }, this.el);
    document.body.appendChild(this.el);
    this.addInfo = this.addInfo.bind(this);
    this.popInfo = this.popInfo.bind(this);
    this.removeInfo = this.removeInfo.bind(this);
    Info._instance = this;
  }

  addInfo(category, content, callback=()=>{}){
    switch(category){
      case "warn":
        this.info.push(new InfoWarn(content, callback));
      break;

      case "error":
        this.info.push(new InfoError(content, callback));
      break;

      case "message":
        this.info.push(new InfoMessage(content, callback));
      break;

      case "notice":
        this.info.push(new InfoNotice(content, callback));
      break;
    }
    this.info[this.info.length - 1].becomeChildOf(this.el);
  }

  popInfo(ind=null){
    var info = this.info.splice(ind == null ? this.info.length - 1 : ind, 1)[0];
    info.fade_out();
    setTimeout(()=>{
      info.removeChildFrom();
    }, 400);
  }

  removeInfo(info){
    this.popInfo(this.info.indexOf(info));
  }
}

class Answer{
  // http response object
  constructor(
    status, 
    msg=null, 
    data=null,
  ){
    this.status = status;
    this.msg = msg;
    this.data = data;
  }
}

// end of import

class PillBar{
  constructor(
    width,
    height,
    fontSize, 
    textFontSize,
    color,
    borderRadius, 
    theme, // rgba object
    key, 
    value, 
    save_func, 
    /* take input value and initial value as params
    return response */
  ){
    this.width = width;
    this.height = height;
    this.fontSize = fontSize;
    this.textFontSize = textFontSize;
    this.borderRadius = borderRadius;
    this.color = color;
    this.theme = theme;
    this.key = key;
    this.value = value;
    this.save_func = save_func;

    this.el = document.createElement('div');
    render_element({
      display: 'flex',
      flexDirection: 'row',
      width: this.width,
      height: this.height, 
      fontSize: this.fontSize, 
      color: this.color,
      borderRadius: this.borderRadius,
      cursor: 'pointer',
      border: '1px solid black',
    }, this.el);
    this.editing = false;
    [
      this.left_el,
      this.right_el,
    ] = Array.from({length: 2}, ii=>{
      let div = document.createElement('div');
      this.el.appendChild(div);
      render_element({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
      }, div);
      return div;
    });
    this.right_input = document.createElement('input');

    render_element({
      background: this.theme.rgb(-15),
      borderRadius: `${this.borderRadius} 0 0 ${this.borderRadius}`,
    }, this.left_el);
    render_element({
      background: this.theme.rgb(15),
      borderRadius: `0 ${this.borderRadius} ${this.borderRadius} 0`,
    }, this.right_el);
    this.left_el.innerHTML = this.key;
    this.right_el.innerHTML = this.value;
    render_element({
      width: '50%',
      borderRadius: `0 ${this.borderRadius} ${this.borderRadius} 0`,
      border: 'none',
      fontSize: this.textFontSize,
    }, this.right_input);

    this.update = this.update.bind(this);   
    this.right_input.addEventListener('blur', this.update);
    this.right_input.addEventListener('keyup', function(e){
      if(e.key === 'Enter')this.update();
    }.bind(this));

    this.mouseenter = this.mouseenter.bind(this);
    this.mouseleave = this.mouseleave.bind(this);
    this.click = this.click.bind(this);

    this.el.addEventListener('mouseenter', this.mouseenter);
    this.el.addEventListener('mouseleave', this.mouseleave);
    this.el.addEventListener('click', this.click);

    this.becomeChildOf = this.becomeChildOf.bind(this);
    this.removeChildFrom = this.removeChildFrom.bind(this);
  }

  update(){
    var ans = this.save_func(this.value, this.right_input.value);
    if(ans.status){
      console.log(ans.msg);
    }else{
      new Info().addInfo(
        'error',
        ans.msg,
      );
    }
  }

  mouseenter(){
    this.el.style.opacity = '0.8';
  }

  mouseleave(){
    this.el.style.opacity = '1';
  }

  click(){
    if(this.editing)return;
    this.el.removeChild(this.right_el);
    this.el.appendChild(this.right_input);
    this.right_input.value = this.value;
    this.right_input.focus();
    this.editing = true;
  }

  becomeChildOf(parent_el){
    this.parent_el = parent_el;
    this.parent_el.appendChild(this.el);
  } 

  removeChildFrom(){
    this.parent_el.removeChild(this.el);
    this.parent_el = null;
  }
}

class Clock{
  static inspect(str){
    if(str.includes(':')){
      var res = str.split(':');
      if(res.length === 2){
        return isInt(res[0]) && isInt(res[1]);
      }
    }
  }
}

new PillBar(
  '250px', // width,
  '50px', // height,
  '2em', // fontSize, 
  '1em', // textFontSize,
  'white', // color,
  '20px', // borderRadius,
  new RGBA(255, 130, 130), // theme, // rgba object
  'start', // key, 
  '18:30', // value, 
  (initial, value)=>{
    if(initial === value)return new Answer(200);
    return Clock.inspect(value) ? new Answer(
      true, // status
      // msg
      // data
    ) : new Answer(
      false, // status
      "Please entry a valid time", // msg
      // data
    );
  }
).becomeChildOf(document.body);



























