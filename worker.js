'use strict';

self.importScripts('star-field.js');

const perf = { prev_time: 0, timer: 0, frame_count: 0, frame_per_seconds: 0 };
let star_field = null;


self.onmessage = (evt) => {
	if(evt.data.message === 'init') {
		star_field = new Star_Field(evt.data.canvas, evt.data.width, evt.data.height);
		requestAnimationFrame(loop);
	}
	else if(evt.data.message === 'resize') {
		star_field.resize(evt.data.width, evt.data.height);
	}
	else if(evt.data.message === 'get') {
		const value = star_field.get_attribute(evt.data.attribute);
		postMessage({ message: 'attribute', attribute: evt.data.attribute, value: value });
	}
	else if(evt.data.message === 'set') {
		star_field.set_attribute(evt.data.attribute, evt.data.value);
	}
	else if(evt.data.message === 'reset') {
		star_field.reset();
	}
};


function loop(timestamp) {

	const elapsed = timestamp - perf.prev_time;
	perf.prev_time = timestamp;

	const stats = star_field.step(elapsed);

	if( (perf.frame_count % 10) === 0 ) {
		const time = performance.now();
		perf.frame_per_seconds = Math.round( 1000 / (time - perf.timer) * perf.frame_count );
		perf.timer = time;
		perf.frame_count = 0;
	}
	perf.frame_count++;
	stats.fps = perf.frame_per_seconds;

	postMessage({ message: 'stats', stats: stats });

	requestAnimationFrame(loop);
}
