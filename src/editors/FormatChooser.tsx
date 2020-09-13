import React from "react";
import { set, toInteger } from "lodash";
import { Select } from "@grafana/ui";
import { SelectableValue } from "@grafana/data";
import { SCRAP_QUERY_RESULT_FORMATS, InfinityQuery } from "./../types";

interface FormatChooserProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export class FormatChooser extends React.PureComponent<FormatChooserProps> {
    onSelectChange = (selectableItem: SelectableValue, field: string, props: any, format = 'string') => {
        const { query, onChange } = props;
        set(query, field, format === 'number' ? toInteger(selectableItem.value) : selectableItem.value);
        onChange(query);
    }
    render() {
        const query = this.props.query;
        return (
            <div className="gf-form-inline">
                <div className="gf-form">
                    <label className="gf-form-label query-keyword width-8">Format</label>
                    <Select
                        className="min-width-12 width-12"
                        value={
                            SCRAP_QUERY_RESULT_FORMATS.find((field: any) => field.value === query.format)
                            || { value: 'table', label: 'Table' }
                        }
                        options={SCRAP_QUERY_RESULT_FORMATS}
                        defaultValue={{ value: 'table', label: 'Table' }}
                        onChange={e => this.onSelectChange(e, 'format', this.props)}
                    ></Select>
                </div>
            </div>

        )
    }
}