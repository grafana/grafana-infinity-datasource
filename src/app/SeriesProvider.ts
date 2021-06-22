import { sample } from 'lodash';
import * as math from 'mathjs';
import { InfinityQuery, dataPoint, DataOverride, InfinityQuerySources } from '../types';

const LOREM = `
Lorem ipsum dolor sit amet consectetur adipiscing elit Vivamus nec condimentum ex non volutpat ante Aenean in velit nulla In hac habitasse platea dictumst Vestibulum congue sapien pretium neque condimentum rutrum Sed metus nunc condimentum ut velit non consectetur posuere nulla Phasellus feugiat porttitor odio id laoreet risus tincidunt ac Sed quis felis fermentum pulvinar justo vitae fringilla lacus Etiam molestie urna magna sit amet semper diam pharetra at Aliquam hendrerit enim a varius ullamcorper Nulla eu pulvinar mi

Ut id orci egestas cursus est quis tempor augue Etiam augue erat bibendum at est eget ornare vestibulum nulla Ut feugiat ac lorem nec bibendum Phasellus quis sodales lacus Mauris vehicula nibh purus ac aliquet leo congue non Interdum et malesuada fames ac ante ipsum primis in faucibus In feugiat felis ut dapibus feugiat quam felis congue est et pharetra metus enim nec magna Integer fringilla fringilla urna nec viverra Etiam consectetur pretium sapien eget porta Curabitur volutpat ex eu purus efficitur placerat Vestibulum tempus ac libero id accumsan Maecenas eget lacus non risus eleifend iaculis

Morbi et lectus dapibus porttitor est a molestie erat Donec sit amet vulputate leo In nunc quam elementum vitae nulla vel mattis luctus libero Integer blandit sapien et lectus aliquam commodo Aliquam ac nunc nec turpis pharetra dapibus Suspendisse ac quam nec lorem rhoncus luctus Proin sollicitudin velit vestibulum pellentesque placerat

Interdum et malesuada fames ac ante ipsum primis in faucibus Proin sed placerat leo Praesent eget pharetra lorem et dapibus dui Praesent pellentesque lectus quis velit faucibus sed gravida augue lobortis Praesent sodales venenatis nunc eget mattis Orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus Integer ac sollicitudin tellus sit amet accumsan massa Maecenas quis elit vel lorem porttitor mattis Integer quis eleifend ipsum Phasellus quis nunc id neque venenatis pharetra id eget massa Phasellus ut interdum libero Aliquam non arcu in nulla vulputate tempor

Aliquam enim lacus dapibus quis magna in dapibus efficitur risus Morbi dapibus lacus sed gravida sodales turpis nunc cursus nunc ac egestas dui libero vitae orci Duis feugiat purus at leo commodo et mattis augue sollicitudin Integer lacinia elit arcu in blandit dui facilisis ut Integer non vehicula sapien vel vestibulum metus Nam at metus eget dui eleifend condimentum Aenean dictum at lectus eu facilisis Vivamus posuere mi vitae neque ultrices eu feugiat tortor tristique Vivamus et ornare libero Cras euismod iaculis purus et fermentum nisi tristique ut In eget dolor ac felis sodales rhoncus Pellentesque mattis augue purus at consectetur mi maximus nec Integer eget congue sapien Phasellus imperdiet nunc in sem egestas eu vestibulum felis tempor

Duis mattis leo neque et ultrices sapien convallis nec Duis eget lorem vitae est suscipit posuere Curabitur consequat consectetur augue in iaculis purus sagittis ut Nam tincidunt tortor turpis Fusce fermentum magna eget massa euismod placerat Donec eu turpis ut eros eleifend elementum Quisque viverra in tortor et porta Aenean at magna nisi

Cras et magna augue Duis vitae nisl eget quam tempus mattis Fusce lobortis erat sit amet convallis faucibus dui nisi rutrum neque et hendrerit odio arcu ut odio Cras magna tortor dapibus a neque sed suscipit feugiat leo Phasellus libero nibh posuere ac condimentum tincidunt tristique ut risus Mauris eget massa vulputate vulputate augue eget sagittis urna Phasellus a nunc maximus pharetra leo vitae mattis ipsum

Nullam eu bibendum nulla Duis ut magna ex Praesent lobortis facilisis lectus nec dapibus nisl posuere sagittis Nullam mattis dolor ac eleifend cursus nunc lorem suscipit risus vel volutpat urna velit sit amet arcu Nulla sed tincidunt risus Pellentesque porttitor orci ullamcorper aliquet bibendum lorem nibh ullamcorper sem convallis rhoncus ex sem vitae magna Cras malesuada lectus sed vestibulum dignissim augue arcu vulputate purus non pulvinar lacus ex sit amet erat Praesent fermentum enim nulla a blandit felis ultricies malesuada Duis egestas vulputate odio dignissim dignissim nisi cursus sed Donec est justo hendrerit sed dictum ut ultricies id nisl Vestibulum laoreet libero justo a vulputate lacus facilisis vel Orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus Proin eleifend quam eget velit convallis non porttitor turpis semper

Nunc enim nulla congue vitae feugiat ut fermentum malesuada ex Curabitur nec volutpat arcu Etiam at bibendum nisl Pellentesque dolor purus luctus in velit nec viverra fringilla orci Duis sapien mi posuere ac egestas nec pharetra vel purus Maecenas quis mauris blandit sagittis leo in dignissim sapien Quisque elementum euismod sapien sed fringilla odio ultricies eu Integer eget dolor dapibus feugiat augue eu faucibus diam Integer malesuada eros erat ac commodo lacus suscipit eget Pellentesque nulla mauris ornare at porta cursus pellentesque eu ligula Phasellus varius vestibulum leo in fermentum Vivamus vel elit facilisis condimentum felis ac vestibulum lorem

Sed molestie hendrerit lectus at dapibus ipsum blandit suscipit Nullam vel auctor risus nec auctor ante Fusce condimentum aliquet ante nec tincidunt diam gravida quis Aenean commodo et leo quis lobortis Nam imperdiet orci arcu in aliquam ligula venenatis eu Integer tristique non nibh at tincidunt Nullam rhoncus faucibus dui a gravida mi ullamcorper ac Aliquam erat volutpat Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas Cras dapibus interdum eros id finibus velit rutrum ut Vivamus placerat ex tempor orci facilisis a ullamcorper erat volutpat Nunc magna metus suscipit ac quam vitae auctor convallis lectus Integer id tortor diam

Nam tempus magna nulla vel sollicitudin ligula consectetur ut Orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus Nulla gravida risus eget nulla volutpat varius Donec dictum at orci non mattis Praesent facilisis molestie tincidunt Cras sapien metus scelerisque at enim ut posuere ultrices sem Etiam sit amet urna sit amet felis eleifend sollicitudin nec sed augue Phasellus sed orci pharetra tempus tellus quis laoreet massa Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas Maecenas et rutrum lacus et pellentesque ex Nam sed lorem non ligula ultricies lacinia Vestibulum molestie ornare sem nec finibus
`;

export const RANDOM_WORDS = [
  ...new Set(
    LOREM.replace(/\n/g, '')
      .split(' ')
      .map((a) => a.trim().toLowerCase())
  ),
].filter(Boolean);

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
      let matchingCondition = overrides.find((ov) => {
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
