import {Component} from 'react'
import {View} from '@tarojs/components'
import Login from "../../components/login";
import Footer from "../../components/footer";
import MyCalendar from "../../components/calendar";

export default class Index extends Component {
  // 小程序转发功能
  onShareAppMessage(res) {
    if (res.from === 'button') {
    }
    return {
      title: 'F1翻班表小程序转发',
      path: '/pages/index/index'
    }
  }

  render() {
    return (
      <View>
        <Login/>
        <MyCalendar/>
        <Footer/>
      </View>
    )
  }
}
