import {FOOTERTAB} from '../constants'

const initSate = 0
export default function footerTab(preSate = initSate, action) {
  const {type, data} = action
  switch (type) {
    case FOOTERTAB:
      return data
    default:
      return preSate
  }
}
