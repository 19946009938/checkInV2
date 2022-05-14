import {ASKOFF} from '../constants'

const initSate = []
export default function askOff(preSate = initSate, action) {
  const {type, data} = action
  switch (type) {
    case ASKOFF:
      return data
    default:
      return preSate
  }
}
