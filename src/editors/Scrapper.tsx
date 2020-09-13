import React, { ChangeEvent } from "react";
import { set, toInteger } from "lodash";
import { Select } from "@grafana/ui"
import { SelectableValue } from "@grafana/data";
import { ScrapColumn, SCRAP_QUERY_RESULT_COLUMN_FORMATS, InfinityQuery } from "./../types";

interface ScrapperProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export class Scrapper extends React.PureComponent<ScrapperProps>{
    onColumnAdd = () => {
        const { query, onChange } = this.props;
        const columns = query.columns || [];
        columns.push({
            text: "",
            selector: "",
            type: "string"
        });
        onChange({ ...query, columns });
    }
    onColumnRemove = (index: number) => {
        const { query, onChange } = this.props;
        const columns = query.columns;
        columns.splice(index, 1);
        onChange({ ...query, columns });
    };
    onInputTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, props: any, splitIntoArray = false) => {
        const { query, onChange } = props;
        const value = splitIntoArray ? event.target.value.split(',') : event.target.value;
        set(query, field, value);
        onChange(query);
    };
    onSelectChange = (selectableItem: SelectableValue, field: string, props: any, format = 'string') => {
        const { query, onChange } = props;
        set(query, field, format === 'number' ? toInteger(selectableItem.value) : selectableItem.value);
        onChange(query);
    }
    render() {
        return (
            <>
                {this.props.query.source === 'url' ? (
                    <div className="gf-form-inline">
                        <div className="gf-form">
                            <label className="gf-form-label query-keyword width-8">URL</label>
                            <input
                                type="text"
                                className="gf-form-input min-width-30"
                                value={this.props.query.url}
                                placeholder="https://jsonplaceholder.typicode.com/todos"
                                onChange={e => this.onInputTextChange(e, `url`, this.props)}
                            ></input>
                        </div>
                    </div>
                ) : (
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <label className="gf-form-label query-keyword width-8">Data</label>
                                <textarea
                                    rows={5}
                                    className="gf-form-input min-width-30"
                                    value={this.props.query.data}
                                    placeholder=""
                                    onChange={e => this.onInputTextChange(e, `data`, this.props)}
                                ></textarea>
                            </div>
                        </div>
                    )}
                {
                    ['html', 'json'].indexOf(this.props.query.type) > -1 ? (
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <label className="gf-form-label query-keyword width-8">Rows / Root</label>
                                <input
                                    type="text"
                                    className="gf-form-input min-width-30"
                                    value={this.props.query.root_selector}
                                    placeholder=""
                                    onChange={e => this.onInputTextChange(e, `root_selector`, this.props)}
                                ></input>
                            </div>
                        </div>
                    ) : <></>
                }
                {this.props.query.columns.length === 0 ? (
                    <div className="gf-form-inline">
                        <div className="gf-form">
                            <div className="gf-form gf-form--grow">
                                <label className="gf-form-label query-keyword width-8" title="Columns">
                                    Columns
								</label>
                            </div>
                        </div>
                        <div className="gf-form">
                            <div className="gf-form gf-form--grow">
                                <span className="btn btn-success btn-small" style={{ marginTop: '5px' }} onClick={() => this.onColumnAdd()}>
                                    Add Columns
								</span>
                            </div>
                        </div>
                    </div>
                ) : null}
                {this.props.query.columns.map((column: ScrapColumn, index: number) => {
                    return (<div>
                        <div className="gf-form-inline">
                            <div className="gf-form">
                                <label className="gf-form-label query-keyword width-8" title="Column">
                                    Column {index + 1}
                                </label>
                                <input
                                    type="text"
                                    className="gf-form-input min-width-8"
                                    value={column.text}
                                    placeholder="Title"
                                    onChange={e => this.onInputTextChange(e, `columns[${index}].text`, this.props)}
                                ></input>
                                <input
                                    type="text"
                                    className="gf-form-input min-width-8"
                                    value={column.selector}
                                    placeholder={this.props.query.type === 'csv' ? 'Column Name' : 'Selector'}
                                    onChange={e => this.onInputTextChange(e, `columns[${index}].selector`, this.props)}
                                ></input>
                                <Select
                                    className="min-width-12 width-12"
                                    value={
                                        SCRAP_QUERY_RESULT_COLUMN_FORMATS.find((field: any) => field.value === column.type)
                                        || { value: 'string', label: 'String' }}
                                    options={SCRAP_QUERY_RESULT_COLUMN_FORMATS}
                                    defaultValue={{ value: 'string', label: 'String' }}
                                    onChange={e => this.onSelectChange(e, `columns[${index}].type`, this.props)}
                                ></Select>
                                <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={() => { this.onColumnAdd(); }}>
                                    +
								</span>
                                <span className="btn btn-danger btn-small" style={{ margin: '5px' }} onClick={() => { this.onColumnRemove(index); }}>
                                    x
								</span>
                            </div>
                        </div>
                    </div>);
                })
                }
            </>
        )
    }
}