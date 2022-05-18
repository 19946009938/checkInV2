import Taro from "@tarojs/taro";
import moment from "moment";

export const addOvertime = (db, nickName, overtimeDays, shift, setOvertimeIsOpend) => {
  const overtimes = overtimeDays.map(c => ({
    nickName,
    type: 'overtime',
    createTime: db.serverDate(),
    date: new Date(c),
    shift
  }))

  overtimes.forEach(c => {
    db.collection('checkin')
      .add({data: c})
      .then(res => {
        Taro.atMessage({message: `加班申请成功！`, type: 'success'})
      })
      .catch(error => {
        console.log(error)
        Taro.atMessage({
          message: `请假操作报错了：${error.errCode === -502001 ? `${c.date}已申请过了` : error.errMsg}`,
          type: 'error'
        })
        return false
      })
  })
  setOvertimeIsOpend(false)
}

export const addAskOff = (db, askDays, nickName, setAskIsOpend) => {
  const days = askDays.days.map(c => ({
    nickName,
    type: 'askOff',
    createTime: db.serverDate(),
    date: new Date(c),
    shift: 'day'
  }))
  const nights = askDays.nights.map(c => ({
    nickName,
    type: 'askOff',
    createTime: db.serverDate(),
    date: new Date(c),
    shift: 'night'
  }))
  const asks = [...days, ...nights]

  asks.forEach(c => {
    db.collection('checkin')
      .add({data: c})
      .then(res => {
        Taro.atMessage({message: `请假申请成功！`, type: 'success'})
      })
      .catch(error => {
        Taro.atMessage({
          message: `请假操作报错了：${error.errCode === -502001 ? `${c.date}已申请过了` : error.errMsg}`,
          type: 'error'
        })
        return false
      })
  })
  setAskIsOpend(false)
}

export const onSelectedDate = (value, props, setAskDays, setAskIsOpend, setOvertimeDays, setOvertimeIsOpend) => {
  if (value.start !== '') {
    setTimeout(() => {
      value.start = ''
      value.end = ''
    }, 2000)
  }
  const selectedDays = moment(value.end).diff(moment(value.start), 'day')
  if (value.end === '') return false
  let askOffDays = {days: [], nights: []}
  let overtimeDays = []
  // 我的排班信息
  const {day, night} = props.shiftTableResult
  for (let i = 0; i <= selectedDays; i++) {
    // 请假日期
    askOffDays.days = [...askOffDays.days, ...day.filter(c => moment(c).format('yyyy-MM-DD') === moment(value.start).add(i, 'day').format('yyyy-MM-DD'))]
    askOffDays.nights = [...askOffDays.nights, ...night.filter(c => moment(c).format('yyyy-MM-DD') === moment(value.start).add(i, 'day').format('yyyy-MM-DD'))]
    // 加班日期
    if (day.includes(moment(value.start).add(i, 'day').format('yyyy-MM-DD')) === false) overtimeDays = [...overtimeDays, moment(value.start).add(i, 'day').format('yyyy-MM-DD')]
    if (night.includes(moment(value.start).add(i, 'day').format('yyyy-MM-DD')) === false) overtimeDays = [...overtimeDays, moment(value.start).add(i, 'day').format('yyyy-MM-DD')]
  }
  if (askOffDays.days.length === 0 && askOffDays.nights.length === 0) {
    setOvertimeDays([...new Set(overtimeDays)])
    setOvertimeIsOpend(true)
  } else if (askOffDays.days.length !== 0 || askOffDays.nights.length !== 0) {
    setAskDays(askOffDays)
    setAskIsOpend(true)
  }

}

export const getOption = (db, _, props, nickName, selectedMonth, setAllHistory) => {
  db.collection('checkin')
    .where({
      date: _.gte(moment(selectedMonth).startOf('month').toDate()).and(_.lte(moment(selectedMonth).endOf('month').toDate())),
    })
    .get()
    .then(res => {
      setAllHistory(res.data)
      const askData = {day: [], night: []}
      const overData = {day: [], night: []}
      res.data.filter(c => c.type === 'askOff' && c.nickName === nickName).forEach(c => askData[c.shift] = [...askData[c.shift], moment(c.date).format('yyyy-MM-DD')])
      res.data.filter(c => c.type === 'overtime' && c.nickName === nickName).forEach(c => overData[c.shift] = [...overData[c.shift], moment(c.date).format('yyyy-MM-DD')])
      props.askOff(askData)
      props.overtime(overData)
    }).catch(error => {
    console.log(error)
  })
}

export const calcShifts = (props, shiftTable, selectedMonth) => {
  if (shiftTable.length === 0) return false
  // 获取当月日期
  const lastDays = moment(selectedMonth).endOf('month').diff(moment(selectedMonth), 'day')

  let dudy = {day: [], night: []}
  for (let i = 0; i <= lastDays; i++) {
    // 4天白班开始还是3天白班开始
    const category = shiftTable.filter(c => c.start <= moment(selectedMonth).add(i, 'day') && c.end > moment(selectedMonth).add(i, 'day'))[0]

    if (category === undefined) continue

    // 第几个班
    const shiftNumber = moment(selectedMonth).add(i, 'day').diff(moment(category.firstDate).add(-28, 'day'), 'day') % 28

    if (category.category === '4' && [0, 1, 2, 3, 7, 8, 9].includes(shiftNumber)) {
      dudy['day'] = [...dudy.day, moment(selectedMonth).add(i, 'day').format('yyyy-MM-DD')]
    } else if (category.category === '4' && [14, 15, 16, 17, 21, 22, 23].includes(shiftNumber)) {
      dudy['night'] = [...dudy.night, moment(selectedMonth).add(i, 'day').format('yyyy-MM-DD')]
    } else if (category.category === '3' && [0, 1, 2, 6, 7, 8, 9].includes(shiftNumber)) {
      dudy['day'] = [...dudy.day, moment(selectedMonth).add(i, 'day').format('yyyy-MM-DD')]
    } else if (category.category === '3' && [14, 15, 16, 20, 21, 22, 23].includes(shiftNumber)) {
      dudy['night'] = [...dudy.night, moment(selectedMonth).add(i, 'day').format('yyyy-MM-DD')]
    }
  }
  props.shiftTable(dudy)
  props.marks(dudy)
}

export const getShfitTables = (db, selfShift, setShiftTable) => {
  if (selfShift === undefined) return false
  db.collection('shiftTable')
    .where({shift: selfShift})
    .get()
    .then(res => {
      setShiftTable(res.data)
    })
    .catch(error => {
      console.log(error)
    })
}

export const getGroups = (db, setNickName, setSelfShfit, setSelfGroup) => {
  Taro.getStorage({
    key: 'userInfo',
    success: (res) => {
      const nickName = res.data.nickName
      setNickName(nickName)
      db.collection('yeUser')
        .where({nickName})
        .get()
        .then(res => {
          const {shift, group} = res.data[0]
          setSelfShfit(shift)
          setSelfGroup(group)
        })
        .catch(error => {
          console.log(res)
        })
    }
  }).catch(error => {
  })
}

// 请假限定
export const askLimits = (allHistory, nickName, askDays) => {
  // 限定请假天数
  const days = 3
  if (allHistory.filter(c => c.nickName === nickName && c.type === 'askOff').length + askDays.days.length + askDays.nights.length > days) {
    Taro.atMessage({message: `请假天数大于${days}天了`, type: 'error'})
    return false
  }

  const askSubOver = (c, type) => {
    const askCounts = allHistory.filter(p => p.type === 'askOff' && p.shift === type && moment(p.date).format('yyyy-MM-DD') === c)
    const overCounts = allHistory.filter(p => p.type === 'overtime' && p.shift === type && moment(p.date).format('yyyy-MM-DD') === c)
    if ((askCounts.length - overCounts.length) > 1) return true
  }

  // 限定请假当天人数，请假人数 - 加班人数 <=1
  const limitDays = askDays.days.map(c => askSubOver(c, 'day'))
  const limitNights = askDays.nights.map(c => askSubOver(c, 'night'))
  if (limitDays.includes(true) || limitNights.includes(true)) {
    Taro.atMessage({message: '当天请假限额已满,如需请假，可邀请同事加班后再试', type: 'warning'})
    return false
  }
  return true
}

export const overLimits = (allHistory, overtimeDays, type) => {
  // 加班确认，请假人数 - 加班人数 >=1,才允许加班
  const askSubOver = (c, type) => {
    const askCounts = allHistory.filter(p => p.type === 'askOff' && p.shift === type && moment(p.date).format('yyyy-MM-DD') === c)
    const overCounts = allHistory.filter(p => p.type === 'overtime' && p.shift === type && moment(p.date).format('yyyy-MM-DD') === c)
    if ((askCounts.length - overCounts.length) < 1) return true
  }
  const limitDays = overtimeDays.map(c => askSubOver(c, type))
  if (limitDays.includes(true)) {
    Taro.atMessage({message: '当天加班限额已满，请联系你的主管', type: 'warning'})
    return false
  }
  return true
}
