/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.3.0): forms/messages.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */
import TemplateFactory from '../util/template-factory'

class Messages extends Map {
  constructor(templateConfig) {
    super()
    this._templateConfig = templateConfig
  }

  set(key, message) {
    const config = { ...this._templateConfig, content: { div: message } }
    super.set(key, new TemplateFactory(config))
  }

  getFirst() {
    const first = this.values().next()
    return first ? first.value : null
  }

  count() {
    return this.size
  }
}

export default Messages
