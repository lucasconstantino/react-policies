import React, { Component, PropTypes } from 'react'

let count = 0
const ignore = () => {}

/**
 * @param {Object} config.
 * @param {Function} config.test The testing callback. Should return 'true' if the test
 *                               passed and 'false' otherwise. Can also return a promise.
 *                               Can also throw errors, which will be taken as failure.
 * @param {Function} [config.failure] An optional failure callback.
 * @param {Boolean} [preview=false] If set to 'true' will render the component while
 *                                  the testing process is not finished. Defaults to
 *                                  'false', which means 'placeholder' or 'empty'
 *                                  component will be used instead.
 * @param {Object} [empty=<div />] A component to be rendered when the test fails.
 * @param {Object} [placeholder=null] A component to be redered while the testing process
 *                                    is not finished.
 * @param {Function} [config.shouldUpdate] A callback to determine if policy testing
 *                                         should be re-executed or note. This callback
 *                                         receives two arguments: 'to' and 'from', where
 *                                         'to' equals nextProps and 'from' equals current.
 * @return {Function} A policy decorator.
 */
const Policy = (...configs) => {
  const config = configs
    .map(config => typeof config === 'function' ? { test: config } : config)
    .reduce((prev, next) => ({ ...prev, ...next }), {})

  const {
    name,
    test,
    failure = ignore,
    preview = false,
    empty = <div />,
    placeholder = null,
    shouldUpdate = () => true,
    isTesting = () => false,
  } = config

  const _name = name || (test.name !== 'test' && test.name) || 'policy' + count++

  const HOC = Composed => class PoliciedComponent extends Component {
    static displayName = `PoliciedComponent(${_name}/${Composed.displayName || 'Composed'})`

    static childContextTypes = {
      policy: PropTypes.object
    }

    static contextTypes = {
      policy: PropTypes.object,
    }

    constructor (props, foo, bar) {
      super(props)
      this.state = { testing: true, failed: null }
    }

    test (props) {
      const failed = !test(props)
      const testing = isTesting(props)

      this.setState({ testing, failed })

      if (!testing && failed) failure({ ...this, props })
    }

    componentDidMount () {
      this.test(this.props)
    }

    componentWillReceiveProps (nextProps) {
      if (shouldUpdate.call(this, nextProps)) {
        this.test(nextProps)
      }
    }

    getChildContext () {
      return {
        policy: {
          ...this.context.policy || {},
          [_name]: this.state
        }
      }
    }

    render () {
      const { testing, failed } = this.state

      // 1. In case still testing, not failed, and allowing preview.
      if (testing && preview) return <Composed { ...this.props } />

      // 2. In case still testing and placeholder component available,
      // show placeholder component.
      if (testing && placeholder) return placeholder

      // 3. In case finished testing and not failed, render component.
      if (!failed) return <Composed { ...this.props } />

      // 4. In case finished testing or failed or not previewing,
      // return empty component or null if none given.
      return empty || null
    }
  }

  HOC.derivate = override => Policy(config, override)

  return HOC
}

export default Policy

export const combine = (...policies) => component => [].concat(policies).reverse()
  .reduce((component, policy) => policy(component), component)
