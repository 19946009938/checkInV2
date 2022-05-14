import {MARKS} from '../constants'

const initSate = []
export default function marks(preSate = initSate, action) {
  const {type, data} = action
  switch (type) {
    case MARKS:
      return [...Object.values(data).flat().map(c => ({value: c}))]
    default:
      return preSate
  }
}
