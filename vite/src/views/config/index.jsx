import React, { useEffect, useState, useCallback } from 'react';
import { Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RightDrawer from './drawers/RightDrawer';
import LeftDrawer from './drawers/LeftDrawer';
import ConfigCard from './card/configCard';

const ITEMS_PER_PAGE = 10;

const ConfigMain = () => {
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);  

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/config/runtime-desc');
      if (!response.ok) throw new Error('Network response was not ok');
  
      const jsonData = await response.json();
      const groups = jsonData.payload?.groups || [];
      const optionLists = jsonData.payload?.common?.optionLists || [];
  
      if (!Array.isArray(groups) || groups.length === 0) {
        throw new Error('Invalid or empty groups array');
      }

      const resolveOptions = (options) => {
        if (typeof options === 'string' && options.startsWith('$ref:')) {
          const refKey = options.replace('$ref:', '').trim();  
          const keys = refKey.split('.');  
      
          let refData = jsonData.payload; 
          for (let key of keys) {
            refData = refData[key];
            if (!refData) {
              return optionLists[keys[0]] || [];  
            }
          }
          return refData || [];
        }
        return options || [];
      };
      
      const updatedGroups = groups.map((group) => {
        return {
          ...group,
          pages: group.pages.map((page) => {
            return {
              ...page,
              fields: page.fields.map((field) => {
                const valNew = field.val?.new ?? field.default;

                return {
                  ...field,
                  options: resolveOptions(field.options),  
                  val: { ...field.val, new: valNew },
                };
              }),
            };
          }),
        };
      });
  
      setData({
        ...jsonData,
        payload: {
          ...jsonData.payload,
          groups: updatedGroups,
        },
      });
  
      if (updatedGroups.length > 0) {
        setSelectedGroup(updatedGroups[0]);
        setSelectedPage(updatedGroups[0].pages[0]);
        setSelectedField(updatedGroups[0].pages[0].fields[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const confirmChanges = useCallback(async () => {
    const inputValues = JSON.parse(localStorage.getItem('inputValues') || '{}');
    const changesToConfirm = Object.values(inputValues).map(item => ({
    gk: item.gk,
    val_rt: item.val_new,
    }));
  
    try {
      const response = await fetch('/api/config/runtime/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changesToConfirm),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Changes confirmed:', result);
      } else {
        console.error('Error confirming changes:', result);
      }
    } catch (error) {
      console.error('Error during API call:', error);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!data) return <Typography variant="h6">Loading...</Typography>;

  const { payload } = data;
  const { groups } = payload;
  
  return (
    <MainCard style={{ width: '100%', display: 'flex', minHeight: '100vh', padding: '10px', position: 'relative' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <LeftDrawer 
          groups={groups} 
          onGroupSelect={(group) => { 
            setSelectedGroup(group); 
            setSelectedPage(group.pages[0]);
            setCurrentPage(0);
          }} 
          onPageSelect={(page) => setSelectedPage(page)} 
        />
        
        <div style={{ width: '100%', overflowY: 'auto', marginTop: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '430px' }}>
          {selectedGroup && selectedPage ? (
            <ConfigCard
              selectedPage={selectedPage}
              selectedGroup={selectedGroup}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              confirmChanges={confirmChanges}
              groups={groups}
            />
          ) : (
            <Typography variant="h6">No pages available for the selected group.</Typography>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', height: '100%', marginTop: '60px' }}>
        <RightDrawer confirmChanges={confirmChanges}/>
      </div>
    </MainCard>
  );
};

export default ConfigMain;
