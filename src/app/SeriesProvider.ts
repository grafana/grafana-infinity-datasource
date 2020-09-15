import { sample } from "lodash";
import * as math from 'mathjs';
import { RANDOM_WORDS } from '../config';
import { InfinityQuery, dataPoint } from '../types';

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
    datapoints: dataPoint[]
    constructor(
        startTime: number,
        endTime: number,
        startFrom: number[] = [0, 20, 50, 70],
        steps: number[] = [-1, 0, 1],
    ) {
        this.datapoints = [];
        let step = getStepFromRange(startTime, endTime);
        let dataPointTime = startTime;
        let value = sample(startFrom) || 0;
        while (dataPointTime < endTime) {
            let valueToAdd = this.datapoints.length === 0 ? 0 : (sample(steps) || 0);
            value += valueToAdd;
            this.datapoints.push([
                value,
                startTime + (this.datapoints.length * step),
            ]);
            dataPointTime = dataPointTime + step;
        }
    }
    mapWithExpression(expression: string = `$i`): dataPoint[] {
        return this.datapoints.map((dp, index) => {
            let expression1 = expression === '' ? '$i' : expression;
            expression1 = expression1.replace(/\${__index}/g, index.toString());
            expression1 = expression1.replace(/\${__value.index}/g, index.toString());
            let value = math.evaluate(expression1, { "$i": index });
            return [value, dp[1]];
        })
    }
}

export class SeriesProvider {
    constructor(private target: InfinityQuery) { }
    query(startTime: number, endTime: number) {
        return new Promise((resolve, reject) => {
            let result = [];
            if (this.target.source === 'random-walk' || this.target.source === 'expression') {
                if (this.target.seriesCount && this.target.seriesCount > 1) {
                    for (let i = 1; i <= this.target.seriesCount; i++) {
                        let seriesName = this.target.alias || sample(RANDOM_WORDS) || "Random Walk";
                        if (seriesName.indexOf('${__series.index}') > -1) {
                            seriesName = seriesName.replace(/\${__series.index}/g, i.toString());
                        } else {
                            seriesName += ` ${this.target.alias ? i : ''}`;
                        }
                        let rw = new RandomWalk(startTime, endTime);
                        let datapoints = rw.datapoints;
                        if (this.target.source === 'expression') {
                            let expression = this.target.expression || `$i`;
                            expression = expression.replace(/\${__series.index}/g, (i - 1).toString());
                            datapoints = rw.mapWithExpression(expression);
                        }
                        result.push({
                            target: seriesName,
                            datapoints,
                        });
                    }
                } else {
                    let rw = new RandomWalk(startTime, endTime);
                    let datapoints = rw.datapoints;
                    if (this.target.source === 'expression') {
                        let expression = this.target.expression || `$i`;
                        expression = expression.replace(/\${__series.index}/g, '0');
                        datapoints = rw.mapWithExpression(expression);
                    }
                    result.push({
                        target: this.target.alias || 'Random Walk',
                        datapoints,
                    });
                }
            }
            resolve(result);
        })
    }
}
