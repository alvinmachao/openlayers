/**
 * @module ol/control/Rotate
 */
import Control from '../control/Control.js';
import {CLASS_CONTROL, CLASS_HIDDEN, CLASS_UNSELECTABLE} from '../css.js';
import {easeOut} from '../easing.js';
import {listen} from '../events.js';
import EventType from '../events/EventType.js';


/**
 * @typedef {Object} Options
 * @property {string} [className='ol-rotate'] CSS class name.
 * @property {string|HTMLElement} [label='⇧'] Text label to use for the rotate button.
 * Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string} [tipLabel='Reset rotation'] Text label to use for the rotate tip.
 * @property {number} [duration=250] Animation duration in milliseconds.
 * @property {boolean} [autoHide=true] Hide the control when rotation is 0.
 * @property {function(module:ol/MapEvent)} [render] Function called when the control should
 * be re-rendered. This is called in a `requestAnimationFrame` callback.
 * @property {function()} [resetNorth] Function called when the control is clicked.
 * This will override the default `resetNorth`.
 * @property {HTMLElement|string} [target] Specify a target if you want the control to be
 * rendered outside of the map's viewport.
 */


/**
 * @classdesc
 * A button control to reset rotation to 0.
 * To style this control use css selector `.ol-rotate`. A `.ol-hidden` css
 * selector is added to the button when the rotation is 0.
 *
 * @api
 */
class Rotate extends Control {

  /**
   * @param {module:ol/control/Rotate~Options=} opt_options Rotate options.
   */
  constructor(opt_options) {

    const options = opt_options ? opt_options : {};

    super({
      element: document.createElement('div'),
      render: options.render || render,
      target: options.target
    });

    const className = options.className !== undefined ? options.className : 'ol-rotate';

    const label = options.label !== undefined ? options.label : '\u21E7';

    /**
     * @type {HTMLElement}
     * @private
     */
    this.label_ = null;

    if (typeof label === 'string') {
      this.label_ = document.createElement('span');
      this.label_.className = 'ol-compass';
      this.label_.textContent = label;
    } else {
      this.label_ = label;
      this.label_.classList.add('ol-compass');
    }

    const tipLabel = options.tipLabel ? options.tipLabel : 'Reset rotation';

    const button = document.createElement('button');
    button.className = className + '-reset';
    button.setAttribute('type', 'button');
    button.title = tipLabel;
    button.appendChild(this.label_);

    listen(button, EventType.CLICK, this.handleClick_, this);

    const cssClasses = className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = this.element;
    element.className = cssClasses;
    element.appendChild(button);

    this.callResetNorth_ = options.resetNorth ? options.resetNorth : undefined;

    /**
     * @type {number}
     * @private
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;

    /**
     * @type {boolean}
     * @private
     */
    this.autoHide_ = options.autoHide !== undefined ? options.autoHide : true;

    /**
     * @private
     * @type {number|undefined}
     */
    this.rotation_ = undefined;

    if (this.autoHide_) {
      this.element.classList.add(CLASS_HIDDEN);
    }

  }

  /**
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick_(event) {
    event.preventDefault();
    if (this.callResetNorth_ !== undefined) {
      this.callResetNorth_();
    } else {
      this.resetNorth_();
    }
  }

  /**
   * @private
   */
  resetNorth_() {
    const map = this.getMap();
    const view = map.getView();
    if (!view) {
      // the map does not have a view, so we can't act
      // upon it
      return;
    }
    if (view.getRotation() !== undefined) {
      if (this.duration_ > 0) {
        view.animate({
          rotation: 0,
          duration: this.duration_,
          easing: easeOut
        });
      } else {
        view.setRotation(0);
      }
    }
  }
}


/**
 * Update the rotate control element.
 * @param {module:ol/MapEvent} mapEvent Map event.
 * @this {module:ol/control/Rotate}
 * @api
 */
export function render(mapEvent) {
  const frameState = mapEvent.frameState;
  if (!frameState) {
    return;
  }
  const rotation = frameState.viewState.rotation;
  if (rotation != this.rotation_) {
    const transform = 'rotate(' + rotation + 'rad)';
    if (this.autoHide_) {
      const contains = this.element.classList.contains(CLASS_HIDDEN);
      if (!contains && rotation === 0) {
        this.element.classList.add(CLASS_HIDDEN);
      } else if (contains && rotation !== 0) {
        this.element.classList.remove(CLASS_HIDDEN);
      }
    }
    this.label_.style.msTransform = transform;
    this.label_.style.webkitTransform = transform;
    this.label_.style.transform = transform;
  }
  this.rotation_ = rotation;
}

export default Rotate;
