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
})
