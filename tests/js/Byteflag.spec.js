'use strict';
var Byteflag = require('../../app/static/js/utils/Byteflag.js');

describe('Byteflag', function() {
    describe('add', function() {
        it('should add the bit to the flag', function() {
            var expected = (0x01 | 0x02 | 0x04);
            var actual = Byteflag.add((0x01 | 0x02), 0x04);
            expect(actual).toEqual(expected);
        });

        it('should not change the flag if bit already there', function() {
            var expected = (0x01 | 0x02 | 0x04);
            var actual = Byteflag.add((0x01 | 0x02 | 0x04), 0x04);
            expect(actual).toEqual(expected);
        });
    });

    describe('remove', function() {
        it('should remove the bit from the flag when it\'s there', function() {
            var expected = (0x01 | 0x02);
            var actual = Byteflag.remove((0x01 | 0x02 | 0x04), 0x04);
            expect(actual).toEqual(expected);
        });

        it('should return the original bitflag when bit isn\'t there',
            function() {
                var expected = (0x01 | 0x02);
                var actual = Byteflag.remove((0x01 | 0x02), 0x04);
                expect(actual).toEqual(expected);
            }
        );
    });

    describe('check', function() {
        it('should return true when query bit present', function() {
            var flag = (0x01 | 0x02 | 0x04);
            var check = Byteflag.check(flag, 0x04);
            expect(check).toBe(true);
        });

        it('should return false when query bit not present', function() {
            var flag = (0x01 | 0x04);
            var check = Byteflag.check(flag, 0x02);
            expect(check).toBe(false);
        });
    });
});
