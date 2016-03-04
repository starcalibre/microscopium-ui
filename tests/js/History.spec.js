'use strict';

var History = require('../../app/static/js/History.js');

describe('History', function() {
    var history;

    // reset history object before each spec
    beforeEach(function() {
        history = new History();
    });

    describe('add', function() {
        it('should not add the same item consecutively', function() {
            var actual = [];
            history.add('A');
            history.add('A');
            actual.push(history.back());
            actual.push(history.forward());
            expect(actual).toEqual([null, null]);
        });
    });

    describe('back', function() {
        it('should return null if nothing to return', function() {
            expect(history.back()).toBeNull();
        });

        it('should return null when no more items in history', function() {
            var actual = [];
            history.add('A');
            history.add('B');
            actual.push(history.back());
            actual.push(history.back());
            expect(actual).toEqual(['A', null]);
        });

        it('should return items in expected order', function() {
            var actual = [];
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            actual.push(history.back());
            actual.push(history.back());
            expect(actual).toEqual(['B', 'A']);
        });
    });

    describe('forward', function() {
        it('should return null if nothing to return', function() {
            expect(history.forward()).toBeNull();
        });

        it('should return items in expected order', function() {
            ['A', 'B', 'C'].forEach(function(value) {
                history.add(value);
            });
            var actual = [];
            history.back();
            history.back();
            actual.push(history.forward());
            actual.push(history.forward());
            expect(actual).toEqual(['B', 'C']);
        });

        it('should return null when no more items in history', function() {
            var actual = [];
            history.add('A');
            history.add('B');
            actual.push(history.back());
            actual.push(history.forward());
            actual.push(history.forward());
            expect(actual).toEqual(['A', 'B', null]);
        });

        it('should return the expected order going back, forward and adding',
            function() {
                var actual = [];
                ['A', 'B', 'C'].forEach(function(value) {
                    history.add(value);
                });
                history.back();
                history.add('D');
                actual.push(history.back());
                actual.push(history.back());
                actual.push(history.forward());
                actual.push(history.forward());
                expect(actual).toEqual(['B', 'A', 'B', 'D']);
            }
        );
    });

    describe('reset', function() {
        it('should remove all items from history', function() {
            var actual = [];
            history.reset();
            actual.push(history.back());
            actual.push(history.forward());
            expect(actual).toEqual([null, null]);
        });
    });

    describe('length', function() {
        it('should return the correct length', function() {
            history.add('A');
            history.add('B');
            history.add('C');
            history.back();
            history.add('D');
            history.add('E');
            history.add('F');
            history.back();
            history.add('G');
            expect(history.length).toEqual(5);
        });
    });
});
