const constants = require('../../constants')
const axios = require('axios')

module.exports = function (fastify, opts, done) {

	fastify.get('/', async(req, res) => {
		return res.view('index.html', {
			platform_selections: constants.PLATFORM_SELECTIONS,
			gamemode_selections: constants.GAMEMODE_SELECTIONS,
			perspective_selections: constants.PERSPECTIVE_SELECTIONS,
			base_address: fastify.base_address
		}) 
	})

	done()
  }