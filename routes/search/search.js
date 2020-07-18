const axios = require('axios')
const constants = require('../../constants')

module.exports = function (fastify, opts, done) {

	const django_ip = fastify.django_ip
	
	fastify.post('/search', async(req, res) => {

		let first_search = req.body.first_search

		let player_obj = {
			player_name:  req.body.player_name,
			game_mode: req.body.game_mode,
			perspective: req.body.perspective,
			platform: req.body.platform
		}

		let api_response = await axios.post(`http://${django_ip}:8000/api/search`, player_obj)

		if(api_response.status == 200){

			let error = api_response.data.error
			let player_id = api_response.data.player_id
			let currently_processing = api_response.data.currently_processing
			let no_new_matches = api_response.data.no_new_matches
			let message = api_response.data.message

			let redirect = `/user/${player_obj.player_name}/platform/${player_obj.platform}/`

			let messages = []

			if(currently_processing){
				messages.push({
					text: 'Matches are currently processing for this user...'
				})
			}
			if(no_new_matches){
				messages.push({
					text: 'We have found no new matches for this user...'
				})
			}
			if(message){
				messages.push({
					text: message
				})
			}
			if(error){
				messages = []
				messages.push({
					text: error
				})
			}

			if(error){
				return res.view('search.html', {
					player_name: api_response.data.player_name,
					platform: player_obj.platform,
					messages: messages,
					platform_selections: constants.PLATFORM_SELECTIONS,
					gamemode_selections: constants.GAMEMODE_SELECTIONS,
					perspective_selections: constants.PERSPECTIVE_SELECTIONS,
					base_address: fastify.base_address,
				}) 
			} else {

				if(typeof first_search !== 'undefined'){
					let new_obj = {
						perspective: req.body.perspective,
						platform: req.body.platform
					}
					return res.redirect(redirect, new_obj)
				} else {
					return res.send({
						player_id: player_id,
						player_name: api_response.data.player_name,
						currently_processing: currently_processing,
						no_new_matches: no_new_matches,
						message: message,
						error: error
					})
				}
			}
		} else { 
			console.error(api_response)
		}
	})

	done()
}