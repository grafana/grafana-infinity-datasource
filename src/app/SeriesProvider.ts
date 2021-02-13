import { sample } from 'lodash';
import * as math from 'mathjs';
import { RANDOM_WORDS } from '../config';
import { InfinityQuery, dataPoint, DataOverride, InfinityQuerySources } from '../types';

const getStepFromRange = (startTime: number, endTime: number): number => {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  let range = endTime - startTime;
  let step = MINUTE;
  if (range > 13 * MONTH) {
    step = WEEK;
  } else if (range > 40 * DAY) {
    step = DAY;
  } else if (range > 2 * DAY) {
    step = HOUR;
  } else {
    step = MINUTE;
  }
  return step;
};

class RandomWalk {
  datapoints: dataPoint[];
  constructor(startTime: number, endTime: number, startFrom: number[] = [0, 20, 50, 70], steps: number[] = [-1, 0, 1]) {
    this.datapoints = [];
    let step = getStepFromRange(startTime, endTime);
    let dataPointTime = startTime;
    let value = sample(startFrom) || 0;
    while (dataPointTime < endTime) {
      let valueToAdd = this.datapoints.length === 0 ? 0 : sample(steps) || 0;
      value += valueToAdd;
      this.datapoints.push([value, startTime + this.datapoints.length * step]);
      dataPointTime = dataPointTime + step;
    }
  }
  mapWithExpression(expression = `$i`, points: dataPoint[] = this.datapoints): dataPoint[] {
    return points.map((dp, index) => {
      let expression1 = expression === '' ? '$i' : expression;
      expression1 = expression1.replace(/\${__index}/g, index.toString());
      expression1 = expression1.replace(/\${__value.index}/g, index.toString());
      let value = math.evaluate(expression1, { $i: index });
      return [value, dp[1]];
    });
  }
  overrideDatapoints(overrides: DataOverride[], points: dataPoint[] = this.datapoints) {
    return points.map((dp, index) => {
      let value = dp[0];
      let matchingCondition = overrides.find(ov => {
        let value1 = ov.values[0];
        value1 = value1.replace(/\${__index}/g, index.toString());
        value1 = value1.replace(/\${__value.index}/g, index.toString());
        value1 = value1.replace(/\${__value.value}/g, dp[0] === null ? 'null' : dp[0].toString());
        value1 = math.evaluate(value1, { $i: index });
        let value2 = ov.values[1];
        value2 = value2.replace(/\${__index}/g, index.toString());
        value2 = value2.replace(/\${__value.index}/g, index.toString());
        value2 = value2.replace(/\${__value.value}/g, dp[0] === null ? 'null' : dp[0].toString());
        value2 = math.evaluate(value2, { $i: index });
        let operator = ov.operator;
        switch (operator) {
          case '<':
            return value1 < value2;
          case '<=':
            return value1 <= value2;
          case '>':
            return value1 > value2;
          case '>=':
            return value1 >= value2;
          case '=':
            return value1 === value2;
          case '!=':
            return value1 !== value2;
          default:
            return false;
        }
      });
      if (matchingCondition) {
        let oValue = matchingCondition.override;
        oValue = oValue.replace(/\${__value.value}/g, dp[0] === null ? 'null' : dp[0].toString());
        value = ['null', ''].indexOf(oValue.toLowerCase()) > -1 ? null : math.evaluate(oValue, { $i: index });
      }
      return [value, dp[1]];
    });
  }
}

export class SeriesProvider {
  constructor(private target: InfinityQuery) {}
  query(startTime: number, endTime: number) {
    return new Promise((resolve, reject) => {
      let result = [];
      if (
        this.target.source === InfinityQuerySources.RandomWalk ||
        this.target.source === InfinityQuerySources.Expression
      ) {
        if (this.target.seriesCount && this.target.seriesCount > 1) {
          for (let i = 1; i <= this.target.seriesCount; i++) {
            let seriesName = this.target.alias || sample(RANDOM_WORDS) || 'Random Walk';
            if (seriesName.indexOf('${__series.index}') > -1) {
              seriesName = seriesName.replace(/\${__series.index}/g, i.toString());
            } else {
              seriesName += ` ${this.target.alias ? i : ''}`;
            }
            let rw = new RandomWalk(startTime, endTime);
            let datapoints = rw.datapoints;
            if (this.target.source === InfinityQuerySources.Expression) {
              let expression = this.target.expression || `$i`;
              expression = expression.replace(/\${__series.index}/g, (i - 1).toString());
              datapoints = rw.mapWithExpression(expression);
            }
            result.push({
              target: seriesName,
              datapoints: rw.overrideDatapoints(this.target.dataOverrides || [], datapoints),
            });
          }
        } else {
          let rw = new RandomWalk(startTime, endTime);
          let datapoints = rw.datapoints;
          if (this.target.source === InfinityQuerySources.Expression) {
            let expression = this.target.expression || `$i`;
            expression = expression.replace(/\${__series.index}/g, '0');
            datapoints = rw.mapWithExpression(expression);
          }
          result.push({
            target: this.target.alias || 'Random Walk',
            datapoints: rw.overrideDatapoints(this.target.dataOverrides || [], datapoints),
          });
        }
      }
      resolve(result);
    });
  }
}
