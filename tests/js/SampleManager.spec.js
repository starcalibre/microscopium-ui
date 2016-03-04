'use strict';
var SampleManager = require('../../app/static/js/SampleManager.js');
var sampleStatus = require('../../app/static/js/enums/sampleStatus.js');
var d3 = require('d3');
var _ = require('lodash');

// dummy data for testing the SampleManager functions
// the tsne and pca values do not in any way reflect a real dataset!!
var testData = [
    {
        _id: 'test-A',
        dimension_reduce: {
            tsne: [0.5, 0.5],
            pca: [0, 0.25]
        }
    },
    {
        _id: 'test-B',
        dimension_reduce: {
            tsne: [-0.5, 0.5],
            pca: [0.25, 0]
        }
    },
    {
        _id: 'test-C',
        dimension_reduce: {
            tsne: [0.5, -0.5],
            pca: [0, -0.25]
        }
    },
    {
        _id: 'test-D',
        dimension_reduce: {
            tsne: [-0.5, -0.5],
            pca: [-0.25, 0]
        }
    }
];

// create a test scale with D3
// say x \in [0, 100] and y \in
// [0, 100]
var xScale = d3.scale.linear()
    .domain([-1, 1])
    .range([0, 100]);

var yScale = d3.scale.linear()
    .domain([-1, 1])
    .range([100, 0]);

describe('SampleManager', function() {
    var sampleManager;

    beforeEach(function() {
        sampleManager = new SampleManager(testData);
        sampleManager.setScale(xScale, yScale);
    });

    describe('setStatusToIndex', function() {
        it('should add the correct status to a single index', function() {
            sampleManager.setStatusToIndex(0, sampleStatus.ACTIVE);

            var expected = [sampleStatus.ACTIVE, 0, 0, 0];
            var actual = _.pluck(sampleManager.data, 'status');

            expect(actual).toEqual(expected);
        });

        it('should add the correct status to a set of indices',
            function() {
                sampleManager.setStatusToIndex([0, 2],
                    sampleStatus.FILTERED_OUT);

                var expected = [sampleStatus.FILTERED_OUT, 0,
                    sampleStatus.FILTERED_OUT, 0];
                var actual = _.pluck(sampleManager.data, 'status');

                expect(actual).toEqual(expected);
            }
        );

        it('manages more than one status', function() {
            sampleManager.setStatusToIndex(0, sampleStatus.ACTIVE);
            sampleManager.setStatusToIndex(1, sampleStatus.FILTERED_OUT);
            sampleManager.setStatusToIndex([1, 2], sampleStatus.SELECTED);

            var expected = [
                sampleStatus.ACTIVE,
                sampleStatus.SELECTED | sampleStatus.FILTERED_OUT,
                sampleStatus.SELECTED,
                0
            ];
            var actual = _.pluck(sampleManager.data, 'status');

            expect(actual).toEqual(expected);
        });

        it('maintains correct statuses', function() {
            sampleManager.setStatusToIndex(0, sampleStatus.ACTIVE);
            sampleManager.setStatusToIndex([2, 3], sampleStatus.SELECTED);
            sampleManager.setStatusToIndex(1, sampleStatus.ACTIVE);
            sampleManager.setStatusToIndex([0, 2], sampleStatus.SELECTED);

            var expected = [
                sampleStatus.SELECTED,
                sampleStatus.ACTIVE,
                sampleStatus.SELECTED,
                0
            ];
            var actual = _.pluck(sampleManager.data, 'status');

            expect(actual).toEqual(expected);
        });
    });

    describe('findSampleFromMouse', function() {
        it('finds correct sample in query radius', function() {
            // "click" in approx center of top left quadrant
            var index = sampleManager.findSampleFromMouse([22, 22], 5);
            expect(index).toEqual(1);
        });

        it('returns -1 when sample not found in query radius', function() {
            // "click in center of plot, slightly towards top left
            var index = sampleManager.findSampleFromMouse([5, 5], 5);
            expect(index).toEqual(-1);
        });
    });

    describe('getIndexFromID', function() {
        it('should return the correct index for a single id', function() {
            var index = sampleManager.getIndexFromID('test-A');
            expect(index).toEqual(0);
        });

        it('should return correct indices order from multiple IDs', function() {
            var query = ['test-D', 'test-A', 'test-C'];
            var indices = sampleManager.getIndexFromID(query);
            expect(indices).toEqual([3, 0, 2]);
        });
    });
});


