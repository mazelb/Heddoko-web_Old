
//
var app = angular.module('suit-editor', ['auth', 'backend', 'selectize', 'angularUtils.directives.dirPagination']);

//
app.constant('apiEndpoint', 'http://heddokocoachingapp.azurewebsites.net/api')
    .constant('apiClientID', 'oQUuD535CgQ1OwewridIjmokBRpU0g7mAbaJBlrs');

//
app.controller('MainController', [
    '$scope', '$location', 'Authenticator',
    'AnatomicalPositions', 'Equipment', 'Materials', 'MaterialTypes', 'Statuses', 'ComplexEquipment',
    function($scope, $location, Authenticator, AnatomicalPositions, Equipment, Materials, MaterialTypes, Statuses, ComplexEquipment) {

        // Check that we're authenticated with the API.
        Authenticator.authenticate();


    // We use a template object that we will clone for each data model, and store
    // these models in $scope.data for easy access.
    $scope.data = {};
    var dataTemplate =
    {
        name: '',           // Title for a data item.
        list: [],           // List of data items.
        total: 0,           // Total number of data items matching the current query.
        per_page: 20,       // Number of data items to display per page.
        current_page: 1,    // Current page for pagination.
        search_term: '',    // Search query to filter results.
        service: null,      // Angular service for HTTP requests.

        // Updates the current page.
        updatePage: function(page, showLoadingDialog) {

            showLoadingDialog = typeof showLoadingDialog == 'boolean' ? showLoadingDialog : true;

            // If we have a response, update the page with that info.
            if (typeof page == 'object') {

                this.list = page.results;
                this.total = page.total;

                // Hide the loading dialog.
                showLoadingDialog ? $scope.HideLoadingDialog() : null;

                return;
            }

            // If not, make sure we have a valid page number.
            page = page || this.current_page;

            // Show loading dialog and update the page.
            showLoadingDialog ? $scope.ShowLoadingDialog() : null;
            this.service.search(this.search_term, page, this.per_page)
                .then(function(response) {

                    if (response.status == 200)
                    {
                        this.list = response.data.results;
                        this.total = response.data.total;
                    }

                    // Hide loading dialog.
                    showLoadingDialog ? $scope.HideLoadingDialog() : null;
                }.bind(this));
        },

        // Stores the information related to new items.
        new_item:
        {
            // Returns the new item without the unrelated data.
            getAttributes: function()
            {
                var new_item = {};

                for (var attribute in this)
                {
                    if (['number', 'string'].indexOf(typeof this[attribute]) != -1 || $.isArray(this[attribute])) {
                        new_item[attribute] = this[attribute];
                    }
                }

                return new_item;
            },

            // Resets the new item form.
            reset: function()
            {
                for (var attribute in this)
                {
                    // Performance check.
                    if (!this[attribute]) {
                        continue;
                    }

                    switch (typeof this[attribute])
                    {
                        case 'number':
                            this[attribute] = 0;
                            break;

                        case 'string':
                            this[attribute] = '';
                            break;

                        case 'object':
                            this[attribute] = (typeof this[attribute].push == 'function') ? [] : {};
                            break;

                        default:
                            // Do nothing.
                    }
                }
            }
        },

        // Retrieves an item from the list by ID.
        find: function(id) {

            // Performance check.
            if (id == 'new-item') {
                return this.new_item;
            }

            var search_results = $.grep(this.list, function(item) { return item.id == id; });
            return search_results.length == 1 ? search_results[0] : null;
        },

        // Adds a new item.
        create: function()
        {
            // Check that all attributes have valid values.
            for (var attribute in this.new_item)
            {
                // Only strings and integers need to be validated.
                if (['string', 'number'].indexOf(typeof this.new_item[attribute]) != -1)
                {
                    // Consider any empty string or default values to be invalid.
                    if (this.new_item[attribute] == 0 || this.new_item[attribute] == '0' || this.new_item[attribute] == '')
                    {
                        console.log(attribute);
                        bootbox.alert('Please fill out all details before adding a new '+ this.name);
                        return;
                    }
                }
            }

            bootbox.confirm('Are you sure you want to add a new '+ this.name +'?', function(user_response) {
                if (user_response === true)
                {
                    $scope.ShowLoadingDialog();
                    this.service.create(this.new_item.getAttributes()).then(function(response) {

                        // Update the page (this will also hide the loading dialog).
                        if (response.status == 200)
                        {
                            this.updatePage(response.data);
                            bootbox.alert(this.name +' successfully updated.');
                        }

                        this.new_item.reset();

                    }.bind(this), function(response) {

                        // Display the error message.
                        console.log('Error updating '+ this.name +': '+ response.statusText);
                        bootbox.alert('An error occurred:' + response.statusText);
                        $scope.HideLoadingDialog();

                    }.bind(this));
                }
            }.bind(this));

        },

        // Makes an item row editable.
        edit: function(id, namespace)
        {
            // Make the item row editable.
            var fieldsClassName = '.editable-'+ namespace +'-'+ id;
            $(fieldsClassName).addClass('live');

            // Hide all action buttons and show the save button.
            var actionsClassName = '.actions-'+ namespace +'-'+ id;
            $(actionsClassName).addClass('live');
        },

        // Updates an existing item.
        update: function(item, namespace)
        {
            bootbox.confirm('Are you sure you want to update this '+ this.name +'?', function(user_response) {
                if (user_response === true)
                {
                    // Make the item row uneditable.
                    var fieldsClassName = '.editable-'+ namespace +'-'+ item.id;
                    $(fieldsClassName).removeClass('live');

                    // Show all action buttons and hide the save button.
                    var actionsClassName = '.actions-'+ namespace +'-'+ item.id;
                    $(actionsClassName).removeClass('live');

                    $scope.ShowLoadingDialog();
                    this.service.update(item, this.search_term, this.current_page, this.per_page).then(function(response)
                    {
                        // Update the page (this will also hide the loading dialog).
                        if (response.status == 200)
                        {
                            this.updatePage(response.data);
                            bootbox.alert(this.name +' successfully updated.');
                        }

                    }.bind(this), function(response)
                    {
                        // Display the error message.
                        console.log('Error updating '+ this.name +': '+ response.statusText);
                        bootbox.alert('An error occurred:' + response.statusText);
                        $scope.HideLoadingDialog();

                    }.bind(this));
                }
            }.bind(this));

        },

        // Removes an item from the database.
        destroy: function(id) {

            bootbox.confirm('Are you sure you want to delete this '+ this.name +'?', function(user_response) {
                if (user_response === true)
                {
                    $scope.ShowLoadingDialog();
                    this.service.destroy(id).then(function(response)
                    {
                        // Update the page (this will also hide the loading dialog).
                        if (response.status == 200)
                        {
                            this.updatePage(response.data);
                            bootbox.alert(this.name +' successfully deleted.');
                        }

                    }.bind(this), function(response)
                    {
                        // Display the error message.
                        console.log('Error deleting '+ this.name +': '+ response.statusText);
                        bootbox.alert('An error occurred:' + response.statusText);
                        $scope.HideLoadingDialog();

                    }.bind(this));
                }
            }.bind(this));
        }
    };

    //
    // Anatomical positions model.
    //
    $scope.data.anatomical_positions = $.extend(true, {}, dataTemplate, {
        name: 'Anatomical Position',
        per_page: 10,
        service: AnatomicalPositions
    });
    $scope.data.anatomical_positions.new_item = $.extend(true, {}, dataTemplate.new_item, {
        id: 0,
        name: ''
    });

    //
    // Equipment model.
    //
    $scope.data.equipment = $.extend(true, {}, dataTemplate, {
        name: 'Equipment',
        per_page: 20,
        service: Equipment
    });
    $scope.data.equipment.new_item = $.extend(true, {}, dataTemplate.new_item, {
        material_id: 0,
        anatomical_position_id: 0,
        mac_address: '',
        serial_no: '',
        physical_location: '',
        status_id: 0
    });

    //
    // Materials model.
    //
    $scope.data.materials = $.extend(true, {}, dataTemplate, {
        name: 'Material',
        per_page: 20,
        service: Materials
    });
    $scope.data.materials.new_item = $.extend(true, {}, dataTemplate.new_item, {
        name: '',
        part_no: '',
        material_type_id: 0
    });

    //
    // Material types model.
    //
    $scope.data.material_types = $.extend(true, {}, dataTemplate, {
        name: 'Material Type',
        per_page: 10,
        service: MaterialTypes
    });
    $scope.data.material_types.new_item = $.extend(true, {}, dataTemplate.new_item, {
        identifier: ''
    });

    //
    // Statuses model.
    //
    $scope.data.statuses = $.extend(true, {}, dataTemplate, {
        name: 'Status',
        service: Statuses
    });

    //
    // ComplexEquipment model.
    //
    $scope.data.suits = $.extend(true, {}, dataTemplate, {
        name: 'Suit',
        per_page: 5,
        service: ComplexEquipment,
        removeEquipment: function(suit, equipment) {

            // Update the equipment list.
            $index = suit.equipment.indexOf(equipment);
            suit.equipment.splice( $index, 1 );

            // If the deleted equipment was active (selected), set the current equipment to null.
            if (suit.current_equipment && suit.current_equipment.id == equipment.id) {
                suit.current_equipment = null;
            }
        },
        selectize: {
            config:
            {
                create: false,
                preload: false,
                openOnFocus: true,
                hideSelected: true,
                valueField: 'id',
                labelField: 'serial_no',
                searchField: ['mac_address', 'serial_no', 'physical_location'],
                placeholder: 'Search for equipment to add',
                onInitialize: function(selectize) {},
                render: {
                    option: function(item, escape) {
                        return  '<div>' +
                        '<b>' + escape(item.serial_no) +'</b><br />' +
                        '<span>'+ escape(item.material.name) +
                        ' located in "' + escape(item.physical_location) + '"</span>' +
                        '</div>';
                    }
                },
                load: function(query, callback) {

                    // Performance check.
                    if (!query.length) return callback();

                    var selectize = this;
                    $.ajax({
                        url: '/equipment?search_term=' + encodeURIComponent(query),
                        type: 'GET',
                        cache: false,
                        error: function() {
                            callback();
                        },
                        success: function(response) {
                            callback(response.results);
                        }
                    });
                },
                onFocus: function() {

                    // Update the currently selected equipment for this specific selectize input.
                    $scope.data.suits.selectize.current.suit_id = this.$input.context.dataset.suitId;
                    $scope.data.suits.selectize.current.equipment_list = this.$input.data('equipmentList');

                },
                onBlur: function() {

                    // Clear the cached options.
                    this.clearOptions();
                },
                onLoad: function(data) {

                    // Update the equipment available to a specific selectize input.
                    for (var index in data)
                    {
                        // Index equipment by ID, so we can retrieve it easily later on.
                        $scope.data.suits.selectize.current.available_equipment_list[data[index].id] = data[index];
                    }
                },
                onItemAdd: function(id, $item) {
                    var equipment = $scope.data.suits.selectize.current.available_equipment_list[id],
                        suit = $scope.data.suits.find($scope.data.suits.selectize.current.suit_id);
                    if (!equipment || !suit)
                    {
                        return;
                    }

                    // Performance check (this method might get called for each selectize input on the page).
                    if ($.grep(suit.equipment, function(e) { return e.id == id; }).length > 0)
                    {
                        return;
                    }

                    suit.equipment.push(equipment);
                }
            },

            // Stores data related to currently focused selectize control.
            current:
            {
                suit_id: 0,
                equipment_list: [],
                available_equipment_list: {}
            }
        }
    });
    $scope.data.suits.new_item = $.extend(true, {}, dataTemplate.new_item, {
        mac_address: '',
        serial_no: '',
        physical_location: '',
        equipment: [],
        current_equipment: null
    });

    $scope.ShowLoadingDialog = function() {
        $('#loading-dialog').modal();
    };

    $scope.HideLoadingDialog = function() {
        $('#loading-dialog').modal('hide');
    };

    // Load the data for each tab.
    for (type in $scope.data) {
        $scope.data[type].updatePage(1, true);
    }
}]);

angular.module('auth', []).service('Authenticator', function($location, $window, apiEndpoint, apiClientID) {

    /**
     * Redirects user to authentication page.
     */
    this.authenticate = function() {
        // $location.path('/auth');
        $window.location.href = 'http://suits.heddoko.vagrant/auth';
    };
});

//CRUD methods for communicating with the back end

angular.module('backend', [])
    .factory('ComplexEquipment', function($http, apiEndpoint) {

        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/complexequipment');
            },

            create : function(data)
            {
                return $http({
                    method: 'POST',
                    url: apiEndpoint + '/v1/complexequipment',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({new_suit_equipment: data})
                });
            },

            update : function(suit)
            {
                return $http({
                    method: 'PUT',
                    url: apiEndpoint + '/v1/complexequipment/' + suit.id,
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({updated_suit: suit})
                });
            },

            destroy : function(suit_id)
            {
                return $http.delete(apiEndpoint + '/v1/complexequipment/' + suit_id);
            },

            search : function(query, page, per_page)
            {
                return $http.get(apiEndpoint + '/v1/complexequipment?search_term='+ query +'&page='+ page +'&per_page='+ per_page);
            }
        };

    }).factory('MaterialTypes', function($http, apiEndpoint) {

        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/materialtypes');
            },

            create : function(new_material_type_form_data)
            {
                return $http({
                    method: 'POST',
                    url: apiEndpoint + '/v1/materialtypes',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({new_material_type_data: new_material_type_form_data})
                });
            },

            update : function(material_type, query, page, per_page)
            {
                return $http({
                    method: 'PUT',
                    url: apiEndpoint + '/v1/materialtypes/' + material_type.id +'?search_term='+ query +'&page='+ page +'&per_page='+ per_page,
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({updated_material_type: material_type})
                });
            },

            destroy : function(id)
            {
                return $http.delete(apiEndpoint + '/v1/materialtypes/'+ id);
            },

            search : function(query, page, per_page)
            {
                return $http.get(apiEndpoint + '/v1/materialtypes?search_query='+ query +'&page='+ page +'&per_page='+ per_page);
            }

        };
    }).factory('AnatomicalPositions', function($http, apiEndpoint) {

        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/anatomicalpositions');
            },

            create : function(new_anatomical_position_form_data)
            {
                return $http({
                    method: 'POST',
                    url: apiEndpoint + '/v1/anatomicalpositions',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({new_anatomical_position_data: new_anatomical_position_form_data})
                });
            },

            update : function(anatomical_position, query, page, per_page)
            {
                return $http({
                    method: 'PUT',
                    url: apiEndpoint + '/v1/anatomicalpositions/' + anatomical_position.id +'?search_term='+ query +'&page='+ page +'&per_page='+ per_page,
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({updated_anatomical_position: anatomical_position})
                });
            },

            destroy : function(id)
            {
                return $http.delete(apiEndpoint + '/v1/anatomicalpositions/'+ id);
            },

            search : function(query, page, per_page) {
                return $http.get(apiEndpoint + '/v1/anatomicalpositions?search_term='+ query +'&page='+ page +'&per_page='+ per_page);
            }

        };
    }).factory('Statuses', function($http, apiEndpoint)
    {
        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/statuses');
            },

            search : function(query, page, per_page)
            {
                return $http.get(apiEndpoint + '/v1/statuses?search_query='+ query +'&page='+ page +'&per_page='+ per_page);
            }

        };
    }).factory('Equipment', function($http, apiEndpoint)
    {
        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/equipment');
            },

            create : function(new_equipment_form_data) {

                return $http({
                    method: 'POST',
                    url: apiEndpoint + '/v1/equipment?status_id=0',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({new_equipment_data: new_equipment_form_data})
                });
            },

            update : function(equipment, query, page, per_page)
            {
                return $http({
                    method: 'PUT',
                    url: apiEndpoint + '/v1/equipment/' + equipment.id +'?status_id=0&search_term='+ query +'&page='+ page +'&per_page='+ per_page,
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({updated_equipment: equipment})
                });
            },

            destroy : function(id)
            {
                return $http.delete(apiEndpoint + '/v1/equipment/'+ id +'?status_id=0');
            },

            search : function(query, page, per_page) {
                return $http.get(apiEndpoint + '/v1/equipment?status_id=0&search_term='+ query +'&page='+ page +'&per_page='+ per_page);
            }

        };
    }).factory('Materials', function($http, apiEndpoint) {

        return {

            get : function()
            {
                return $http.get(apiEndpoint + '/v1/materials');
            },

            create : function(new_material_form_data)
            {
                return $http({
                    method: 'POST',
                    url: apiEndpoint + '/v1/materials',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({new_material_data: new_material_form_data})
                });
            },

            update : function(material, query, page, per_page)
            {
                return $http({
                    method: 'PUT',
                    url: apiEndpoint + '/v1/materials/' + material.id +'?search_term='+ query +'&page='+ page +'&per_page='+ per_page,
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                    data: $.param({updated_material: material})
                });
            },

            destroy : function(id)
            {
                return $http.delete(apiEndpoint + '/v1/materials/'+ id);
            },

            search : function(query, page, per_page)
            {
                return $http.get(apiEndpoint + '/v1/materials?search_term='+ query +'&page='+ page +'&per_page='+ per_page);
            }

        };
    });
