import {SHIFTTABLE} from '../constants'

const initSate = []
export default function shiftTable(preSate = initSate, action) {
  const {type, data} = action
  switch (type) {
    case SHIFTTABLE:
      return data
    default:
      return preSate
  }
}
