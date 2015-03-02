/**
 * Animation library.
 */
var animator = (function () {
	var animations = [],
		calculations = {},
		cache = {},
		flags = {
			animator: false,
			calculator: false
		},
		interval = settings.interval,
		performance = {
			animator: [],
			calculator: [],
			calculations: []
		},
		performanceLog = false,
		performanceTimeout = interval * 100,
		performancePrecision = 3;


	function normalizeAverage(average) {
		return Math.round(Math.pow(10, performancePrecision) * average) / Math.pow(10, performancePrecision);
	}

	/**
	 * Asses the performance of the engine.
	 */
	function performanceOutput() {
		var i,
			totalTime,
			totalCycles,
			averageTime,
			averageCycles,
			results = [];

		// Generic analysis for cycles.
		['animator', 'calculator'].forEach(function (item) {
			if (0 === performance[item].length) {
				return;
			}
			// Calculate animator statistics.
			totalTime = performance[item].reduce(function (a, b, index) {
				if (1 === index) {
					return a.time + b.time;
				}
				return a + b.time;
			});
			averageTime = totalTime / performance[item].length;
			totalCycles = performance[item].reduce(function (a, b, index) {
				if (1 === index) {
					return a.cycles + b.cycles;
				}
				return a + b.cycles;
			});
			averageCycles = totalCycles / performance[item].length;
			console.log('Statistics for ' + item + ': total time = ' + totalTime + '; average time = ' + normalizeAverage(averageTime) + ';' +
				' total cycles = ' + totalCycles + '; average cycles = ' + normalizeAverage(averageCycles));
		});

		// Custom analysis for duration of calculations.
		for (i in performance.calculations) {
			if (0 === performance.calculations[i].length) {
				continue;
			}
			totalTime = performance.calculations[i].reduce(function (a, b) { 
				return a + b;
			});
			results.push({
				name: i,
				total: totalTime,
				average: totalTime / performance.calculations[i].length
			});
		}
		results = results.sort(function (a, b) {
			return a.average > b.average;
		});
		results.forEach(function (item) {
			console.log('Calculation ' + item.name + ': total time = ' + item.total + '; average = ' + normalizeAverage(item.average));
		});
	};
	
	// Print out the statistics after a given time.
	if (true === performanceLog) {
		setInterval(function () {
			performanceOutput();
		}, performanceTimeout);
	}

	// Create internal animation cycle.
	var animator = setInterval(function () {
		var queue,
			current,
			cycles,
			time,
			i_property;

		if (true === flags.animator) {
			return;
		}
		flags.animator = true;
		
		// Get all the queued animations and clear the queue for the next calculation process to populate.
		queue = animations;
		animations = [];

		// Performance analysis initialization 
		cycles = queue.length;
		time = new Date().getTime();

		// Process the queue.
		while(0 !== queue.length) {
			current = queue.pop();

				current.$element.css(current.properties);

		}
		performance.animator.push({
			time: new Date().getTime() - time,
			cycles: cycles
		});

		flags.animator = false;
	}, interval);

	// Calculate everything and queue it for the animation cycle to take over.
	var calculator = setInterval(function () {
		var i,
			inc = 0,
			time,
			cycleTime,
			calculated;
		if (true === flags.calculator) {
			return;
		}
		flags.calculator = true;
		
		time = new Date().getTime();
		for (i in calculations) {
			if (false === calculations[i].queued) {
				continue;
			}
			
			cycleTime = new Date().getTime();
			calculated = calculations[i].instance.call();
			performance.calculations[i].push(new Date().getTime() - cycleTime);
			
			if (false === $.isArray(calculated)) {
				console.warn('[Animator]: Calculation ' + i + ' did not return an array.');
				continue;
			}
			animations = animations.concat(calculated);
			inc += 1;
		}
		performance.calculator.push({
			time: new Date().getTime() - time,
			cycles: inc
		});

		flags.calculator = false;
	}, interval);

	var lib = {
		add: function (waveID) {
			var $element = $('#' + waveID);
			if (0 === $element.length) {
				console.warn('[Animator]: Adding element ' + waveID + ' in the ' + this.name + ' library failed.');
				console.log('Reason: Element not registered in the Wave library.');
				return;
			}
			if (undefined !== this.elements[waveID]) {
				console.warn('[Animator]: Adding element ' + waveID + ' in the ' + this.name + ' library failed.');
				console.log('Reason: Element already exists.');
				return;
			}
			this.elements[waveID] = {
				id: waveID,
				$element: $element,
				properties: {}
			};
		},
		set: function (waveID, properties) {
			if (undefined === this.elements[waveID]) {
				console.warn('[Animator]: Setting properties for element ' + waveID + ' in the ' + this.name + ' library failed.');
				console.log('Reason: Element is not defined.');
				return;
			}
			this.elements[waveID].properties = properties;
		},
		/**
		 * Get elements from the instance library.
		 * Default it gets all elements. For specific elements declare as strings in the arguments
		 * list.
		 */
		get: function () {
			var i,
				i_len,
				collection = [];
			if (0 === arguments.length) {
				for (i in this.elements) {
					collection.push(this.elements[i]);
				}
			} else {
				for (i = 0, i_len = arguments.length; i < i_len; i += 1) {
					if (undefined === this.elements[arguments[i]]) {
						console.warn('[Animator]: Getting element ' + arguments[i] + ' from the ' + this.name + ' library failed.');
						console.log('Reason: Element is not defined.');
						continue;
					}
					collection.push(this.elements[arguments[i]]);
				}
			}
			return collection;
		},
		remove: function (waveID) {
			if (undefined === this.elements[waveID]) {
				console.warn('[Animator]: Removing element ' + waveID + ' from the ' + this.name + ' library failed.');
				console.log('Reason: Element is not defined.');
				return;
			}
			delete this.elements[waveID];
		}
	};

	return {
		/**
		 * Install an animation and schedule it for calculations.
		 */
		install: function (name, module) {
			var moduleLibrary;
			if (undefined !== calculations[name]) {
				console.warn('[Animator]: The animation name is already taken. Aborting.');
				return;
			}
			moduleLibrary = Object.create(lib);
			moduleLibrary.name = name;
			moduleLibrary.elements = {};
			
			// Add instance in the performance analizer.
			performance.calculations[name] = [];

			calculations[name] = {
				instance: module(moduleLibrary),
				queued: true
			};
		},
		/**
		 * Add the calculation to the calculations queue.
		 */
		start: function (name) {
			if (undefined === calculations[name]) {
				console.warn('[Animator]: The animation name is not defined. Aborting.');
				return;
			}
			calculations[name].queued = true;
		},
		/**
		 * Remove the calculation from the calculations queue. 
		 */
		stop: function (name) {
			if (undefined === calculations[name]) {
				console.warn('[Animator]: The animation name is not defined. Aborting.');
				return;
			}
			calculations[name].queued = false;
		}
	};
}());