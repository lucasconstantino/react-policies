jest.unmock('../src')
jest.useRealTimers()

import React from 'react'
import { mount } from 'enzyme'

import Policy, { combine as policies } from '../src'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe('Combine', () => {
  it('should show component if combined policy validates true', async () => {
    const Dumb = props => (<div />)
    const first = Policy({ test: props => props.first })
    const second = Policy({ test: props => props.second })
    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent first second />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should hide component if at least one combined policy validates false', async () => {
    const Dumb = props => (<div />)
    const first = Policy({ test: props => props.first })
    const second = Policy({ test: props => props.second })
    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent first />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(0)
  })

  it('should have combined policy contexts available to components', async () => {
    class Dumb extends React.Component {
      static contextTypes = {
        policy: React.PropTypes.object,
      }

      render () {
        return (
          <dl>
            { Object.keys(this.context.policy || {}).map((name, key) => (
              <div key={ key }>
                <dt>{ name }</dt>
                <dd>{ JSON.stringify(this.context.policy[name]) }</dd>
              </div>
            )) }
          </dl>
        )
      }
    }

    const first = Policy({ test: () => true, name: 'first', preview: true })
    const second = Policy({ test: () => true, name: 'second', preview: true })
    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent first />)

    expect(Wrapper.text()).toContain('second{"tested":false,"testing":true')
    expect(Wrapper.text()).toContain('first{"tested":false,"testing":true')

    await sleep(1)

    expect(Wrapper.text()).toContain('second{"tested":true,"testing":false')
    expect(Wrapper.text()).toContain('first{"tested":true,"testing":false')
  })
})
