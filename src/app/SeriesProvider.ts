import { sample } from "lodash";
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
}

export class SeriesProvider {
    constructor(private target: InfinityQuery) { }
    query(startTime: number, endTime: number) {
        return new Promise((resolve, reject) => {
            let result = [];
            if (this.target.source === 'random-walk') {
                if (this.target.seriesCount && this.target.seriesCount > 1) {
                    for (let i = 1; i <= this.target.seriesCount; i++) {
                        let seriesName = this.target.alias || sample(RANDOM_WORDS) || "Random Walk";
                        if (seriesName.indexOf('${__index}') > -1) {
                            seriesName = seriesName.replace(/\${__index}/g, i.toString())
                        } else {
                            seriesName += ` ${this.target.alias ? i : ''}`.trim();
                        }
                        let rw = new RandomWalk(startTime, endTime);
                        result.push({
                            target: seriesName,
                            datapoints: rw.datapoints,
                        });
                    }
                } else {
                    let rw = new RandomWalk(startTime, endTime);
                    result.push({
                        target: this.target.alias || 'Random Walk',
                        datapoints: rw.datapoints,
                    });
                }
            }
            resolve(result);
        })
    }
}
