import DefaultTheme from 'vitepress/theme';
import {h} from 'vue';
import StatusBanner from './StatusBanner.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {'layout-top': () => h(StatusBanner)})
};
