import React, {useEffect, useState} from 'react';
import {View} from "@tarojs/components";
import {AtMessage, AtModal} from "taro-ui"

import Taro from "@tarojs/taro";
import moment from 'moment'
import {connect} from "react-redux";
import {shiftTable} from "../../redux/actions/shiftTable";
import {marks, askOff, overtime} from "../../redux/actions/marks";
import {footerTab} from "../../redux/actions/footerTab";
import Calendar from "../calendarV1";

import "taro-ui/dist/style/components/calendar.scss";
import "taro-ui/dist/style/components/modal.scss";
import "taro-ui/dist/style/components/message.scss";

function MyCalendar(props) {
  const [selfShift, setSelfShfit] = useState(undefined)
  const [selfGroup, setSelfGroup] = useState(undefined)
  const [shiftTable, setShiftTable] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(moment().format('yyyy-MM-DD'))
  const [longClick, setLongClick] = useState('')
  const [askIsOpend, setAskIsOpend] = useState(false)
  const [overtimeIsOpend, setOvertimeIsOpend] = useState(false)
  const [askDays, setAskDays] = useState({days: [], nights: []})
  const [overtimeDays, setOvertimeDays] = useState({days: [], nights: []})
  const [nickName, setNickName] = useState('')

  const db = Taro.cloud.database()
  const _ = db.command

  // 获取我的所在组和所在系
  useEffect(() => {
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
  }, [])

  // 获取我的排班
  useEffect(() => {
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
  }, [selfShift])

  // 计算当月排班
  useEffect(() => {
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
  }, [shiftTable, selectedMonth])

  // 获取我的请假加班记录
  useEffect(() => {
    db.collection('checkin')
      .where({
        nickName,
        date: _.lte(moment(selectedMonth).endOf('month').toDate()) && _.gte(moment(selectedMonth).startOf('month').toDate()),
      })
      .get()
      .then(res => {
        const askData = {day: [], night: []}
        const overData = {day: [], night: []}
        res.data.filter(c => c.type === 'askOff').forEach(c => askData[c.shift] = [...askData[c.shift], moment(c.date).format('yyyy-MM-DD')])
        res.data.filter(c => c.type === 'overtime').forEach(c => overData[c.shift] = [...overData[c.shift], moment(c.date).format('yyyy-MM-DD')])
        props.askOff(askData)
        props.overtime(overData)
      }).catch(error => {
      console.log(error)
    })

  }, [nickName, selectedMonth])

  const onDayClick = e => console.log(e)

  const onDayLongClick = e => setLongClick(e.value)

  const onMonthChange = e => setSelectedMonth(moment(e).format('MM') === moment().format('MM') ? e : moment(e).startOf('month').format('yyyy-MM-DD'))

  const onSelectDate = value => {
    const selectedDays = moment(value.end).diff(moment(value.start), 'day')
    if (value.end !== '' && props.footerTabResult === 1) {
      // 这里是请假界面
      let askOffDays = {days: [], nights: []}
      for (let i = 0; i <= selectedDays; i++) {
        const {day, night} = props.shiftTableResult
        askOffDays.days = [...askOffDays.days, ...day.filter(c => moment(c).format('yyyy-MM-DD') === moment(value.start).add(i, 'day').format('yyyy-MM-DD'))]
        askOffDays.nights = [...askOffDays.nights, ...night.filter(c => moment(c).format('yyyy-MM-DD') === moment(value.start).add(i, 'day').format('yyyy-MM-DD'))]

      }
      if (askOffDays.days.length === 0 && askOffDays.nights.length === 0) {
        Taro.atMessage({message: '你选择中的日期中无上班班次，请确认！', type: 'error'})
        return false
      }
      setAskDays(askOffDays)
      setAskIsOpend(true)
    }
    if (value.end !== '' && props.footerTabResult === 2) {
      // 这里是请假界面
      let overtimeDays = []
      for (let i = 0; i <= selectedDays; i++) {
        const {day, night} = props.shiftTableResult
        if (day.includes(moment(value.start).add(i, 'day').format('yyyy-MM-DD')) === false) overtimeDays = [...overtimeDays, moment(value.start).add(i, 'day').format('yyyy-MM-DD')]
        if (night.includes(moment(value.start).add(i, 'day').format('yyyy-MM-DD')) === false) overtimeDays = [...overtimeDays, moment(value.start).add(i, 'day').format('yyyy-MM-DD')]
      }
      overtimeDays = [...new Set(overtimeDays)]

      if (overtimeDays.length === 0) {
        Taro.atMessage({message: '你选择中的日期中有正常班次！', type: 'error'})
        return false
      }
      setOvertimeDays(overtimeDays)
      setOvertimeIsOpend(true)
    }
  }

  const askOffConfirm = () => {
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

  const nightConfirm = () => {
    const overtimes = overtimeDays.map(c => ({
      nickName,
      type: 'overtime',
      createTime: db.serverDate(),
      date: new Date(c),
      shift: 'night'
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

  const dayConfirm = () => {
    console.log('白班')
  }

  return (
    <View>
      <AtMessage/>
      <AtModal
        isOpened={askIsOpend}
        title='请假操作'
        confirmText='确定'
        onClose={() => setAskIsOpend(false)}
        onConfirm={askOffConfirm}
        closeOnClickOverlay={true}
        content={`白班请假${askDays.days.length}天：${askDays.days}\n\n夜班请假${askDays.nights.length}天：${askDays.nights}`}
      />
      <AtModal
        isOpened={overtimeIsOpend}
        title='加班操作'
        confirmText='夜班'
        cancelText='白班'
        onClose={() => setOvertimeIsOpend(false)}
        onConfirm={nightConfirm}
        onCancel={dayConfirm}
        closeOnClickOverlay={true}
      />
      <Calendar
        mode={'normal'}
        marks={props.marksResult.marks}
        extraInfo={props.marksResult.extra}
        minDate={moment().format('yyyy-MM-DD')}
        isMultiSelect
        isVertical
        onDayClick={onDayClick}
        onDayLongPress={onDayLongClick}
        onCurrentViewChange={onMonthChange}
        onSelectDate={onSelectDate}
      />
    </View>
  );
}


export default connect(
  state => ({
    shiftTableResult: state.shiftTable,
    marksResult: state.marks,
    askOffResult: state.askOff,
    overtimeResult: state.overtime,
    footerTabResult: state.footerTab

  }), {shiftTable, askOff, overtime, marks, footerTab}
)(MyCalendar);
