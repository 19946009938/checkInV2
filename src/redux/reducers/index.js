import {combineReducers} from "redux";

import askOff from "./askOff";
import footerTab from "./footerTab";
import shiftTable from "./shiftTable";
import marks from "./marks";

export default combineReducers({askOff, footerTab, shiftTable, marks})
