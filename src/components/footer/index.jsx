import React, {Component} from 'react';
import {View} from "@tarojs/components";
import {connect} from "react-redux";
import {AtTabBar} from 'taro-ui'

import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/tab-bar.scss";


import {FOOTER, FOOTERICON} from "./constant";
import {footerTab} from "../../redux/actions/footerTab";
import {askOff} from "../../redux/actions/askOff";
import {shiftTable} from "../../redux/actions/shiftTable";
import {marks} from "../../redux/actions/marks";

@connect(state => ({
  footerTabResult: state.footerTab,
  askOffResult: state.askOff,
  shiftTableRuslt: state.shiftTable,
  marksResult: state.marks,
}), {footerTab, askOff, shiftTable, marks})

class Footer extends Component {

  handleClick = (value) => {
    if (value === 0) this.props.marks(this.props.shiftTableRuslt)
    if (value === 1) this.props.marks([])
    this.props.footerTab(value)
  }

  render() {
    return (
      <View>
        <AtTabBar
          fixed
          tabList={FOOTER.map((c, i) => ({title: c, iconType: FOOTERICON[i]}))}
          onClick={this.handleClick}
          current={this.props.footerTabResult}/>
      </View>
    );
  }
}

export default Footer;
