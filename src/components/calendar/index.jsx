import React, {useEffect, useState} from 'react';
import {View} from "@tarojs/components";
import {AtCalendar} from "taro-ui"
import Taro from "@tarojs/taro";
import moment from 'moment'
import {connect} from "react-redux";
import {shiftTable} from "../../redux/actions/shiftTable";
import {marks} from "../../redux/actions/marks";

import "taro-ui/dist/style/components/calendar.scss";

function MyCalendar(props) {
  const [selfShift, setSelfShfit] = useState(undefined)
  const [selfGroup, setSelfGroup] = useState(undefined)
  const [shiftTable, setShiftTable] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(moment().format('yyyy-MM-DD'))


  const db = Taro.cloud.database()
  const _ = db.command

  // 获取我的所在组和所在系
  useEffect(() => {
    Taro.getStorage({
      key: 'userInfo',
      success: (res) => {
        const nickName = res.data.nickName
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
  }, [shiftTable, selectedMonth])

  const onDayClick = e => {
    console.log(e.value)
  }

  const onDayLongClick = e => {
    console.log(e.value)
  }

  const onMonthChange = e => {
    setSelectedMonth(e)

  }

  return (
    <View>
      <AtCalendar
        marks={props.marksResult}
        minDate={moment().format('yyyy-MM-DD')}
        isMultiSelect
        isVertical
        onDayClick={onDayClick}
        onDayLongClick={onDayLongClick}
        onMonthChange={onMonthChange}
      />
    </View>
  );
}

export default connect(
  state => ({
    shiftTableResult: state.shiftTable,
    marksResult: state.marks,

  }), {shiftTable, marks}
)(MyCalendar);
