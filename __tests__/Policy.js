jest.unmock('../src')
jest.useRealTimers()

import React from 'react'
import { mount } from 'enzyme'

import Policy from '../src'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe('Policy', () => {
  it('should show component if policy validates true', async () => {
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent valid />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should be possible to use single function argument short syntax', async () => {
    const Dumb = props => (<div />)
    const policy = Policy(props => props.valid)
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent valid />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should not show component if policy validates false', async () => {
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(0)
  })

  it('should fire failure callback when validation fails', async () => {
    const failure = jest.fn()
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid, failure })
    const PoliciedComponent = policy(Dumb)
    mount(<PoliciedComponent />)

    await sleep(1)
    expect(failure).toBeCalled()
  })

  it('should show component when using preview setting', () => {
    const Dumb = props => (<div>text content</div>)
    const policy = Policy({ test: props => props.valid, preview: true })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(1)
  })

  it('should show placeholder content while testing', async () => {
    const Dumb = props => (<div />)
    const Placeholder = props => (<div />)
    const policy = Policy({ test: props => props.valid, placeholder: <Placeholder /> })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent valid />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    expect(Wrapper.find(Placeholder).length).toBe(1)

    await sleep(1)

    expect(Wrapper.find(Dumb).length).toBe(1)
    expect(Wrapper.find(Placeholder).length).toBe(0)
  })

  it('should show empty component if policy validates false', async () => {
    const Dumb = props => (<div />)
    const Empty = props => (<div />)
    const policy = Policy({ test: props => props.valid, empty: <Empty /> })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)
    expect(Wrapper.find(Empty).length).toBe(1)

    await sleep(1)

    expect(Wrapper.find(Dumb).length).toBe(0)
    expect(Wrapper.find(Empty).length).toBe(1)
  })

  it('should show component after properties change and test validates true', async () => {
    const Dumb = props => (<div />)
    const policy = Policy({ test: props => props.valid })
    const PoliciedComponent = policy(Dumb)
    const Wrapper = mount(<PoliciedComponent />)

    expect(Wrapper.find(Dumb).length).toBe(0)

    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(0)

    Wrapper.setProps({ valid: true })
    await sleep(1)
    expect(Wrapper.find(Dumb).length).toBe(1)
  })
})
