declare const Buffer: any;

export const request = (url: string) => {
  return cy.request({
    headers: { Authorization: 'Basic ' + new Buffer.from('infinity' + ':' + 'infinity').toString('base64') },
    url: `/api${url}`,
  });
};

export const query = (query: object, props: { from?: number; to?: number; datasource_uid?: string; datasource_type?: string; username?: string; password?: string } = {}) => {
  const { from = 100, to = 200, datasource_uid = 'Infinity', datasource_type = 'yesoreyeram-infinity-datasource', username = 'infinity', password = 'infinity' } = props;
  return cy.request({
    url: `/api/ds/query`,
    method: 'post',
    headers: {
      Authorization: 'Basic ' + new Buffer.from(username + ':' + password).toString('base64'),
      'content-type': 'application/json',
    },
    body: { from: from.toString(), to: to.toString(), queries: [{ refId: 'A', datasource: { uid: datasource_uid, type: datasource_type }, ...query }] },
  });
};
