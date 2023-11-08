import Cookies from 'js-cookie'

const defaultSettings = require('../settings.js')

export function getSize() {
    let defaultSize = 'medium'
    if (window.screen.width <= 1300) {
      defaultSize = 'mini'
    }
    const currSize = Cookies.get(defaultSettings.product + '_size') || defaultSize
    return currSize;
}

export function getSizeFontClass() {
    const currSize = getSize();
    if (currSize == 'small') {
      return 'font-size-small'
    } else if (currSize == 'mini') {
      return 'font-size-mini'
    }
    return '';
}
