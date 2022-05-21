import React, {useEffect, useState} from 'react';
import {View, Picker, Button} from "@tarojs/components";
import {GROUPNAME, SHIFTNAME} from "../../userSetting/constants";
import {AtForm, AtList, AtListItem, AtMessage} from "taro-ui";
import Taro from "@tarojs/taro";
import {db} from "../../../functions/cloudDB";

function PersonalSetting(props) {
  const [shiftSelected, setShiftSelected] = useState('')
  const [groupSelected, setGroupSelected,] = useState('')
  const [userInfo, setUserInfo] = useState({})

  // 获取userInfo
  useEffect(() => {
    Taro.getStorage({key: 'userInfo'})
      .then(res => setUserInfo(res.data))
      .catch(console.log)
  }, [])

  const shiftOnChange = e => setShiftSelected(SHIFTNAME[e.detail.value])

  const groupOnChange = e => setGroupSelected(GROUPNAME[e.detail.value])

  const onSubmit = (val) => {
    const data = val[0].detail.value
    if (Object.values(data).includes(null)) {
      Taro.atMessage({message: '必填字段我能为空', type: 'error'})
      return false
    }

    console.log(userInfo.nickName)

    db.collection('yeUser')
      .where({nickName: userInfo.nickName})
      .update({
        data: {
          group: GROUPNAME[data.group],
          shift: SHIFTNAME[data.shift]
        }
      }).then(Taro.reLaunch({url:'/pages/index/index'}))
      .catch(console.log)


  }

  const onReset = (val) => {
    setShiftSelected('')
    setGroupSelected('')
  }

  return (
    <View>
      <AtMessage/>
      <AtForm onSubmit={onSubmit} onReset={onReset}>
        <Picker name='shift' mode='selector' range={SHIFTNAME} onChange={shiftOnChange}>
          <AtList>
            <AtListItem
              title='所在系'
              extraText={shiftSelected}
            />
          </AtList>
        </Picker>
        <Picker name='group' mode='selector' range={GROUPNAME} onChange={groupOnChange}>
          <AtList>
            <AtListItem
              title='所在组'
              extraText={groupSelected}
            />
          </AtList>
        </Picker>
        <Button formType='submit' type='primary'>提交</Button>
        <Button formType='reset'>重置</Button>
      </AtForm>
    </View>
  );
}

export default PersonalSetting;
