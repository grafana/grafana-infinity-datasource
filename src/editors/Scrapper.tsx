import React, { ChangeEvent } from "react";
import { set } from "lodash";
import { ScrapperColumns } from "./ScrapperColumns";
import { InfinityQuery } from "./../types";

interface ScrapperProps {
    query: InfinityQuery;
    onChange: (value: any) => void;
}

export class Scrapper extends React.PureComponent<ScrapperProps>{
    onInputTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, props: any, splitIntoArray = false) => {
        const { query, onChange } = props;
        const value = splitIntoArray ? event.target.value.split(',') : event.target.value;
        set(query, field, value);
        onChange(query);
    };
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
                <ScrapperColumns onChange={this.props.onChange} query={this.props.query} />
            </>
        )
    }
}