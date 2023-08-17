import React from 'react';
import SectionHeading from './home/section-heading';

const uqlSample = `parse-json
| scope "results" <br />| extend "timestamp"="series.timestamp"
| extend "timestamp"=unixtime_milliseconds_todatetime("timestamp")
| order by "timestamp" asc`;

export default function FeaturesGrid() {
  return (
    <div className="p-2 px-8">
      <SectionHeading>Features</SectionHeading>
      <div className="grid auto-rows-20 grid-cols-1 md:grid-cols-6 gap-4">
        <div className="row-span-3 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center grayscale hover:grayscale-0">
          <ul className="">
            <li className="p-2 hover:text-purple-600">JSON</li>
            <li className="p-2 hover:text-green-600">CSV</li>
            <li className="p-2 hover:text-yellow-600">TSV</li>
            <li className="p-2 hover:text-orange-600">GraphQL</li>
            <li className="p-2 hover:text-cyan-600">XML</li>
            <li className="p-2 hover:text-blue-600">HTML</li>
            <li className="p-2 hover:text-purple-600">REST</li>
          </ul>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 md:col-span-2 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center  hover:grayscale-0  hover:text-[rgb(255,215,130)] hover:bg-[rgba(255,215,130,0.1)]">
          <img src="https://www.svgrepo.com/show/286813/key-passkey.svg" className="w-1/3 h-1/3 mx-auto mb-4" />
          <h6 className="text-2xl col-span-2 p-4">
            Authentication ranging <br />
            Basic auth to OAuth2
          </h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 md:col-span-3 grid grid-cols-6  font-bold text-white bg-[rgba(255,255,255,0.05)] hover:grayscale-0 hover:text-cyan-600 hover:bg-[rgba(8,145,178,0.1)]">
          <h6 className="text-2xl font-bold col-span-1 p-2 px-4 m-auto">UQL</h6>
          <div className="col-span-5 overflow-hidden p-2">
            <pre className="text-white my-12">{uqlSample}</pre>
          </div>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(245,222,25,0.1)]">
          <img src="https://www.svgrepo.com/show/373712/json.svg" alt="json" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>JSON</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(52,156,66,0.1)]">
          <img src="https://www.svgrepo.com/show/375309/csv-document.svg" alt="csv" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>CSV</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(252,123,36,0.1)]">
          <img src="https://www.svgrepo.com/show/375305/xml-document.svg" alt="xml" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>XML</h6>
        </div>
        <div className="row-span-2 w-full rounded-xl border-2 border-slate-400/10 p-4 md:col-span-2 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(252,123,36,0.1)]">
          <img src="https://jsonata.org/images/jsonata-button.png" className="w-1/2 mx-auto mb-6" />
          <h6>JSONata parsing and filtering</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(228,79,38,0.1)]">
          <img src="https://www.svgrepo.com/show/373669/html.svg" alt="html" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>HTML</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(229,53,171,0.1)]">
          <img src="https://www.svgrepo.com/show/353834/graphql.svg" alt="graphql" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>GraphQL</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 p-4 col-span-1 grid-cols-6 font-bold text-white bg-[rgba(255,255,255,0.05)] flex flex-col place-content-center justify-center text-center hover:grayscale-0  hover:text-white hover:bg-[rgba(255,255,255,0.1)]">
          <img src="https://www.svgrepo.com/show/362138/rss.svg" alt="rss-atom" className="w-1/2 h-1/2 mx-auto mb-4" />
          <h6>RSS/ATOM</h6>
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Timeseries</h6>
          <img src="https://play.grafana.org/public/app/plugins/panel/timeseries/img/icn-timeseries-panel.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Table</h6>
          <img src="https://play.grafana.org/public/app/plugins/panel/table/img/icn-table-panel.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Logs</h6>
          <img src="https://play.grafana.org/public/app/plugins/panel/logs/img/icn-logs-panel.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Traces</h6>
          <img src="https://play.grafana.org/public/app/plugins/panel/traces/img/traces-panel.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Node Graph</h6>
          <img src="https://play.grafana.org/public/app/plugins/panel/nodeGraph/img/icn-node-graph.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
        <div className="row-span-1 w-full rounded-xl border-2 border-slate-400/10 text-white flex place-content-center justify-center p-4 bg-[rgba(255,255,255,0.05)] flex-col text-center grayscale hover:grayscale-0">
          <h6>Alerting</h6>
          <img src="https://www.svgrepo.com/show/484992/bell-part-2.svg" className="w-1/2 h-1/2 mx-auto my-4" />
        </div>
      </div>
    </div>
  );
}
