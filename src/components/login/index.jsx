import React, {useEffect, useState} from 'react';
import {View} from "@tarojs/components";
import {AtModal} from "taro-ui";
import Taro from "@tarojs/taro";

import "taro-ui/dist/style/components/modal.scss";

function Login(props) {
  const [isLogin, setIsLogin] = useState(false)

  // 判断是否为已登录状态
  useEffect(() => {
    Taro.getStorage({
      key: 'userInfo',
      success: (res) => {
        setIsLogin(false)
      }
    }).catch(error => {
      setIsLogin(true)
    })
  }, [])

  const loginConfirm = () => {
    Taro.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log(res.userInfo)
        //  添加用户信息到cookies;
        Taro.setStorage({key: 'userInfo', data: res.userInfo})
        setIsLogin(false)
        // 跳转到用户设置页面
        Taro.reLaunch({url: '/pages/userSetting/index'})
      }
    })
  }

  return (
    <View>
      <AtModal
        isOpened={isLogin}
        title='用户登录'
        confirmText='登录'
        closeOnClickOverlay={false}
        onConfirm={loginConfirm}
      />
    </View>
  );
}

export default Login;

