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


