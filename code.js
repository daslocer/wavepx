code.js/**
 * Element creation and animation script.
 * @package Lidl-Audi
 * @company BrandUP
 * @author Constantin Dumitrescu
 * @version $0.5$
 */

$(function () { 
	"use strict";

/**
 * Animation library called Wave.js
 * @company BrandUP
 * @author Constantin Dumitrescu
 * @version $0.1$
 */
var W = (function () {
	"use strict";

	var structure = (function () {
		var elements = {},
			// Id generator.
			newId = (function () { 
				var id = 0;
				return function () { 
					id += 1;
					return id;
				};
			}()),
			restrictedCss = ['z-index', 'zIndex'],
			// Default configuration for new elements.
			config = {
				position: 'absolute',
				top: 0,
				left: 0
			},
			// Default configuration for new images.
			configImg = {

			};

		/**
		 * Get the children from the parent.
		 * @param parentId required, The parent id.
		 */
		function getChildren(parentId, filter) {
			var i,
				children = [],
				filtered = [];
			// Go thorugh the elements, find the children, apply filters and return them.
			for (i in elements) {
				if (true === elements.hasOwnProperty(i)) {
					if (parentId === elements[i].parent) {
						children.push(elements[i]);
					}
				}
			}
			if (undefined === filter) {
				return children;
			} else {
				for (i = children.length - 1; i >= 0; i -= 1) {
					if (true === filter.call(children[i])) {
						filtered.push(children[i]);
					}
				}
				return filtered;
			}
		}

		/**
		 * Find an element inside his parent.
		 */
		function find(name, parent) {
			var i;
			parent = parseInt(parent, 10);
			for (i in elements) {
				if (name === elements[i].name && parent === elements[i].parent) {
					return elements[i];
				}
			}
			return [];
		}

		// Can two elements have the same z-index?
		/**
		 * Mini-library to help in z-index management tasks.
		 */
		var zIndex = {
			first: function (parentId) {
				var i,
					index,
					children = getChildren(parentId);
				for (i = children.length - 1; i >= 0; i -= 1) {
					if (undefined === index) {
						index = children[i].zIndex;
					} else if (index > children[i].zIndex) {
						index = children[i].zIndex;
					}
				}
				return index;
			},
			last: function (parentId) {
				var i,
					index = 0,
					children = getChildren(parentId);
				for (i = children.length - 1; i >= 0; i -= 1) {
					if (undefined === index) {
						index = children[i].zIndex;
					} else if (index < children[i].zIndex) {
						index = children[i].zIndex;
					}
				}
				return index;
			},
			getNew: function (parentId) {
				return this.last(parentId) + 1;
			},
			before: function (sourceId, targetId) {
				var i,
					children = getChildren(elements[sourceId].parent, function () {
						// Filter: get all the children except source and target.
						return sourceId !== this.id && targetId !== this.id;
					});

				for (i = children.length - 1; i >= 0; i -= 1) {
					if (elements[targetId].zIndex < children[i].zIndex) {
						elements[children[i].id].zIndex += 1;
						elements[children[i].id].$element.css({
							zIndex: elements[children[i].id].zIndex
						});
					}
				}

				elements[sourceId].zIndex = elements[targetId].zIndex;
				elements[sourceId].$element.css({
					zIndex: elements[sourceId].zIndex
				});

				elements[targetId].zIndex += 1;
				elements[targetId].$element.css({
					zIndex: elements[targetId].zIndex
				});
			},
			after: function (sourceId, targetId) {
				var i,
					children = getChildren(elements[sourceId].parent, function () {
						// Filter: get all the children except source and target.
						return sourceId !== this.id && targetId !== this.id;
					});

				for (i = children.length - 1; i >= 0; i -= 1) {
					if (elements[targetId].zIndex < children[i].zIndex) {
						elements[children[i].id].zIndex += 1;
						elements[children[i].id].$element.css({
							zIndex: elements[children[i].id].zIndex
						});
					}
				}

				elements[sourceId].zIndex = elements[targetId].zIndex + 1;
				elements[sourceId].$element.css({
					zIndex: elements[sourceId].zIndex
				});

			}
		};

		/**
		 * Create a new element.
		 * @param parentId int, The parent id.
		 * @param childId int, The child id.
		 * @param childIndex int, The z-index to be set on the child.
		 */
		function createElement(parentId, childId, childIndex) {
			var $child = $('<div></div>');
			$child
				.css(config)
				.css('z-index', childIndex)
				.attr({
					id: 'wave-' + childId,
					name: elements[childId].name
				});
			elements[parentId].$element.append($child);
			return $child;
		}

		/**
		 * Initialize the structure.
		 */
		elements[0] = {
			id: 0,
			parent: -1,
			$element: $('<div id="wave-0" style="z-index: 1000; position: fixed; top: 0; left: 0;"></div>'),
			name: 'global',
			index: 1000 // Make this is as the first element on the page, initially.
		};

		$('body').append(elements[0].$element);

		return {
			/**
			 * Add an element.
			 */
			add: function (parentId, childName) {
				var elementId,
					elementIndex;
				// Find the parent.
				if (undefined === elements[parentId]) {
					console.warn('[Structure]: Add aborted. Parent id not found.');
					return false;
				}
				if ('string' !== typeof childName) {
					console.warn('[Structure]: Add aborted. Child name not string.');
					return false;
				}
				// @TODO: Check for duplicate name validation
				if (0 !== find(parentId, childName).length) {
					console.warn('[Structure]: Add aborted. Child name already exists.');
					return false;
				}
				elementId = newId();
				elementIndex = zIndex.getNew(parentId);
				// Registering the new element.
				elements[elementId] = {
					id: elementId,
					parent: parentId,
					name: childName,
					zIndex: elementIndex
				};
				// The element is created after the initial register is completed.
				elements[elementId].$element = createElement(parentId, elementId, elementIndex);
				return elementId;
			},
			/**
			 * Get an element.
			 */
			get: function (id) {
				if (undefined === elements[id]) {
					return false;
				} else {
					return elements[id];
				}
			},
			/**
			 * Find always performs only one level search to return only one element at a time.
			 */ 
			find: function (name, parent) {
				return find(name, parent);
			},
			
			/**
			 * Set the style for an element.
			 */
			css: function (id, style) {
				var i,
					tempValue,
					value;
				if (undefined === elements[id]) {
					console.warn('[Structure]: CSS aborted. Element could not be found.');
					return;
				}
				// Remove restriced styles.
				for (i = restrictedCss.length - 1; i >= 0; i -= 1) {
					delete style[restrictedCss[i]];
				}

				elements[id].$element.css(style);
			},
			
			/**
			 * Copy the css styles of an element on another element.
			 */
			copy: function (id, name) {
				var copy = this.find(name, this.get(id).parent);
				elements[id]
					.$element
					.copyCSS(copy)
					.css('z-index', elements[id].zIndex);
			},
			
			/**
			 * Replace the current element with a clone of the traget.
			 */
			clone: function (id, name) {
				var clone = this.find(name, elements[id].parent);
				elements[id].$element = clone.$element.clone();
				elements[id].$element.attr({
					id: 'wave-' + id,
					name: elements[id].name
				}).css({
					zIndex: elements[id].zIndex
				});
				elements[0].$element.find('#wave-' + id).remove();
				// Do also a deep nested clone in the elements object.
				elements[id].$element.find('*').filter(function () { 
					return undefined !== $(this).attr('name');
				}).each(function () {
					// Define every parent until the elements parent.
					var i,
						elementId,
						parentId = id;
					// If the $parents is not empty then test them and add the element's parents.
					$(this).parentsUntil('#wave-' + id).each(function () {
						// Go through all the parents and create them if they don't exists.
						if (0 === find($(this).attr('name'), parentId)) {
							elementId = newId();
							elements[elementId] = {
								id: elementId,
								name: $(this).attr('name'),
								parent: parentId,
								$element: $(this)
							};
							$(this).attr({
								id: 'wave-' + elementId
							});
						}
						parentId = $(this).attr('id').replace('wave-', '') * 1;
					});
					// Add the element.
					elementId = newId();
					elements[elementId] = {
						id: elementId,
						name: $(this).attr('name'),
						parent: id,
						$element: $(this)
					};
					$(this).attr({
						id: 'wave-' + elementId
					});

				});
				elements[elements[id].parent].$element.append(elements[id].$element);
			},
			
			/** 
			 * Set an image inside the given element.
			 */
			image: function (id, src) {
				// Get element.
				var $img = $('<img src="' + src + '" />').css(configImg),
					$element = this.get(id).$element;
				$element.find('>img').remove();
				$element.append($img);
			},

			/**
			 * Set the zindex lower than the other zindex.
			 */
			before: function (id, name) { 
				var target = find(name, elements[id].parent).id;
				if (undefined === target) {
					console.warn('Name ' + name + ' not found in ' + elements[elements[id].parent].name);
				} else {
					zIndex.before(id, target);
				}
			},

			/**
			 * Set the zindex higher than the other zindex.
			 */
			after: function (id, name) { 
				var target = find(name, elements[id].parent).id;
				if (undefined === target) {
					console.warn('Name ' + name + ' not found in ' + elements[elements[id].parent].name);
				} else {
					zIndex.after(id, target);
				}
			},
			/**
			 * Get style.
			 */
			getStyle: function (id, style) { 
				var val = elements[id].$element.css(style);

				if (-1 !== val.indexOf('px')) {
					val = parseInt(val.replace('px', ''), 10);
				}
				return val;
			},
			/**
			 * Do custom animations.
			 */
			animate: function (id, style, time, callback) {
				var i,
					interval,
					begin = new Date().getTime(),
					end = begin + time,
					$element = elements[id].$element,
					styles = [];

				for (i in style) {
					if (true === style.hasOwnProperty(i)) {
						styles.push([i, style[i]]);
					}
				}

				// Get current styles and calculate how much must it go till it gets to the desired value.


				interval = setInterval(function () {
					var i,
						proc,
						now = end - new Date().getTime();
					if (now < 0) {
						proc = 1;
						clearInterval(interval);
					} else {
						proc = 1 - now / time; 
					}
					for (i = styles.length - 1; i >= 0; i -= 1) {	
						console.log('Setting ' + styles[i][0] + ' to ' + styles[i][1] * proc);
						$element.css(styles[i][0], styles[i][1] * proc);
					}
				}, 10);
				return interval;
			}
		};
	}());

	/**
	 * The main function.
	 */
	function wave(name, parentId) {
		var i,
			element = {},
			id = 0;

		if (undefined === name && undefined === parentId) {
			element = structure.get(0);
		} else if ('' === name && undefined !== parentId) {
			element = structure.get(parentId);
		} else {
			if (undefined !== parentId) {
				id = parentId;
			}
			element = structure.find(name, id);
		}
 
		for (i in element) {
			if (true === element.hasOwnProperty(i)) {
				this[i] = element[i];
			}
		} 

		return this;
	}

	/**
	 * The configuration function.
	 */

	wave.prototype.config = function () { 
		
	};
	
	/**
	 * Find an element inside the current element.
	 */
	wave.prototype.find = function (name) {
		var id = 0;
		if (undefined !== this.id) {
			id = this.id;
		}
		return new wave(name, id);
	};

	/**
	 * Add a new member to the structure.
	 * @param name string, The name of the element.
	 */
	wave.prototype.add = function (name) {
		var id = 0;
		if (undefined !== this.id) {
			id = this.id;
		}
		structure.add(id, name);
		return new wave(name, this.id);
	};

	/**
	 * Define a copy
	 */
	wave.prototype.copy = function (name) {
		structure.copy(this.id, name);
		return this;
	};

	/**
	 * Define a clone.
	 */
	wave.prototype.clone = function (name) {
		structure.clone(this.id, name);
		return this;
	};

	/** 
	 * Set the style.
	 * @param attr object, The attributes.
	 */
	wave.prototype.css = function (style) {
		structure.css(this.id, style);
		return this;
	};

	/**
	 * Get styles from the elements.
	 */
	wave.prototype.getStyle = function (style) {
		return structure.getStyle(this.id, style);
	};

	/**
	 * Go to the element's parent.
	 */
	wave.prototype.up = function () {
		if (0 === this.parent) {
			return this;
		} else {
			return new wave('', this.parent);
		}
	};

	/**
	 * Add an image inside the element.
	 */
	wave.prototype.image = function (src) { 
		structure.image(this.id, src);
		return this;
	};

	/**
	 * Declare an animation.
	 */
	wave.prototype.animate = function (style, time, easing, callback) {
		return structure.animate(this.id, style, time, easing, callback);
	};

	/**
	 * Start an animation.
	 * THIS FUNCTION IS NEVER CALLED AND HAS AN UNDEFIEND "ANIMATIONS" VAR.

	wave.prototype.start = function (name) {
		var that = this,
			i,
			tempDeg = 0,
			deg = 0,
			attr = animations[name];

		if (undefined === animating[this.name]) {
			animating[this.name] = {};
		}

		if ('rotate' === animations[name].type) {
			// If element is rotating then add a acceleration/deacceleration to it.
			for (i in animating[this.name]) {
				if ('rotate' === animations[i].type) {
					tempDeg = animations[i].rotate;
				}
			}

			this.stop(name);
			animating[this.name][name] = setInterval(function () { 
				deg += attr['rotate'] / 2 ;
				that.element.jangle(deg);
			}, 30);
		}
		// $('div').jangle(90);
		// this.element.animate(animations[name], animations[name].duration);
	};
	 */
	/**
	 * Handle the z-index presentation.
	 */
	wave.prototype.before = function (name) {
		structure.before(this.id, name);
		return this;
	};
	wave.prototype.after = function (name) {
		structure.after(this.id, name);
		return this;
	};

	/**
	 * Stop an animation.
	 */
	wave.prototype.stop = function (name) {
		var i;

		// Stop all animations.
		if (undefined === name) {
			for (i in animating[this.name]) {
				if ('rotate' === animations[i].type) {
					clearInterval(animating[this.name][i]);
				}
			}
		} else {
			if ('rotate' === animations[name].type) {
				clearInterval(animating[this.name][name]);
			}
		}
	};

	wave.prototype.$ = function () {
		return structure.get(this.id).$element;
	};

	var sprites = [];

	var spriteInterval = setInterval(function () {
		var i,
			len,
			now = (new Date()).getTime(),
			toRemove = [];

		for (i = 0, len = sprites.length; i < len; i += 1) {
			// If the time is longer than we got to then fire the animation.
			// Otherwise the interval is longer than the current time lapse.
			if (sprites[i].lastUsed + sprites[i].interval < now) {
				sprites[i].currentFrame += 1;
				if (sprites[i].framesCount <= sprites[i].currentFrame) {
					if (true === sprites[i].once) {
						if (undefined !== sprites[i].after) { 
							sprites[i].after.call(sprites[i].$sprite);
						}
						toRemove.push(i);
						continue;
					}
					sprites[i].currentFrame = 0;
				}
				sprites[i].$sprite.css('left', -1 * sprites[i].currentFrame * sprites[i].frameWidth);
				sprites[i].lastUsed = (new Date()).getTime();
			}
		}

		toRemove = toRemove.sort(function (a,b) { 
			return b - a;
		});
		for (i = 0, len = toRemove.length; i < len; i += 1) {
			sprites.splice(toRemove[i], 1);
		}
	}, 30);

	/**
	 * Add a sprite image.
	 */
	wave.prototype.sprite = function (obj) { 
		var $sprite = $('<img src="' + obj.url +'" />'),
			$spriteContainer = $('<div></div>');
		// Get the sprite.
		$spriteContainer.css({
			position: 'absolute',
			top: 0,
			left: 0,
			width: obj.width,
			height: obj.height,
			overflow: 'hidden'
		});

		$sprite.css({
			position: 'absolute',
			top: 0,
			left: 0
		});

		var times = 0;
		
		var startSprite = function () {
			sprites.push({
				$sprite: $sprite,
				interval: obj.interval,
				after: obj.after,
				framesCount: obj.sprites,
				currentFrame: -1,
				lastUsed: 0,
				frameWidth: obj.width,
				once: obj.once
			});
		};

		$spriteContainer.append($sprite);
		if (undefined !== obj.delay) {
			setTimeout(startSprite, obj.delay);
		} else {
			startSprite();
		}

		this.$element.append($spriteContainer);
		// Insert the sprite container inside.
		// Insert the image in the sprite container.
		// Start the sprite animation by changing the position of the sprite in the sprite container at an interval.
		return this;
	};

	return function (name, parentId) {
		return new wave(name, parentId);
	};
}());

	function IsIE8Browser() {
	    var rv = -1;
	    var ua = navigator.userAgent;
	    var re = new RegExp("Trident\/([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null) {
	        rv = parseFloat(RegExp.$1);
	    }
	    return (rv == 4);
	}

	var i;

	/**
	 * Define initial configuration.
	 */

	var $container = $('body');

	var screens = 10;
	var gap = 3;

	var reference = 1200; // $container.outerWidth();
	var point = {
		w: reference,
		h: $container.outerHeight(),
		start: reference,
		end: reference * (screens - 1),
		baseline: 120 + ($container.outerHeight() / 2)
	};

	var page = {
		start: point.start,
		beneficii: point.start + point.w * (gap - 1),
		premii: point.start + 2 * point.w * gap,
		abonare: (point.start + 3 * point.w * gap) - 500,
		finish: point.start + 3 * point.w * gap
	};

	// --> Set the environment configuration.
	// Define the empy space on the left.
	// Define the start point for the elements.
	W().css({
		left: -page.start
	});

	/**
	 * Add background.
	 */
	W().add('background').image('img/background.jpg').css({ 
		left: point.start - 200,
		width: 2500 
	});

	/**
	 * Add sidewalk.
	 */
	W().add('sidewalk').css({
		top: point.baseline
	}).add('road').css({
		left: point.start,
		width: $container.width() * 2,
 	 	height: 500,
  		background: "url('img/road.png')"
	});

	W('sidewalk').add('fence').before('road').css({
		top: -50,
		width: $container.width() * 2,
		height: 69,
		background: "url('img/fence.png')"
	});

 	/**
 	 * Add the fields.
 	 */
 	W().add('fields').css({
 		top: point.baseline,
 		left: point.start - point.w
 	}).before('sidewalk');
 	W('fields').add('lidl-store').image('img/lidlstore.png').css({
 		top: -229,
 		left: page.start
 	});

 	/**
 	 * Add the foreground.
 	 */
 	W().add('foreground').before('fields').css({
 		top: point.baseline - 354
 	});


 	// Add the buildings at the begining.
 	for (i = 0; i < 6; i += 1) {
 		W('foreground').add('building-' + i).css({
 			top: 0,
 			scale: 1.4,
 			left: i * 650 - point.w + Math.round(Math.random() * 500) 
 		}).image('img/elem-buildings.png');
 	}

 	// Add the buildings at the end.

 	// Add the fields.
 	var hillList = [
 		[79, 'img/building-set-1.png', 403],
 		[0, 'img/building-set-2.png', 585],
 		[0, 'img/building-set-3.png', 500],
 		[0, 'img/building-set-4.png', 364],
 	];
 	var hillInc = 2;
 	var windmills = [];
 	var soFarWidth = 0;
 	for (i = 0; i < 5; i += 1) {
  		hillInc += 1;
  		if (4 === hillInc) {
  			hillInc = 0;
  		}
  		W('foreground').add('hill-' + i).css({
  			top: hillList[hillInc][0],
 			left: point.w * 2.2 + soFarWidth
 		}).image(hillList[hillInc][1]);
  		soFarWidth += hillList[hillInc][2];
 	}

	W('foreground').add('hill-end-2').css({
		top: 155,
		left: point.w * 4
	}).image('img/hills-2.png')
		.add('windmill')
			.css({top: 116, left: 298})
			.add('windmill-body')
				.css({top: 0, left: 0})
				.image('img/windmill-body.png')
				.up()
			.add('windmill-propeler')
				.css({top: -10, left: -7})
				.image('img/windmill-propeler.png');

 	windmills.push(W('foreground').find('hill-end-2').find('windmill').find('windmill-propeler'));

	W('foreground').add('hill-end-1').css({
		top: 54,
		left: point.w * 4 + 648
	}).image('img/hills-3.png');



 	/**
 	 * Add the clouds (near).
 	 */
 	W().add('clouds-near').before('foreground').add('clouds-body');
 	for (i = -5; i < 10; i += 1) {
 		W('clouds-near').find('clouds-body').add('cloud-' + i).css({
 			top: Math.round(Math.random() * 50),
 			left: i * (500 + Math.round(Math.random() * 120))
 		}).image('img/elem-cloud.png');
 	}

 	/**
 	 * Add the clouds (far).
 	 */
 	W().add('clouds-far').before('foreground').add('clouds-body');
 	for (i = 0; i < 10; i += 1) {
 		W('clouds-far').find('clouds-body').add('cloud-' + i).css({
 			scale: 0.3,
 			top: Math.round(Math.random() * 300),
 			left: i * (500 + Math.round(Math.random() * 70))
 		}).image('img/elem-cloud.png');
 	}

 	/**
 	 * Add the airplane.
 	 */
 	W().add('airplane').after('foreground').css({
 			top: point.baseline - 300,
 			left: point.start + point.w / 2
 		})
 		.add('airplane-body')
 		.add('body').image('img/airplane.png')
 		.up()
 		.add('propeler').css({
 			top: 22,
 			left: 895
 		}).sprite({
 			url: 'img/airplane-proppler.png',
 			width: 17,
 			height: 45,
 			interval: 130,
 			sprites: 6
 		});


 	W().add('baloon').after('foreground').css({
 		top: point.baseline - 400,
 		left: point.start
 	}).add('baloon-body-1').css({
 		top: 0,
 		left: 0
 	}).image('img/baloon.png').
 	up()
 	.add('baloon-body-2').css({
 		scale: 0.9,
 		top: 30,
 		left: 500
 	}).image('img/baloon2.png')
 	.up()
 	.add('baloon-body-3').css({
 		scale: 0.4,
 		top: 15,
 		left: 1500
 	}).image('img/baloon2.png')
 	.up()
 	.add('baloon-body-4').css({
 		scale: 0.5,
 		top: 20,
 		left: 2500
 	}).image('img/baloon.png');

 	/**
 	 * Add the car.
 	 */
 	W().add('car').css({
 		top: point.baseline - 70,
 		left: page.start
 	})
	.add('car-body')
		.css({
			width: 674,
			height: 252
		})
		.add('character').css({
			top: 18,
			left: 196,
			opacity: 0
		}).image('img/character.png')
		.up()
		.add('body')
		.image('img/car.png');

	if (true === IsIE8Browser()) {
		W('car')
			.add('left-wheel').css({
					top: 135,
					left: 32,
					width: 80,
					height: 80,
					background: 'url(img/tires.png) no-repeat'
				})
			.up()
			.add('right-wheel').clone('left-wheel').css({
				left: 342
			});
	} else {
		W('car')
			.add('left-wheel').css({
					top: 135,
					left: 32,
					width: 80,
					height: 80
				})
				.add('tire').css({
					width: 114,
					height: 114
				}).image('img/tire2.png')
				.up()
				.add('brake').css({
					top: 20,
					left: 20,
					width: 58,
					height: 58
				}).image('img/brake.png')
				.up()
				.add('rim').css({
					top: 9,
					left: 9,
					width: 88,
					height: 88
				}).image('img/rim.png')
				.up()
			.up()
			.add('right-wheel').clone('left-wheel').css({
				left: 342
			});
	}
	W('car')
		.add('shadow').css({
			top: 152
		}).image('img/car-shadow.png').before('car-body');

 	/**
 	 * Add elements to the street.
 	 */
 	W('sidewalk')
 		.add('signs').before('road').up()
 		.add('fixed')
 			.add('road-bumps').up()
 			.add('semaphores').up();

	var signsPosition = {
		start: page.start + 650,
		beneficii_1: page.beneficii, 
		beneficii_2: page.beneficii + point.w, 
		beneficii_3: page.beneficii + point.w * 2, 
		premii_1: page.premii + 20, 
		premii_2: page.premii + (point.w / 2 - 150) + 600,
		premii_3: page.premii + point.w - 300 + 1300,
		stop: page.start - 500
	};

 	var roadBumps = [ 
 		signsPosition.beneficii_2 - 300,
 		signsPosition.premii_2 - 300
 	];
 	
 	var semaphores = [ 
 		[signsPosition.beneficii_1 - 200, false],
 		[signsPosition.premii_1 - 200, false]
 		// [signsPosition.beneficii_3 - 300, false],
 		// [signsPosition.premii_3 - 300, false]
 	];

 	var stopSigns = [
 		[signsPosition.premii_3 - 300, false],
 		[signsPosition.beneficii_3 - 300, false]
 	];

	/**
	 * Add signs.
	 */
	W('sidewalk').find('signs')
		.add('sign-stop')
			.css({
				top: -220,
				left: signsPosition.stop
			})
			.image('img/stop.png')
			.up()
		.add('sign-start')
			.css({
				top: -321,
				left: signsPosition.start
			})
			.image('img/start_banner.png')
			.add('arrow')
				.css({
					top:200,
					left:0,
					width: 218,
					height: 117,
					transformOrigin: '50% 50%'
				})
				.image('img/start_arrow.png')
				.up()
			.up()
		.add('sign-beneficii-1')
			.css({
				top: 0,
				left: signsPosition.beneficii_1
			})
			.image('img/news_banner.png')
			.add('star-1')
				.css({
					top: 144,
					left: 160
				})
				.image('img/news_starRed.png')
				.up()
			.add('star-2')
				.css({
					top: 10,
					left: 200,
					scale: 0.5
				})
				.image('img/news_starGreen.png')
				.up()
			.add('star-3')
				.css({
					top: 50,
					left: 320,
					scale: 0.5
				})
				.image('img/news_starRed.png')
				.up()
			.add('star-4')
				.css({
					top: 140,
					left: 370,
					scale: 0.8
				})
				.image('img/news_starGreen.png')
				.up()
			.add('text-1')
				.css({
					top: 50,
					left: 36
				})
				.image('img/news_text.png')
				.up()
			.up()
		.add('sign-beneficii-2')
			.css({
				top: -280,
				left: signsPosition.beneficii_2,
				width: 0,
				height: 300
			})
			.image('img/buy_banner.png')
			.add('items')
				.css({
					position: 'absolute',
					top: 'auto',
					bottom: 48,
					left: 15,
					width: 457,
					height: 1200,
					overflow: 'hidden'
				})
				.add('item-1')
					.css({
						top: 0,
						left: 312
					})
					.image('img/buy_item3.png')
					.up()
				.add('item-2')
					.css({
						top: 0,
						left: 368
					})
					.image('img/buy_item1.png')
					.up()
				.add('item-3')
					.css({
						top: 0,
						left: 34
					})
					.image('img/buy_item7.png')
					.up()
				.add('item-4')
					.css({
						top: 0,
						left: 48
					})
					.image('img/buy_item8.png')
					.up()
				.add('item-5')
					.css({
						top: 0,
						left: 297
					})
					.image('img/buy_item9.png')
					.up()
				.add('item-6')
					.css({
						top: 0,
						left: 209
					})
					.image('img/buy_item2.png')
					.up()
				.add('item-7')
					.css({
						top: 0,
						left: 375
					})
					.image('img/buy_item6.png')
					.up()
				.add('item-8')
					.css({
						top: 0,
						left: 300
					})
					.image('img/buy_item5.png')
					.up()
				.add('item-9')
					.css({
						top: 0,
						left: 220
					})
					.image('img/buy_item4.png')
					.up()
				.up()
			.add('text')
				.css({
					bottom: 66,
					left: 24
				})
				.image('img/buy_text.png')
				.up()
			.up()
		.add('sign-beneficii-3')
			.css({
				top: -313,
				left: signsPosition.beneficii_3
			})
			.add('banner')
				.image('img/post_banner.png')
				.up()
			.add('drape')
				.css({
					top: 80,
					left: 20,
					overflow: 'hidden',
					height: 400,
					width: 200
				})
				.image('img/post_drapes.png')
				.up()
			.up()
		.add('sign-premii-1')
			.css({
				top: -307,
				left: signsPosition.premii_1
			})
			.image('img/audi_banner.png')
			.add('lights')
				.css({
					top: 0,
					left: 0,
					opacity: 0
				})
				.image('img/sign-lights.png')
				.up()
			.add('overlay')
				.css({
					top: 27,
					left: 2,
					width: 539,
					height: 214,
					overflow: 'hidden',
					opacity: 1
				})
				.add('mark-1')
					.css({
						top: -50,
						left: 40
					})
					.image('img/audi_mark.png')
					.up()
				.add('mark-2')
					.css({
						top: 125, 
						left: -160
					})
					.image('img/audi_mark.png')
					.up()
				.add('car')
					.css({
						top: -1,
						left: 430
					})
					.image('img/audi_car.png')
					.up()
				.add('text')
					.css({
						top: 48,
						left: 16
					})
					.image('img/audi_text.png')
					.up()
				.add('body')
					.css({
						top: -110,
						left: -70
					})
					.image('img/audi_overlay.png')
					.up()
				.add('taillight')
					.css({
						top: 71,
						left: 454,
						opacity: 0
					})
					.image('img/audi_taillight.png')
					.up()
				.up()
			.up()
		.add('sign-premii-2')
			.css({
				top: -253,
				left: signsPosition.premii_2
			})
			.image('img/ipad_banner.png')
			.add('overlay')
				.css({
					top: 8,
					left: 24,
					width: 435,
					height: 220,
					overflow: 'hidden'
				})
				.add('text-1')
					.css({
						top: 20,
						left: 233
					})
					.image('img/ipad_text1.png')
					.up()
				.add('text-2')
					.css({
						top: 85,
						left: 236
					})
					.image('img/ipad_text2.png')
					.up()
				.add('arrow-static-1')
					.css({
						top: 140,
						left: 450
					})
					.image('img/ipad_arrow1.png')
					.up()
				.add('arrow-static-2')
					.css({
						top: 145,
						left: 450
					})
					.image('img/ipad_arrow2.png')
					.up()
				.add('arrow-static-3')
					.css({
						top: 150,
						left: 450
					})
					.image('img/ipad_arrow3.png')
					.up()
				.up()
			.up()
		.add('sign-premii-3')
			.css({
				top: -300,
				left: signsPosition.premii_3
			})
			.image('img/vouchers_banner.png')
			.add('text')
				.css({
					top: 20,
					left: 40
				})
				.image('img/vouchers_text.png')
				.up()
			.add('ten-1')
				.css({
					top: 100,
					left: 10,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png) 0 -72px'
				})
				.up()
			.add('ten-0')
				.css({
					top: 92,
					left: 50,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png)'
				})
				.up()
			.add('number-1')
				.css({
					top: 126,
					left: 283,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png)'
				})
				.up()
			.add('number-2')
				.css({
					top: 118,
					left: 327,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png)'
				})
				.up()
			.add('number-3')
				.css({
					top: 111,
					left: 372,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png)'
				})
				.up()
				/*
			.add('number-4')
				.css({
					top: 114,
					left: 387,
					width: 50,
					height: 72,
					rotate: -10,
					background: 'url(img/vouchers_digits.png)'
				})
				.up()
			 */
			.up()
		.add('building')
			.css({
				left: page.finish + point.w / 2 - 100
			})
			.add('bottom')
				.css({
					left: 192
				})
				.image('img/house-bottom.png')
				.up()
			.add('top')
				.css({
					top: -248
				})
				.image('img/house-top.png');

	W('sidewalk').find('signs').find('sign-premii-1').find('lights').$().find('img').css('width', 526);

	var arrowsCount = 36;
	for (i = 1; i <= arrowsCount; i += 1) {
		W('sidewalk').find('signs').find('sign-premii-2').find('overlay')
			.add('arrow-' + i)
				.css({
					scale: 2
				})
				.image('img/ipad_arrow' + Math.round(Math.random() * 2 + 1) + '.png');
	}

 	for (i = 0; i < roadBumps.length; i += 1) {
 		W('sidewalk').find('fixed').find('road-bumps')
			.add('bump-' + i)
 			.css({
 				top: 30,
 				left: roadBumps[i]
 			})
 			.image('img/bumper.png');
 	}

 	for (i = 0; i < semaphores.length; i += 1) {

 		W('sidewalk').find('fixed').find('semaphores')
 			.add('semaphore-' + i)
	 			.css({
	 				top: -276,
	 				left: semaphores[i][0],
	 				width: 110,
	 				overflow: 'hidden',
	 				background: 'url(img/semafor.png) no-repeat',
	 				height: 304
	 			})
	 			.up()
 			.add('pedestrian-' + i)
	 			.css({
	 				top: 27,
	 				left: semaphores[i][0]
	 			})
	 			.image('img/zebra.png');
 	}

 	for (i = 0; i < stopSigns.length; i += 1) {
 		W('sidewalk').find('fixed')
 			.add('stopSign-' + i)
 				.css({
 					top: -235,
					left: stopSigns[i][0]
				})
				.image('img/stop2.png');
 	}

 	W('sidewalk').find('fixed')
 		.add('lamp-1')
 			.css({
 				top: -349,
 				left: point.w + 20
 			})
 			.image('img/lamp.png')
 			.up()
 		.add('lamp-2')
 			.css({
 				top: -349,
 				left: page.beneficii - point.w / 2
 			})
 			.image('img/lamp.png')
 			.up()
 		.add('lamp-3')
 			.css({
 				top: -349,
 				left: page.premii - point.w
 			})
 			.image('img/lamp.png')
 			.up()
 		.add('lamp-4')
 			.css({
 				top: -349,
 				left: page.abonare
 			})
 			.image('img/lamp.png');

 	W('sidewalk').find('fixed')
 		.add('postal')
 			.css({
 				top: -83,
 				left: page.beneficii + 750,
 			})
 			.image('img/postal.png');

	/**
	 * Add seagulls.
	 */
	W().add('seagulls').before('fields').css({
		left: point.start + point.w,
		top: 100
	})
		.add('seagull-0').css({top: 10, left: 450, scale: 0.5})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14
	 		})
	 	.up()
		.add('seagull-1').css({left: 700})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14
	 		})
	 	.up()
	 	.add('seagull-2').css({ left: -100, scale: 0.7 })
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 700
	 		})
	 	.up()
		.add('seagull-3').css({top: 30, left: 320, scale: 0.8})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 1000
	 		})
	 	.up()
	 	.add('seagull-4').css({top: -50, left: 30, scale: 0.9 })
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 1000
	 		})
	 	.up()
	 	.add('seagull-5').css({top: 10, left: 2850, scale: 0.5})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14
	 		})
	 	.up()
		.add('seagull-6').css({left: 3200})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14
	 		})
	 	.up()
	 	.add('seagull-7').css({ left: 3930, scale: 0.7 })
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 700
	 		})
	 	.up()
		.add('seagull-8').css({top: 30, left: 4320, scale: 0.8})
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 1000
	 		})
	 	.up()
	 	.add('seagull-9').css({top: -50, left: 4670, scale: 0.9 })
			.sprite({
	 			url: 'img/seagull.png',
	 			width: 39,
	 			height: 49,
	 			interval: 40,
	 			sprites: 14,
	 			delay: 1000
	 		});

	/**
	 * Add the character.
	 */
	W().add('character').css({
		top: point.baseline - 175,
		left: page.start + 450
	}).before('car')
		.add('customer').image('img/customer.png')
		.up()
		.add('bubble').image('img/speechbubble.png').css({
			top: -35,
			left: 100,
			width: 0,
			height: 0
		});

	W('character').find('bubble').$().find('img').css({ width: '100%', height: '100%'});
	W().find('character').find('bubble').$().delay(1000).animate({ width: 143, height: 129 }, 1100, 'easeOutBack');
	
	W('sidewalk').add('character-end').css({
		top: -150,
		left: page.finish + 550,
		opacity: 0
	})
		.add('customer').image('img/customer.png')
		.up()
		.add('bubble').image('img/bubble-end.png').css({
			top: -30,
			left: 120,
			width: 0,
			height: 0
		});

 	/**
 	 * Add the trees.
 	 */
 	W('sidewalk').add('trees').before('signs').css({ top: -250 });
 	for (i = 0; i < (screens * point.w) / 350; i += 1) {
 		W('sidewalk').find('trees').add('tree-' + i).css({
 			left: point.start + point.w + i * (200 + Math.round(Math.random() * 400))
 		}).image('img/elem-tree.png');
 	}

/**
Scene setting.
===============================================================
*/
	/**
	 * Application settings.
	 */
	var settings = {
		fps: 25,
		interval: 1000 / 25,
		ie8: IsIE8Browser(),
		// The relative unit speed is based on (eg pixels / hour)
		second: 1000,
		// The gravitational pull is calculated in pixels / second^2
		gravity: 2,
		car: {
			// Calculate mass: 0.5 mass is half the gravity pull.
			mass: 0.3,
			restore: 0.5,
			// How much the car goes up or down depending on the speed or bumps.
			suspension: {
				// The amount of force pushing up.
				mass: 0.5,
				// Measured in PX
				height: 20,
				restore: 0.1
			},
			wheels: {
				top: 112,
				threshold: 10
			},
			width: 674,
			height: 252,
			screenOffset: 70,
			frontWheelOffset: 360,
			rearWheelOffset: 70,
			maxSpeed: 650,
			acceleration: 550,
			deacceleration: 1050,
			breaking: 3200
		},
		semaphores: {
			timeout: 2200,
			stopDistance: 200
		},
		bumpers: {
			distance: 80,
			surface: 123
		},
		stopSign: {
			distance: 100,
			timeout: 1500
		}
	};

	// For some reason ie8 works better with more fps :)
	if (true === settings.ie8) {
		settings.interval = 1000 / 30;
	}

	/**
	 * Global variables for syncronization.
	 */
	var global = {
		car: {
			mass: settings.car.mass,
			suspension: {
				left: {
					currentHeight: 0,
					mass: settings.car.suspension.mass
				},
				right: {
					currentHeight: 0,
					mass: settings.car.suspension.mass
				}
			},
			wheels: {
				left: {
					suspension: settings.car.wheels.top 
				},
				right: {
					suspension: settings.car.wheels.top
				}
			},
			speed: 0,
			accelerating: false,
			breaking: false,
			direction: 1,
			rotation: 0
		},
		started: false,
		finished: false,
		milage: 0,
		location: page.start + settings.car.screenOffset,
		wait: false,
		goingTo: 'start',
		goingTriggered: false
	};

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

	/**
	 * Define the user controls.
	 */
	function listenToKeypress(event) {
		$('body').one('keyup', listenToKeyup);

		if (39 === event.keyCode ) {
			startMovement(1);
		} else if (37 === event.keyCode) {
			startMovement(-1);
		}
	} 

	function startMovement(direction) {
		if (true === global.car.breaking) {
			return;
		}
		if (false === global.started) {
			animator.start('hideCharacter')
		}
		global.goingTriggered = false;

		global.car.accelerating = true;
		global.car.direction = direction;
		// Do animations for starting.
		if (-1 === global.car.direction) {
			global.car.direction = -1;
			global.car.mass = -1;
			global.car.suspension.left.mass = -0.5;
			global.car.suspension.right.mass = 2;
		} else {
			global.car.direction = 1;
			global.car.suspension.left.mass = 2;
			global.car.suspension.right.mass = -0.5;
			global.car.mass = -1;
		}
	}

	function listenToKeyup(event) {
		$('body').one('keydown', listenToKeypress);
		if (39 === event.keyCode || 37 === event.keyCode) {
			global.car.accelerating = false;
		}
	}

	function handleMouseEnter() {
		if ('arrow-left' === $(this).attr('id')) {
			startMovement(-1);
		} else if ('arrow-right' === $(this).attr('id')) {
			startMovement(1);
		}
		$(this).one('mouseleave', handleMouseLeave);
	}

	function handleMouseLeave() {
		global.car.accelerating = false;
		$(this).one('mouseenter', handleMouseEnter);
	}

	$('#arrow-left, #arrow-right').one('mouseenter', handleMouseEnter);
	$('body').one('keydown', listenToKeypress);

	/**
	 * Install the animation for the initial hidding of the character.
	 */
	animator.install('hideCharacter', function (lib) {
		var standingCharacter = {
				id: W('character').$().attr('id'),
				currentFade: 1,
				rate: 0.1
			},
			sittingCharacter = {
				id: W('car').find('car-body').find('character').$().attr('id'),
				currentFade: 0,
				rate: 0.2
			},
			lastCharacter = {
				id: W('sidewalk').find('character-end').$().attr('id'),
				currentFade: 0,
				rate: 0.1
			};

		lib.add(standingCharacter.id);
		lib.add(sittingCharacter.id);
		lib.add(lastCharacter.id);

		return function () {
			
			if (false === global.finished && true === global.started) {
				sittingCharacter.currentFade += sittingCharacter.rate;
				if (1 < sittingCharacter.currentFade) {
					sittingCharacter.currentFade = 1;
				}
				lastCharacter.currentFade -= lastCharacter.rate;
				if (0 > lastCharacter.currentFade) {
					lastCharacter.currentFade = 0;
				}
				if (1 === sittingCharacter.currentFade && 0 === lastCharacter.currentFade) {
					animator.stop('hideCharacter');
				}
			}

			if (false === global.started) {
				standingCharacter.currentFade -= standingCharacter.rate;
				if (0 > standingCharacter.currentFade) {
					standingCharacter.currentFade = 0;
				}

				sittingCharacter.currentFade += sittingCharacter.rate;
				if (1 < sittingCharacter.currentFade) {
					sittingCharacter.currentFade = 1;
				}
				if (0 === standingCharacter.currentFade && 1 === sittingCharacter.currentFade) {
					animator.stop('hideCharacter');
					global.started = true;
					animator.start('map');
				}
			}

			if (true === global.finished) {
				sittingCharacter.currentFade -= sittingCharacter.rate;
				if (0 > sittingCharacter.currentFade) {
					sittingCharacter.currentFade = 0;
				}
				lastCharacter.currentFade += lastCharacter.rate;
				if (1 < lastCharacter.currentFade) {
					lastCharacter.currentFade = 1;
				}
				if (0 === sittingCharacter.currentFade && 1 === lastCharacter.currentFade) {
					animator.stop('hideCharacter');
				}
			}

			lib.set(standingCharacter.id, {
				opacity: standingCharacter.currentFade
			});
			lib.set(sittingCharacter.id, {
				opacity: sittingCharacter.currentFade
			});
			lib.set(lastCharacter.id, {
				opacity: lastCharacter.currentFade
			});


			return lib.get();
		};
	});
	animator.stop('hideCharacter');

	/**
	 * Add wheels.
	 */
	animator.install('wheels', function (lib) {
		var leftWheel = W('car').find('left-wheel').$().attr('id'),
			rightWheel = W('car').find('right-wheel').$().attr('id'),
			angle = 0,
			wheel = {
				radius: 0,
				diameter: 0,
				circumference: 0,
				degreesToPixels: 0
			};

		lib.add(leftWheel);
		lib.add(rightWheel);

		// Calculate the wheel characteristics.
		wheel.diameter = lib.get(leftWheel)[0].$element.width();
		wheel.radius = wheel.diameter / 2;
		wheel.circumference = 2 * Math.PI * wheel.radius;
		wheel.degreesToPixels = wheel.circumference / 360;

		// Reset the wheels.
		lib.set(leftWheel, {
			rotate: 0,
			top: settings.car.wheels.top
		});
 
		function setSuspensionRetraction() {
			if (0 < global.car.rotation) {
				global.car.wheels.left.suspension = settings.car.wheels.top - Math.abs(global.car.rotation) * 10;
			} else if (0 > global.car.rotation) {
				global.car.wheels.right.suspension = settings.car.wheels.top - Math.abs(global.car.rotation) * 3;
			}
		}

		return function () {
			var leftRetraction = 0,
				rightRetraction = 0,
				sprite = 0;

			setSuspensionRetraction();

			// Calculate and normalize angle.
			angle += settings.interval * (global.car.speed / settings.second) / wheel.degreesToPixels;
			if (angle > 360) {
				angle = angle - 360 * Math.round(angle / 360);
			}
			angle = Math.round(angle * 1000) / 1000;

			if (true === settings.ie8) {
				sprite = 80 * Math.floor((angle - 72 * Math.floor(angle / 72)) / 12);
				lib.set(leftWheel, {
					backgroundPosition: '-' + sprite + 'px 0px',
					top: global.car.wheels.left.suspension
				});
				lib.set(rightWheel, {
					backgroundPosition: '-' + sprite + 'px 0px',
					top: global.car.wheels.right.suspension
				});
			} else {
				lib.set(leftWheel, {
					rotate: angle,
					top: global.car.wheels.left.suspension
				});
				lib.set(rightWheel, {
					rotate: angle,
					top: global.car.wheels.right.suspension
				});
			}

			return lib.get();
		};
	});

	/**
	 * Add car.
	 */
	animator.install('car', function (lib) {
		var car = W('car').find('car-body').$().attr('id');
		lib.add(car);

		// Default state
		W('car').$().css({
			left: point.start + settings.car.screenOffset
		});
		W('car').find('car-body').$().css({
			top: -settings.car.suspension.height,
			rotate: 0,
			transformOrigin: '50% 50%'
		});

		function setSuspensionHeight(side) {
			var suspension = global.car.suspension[side],
				height;

			height = (global.car.mass - suspension.mass * (suspension.currentHeight / settings.car.suspension.height)) * settings.gravity;
			global.car.suspension[side].currentHeight += height;

			if (settings.car.suspension.height < global.car.suspension[side].currentHeight) {
				global.car.suspension[side].currentHeight = settings.car.suspension.height;
			}

			if (-10 > global.car.suspension[side].currentHeight) {
				global.car.suspension[side].currentHeight = -10;
			}

			if (suspension.mass > settings.car.suspension.mass) {
				if (settings.car.suspension.restore < suspension.mass - settings.car.suspension.mass) {
					suspension.mass = settings.car.suspension.mass;
				} else {
					suspension.mass += settings.car.suspension.restore;
				}
			} else if (suspension.mass < settings.car.suspension.mass){
				global.car.suspension[side].mass += settings.car.suspension.restore;
			}

			return global.car.suspension[side].currentHeight;
		}

		function calculateSpeed() {
			if (true === global.car.accelerating && false === global.car.breaking) {
				if (Math.abs(global.car.speed) < settings.car.maxSpeed) {
					global.car.speed += (settings.car.acceleration / settings.second) * settings.interval * global.car.direction;
				}
			} else {
				if (true === global.car.breaking) {
					global.car.speed -= (settings.car.breaking / settings.second) * settings.interval * global.car.direction;
				} else {
					if (global.car.speed !== 0) {
						global.car.speed -= (settings.car.deacceleration / settings.second) * settings.interval * global.car.direction;
					}	
				}
				if (-1 === global.car.direction && global.car.speed > 0 ||
					1 === global.car.direction && global.car.speed < 0) {
					global.car.speed = 0;
				}
			}

			// Calculate boundries.
			if (signsPosition.stop > global.location && -1 === global.car.direction) {
				global.car.speed = 0;
			}

			if (page.finish < global.location && 1 === global.car.direction) {
				global.car.speed = 0;
				if (false === global.finished) {
					animator.start('hideCharacter');
				}
				global.finished = true;
			}

			if (page.finish >= global.location && -1 === global.car.direction) {
				animator.start('hideCharacter');
				global.finished = false;
			}
		}

		return function () {
			// Calculate 
			var left = Math.round(setSuspensionHeight('left')),
				right = Math.round(setSuspensionHeight('right')),
				degrees = 0;

			degrees = (Math.abs(left) - Math.abs(right)) / Math.PI;
			global.car.rotation = degrees;

			if (global.car.mass < settings.car.mass) {
				global.car.mass += settings.car.restore;
			} else if (global.car.mass > settings.car.mass) {
				global.car.mass -= settings.car.restore;
			}

			lib.set(car, {
				top: left < right ? right : left,
				rotate: degrees,
				transformOrigin: '50% 50%'
			});

			calculateSpeed();

			return lib.get();
		};
	});

	/**
	 * Install first banner animation.
	 */
	animator.install('start-banner', function (lib) {
		var banner = W('sidewalk').find('signs').find('sign-start').find('arrow').$().attr('id'),
			rotation = 0,
			remaining = 0,
			remainingIncrement = 1,
			timeout = 50,
			animate = false,
			increment = 5,
			target = 180,
			rotationType = 0;
		lib.add(banner);
		return function () {
			if (false === animate) {
				remaining += remainingIncrement;
			}
			if (remaining > timeout) {				
				remaining = 0;
				animate = true;
			}
			if (rotation > target && true === animate) {
				animate = false;
				if (0 === rotationType) {
					target += 170;
					rotationType = 1;
				} else {
					target += 190;
					rotationType = 0;
				}
			}
			if (true === animate) {
				rotation += increment;
				lib.set(banner, {
					rotate: rotation
				});
				return lib.get();
			} else {
				return [];
			}

		};
	});

// --> TODO: Create a variabile listener for the global.location.

	/**
	 * Install the post banner animation sign-beneficii-3
	 */
	animator.install('sign-beneficii-3', function (lib) {
		var $img = W('sidewalk').find('signs').find('sign-beneficii-3').find('drape').$().find('img'),
			currentTop = 0,
			topIncrement = 10,
			targetTop = -457;
		$img.attr('id', 'postImg').css({
			position: 'absolute',
			top: 0,
			left: 0
		});

		lib.add('postImg');
		return function () {
			if (signsPosition.beneficii_3 - settings.car.width - 300< global.location) {
				currentTop -= topIncrement;
				if (currentTop < targetTop) {
					currentTop = targetTop;
					animator.stop('sign-beneficii-3');
				}
				lib.set('postImg', {
					top: currentTop
				});
				return lib.get();
			}
			return [];
		};
	});
	
	/**
	 * Install sign-beneficii-1
	 */
	animator.install('post-beneficii-1', function (lib) {
		var i,
			banner = W('sidewalk').find('signs').find('sign-beneficii-1').$().attr('id'),
			text = W('sidewalk').find('signs').find('sign-beneficii-1').find('text-1').$().attr('id'),
			currentTop = 0,
			targetTop = -315,
			topIncrement = 10,
			starsCount = 4,
			stars = [],
			textIncrement = 7,
			textTargetTop = 0,
			textCurrent = 53,
			textDirection = -1,
			textInitial = 54,
			stopText = false,
			startText = false;

		for (i = 1; i <= starsCount; i += 1) {
			stars[i] = {
				element: W('sidewalk').find('signs').find('sign-beneficii-1').find('star-' + i).$().attr('id'),
				currentRotation: 0,
				increment: i * 5
			};
			lib.add(stars[i].element);
		}
		lib.add(banner);
		lib.add(text);
		return function () {
			if (signsPosition.beneficii_1 - settings.car.width - settings.semaphores.stopDistance < global.location) {
				for (i = 1; i <= starsCount; i += 1) {
					stars[i].currentRotation += stars[i].increment;
					lib.set(stars[i].element, {
						rotate: stars[i].currentRotation
					});
				}

				if (true === startText && false === stopText) {
					textCurrent += textDirection * textIncrement;
					if (textCurrent < textTargetTop) {
						textDirection = 1;
					}
					if (textCurrent > textInitial) {
						stopText = true;
						textCurrent = textInitial;
					}
					lib.set(text, {
						top: textCurrent
					});
				}

				currentTop -= topIncrement;
				if (currentTop < targetTop) {
					currentTop = targetTop;
				}
				if (currentTop < targetTop + 40) {
					startText = true;
				}
				lib.set(banner, {
					top: currentTop
				});
				return lib.get();
			}
			return [];
		};
	});

	/**
	 * Install beneficii 2.
	 */
	animator.install('post-beneficii-2', function (lib) {
		var i,
			items = [],
			initialBottom = 1200,
			itemCount = 9,
			text;

		for (i = 1; i <= itemCount; i += 1) {
			items[i] = {
				element: W('sidewalk').find('signs').find('sign-beneficii-2').find('items').find('item-' + i).$().attr('id'),
				currentBottom: initialBottom,
				left: 0,
				targetBottom: 0,
				increment: 10,
				finished: false
			};
			$('#' + items[i].element).css({
				top: 'auto',
				bottom: initialBottom
			});
			lib.add(items[i].element);
		}

		// Setup cabbage.
		items[1].targetBottom = -96;
		items[1].increment = 120;

		// Setup bottle.
		items[2].targetBottom = -38;
		items[2].increment = 120;

		// Setup sallami.
		items[3].targetBottom = -64;
		items[3].increment = 90;

		// Setup tomatoes.
		items[4].targetBottom = -37;
		items[4].increment = 80;

		// Setup yogurt.
		items[5].targetBottom = -15;
		items[5].increment = 50;

		// Setup butter.
		items[6].targetBottom = -24;
		items[6].increment = 40;

		// Setup ardei.
		items[7].targetBottom = 159;
		items[7].increment = 30;

		// Setup small orange.
		items[8].targetBottom = 160;
		items[8].increment = 50;

		// Setup big orange.
		items[9].targetBottom = 120;
		items[9].increment = 70;

		text = {
			element: W('sidewalk').find('signs').find('sign-beneficii-2').find('text').$().attr('id'),
			currentBottom: initialBottom,
			targetBottom: 66,
			increment: 80
		};
		$('#' + text.element).css({
			top: 'auto',
			bottom: initialBottom
		});
		lib.add(text.element);

		return function () {
			var i,
				animatingItems = false;
			if (signsPosition.beneficii_2 - settings.car.width - 500 < global.location) {
				for (i = 1; i < itemCount; i += 1) {
					if (true === items[i].finished) {
						continue;
					}
					animatingItems = true;
					items[i].currentBottom -= items[i].increment;
					if (items[i].currentBottom < items[i].targetBottom) {
						items[i].currentBottom = items[i].targetBottom;
						items[i].finished = true;
					}
					lib.set(items[i].element, {
						bottom: items[i].currentBottom
					});
				}
				if (false === animatingItems) {
					text.currentBottom -= text.increment;
					if (text.currentBottom < text.targetBottom) {
						text.currentBottom = text.targetBottom;
						animator.stop('post-beneficii-2');
					}
					lib.set(text.element, {
						bottom: text.currentBottom
					});
				}
				return lib.get();
			}
			return [];
		};
	});

	/**
	 * Install premii-1.
	 */
	animator.install('sign-premii-1', function (lib) {
		var start = signsPosition.premii_1 - settings.car.width - 100,
			body = {
				element: W('sidewalk').find('signs').find('sign-premii-1').find('overlay').find('body').$().attr('id'),
				currentLeft: -70,
				targetLeft: 300,
				increment: 30
			},
			taillight = {
				element: W('sidewalk').find('signs').find('sign-premii-1').find('overlay').find('taillight').$().attr('id'),
				currentLeft: 454,
				currentOpacity: 0,
				targetLeft: 300,
				opacityIncrement: 0.2,
				direction: 1
			},
			car = {
				element: W('sidewalk').find('signs').find('sign-premii-1').find('overlay').find('car').$().attr('id'),
				currentLeft: 0,
				targetLeft: 0
			},
			parallax = {
				end: 300
			},
			highlightsFlared = false,
			flareTimes = 4,
			flared = 0,
			moveCar = false;

		car.targetLeft = W('sidewalk').find('signs').find('sign-premii-1').find('overlay').find('car').$().position().left;
		car.currentLeft = car.targetLeft;

		lib.add(body.element);
		lib.add(taillight.element);

		// Parallax effect for elements.
		lib.add(car.element);

		return function () {
			var currentPosition = 0;

			if (start < global.location) {

				// Lights.
				if (false === highlightsFlared) {
					if (flareTimes < flared) {
						highlightsFlared = true;
						moveCar = true;
					}

					taillight.currentOpacity += taillight.direction * taillight.opacityIncrement;
					if (0 > taillight.currentOpacity) {
						taillight.direction = 1;
						taillight.currentOpacity = 0;
						flared += 1;
					} else if (1 < taillight.currentOpacity) {
						taillight.currentOpacity = 1;
						taillight.direction = -1;
						flared += 1;
					}

					lib.set(taillight.element, {
						opacity: taillight.currentOpacity
					});
				}

				// Move car
				if (true === moveCar) {
					body.currentLeft -= body.increment;
					lib.set(body.element, {
						left: body.currentLeft
					});
					taillight.currentLeft -= body.increment;
					lib.set(taillight.element, {
						left: taillight.currentLeft
					});
				}

				// Define the end point for the parallax.
				if (parallax.end + signsPosition.premii_1 > global.location) {
					currentPosition = parallax.end / (global.location - start);
					if (1 < currentPosition) {
						currentPosition = 1;
					}

					car.currentLeft = car.targetLeft - car.targetLeft * (1 - currentPosition);
					lib.set(car.element, {
						left: car.currentLeft
					});
				}

				return lib.get();
			}
			return [];
		};
	});

	/**
	 * Install premii-2
	 */
	animator.install('post-premii-2', function (lib) {
		var i,
			j,
			arrows = {},
			arrow = 1,
			matrixIncrementLeft = 100,
			matrixIncrementTop = 35,
			directionRotation = {
				top: 270,
				left: 180,
				bottom: 90,
				right: 0
			},
			queued = [],
			animatingIncrement = 55,
			rotationIncrement = 35,
			distance = Math.round(Math.sqrt(arrowsCount)),
			boundriesMin = -200,
			boundriesMax = 500,
			staticArrows = [{
					element: W('sidewalk').find('signs').find('sign-premii-2').find('overlay').find('arrow-static-1').$().attr('id'),
					currentLeft: 450,
					targetLeft: 194,
					animating: false,
					finished: false
				},
				{
					element: W('sidewalk').find('signs').find('sign-premii-2').find('overlay').find('arrow-static-2').$().attr('id'),
					currentLeft: 450,
					animating: false,
					targetLeft: 270,
					finished: false
				},
				{
					element: W('sidewalk').find('signs').find('sign-premii-2').find('overlay').find('arrow-static-3').$().attr('id'),
					currentLeft: 450,
					animating: false,
					targetLeft: 346,
					finished: false
				}],
			staticIncrement = 10,
			staticAnimating = false,
			staticAnimated = false,
			finishedStatic = 0;

		for (i = 0; i < distance; i += 1) {
			for (j = 0; j < distance; j += 1) {
				arrows[arrow] = {
					$: W('sidewalk').find('signs').find('sign-premii-2').find('overlay').find('arrow-' + arrow).$()		
				};
				arrows[arrow].element = arrows[arrow].$.attr('id');
				arrows[arrow].current = {
					left: i * matrixIncrementLeft,
					top: j * matrixIncrementTop,
					rotation: 0
				};
				arrows[arrow].animating = false;
				arrows[arrow].rotated = false;
				arrows[arrow].axisXY = Math.random() > 0.5 ? 'left' : 'top';
				arrows[arrow].axisDirection = Math.random() > 0.5 ? -1 : 1;
				arrows[arrow].rotation = arrows[arrow].axisXY;
				if (-1 === arrows[arrow].axisDirection) {
					if ('left' === arrows[arrow].rotation) {
						arrows[arrow].rotation = 'right';
					} else if ('top' === arrows[arrow].rotation) {
						arrows[arrow].rotation = 'bottom';
					}
				}

				arrows[arrow].$.css({
					top: arrows[arrow].current.top,
					left: arrows[arrow].current.left,
					transformOrigin: '35px 32px',
				});
				lib.add(arrows[arrow].element);
				queued.push(arrow);
				arrow += 1;
			}
		}

		lib.add(staticArrows[0].element);
		lib.add(staticArrows[1].element);
		lib.add(staticArrows[2].element);
		return function () {
			var i,
				index,
				animatedElements = false,
				animatedStatic = false;

			if (signsPosition.premii_2 - settings.car.width - 100 < global.location) {

				if (0 !== queued.length) {
					index = Math.round(Math.random() * (queued.length - 1));
					arrows[queued[index]].animating = true;
					delete queued[index];
					queued.sort();
					queued.pop();
				}

				for (i = 1; i <= arrowsCount; i += 1) {
					if (true === arrows[i].animating && 
						((boundriesMin < arrows[i].current.left && boundriesMax > arrows[i].current.left && 'left' === arrows[i].axisXY) ||
						(boundriesMin < arrows[i].current.top && boundriesMax > arrows[i].current.top) && 'top' === arrows[i].axisXY)
					) {
						animatedElements = true;
						if (directionRotation[arrows[i].rotation]  <= arrows[i].current.rotation) {
							arrows[i].rotated = true;
						}
						// rotate: directionRotation[arrows[arrow].direction]
						if (false === arrows[i].rotated) {
							arrows[i].current.rotation += rotationIncrement;
						} else {
							arrows[i].current[arrows[i].axisXY] += arrows[i].axisDirection * animatingIncrement;
						}
						lib.set(arrows[i].element, {
							top: arrows[i].current.top,
							left: arrows[i].current.left,
							rotate: arrows[i].current.rotation
						});
					}
				}

				if (true === staticAnimating) {
					for (i = 0; i < 3; i += 1) {
						if (false === staticArrows[i].animating) {
							staticArrows[i].animating = true;
							continue;
						}
						if (true === staticArrows[i].finished) {
							continue;
						}
						animatedStatic = true;
						staticArrows[i].currentLeft -= staticIncrement;
						if (staticArrows[i].currentLeft < staticArrows[i].targetLeft) {
							staticArrows[i].currentLeft = staticArrows[i].targetLeft;
							staticArrows[i].finished = true;
							finishedStatic += 1;
						}
						lib.set(staticArrows[i].element, {
							left: staticArrows[i].currentLeft
						});
					}
				}

				if (staticArrows.length === finishedStatic) {
					animator.stop('post-premii-2');
				}

				if (false === animatedElements && 0 === queued.length) {
					staticAnimating = true;
				}

				return lib.get();
			}

			return [];
		};
	});
	

	animator.install('post-premii-3', function (lib) {
		var i,
			increment = 72,
			timeout = 15,
			currentTime = 0,
			timeIncrement = 1,
			numbers = [{
				element: W('sidewalk').find('signs').find('sign-premii-3').find('number-1').$().attr('id'),
				animating: true,
				finishedPosition: -144,
				currentPosition: increment * 3
			}, {
				element: W('sidewalk').find('signs').find('sign-premii-3').find('number-2').$().attr('id'),
				animating: true,
				finishedPosition: 0,
				currentPosition: increment * 5
			}, {
				element: W('sidewalk').find('signs').find('sign-premii-3').find('number-3').$().attr('id'),
				animating: true,
				finishedPosition: 0,
				currentPosition: increment * 10
			} /*, {
				element: W('sidewalk').find('signs').find('sign-premii-3').find('number-4').$().attr('id'),
				animating: true,
				finishedPosition: 0,
				currentPosition: increment * 5
			} */
		];
		lib.add(numbers[0].element);
		lib.add(numbers[1].element);
		lib.add(numbers[2].element);
		// lib.add(numbers[3].element);
		return function () {
			var i;
			if (signsPosition.premii_3 - settings.car.width - 100 < global.location) {
				currentTime += timeIncrement;
				if (timeout < currentTime) {
					for (i = 0; i < numbers.length; i += 1) {
						if (true === numbers[i].animating) {
							numbers[i].animating = false;
							lib.set(numbers[i].element, {
								backgroundPosition: '0 ' + numbers[i].finishedPosition + 'px'
							});
							break;
						}
					}
					currentTime = 0;
				}

				for (i = 0; i < numbers.length; i += 1) {
					if (true === numbers[i].animating) {
						numbers[i].currentPosition += increment;
						lib.set(numbers[i].element, {
							backgroundPosition: '0 -' + numbers[i].currentPosition + 'px'
						});
					}
				}
				return lib.get();
			}
			return [];
		};
	});

	/**
	 * Install mail.
	 */
	animator.install('mail', function (lib) {
		var shown = false;
		return function () {
			if (page.abonare - settings.car.width / 2 < global.location) {
				if (false === shown) {
					$('#mail-container').show();
					shown = true;
				}
			} else if (true === shown) {
				shown = false;
				$('#mail-container').hide();
			}
			return [];
		};
	});

	/**
	 * Install map.
	 */
	animator.install('map', function (lib) {
		var current = '',
			last = '';
		lib.add('nav-start');
		lib.add('nav-beneficii');
		lib.add('nav-premii');
		lib.add('nav-abonare');
		lib.add('nav-finish');

		return function () {

			if (page.beneficii > global.location) {
				current = 'start';
			}
			if (page.premii > global.location && page.beneficii - settings.car.width <= global.location) {
				current = 'beneficii';
			}
			if (page.abonare > global.location && page.premii - settings.car.width <= global.location) {
				current = 'premii';
			}
			if (page.finish > global.location && page.abonare - settings.car.width <= global.location) {
				current = 'abonare';
			}
			if (page.abonare < global.location) {
				current = 'finish';
			}

			if (last !== current) {
				lib.set('nav-' + current, {
					  background: 'url(../img/pin-blue.png) no-repeat'
				});
				if ('' !== last) {
					lib.set('nav-' + last, {
						background: 'url(../img/pin-yellow.png) no-repeat'
					});
				}
				last = current;
				return lib.get();
			} else {
				return [];
			}
		};
	});
	animator.stop('map');


	/**
	 * Listener for map actions.

	animator.install('map-listener', function (lib) {

		return function () {
			if (true === global.goingTriggered) {
				if ((-1 === global.direction && page[global.goingTo] > global.location) ||
					(1 === global.direction && page[global.goingTo] < global.location)) {
					global.car.accelerating = false;
				}
			}
			return [];
		}
	});
		 */
	/**
	 * Install the bumper behaviour.
	 */
	animator.install('bumper-behaviour', function (lib) {
		var collisionIssued = {
			left: false,
			right: false,
			on: -1
		};

		function triggerCollision(side) {
			if (true === collisionIssued[side]) {
				return;
			}
			collisionIssued[side] = true;
			global.car.suspension[side].mass = 7;
			global.car.mass = 0;
			global.car.speed -= global.car.speed * 0.3;

			if ('left' === side) {
				global.car.suspension.right.mass = 0.5;
			} else {
				global.car.suspension.left.mass = 0.5;
			}
		}

		function detectCollision(side, location, bumper) {
			var reference = roadBumps[bumper];
			if (global.car.direction === -1) {
				reference += settings.bumpers.surface;
			} else {
				reference += settings.bumpers.distance
			}
			if (roadBumps[bumper] < location && location < reference) {
				triggerCollision(side);
				collisionIssued.on = bumper;
			}
		}

		function detectPassing(side, location, bumper) {
			var reference = roadBumps[bumper];
			if (global.car.direction === -1) {
				reference += settings.bumpers.surface;
			} else {
				reference += settings.bumpers.distance
			}
			if (roadBumps[bumper] > location || location > reference) {
				collisionIssued[side] = false;
				collisionIssued.on = -1;
			}
		}

		return function () {
			var i,
				leftWheel = global.location + settings.car.rearWheelOffset,
				rightWheel = global.location + settings.car.frontWheelOffset;

			for (i = 0; i < roadBumps.length; i += 1) {
				detectCollision('left', rightWheel, i);
				detectCollision('right', leftWheel, i);
				if (collisionIssued.on === i) {
					detectPassing('right', rightWheel, i);
					detectPassing('left', leftWheel, i);
				}
			}

			return [];
		};
	});

	/**
	 * Install semaphores behaviour.
	 */
	animator.install('semaphore-behaviour', function (lib) {
		var i,
			semaphoreStarted = false;
		for (i = 0; i < semaphores.length; i += 1) {
			semaphores[i][2] = W('sidewalk').find('fixed').find('semaphores').find('semaphore-' + i).$();
		}

		function startSemaphore(i) {
			global.car.breaking = true;
			setTimeout(function () {
				semaphores[i][2].css('background-position', '-110px 0');
			}, settings.semaphores.timeout);
			semaphores[i][1] = true;
			setTimeout(function () {
				semaphores[i][2].css('background-position', '-220px 0');
				global.car.breaking = false;
				semaphores[i][1] = true;
			}, settings.semaphores.timeout * 2);
		}
		return function () {
			var i,
				referencePoint = global.location + settings.car.frontWheelOffset + settings.semaphores.stopDistance;
			for (i = 0; i < semaphores.length; i += 1) {
				if (referencePoint > semaphores[i][0] && semaphores[i][1] === false) {
					startSemaphore(i);
				}
			}
			return [];
		};
	});

	/**
	 * Install the stop behaviour.
	 */
	animator.install('stop-sign', function (lib) {

		function stopCar(id) {
			stopSigns[id][1] = true;
			global.car.breaking = true;
			setTimeout(function () { 
				global.car.breaking = false;
			}, settings.stopSign.timeout);
		}

		return function () {
			var i,
				referencePoint = global.location + settings.car.frontWheelOffset + settings.stopSign.distance;
			for (i = 0; i < stopSigns.length; i += 1) {
				if (referencePoint > stopSigns[i][0] && 1 === global.car.direction && false === stopSigns[i][1]) {
					stopCar(i);
				}
			}
			return [];
		};
	});

	/**
	 * Add environment.
	 */
	animator.install('environment', function (lib) {
		var i,
			elements = [
				[W('background').$().attr('id'), 0.01, parseFloat(W('background').$().css('left'), 10)],
				[W('clouds-far').$().attr('id'), 0.2, parseFloat(W('clouds-far').$().css('left'), 10)],
				[W('clouds-near').$().attr('id'), 0.3, parseFloat(W('clouds-near').$().css('left'), 10)],
				[W('foreground').$().attr('id'), 0.3, parseFloat(W('foreground').$().css('left'), 10)],
				[W('baloon').$().attr('id'), 0.5, parseFloat(W('baloon').$().css('left'), 10)],
				[W('airplane').$().attr('id'), 0.6, parseFloat(W('airplane').$().css('left'), 10)],
				[W('fields').$().attr('id'), 0.7, parseFloat(W('fields').$().css('left'), 10)],
				[W('seagulls').$().attr('id'), 0.6, parseFloat(W('seagulls').$().css('left'), 10)],
				[W('character').$().attr('id'), 1, parseFloat(W('character').$().css('left'), 10)],
				[W('sidewalk').find('trees').$().attr('id'), 1, 0],
				[W('sidewalk').find('fixed').$().attr('id'), 1, 0],
				[W('sidewalk').find('signs').$().attr('id'), 1, 0],
				[W('sidewalk').find('character-end').$().attr('id'), 1, parseFloat(W('sidewalk').find('character-end').$().css('left'))]
			],
			road = [W('sidewalk').find('road').$().attr('id'), 0],
			fence = [W('sidewalk').find('fence').$().attr('id'), 0];

		for (i = 0; i < elements.length; i += 1) {
			lib.add(elements[i][0]);
		}

		lib.add(road[0]);
		lib.add(fence[0]);

		return function () {
			var i,
				i_len,
				travel = (global.car.speed / settings.second) * settings.interval;
			for (i = 0, i_len = elements.length; i < i_len; i += 1) {
				elements[i][2] -= travel * elements[i][1];
				lib.set(elements[i][0], {
					left: elements[i][2]
				});
			}

			road[1] -= travel;
			lib.set(road[0], {
				'background-position': road[1] + 'px 0px'
			});

			fence[1] -= travel;
			lib.set(fence[0], {
				'background-position': fence[1] + 'px 0px'
			});

			global.milage += Math.abs(travel);
			global.location += travel;

			return lib.get();
		};
	});

	/**
	 * Install airplane.
	 */
	animator.install('airplane', function (lib) {
		var airplane = W('airplane').find('airplane-body').$().attr('id'),
			speed = 90,
			location = page.start;
		lib.add(airplane);

		return function () {
			location += (speed / settings.second) * settings.interval;
			if (page.finish < location) {
				location = 0;
			}
			lib.set(airplane, {
				left: location
			});
			return lib.get();
		};
	});

	/**
	 * Install seagulls.
	 */
	animator.install('seagulls', function (lib) {
		var i,
			seagulls = [
				[W('seagulls').find('seagull-0').$().attr('id'), 100], 
				[W('seagulls').find('seagull-1').$().attr('id'), 100], 
				[W('seagulls').find('seagull-2').$().attr('id'), 100],
				[W('seagulls').find('seagull-3').$().attr('id'), 150], 
				[W('seagulls').find('seagull-4').$().attr('id'), 50], 
				[W('seagulls').find('seagull-5').$().attr('id'), 150],
				[W('seagulls').find('seagull-6').$().attr('id'), 70], 
				[W('seagulls').find('seagull-7').$().attr('id'), 100], 
				[W('seagulls').find('seagull-8').$().attr('id'), 100],
				[W('seagulls').find('seagull-9').$().attr('id'), 100]
			];

		for (i = 0; i < seagulls.length; i += 1) {
			lib.add(seagulls[i][0]);
			seagulls[i][2] = $('#' + seagulls[i][0]).position().left;
			lib.set(seagulls[i][0], {
				left: seagulls[i][2]
			});
		}

		return function() {
			var i,
				i_len;
			for (i = 0, i_len = seagulls.length; i < i_len; i += 1) {
				seagulls[i][2] -= (seagulls[i][1] / settings.second) * settings.interval;
				if (seagulls[i][2] < 0) {
					seagulls[i][2] = page.finish + point.w;
				}
				lib.set(seagulls[i][0], {
					left: seagulls[i][2]
				});
			}
			return lib.get();
		};
	});

	/**
	 * Install baloons.
	 */
	animator.install('baloons', function (lib) {
		var i, 
			baloons = [
				[W('baloon').find('baloon-body-1').$().attr('id'), 30], 
				[W('baloon').find('baloon-body-2').$().attr('id'), 30],
				[W('baloon').find('baloon-body-3').$().attr('id'), 20],
				[W('baloon').find('baloon-body-4').$().attr('id'), 50]
			],
			variation = {
				rotation: {
					speed: 5,
					direction: 1,
					max: 7,
					target: 10
				},
				vertical: {
					speed: 10,
					direction: 1,
					max: 30
				}				
			}


		for (i = 0; i < baloons.length; i += 1) {
			lib.add(baloons[i][0]);
			baloons[i][2] = $('#' + baloons[i][0]).position().left;
			
			// Rotation variation.
			baloons[i][3] = {
				current: 0,
				initial: 0,
				target: Math.random() * variation.rotation.max,
				direction: Math.random() > 0.5 ? -1 : 1
			};

			// Vertical variation.
			baloons[i][5] = {
				current: $('#' + baloons[i][0]).position().top,
				direction: Math.random() > 0.5 ? -1 : 1,
				initial: $('#' + baloons[i][0]).position().top
			};
			baloons[i][5].target = baloons[i][5].current + Math.random() * variation.vertical.max * baloons[i][5].direction;

			lib.set(baloons[i][0], {
				top: baloons[i][4],
				left: baloons[i][2]
			});
		}

		return function () {
			var i,
				i_len;
			for (i = 0, i_len = baloons.length; i < i_len; i += 1) {
				baloons[i][2] += (baloons[i][1] / settings.second) * settings.interval;

				// Rotation variation.
				baloons[i][3].current += baloons[i][3].direction * (variation.rotation.speed / settings.second) * settings.interval;
				if (baloons[i][3].target < Math.abs(baloons[i][3].current)) {
					baloons[i][3].direction = Math.random() > 0.5 ? -1 : 1;
					baloons[i][3].target = Math.random() * variation.rotation.max;
				}

				// Top variation.
				baloons[i][5].current += baloons[i][5].direction * (variation.vertical.speed / settings.second) * settings.interval;
				if (baloons[i][5].target < baloons[i][5].current) {
					baloons[i][5].direction = Math.random() > 0.5 ? -1 : 1;
					baloons[i][5].target = baloons[i][5].initial + baloons[i][5].direction * Math.random() * variation.vertical.max;
				}

				lib.set(baloons[i][0], {
					top: baloons[i][5].current,
					left: baloons[i][2],
					rotate: baloons[i][3].current,
					transformOrigin: '50% 50%'
				});
			}
			return lib.get();
		};
	});

	$('#inchide').bind('click', function () { 
		$('#mail-container').hide();
	});

	/**
	 * Install clouds.
	 */
	animator.install('clouds', function (lib) {
		var cloudsNear = {
				element: W('clouds-near').find('clouds-body').$().attr('id'),
				speed: 50,
				current: 0
			},
			cloudsFar = {
				element: W('clouds-far').find('clouds-body').$().attr('id'),
				speed: 20,
				current: 0
			};

		lib.add(cloudsNear.element);
		lib.add(cloudsFar.element);
		return function () {
			cloudsNear.current += (cloudsNear.speed / settings.second) * settings.interval;
			if (page.finish + point.w < cloudsNear.current) {
				cloudsNear.current = 0;
			}
			lib.set(cloudsNear.element, {
				left: cloudsNear.current
			});

			cloudsFar.current += (cloudsFar.speed / settings.second) * settings.interval;
			if (page.finish + point.w < cloudsFar.current) {
				cloudsFar.current = 0;
			}
			lib.set(cloudsFar.element, {
				left: cloudsFar.current
			});
			return lib.get();
		};
	});

	/**
	 * Install windmills.
	 */
	animator.install('windmills', function (lib) {
		var speed = 50,
			winds = [];
		// Animate the windmill.
		for (i = 0; i < windmills.length; i += 1) {
			winds.push({
				element: windmills[i].$().attr('id'),
				speed: 40,
				current: 0
			});
			lib.add(windmills[i].$().attr('id'));
		}

		return function () {
			var i;
			for (i = 0; i < winds.length; i += 1) {
				winds[i].current += (winds[i].speed / settings.second) * settings.interval;
				lib.set(winds[i].element, {
					rotate: winds[i].current,
					transformOrigin: '50% 50%'
				});
			}
			return lib.get();
		};
	});

/**
 * General Site Functionality.
 * ================================================
 */


	// Set the map on the bottom.
	$('#nav').css({
		display: 'block',
		bottom: (point.baseline - 160) / 2  - 280
	});

	$('#nav li').bind('click', function (event) {
		/*
		global.goingTo = $(this).attr('id').replace('nav-', '');
		global.goingTriggered = true;
		console.log(page[global.goingTo] + ' vs ' + (global.location));
		if (page[global.goingTo] < global.location) {
			global.direction = -1;
		} else {
			global.direction = 1;
		}
		global.car.accelerating = true;
		*/
	});

	$('#menu div').bind('hover', function () { 
		$(this).addClass('active');
	});
	$('#menu div').bind('mouseout', function () { 
		$(this).removeClass('active');
	});

	$('#menu div').bind('click', function () { 
		if (false === $('#pages').hasClass('active')) {
			$('#pages').fadeIn();
		}

		$(this).parent().find('.active').removeClass('activated');
		$(this).addClass('activated');
		$('#pages .active').fadeOut();
		$('#pages-content-inner').fadeIn();
		$('#pages #' + $(this).attr('id').replace('menu-', '')).fadeIn().addClass('active');
	});

	$('#overlay, #close-button').bind('click', function () { 
		$('#pages').fadeOut();
	});

	$('#recomanda input').bind('focus', function () { 
		$('#recomanda-text').fadeOut();
	});

	$('#recomanda input').bind('blur', function () { 
		if ('' === $(this).val()) {
			$('#recomanda-text').fadeIn();
		}
	});

	function validateEmail(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	} 

	$('#recomanda-button').bind('click', function () { 
		var email = $('#recomanda input').val();
		if (true === validateEmail(email)) {
			$.ajax({
				url: 'sendmail.php',
				data: {
					email: email
				},
				success: function (data) {
					$('#recomanda input').val('').trigger('blur');
				}
			});
		}
	});

});