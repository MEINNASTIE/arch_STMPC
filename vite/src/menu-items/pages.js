// assets
// import { IconKey } from '@tabler/icons-react';

// constant
// const icons = {
//   IconKey
// };

// ==============================|| MAIN SIDEBAR MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
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
          id: 'settings',
          title: 'Settings',
          type: 'item',
     
        },
        {
          id: 'one',
          title: 'GM Board settings',
          type: 'item',
     
        },
        {
          id: 'two',
          title: 'Alarm setttings',
          type: 'item',
     
        },
        {
          id: 'three',
          title: 'Radio nuclides 1-5',
          type: 'item',
     
        },
        {
          id: 'four',
          title: 'Radio nuclides 6-10',
          type: 'item',
     
        },
        {
          id: 'five',
          title: 'Radio nuclides 11-15',
          type: 'item',
     
        },
        {
          id: 'six',
          title: 'Regions of interest 1-5',
          type: 'item',
     
        },
        {
          id: 'seven',
          title: 'Regions of interest 6-10',
          type: 'item',
     
        },
        {
          id: 'eight',
          title: 'Output formats',
          type: 'item',
     
        },
        {
          id: 'nine',
          title: 'CTBTO settings',
          type: 'item',
     
        },
        {
          id: 'ten',
          title: 'ADAM ANALOG outputs 1-6',
          type: 'item',
     
        },
        {
          id: 'eleven',
          title: 'ADAM DIGITAL outputs 1-6',
          type: 'item',
     
        }
      ]
    },
    {
      id: 'spectrotracer',
      title: 'FTP forwarding',
      type: 'collapse',

      children: [
        {
          id: 'commonSettings',
          title: 'Common settings',
          type: 'item',
        
        },
        {
          id: 'formatsToTransmit',
          title: 'Formats to transmit',
          type: 'item',
       
        },
        {
          id: 'sessionOne',
          title: 'Session1 config',
          type: 'item',
       
        },
        {
          id: 'sessionTwo',
          title: 'Session2 config',
          type: 'item',
       
        }
      ]
    },
    {
      id: 'spectrotracer',
      title: 'Conectivity',
      type: 'collapse',

      children: [
        {
          id: 'connectivitySettings',
          title: 'Connectivity',
          type: 'item',
        },
        {
          id: 'network',
          title: 'Network',
          type: 'item',
        },
        {
          id: 'cellModem',
          title: 'Cell Modem',
          type: 'item',
        },
        {
          id: 'vpn',
          title: 'VPN',
          type: 'item',
        },
      ]
    },
    {
      id: 'spectrotracer',
      title: 'Meteo station value',
      type: 'collapse',
    },
  ]
};

export default pages;
