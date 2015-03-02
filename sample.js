


/** 
 * Setup the scene
 */
W()
	.add('scene').css({
		top: 10
		, left: 10
		, width: 1200
		, height: 500
		, background: '#1b8ac5'
	})
		.add('sea').image('sea.png').css({
			top: 200
			, left: 0
		})
			.add('wave').image('wave.png').css({
				top: 43
				, left: 20
			})
			.up()
		.up()
	.add('surfer').image('surfer.png').css({
		top: 50
		, left: 50
	})


animator.install('surfing', function (lib) {
	var $wave = W('scene').find('sea').find('wave').$()
		, $surfer = W('scene').find('surfer').$()
		, left = 0
		, direction = 1

	lib.add($wave.attr('id'))
	lib.add($surfer.attr('id'))

	return function () {
		
		if (1200 - $wave.width() < left) {
			direction = -1
		} else if (0 > left) {
			direction = 1
		}

		left += 5 * direction

		lib.set($wave.attr('id'), {
			left: left
		})

		lib.set($surfer.attr('id'), {
			left: left
		})

		return lib.get()
	}
})

animator.install('surferAction', function (lib) {
	var $surfer = W('scene').find('surfer').$()
		, top = 0
		, direction = -1
		, surferOrientation

	lib.add($surfer.attr('id'))

	return function () {

		if (300 < top) {
			direction = -1
		} else if (50 > top) {
			direction = 1
		}

		if (1 === direction) {
			surferOrientation = 'rotateY(180deg)'
		} else {
			surferOrientation = 'rotateY(0)'
		}

		top += 5 * direction

		lib.set($surfer.attr('id'), {
			top: top
			, transform: surferOrientation
		})

		return lib.get()
	}
})

animator.install('parallax', function (lib) {
	var mouseX = 0
		, mouseY = 0
		, $scene = W('scene').$()
		, $sea = W('scene').find('sea').$()

	$('body').on('mousemove', function (event) {
		mouseX = event.pageX
		mouseY = event.pageY
	})

	lib.add($scene.attr('id'))
	lib.add($sea.attr('id'))

	return function () {

		lib.set($scene.attr('id'), {
			top: mouseY * 0.1
			, left: mouseX * 0.1
		})

		lib.set($sea.attr('id'), {
			top: mouseY * 0.2
			, left: mouseX * 0.2
		})

		return lib.get()
	}
})



