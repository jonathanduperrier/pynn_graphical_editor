var graphSchemaApp = angular.module('graphSchemaApp');

graphSchemaApp.controller('scotchController', function($scope, DataTransfert) {
    $scope.message = 'test';

	$scope.DataTransfert = DataTransfert;

    $scope.scotches = [
        {
            name: 'Macallan 12',
            price: 50
        },
        {
            name: 'Chivas Regal Royal Salute',
            price: 10000
        },
        {
            name: 'Glenfiddich 1937',
            price: 20000
        }
	];
});

graphSchemaApp.controller('graphController', function($scope, $rootScope, $state, FileSaver, $sce, ModalService, jobService, jobResults, python_script_string, DataTransfert, $location) {

	// $state.reload();
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	} else {
		//get collab_id
		$scope.collab_id = 4293;  //default value
		var ctx = null;
		$scope.timestamp_submission = "";

		if( $location.search().ctx ) {
			ctx = $location.search().ctx;
			console.log(ctx);
			clbContext.get(ctx).then(
				function(context) {
					console.log("Collab id = " + context.collab.id);
					$scope.collab_id = context.collab.id;
				},
				function(err) {
					 console.log(err);
				}
			);
		}
		console.log("Context is " + ctx);

		$scope.DataTransfert = DataTransfert;
		
		// Enables guides
		mxGraphHandler.prototype.guidesEnabled = true;

		// Disables built-in context menu
		mxEvent.disableContextMenu(document.getElementById("id_graph_editor"));

		// Alt disables guides
		mxGuide.prototype.isEnabledForEvent = function(evt)
		{
			return !mxEvent.isAltDown(evt);
		};

		// Enables snapping waypoints to terminals
		mxEdgeHandler.prototype.snapToTerminals = true;

		// Overridden to define per-shape connection points
		mxGraph.prototype.getAllConnectionConstraints = function(terminal, source)
		{
			if (terminal != null && terminal.shape != null)
			{
				if (terminal.shape.stencil != null)
				{
					if (terminal.shape.stencil != null)
					{
						return terminal.shape.stencil.constraints;
					}
				}
				else if (terminal.shape.constraints != null)
				{
					return terminal.shape.constraints;
				}
			}
	
			return null;
		};
	
		// Defines the default constraints for all shapes
		mxShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
										 new mxConnectionConstraint(new mxPoint(0.5, 0), true),
										 new mxConnectionConstraint(new mxPoint(0.75, 0), true),
										new mxConnectionConstraint(new mxPoint(0, 0.25), true),
										new mxConnectionConstraint(new mxPoint(0, 0.5), true),
										new mxConnectionConstraint(new mxPoint(0, 0.75), true),
										new mxConnectionConstraint(new mxPoint(1, 0.25), true),
										new mxConnectionConstraint(new mxPoint(1, 0.5), true),
										new mxConnectionConstraint(new mxPoint(1, 0.75), true),
										new mxConnectionConstraint(new mxPoint(0.25, 1), true),
										new mxConnectionConstraint(new mxPoint(0.5, 1), true),
										new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
		
		// Edges have no connection points
		mxPolyline.prototype.constraints = null;
		
		var graphs = [];
		// Detect existings elements in the DOM
		// Creates a DOM node that acts as the drag source
		var img = mxUtils.createImage('img/gear.png');
		img.class = 'img_utils';
		img.style.width = '48px';
		img.style.height = '48px';
		img.className = "tooltip2";
		sp_tool_img = document.createElement('span');
		sp_tool_img.textContent = "drag and drop to create Population";
		sp_tool_img.className='tooltiptext2';

		// var img2 = mxUtils.createImage('img/gearRed.png');
		// img2.style.width = '48px';
		// img2.style.height = '48px';
		// var img3 = mxUtils.createImage('img/gearGreen.png');
		// img3.style.width = '48px';
		// img3.style.height = '48px';
		sp_tb = document.createElement('div');
		sp_tb.className='space_toolbar';

		var button_zoom_in = mxUtils.button('', function()
		{
			graph.zoomIn();
		});
		button_zoom_in.style.width = '48px';
		button_zoom_in.style.height = '48px';
		button_zoom_in.style.border = 'none';
		button_zoom_in.style.background = 'url(\'img/zoom-in.png\') no-repeat';
		button_zoom_in.style.backgroundSize = '100%';
		button_zoom_in.className = "tooltip2";
		sp_tool_zoom_in = document.createElement('span');
		sp_tool_zoom_in.textContent = "Zoom In";
		sp_tool_zoom_in.className='tooltiptext2';

		var button_zoom_out = mxUtils.button('', function()
		{
			graph.zoomOut();
		});
		button_zoom_out.style.width = '48px';
		button_zoom_out.style.height = '48px';
		button_zoom_out.style.border = 'none';
		button_zoom_out.style.background = 'url(\'img/zoom-out.png\') no-repeat';
		button_zoom_out.style.backgroundSize = '100%';
		button_zoom_out.className = "tooltip2";
		sp_tool_zoom_out = document.createElement('span');
		sp_tool_zoom_out.textContent = "Zoom Out";
		sp_tool_zoom_out.className='tooltiptext2';

		var button_save = mxUtils.button('', function(){
			// var FileSaver = require('file-saver');
			bootbox.prompt("Please give the name to the file (.xml extension added automatically) :", function(filename){
				var encoder = new mxCodec();
				var node = encoder.encode(graph.getModel());
				var nodeText = new XMLSerializer().serializeToString(node);
				var blob = new Blob([nodeText], {type: "text/plain;charset=utf-8"});
				//in case of cancelation => filename == null
				if(filename != null){
					if(filename.length <1){
						FileSaver.saveAs(blob, "file_graph.xml");
					} else {
						FileSaver.saveAs(blob, filename + ".xml");
					}
				}
			});
		});
		button_save.style.width = '48px';
		button_save.style.height = '48px';
		button_save.style.border = 'none';
		button_save.style.background = 'url(\'img/save.png\') no-repeat';
		button_save.style.backgroundSize = '100%';
		button_save.className = "tooltip2";
		sp_tool_button_save = document.createElement('span');
		sp_tool_button_save.textContent = "Save graph in xml file";
		sp_tool_button_save.className='tooltiptext2';

		//create button to open and load file
		var button_load = mxUtils.button('', function(){
			$('#xml_graph_file').click();

			$('input').on('change', function(evt){
				var f = evt.target.files[0];
				if (f){
					var r = new FileReader();
					r.onload = function(e){
						graph.getModel().clear();
						// var xml = mxUtils.load('file_graph.xml');
						var xml = e.target.result;
						var doc = mxUtils.parseXml(xml);
						var codec = new mxCodec(doc);
						var elt = doc.documentElement.firstChild.firstChild;
						var cells = [];
						while (elt != null){
							cells.push(codec.decodeCell(elt));
							graph.refresh();
							elt = elt.nextSibling;
						}
						graph.addCells(cells);
						$scope.DataTransfert = DataTransfert;
						var encoder = new mxCodec();
						var node = encoder.encode(graph.getModel());
						$scope.DataTransfert.xml_graph_data = new XMLSerializer().serializeToString(node);
					};
					r.readAsText(f);
				} else {
					console.log("failed");
				}
			});
		});
		button_load.style.width = '48px';
		button_load.style.height = '48px';
		button_load.style.border = 'none';
		button_load.style.background = 'url(\'img/open.png\') no-repeat';
		button_load.style.backgroundSize = '100%';
		button_load.className = "tooltip2";
		sp_tool_button_load = document.createElement('span');
		sp_tool_button_load.textContent = "Open xml graph file";
		sp_tool_button_load.className='tooltiptext2';

		//create a button to clear schema
		var button_clear = mxUtils.button('', function(){
			bootbox.confirm({
				size: "small",
				message: "Are you sure to clear the graph ?",
				callback: function(result){ /* result is a boolean; true = OK, false = Cancel*/
					if(result == true){
						// clear content of graph
						graph.getModel().clear();
						// update status
						job_status.textContent = 'No job submited yet';
						job_status.classList.remove('badge-danger');
						job_status.classList.remove('badge-success');
						job_status.classList.remove('badge-info');
						job_status.classList.add('badge-primary');
					}
				}
			});
		});
		button_clear.style.width = '48px';
		button_clear.style.height = '48px';
		button_clear.style.border = 'none';
		button_clear.style.background = 'url(\'img/delete_clear.png\') no-repeat';
		button_clear.style.backgroundSize = '100%';
		button_clear.className = "tooltip2";
		sp_tool_button_clear = document.createElement('span');
		sp_tool_button_clear.textContent = "Clear graph";
		sp_tool_button_clear.className='tooltiptext2';


		// create a button to export to python script
		var button_exp_python = mxUtils.button('', function(){

			ModalService.showModal({
				templateUrl: "modal_script_python.html",
				controller: "Dlg_script_python",
				inputs: {
					title : "Python Script Generator",
					filename : "",
					hardware_platform : "NEST",
					Simulation_time : 10,
					Simulation_name :  "",
				}
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					var encoder = new mxCodec();
					var node = encoder.encode(graph.getModel());
					var cells = graph.getModel().cells;
					var scriptText = python_script_string(cells, result.hardware_platform, result.Simulation_time, result.Simulation_name);
					console.log((scriptText));
					var blob = new Blob([scriptText], {type: "text/plain;charset=utf-8"});

			 		if(result.filename.length <1){
			 			FileSaver.saveAs(blob, "exp_python.py");
			 		} else {
			 			FileSaver.saveAs(blob, result.filename + ".py");
			 		}
				});
			});
		});
		button_exp_python.style.width = '48px';
		button_exp_python.style.height = '48px';
		button_exp_python.style.border = 'none';
		button_exp_python.style.background = 'url(\'img/python.png\') no-repeat';
		button_exp_python.style.backgroundSize = '100%';
		button_exp_python.className = "tooltip2";
		sp_tool_button_exp_python = document.createElement('span');
		sp_tool_button_exp_python.textContent = "Export to Python";
		sp_tool_button_exp_python.className='tooltiptext2';

		//create a button to submit job
		var button_submit = mxUtils.button('', function() {
			var scriptText = "";
			ModalService.showModal({
				templateUrl: "modal_submit_job.html",
				controller: "Dlg_submit_job",
				inputs: {
					title : "Job Submission",
					hardware_platform : "",
					Simulation_time : 10,
					Simulation_name :  "",
					scriptText : scriptText,
					jobService : jobService,
					cells: graph.getModel().cells
				}
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					var cells = graph.getModel().cells;
					console.log(cells);
					scriptText = python_script_string(cells, result.hardware_platform, result.Simulation_time, result.Simulation_name);
					console.log((scriptText));
					$scope.timestamp_submission = result.timestamp_submission;
				});
			});
		});
		button_submit.style.width = '48px';
		button_submit.style.height = '48px';
		button_submit.style.border = 'none';
		button_submit.style.background = 'url(\'img/submit.png\') no-repeat';
		button_submit.style.backgroundSize = '100%';
		button_submit.className = "tooltip2";
		sp_tool_button_submit = document.createElement('span');
		sp_tool_button_submit.textContent = "Submit job";
		sp_tool_button_submit.className='tooltiptext2';

		//create element to display job status after submission
		var job_status = document.createElement('div');
		job_status.id = 'job_status';
		job_status.classList.add("badge");
		job_status.classList.add("badge-primary");
		job_status.textContent = "No submission data";

		//create toolbar
		var div_toolbar = document.createElement('div');
		div_toolbar.id = 'div_toolbar';
		div_toolbar.style.width = '100%';
		div_toolbar.style.float = 'left';
		// document.body.appendChild(div_toolbar);
		document.getElementById("id_graph_editor").appendChild(div_toolbar);
		div_toolbar.appendChild(img);
		img.appendChild(sp_tool_img);
		div_toolbar.appendChild(sp_tb);//blanck space between 2 button in toolbar
		// div_toolbar.appendChild(img2);
		// div_toolbar.appendChild(img3);
		div_toolbar.appendChild(button_zoom_in);
		button_zoom_in.appendChild(sp_tool_zoom_in);
		div_toolbar.appendChild(button_zoom_out);
		button_zoom_out.appendChild(sp_tool_zoom_out);
		div_toolbar.appendChild(button_save);
		button_save.appendChild(sp_tool_button_save);
		div_toolbar.appendChild(button_load);
		button_load.appendChild(sp_tool_button_load);
		div_toolbar.appendChild(button_clear);
		button_clear.appendChild(sp_tool_button_clear);
		div_toolbar.appendChild(button_exp_python);
		button_exp_python.appendChild(sp_tool_button_exp_python);
		div_toolbar.appendChild(button_submit);
		button_submit.appendChild(sp_tool_button_submit);
		div_toolbar.appendChild(job_status);

		var container = document.createElement('div');
		container.id = 'svg_container';
		container.style.overflow = 'scroll';
		container.style.position = 'relative';
		container.style.float = 'left';
		container.style.minWidth = '750px';
		container.style.minWidth = '70%';
		container.style.height = '75%';
		container.style.background = 'url(\'img/grid.gif\')';
		container.style.cursor = 'default';
		// document.body.appendChild(container);
		document.getElementById("id_graph_editor").appendChild(container);

		// Creates the graph inside the given container
		var graph = new mxGraph(container);
		graph.setTooltips(true);

		graph.gridSize = 30;
		graph.centerZoom = false;

		//get connectable cells and modify style of edge
		graph.setConnectable(true);
		var style = graph.getStylesheet().getDefaultEdgeStyle();
		style[mxConstants.STYLE_ROUNDED] = true;
		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

		graph.setPanning(true);

		// Uncomment the following if you want the container
		// to fit the size of the graph
		//graph.setResizeContainer(true);

		// Enables rubberband selection
		new mxRubberband(graph);

		//keep graph when we change controller
		if($scope.DataTransfert.xml_graph_data != null){
			graph.getModel().clear();
			// var xml = mxUtils.load('file_graph.xml');
			// var xml = e.target.result;
			var doc = mxUtils.parseXml($scope.DataTransfert.xml_graph_data);
			var codec = new mxCodec(doc);
			var elt = doc.documentElement.firstChild.firstChild;
			var cells = [];
			while (elt != null){
				cells.push(codec.decodeCell(elt));
				graph.refresh();
				elt = elt.nextSibling;
			}
			graph.addCells(cells);
		}

		// execute veryfyStatusOfSubmittedJob method periodically
		window.setInterval(function(){ 
			$scope.veryfyStatusOfSubmittedJob($scope.collab_id);
		}, 5000); // This is time period in milliseconds 1000 ms = 1 second.
		
		graph.addListener(mxEvent.REFRESH, function(sender, evt){
			$scope.keep_xml_graph_data();
			$scope.veryfyStatusOfSubmittedJob($scope.collab_id);
		});
		$scope.keep_xml_graph_data = function(){
			$scope.DataTransfert = DataTransfert;
			var encoder = new mxCodec();
			var node = encoder.encode(graph.getModel());
			$scope.DataTransfert.xml_graph_data = new XMLSerializer().serializeToString(node);
		};

		// request to verify status of submitted job
		$scope.veryfyStatusOfSubmittedJob = function(collab_id){
			console.log("veryfy Status Of Submitted Job");
			$scope.submitted_job = "";
			var val_id = new Array();
			var initial_textContent = job_status.textContent;
			//jobService.get

			job = jobService.get({collab_id:collab_id}, function(data, status){
				if(data.objects.length > 0){
					console.log("length : " + data.objects.length);
					var i = 0;
					for(i = 0; i < data.objects.length; i++){
						val_id[i] = data.objects[i].id;
					}
					val_id.sort();
					console.log("val_id : " + val_id[val_id.length-1]);
					for(i = 0; i < data.objects.length; i++){
						if(data.objects[i].id = val_id[val_id.length-1]){
							//$scope.submitted_job = data.objects[i];
							job_status.textContent = data.objects[i].status;
							if(job_status.textContent == "finished"){
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.add('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.remove('badge-warning');
							}
							else if(job_status.textContent == "running"){
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.add('badge-warning');
							}
							else if(job_status.textContent == "error"){
								job_status.classList.remove('badge-primary');
								job_status.classList.add('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.remove('badge-warning');
							}
							else{
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.add('badge-info');
								job_status.classList.remove('badge-warning');
							}
						}
					}
				} else {
					//job_status.textContent = "not defined status";
					job = jobResults.get({collab_id:collab_id}, function(data, status){
						if(data.objects.length > 0){
							job_status.textContent = data.objects[0].status;
							if(job_status.textContent == "finished"){
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.add('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.remove('badge-warning');
							}
							else if(job_status.textContent == "running"){
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.add('badge-warning');
							}
							else if(job_status.textContent == "error"){
								job_status.classList.remove('badge-primary');
								job_status.classList.add('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.remove('badge-info');
								job_status.classList.remove('badge-warning');
							}
							else{
								job_status.classList.remove('badge-primary');
								job_status.classList.remove('badge-danger');
								job_status.classList.remove('badge-success');
								job_status.classList.add('badge-info');
								job_status.classList.remove('badge-warning');
							}
						}
					});
				}
			});
		};

		// Gets the default parent for inserting new cells. This
		// is normally the first child of the root (ie. layer 0).
		var parent = graph.getDefaultParent();

		// Adds cells to the model in a single step
		graph.getModel().beginUpdate();
		graph.getModel().endUpdate();

		graph.setAllowDanglingEdges(false);

		graphs.push(graph);

		// Returns the graph under the mouse
		var graphF = function(evt)
		{
			var x = mxEvent.getClientX(evt);
			var y = mxEvent.getClientY(evt);
			var elt = document.elementFromPoint(x, y);

			for (var i = 0; i < graphs.length; i++)
			{
				if (mxUtils.isAncestorNode(graphs[i].container, elt))
				{
					return graphs[i];
				}
			}

			return null;
		};

		// Inserts a cell at the given location
		var funct = function(graph, evt, target, x, y)
		{
			var cell = new mxCell('Pop', new mxGeometry(0, 0, 80, 30));
			cell.vertex = true;
			var cells = graph.importCells([cell], x, y, target);

			if (cells != null && cells.length > 0)
			{
				graph.scrollCellToVisible(cells[0]);
				graph.setSelectionCells(cells);
			}
		};

		// Disables built-in DnD in IE (this is needed for cross-frame DnD, see below)
		if (mxClient.IS_IE)
		{
			mxEvent.addListener(img, 'dragstart', function(evt)
			{
				evt.returnValue = false;
			});
		}

		// Detect creation of edge (Projections)
		// mxEvent.addListener(mxEvent.CONNECT, function(sender, evt){
		// 	alert("connect");
		// });
		// Creates the element that is being for the actual preview.
		var dragElt = document.createElement('div');
		dragElt.style.border = 'dashed black 1px';
		dragElt.style.width = '80px';
		dragElt.style.height = '30px';

		// Drag source is configured to use dragElt for preview and as drag icon
		// if scalePreview (last) argument is true. Dx and dy are null to force
		// the use of the defaults. Note that dx and dy are only used for the
		// drag icon but not for the preview.
		var ds = mxUtils.makeDraggable(img, graphF, funct, dragElt, null, null, graph.autoscroll, true);
		// var ds = mxUtils.makeDraggable(img2, graphF, funct2, dragElt, null, null, graph.autoscroll, true);
		// var ds = mxUtils.makeDraggable(img3, graphF, funct3, dragElt, null, null, graph.autoscroll, true);
		// Redirects feature to global switch. Note that this feature should only be used
		// if the the x and y arguments are used in funct to insert the cell.
		ds.isGuidesEnabled = function()
		{
			return graph.graphHandler.guidesEnabled;
		};

		// Restores original drag icon while outside of graph
		ds.createDragElement = mxDragSource.prototype.createDragElement;

		// Configures automatic expand on mouseover
		graph.popupMenuHandler.autoExpand = true;

		graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
		{
			// if (graph.getSelectionCount() == 1 && !graph.getModel().isEdge(cell) && !graph.isSwimlane(cell) && graph.getModel().getChildCount(cell) > 0)
			if (graph.getSelectionCount() == 1 && graph.getModel().isEdge(cell))
			{
				menu.addItem('Delete Projection', null, function()
				{
					bootbox.confirm( "Do you really remove this link ?",
					function(result){
						if(result == true){
							graph.removeCells([cell]);
						}
					});
					mxEvent.consume(evt);
				});
				menu.addItem('Configure Projection', null, function()
				{
					if (graph.isEnabled()){
						if((cell.value === undefined) | (cell.value === null)){
							cell.value = "";
						}
						if((cell.data_cell != undefined) | (cell.data_cell != null)){
							var json_data = JSON.parse(cell.data_cell);
						} else {
							var json_data = {
								"name_value": "",
								// "level": "",
								"synapse_type": "",
								"receptor_type": "",
								"connectors_type": "",
								"param_synaptic_weight_dist": "",
								"synaptic_weight": "",
								"param_synaptic_weight_distribution": "",
								"param_synaptic_weight_p1": "",
								"param_synaptic_weight_p2": "",
								"param_synaptic_weight_fx": "",
								//"param_synaptic_weight_dist": "",
								"synaptic_delay": "",
								"param_synaptic_delay_distribution": "",
								"param_synaptic_delay_p1": "",
								"param_synaptic_delay_p2": "",
								"param_synaptic_delay_fx": "",
								"TsodyksMarkram_U_dist": "",
								"TsodyksMarkram_U": "",
								"TsodyksMarkram_U_distribution": "",
								"TsodyksMarkram_U_p1": "",
								"TsodyksMarkram_U_p2": "",
								"TsodyksMarkram_U_fx": "",
								"TsodyksMarkram_tau_rec_dist": "",
								"TsodyksMarkram_tau_rec": "",
								"TsodyksMarkram_tau_rec_distribution": "",
								"TsodyksMarkram_tau_rec_p1": "",
								"TsodyksMarkram_tau_rec_p2": "",
								"TsodyksMarkram_tau_rec_fx": "",
								"TsodyksMarkram_tau_facil_dist": "",
								"TsodyksMarkram_tau_facil": "",
								"TsodyksMarkram_tau_facil_distribution": "",
								"TsodyksMarkram_tau_facil_p1": "",
								"TsodyksMarkram_tau_facil_p2": "",
								"TsodyksMarkram_tau_facil_fx": "",
								"AllToAll_allow_self_connections": false,
								"FixedProbability_p_connect": "",
								"FixedProbability_allow_self_connections": false,
								"FromFile_file": "",
								"FromFile_distributed": false,
								"FromFile_safe": false,
								"FromFile_callback": false,
								"FixedNumberPre_n": "",
								"FixedNumberPre_with_replacement": false,
								"FixedNumberPre_allow_self_connections": false,
								"FixedNumberPost_n": "",
								"FixedNumberPost_with_replacement": false,
								"FixedNumberPost_allow_self_connections": false,
								"FixedTotalNumber_n": "",
								"FixedTotalNumber_with_replacement": false,
								"FixedTotalNumber_allow_self_connections": false,
								"DistanceDependent_d_expression": "",
								"DistanceDependent_allow_self_connections": false,
							};
						}
						ModalService.showModal({
							templateUrl: "modal_pop_dialog_2.html",
							controller: "PopDialogController_spike",
							inputs: {
								title : "Projection Form Editor",
								name_value: cell.value,
								// level: json_data.level,
								synapse_type: json_data.synapse_type,
								receptor_type: json_data.receptor_type,
								connectors_type: json_data.connectors_type,
								param_synaptic_weight_dist:json_data.param_synaptic_weight_dist,
								synaptic_weight: json_data.synaptic_weight,
								param_synaptic_weight_distribution: json_data.param_synaptic_weight_distribution,
								param_synaptic_weight_p1: json_data.param_synaptic_weight_p1,
								param_synaptic_weight_p2: json_data.param_synaptic_weight_p2,
								param_synaptic_weight_fx: json_data.param_synaptic_weight_fx,
								param_synaptic_delay_dist: json_data.param_synaptic_delay_dist,
								synaptic_delay: json_data.synaptic_delay,
								param_synaptic_delay_distribution: json_data.param_synaptic_delay_distribution,
								param_synaptic_delay_p1: json_data.param_synaptic_delay_p1,
								param_synaptic_delay_p2: json_data.param_synaptic_delay_p2,
								param_synaptic_delay_fx: json_data.param_synaptic_delay_fx,
								TsodyksMarkram_U_dist: json_data.TsodyksMarkram_U_dist,
								TsodyksMarkram_U: json_data.TsodyksMarkram_U,
								TsodyksMarkram_U_distribution: json_data.TsodyksMarkram_U_distribution,
								TsodyksMarkram_U_p1: json_data.TsodyksMarkram_U_p1,
								TsodyksMarkram_U_p2: json_data.TsodyksMarkram_U_p2,
								TsodyksMarkram_U_fx: json_data.TsodyksMarkram_U_fx,
								TsodyksMarkram_tau_rec_dist: json_data.TsodyksMarkram_tau_rec_dist,
								TsodyksMarkram_tau_rec: json_data.TsodyksMarkram_tau_rec,
								TsodyksMarkram_tau_rec_distribution: json_data.TsodyksMarkram_tau_rec_distribution,
								TsodyksMarkram_tau_rec_p1: json_data.TsodyksMarkram_tau_rec_p1,
								TsodyksMarkram_tau_rec_p2: json_data.TsodyksMarkram_tau_rec_p2,
								TsodyksMarkram_tau_rec_fx: json_data.TsodyksMarkram_tau_rec_fx,
								TsodyksMarkram_tau_facil_dist: json_data.TsodyksMarkram_tau_facil_dist,
								TsodyksMarkram_tau_facil: json_data.TsodyksMarkram_tau_facil,
								TsodyksMarkram_tau_facil_distribution: json_data.TsodyksMarkram_tau_facil_distribution,
								TsodyksMarkram_tau_facil_p1: json_data.TsodyksMarkram_tau_facil_p1,
								TsodyksMarkram_tau_facil_p2: json_data.TsodyksMarkram_tau_facil_p2,
								TsodyksMarkram_tau_facil_fx: json_data.TsodyksMarkram_tau_facil_fx,
								AllToAll_allow_self_connections: json_data.AllToAll_allow_self_connections,
								FixedProbability_p_connect: json_data.FixedProbability_p_connect,
								FixedProbability_allow_self_connections: json_data.FixedProbability_allow_self_connections,
								FromFile_file: json_data.FromFile_file,
								FromFile_distributed: json_data.FromFile_distributed,
								FromFile_safe: json_data.FromFile_safe,
								FromFile_callback: json_data.FromFile_callback,
								FixedNumberPre_n: json_data.FixedNumberPre_n,
								FixedNumberPre_with_replacement: json_data.FixedNumberPre_with_replacement,
								FixedNumberPre_allow_self_connections: json_data.FixedNumberPre_allow_self_connections,
								FixedNumberPost_n: json_data.FixedNumberPost_n,
								FixedNumberPost_with_replacement: json_data.FixedNumberPost_with_replacement,
								FixedNumberPost_allow_self_connections: json_data.FixedNumberPost_allow_self_connections,
								FixedTotalNumber_n: json_data.FixedTotalNumber_n,
								FixedTotalNumber_with_replacement: json_data.FixedTotalNumber_with_replacement,
								FixedTotalNumber_allow_self_connections: json_data.FixedTotalNumber_allow_self_connections,
								DistanceDependent_d_expression: json_data.DistanceDependent_d_expression,
								DistanceDependent_allow_self_connections: json_data.DistanceDependent_allow_self_connections,
							}
						}).then(function(modal) {
							modal.element.modal();
							modal.close.then(function(result) {
								// state.cell.setValue(result.name_value);
								// cell.value = result.name_value + "|" + JSON.stringify(result);
								cell.value = result.name_value;
								cell.data_cell = JSON.stringify(result);
								cell.setValue(cell.value);
								cell.setData_cell(cell.data_cell);
								graph.refresh();
								var txtdisplay = $('text').text();
							});
						});
						mxEvent.consume(evt);
					}
				});
			} else if(graph.getSelectionCount() == 1 && graph.getModel().isVertex(cell)){
				menu.addItem('Create Self Projection', null, function(){
					graph.insertEdge(cell, null, '', cell, cell);
					$scope.keep_xml_graph_data();
				});
				menu.addItem('Edit Population', null, function(){
					if((cell.data_cell != null) & (cell.data_cell != "")){
						var json_data = JSON.parse(cell.data_cell);
					} else {
						var json_data = {
							"name_value": "",
							// "level": "",
							"size": "",
							"celltype": "",
							"param_v_rest": -65,
							"param_cm": 1,
							"param_tau_m": 20,
							"param_tau_refrac": 0,
							"param_tau_syn_E": 5,
							"param_tau_syn_I": 5,
							"param_i_offset": 0,
							"param_v_reset": -65,
							"param_v_thresh": -50,
							"param_e_rev_E": "",
							"param_e_rev_I": "",
							"param_gbar_Na": "",
							"param_gbar_K": "",
							"param_g_leak": "",
							"param_v_offset": "",
							"param_e_rev_Na": "",
							"param_e_rev_K": "",
							"param_e_rev_leak": "",
							"param_tau_cm": "",
							"param_v_spike": "",
							"param_a": "",
							"param_b": "",
							"param_delta_T": "",
							"param_tau_w": "",
							"init_isyn_exc": 0,
							"init_isyn_inh": 0,
							"init_gsyn_exc": "",
							"init_gsyn_inh": "",
							"init_v": -65,
							"init_w": "",
							"Recording_spikes": "",
							"Recording_v": "",
							"Simulation_time": "",
							"Simulation_name": "",
							"param_rate": "",
							"param_start": "",
							"param_duration": "",
						};
					}
					ModalService.showModal({
						templateUrl: "modal_pop_dialog.html",
						controller: "PopDialogController",
						inputs: {
							title : "Population Form Editor",
							name_value: cell.value,
							// level: json_data.level,
							size: json_data.size,
							celltype: json_data.celltype,
							v_rest_dist: json_data.v_rest_dist,
							param_v_rest_dist: json_data.param_v_rest_dist,
							param_v_rest: json_data.param_v_rest,
							param_v_rest_distribution: json_data.param_v_rest_distribution,
							param_v_rest_p1: json_data.param_v_rest_p1,
							param_v_rest_p2: json_data.param_v_rest_p2,
							param_v_rest_fx: json_data.param_v_rest_fx,
							param_cm_dist: json_data.param_cm_dist,
							param_cm: json_data.param_cm,
							param_cm_distribution: json_data.param_cm_distribution,
							param_cm_p1: json_data.param_cm_p1,
							param_cm_p2: json_data.param_cm_p2,
							param_cm_fx: json_data.param_cm_fx,
							param_tau_m_dist: json_data.param_tau_m_dist,
							param_tau_m: json_data.param_tau_m,
							param_tau_m_distribution: json_data.param_tau_m_distribution,
							param_tau_m_p1: json_data.param_tau_m_p1,
							param_tau_m_p2: json_data.param_tau_m_p2,
							param_tau_m_fx: json_data.param_tau_m_fx,
							param_tau_refrac_dist: json_data.param_tau_refrac_dist,
							param_tau_refrac: json_data.param_tau_refrac,
							param_tau_refrac_distribution: json_data.param_tau_refrac_distribution, 
							param_tau_refrac_p1: json_data.param_tau_refrac_p1, 
							param_tau_refrac_p2: json_data.param_tau_refrac_p2, 
							param_tau_refrac_fx: json_data.param_tau_refrac_fx,
							param_tau_syn_E_dist: json_data.param_tau_syn_E_dist,
							param_tau_syn_E: json_data.param_tau_syn_E,
							param_tau_syn_E_distribution: json_data.param_tau_syn_E_distribution,
							param_tau_syn_E_p1: json_data.param_tau_syn_E_p1,
							param_tau_syn_E_p2: json_data.param_tau_syn_E_p2,
							param_tau_syn_E_fx: json_data.param_tau_syn_E_fx,
							param_tau_syn_I_dist: json_data.param_tau_syn_I_dist,
							param_tau_syn_I: json_data.param_tau_syn_I,
							param_tau_syn_I_distribution: json_data.param_tau_syn_I_distribution,
							param_tau_syn_I_p1: json_data.param_tau_syn_I_p1,
							param_tau_syn_I_p2: json_data.param_tau_syn_I_p2,
							param_tau_syn_I_fx: json_data.param_tau_syn_I_fx,
							param_i_offset_dist: json_data.param_i_offset_dist,
							param_i_offset: json_data.param_i_offset,
							param_i_offset_distribution: json_data.param_i_offset_distribution,
							param_i_offset_p1: json_data.param_i_offset_p1,
							param_i_offset_p2: json_data.param_i_offset_p2,
							param_i_offset_fx: json_data.param_i_offset_fx,
							param_v_reset_dist: json_data.param_v_reset_dist,
							param_v_reset: json_data.param_v_reset,
							param_v_reset_distribution: json_data.param_v_reset_distribution,
							param_v_reset_p1: json_data.param_v_reset_p1,
							param_v_reset_p2: json_data.param_v_reset_p2,
							param_v_reset_fx: json_data.param_v_reset_fx,
							param_v_thresh_dist: json_data.param_v_thresh_dist,
							param_v_thresh: json_data.param_v_thresh,
							param_v_thresh_distribution: json_data.param_v_thresh_distribution, 
							param_v_thresh_p1: json_data.param_v_thresh_p1, 
							param_v_thresh_p2: json_data.param_v_thresh_p2, 
							param_v_thresh_fx: json_data.param_v_thresh_fx,
							param_e_rev_E_dist: json_data.param_e_rev_E_dist,
							param_e_rev_E: json_data.param_e_rev_E,
							param_e_rev_E_distribution: json_data.param_e_rev_E_distribution, 
							param_e_rev_E_p1: json_data.param_e_rev_E_p1, 
							param_e_rev_E_p2: json_data.param_e_rev_E_p2, 
							param_e_rev_E_fx: json_data.param_e_rev_E_fx,
							param_e_rev_I_dist: json_data.param_e_rev_I_dist,
							param_e_rev_I: json_data.param_e_rev_I,
							param_e_rev_I_distribution: json_data.param_e_rev_I_distribution, 
							param_e_rev_I_p1: json_data.param_e_rev_I_p1, 
							param_e_rev_I_p2: json_data.param_e_rev_I_p2, 
							param_e_rev_I_fx: json_data.param_e_rev_I_fx,
							param_gbar_Na_dist: json_data.param_gbar_Na_dist,
							param_gbar_Na: json_data.param_gbar_Na,
							param_gbar_Na_distribution: json_data.param_gbar_Na_distribution, 
							param_gbar_Na_p1: json_data.param_gbar_Na_p1, 
							param_gbar_Na_p2: json_data.param_gbar_Na_p2, 
							param_gbar_Na_fx: json_data.param_gbar_Na_fx,
							param_gbar_K_dist: json_data.param_gbar_K_dist,
							param_gbar_K: json_data.param_gbar_K,
							param_gbar_K_distribution: json_data.param_gbar_K_distribution, 
							param_gbar_K_p1: json_data.param_gbar_K_p1, 
							param_gbar_K_p2: json_data.param_gbar_K_p2, 
							param_gbar_K_fx: json_data.param_gbar_K_fx,
							param_g_leak_dist: json_data.param_g_leak_dist,
							param_g_leak: json_data.param_g_leak,
							param_g_leak_distribution: json_data.param_g_leak_distribution,
							param_g_leak_p1: json_data.param_g_leak_p1,
							param_g_leak_p2: json_data.param_g_leak_p2, 
							param_g_leak_fx: json_data.param_g_leak_fx,
							param_v_offset_dist: json_data.param_v_offset_dist,
							param_v_offset: json_data.param_v_offset,
							param_v_offset_distribution: json_data.param_v_offset_distribution, 
							param_v_offset_p1: json_data.param_v_offset_p1, 
							param_v_offset_p2: json_data.param_v_offset_p2, 
							param_v_offset_fx: json_data.param_v_offset_fx,
							param_e_rev_Na_dist: json_data.param_e_rev_Na_dist,
							param_e_rev_Na: json_data.param_e_rev_Na,
							param_e_rev_Na_distribution: json_data.param_e_rev_Na_distribution, 
							param_e_rev_Na_p1: json_data.param_e_rev_Na_p1, 
							param_e_rev_Na_p2: json_data.param_e_rev_Na_p2, 
							param_e_rev_Na_fx: json_data.param_e_rev_Na_fx,
							param_e_rev_K_dist: json_data.param_e_rev_K_dist,
							param_e_rev_K: json_data.param_e_rev_K,
							param_e_rev_K_distribution: json_data.param_e_rev_K_distribution,
							param_e_rev_K_p1: json_data.param_e_rev_K_p1,
							param_e_rev_K_p2: json_data.param_e_rev_K_p2,
							param_e_rev_K_fx: json_data.param_e_rev_K_fx,
							param_e_rev_leak_dist: json_data.param_e_rev_leak_dist,
							param_e_rev_leak: json_data.param_e_rev_leak,
							param_e_rev_leak_distribution: json_data.param_e_rev_leak_distribution,
							param_e_rev_leak_p1: json_data.param_e_rev_leak_p1,
							param_e_rev_leak_p2: json_data.param_e_rev_leak_p2,
							param_e_rev_leak_fx: json_data.param_e_rev_leak_fx,
							param_tau_cm: json_data.param_tau_cm,
							param_v_spike_dist: json_data.param_v_spike_dist,
							param_v_spike: json_data.param_v_spike,
							param_v_spike_distribution: json_data.param_v_spike_distribution,
							param_v_spike_p1: json_data.param_v_spike_p1,
							param_v_spike_p2: json_data.param_v_spike_p2,
							param_v_spike_fx: json_data.param_v_spike_fx,
							param_a_dist: json_data.param_a_dist,
							param_a: json_data.param_a,
							param_a_distribution: json_data.param_a_distribution,
							param_a_p1: json_data.param_a_p1,
							param_a_p2: json_data.param_a_p2,
							param_a_fx: json_data.param_a_fx,
							param_b_dist: json_data.param_b_dist,
							param_b: json_data.param_b,
							param_b_distribution: json_data.param_b_distribution,
							param_b_p1: json_data.param_b_p1,
							param_b_p2: json_data.param_b_p2,
							param_b_fx: json_data.param_b_fx,
							param_delta_T_dist: json_data.param_delta_T_dist,
							param_delta_T: json_data.param_delta_T,
							param_delta_T_distribution: json_data.param_delta_T_distribution,
							param_delta_T_p1: json_data.param_delta_T_p1,
							param_delta_T_p2: json_data.param_delta_T_p2,
							param_delta_T_fx: json_data.param_delta_T_fx,
							param_tau_w_dist: json_data.param_tau_w_dist,
							param_tau_w: json_data.param_tau_w,
							param_tau_w_distribution: json_data.param_tau_w_distribution,
							param_tau_w_p1: json_data.param_tau_w_p1,
							param_tau_w_p2: json_data.param_tau_w_p2,
							param_tau_w_fx: json_data.param_tau_w_fx,
							init_isyn_exc: json_data.init_isyn_exc,
							init_isyn_inh: json_data.init_isyn_inh,
							init_gsyn_exc: json_data.init_gsyn_exc,
							init_gsyn_inh: json_data.init_gsyn_inh,
							init_v_dist: json_data.init_v_dist,
							init_v: json_data.init_v,
							init_v_distribution: json_data.init_v_distribution,
							init_v_p1: json_data.init_v_p1,
							init_v_p2: json_data.init_v_p2,
							init_v_fx: json_data.init_v_fx,
							init_w_dist: json_data.init_w_dist,
							init_w: json_data.init_w,
							init_w_distribution: json_data.init_w_distribution,
							init_w_p1: json_data.init_w_p1,
							init_w_p2: json_data.init_w_p2,
							init_w_fx: json_data.init_w_fx,
							Recording_spikes: json_data.Recording_spikes,
							Recording_v: json_data.Recording_v,
							Simulation_time: json_data.Simulation_time,
							Simulation_name: json_data.Simulation_name,
							param_rate_dist: json_data.param_rate_dist,
							param_rate: json_data.param_rate,
							param_rate_distribution: json_data.param_rate_distribution,
							param_rate_p1: json_data.param_rate_p1,
							param_rate_p2: json_data.param_rate_p2,
							param_rate_fx: json_data.param_rate_fx,
							param_start_dist: json_data.param_start_dist,
							param_start: json_data.param_start,
							param_start_distribution: json_data.param_start_distribution,
							param_start_p1: json_data.param_start_p1,
							param_start_p2: json_data.param_start_p2,
							param_start_fx: json_data.param_start_fx,
							param_duration_dist: json_data.param_duration_dist,
							param_duration: json_data.param_duration,
							param_duration_distribution: json_data.param_duration_distribution,
							param_duration_p1: json_data.param_duration_p1,
							param_duration_p2: json_data.param_duration_p2,
							param_duration_fx: json_data.param_duration_fx,
							param_spike_times_dist: json_data.param_spike_times_dist,
							param_spike_times: json_data.param_spike_times,
							param_spike_times_distribution: json_data.param_spike_times_distribution,
							param_spike_times_p1: json_data.param_spike_times_p1,
							param_spike_times_p2: json_data.param_spike_times_p2,
							param_spike_times_fx: json_data.param_spike_times_fx,
							param_spike_times_file: json_data.param_spike_times_file,
							param_spike_times_file_content: json_data.param_spike_times_file_content,
						}
					}).then(function(modal) {
						modal.element.modal();
						modal.close.then(function(result) {
							cell.value = result.name_value;
							cell.data_cell = JSON.stringify(result);
							cell.setValue(cell.value);
							cell.setData_cell(cell.data_cell);
							graph.refresh();
						});
					});
				});
				menu.addItem('Delete Population', null, function(){
					if (graph.isEnabled())
					{
						bootbox.confirm( "Do you really remove this cell ?",
							function(result){
								if(result == true){
									graph.removeCells([cell]);
								}
							});
						mxEvent.consume(evt);
					}
				});
				var submenu_color = menu.addItem('Choose color of Cell', null, null);
				menu.addItem('Default (Light Blue)', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=#774400;fillColor=#c3d9ff");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Red', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=white;fillColor=red");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Green', null, function(a, b, c, d)
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=white;fillColor=green");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Blue', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=white;fillColor=blue");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Yellow', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=black;fillColor=yellow");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Orange', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=black;fillColor=#ffb700");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Violet', null, function()
				{
					graph.getModel().cells[cell.id].setStyle("fontColor=white;fillColor=#9900ff");
					graph.refresh();
				}, submenu_color);
				menu.addItem('Duplicate Population', null, function(){
					//shift position of duplicated cell on the graph
					var cell2 = cell;
					var x = cell2.geometry.x;
					var y = cell2.geometry.y;
					x = x + 20;
					y = y + 20;
					cell2.geometry.x = x;
					cell2.geometry.y = y;
					var tabcell = new Array(cell2);
					graph.getModel().beginUpdate();
					graph.addCells(graph.cloneCells(tabcell));
					// Adds cells to the model in a single step
					graph.getModel().endUpdate();
				});
			} else if(graph.getSelectionCount() > 1){
				menu.addItem('Duplicate selection', null, function(){
					var cell2 = [];
					cells = graph.getSelectionCells();
					for(i=0; i<cells.length; i++){
						cell2[i] = cells[i];
						var x = cell2[i].geometry.x;
						var y = cell2[i].geometry.y;
						x = x + 20;
						y = y + 20;
						cell2[i].geometry.x = x;
						cell2[i].geometry.y = y;
					}
					graph.getModel().beginUpdate();
					graph.addCells(graph.cloneCells(cell2));
					graph.getModel().endUpdate();
				});
			}
		};
	}
});


graphSchemaApp.service('DataTransfert', function(){
	this.xml_graph_data = "";
});

graphSchemaApp.controller('neoViewerController', function($scope, jobResults){
	$scope.collab_id = 4293;  //default value
	job = jobResults.get({collab_id:$scope.collab_id}, function(data, status){
		//console.log("data : " + data);
		console.log("data id : " + data.objects[0].id);

		var data_id = data.objects[0].id;
		$scope.neo_url = [];
		job = jobResults.get({id:data_id}, function(data, status){
			console.log("data : " + data.output_data);
			var i = 0;
			for(i = 0; i < data.output_data.length; i++){
				$scope.neo_url[i] = data.output_data[i].url;
			}
			//console.log("job id : " + data.objects[0].id);
			console.log("neo_url : " + $scope.neo_url);
		});
	});
});