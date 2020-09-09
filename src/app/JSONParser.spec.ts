import { JSONParser } from './JSONParser';

const JSONResults1 = new JSONParser({}, {
    refId: '',
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    url: '',
    root_selector: '',
    columns: []
})
describe('JSONParser', () => {
    it('Basic', () => {
        expect(JSONResults1.toTable().rows.length).toBe(0)
        expect(JSONResults1.toTable().columns.length).toBe(0)
    })
})

const JSONResults2 = new JSONParser([
    {
        name: 'foo',
        age: 20
    },
    {
        name: 'bar',
        age: 25
    }
], {
    refId: '',
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    url: '',
    root_selector: '',
    columns: [
        {
            text: "Name",
            type: "string",
            selector: "name"
        }
    ]
})
describe('JSONParser', () => {
    it('With Columns', () => {
        expect(JSONResults2.toTable().rows.length).toBe(2)
        expect(JSONResults2.toTable().rows[0].length).toBe(1)
        expect(JSONResults2.toTable().rows[1][0]).toBe('bar')
        expect(JSONResults2.toTable().columns.length).toBe(1)
    })
})

const JSONResults3 = new JSONParser({
    id: 'hello',
    users: [
        {
            name: 'foo',
            age: 20
        },
        {
            name: 'bar',
            age: 25
        },
        {
            name: 'baz',
            age: 30
        }
    ]
}, {
    refId: '',
    type: 'json',
    source: 'inline',
    data: '',
    format: 'table',
    url: '',
    root_selector: 'users',
    columns: [
        {
            text: "Name",
            type: "string",
            selector: "name"
        },
        {
            text: "Age",
            type: "string",
            selector: "age"
        }
    ]
})
describe('JSONParser', () => {
    it('With Columns & Root Selctor', () => {
        expect(JSONResults3.toTable().rows.length).toBe(3)
        expect(JSONResults3.toTable().rows[0].length).toBe(2)
        expect(JSONResults3.toTable().rows[1][0]).toBe('bar')
        expect(JSONResults3.toTable().rows[2][1]).toBe(30)
        expect(JSONResults3.toTable().columns.length).toBe(2)
    })
})