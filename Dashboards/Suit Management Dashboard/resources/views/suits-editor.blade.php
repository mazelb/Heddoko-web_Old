<!DOCTYPE html>
<html>
	<head>
		<title>Suits Editor v1.0.4</title>

		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js"></script>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		<link rel="stylesheet" href="{{ url('css/selectize.css') }}">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="{{ url('js/bootbox.min.js') }}"></script>
		<script type="text/javascript" src="{{ url('js/dirPagination.js') }}"></script>
		<script type="text/javascript" src="{{ url('js/selectize.js') }}"></script>
		<script type="text/javascript" src="{{ url('js/ng-selectize.js') }}"></script>
		<script type="text/javascript" src="{{ url('js/app.js') }}"></script>
    </head>
    <body data-ng-app="suit-editor" data-ng-controller="MainController">
        <div class="container">
			<div class="page-header">
				<h1>Heddoko Suit Editor <small>V1.0.4</small></h1>
			</div>
			<ul class="nav nav-tabs">
				<li class="active"><a data-toggle="tab" href="#suits">Suits</a></li>
				<li><a data-toggle="tab" href="#equipment">Equipment</a></li>
			</ul>
			<div class="tab-content">
				<div id="suits" class="tab-pane fade in active">
					</br>
					<div class="input-group">
						<span class="input-group-addon" id="search-bar-addon">Search</span>
						<input type="text" class="form-control" placeholder="Enter sensor serial, name, or physical location" aria-describedby="search-bar-addon" ng-model="search_term">
					</div>
					</br>
					<a href="">Suits <span class="badge">@{{suits.length}}</span></a>
					</br>
					</br>
					<div class="panel panel-success">
						<div class="panel-heading">
							<h3 class="panel-title pull-left">Add new suit</h3>
							<div class="btn-group pull-right" role="group">
								<button type="button" class="btn btn-sm btn-warning" ng-click="new_suit_equipment_ids = []">Reset</button>
								<button type="button" class="btn btn-sm btn-success" ng-click="AddNewSuit()">Submit</button>
							</div>
							<div class="clearfix"></div>
						</div>
						<div class="panel-body">
							<div class="col-sm-12">
								<div class="list-group">
									@{{new_suit_equipment_ids}}
									<selectize id='asdfg' options="equipment_list" config="new_equipment_config" ng-model="new_suit_equipment_ids"></selectize>
									<!--<a href="javascript:;" class="list-group-item clearfix" ng-repeat="sensor in new_suit_sensors track by $index" ng-class="{'list-group-item-info': sensor == current_sensor}" ng-click="$parent.current_sensor = sensor">
										<b>@{{sensor.type.name}}</b> @{{sensor.name}}
										<span class="pull-right">
											<button class="btn btn-xs btn-warning" ng-click="RemoveExistingSensor(new_suit_sensors, sensor, current_sensor)">
												<span class="glyphicon glyphicon-trash"></span>
											</button>
										</span>
									</a>-->
								</div>
							</div>
						</div>
					</div>
					<div class="panel panel-primary" ng-repeat="suit in suits track by suit.id">
						<div class="panel-heading">
							<h3 class="panel-title pull-left"><span class="badge">@{{$index + 1}}</span> Heddoko Suit with @{{suit.equipment.length}} sensor(s)</h3>
							<div class="btn-group pull-right" role="group">
								<button type="button" class="btn btn-sm btn-danger" ng-click="DeleteSuit(suit.id)">Delete Suit</button>
								<button type="button" class="btn btn-sm btn-success" ng-click="UpdateExistingSuit(suit)">Save</button>
							</div>
							<div class="clearfix"></div>
						</div>
						<div class="panel-body">
							<div class="col-sm-6">
								<div class="list-group">
									<a href="javascript:;" class="list-group-item clearfix" ng-repeat="equipment in suit.equipment" ng-class="{'list-group-item-info': equipment == suit.current_equipment}" ng-click="$parent.suit.current_equipment = equipment">
										<b>@{{equipment.serial_no}}</b> @{{equipment.name}}
										<span class="pull-right">
											<button class="btn btn-xs btn-warning" ng-click="RemoveExistingSensor(suit.equipment, equipment, suit.current_equipment)">
												<span class="glyphicon glyphicon-trash"></span>
											</button>
										</span>
									</a>
									<a href="javascript:;" class="list-group-item active clearfix" ng-click="AddNewSensor(suit.sensors, suit.current_sensor)">
										<span class="glyphicon glyphicon-plus"></span>
										Add sensor
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div id="equipment" class="tab-pane fade">
					<h3>hello</h3>
					<p>Use this page to view the status of stored equipment</p>
					<p>You can also upload a CSV file to add to this page</p>
					<div class="panel panel-success">
						<div class="panel-heading">
							<h3 class="panel-title pull-left">Add equipment</h3>
							<div class="btn-group pull-right" role="group">
								<button type="button" class="btn btn-sm btn-warning" ng-click="ResetNewEquipmentForm()">Reset</button>
								<button type="button" class="btn btn-sm btn-success" ng-click="SubmitNewEquipmentForm()">Submit</button>
							</div>
							<div class="clearfix"></div>
						</div>
						<div class="panel-body">
							<div class="row">
								<div class="col-sm-3">
									<!--<input type="text" ng-model="new_equipment_data.material_id" />-->
									<select
										ng-model="new_equipment_data.material_id"
										ng-selected="new_equipment_data.material_id"
										ng-options="material.name for material in materials_list">
									</select>
								</div>
								<div class="col-sm-3">
									<input type="text" ng-model="new_equipment_data.serial_no" />
								</div>
								<div class="col-sm-3">
									<input type="text" ng-model="new_equipment_data.physical_location" />
								</div>
								<div class="col-sm-3">
									@{{new_equipment_data.status_id}}
									<select
										ng-model="new_equipment_data.status_id"
										ng-selected="new_equipment_data.status_id"
										ng-options="status.name for status in status_types track by status.id">
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-3">Material ID</div>
						<div class="col-sm-3">Serial #</div>
						<div class="col-sm-3">Location</div>
						<div class="col-sm-3">Status</div>
					</div>
					<div class="row" ng-repeat="equipment in equipment_list">
						<div class="col-sm-3">@{{equipment.material_id}}</div>
						<div class="col-sm-3">@{{equipment.serial_no}}</div>
						<div class="col-sm-3">@{{equipment.physical_location}}</div>
						<div class="col-sm-3">@{{equipment.status_id}}</div>
					</div>
				</div>
			</div>

            {{-- Pagination controls --}}
            <dir-pagination-controls
                template-url="views/dirPagination.tpl.html"
                on-page-change="updatePage(newPageNumber)"
                style="text-align: center"></dir-pagination-controls>
		</div>
	</body>
</html>
