import { MutableDataFrame, FieldType, DataFrame } from '@grafana/data';
import { applyUQL } from './UQLProvider';

describe('UQLProvider', () => {
  it('basic array', async () => {
    const result = await applyUQL(`parse-json | count`, `[{},{}]`, 'table', 'A');
    const expected = { name: 'A', length: 1, fields: [{ name: 'result', type: FieldType.number, values: [2] }] };
    expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(new MutableDataFrame(expected)));
  });
  it('basic string object', async () => {
    const result = await applyUQL(`parse-json`, `["hello","world"]`, 'table', 'A');
    const expected = { name: 'A', length: 1, fields: [{ name: 'result', type: FieldType.string, values: ['hello', 'world'] }] };
    expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(new MutableDataFrame(expected)));
  });
  it('basic object', async () => {
    const result = await applyUQL(`parse-json | project "name"`, `{ "name": "sriramajeyam","score": 12,"languages": ["tamil", "english", "sourashtra"] , "marks":[1,2] }`, 'table', 'A');
    const expected = { name: 'result', length: 1, fields: [{ name: 'result', type: FieldType.string, values: ['sriramajeyam'] }] };
    expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(new MutableDataFrame(expected)));
  });
  it('jsonata', async () => {
    const result = await applyUQL(`parse-json | jsonata "example.value"`, `{"example": [{ "value": 4 }, { "value": 7 }, { "value": 13 }]}`, 'table', 'A');
    const expected = { name: 'A', length: 1, fields: [{ name: 'result', type: FieldType.number, values: [4, 7, 13] }] };
    expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(new MutableDataFrame(expected)));
  });
  it('basic array with project', async () => {
    const result = await applyUQL(
      `parse-json 
| project "full name"=strcat("name.first",' ',"name.last")
| extend "full name"=toupper("full name"), "full name"=trim("full name")
| order by "full name" asc`,
      `[
{ "name": { "first" :"john", "last" : "doe"} },
{ "name": { "first" :" alice", "last" : "bob "} }
]`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(2);
    expect((result as DataFrame).fields.length).toStrictEqual(1);
    expect((result as DataFrame).fields[0].name).toStrictEqual('full name');
    expect((result as DataFrame).fields[0].values.toArray()).toStrictEqual(['ALICE BOB', 'JOHN DOE']);
  });
  it('basic array with summarize', async () => {
    const result = await applyUQL(
      `parse-json
      | summarize "number of cities"=count(), "total population"=sum("population") by "country"
      | extend "country"=toupper("country")
      | order by "total population" desc`,
      `[
  { "city": "tokyo", "country": "japan", "population": 200 },
  { "city": "newyork", "country": "usa", "population": 60 },
  { "city": "oslo", "country": "usa", "population": 40 },
  { "city": "new delhi", "country": "india", "population": 180 },
  { "city": "mumbai", "country": "india", "population": 150 }
      ]`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(3);
    expect((result as DataFrame).fields.length).toStrictEqual(3);
    expect((result as DataFrame).fields[0].name).toStrictEqual('country');
    expect((result as DataFrame).fields[0].values.toArray()).toStrictEqual(['INDIA', 'JAPAN', 'USA']);
    expect((result as DataFrame).fields[1].name).toStrictEqual('number of cities');
    expect((result as DataFrame).fields[1].values.toArray()).toStrictEqual([2, 1, 2]);
    expect((result as DataFrame).fields[2].name).toStrictEqual('total population');
    expect((result as DataFrame).fields[2].values.toArray()).toStrictEqual([330, 200, 100]);
  });
  it('numeric ops', async () => {
    const result = await applyUQL(
      `parse-json | project "a", "triple"=sum("a","a","a"),"thrice"=mul("a",3), sum("a","b"),  diff("a","b"), mul("a","b")`,
      `[ { "a": 12, "b" : 20 }, { "a" : 6, "b": 32} ]`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(2);
    expect((result as DataFrame).fields.length).toStrictEqual(6);
    expect((result as DataFrame).fields[0].values.toArray()).toStrictEqual([12, 6]);
    expect((result as DataFrame).fields[1].values.toArray()).toStrictEqual([36, 18]);
    expect((result as DataFrame).fields[2].values.toArray()).toStrictEqual([36, 18]);
    expect((result as DataFrame).fields[3].values.toArray()).toStrictEqual([32, 38]);
    expect((result as DataFrame).fields[4].values.toArray()).toStrictEqual([-8, -26]);
    expect((result as DataFrame).fields[5].values.toArray()).toStrictEqual([240, 192]);
  });
  it('csv', async () => {
    const result = await applyUQL(
      `parse-csv
      | extend "population"=tolong("population")
      | summarize "density"=sum("population") by "country"
      | order by "density" desc
      | limit 2`,
      `country,population
india,300
india,1230
china,500
usa,
canada,200`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(2);
    expect((result as DataFrame).fields.length).toStrictEqual(2);
    expect((result as DataFrame).fields[0].name).toStrictEqual('country');
    expect((result as DataFrame).fields[0].values.toArray()).toStrictEqual(['india', 'china']);
    expect((result as DataFrame).fields[1].name).toStrictEqual('density');
    expect((result as DataFrame).fields[1].values.toArray()).toStrictEqual([1530, 500]);
  });
  it('xml', async () => {
    const result = await applyUQL(
      `parse-xml
      | scope "rss.channel.item"
      | extend "pubDate"=todatetime("pubDate")`,
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[Amazon Web Services Service Status]]></title>
    <link>http://status.aws.amazon.com/</link>
    <language>en-us</language>
    <lastBuildDate>Mon, 27 Dec 2021 00:05:42 PST</lastBuildDate>
    <generator>AWS Service Health Dashboard RSS Generator</generator>
    <description><![CDATA[Amazon Web Services Service Status]]></description>
    <ttl>5</ttl>
    <!-- You seem to care about knowing about your events, why not check out https://docs.aws.amazon.com/health/latest/ug/getting-started-api.html -->
    <item>
	  <title><![CDATA[Informational message: [RESOLVED] Internet connectivity]]></title>
	  <link>http://status.aws.amazon.com/</link>
	  <pubDate>Fri, 24 Dec 2021 10:41:17 PST</pubDate>
	  <guid isPermaLink="false">http://status.aws.amazon.com/#internetconnectivity-ap-south-1_1640371277</guid>
	  <description><![CDATA[Between 8:59 AM and 9:32 AM PST and between 9:40 AM and 10:16 AM PST we observed Internet connectivity issues with a network provider outside of our network in the AP-SOUTH-1 Region. This impacted Internet connectivity from some customer networks to the AP-SOUTH-1 Region. Connectivity between EC2 instances and other AWS services within the Region was not impacted by this event. The issue has been resolved and we continue to work with the external provider to ensure it does not reoccur.
]]></description>
	 </item>  
	 <item>
	  <title><![CDATA[Service is operating normally: [RESOLVED] Increased Error Rates with Directory Services AD Connector or Managed AD]]></title>
	  <link>http://status.aws.amazon.com/</link>
	  <pubDate>Wed, 22 Dec 2021 17:57:40 PST</pubDate>
	  <guid isPermaLink="false">http://status.aws.amazon.com/#directoryservice-us-east-1_1640224660</guid>
	  <description><![CDATA[Between 4:09 AM and 5:00 PM PST we experienced increased error rates for some customers using Directory Services AD Connector or Managed AD with Directory Services in US-EAST-1 Region. This also impacted some services, like Amazon WorkSpaces, that can be configured to use Directory Services for user authentication. The issue has been resolved and the service is operating normally. Customers using other Active Directory functionality were not impacted by this issue. If you experience any issues with this service or need further assistance, please contact AWS Support.]]></description>
	 </item>
  </channel>
</rss>`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(2);
    expect((result as DataFrame).fields.length).toStrictEqual(5);
    expect((result as DataFrame).fields[0].name).toStrictEqual('title');
    expect((result as DataFrame).fields[0].values.toArray()[0]).toStrictEqual('Informational message: [RESOLVED] Internet connectivity');
    expect((result as DataFrame).fields[2].values.toArray()[0]).toStrictEqual(new Date('Fri, 24 Dec 2021 10:41:17 PST'));
  });
  it('yaml', async () => {
    const result = await applyUQL(
      `parse-yaml`,
      `---
-
    city: chennai
    country: india
    gdp: 12.3
    population: 123
-
    city: london
    country: uk
    gdp: 23
    population: 1432
`,
      'table',
      'A'
    );
    expect(result.length).toStrictEqual(2);
    expect((result as DataFrame).fields.length).toStrictEqual(4);
    expect((result as DataFrame).fields[0].values.length).toStrictEqual(2);
    expect((result as DataFrame).fields[0].values.toArray()).toStrictEqual(['chennai', 'london']);
    expect((result as DataFrame).fields[2].values.toArray()).toStrictEqual([12.3, 23]);
  });
});
