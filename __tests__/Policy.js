jest.unmock('../src')
jest.useRealTimers()

import React from 'react'
import { mount } from 'enzyme'

import Policy from '../src'

describe('Policy', () => {
  it('should show component if policy validates true', () => {
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent valid />)

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should not show component if policy validates false', () => {
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)
  })

  it('should fire failure callback when validation fails', () => {
    const failure = jest.fn()
    const Dumb = props => (<div />)
    const policy = Policy({
      test: props => props.valid,
      failure
    })

    const PoliciedComponent = policy(Dumb)
    mount(<PoliciedComponent />)

    expect(failure).toBeCalled()
  })

  it('should fire failure callback once validation fails', () => {
    const failure = jest.fn()
    const Dumb = props => (<div />)
    const policy = Policy({
      test: props => props.valid,
      failure
    })

    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent valid />)

    expect(failure).not.toBeCalled()

    Wrapper.setProps({ valid: false })

    expect(failure).toBeCalled()
  })

  it('should show component when using preview setting', () => {
    const Dumb = props => (<div>text content</div>)
    const policy = Policy({
      test: props => props.valid,
      isTesting: props => !props.valid,
      preview: true,
    })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(1)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should show placeholder content while testing', () => {
    const Dumb = props => (<div />)
    const Placeholder = props => (<div />)
    const policy = Policy({
      test: props => props.valid,
      isTesting: props => !props.valid,
      placeholder: <Placeholder />
    })
    const PoliciedComponent = policy(Dumb)

    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    expect(Wrapper.find(Placeholder).length).toBe(1)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
    expect(Wrapper.find(Placeholder).length).toBe(0)
  })

  it('should show empty component if policy validates false', () => {
    const Dumb = props => (<div />)
    const Empty = props => (<div />)
    const policy = Policy({
      test: props => props.valid,
      empty: <Empty />
    })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    expect(Wrapper.find(Empty).length).toBe(1)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
    expect(Wrapper.find(Empty).length).toBe(0)
  })

  it('should show component after properties change and test validates true', () => {
    const Dumb = props => (<div />)
    const policy = Policy({
      test: props => props.valid
    })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should be possible to use single function argument short syntax', () => {
    const Dumb = props => (<div />)
    const policy = Policy(props => props.valid)
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should be possible to create policy derivatives', () => {
    const Dumb = props => (<div />)
    const policy = Policy(props => false)
    const derivative = policy.derivate(props => props.valid)
    const PoliciedComponent = derivative(Dumb)
    const Wrapper = mount(<PoliciedComponent invalid />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should not show component after properties change but prevented change', () => {
    const Dumb = props => (<div />)
    const policy = Policy({
      test: props => props.valid,
      shouldUpdate: () => false
    })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ valid: true })

    expect(Wrapper.find(Dumb).length).toBe(0)
  })

  it('should have policy context available to components', () => {
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

    const policy = Policy({
      test: props => props.valid,
      isTesting: props => !props.valid,
      name: 'name',
      preview: true
    })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.text()).toContain('"testing":true,"failed":true')

    Wrapper.setProps({ valid: true })

    expect(Wrapper.text()).toContain('"testing":false,"failed":false')
  })
})
