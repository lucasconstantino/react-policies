'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combine = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var count = 0;
var ignore = function ignore() {};

/**
 * @param {Object} config.
 * @param {String} config.name A name for this policy. Useful when retrieving policy context inside your components.
 * @param {Function} config.test The testing callback. Should return 'true' if the test
 *                               passed and 'false' otherwise.
 * @param {Function} [config.failure] An optional failure callback.
 * @param {Function} [config.isTesting] An optional callback to determine if the test is in progress.
 * @param {Boolean} [preview=false] If set to 'true' will render the component while the
 *                                  testing process is not finished (see "isTesting"
 *                                  argument). Defaults to 'false', which means
 *                                  'placeholder' or 'empty' component will be
 *                                  used instead.
 * @param {Object} [empty=<div />] A component to be rendered when the test fails.
 * @param {Object} [placeholder=null] A component to be redered while the testing process
 *                                    is not finished  (see "isTesting" argument above).
 * @param {Function} [config.shouldUpdate] A callback to determine if policy testing
 *                                         should be re-executed or note. It works much
 *                                         similarly to "shouldComponentUpdate"; it
 *                                         receives "nextProps" as an argument and have
 *                                         current props accessible via "this.props".
 * @param {Function} [config.compose] A callback to be called to allow composing the
 *                                    PoliciedComponent. Useful for usage with other
 *                                    HOC or libraries like redux (i.e. 'connect') and
 *                                    react-router (i.e. 'withRouter').
 * @return {Function} A policy decorator.
 */
var Policy = function Policy() {
  for (var _len = arguments.length, configs = Array(_len), _key = 0; _key < _len; _key++) {
    configs[_key] = arguments[_key];
  }

  var config = configs.map(function (config) {
    return typeof config === 'function' ? { test: config } : config;
  }).reduce(function (prev, next) {
    return (0, _extends4.default)({}, prev, next);
  }, {});

  var name = config.name,
      _test = config.test,
      _config$failure = config.failure,
      failure = _config$failure === undefined ? ignore : _config$failure,
      _config$preview = config.preview,
      preview = _config$preview === undefined ? false : _config$preview,
      _config$empty = config.empty,
      empty = _config$empty === undefined ? _react2.default.createElement('div', null) : _config$empty,
      _config$placeholder = config.placeholder,
      placeholder = _config$placeholder === undefined ? null : _config$placeholder,
      _config$shouldUpdate = config.shouldUpdate,
      shouldUpdate = _config$shouldUpdate === undefined ? function () {
    return true;
  } : _config$shouldUpdate,
      _config$isTesting = config.isTesting,
      isTesting = _config$isTesting === undefined ? function () {
    return false;
  } : _config$isTesting,
      _config$compose = config.compose,
      compose = _config$compose === undefined ? function (PoliciedComponent) {
    return PoliciedComponent;
  } : _config$compose;


  var _name = name || _test.name !== 'test' && _test.name || 'policy' + count++;

  var HOC = function HOC(Composed) {
    var _class, _temp;

    var PoliciedComponent = (_temp = _class = function (_Component) {
      (0, _inherits3.default)(PoliciedComponent, _Component);

      function PoliciedComponent(props) {
        (0, _classCallCheck3.default)(this, PoliciedComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PoliciedComponent.__proto__ || (0, _getPrototypeOf2.default)(PoliciedComponent)).call(this, props));

        _this.state = { testing: true, failed: null };
        return _this;
      }

      (0, _createClass3.default)(PoliciedComponent, [{
        key: 'test',
        value: function test(props) {
          var failed = !_test.call(this, props);
          var testing = isTesting.call(this, props);

          this.setState({ testing: testing, failed: failed });

          if (!testing && failed) failure.call(this, props);
        }
      }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.test(this.props);
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (shouldUpdate.call(this, nextProps)) {
            this.test(nextProps);
          }
        }
      }, {
        key: 'getChildContext',
        value: function getChildContext() {
          return {
            policy: (0, _extends4.default)({}, this.context.policy || {}, (0, _defineProperty3.default)({}, _name, this.state))
          };
        }
      }, {
        key: 'render',
        value: function render() {
          var _state = this.state,
              testing = _state.testing,
              failed = _state.failed;

          // 1. In case still testing, not failed, and allowing preview.

          if (testing && preview) return _react2.default.createElement(Composed, this.props);

          // 2. In case still testing and placeholder component available,
          // show placeholder component.
          if (testing && placeholder) return placeholder;

          // 3. In case finished testing and not failed, render component.
          if (!testing && !failed) return _react2.default.createElement(Composed, this.props);

          // 4. In case finished testing or failed or not previewing,
          // return empty component or null if none given.
          return empty || null;
        }
      }]);
      return PoliciedComponent;
    }(_react.Component), _class.displayName = 'PoliciedComponent(' + _name + '/' + (Composed.displayName || 'Composed') + ')', _class.childContextTypes = {
      policy: _react.PropTypes.object
    }, _class.contextTypes = {
      policy: _react.PropTypes.object
    }, _temp);


    return compose(PoliciedComponent);
  };

  HOC.derivate = function (override) {
    return Policy(config, typeof override === 'function' ? override(config) : override);
  };

  return HOC;
};

exports.default = Policy;
var combine = exports.combine = function combine() {
  for (var _len2 = arguments.length, policies = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    policies[_key2] = arguments[_key2];
  }

  return function (component) {
    return [].concat(policies).reverse().reduce(function (component, policy) {
      return policy(component);
    }, component);
  };
};