import {Component} from 'react'
import {View} from '@tarojs/components'
import Login from "../../components/login";
import Footer from "../../components/footer";
import MyCalendar from "../../components/calendar";
import Calendar from '../../components/calendarV1'

export default class Index extends Component {

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
