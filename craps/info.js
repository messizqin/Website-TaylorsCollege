// import
function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
  }
}
// end of import

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
		this.clickCallback();
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

	addInfo(category, content, callback){
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

// new InfoPiece(
// 	"darkorchid", // bg
// 	"1.5em", // fontSize,
// 	70, // width_percent
// 	'10px', // padding
// 	'15px', // borderRadius
// 	"Failed to load resource: the server responded with a status of 404 (Not Found)", // content
// ).becomeChildOf(document.body);

// new InfoWarn(
// // new InfoError(
// // new InfoMessage(
// // new InfoNotice(
// ).becomeChildOf(document.body);


new Info().addInfo(
	'warn',
	"Failed to load resource: the server responded with a status of 404 (Not Found)", // content
	()=>{},
);

setTimeout(()=>{
	new Info().addInfo(
		'message',
		"Failed to load resource: the server responded with a status of 404 (Not Found)", // content
		()=>{},
	);

	setTimeout(()=>{
		new Info().addInfo(
			'error',
			"Failed to load resource: the server responded with a status of 404 (Not Found)", // content
			()=>{},
		);

		setTimeout(()=>{
			new Info().addInfo(
				'notice',
				"Failed to load resource: the server responded with a status of 404 (Not Found)", // content
				()=>{},
			);
		}, 500);
	}, 500);
}, 500);




























