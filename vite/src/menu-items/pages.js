// assets
// import { IconKey } from '@tabler/icons-react';

// constant
// const icons = {
//   IconKey
// };

// ==============================|| MAIN SIDEBAR MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Main',
  type: 'group',
  children: [
    {
      id: 'meas-station-settings',
      title: 'Meas. station settings',
      type: 'item',
      url: '/dashboard/default',
      breadcrumbs: false
    },
    {
      id: 'spectrotracer',
      title: 'SpectroTRACER',
      type: 'collapse',

      children: [
        {
          id: 'one',
          title: 'Login',
          type: 'item',
     
        },
        {
          id: 'two',
          title: 'Register',
          type: 'item',
     
        }
      ]
    },
    {
      id: 'ftp-forwarding',
      title: 'FTP forwarding',
      type: 'collapse',

      children: [
        {
          id: 'three',
          title: 'Login',
          type: 'item',
        
        },
        {
          id: 'four',
          title: 'Register',
          type: 'item',
       
        }
      ]
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      type: 'collapse',

      children: [
        {
          id: 'five',
          title: 'Login',
          type: 'item',
       
        },
        {
          id: 'six',
          title: 'Register',
          type: 'item',
      
        }
      ]
    },
    {
      id: 'meteo-station-value',
      title: 'Meteo station value',
      type: 'collapse',

      children: [
        {
          id: 'seven',
          title: 'Login',
          type: 'item',
        
        },
        {
          id: 'eight',
          title: 'Register',
          type: 'item',
         
        }
      ]
    },
  ]
};

export default pages;
