jest.unmock('../src')
jest.useRealTimers()

import React from 'react'
import { mount } from 'enzyme'

import Policy, { combine as policies } from '../src'

describe('Combine', () => {
  it('should show component if combined policy validates true', () => {
    const Dumb = props => (<div />)
    const first = Policy({ test: props => props.first })
    const second = Policy({ test: props => props.second })
    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ first: true })
    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ second: true })
    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should hide component if at least one combined policy validates false', () => {
    const Dumb = props => (<div />)
    const first = Policy({ test: props => props.first })
    const second = Policy({ test: props => props.second })
    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ first: true })
    expect(Wrapper.find(Dumb).length).toBe(0)
  })

  it('should have combined policy contexts available to components', () => {
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

    const first = Policy({
      test: props => props.first,
      isTesting: props => !props.first,
      name: 'first',
      preview: true
    })

    const second = Policy({
      test: props => props.second,
      isTesting: props => !props.second,
      name: 'second',
      preview: true
    })

    const PoliciedComponent = policies(first, second)(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.text()).toContain('first{"testing":true')
    expect(Wrapper.text()).toContain('second{"testing":true')

    Wrapper.setProps({ first: true, second: true })

    expect(Wrapper.text()).toContain('second{"testing":false')
    expect(Wrapper.text()).toContain('first{"testing":false')
  })
})
