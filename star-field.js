'use strict';

class Star_Field {

	constructor(canvas, width, height) {

		this._canvas = canvas;
		this._canvas_ctx = this._canvas.getContext('2d', {alpha: false});
		this._canvas.width = width;
		this._canvas.height = height;

		this.reset();

		this._prev_time = performance.now();	// for time elapsed calc
	}

	reset() {

		this._speed = 100;	// speed per 100ms
		this._star_display = 1;
		this._star_size = 4;
		this._star_saturation = 30;
		this._trail_display = 1;
		this._trail_size_offset = 0;
		this._trail_saturation = 30;
		this._trail_length = 300;
		this._trail_gradient = 1;
		this._trail_end = 1;
		this._trail_cap = "round";
		this._stars = [];
		this._space_population = 300;	// stars per 1,000,000 px square
		this._space_depth = 5000;
		this._fov = 100;

		this._star_count = Math.floor( this._canvas.width * this._canvas.height / 1000000 * this._space_population );
		this._dis = Math.tan(this._fov / 2 * Math.PI / 180) * this._canvas.width / 2;

		while(this._stars.length < this._star_count) {
			this._stars.push({
				x: Math.random() * this._space_depth - this._space_depth / 2,
				y: Math.random() * this._space_depth - this._space_depth / 2,
				z: Math.random() * this._space_depth,
				d: 0,
				s: Math.floor(2 + Math.random() * this._star_size),
				h: Math.floor(Math.random() * 9) * 40
			});
		}
	}

	loop(timestamp=0) {

		if(timestamp === 0) timestamp = performance.now();
		const elapsed = timestamp - this._prev_time;
		this._prev_time = timestamp;

		this.step(elapsed);

		requestAnimationFrame(this.loop.bind(this));
	}

	step(elapsed) {

		this.update(elapsed);
		const stats = this.render();
		return stats;
	}

	update(elapsed) {

		const half_depth = this._space_depth / 2.0;

		// add stars if needed
		while(this._stars.length < this._star_count) {
			this._stars.push({
				x: Math.random() * this._space_depth - half_depth,
				y: Math.random() * this._space_depth - half_depth,
				z: Math.random() * this._space_depth,
				d: 0,
				s: Math.floor(2 + Math.random() * this._star_size),
				h: Math.floor(Math.random() * 9) * 40
			});
		}

		// remove stars if necesary
		if(this._stars.length > this._star_count) {
			this._stars = this._stars.slice(0, this._star_count);
		}

		// update all stars
		for(let star of this._stars) {
			star.z -= this._speed * elapsed / 100;
			if(star.z < 0.1) {
				star.x = Math.random() * this._space_depth - half_depth;
				star.y = Math.random() * this._space_depth - half_depth;
				star.z = this._space_depth + (star.z % this._space_depth);
				star.s = Math.floor(2 + Math.random() * this._star_size);
				star.h = Math.floor(Math.random() * 9) * 40;
			}
			star.d = Math.sqrt( star.x * star.x + star.y * star.y + star.z * star.z );
		}

		this._stars.sort( (a, b) => b.z - a.z );
	}


	render() {

		const stats = { stars: 0,
						fill_style: 0,
						fill: 0,
						stroke_style: 0,
						stroke: 0,
						time: performance.now() };

		const half_width = this._canvas.width / 2.0;
		const half_height = this._canvas.height / 2.0;

		this._canvas_ctx.fillStyle = "black";
		this._canvas_ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		this._canvas_ctx.lineCap = this._trail_cap;

		// only draw the first this._star_count stars
		for(let star of this._stars) {

			const vx0 = Math.round(half_width + star.x / star.z * this._dis);
			const vy0 = Math.round(half_height + star.y / star.z * this._dis);
			const vx1 = Math.round(half_width + star.x / (star.z + this._trail_length) * this._dis);
			const vy1 = Math.round(half_height + star.y / (star.z + this._trail_length) * this._dis);

			if (vx1 < this._canvas.width && vy1 < this._canvas.height && star.d < this._space_depth) {

				const distance_norm = star.d / this._space_depth;
				const brightness = Math.round( (1 - distance_norm * distance_norm) * 100 );
				const star_size = Math.round( (1 - distance_norm) * star.s );
				const star_color = `hsl(${star.h}, ${this._star_saturation}%, ${brightness}%)`;
				const trail_color = `hsl(${star.h}, ${this._trail_saturation}%, ${brightness}%)`;

				// draw tail
				if(this._trail_display === 1) {

					const trail_size = Math.max(star_size * 2 + star_size * 2 * this._trail_size_offset / 100, 1);
					this._canvas_ctx.lineWidth = trail_size;
					if(this._trail_gradient === 1) {
						const gradient = this._canvas_ctx.createLinearGradient(vx0, vy0, vx1, vy1);
						gradient.addColorStop(0.0, trail_color);
						gradient.addColorStop(1.0, 'black');
						this._canvas_ctx.strokeStyle = gradient;
						stats.stroke_style++;
					}
					else {
						this._canvas_ctx.strokeStyle = trail_color;
						stats.stroke_style++;
					}

					this._canvas_ctx.beginPath();
					this._canvas_ctx.moveTo(vx0, vy0);
					this._canvas_ctx.lineTo(vx1, vy1);
					this._canvas_ctx.stroke();
					stats.stroke++;
				}

				// draw star
				if(this._star_display === 1) {

					this._canvas_ctx.fillStyle = star_color;
					stats.fill_style++;
					this._canvas_ctx.beginPath();
					this._canvas_ctx.ellipse(vx0, vy0, star_size, star_size, 0, 0, 2 * Math.PI);
					this._canvas_ctx.fill();
					stats.fill++;
				}

				stats.stars++;
			}
		}
		stats.time = Math.round(performance.now() - stats.time);
		return stats;
	}


	resize(width, height) {

		this._canvas.width = width;
		this._canvas.height = height;
		this._star_count = Math.floor( this._canvas.width * this._canvas.height / 1000000 * this._space_population );
		this._dis = Math.tan(this._fov / 2 * Math.PI / 180) * this._canvas.width / 2;
	}

	get_attribute(attribute) {
		if(typeof this[`_${attribute}`] === 'undefined') return;
		return this[`_${attribute}`];
	}

	set_attribute(attribute, value) {
		if(typeof this[`_${attribute}`] === 'undefined') return;
		this[`${attribute}`] = parseInt(value);
	}

	set star_size(size) {
		const ratio = this._star_size / size;
		this._star_size = size;
		for(let star of this._stars) {
			star.s = Math.round(star.s / ratio);
		}
	}

	set trail_end(value) {
		this._trail_end = value;
		if(this._trail_end === 0) {
			this._trail_cap = 'square';
		}
		else if(this._trail_end === 1) {
			this._trail_cap = 'round';
		}
	}

	set space_population(density) {
		this._space_population = density;
		this._star_count = Math.floor( this._canvas.width * this._canvas.height / 1000000 * this._space_population );
	}

	set space_depth(depth) {
		const ratio = this._space_depth / depth;
		this._space_depth = depth;
		for(let star of this._stars) {
			star.z = Math.round(star.z / ratio);
		}
	}

	set speed(s) { this._speed = s; }
	set star_display(sd) { this._star_display = sd; }
	set star_saturation(ss) { this._star_saturation = ss; }
	set trail_display(td) { this._trail_display = td; }
	set trail_size_offset(tso) { this._trail_size_offset = tso; }
	set trail_saturation(ts) { this._trail_saturation = ts; }
	set trail_length(tl) { this._trail_length = tl; }
	set trail_gradient(tg) { this._trail_gradient = tg; }
	set fov(f) { this._fov = f; };
}
