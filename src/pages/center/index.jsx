import React, {useEffect, useState} from 'react';
import {View} from "@tarojs/components";
import {AtGrid, AtAvatar} from "taro-ui"
import "taro-ui/dist/style/components/grid.scss";
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/avatar.scss";
import "taro-ui/dist/style/components/flex.scss";
import {gridData} from "./constant";
import Taro from "@tarojs/taro";
import {db, $, _} from "../../functions/cloudDB";

function Center(props) {
  const [userInfo, setUserInfo] = useState('')

  // 获取用户头像
  useEffect(() => {
    Taro.getStorage({key: 'userInfo'}).then(res => setUserInfo(res.data)).catch(console.log)
  }, [])

  // 查看用户权限
  useEffect(() => {
    Taro.getStorage({
      key: 'permissions'
    }).then()
      .catch(() => {
        Taro.getStorage({
          key: 'userInfo',
          success: (res) => {
            db.collection('yeUser')
              .where({nickName: res.data.nickName})
              .get()
              .then(res => {
                Taro.setStorage({key: 'permissions', data: res.data[0].permissions})
              })
              .catch(console.log)
          }
        }).catch()
      })
  }, [])

  const onClick = (item, i) => {
    // 跳转到班组设置界面
    if (item.value === '排班设置') Taro.navigateTo({url: '/pages/center/shiftSetting/index'})
    // 跳转到个人设置界面
    if (item.value === '个人设置') Taro.navigateTo({url: `/pages/center/personalSetting/index`})
  }

  return (
    <View>
      <View className='at-row'>
        <View className='at-col'/>
        <AtAvatar image={userInfo.avatarUrl} size='large'>{userInfo.nickName}</AtAvatar>
        <View className='at-col'/>
      </View>

      <AtGrid
        onClick={onClick}
        data={gridData}/>
    </View>
  );
}

export default Center;
