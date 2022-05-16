import {MARKS, ASKOFF, OVERTIME, CLEAR} from '../constants'
import {clear} from "../actions/marks";

const initState = {marks: [], extra: []}
export default function marks(preState = initState, action) {
  preState.marks = [...new Set(preState.marks.map(c => JSON.stringify(c)))].map(c => JSON.parse(c))
  preState.extra = [...new Set(preState.extra.map(c => JSON.stringify(c)))].map(c => JSON.parse(c))

  const {type, data} = action
  switch (type) {
    case OVERTIME:
      return {
        marks: [
          ...data.day.map(c => ({value: c, color: 'DeepSkyBlue', markSize: '15px'})),
          ...data.night.map(c => ({value: c, color: 'DeepSkyBlue', markSize: '15px'})),
          ...preState.marks,
        ],
        extra: [
          ...data.day.map(c => ({value: c, color: 'DeepSkyBlue', text: '加白班'})),
          ...data.night.map(c => ({value: c, color: 'DeepSkyBlue', text: '加夜班'})),
          ...preState.extra,
        ]
      }
    case ASKOFF:
      // 把preState放在新数据后面，便于数据渲染
      return {
        marks: [
          ...data.day.map(c => ({value: c, color: 'purple', markSize: '15px'})),
          ...data.night.map(c => ({value: c, color: 'purple', markSize: '15px'})),
          ...preState.marks
        ],
        extra: [
          ...data.day.map(c => ({value: c, color: 'purple', text: '请假'})),
          ...data.night.map(c => ({value: c, color: 'purple', text: '请假'})),
          ...preState.extra
        ],

      }
    case MARKS:
      return {
        marks: [
          ...preState.marks,
          ...data.day.map(c => ({value: c, color: 'green'})),
          ...data.night.map(c => ({value: c, color: 'orange',}))
        ],
        extra: [
          ...preState.extra,
          ...data.day.map(c => ({value: c, color: 'green', text: '白班'})),
          ...data.night.map(c => ({value: c, color: 'orange', text: '夜班'}))
        ]
      }
    case CLEAR:
      return {
        marks: [],
        extra: []
      }
    default:
      return preState
  }
}
