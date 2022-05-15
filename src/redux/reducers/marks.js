import {MARKS, ASKOFF, OVERTIME} from '../constants'

const initSate = {marks: [], extra: []}
export default function marks(preSate = initSate, action) {
  preSate.marks = [...new Set(preSate.marks.map(c=>JSON.stringify(c)))].map(c=>JSON.parse(c))
  preSate.extra = [...new Set(preSate.extra.map(c=>JSON.stringify(c)))].map(c=>JSON.parse(c))

  const {type, data} = action
  switch (type) {
    case OVERTIME:
      return {
        marks: [
          ...preSate.marks,
          ...data.day.map(c => ({value: c, color: 'DeepSkyBlue', markSize: '15px'})),
          ...data.night.map(c => ({value: c, color: 'DeepSkyBlue', markSize: '15px'}))
        ],
        extra: [
          ...preSate.extra,
          ...data.day.map(c => ({value: c, color: 'DeepSkyBlue', text: '加白班'})),
          ...data.night.map(c => ({value: c, color: 'DeepSkyBlue', text: '加夜班'}))
        ]
      }
    case ASKOFF:
      return {
        marks: [
          ...preSate.marks,
          ...data.day.map(c => ({value: c, color: 'purple', markSize: '15px'})),
          ...data.night.map(c => ({value: c, color: 'purple', markSize: '15px'}))
        ],
        extra: [
          ...preSate.extra,
          ...data.day.map(c => ({value: c, color: 'purple', text: '请假'})),
          ...data.night.map(c => ({value: c, color: 'purple', text: '请假'}))
        ]
      }
    case MARKS:
      return {
        marks: [
          ...preSate.marks,
          ...data.day.map(c => ({value: c, color: 'green'})),
          ...data.night.map(c => ({value: c, color: 'orange',}))
        ],
        extra: [
          ...preSate.extra,
          ...data.day.map(c => ({value: c, color: 'green', text: '白班'})),
          ...data.night.map(c => ({value: c, color: 'orange', text: '夜班'}))
        ]
      }
    default:
      return preSate
  }
}
