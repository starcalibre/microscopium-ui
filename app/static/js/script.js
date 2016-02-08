// SCREEN_ID is a global variable read the HTML of the screen UI,
// add a globals definition here to prevent linters from complaining
// about the use of an undeclared variable
/* globals SCREEN_ID */

$(document).ready(function() {
    var UIController = require('./UIController.js');
    var Spinner = require('spin.js');
    $.slidebars();
    var spinner = new Spinner();

    // setup the AJAX query that fetches the screen data from the database
    var screenQuery = $.ajax({
        type: 'GET',
        url: '/api/screens/' + SCREEN_ID + '?' + $.param({
            'select': ['screen_features']
        }, true),
        dataType: 'json',
        async: true,
        error: function(err) {
            alert(err);
        }
    });

    // setup the query tht fetches the sample data from the datbase
    var sampleQuery = $.ajax({
        type: 'GET',
        url: '/api/' + SCREEN_ID + '/samples?' + $.param({
            'select': ['row', 'column', 'plate', 'gene_name', 'dimension_reduce']
        }, true),
        dataType: 'json',
        async: true,
        error: function(err) {
            alert(err);
        }
    });

    var treatmentQuery = $.ajax({
        type: 'GET',
        url: '/api/' + SCREEN_ID + '/treatments?' + $.param({
            'select': ['gene_name', 'dimension_reduce', 'samples.sample_id']
        }, true),
        dataType: 'json',
        async: true,
        error: function(err) {
            alert(err);
        }
    });

    // send the request and load the UI when the data comes back
    startLoadingSpinner(spinner);
    $.when(screenQuery, sampleQuery, treatmentQuery)
        .done(function(screenData, sampleData, treatmentData) {
            $('.navbar-right').removeClass('hidden');
            $('#neighbourplot-options').removeClass('hidden');
            $('#dimensionality-reduction-select').val('tsne');
            mountUI(screenData[0][0], sampleData[0], treatmentData[0]);
            stopLoadingSpinner(spinner);
        });

    /**
     * startLoadingSpinner: Start the loading spinner.
     *
     * Starts the loading spinner and adds an overlay that
     * prevents interaction with the page.
     *
     * @param spinnerObject - The spin.js spinner to start.
     */
    function startLoadingSpinner(spinnerObject) {
        $('#sb-site').addClass('load-overlay');
        spinnerObject.spin(document.getElementById('sb-site'));
    }

    /**
     * stopLoadingSpinner: Stop the loading spinner.
     *
     * Stops the loading spinner and removes the overlay
     * that prevents interaction with the page.
     *
     * @param spinnerObject - The spin.js spinner to stop;
     */
    function stopLoadingSpinner(spinnerObject) {
        $('#sb-site').removeClass('load-overlay');
        spinnerObject.spin(false);
    }

    /**
     * mountUI: Add all event handling to page.
     *
     * Connects front-end UI elements to the UI controller logic.
     *
     * @param screenData - Screen document for the selected screen.
     * @param sampleData - Sample document for the selected screen.
     */
    function mountUI(screenData, sampleData, treatmentData) {
        var $body = $('body');
        var uiController = new UIController(screenData, sampleData, treatmentData);

        $('#back-button').on('click', function() {
            uiController.back();
        });

        $('#forward-button').on('click', function() {
            uiController.forward();
        });

        $('#reset-button').on('click', function () {
            uiController.reset();
        });

        $body.on('updateFeature', function(event, activeFeature) {
            uiController.updateFeature(activeFeature);
        });

        $body.on('updateFilter', function(event, filterOutId) {
            uiController.updateFilter(filterOutId);
        });

        $body.on('updateTreatment', function(event, geneName) {
            uiController.updateTreatment(geneName);
        });

        $body.on('updateSample', function(event, sampleId) {
            uiController.updateSample(sampleId);
        });

        $('.btn-dim-select').on('click', function() {
            // ignore clicks from already active button
            if(!$(this).hasClass('active')) {

                // update styling of button group
                // eg select tsne, deselect PCA
                var val = $(this).val();
                $('.btn-dim-select').removeClass('active');
                $(this).addClass('active');

                // handle plot/ui update logic
                uiController.updateView(val);
            }
        });

        $('a.navbar-brand').on('click', function() {
            $('#exit-confirmation').modal('show');
        });

        // default select first point
        $body.trigger('updateSample', sampleData[1]._id);
    }
});
