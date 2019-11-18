import { find2remove } from '../src/app/service'
import { IProject } from '../dist/app/model.d';

describe('read project config and create', () => {
    const init = [
        {
            column: 0,
            dest: '',
            tab: 'apple'
        },
        {
            column: 0,
            dest: '',
            tab: 'apple'
        },
        {
            column: 0,
            dest: '',
            tab: 'orange'
        },
    ]
    it('remove first element found from array', () => {
        const [removed1, obj1] = find2remove(init, 'apple')
        expect(removed1.length).toEqual(2)
        expect(obj1.tab).toEqual('apple')

        const [removed2, obj2] = find2remove(removed1, 'apple')
        expect(removed2.length).toEqual(1)
        expect(obj2.tab).toEqual('apple')

        expect(() => find2remove(removed2, 'apple')).not.toThrow()

        const [removed3, obj3] = find2remove(removed2, 'apple')
        expect(removed3.length).toEqual(1)
        expect(typeof obj3).toEqual('undefined')

        const [removed4, obj4] = find2remove(removed3, 'orange')
        expect(removed4.length).toEqual(0)
        expect(obj4.tab).toEqual('orange')
    })
})

