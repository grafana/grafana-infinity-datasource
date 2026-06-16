import { uql } from 'uql';

describe('uql', () => {
  it('nested array parsing', async () => {
    const data = `{
        "totalCount": 3,
        "nextPageKey": "null",
        "resolution": "1h",
        "warnings": [
          "The contains filter transformation is deprecated and will be removed in a future release."
        ],
        "result": [
          {
            "metricId": "builtin:host.disk.avail",
            "dataPointCountRatio": "0.1211",
            "dimensionCountRatio": "0.0322",
            "data": [
              {
                "dimensions": [
                  "HOST-F1266E1D0AAC2C3C",
                  "DISK-F1266E1D0AAC2C3F"
                ],
                "timestamps": [
                  3151435100000,
                  3151438700000,
                  3151442300000
                ],
                "values": [
                  11.1,
                  22.2,
                  33.3
                ]
              },
              {
                "dimensions": [
                  "HOST-F1266E1D0AAC2C3C",
                  "DISK-F1266E1D0AAC2C3D"
                ],
                "timestamps": [
                  3151435100000,
                  3151438700000,
                  3151442300000
                ],
                "values": [
                  111.1,
                  222.2,
                  333.3
                ]
              }
            ]
          },
          {
            "metricId": "builtin:host.cpu.idle",
            "data": [
              {
                "dimensions": [
                  "HOST-F1266E1D0AAC2C3C"
                ],
                "timestamps": [
                  3151435100000,
                  3151438700000,
                  3151442300000
                ],
                "values": [
                  1.1,
                  2.2,
                  3.3
                ]
              }
            ]
          }
        ]
      }`;
    expect(
      await uql(
        `parse-json
          | scope "result"
          | project-away "dataPointCountRatio", "dimensionCountRatio"
          | mv-expand "data"
          | project "dimensions"=array_to_map("data.dimensions",'host','disk'), "series"=array_from_entries('timestamp',"data.timestamps",'value',"data.values"), "metricId"
          | project "host"="dimensions.host", "disk"="dimensions.disk", "series", "metricId"
          | mv-expand "series"
          | project "timestamp"="series.timestamp", "value"="series.value", "host", "disk", "metricId"
          | extend "timestamp"=unixtime_milliseconds_todatetime("timestamp")
          | order by "timestamp" asc`,
        { data }
      )
    ).toStrictEqual([
      { timestamp: new Date('2069-11-11 22:38:20'), disk: 'DISK-F1266E1D0AAC2C3F', host: 'HOST-F1266E1D0AAC2C3C', value: 11.1, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-11 22:38:20'), disk: 'DISK-F1266E1D0AAC2C3D', host: 'HOST-F1266E1D0AAC2C3C', value: 111.1, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-11 22:38:20'), disk: undefined, host: 'HOST-F1266E1D0AAC2C3C', value: 1.1, metricId: 'builtin:host.cpu.idle' },
      { timestamp: new Date('2069-11-11 23:38:20'), disk: 'DISK-F1266E1D0AAC2C3F', host: 'HOST-F1266E1D0AAC2C3C', value: 22.2, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-11 23:38:20'), disk: 'DISK-F1266E1D0AAC2C3D', host: 'HOST-F1266E1D0AAC2C3C', value: 222.2, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-11 23:38:20'), disk: undefined, host: 'HOST-F1266E1D0AAC2C3C', value: 2.2, metricId: 'builtin:host.cpu.idle' },
      { timestamp: new Date('2069-11-12 00:38:20'), disk: 'DISK-F1266E1D0AAC2C3F', host: 'HOST-F1266E1D0AAC2C3C', value: 33.3, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-12 00:38:20'), disk: 'DISK-F1266E1D0AAC2C3D', host: 'HOST-F1266E1D0AAC2C3C', value: 333.3, metricId: 'builtin:host.disk.avail' },
      { timestamp: new Date('2069-11-12 00:38:20'), disk: undefined, host: 'HOST-F1266E1D0AAC2C3C', value: 3.3, metricId: 'builtin:host.cpu.idle' },
    ]);
  });
});
