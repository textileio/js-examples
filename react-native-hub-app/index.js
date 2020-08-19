/**
 * @format
 */

import './shim';
import * as encoding from 'text-encoding';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
