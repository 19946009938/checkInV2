import {Component} from 'react'
import {Provider} from 'react-redux'
import './app.css'
import store from './redux/store'
import Taro from "@tarojs/taro";

Taro.cloud.init({env:'cloud1-6gpynb6xfc0d198e'})

class App extends Component {
  // this.props.children 是将要会渲染的页面
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
