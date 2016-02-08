var History = require('./History.js');
var Filter = require('./Filter.js');
var FeatureDistributionHistogram = require('./FeatureDistributionHistogram.js');
var FeatureVectorLineplot = require('./FeatureVectorLineplot.js');
var TreatmentVectorLineplot = require('./TreatmentVectorLineplot.js');
var TreatmentPlotCanvas = require('./TreatmentPlotCanvas.js');
var NeighbourImages = require('./NeighbourImages.js');

/**
 * UIController: Manages event handling for the UI.
 *
 * @constructor
 */
function UIController(screenData, sampleData, treatmentData) {
    this.history = new History();

    this._mountPlots(screenData, sampleData, treatmentData);
}

/**
 * mountPlots: Load plot objects into controller.
 *
 * @param screenData - Screen document for the selected screen.
 * @param sampleData - Sample document for the selected screen.
 * @private
 */
UIController.prototype._mountPlots = function(screenData, sampleData, treatmentData) {
    this.neighbourImages = new NeighbourImages(screenData._id);
    this.featureDistributionHistogram =
        new FeatureDistributionHistogram(screenData, '#histplot');

    this.featureVectorLineplot =
        new TreatmentVectorLineplot(screenData._id, '#lineplot');
    this.neighbourPlotCanvas =
         new TreatmentPlotCanvas(screenData._id, treatmentData, '#neighbourplot');
    // this.filter = new Filter(treatmentData);
};

/**
 * back: Handle view/plot updates when 'back' action taken.
 *
 * @this {UIController}
 */
UIController.prototype.back = function() {
    var backId = this.history.back();
    if(backId) {
        this.featureVectorLineplot.drawLineplot(backId);
        this.neighbourPlotCanvas.updatePoint(backId);
        this.neighbourImages.getImages(backId);
    }
};

/**
 * forward: Handle view/plot updates when 'forward' action taken.
 *
 * @this {UIController}
 */
UIController.prototype.forward = function() {
    var forwardId = this.history.forward();
    if(forwardId) {
        this.featureVectorLineplot.drawLineplot(forwardId);
        this.neighbourPlotCanvas.updatePoint(forwardId);
        this.neighbourImages.getImages(forwardId);
    }
};

/**
 * reset: Reset scatterplot to default position.
 */
UIController.prototype.reset = function() {
    this.neighbourPlotCanvas.reset();
};

/**
 * updateSample: Handle view/plot updates when 'updateFeature' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateFeature = function(activeFeature) {
    this.featureDistributionHistogram.drawHistogram(activeFeature - 1);
};

/**
 * updatePoint: Handle view/plot updates when 'updateSample' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateSample = function(sampleId) {
    this.history.add(sampleId);

    this.neighbourImages.getImages(sampleId);
};

UIController.prototype.updateTreatment = function(geneName) {
    this.neighbourPlotCanvas.updatePoint(geneName);
    this.featureVectorLineplot.drawLineplot(geneName);
};

UIController.prototype.updateView = function(dimension) {
    this.neighbourPlotCanvas.updateView(dimension);
};

/**
 * updateFilter: Handle view/plot updates when 'updateFilter' event triggered.
 *
 * @this {UIController}
 */
UIController.prototype.updateFilter = function(filterOutId) {
    this.neighbourPlotCanvas.updateFilter(filterOutId);
};

module.exports = UIController;
