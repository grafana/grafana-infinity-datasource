import { getGroqResults } from '@/app/GROQProvider';

describe('GROQProvider', () => {
  it('array', async () => {
    let out = await getGroqResults(
      '*',
      JSON.stringify([
        { name: 'foo', age: 12 },
        { name: 'bar', age: 30 },
      ])
    );
    expect(out).toStrictEqual([
      { name: 'foo', age: 12 },
      { name: 'bar', age: 30 },
    ]);
  });
  it('array with props filter', async () => {
    let out = await getGroqResults(
      '*{name}',
      JSON.stringify([
        { name: 'foo', age: 12 },
        { name: 'bar', age: 30 },
      ])
    );
    expect(out).toStrictEqual([{ name: 'foo' }, { name: 'bar' }]);
  });
  it('array with value filter', async () => {
    let out = await getGroqResults(
      '*[age >=20]',
      JSON.stringify([
        { name: 'foo', age: 12 },
        { name: 'bar', age: 30 },
      ])
    );
    expect(out).toStrictEqual([{ name: 'bar', age: 30 }]);
  });
  it('array with props, value filter', async () => {
    let out = await getGroqResults(
      '*[age >=20]{name}',
      JSON.stringify([
        { name: 'foo', age: 12 },
        { name: 'bar', age: 30 },
      ])
    );
    expect(out).toStrictEqual([{ name: 'bar' }]);
  });
  it('array inside object', async () => {
    let out = await getGroqResults(
      '*',
      JSON.stringify({
        users: [
          { name: 'foo', age: 12 },
          { name: 'bar', age: 30 },
        ],
      })
    );
    expect(out).toStrictEqual({
      users: [
        { name: 'foo', age: 12 },
        { name: 'bar', age: 30 },
      ],
    });
  });
  it('array with props filter (proper object)', async () => {
    let out = await getGroqResults('*{name}', [
      { name: 'foo', age: 12 },
      { name: 'bar', age: 30 },
    ]);
    expect(out).toStrictEqual([{ name: 'foo' }, { name: 'bar' }]);
  });
});
