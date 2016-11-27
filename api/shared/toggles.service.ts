import {ToggleCenter, ToggleOptions} from 'decorator-toggles';
import config from '../../configs/config';
import {Logger} from './logger.service';

let ToggleService = new ToggleCenter(config.toggles);
ToggleService.stream = Logger.stream;

let Toggle = ToggleService.getDecorator();

export {ToggleService, Toggle};