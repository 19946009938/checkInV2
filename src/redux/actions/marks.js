import {MARKS,ASKOFF,OVERTIME} from '../constants'

export const marks = data => ({type: MARKS, data})
export const askOff = data => ({type: ASKOFF, data})
export const overtime = data => ({type: OVERTIME, data})
