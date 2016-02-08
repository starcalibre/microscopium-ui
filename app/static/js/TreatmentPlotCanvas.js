var _ = require('lodash');
var d3 = require('d3');
var config = require('../config/plots').neighbourPlot;
var PointsDrawer = require('./PointsDrawer.js');
var TreatmentManager = require('./TreatmentManager.js');
var status = require('./enums/sampleStatus.js');
require('d3-tip')(d3); // add d3-tip tooltip plugin

function TreatmentPlotCanvas(screenID, data, element) {
	// find width of container div
	this.screenID = screenID;
	this.element = element;
	this.fullWidth = $(element).width();
	this.fullHeight = Math.round(this.fullWidth * (9/16));

	// manually set height of container div
	// this needs to be done as we're using absolute positioning
	// (see createCanvasSVGSelectors). this will prevent the height
	// of the container div from inheriting from its children
	$(element).height(this.fullHeight);

	this.margin = config.margin;
	this.width = this.fullWidth - this.margin.left - this.margin.right;
	this.height = this.fullHeight - this.margin.top - this.margin.bottom;

	this.view = 'tsne';
	this.NAVIGATING = false;
	this.navigateTimeoutFunction = null;
	this.idleMouseTimeoutFunction = null;

	this._createCanvasSVGSelectors();

	// create sample manager object
	this.sampleManager = new TreatmentManager(data);

	// create points drawer
	this.pointsDrawer = new PointsDrawer(this.pointsCanvas);

	var self = this;
	this.mainSvg
		.on('click', function() {
			self._onClickHandler(d3.mouse(this));
		});

	// get random indices for drawing subset of data during pan/zoom
	this.randomIndex = _.sample(this.sampleManager.allIndices, 200);

	// set scales
	this.updateView(this.view);
}

TreatmentPlotCanvas.prototype.setScale = function() {
	var xRange = d3.extent(this.sampleManager.data, function(d) {
		return d.dimension_reduce[this.view][0];
	}.bind(this));

	var yRange = d3.extent(this.sampleManager.data, function(d) {
		return d.dimension_reduce[this.view][1];
	}.bind(this));

	var xMargin = (xRange[1] - xRange[0]) * config.axisMargin;
	var yMargin = (yRange[1] - yRange[0]) * config.axisMargin;

	this.xScale = d3.scale.linear()
		.range([0, this.width])
		.domain([xRange[0] - xMargin, xRange[1] + xMargin]);

	this.yScale = d3.scale.linear()
		.range([this.height, 0])
		.domain([yRange[0] - yMargin, yRange[1] + yMargin]);
};

TreatmentPlotCanvas.prototype.updatePoint = function(geneName) {
	var geneIndex = this.sampleManager.geneNameHash[geneName];
	var neighbourIndices;

	$.ajax({
		type: 'GET',
		url: '/api/' + SCREEN_ID + '/treatments/' + geneName + '?' + $.param({
			'select': ['neighbours']
		}, true),
		dataType: 'json',
		async: true,
		error: function(err) {
			alert(err);
		},
		success: function(data) {
			var neighbourIDs = data[0].neighbours;
			neighbourIndices = this.sampleManager.getIndexFromID(neighbourIDs);

			// update sample manager
			this.sampleManager.setStatusToIndex(geneIndex,
				status.ACTIVE);
			this.sampleManager.setStatusToIndex(neighbourIndices,
				status.NEIGHBOUR);

			// redraw
			this.pointsDrawer.redraw(this.sampleManager, null);
		}.bind(this)
	});
};

TreatmentPlotCanvas.prototype.updateView = function(view) {
	// set the state of the plot -- either looking at PCA or TSNE!
	this.view = view;

	// update the scales and the axis accordingly
	this.setScale();
	this._setAxis();

	// update the points drawer with the new scale
	this.pointsDrawer.setScale(this.xScale, this.yScale);
	this.pointsDrawer.setView(view);

	// update the sample manager with the new scale
	this.sampleManager.setScale(this.xScale, this.yScale);
	this.sampleManager.setView(view);

	// update behaviours
	// this.navigateBehaviour = this._createNavigateBehaviour();

	// attach navigation behaviour to the main canvas object
	// this.mainSvg.call(this.navigateBehaviour);

	// redraw the new point
	this.pointsDrawer.redraw(this.sampleManager, null);
};

TreatmentPlotCanvas.prototype._createCanvasSVGSelectors = function() {
	var parentDiv = d3.select(this.element);

	// note all elements below must be positioned absolutely so
	// they'll be rendered on top of eachother

	// create svg element and set height and translation for the SVG used
	// to draw the plot axis. these are drawn using SVG because it's much
	// better at drawing crisp lines and text, and d3's svg axis module
	// handles all the the heavy lifting for drawing and updating the axis
	//
	// this is drawn to the full height and width of the scatterplot
	this.axisSvg = parentDiv.append('svg')
		.attr('width', this.fullWidth)
		.attr('height', this.fullHeight)
		.style('z-index', 1)
		.style('position', 'absolute')
		.append('g')
		.attr('transform', 'translate(' + this.margin.left + ',' +
		this.margin.top + ')');

	// create canvas element and set height and translation of the canvas
	// used to draw the plot points -- the height and width is set to
	// the full height and width minus the margins, and is translated so it
	// sits 'above' the plot axis. the canvas is shifted up one pixel
	// to prevent any artefacts from the canvas and axis avg overlapping
	this.pointsCanvas = parentDiv.append('canvas')
		.attr('width', this.width - 1)
		.attr('height', this.height - 1)
		.style('transform', 'translate(' + (this.margin.left + 1) +
		'px' + ',' + (this.margin.top + 1) + 'px)')
		.style('z-index', 2)
		.style('position', 'absolute');

	// create an svg element that sits on top of the points canvas we
	// just defined above
	// this SVG catches events and is used to draw the tooltip element
	this.mainSvg = parentDiv.append('svg')
		.attr('width', this.width - 1)
		.attr('height', this.height - 1)
		.style('transform', 'translate(' + (this.margin.left + 1) +
		'px' + ',' + (this.margin.top + 1) + 'px)')
		// an svg transform should be applied to the SVG element too
		// as we've shifted its position using CSS.
		// note we don't specify pixels -- it's not a CSS transformation
		.attr('transform', 'translate(' + (this.margin.left + 1) + ',' +
		(this.margin.top + 1) + ')')
		// this element should have the greatest z-index so it catches
		// mouse events
		.style('z-index', 3)
		.style('position', 'absolute');
};

TreatmentPlotCanvas.prototype._onClickHandler = function(mouse) {
	var index = this.sampleManager
		.findSampleFromMouse(mouse, config.inactivePointRadius);
	var geneName = this.sampleManager.data[index].gene_name;

	// only trigger an update if a new point was found
	if(index !== -1) {
		var sampleID = this.sampleManager.data[index].samples[0].sample_id;
		$('body').trigger('updateSample', sampleID);
		$('body').trigger('updateTreatment', geneName);
	}
};

TreatmentPlotCanvas.prototype._setAxis = function() {
	this.xAxis = d3.svg.axis()
		.scale(this.xScale)
		.ticks(config.xAxisTicks)
		.innerTickSize(-this.height)
		.outerTickSize(0)
		.tickPadding(10)
		.orient('bottom');

	this.yAxis = d3.svg.axis()
		.scale(this.yScale)
		.ticks(config.yAxisTicks)
		.innerTickSize(-this.width)
		.outerTickSize(0)
		.orient('left');

	// create the axes SVG elements if they don't exist yet
	if(!this.xAxisSvg) {
		this.xAxisSvg = this.axisSvg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + this.height + ')')
	}
	if(!this.yAxisSvg) {
		this.yAxisSvg = this.axisSvg.append('g')
			.attr('class', 'y axis')
	}

	// apply the axes
	this.xAxisSvg.call(this.xAxis);
	this.yAxisSvg.call(this.yAxis);
};

module.exports = TreatmentPlotCanvas;
