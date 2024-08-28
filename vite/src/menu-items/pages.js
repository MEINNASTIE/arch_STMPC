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
          id: 'login3',
          title: 'Login',
          type: 'item',
          url: '/pages/login/login3',
          target: true
        },
        {
          id: 'register3',
          title: 'Register',
          type: 'item',
          url: '/pages/register/register3',
          target: true
        }
      ]
    },
    {
      id: 'ftp-forwarding',
      title: 'FTP forwarding',
      type: 'collapse',

      children: [
        {
          id: 'login3',
          title: 'Login',
          type: 'item',
          url: '/pages/login/login3',
          target: true
        },
        {
          id: 'register3',
          title: 'Register',
          type: 'item',
          url: '/pages/register/register3',
          target: true
        }
      ]
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      type: 'collapse',

      children: [
        {
          id: 'login3',
          title: 'Login',
          type: 'item',
          url: '/pages/login/login3',
          target: true
        },
        {
          id: 'register3',
          title: 'Register',
          type: 'item',
          url: '/pages/register/register3',
          target: true
        }
      ]
    },
    {
      id: 'meteo-station-value',
      title: 'Meteo station value',
      type: 'collapse',

      children: [
        {
          id: 'login3',
          title: 'Login',
          type: 'item',
          url: '/pages/login/login3',
          target: true
        },
        {
          id: 'register3',
          title: 'Register',
          type: 'item',
          url: '/pages/register/register3',
          target: true
        }
      ]
    },
  ]
};

export default pages;
