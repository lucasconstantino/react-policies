# React Policies [![Build Status](https://travis-ci.org/lucasconstantino/react-policies.svg?branch=master)](https://travis-ci.org/lucasconstantino/react-policies)

> Decoupled policy system for React components

## Why?

Many times when developing with React we find the need to control access to a given component. These controls are often needed on multiple components, and not rarely we end up creating other new components solely to fulfill these needs and avoid repeating code.

This module does not intend to do something much different, but instead it provides a simple and unified way to create these policy control rules and apply them to your components.

## Install

`npm install --save react-policies`

## Sample

```js
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Policy from 'react-policies'

const authPolicy = Policy({
  test: props => props.user !== null
})

@authPolicy
class MyControlledComponent extends Component {
  static propTypes = {
    user: PropTypes.string
  }

  render () {
    return <div>User: { this.props.user }</div>
  }
}

class WrapperComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null
    }
  }

  componentDidMount () {
    setTimeout(() => this.setState({ user: 'username' }), 2000)
  }

  render () {
    return <MyControlledComponent user={ this.state.user } />
  }
}

ReactDOM.render(<MyControlledComponent />, document.getElementById('mount'))

```

### Available options

Even though basic usage of this project is quite simple, there are a few configuring options which can highly improve it's flexibility. I recommend you have a look at the [tests](__tests__) to understand all the possibilities.

Here are the basic configurations:

`Policy(config)`

Config key              | Type     | Description
------------------------|----------|-----------
`test`                  | Function | The policy validation function. Should return 'true' if the test passes and 'false' otherwise.
`name`                  | String   | (optional) A name for this policy. Useful when retrieving policy context inside your components.
`failure`               | Function | (optional) A failure callback.
`isTesting`             | Function | (optional) A callback to determine if the test is in progress.
`preview`               | Boolean  | (optional) If set to 'true' will render the component while the testing process is not finished (see "isTesting" argument above). Defaults to 'false', which means 'placeholder' or 'empty' component will be used instead.
`empty`                 | Object   | (optional) A component to be rendered when the test fails. Defaults to an empty `div`.
`placeholder`           | Object   | (optional) A component to be rendered while the testing process is not finished (see "isTesting" argument above).
`shouldUpdate`          | Function | (optional) A callback to determine if policy testing should be re-executed or not. It works much similarly to "shouldComponentUpdate"; it receives "nextProps" as an argument and have current props accessible via "this.props".
`compose`               | Function | (optional) A callback to allow composing the PoliciedComponent. Useful for usage with other HOC or libraries like redux (i.e. 'connect') and react-router (i.e. 'withRouter'). It receives the PoliciedComponent as it's single argument.

> `config` can also be a function, which will be taken for the `test` configuration key.

## Advanced sample, using [react-router](https://github.com/ReactTraining/react-router) and [redux](https://github.com/reactjs/redux)

`/policies/authenticated.js`
```js
import Policy from 'react-policies'
import { connect } from 'react-redux'

const mapStateToProps = ({ user }) => ({ user })

const authenticated = Policy({
  name: 'authenticated',
  test: ({ user }) => !!user,
  compose: PoliciedComponent => connect(mapStateToProps)(PoliciedComponent)
})

export default authenticated
```

On this file we define a reusable generic policy to prevent component access based on the existence of a non-falsy user in the state. The policy uses `compose` option to connect the state to the policy itself - no need for the component that uses this policy to provide the user for checking.

`/policies/enforceLogin.js`
```js
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import authenticated from './authenticated'

const mapStateToProps = ({ loadingUser }) => ({ loadingUser })

const onFailure = ({ router }) => router.push('/user/login')

const enforceLogin = authenticated.derivate(({ compose }) => ({
  name: 'enforceLogin',
  failure: onFailure,
  isTesting: ({ loadingUser }) => loadingUser,
  preview: false,
  compose: PoliciedComponent => compose(withRouter(connect(mapStateToProps)(PoliciedComponent)))
}))

export default enforceLogin
```

This specialized policy is derivative from the previous one. It uses the `derivate` method of the previous policy to create a new policy which will redirect the user to the `/user/login` path when the policy results false.

This policy also verifies if the state has a `loadingUser` flag set to true - this would mean the user information is still loading and the user might actually be already logged in, so the policy won't redirect - nor show it's underlying component - until this flag is changed to false.

The `compose` option is quite robust here: what it does is wrap the `PoliciedComponent` in the `withRouter` higher order component, which will make the router available as property, and does a second `connect` to bring data from the redux state.

From here on, you can use the `enforceLogin` policy on the components served as routes from the `react-router`, and use the `authenticated` policy when you want to hide a component from view but do nothing extra - such as when hidding a `logout` button in the header of the page.

## License

Copyright (c) 2016 Lucas Constantino Silva

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
