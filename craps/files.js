// import
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

function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
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


class Config{
	constructor(){
    	if (Config._instance) return Config._instance;
    	this.abs_path = new Path(window.location.href).backward(1);
    	this.json_path = this.abs_path.forward('json');
    	fetch(this.json_path.forward("icon.json").url())
      		.then(res => res.json())
      		.then(icon => {
      			this.icon = icon;
      			this.getIconByExt = function(ext){
      				var res;
					for (const [kk, vv] of Object.entries(this.icon.icon)) {
						if(this.icon.mapper[kk] == null){
							// non-subsidary
							if(ext === kk){
								res = vv;
							}
						}else{
							// subsidaries
							for(let ii = 0; ii < this.icon.mapper[kk].length; ii++){
								if(ext === this.icon.mapper[kk][ii]){
									res = vv;
								}
							}
						}
      				}
      				if(res == null){
      					res = this.icon.icon.file;
      				}
      				return res;
      			}.bind(this);
      			this.getThemeByExt = function(ext){
      				var res;
					for (const [kk, vv] of Object.entries(this.icon.theme)) {
						if(this.icon.mapper[kk] == null){
							// non-subsidary
							if(ext === kk){
								res = vv;
							}
						}else{
							// subsidaries
							for(let ii = 0; ii < this.icon.mapper[kk].length; ii++){
								if(ext === this.icon.mapper[kk][ii]){
									res = vv;
								}
							}
						}
      				}
      				if(res == null){
      					res = this.icon.theme.file;
      				}
      				return res;
      			}.bind(this);
	      });
    	Config._instance = this;
	}
}

new Config();

class FileBox{
	constructor(
		maxlength, // max file name length
		tooltipFlow, // up down left right
		width_px,
		height_px,
		borderRadius,
		iconSize,
		fontSize,
		file,
	){
		this.maxlength = maxlength;
		this.tooltipFlow = tooltipFlow;
		this.width_px = width_px;
		this.height_px = height_px;
		this.borderRadius = borderRadius;
		this.iconSize = iconSize;
		this.fontSize = fontSize;

		this.file = file;
		this.name = this.file.name.length > this.maxlength ? this.file.name.substring(0, this.maxlength - 2) + '..' : this.file.name;

		this.ext = this.file.name.split('.').pop();
		this.iconHTML = new Config().getIconByExt(this.ext);
		this.theme = new Config().getThemeByExt(this.ext);
		this.rgb = new RGBA(this.theme.r, this.theme.g, this.theme.b);

		this.el = document.createElement('span');
		this.left_el = document.createElement('div');
		this.right_el = document.createElement('div');
		this.el.appendChild(this.left_el);
		this.el.appendChild(this.right_el);
		render_element({
			width: this.width_px.toString() + 'px', 
			height: this.height_px.toString() + 'px', 
			borderRadius: this.borderRadius,
      		transition: 'all 200ms ease-in',
			display: 'flex',
			flexDirecton: 'row',
			cursor: 'grab',
		}, this.el);
		this.el.setAttribute('tooltip', this.file.name);
		this.el.setAttribute('flow', this.tooltipFlow);
		render_element({
			width: this.height_px.toString() + 'px',
			height: this.height_px.toString() + 'px', 
			fontSize: this.iconSize,
			borderRadius: `${this.borderRadius} 0 0 ${this.borderRadius}`,
			background: this.rgb.rgb(50),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}, this.left_el);	
		this.left_el.innerHTML = this.iconHTML;
		this.icon = this.left_el.querySelector("i");
		render_element({
			width: (this.width_px - this.height_px).toString() + 'px',
			height: this.height_px.toString() + 'px', 
			borderRadius: `0 ${this.borderRadius} ${this.borderRadius} 0`,
			background: this.rgb.rgb(100),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: fontSize,
			color: this.rgb.rgb(-100),
		}, this.right_el);
		this.right_el.innerHTML = this.name;

		this.click = this.click.bind(this);
		this.mouseenter = this.mouseenter.bind(this);
		this.mouseleave = this.mouseleave.bind(this);

		this.el.addEventListener('click', this.click);
		this.el.addEventListener('mouseenter', this.mouseenter);	
		this.el.addEventListener('mouseleave', this.mouseleave);	
	
		this.mouseleave();

		this.becomeChildOf = this.becomeChildOf.bind(this);
		this.removeChildFrom = this.removeChildFrom.bind(this);
	}

	becomeChildOf(parent_el){
		this.parent_el = parent_el;
		this.parent_el.appendChild(this.el);
	}

	removeChildFrom(){
		this.parent_el.removeChild(this.el);
		this.parent_el = null;
	}

	click(){
		download_file(this.file);
	}

	mouseenter(){
		render_element({
			color: this.rgb.rgba(0.5, -50),
		}, this.icon);
		render_element({
			color: this.rgb.rgba(0.5, -150),
		}, this.right_el);
		render_element({
      		boxShadow: 'none',
      		transform: 'translate(4px, 8px)',
		}, this.el);
	}

	mouseleave(){
		render_element({
			color: this.rgb.rgb(),
		}, this.icon);
		render_element({
			color: this.rgb.rgb(-100),
		}, this.right_el);
		render_element({
      		boxShadow: '4px 8px 0px ' + this.rgb.rgba(0.4, -50),
      		transform: 'translate(-4px, -8px)',
		}, this.el);
	}
}

function isInBoundingBox(p, el) {
	var box = el.getBoundingClientRect();
    return !(p.x < box.left || p.x > box.right || p.y > box.bottom || p.y < box.top)
}

function download_file(file){
	// file can only be downloaded after url is set in File
	if(!file.url)return;
	window.open(file.url);
}

class FileValidate{
	constructor(
		maxSize=null,
		allowedTypes=null,
	){
		this.checkers = [];

		this.maxSize = maxSize;
		this.checker_maxSize = this.checker_maxSize.bind(this);
		if(this.maxSize)this.checkers.push(this.checker_maxSize);
	
		this.allowedTypes = allowedTypes;
		this.checker_allowedTypes = this.checker_allowedTypes.bind(this);
		if(this.allowedTypes)this.checkers.push(this.checker_allowedTypes);
	
		this.validate_one = this.validate_one.bind(this);
		this.validate_many = this.validate_many.bind(this);
	}

	checker_maxSize(f){
		var res = f.size <= this.maxSize;
		if(!res){
			this.sizefail.push(`file size ${f.size} exceed maximun ${this.maxSize}`)
		}
		return res;
	}

	checker_allowedTypes(file){
		var res = this.allowedTypes.includes(file.name.split('.').pop());
		if(!res){
			this.typefail.push(file);
		}
		return res;
	}

	validate_one(file){
		this.typefail = [];
		this.sizefail = [];
		this.checkers.forEach(ck=>ck(file));

		this.info = [];
		if(this.typefail.length > 0){
			this.info.push(`Allowed types: ${this.allowedTypes.join(', ')}`);
			this.info.push(`${file.name} is rejected`);
		}
		if(this.sizefail.length > 0){
			this.info.push(this.sizefail[0]);
		}
		var res = this.info.length === 0;
		return {
			passed: res ? [file] : null,
			failed: res ? null : [file],
			info: this.info,
		}
	}

	validate_many(files){
		// all pass, some pass, all fail
		this.typefail = [];
		this.sizefail = [];
		var passed = [];
		var failed = [];
		var passfail = files.map(file=>{
			var pf = true;
			this.checkers.forEach(ck=>{
				pf = ck(file);
			});
			if(pf){
				passed.push(file);
			}else{
				failed.push(file);
			}
			return pf;
		});

		this.info = [];
		if(this.typefail.length > 0){
			this.info.push(`Allowed types: ${this.allowedTypes.join(', ')}`);
			this.typefail.forEach(file=>{
				this.info.push(`${file.name} is rejected`);
			});
		}
		this.sizefail.forEach(sf=>{
			this.info.push(sf);
		});

		var res = this.info.length === 0;
		return {
			passed: passed,
			failed: failed,
			info: this.info,
		}
	}
}

function filelist_to_array(filelist){
	var res = [];
	for(let ii = 0; ii < filelist.length; ii++){
		res.push(filelist[ii]);
	}
	return res;
}

class FileUploadBox{
	constructor(
		width,
		height,
		iconSize,
		fontSize,
		dropHandler, // takes a dataTransfer.files -> FileList
		filevalidate,
		multipleAllowed=true,  
	){
		this.width = width;
		this.height = height;
		this.iconSize = iconSize;
		this.fontSize = fontSize;
		this.dropHandler = dropHandler;
		this.filevalidate = filevalidate;
		this.multipleAllowed = multipleAllowed;

		this.rgb = new RGBA(140, 225, 150);
		this.dropped_rgb = new RGBA(173, 224, 255);
		[
			this.el,
			this.layer1_el,
			this.layer2_el,
		] = Array.from({length: 3}, ii=>document.createElement('div'));
		this.el.appendChild(this.layer1_el);
		this.layer1_el.appendChild(this.layer2_el);

		render_element({
			width: this.width,
			height: this.height,
			fontSize: this.iconSize,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			cursor: 'pointer',
		}, this.el);
		render_element({
			width: '80%',
			height: '80%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		}, this.layer1_el);
		render_element({
			width: '80%',
			height: '80%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		}, this.layer2_el);

		this.layer2_el.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
		this.icon = this.layer2_el.querySelector('i');
		this.text_el = document.createElement('div');
		this.layer2_el.appendChild(this.text_el);
		render_element({
			fontSize: this.fontSize,
			color: 'white',
			fontFamily: 'Arial',
		}, this.text_el);
		this.input_container_el = document.createElement('div');
		this.input_container_el.style.display = "none";
		this.el.appendChild(this.input_container_el);
		var input_el = `<input type="file" ${this.multipleAllowed ? "multiple" : ""} />`;
		this.input_container_el.innerHTML = input_el;
		this.input_el = this.input_container_el.querySelector('input');
		this.input_el.addEventListener('change', function(){
			this.droppedStatus();
			this.dropEventHandler(this.input_el.files);
		}.bind(this));

		this.dragover = this.dragover.bind(this);
		this.drop = this.drop.bind(this);
		this.dragleave = this.dragleave.bind(this);
		this.mouseenter = this.mouseenter.bind(this);
		this.mouseleave = this.mouseleave.bind(this);
		this.click = this.click.bind(this);

		this.el.addEventListener('dragover', this.dragover);
		this.el.addEventListener('drop', this.drop);
		this.el.addEventListener('dragleave', this.dragleave);
		this.el.addEventListener('mouseenter', this.mouseenter);
		this.el.addEventListener('mouseleave', this.mouseleave);
		this.el.addEventListener('click', this.click);
		this.predroppedStatus();

		this.becomeChildOf = this.becomeChildOf.bind(this);

		this.droppedStatus = this.droppedStatus.bind(this);
		this.predroppedStatus = this.predroppedStatus.bind(this);
		this.clear = this.clear.bind(this);
	}

	becomeChildOf(parent_el){
		this.parent_el = parent_el;
		this.parent_el.appendChild(this.el);	
	}

	dropEventHandler(filelist){
		if(filelist.length === 1){
			var res = this.filevalidate.validate_one(filelist[0]);
		}else{
			var res = this.filevalidate.validate_many(filelist_to_array(filelist));
			console.log(res);
		}
	}

	dragover(e){
		e.preventDefault();
		this.el.style.opacity = "0.8";
		this.el.style.animation = "greenPulse1 1s infinite";
		this.layer1_el.style.animation = "greenPulse2 1s infinite";
		this.layer2_el.style.animation = "greenPulse3 1s infinite";
	}

	drop(e){
		e.preventDefault();
		this.el.style.opacity = "1";
		this.el.style.animation = "initial";
		this.layer1_el.style.animation = "initial";
		this.layer2_el.style.animation = "initial";
		this.droppedStatus();
		this.dropEventHandler(e.dataTransfer.files);
	}

	droppedStatus(){
		this.icon.style.color = this.dropped_rgb.rgb();
		this.el.style.background = this.dropped_rgb.rgba(0.8, -50);
		this.layer1_el.style.background = this.dropped_rgb.rgba(0.7, -100);
		this.layer2_el.style.background = this.dropped_rgb.rgba(0.6, -120);
		this.text_el.innerHTML = 'File Uploaded';
	}

	predroppedStatus(){
		this.icon.style.color = this.rgb.rgb();
		this.el.style.background = this.rgb.rgba(0.8, -50);
		this.layer1_el.style.background = this.rgb.rgba(0.7, -100);
		this.layer2_el.style.background = this.rgb.rgba(0.6, -120);
		this.text_el.innerHTML = 'Drag and Drop to Upload';
	}

	dragleave(e){
		if(!isInBoundingBox(e, this.el)){
			this.predroppedStatus();
			this.el.style.opacity = "1";
			this.el.style.animation = "initial";
			this.layer1_el.style.animation = "initial";
			this.layer2_el.style.animation = "initial";
		}
	}

	mouseenter(){
		this.el.style.opacity = '0.8';
	}

	mouseleave(){
		this.el.style.opacity = '1';
	}

	click(){
		this.input_el.click();
	}

	clear(){
		this.predroppedStatus();
	}
}

class FileContainer{
	constructor(
		width,
		height,
		marginRight,
		styles,
	){
		this.width = width;
		this.height = height;
		this.marginRight = marginRight;
		this.styles = styles;
		this.fileboxes = [];

		this.el = document.createElement('div');
		render_element(Object.assign({
			width: this.width,
			height: this.height,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			marginRight: this.marginRight,
		}, this.styles), this.el);

		this.becomeChildOf = this.becomeChildOf.bind(this);
		this.addFileBox = this.addFileBox.bind(this);
		this.removeFileBox = this.removeFileBox.bind(this);
		this.popFileBox = this.popFileBox.bind(this);
		this.clear = this.clear.bind(this);
		this.arrange = this.arrange.bind(this);
		this.unshiftFileBox = this.unshiftFileBox.bind(this);
	}

	becomeChildOf(parent_el){
		this.parent_el = parent_el;
		this.parent_el.appendChild(this.el);
	}

	addFileBox(filebox){
		this.fileboxes.push(filebox);
		this.filebox.becomeChildOf(this.el);
	}

	removeFileBox(filebox){
		this.fileboxes.splice(this.fileboxes.indexOf(filebox), 1);
		filebox.removeChildFrom();
	}

	popFileBox(filebox){
		this.filebox.pop().removeChildFrom();
	}

	clear(){
		this.fileboxes.forEach(fb=>{
			fb.removeChildFrom();
		});
	}

	arrange(){
		this.fileboxes.forEach(fb=>{
			fb.becomeChildOf(this.el);
		});
	}

	unshiftFileBox(filebox){
		this.clear();
		this.fileboxes.unshift(filebox);
		this.arrange();
	}
}

class FileDrop{
	constructor(
		container_host, // file box container
		box_host, // upload receive

		container_width,
		container_height,
		container_marginRight,
		container_styles,

		box_width,
		box_height,
		box_iconSize,
		box_fontSize,

		filename_maxLength,
		file_tooltipFlow,
		file_width_px,
		file_height_px,
		file_borderRadius,
		file_iconSize,
		file_fontSize,

		maxSize,
		allowedTypes,
		multipleAllowed,
	){
		this.container_host = container_host;
		this.box_host = box_host;

		this.filename_maxLength = filename_maxLength;
		this.file_tooltipFlow = file_tooltipFlow;
		this.file_width_px = file_width_px;
		this.file_height_px = file_height_px;
		this.file_borderRadius = file_borderRadius;
		this.file_iconSize = file_iconSize;
		this.file_fontSize = file_fontSize;

		this.filecontainer = new FileContainer(
			container_width,
			container_height,
			container_marginRight,
			container_styles,
		);
		this.filecontainer.becomeChildOf(this.container_host);
	
		this.dropHandler = this.dropHandler.bind(this);
		this.fileuploadbox = new FileUploadBox(
			box_width, // width
			box_height, // height
			box_iconSize, // iconSize
			box_fontSize, // fontSize
			this.dropHandler, // dropHandler, takes a dataTransfer.files -> FileList
			new FileValidate(maxSize, allowedTypes), // filevalidate
			multipleAllowed, // multipleAllowed=true
		);
		this.fileuploadbox.becomeChildOf(this.box_host);
	}

	dropHandler(filelist){
		for(let ii = 0; ii < filelist.length; ii++){
			var filebox = new FileBox(
				this.filename_maxLength,
				this.file_tooltipFlow,
				this.file_width_px,
				this.file_height_px,
				this.file_borderRadius,
				this.file_iconSize,
				this.file_fontSize,
				filelist[ii],
			);
			filebox.becomeChildOf(this.filecontainer.el);
		}
	}

	refreshBox(){
		this.fileuploadbox.clear();
	}
}

var fd = new FileDrop(
	document.body, // container_host // file box container
	document.body, // box_host // upload receive
	"700px", // container_width
	"100px", // container_height
	"20px", // container_marginRight
	{
		borderRadius: "20px",
		border: '1px solid',
	}, // container_styles
	'300px', // box_width
	'150px', // box_height
	'3em', // box_iconSize
	'15px', // box_fontSize
	10, // filename_maxLength
	'down', // file_tooltipFlow (left right up down)
	200, // file_width_px
	40, // file_height_px
	'10px', // file_borderRadius
	'2em', // file_iconSize
	'2em', // file_fontSize

	100000000, // maxSize,
	['jpg'], // allowedTypes,
	true, // multipleAllowed,
);

// setTimeout(()=>{
// 	fd.refreshBox();
// }, 5000);








































