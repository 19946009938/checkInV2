import React, {useEffect, useState} from 'react';
import {View} from "@tarojs/components";
import {AtMessage, AtModal, AtNoticebar} from "taro-ui"

import Taro from "@tarojs/taro";
import moment from 'moment'
import {connect} from "react-redux";
import {shiftTable} from "../../redux/actions/shiftTable";
import {marks, askOff, overtime, clear} from "../../redux/actions/marks";
import {footerTab} from "../../redux/actions/footerTab";
import Calendar from "../calendarV1";

import "taro-ui/dist/style/components/calendar.scss";
import "taro-ui/dist/style/components/modal.scss";
import "taro-ui/dist/style/components/message.scss";
import "taro-ui/dist/style/components/noticebar.scss";
import {
  addAskOff,
  addOvertime,
  askLimits,
  calcShifts,
  getGroups,
  getOption,
  getShfitTables,
  onSelectedDate, overLimits, remove
} from "./function";
import {db, _} from "../../functions/cloudDB";

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
  const [removeIsOpened, setRemoveIsOpened] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [allHistory, setAllHistory] = useState([])

  const [clickDay, setClickDay] = useState(moment().startOf('day').format('yyyy-MM-DD'))

  // 获取我的所在组和所在系
  useEffect(() => getGroups(db, setNickName, setSelfShfit, setSelfGroup), [])

  // 获取我的排班
  useEffect(() => getShfitTables(db, selfShift, setShiftTable), [selfShift, refresh])

  // 计算当月排班
  useEffect(() => calcShifts(props, shiftTable, selectedMonth), [shiftTable, selectedMonth, refresh])

  // 获取我的请假加班记录
  useEffect(() => getOption(db, _, props, nickName, selectedMonth, setAllHistory, selfGroup), [nickName, selectedMonth, refresh])

  // 点击我的排班跳转到今天
  useEffect(() => setSelectedMonth(moment().format('yyyy-MM-DD')), [props.footerTabResult])

  // 日期点击
  const onDayClick = e => {
    setClickDay(e.value)

  }

  // 日期长按
  const onDayLongClick = e => {
    setLongClick(e.value)
    setRemoveIsOpened(true)
  }

  //月份改变
  const onMonthChange = e => setSelectedMonth(moment(e).format('MM') === moment().format('MM') ? e : moment(e).startOf('month').format('yyyy-MM-DD'))

  // 多选日期
  const onSelectDate = value => {
    onSelectedDate(value, props, setAskDays, setAskIsOpend, setOvertimeDays, setOvertimeIsOpend, refresh, setRefresh)
    setRefresh(refresh + 1)
  }

  // 请假确认
  const askOffConfirm = () => {
    // 请假限定设置
    if (askLimits(allHistory, nickName, askDays)) {
      addAskOff(db, askDays, nickName, setAskIsOpend, selfGroup)
      setRefresh(refresh + 1)
    }
  }

  // 加夜班确认
  const nightConfirm = () => {
    if (overLimits(allHistory, overtimeDays, 'night')) {
      addOvertime(db, nickName, overtimeDays, 'night', setOvertimeIsOpend, selfGroup)
      setRefresh(refresh + 1)
    }
  }

  // 加白班确认
  const dayConfirm = () => {
    if (overLimits(allHistory, overtimeDays, 'day')) {
      addOvertime(db, nickName, overtimeDays, 'day', setOvertimeIsOpend, selfGroup)
      setRefresh(refresh + 1)
    }
  }

  const removeConfirm = () => remove(nickName, longClick, props, setRemoveIsOpened, setRefresh, refresh)


  return (
    <View>
      <AtMessage/>
      <AtNoticebar>
        {allHistory.filter(c => moment(c.date).format('yyyy-MM-DD') === clickDay).map(c => {
          if (c.type === 'askOff' && c.shift === 'day') return `${c.nickName}白班请假`
          if (c.type === 'askOff' && c.shift === 'night') return `${c.nickName}夜班请假`
          if (c.type === 'overtime' && c.shift === 'day') return `${c.nickName}白班加班`
          if (c.type === 'overtime' && c.shift === 'night') return `${c.nickName}夜班加班`
        }).join('，')}
      </AtNoticebar>
      <AtModal
        isOpened={removeIsOpened}
        title='删除记录'
        confirmText='确定'
        onClose={() => setRemoveIsOpened(false)}
        onConfirm={removeConfirm}
        closeOnClickOverlay={true}
        content={`你确定要删除${longClick}的记录吗？`}
      />
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
        selectedDate={selectedMonth}
        mode={'normal'}
        marks={props.marksResult.marks}
        extraInfo={props.marksResult.extra}
        minDate={moment().format('yyyy-MM-DD')}
        isMultiSelect
        isVertical={false}
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
    clearResult: state.clear,
    overtimeResult: state.overtime,
    footerTabResult: state.footerTab

  }), {shiftTable, askOff, overtime, clear, marks, footerTab}
)(MyCalendar);
