/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.3.0): forms/field.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { getUID, isElement } from '../util/index'
import Messages from './messages'
import EventHandler from '../dom/event-handler'
import BaseComponent from '../base-component'
import SelectorEngine from '../dom/selector-engine'
import TemplateFactory from '../util/template-factory'

const NAME = 'field'
const DATA_KEY = 'bs.field'
const EVENT_KEY = `.${DATA_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const CLASS_PREFIX_ERROR = 'invalid'
const CLASS_PREFIX_INFO = 'info'
const CLASS_PREFIX_SUCCESS = 'valid'
const CLASS_FIELD_ERROR = 'is-invalid'
const CLASS_FIELD_SUCCESS = 'is-valid'

const ARIA_DESCRIBED_BY = 'aria-describedby'
const Default = {
  name: null,
  type: 'feedback', // or tooltip
  valid: '', // valid message to add
  invalid: '' // invalid message to add
}

const DefaultType = {
  name: 'string',
  type: 'string',
  valid: 'string',
  invalid: 'string'
}

class Field extends BaseComponent {
  constructor(element, config) {
    super(element, config)
    if (!isElement(this._element)) {
      throw new TypeError(`field "${this._config.name}" not found`)
    }

    this._tipId = getUID(`${this._config.name}-formTip-`)
    this._initialDescribedBy = this._element.getAttribute(ARIA_DESCRIBED_BY) || ''

    this._errorMessages = this._getNewMessagesCollection(CLASS_PREFIX_ERROR, CLASS_FIELD_ERROR)
    this._helpMessages = this._getNewMessagesCollection(CLASS_PREFIX_INFO, '')
    this._successMessages = this._getNewMessagesCollection(CLASS_PREFIX_SUCCESS, CLASS_FIELD_SUCCESS)
    this._initializeMessageCollections()

    EventHandler.on(this._element, EVENT_INPUT, () => {
      this.clearAppended()
    })
  }

  static get NAME() {
    return NAME
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  getElement() {
    return this._element
  }

  getName() {
    return this._config.name
  }

  clearAppended() {
    const appendedFeedback = SelectorEngine.findOne(`#${this._tipId}`, this._element.parentNode)
    if (!appendedFeedback) {
      return
    }

    appendedFeedback.remove()

    this._element.classList.remove(CLASS_FIELD_ERROR, CLASS_FIELD_SUCCESS)

    if (this._initialDescribedBy) {
      this._element.setAttribute(ARIA_DESCRIBED_BY, this._initialDescribedBy)
      return
    }

    this._element.removeAttribute(ARIA_DESCRIBED_BY)
  }

  errorMessages() {
    return this._errorMessages
  }

  helpMessages() {
    return this._helpMessages
  }

  successMessages() {
    return this._successMessages
  }

  appendFeedback(feedback, extraClass) {
    if (!feedback) {
      return
    }

    this.clearAppended()

    if (!(feedback instanceof TemplateFactory)) {
      const config = { content: { div: feedback } }
      feedback = new TemplateFactory(config)
    }

    const feedbackElement = feedback.toHtml()
    feedbackElement.id = this._tipId
    if (extraClass) {
      feedbackElement.classList.add(extraClass)
    }

    this._element.parentNode.append(feedbackElement)

    const describedBy = `${this._initialDescribedBy} ${feedbackElement.id}`.trim()
    this._element.setAttribute(ARIA_DESCRIBED_BY, describedBy)
  }

  _getNewMessagesCollection(classPrefix = '', elementClass = '') {
    const config = {
      extraClass: `${classPrefix}-${this._config.type} ${elementClass}`
    }
    return new Messages(config)
  }

  _initializeMessageCollections() {
    if (this._config.invalid) {
      this.errorMessages().set('default', this._config.invalid)
    }

    if (this._config.valid) {
      this.successMessages().set('default', this._config.valid)
    }
  }
}

export default Field
