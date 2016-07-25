# React Policies [![Build Status](https://travis-ci.org/lucasconstantino/react-policies.svg?branch=master)](https://travis-ci.org/lucasconstantino/react-policies)

> Decoupled policy system for React components

## Why?

Many times when developing with React we find the need to control access to a given component. These controls are often needed on multiple components, and not rarely we end up creating other new components solely to fulfill these needs and avoid repeating code.

This module does not intend to do something much different, but instead it provides a simple and unified way to create these policy control rules and apply them to your components.

## Install

`npm install --save react-policies`

## Tutorial

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
`test`                  | Function | The policy validation function. Should return 'true' if the test passed and 'false' otherwise. Can also return a promise. Can also throw errors, which will be taken as failure.
`failure`               | Function | An optional failure callback.
`preview`               | Boolean  | If set to 'true' will render the component while the testing process is not finished. Defaults to 'false', which means 'placeholder' or 'empty' component will be used instead.
`empty`                 | Object   | A component to be rendered when the test fails.
`placeholder`           | Object   | A component to be redered while the testing process is not finished.
`shouldTest`            | Function | A callback to determine if policy testing should be re-executed after properties change. This callback receives two arguments: 'to' and 'from', where 'to' equals nextProps and 'from' equals current.

> `config` can also be a function, which will be taken for the `test` configuration key.

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
