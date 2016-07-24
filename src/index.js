import React, { Component } from 'react'

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
 * @return {Function} A policy decorator.
 */
const Policy = (...configs) => {
  const config = configs
    .map(config => typeof config === 'function' ? { test: config } : config)
    .reduce((prev, next) => ({ ...prev, ...next }), {})

  const {
    test,
    failure = () => {},
    preview = false,
    empty = <div />,
    placeholder = null,
  } = config

  const tester = props => (async () => test(props))().then(result => {
    if (!result || result instanceof Error) throw result
    return result
  })

  const HOC = Composed => {
    const displayName = Composed.displayName || 'Composed'

    return class PoliciedComponent extends Component {
      static displayName = `PoliciedComponent(${displayName})`

      constructor (props, foo, bar) {
        super(props)
        this.state = { tested: false, testing: null, failed: null }
      }

      async test (props) {
        this.setState({ tested: false, testing: true, failed: false })

        try {
          let result = await tester(props)
          this.setState({ tested: true, testing: false, failed: false })
          return result
        } catch (e) {
          this.setState({ tested: true, testing: false, failed: true })
          failure(e)
          throw e
        }
      }

      componentDidMount () {
        this.test(this.props).catch(ignore)
      }

      componentWillReceiveProps (nextProps) {
        this.test(nextProps).catch(ignore)
      }

      render () {
        const { tested, testing, failed } = this.state

        // 1. In case still testing, not failed, and allowing preview.
        if (testing && !failed && preview) return <Composed { ...this.props } />

        // 2. In case still testing and placeholder component available,
        // show placeholder component.
        if (!tested && !failed && placeholder) return placeholder

        // 3. In case finished testing and not failed, render component.
        if (tested && !failed) return <Composed { ...this.props } />

        // 4. In case finished testing or failed or not previewing,
        // return empty component or null if none given.
        return empty || null
      }
    }
  }

  HOC.derivate = override => Policy(config, override)

  return HOC
}

export default Policy

export const combine = (...policies) => component => [].concat(policies)
  .reduce((component, policy) => policy(component), component)
