import {MARKS,ASKOFF,OVERTIME,CLEAR} from '../constants'

export const marks = data => ({type: MARKS, data})
export const askOff = data => ({type: ASKOFF, data})
export const overtime = data => ({type: OVERTIME, data})
export const clear = data => ({type: CLEAR, data})
