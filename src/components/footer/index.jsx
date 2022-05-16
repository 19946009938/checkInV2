import React, {Component} from 'react';
import {View} from "@tarojs/components";
import {connect} from "react-redux";
import {AtTabBar} from 'taro-ui'

import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/tab-bar.scss";

import {FOOTER, FOOTERICON} from "./constant";
import {footerTab} from "../../redux/actions/footerTab";

@connect(state => ({footerTabResult: state.footerTab,}), {footerTab})

class Footer extends Component {

  handleClick = (value) => this.props.footerTab(value)

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
