import { FilterOperator } from './../../constants';
import type { GrafanaTableRow, InfinityColumn, InfinityFilter } from './../../types';
import type { SelectableValue } from '@grafana/data';

export const filterOperators: Array<SelectableValue<FilterOperator>> = [
  { label: 'Equals', value: FilterOperator.Equals },
  { label: 'Not Equals', value: FilterOperator.NotEquals },
  { label: 'Contains', value: FilterOperator.Contains },
  { label: 'Not Contains', value: FilterOperator.NotContains },
  { label: 'Starts With', value: FilterOperator.StartsWith },
  { label: 'Ends With', value: FilterOperator.EndsWith },
  { label: 'Equals - Ignore Case', value: FilterOperator.EqualsIgnoreCase },
  { label: 'Not Equals - Ignore Case', value: FilterOperator.NotEqualsIgnoreCase },
  { label: 'Contains - Ignore Case', value: FilterOperator.ContainsIgnoreCase },
  { label: 'Not Contains - Ignore Case', value: FilterOperator.NotContainsIgnoreCase },
  { label: 'Starts With - Ignore Case', value: FilterOperator.StartsWithIgnoreCase },
  { label: 'Ends With - Ignore Case', value: FilterOperator.EndsWithIgnoreCase },
  { label: 'Regex', value: FilterOperator.RegexMatch },
  { label: 'Regex not match', value: FilterOperator.RegexNotMatch },
  { label: 'In', value: FilterOperator.In },
  { label: 'Not In', value: FilterOperator.NotIn },
  { label: '==', value: FilterOperator.NumberEquals },
  { label: '!=', value: FilterOperator.NumberNotEquals },
  { label: '<', value: FilterOperator.NumberLessThan },
  { label: '<=', value: FilterOperator.NumberLessThanOrEqualTo },
  { label: '>', value: FilterOperator.NumberGreaterThan },
  { label: '>=', value: FilterOperator.NumberGreaterThanOrEqualTo },
];

export const filterResults = (rows: GrafanaTableRow[], columns: InfinityColumn[], filters: InfinityFilter[]): GrafanaTableRow[] => {
  return rows.filter((row) => {
    const filterResults: boolean[] = [];
    filters.forEach((filter) => {
      const columnIndex = columns.findIndex((col) => col.text === filter.field);
      switch (filter.operator) {
        case FilterOperator.Equals:
          filterResults.push(row[columnIndex] === filter.value[0]);
          break;
        case FilterOperator.NotEquals:
          filterResults.push(row[columnIndex] !== filter.value[0]);
          break;
        case FilterOperator.Contains:
          filterResults.push((row[columnIndex] + '').indexOf(filter.value[0]) > -1);
          break;
        case FilterOperator.NotContains:
          filterResults.push((row[columnIndex] + '').indexOf(filter.value[0]) === -1);
          break;
        case FilterOperator.StartsWith:
          filterResults.push((row[columnIndex] + '').startsWith(filter.value[0]));
          break;
        case FilterOperator.EndsWith:
          filterResults.push((row[columnIndex] + '').endsWith(filter.value[0]));
          break;
        case FilterOperator.EqualsIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase() === filter.value[0].toLowerCase());
          break;
        case FilterOperator.NotEqualsIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase() !== filter.value[0].toLowerCase());
          break;
        case FilterOperator.ContainsIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase().indexOf(filter.value[0].toLowerCase()) > -1);
          break;
        case FilterOperator.NotContainsIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase().indexOf(filter.value[0].toLowerCase()) === -1);
          break;
        case FilterOperator.StartsWithIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase().startsWith(filter.value[0].toLowerCase()));
          break;
        case FilterOperator.EndsWithIgnoreCase:
          filterResults.push((row[columnIndex] + '').toLowerCase().endsWith(filter.value[0].toLowerCase()));
          break;
        case FilterOperator.RegexMatch:
          filterResults.push(new RegExp(filter.value[0]).test(row[columnIndex] + ''));
          break;
        case FilterOperator.RegexNotMatch:
          filterResults.push(!new RegExp(filter.value[0]).test(row[columnIndex] + ''));
          break;
        case FilterOperator.In:
          filterResults.push((filter.value[0] + '').split(',').includes(row[columnIndex] + ''));
          break;
        case FilterOperator.NotIn:
          filterResults.push(!(filter.value[0] + '').split(',').includes(row[columnIndex] + ''));
          break;
        case FilterOperator.NumberEquals:
          filterResults.push(+(row[columnIndex] + '') === +(filter.value[0] + ''));
          break;
        case FilterOperator.NumberNotEquals:
          filterResults.push(+(row[columnIndex] + '') !== +(filter.value[0] + ''));
          break;
        case FilterOperator.NumberGreaterThan:
          filterResults.push(+(row[columnIndex] + '') > +(filter.value[0] + ''));
          break;
        case FilterOperator.NumberGreaterThanOrEqualTo:
          filterResults.push(+(row[columnIndex] + '') >= +(filter.value[0] + ''));
          break;
        case FilterOperator.NumberLessThan:
          filterResults.push(+(row[columnIndex] + '') < +(filter.value[0] + ''));
          break;
        case FilterOperator.NumberLessThanOrEqualTo:
          filterResults.push(+(row[columnIndex] + '') <= +(filter.value[0] + ''));
          break;
        default:
          break;
      }
    });
    return filterResults.every((v) => v === true);
  });
};
