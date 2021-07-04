function render_element(styles, el) {
  for (const [kk, vv] of Object.entries(styles)) {
    el.style[kk] = vv;
  }
}

class Search{
	constructor(
		el, // textarea or input
		ocean, // array containing mapping string, return index
		btn, // search btn
		func, 
		cover=2,
	){
		this.el = el;
		this.ocean = ocean;
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
		this.ocean = ocean;
	}
}

class InputSearch {
	constructor(
		parent_el,
		width_px,
		fontSize,
		styles,
		ocean, // array containing mapping string, return index
		sub_styles,
		free=5, 
		available=10, 
		cover=2,
	){
		this.parent_el = parent_el;
		this.width_px = width_px;
		this.fontSize = fontSize;
		this.free = free > ocean.length ? ocean.length : free;
		this.available = available > ocean.length ? ocean.length : available;
		this.sub_styles = sub_styles;

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
			ocean,
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
			height: (rect.height * this.free).toString() + 'px',
			overflow: 'auto',
			zIndex: '100000',
			padding: '5px',
			display: 'none',
		}, this.sub_wrapper);

		this.show_subs = this.show_subs.bind(this);
		this.hide_subs = this.hide_subs.bind(this);
		this.sub_mouseenter = this.sub_mouseenter.bind(this);
		this.sub_mouseleave = this.sub_mouseleave.bind(this);
		this.sub_click = this.sub_click.bind(this);

		this.subs = Array.from({length: this.available}, ii=>{
			let div = document.createElement('div');
			render_element(Object.assign(this.sub_styles, {
				width: '100%',
				height: rect.height.toString() + 'px',
				cursor: 'pointer',
			}), div);
			div.addEventListener('mouseenter', function(){
				this.sub_mouseenter(div);
			}.bind(this));
			div.addEventListener('mouseleave', function(){
				this.sub_mouseleave(div);
			}.bind(this));
			div.addEventListener('click', function(){
				this.sub_click(div);
			}.bind(this));
			this.sub_wrapper.appendChild(div);
			return div;
		});
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
				this.btn_click();
			}
		});
		this.el.addEventListener('blur', this.hide_subs);

		this.config = this.config.bind(this);
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
		this.show_subs();
		var res = this.search_engine.sort();
		for(let ii = 0; ii < this.available; ii++){
			this.subs[ii].innerHTML = res[ii];
		}
	}

	sub_mouseenter(div){
		render_element({
			background: 'lightblue',
			color: 'darkorchid',
		}, div);
	}

	sub_mouseleave(div){
		render_element({
			background: 'white',
			color: 'black',
		}, div);
	}

	sub_click(div){
		this.el.value = div.innerHTML;
		this.hide_subs();
	}

	config(ocean){
		this.search_engine.config(ocean);
		this.available = this.available > ocean.length ? ocean.length : this.available;
		this.sub_wrapper.innerHTML = '';
		var rect = this.rect();
		this.subs = Array.from({length: this.available}, ii=>{
			let div = document.createElement('div');
			render_element(Object.assign(this.sub_styles, {
				width: '100%',
				height: rect.height.toString() + 'px',
				cursor: 'pointer',
			}), div);
			div.addEventListener('mouseenter', function(){
				this.sub_mouseenter(div);
			}.bind(this));
			div.addEventListener('mouseleave', function(){
				this.sub_mouseleave(div);
			}.bind(this));
			div.addEventListener('click', function(){
				this.sub_click(div);
			}.bind(this));
			this.sub_wrapper.appendChild(div);
			return div;
		});
	}
}

var ish = new InputSearch(
	document.querySelector('section'),
	300,
	'1.2em',
	{
		border: '1px solid',
	},
	[
		'english',
		'math',
		'economics',
		'media',
		'accounting',
		'informational technology',
		'it',
	],
	{
		fontSize: '1.2em',
		display: 'flex',
		alignItems: 'center',
		paddingLeft: '5px',
		overflow: 'auto',
	}
);

// ish.config([
// 	'dude',
// 	'perfect',
// ]);










