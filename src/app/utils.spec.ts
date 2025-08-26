import { DataFrameType, FieldType, MutableDataFrame } from '@grafana/data';
import { toTimeSeriesLong, toTimeSeriesMulti } from './utils';

describe('utils', () => {
  describe('Time Series Transformations', () => {
    describe('toTimeSeriesMulti', () => {
      it('should handle empty input', () => {
        expect(toTimeSeriesMulti([])).toEqual([]);
      });

      it('should handle non-array input', () => {
        expect(toTimeSeriesMulti(null as any)).toEqual(null);
        expect(toTimeSeriesMulti(undefined as any)).toEqual(undefined);
      });

      it('should correctly assign values to value field (bug fix test)', () => {
        // This test specifically validates the bug fix where values were incorrectly assigned
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'time', type: FieldType.time, values: [1000, 2000, 3000] },
            { name: 'value', type: FieldType.number, values: [10, 20, 30] },
          ],
        });

        const result = toTimeSeriesMulti([inputFrame]);

        expect(result).toHaveLength(1);
        const resultFrame = result[0];

        // Check that we have time and value fields
        expect(resultFrame.fields).toHaveLength(2);
        expect(resultFrame.fields[0].name).toBe('time');
        expect(resultFrame.fields[1].name).toBe('value');

        // The critical test: ensure the value field contains the actual values, not time values
        expect(resultFrame.fields[1].values).toEqual([10, 20, 30]);
        // And time field should contain time values
        expect(resultFrame.fields[0].values).toEqual([1000, 2000, 3000]);
      });

      it('should create separate frames for different label combinations', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'time', type: FieldType.time, values: [1000, 2000, 3000, 4000] },
            { name: 'value', type: FieldType.number, values: [10, 20, 30, 40] },
            { name: 'series', type: FieldType.string, values: ['A', 'A', 'B', 'B'] },
          ],
        });

        const result = toTimeSeriesMulti([inputFrame]);

        expect(result).toHaveLength(2);

        // First series (A)
        expect(result[0].fields[0].values).toEqual([1000, 2000]);
        expect(result[0].fields[1].values).toEqual([10, 20]);
        expect(result[0].fields[1].labels).toEqual({ series: 'A' });

        // Second series (B)
        expect(result[1].fields[0].values).toEqual([3000, 4000]);
        expect(result[1].fields[1].values).toEqual([30, 40]);
        expect(result[1].fields[1].labels).toEqual({ series: 'B' });
      });

      it('should skip frames without time field', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'value', type: FieldType.number, values: [10, 20, 30] },
            { name: 'label', type: FieldType.string, values: ['A', 'B', 'C'] },
          ],
        });

        const result = toTimeSeriesMulti([inputFrame]);

        expect(result).toEqual([]);
      });

      it('should handle multiple value fields', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'time', type: FieldType.time, values: [1000, 2000] },
            { name: 'value1', type: FieldType.number, values: [10, 20] },
            { name: 'value2', type: FieldType.number, values: [100, 200] },
          ],
        });

        const result = toTimeSeriesMulti([inputFrame]);

        expect(result).toHaveLength(2);

        // First value field
        expect(result[0].fields[1].name).toBe('value1');
        expect(result[0].fields[1].values).toEqual([10, 20]);

        // Second value field
        expect(result[1].fields[1].name).toBe('value2');
        expect(result[1].fields[1].values).toEqual([100, 200]);
      });

      it('should skip undefined values and null times', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'time', type: FieldType.time, values: [1000, null, 3000] },
            { name: 'value', type: FieldType.number, values: [10, undefined, 30] },
            { name: 'label', type: FieldType.string, values: ['A', 'A', 'A'] },
          ],
        });

        const result = toTimeSeriesMulti([inputFrame]);

        expect(result).toHaveLength(1);
        // Should only include the valid time/value pairs
        expect(result[0].fields[0].values).toEqual([1000, 3000]);
        expect(result[0].fields[1].values).toEqual([10, 30]);
      });
    });

    describe('toTimeSeriesLong', () => {
      it('should handle empty input', () => {
        expect(toTimeSeriesLong([])).toEqual([]);
      });

      it('should handle non-array input', () => {
        expect(toTimeSeriesLong(null as any)).toEqual(null);
        expect(toTimeSeriesLong(undefined as any)).toEqual(undefined);
      });

      it('should skip frames without time field', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [{ name: 'value', type: FieldType.number, values: [10, 20, 30] }],
        });

        const result = toTimeSeriesLong([inputFrame]);

        expect(result).toEqual([]);
      });

      it('should transform wide format to long format', () => {
        const inputFrame = new MutableDataFrame({
          name: 'test',
          refId: 'A',
          fields: [
            { name: 'time', type: FieldType.time, values: [1000, 2000] },
            { name: 'series_a', type: FieldType.number, values: [10, 20], labels: { metric: 'cpu' } },
            { name: 'series_b', type: FieldType.number, values: [30, 40], labels: { metric: 'memory' } },
            { name: 'host', type: FieldType.string, values: ['server1', 'server1'] },
          ],
        });

        const result = toTimeSeriesLong([inputFrame]);

        expect(result).toHaveLength(1);
        const longFrame = result[0];

        // Should have time, value fields, and label fields
        expect(longFrame.fields.some((f) => f.name === 'time')).toBe(true);
        expect(longFrame.fields.some((f) => f.name === 'series_a')).toBe(true);
        expect(longFrame.fields.some((f) => f.name === 'series_b')).toBe(true);
        expect(longFrame.fields.some((f) => f.name === 'host')).toBe(true);
        expect(longFrame.fields.some((f) => f.name === 'metric')).toBe(true);

        // Should have more rows than the original (long format)
        expect(longFrame.length).toBeGreaterThan(inputFrame.length);
      });
    });
  });
});
