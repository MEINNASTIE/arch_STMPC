// assets
import { IconClockHour5 } from '@tabler/icons-react';

// constant
const icons = {
    IconClockHour5
};

// ==============================|| TIME BUTTON ||============================== //

const setTime = {
    id: 'setTime',
    type: 'group',
    children: [
      {
        id: 'restart',
        title: 'Set Time',
        icon: icons.IconClockHour5,
        type: 'item',
        breadcrumbs: false
      }
    ]
  };
  
  export default setTime;