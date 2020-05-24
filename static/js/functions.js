'use strict';
var table; 

$(document).ready(function() {

	var app = {	
		table_rosters: {},
		season_requested: false,
		times_requested: 0,
		seen_match_ids: [],
		down: false,
		tries: 0,
		no_matches: false,
		retrieved: false,

		serialiseForm: function(){
			return $('#search_form').serialize();
		},
		getPlayerName: function(){
			return document.getElementById("id_player_name").value
		},
		getLastPlayerName: function(){
			return document.getElementById("player_name").value
		},
		getPlatform: function(){
			return document.getElementById('id_platform').value
		},
		getPlayerId: function(){
			return document.getElementById('player_id').value
		},
		getGameMode: function(){
			return document.getElementById('id_game_mode').value
		},
		getPerspective: function(){
			return document.getElementById('id_perspective').value
		},
		getMatchesEndpoint: function(){
			return document.getElementById('retrieve_matches').value
		},
		getSeasonsEndpoint: function(){
			return document.getElementById('season_stats_endpoint').value
		},
		setPlayerName: function(set_to){
			document.getElementById("id_player_name").value = set_to
		},
		setLastPlayerName: function(set_to){
			document.getElementById("player_name").value = set_to
		},
		setPlatform: function(set_to){
			document.getElementById('id_platform').value = set_to
		},
		setPlayerId: function(set_to){
			document.getElementById('player_id').value = set_to
		},
		setGameMode: function(set_to){
			document.getElementById('id_game_mode').value = set_to
		},
		setPerspective: function(set_to){
			document.getElementById('id_perspective').value = set_to
		},
		loadResultsDataTable: function(){
			let that = this;

			that.getResults()
	
			setInterval(function() {
				that.getResults()
			}, 20000);
	
			that.seasonStatToggle(that.getPerspective())
		},
		clearSeasonStats: function(){
			var elements = ['duo_season_stats','duo_season_matches','duo_season_damage__figure','duo_season_damage__text','duo_season_headshots__figure','duo_season_headshots__text','duo_season_kills__figure','duo_season_kills__text','duo_season_longest_kill__figure','duo_season_longest_kill__text','duo_fpp_season_stats','duo_fpp_season_matches','duo_fpp_season_damage__figure','duo_fpp_season_damage__text','duo_fpp_season_headshots__figure','duo_fpp_season_headshots__text','duo_fpp_season_kills__figure','duo_fpp_season_kills__text','duo_fpp_season_longest_kill__figure','duo_fpp_season_longest_kill__text','solo_fpp_season_stats','solo_fpp_season_matches','solo_fpp_season_damage__figure','solo_fpp_season_damage__text','solo_fpp_season_headshots__figure','solo_fpp_season_headshots__text','solo_fpp_season_kills__figure','solo_fpp_season_kills__text','solo_fpp_season_longest_kill__figure','solo_fpp_season_longest_kill__text','solo_season_stats','solo_season_matches','solo_season_damage__figure','solo_season_damage__text','solo_season_headshots__figure','solo_season_headshots__text','solo_season_kills__figure','solo_season_kills__text','solo_season_longest_kill__figure','solo_season_longest_kill__text','squad_season_stats','squad_season_matches','squad_season_damage__figure','squad_season_damage__text','squad_season_headshots__figure','squad_season_headshots__text','squad_season_kills__figure','squad_season_kills__text','squad_season_longest_kill__figure','squad_season_longest_kill__text','squad_fpp_season_stats','squad_fpp_season_matches','squad_fpp_season_damage__figure','squad_fpp_season_damage__text','squad_fpp_season_headshots__figure','squad_fpp_season_headshots__text','squad_fpp_season_kills__figure','squad_fpp_season_kills__text','squad_fpp_season_longest_kill__figure','squad_fpp_season_longest_kill__text']
			let len;
			for (let i = 0, len=elements.length; i < len; i++){
				document.getElementById(elements[i]).innerHTML = ''
		
			}
		},
		clearAll: function(window){
			let id = Math.max(
				window.setInterval(noop, 1000),
				window.setTimeout(noop, 1000)
			);
		  
			while (id--) {
				window.clearTimeout(id);
				window.clearInterval(id);
			}
		  
			function noop(){}
		},
		hideInitial: function (){
			$('#seasons_container').hide();
			$("#disconnected").hide();
			$("#currently_processing").hide();
		},
		retrievePlayerSeasonStats: function(){
			let that = this
	
			$("#season_stats").LoadingOverlay("show");

			$.ajax({
				data: {
					player_id: that.getPlayerId(),
					platform: that.getPlatform(),
					perspective: that.getPerspective(),
				},
				type: 'POST',
				url: that.getSeasonsEndpoint(),
				success: function (data, status, xhr) {
					that.season_requested = true
					let len;
					let key;

					for (let i = 0, len=data.length; i < len; i++){
						for(key in data[i]){
							document.getElementById(key).innerHTML = data[i][key]
						}
					}

					$("#season_stats").LoadingOverlay("hide", true);
					$('#seasons_container').show();
					
				}
			});
	
		},
		callForm: function(){
			let form_data = this.serialiseForm()
			let player_name = this.getPlayerName()
			let that = this
		
			if(player_name !== undefined && typeof player_name !== 'undefined'){
				let last_player_name = that.getLastPlayerName()
				if(last_player_name !== undefined && typeof last_player_name !== 'undefined'){
					if(player_name.trim() == last_player_name.trim()){
						that.retrieved = true
						if(that.season_requested)
							that.season_requested = true
						else
							that.season_requested = false
					} else {
						that.retrieved = false
						that.season_requested = false
						$('#results_datatable').DataTable().clear().draw();
						that.seen_match_ids = []
						that.table_rosters = {}
						that.clearSeasonStats()
					}
				} else {
					that.retrieved = false
					that.season_requested = false
					$('#results_datatable').DataTable().clear().draw();
					that.seen_match_ids = []
					that.table_rosters = {}
					that.clearSeasonStats()
				}
			}
		
			that.times_requested = 0
		
			$.ajax({
				data: form_data,
				type: 'POST',
				url: $('#search_form').attr('action'),
				async: true,
				success: function (data, status, xhr) {
					if(data.player_id && data.player_name){
						that.setPlayerName(data.player_name)
						that.setPlayerId(data.player_id)
						if(!data.currently_processing){
							that.loadResultsDataTable();	
						} else {
							$("#error").hide()
							if(data.no_new_matches){
								let error = data.error || data.message
								$("#error").show()
								$("#error_message").text(error);
								that.loadResultsDataTable();	
							} else {
								$("#currently_processing").show()
								$('#currently_processing_message').text('Currently processing player, please bear with us...')
								setTimeout(function(){
									that.loadResultsDataTable();
								}, 5000);
							}
						}
					} else if(data.error){
						$("#currently_processing").hide()
						$("#error").show()
						$("#error_message").text(data.error);
					}
				}     
			});
		},
		formatChildRow: function(id) {
			// `d` is the original data object for the row
			let generated_datatable_id = `rosters_datatable_${id}`
		
			let generated_row_data =`
				<div class="col-md-12" style='padding: 10px;' id='${generated_datatable_id}_wrapper'>
					<table class='table table-condensed hover' id='${generated_datatable_id}' style='width: 100%'>
						<thead>
							<tr>
								<th width='20%%'>Rank</th>
								<th width='80%'>Team Details</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>`
		
			let obj = {
				datatable_id: generated_datatable_id,
				html: generated_row_data
			}
		
			return obj
		},
		getResults: function(){
			var data = {
				player_id: this.getPlayerId(),
				platform: this.getPlatform(),
				game_mode: this.getGameMode(),
				perspective: this.getPerspective(),
				times_requested: this.times_requested,
				seen_match_ids: this.seen_match_ids
			}

			let that = this

			$.ajax({
				url: that.getMatchesEndpoint(),
				async: true,
				type:'POST',
				data: data,
				success: function(result){
					if(result.data){
						let i;
						let match_id;
						let len;
		
						that.setPlayerId(result.player_id)
						for (i = 0, len=result.data.length; i < len; i++){
							match_id = result.data[i].id
							if(!data.seen_match_ids.includes(match_id)){
								data.seen_match_ids.push(match_id)
								let row_node = table.row.add([
									'',
									result.data[i].map,
									result.data[i].mode,
									result.data[i].custom_match,
									result.data[i].date_created,
									result.data[i].team_placement,
									result.data[i].team_details,
									result.data[i].actions
								]).node();
								$(row_node).attr("id", match_id);
							}
						}
						table.draw(false)
						that.times_requested += 1
						that.no_matches = false
						$('#seasons_container').show();
						$("#currently_processing").hide()
					}
		
					// query = buildDataTableQuery(data.perspective, data.game_mode)
		
					// if(query){
					// 	table.column(1).search(query).draw();
					// }
				},
				error: function(xhr, error, code){
					that.tries += 1
					that.no_matches = true
					if(that.tries > 6){
						$("#disconnected").show()
					}
					that.checkDown()
				}
			});
			
		},
		getRosterForMatch: function(match_id, datatable_id){
			
			let that = this;

			if(!that.table_rosters[datatable_id]){
				
				let roster_table = $(`#${datatable_id}`).DataTable({
					columns: [
						{ data: 'roster_rank', width: '15%' }, // rank
						{ data: 'participant_objects', width: '85%' }, // rosters
					],
					order: [[ 0, "asc" ]],
					scrollY: "200px",
					scrollCollapse: true,
					paging: false,
					responsive: true
				});

				that.table_rosters[datatable_id] = {
					actual_data: [],
					datatable: roster_table,
				}

				let this_object;

				$(`#${datatable_id}`).LoadingOverlay("show");
			
				$.ajax({
					type: 'GET',
					url: `/match_rosters/${match_id}/`,
					async: true,
					success: function (data, status, xhr) {
						let rosters = data.rosters
						let i;
						let len;
						for (i = 0, len=rosters.length; i < len; i++){						
							this_object = {
								roster_rank: rosters[i].roster_rank,
								participant_objects: rosters[i].participant_objects,
							}
							that.table_rosters[datatable_id].actual_data.push(this_object)
						}
						that.table_rosters[datatable_id].datatable.rows.add(that.table_rosters[datatable_id].actual_data).draw(false)
						$(`#${datatable_id}`).LoadingOverlay("hide", true);
					}
				});
			} else {
				let roster_table = $(`#${datatable_id}`).DataTable({
					data: that.table_rosters[datatable_id].datatable.rows().data(),
					columns: [
						{ data: 'roster_rank', width: '15%' }, // rank
						{ data: 'participant_objects', width: '85%' }, // rosters
					],
					order: [[ 0, "asc" ]],
					scrollY: "200px",
					scrollCollapse: true,
					paging: false,
					responsive: true
				});
				roster_table.draw(false);
				that.table_rosters[datatable_id].datatable = roster_table    
			}
		},
		seasonStatToggle: function(perspective) {
	
			if(!this.no_matches){
				switch(perspective){
					case 'fpp':
						$('#fpp_row').show()
						$('#tpp_row').hide()
						break;
					case 'tpp':
						$('#tpp_row').show()
						$('#fpp_row').hide()
						break;
					default:
						$('#fpp_row').show()
						$('#tpp_row').show()
						break;
				}
			}
		
		},
		checkDown: function(){
			let that = this;
			$.ajax({
				type: 'GET',
				url:'/backend_status',
				async: true,
				success: function (data, status, xhr) {
					if(data.backend_status == true){
						that.down = true
					}
				}     
			});
		}
		
	}
	
	table = $('#results_datatable').DataTable({
		data: [],
		paging: true,
		bFilter: true,
		bLengthChange: true,
		columns: [
			{ 
				className:'details-control',
				orderable: false,
				data: null,
				defaultContent: '',
			},
			{ width: '10%' }, // map
			{ width: '10%', searchable: true }, // mode
			{ width: '10%' }, // custom 
			{ width: '10%', type: "datetime" }, // created
			{ width: '10%' }, // placement
			{ width: '40%' }, // details
			{ width: '20%' }, // actions
		],
		pageLength: 25,
		order: [[ 4, "desc" ]],
		processing: true,
		language: {
			processing: '<i class="fa fa-spinner fa-spin fa-fw"></i><span class="sr-only">Loading...</span> ',
			emptyTable: 'Please enter a players name and press the <i class="fa fa-search"></i> icon'
		},
	});

	// Add event listener for opening and closing details
	table.on('click', 'td.details-control', function () {
		let tr = $(this).closest('tr');
		let id = tr[0].id
		let row = table.row(tr);

		let returned_obj = app.formatChildRow(id)
		let datatable_id = returned_obj.datatable_id
		let html = returned_obj.html

		if (row.child.isShown()) {
			row.child.hide();
			tr.removeClass('shown');
		} else {
			row.child(html).show();
			app.getRosterForMatch(id, datatable_id)
			tr.addClass('shown');
		}
	});

	app.hideInitial();

	$(document).on('submit', 'form#search_form', function(event){

		$("#season_stats_button").click(function() {
			if(!app.season_requested){
				app.retrievePlayerSeasonStats()
			}
		});

		event.preventDefault()

		if(!app.retrieved){
			app.hideInitial();
		}

		app.clearAll(window);
		$('#seasons_container').hide();
		app.callForm()

	});

});
