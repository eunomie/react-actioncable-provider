"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = require('react')
var actioncable = require('actioncable')

class ActionCableProvider extends React.Component {
  getChildContext() {
    return {
      cable: this.cable
    }
  }

  componentWillMount() {
    if (this.props.cable) {
      this.cable = this.props.cable
    } else {
      this.cable = actioncable.createConsumer(this.props.url)
    }
  }

  componentWillUnmount() {
    if (!this.props.cable && this.cable) {
      this.cable.disconnect()
    }
  }

  componentWillReceiveProps(nextProps) {
    // Props not changed
    if (this.props.cable === nextProps.cable &&
        this.props.url === nextProps.url) {
      return
    }

    // cable is created by self, disconnect it
    this.componentWillUnmount()

    // create or assign cable
    this.componentWillMount()
  }

  render() {
    return this.props.children
  }
}

ActionCableProvider.displayName = 'ActionCableProvider'

ActionCableProvider.propTypes = {
  cable: React.PropTypes.object,
  url: React.PropTypes.string,
  children: React.PropTypes.any
}

ActionCableProvider.childContextTypes = {
  cable: React.PropTypes.object.isRequired
}

class ActionCable extends React.Component {
  componentDidMount () {
    var self = this;
    var _props = this.props,
        onReceived = _props.onReceived,
        onInitialized = _props.onInitialized,
        onConnected = _props.onConnected,
        onDisconnected = _props.onDisconnected,
        onRejected = _props.onRejected;

    this.cable = this.context.cable.subscriptions.create(
      this.props.channel,
      {
        received: function (data) {
          onReceived && onReceived(data)
        },
        initialized: function () {
          onInitialized && onInitialized()
        },
        connected: function () {
          onConnected && onConnected()
        },
        disconnect: function () {
          onDisconnected && onDisconnected()
        },
        rejected: function () {
          onRejected && onRejected()
        }
      }
    )
  }

  componentWillUnmount() {
    if (this.cable) {
      this.context.cable.subscriptions.remove(this.cable)
      this.cable = null
    }
  }

  send(data) {
    if (!this.cable) {
      throw new Error('ActionCable component unloaded')
    }

    this.cable.send(data)
  }

  perform(action, data) {
    if (!this.cable) {
      throw new Error('ActionCable component unloaded')
    }

    this.cable.perform(action, data)
  }

  render() {
    return null
  }
}

ActionCable.displayName = 'ActionCable'

ActionCable.propTypes = {
  onReceived: React.PropTypes.func,
  onInitialized: React.PropTypes.func,
  onConnected: React.PropTypes.func,
  onDisconnected: React.PropTypes.func,
  onRejected: React.PropTypes.func,
}
ActionCable.contextTypes = {
  cable: React.PropTypes.object.isRequired
}

exports.ActionCable = ActionCableProvider.ActionCable = ActionCable

exports.default = module.exports = ActionCableProvider
