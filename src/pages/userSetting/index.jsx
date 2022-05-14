import React, {useEffect, useState} from 'react';
import Taro from '@tarojs/taro'
import {AtForm, AtList, AtListItem, AtTag, AtMessage} from 'taro-ui'
import {Picker, View, Button} from "@tarojs/components";
import AtAvatar from "taro-ui/rn/components/avatar/index";
import {SHIFTNAME, GROUPNAME} from "./constants";

import "taro-ui/dist/style/components/form.scss";
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/tag.scss";
import "taro-ui/dist/style/components/message.scss";

definePageConfig({
  navigationBarTitleText: '补充用户信息'
})

function UserSetting(props) {
  const [userInfo, setUserInfo] = useState({})
  const [shiftSelected, setShiftSelected] = useState(undefined)
  const [groupSelected, setGroupSelected] = useState(undefined)

  // 获取用户信息
  useEffect(() => {
    Taro.getStorage({
      key: 'userInfo',
      success: (res) => {
        setUserInfo(res.data)
      }
    })

  }, [])


  const shiftSelectorOnChange = e => {
    setShiftSelected(SHIFTNAME[e.detail.value])
  }


  const groupSelectorOnChange = e => {
    setGroupSelected(GROUPNAME[e.detail.value])

  }

  const onSubmit = () => {
    if (shiftSelected === undefined || groupSelected === undefined) {
      Taro.atMessage({message: '请选择后提交', type: 'error'})
    } else {
      const db = Taro.cloud.database()
      db.collection('yeUser').add({
        data: {
          shift: shiftSelected,
          group: groupSelected,
          nickName: userInfo.nickName
        },
        success: (res) => {
          Taro.reLaunch({url: '/pages/index/index'})
        },
        fail: (error) => {
          if (error.errCode === -502001) Taro.atMessage({message: `${userInfo.nickName}已提交完成，请勿重复提交，如有问题，请联系管理员`,type:'error'})
        }
      })
    }

  }

  return (
    <View>
      <AtMessage/>
      <AtAvatar image={userInfo.avatarUrl}/>
      <AtTag>{userInfo.nickName}</AtTag>
      <AtForm onSubmit={onSubmit}>
        <Picker mode={"selector"} range={SHIFTNAME} onChange={shiftSelectorOnChange}>
          <AtList>
            <AtListItem title={'请选择您所在系'} extraText={shiftSelected}/>
          </AtList>
        </Picker>
        <Picker mode={"selector"} range={GROUPNAME} onChange={groupSelectorOnChange}>
          <AtList>
            <AtListItem title={'请选择您所在班组'} extraText={groupSelected}/>
          </AtList>
        </Picker>
        <Button formType='submit'>提交</Button>
      </AtForm>
    </View>


  );
}

export default UserSetting;
