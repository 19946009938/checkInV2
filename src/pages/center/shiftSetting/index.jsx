import React, {useEffect, useState} from 'react';
import {View, Picker, Button} from "@tarojs/components";
import {AtForm, AtInput, AtList, AtListItem, AtMessage} from 'taro-ui'
import Taro from "@tarojs/taro";
import moment from 'moment'

import "taro-ui/dist/style/components/form.scss";
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/button.scss";
import "taro-ui/dist/style/components/message.scss";

import {SHIFTNAME, SHIFTCATEGORY} from "../../userSetting/constants";

function ShiftSetting(props) {
  const [lastEnd, setLastEnd] = useState({})
  const [categorySelected, setCategorySelected] = useState(SHIFTCATEGORY[0])
  const [shiftSelected, setShfitSelected] = useState(SHIFTNAME[0])
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState('')
  const [firstDate, setFirstDate] = useState('')

  const db = Taro.cloud.database()
  const $ = db.command.aggregate
  const _ = db.command

  // 获取用户权限
  useEffect(() => {
    Taro.getStorage({
      key: 'permissions'
    }).then(res => {
      if (res.data !== 'admin') {
        Taro.atMessage({message: '你没有权限访问该页面', type: 'warning'})
        Taro.reLaunch({url: '/pages/center/index'})
        return false
      }
    })
  }, [])

  // 获取4个系的最后一次排班记录
  useEffect(() => {
    db.collection('shiftTable')
      .aggregate()
      .limit(20)
      .sort({
        shift: 1,
        end: -1
      })
      .group({
        _id: '$shift',
        //获取整条数据
        data: $.first('$$ROOT')
      })
      .end()
      .then(res => {
        setLastEnd(res)
        // 默认A系开始时间
        const lastShfit = res.list.filter(c => c._id === 'A')
        if (lastShfit.length > 0) setStartDate(lastShfit[0].data.end)
      })
      .catch(console.log)

  }, [])

  const onSubmit = e => {
    const value = e[0].detail.value
    value.shift = shiftSelected
    value.category = categorySelected
    startDate instanceof Date ? value.start = startDate : value.start = moment(startDate)
    if (value.end !== null) value.end = moment(value.end).toDate()
    if (value.firstDate !== null) value.firstDate = moment(value.firstDate).toDate()
    console.log(value)
    if (Object.values(value).includes(null)) {
      Taro.atMessage({message: '有必填字段为空', type: 'error'})
      return false
    } else {
      db.collection('shiftTable')
        .add({data: value})
        .then(Taro.reLaunch({url: '/pages/center/index'}))
        .catch(error => Taro.atMessage({message: error.errMsg, type: 'error'}))
    }

    console.log(value)

  }

  const shiftOnChange = e => {
    setShfitSelected(SHIFTNAME[e.detail.value])
    const lastShfit = lastEnd.list.filter(c => c._id === SHIFTNAME[e.detail.value])
    if (lastShfit.length > 0) setStartDate(lastShfit[0].data.end)
  }

  const startOnChange = e => setStartDate(e.detail.value)

  const endOnChange = e => {
    if (startDate > moment(e.detail.value).toDate()) {
      Taro.atMessage({message: '结束时间不允许小于开始时间', type: 'error'})
      return false
    } else {
      setEndDate(moment(e.detail.value).toDate())
    }
  }

  const firstDateOnChange = e => {
    if (startDate > moment(e.detail.value).toDate() || endDate < moment(e.detail.value).toDate()) {
      Taro.atMessage({message: '班组开始时间不允许小于开始时间或不允许大于结束时间', type: 'error'})
      return false
    } else {
      setFirstDate(moment(e.detail.value).toDate())
    }
  }

  const categoryOnChange = e => setCategorySelected(SHIFTCATEGORY[e.detail.value])

  return (
    <View>
      <AtMessage/>
      <AtForm onSubmit={onSubmit}>
        <Picker name='shift' mode='selector' range={SHIFTNAME} onChange={shiftOnChange}>
          <AtList>
            <AtListItem
              title='系'
              extraText={shiftSelected}
            />
          </AtList>
        </Picker>
        <Picker name='category' mode='selector' range={SHIFTCATEGORY} onChange={categoryOnChange}>
          <AtList>
            <AtListItem
              title='类别'
              extraText={categorySelected}
            />
          </AtList>
        </Picker>
        <Picker name='start' mode='date' onChange={startOnChange}>
          <AtList>
            <AtListItem
              title='开始日期'
              extraText={moment(startDate).format('yyyy-MM-DD')}
            />
          </AtList>
        </Picker>
        <Picker name='end' mode='date' onChange={endOnChange}>
          <AtList>
            <AtListItem
              title='结束日期'
              extraText={moment(endDate).format('yyyy-MM-DD')}
            />
          </AtList>
        </Picker>
        <Picker name='firstDate' mode='date' onChange={firstDateOnChange}>
          <AtList>
            <AtListItem
              title='第一个班日期'
              extraText={moment(firstDate).format('yyyy-MM-DD')}
            />
          </AtList>
        </Picker>
        <Button type='primary' formType='submit'>提交</Button>
      </AtForm>
    </View>
  );
}

export default ShiftSetting;
