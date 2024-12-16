import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, FormControl, Select, MenuItem, TextField, Button, Box, Card, CardContent, Chip, Checkbox } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RightDrawer from './drawers/RightDrawer';
import LeftDrawer from './drawers/LeftDrawer';
import { debounce } from 'lodash';

const ITEMS_PER_PAGE = 50;

const ConfigMain = () => {
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/config/runtime-desc');
      if (!response.ok) throw new Error('Network response was not ok');
  
      const jsonData = await response.json();
      console.log(jsonData);
      const groups = jsonData.payload?.groups || [];
      const optionLists = jsonData.payload?.common?.optionLists || {};
  
      if (!Array.isArray(groups) || groups.length === 0) {
        throw new Error('Invalid or empty groups array');
      }
  
      const updatedGroups = groups.map(group => ({
        ...group,
        pages: group.pages.map(page => ({
          ...page,
          fields: page.fields.map(field => {
            let resolvedOptions = field.options;
            if (typeof resolvedOptions === 'string' && resolvedOptions.startsWith('$ref:')) {
              const refKey = resolvedOptions.replace('$ref:', '').trim();
              resolvedOptions = optionLists[refKey] || [];
            }
  
            const storedField = localStorage.getItem(field.gk || field.label);
            let storedData = {};
            if (storedField) {
              try {
                storedData = JSON.parse(storedField);
              } catch (error) {
                console.error(`Error parsing localStorage for ${field.gk || field.label}:`, error);
              }
            }
  
            const valNew = storedData?.new ?? field.val?.new ?? field.default;
  
            return {
              ...field,
              options: resolvedOptions,
              val: { ...field.val, new: valNew }, 
            };
          }),
        })),
      }));
  
      setData({
        ...jsonData,
        payload: {
          ...jsonData.payload,
          groups: updatedGroups,
        },
      });
  
      if (updatedGroups.length > 0) {
        setSelectedGroup(updatedGroups[0]);
      } else {
        console.warn('No groups available to select');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data) {
      const savedFields = JSON.parse(localStorage.getItem('selectedFields')) || [];
      setSelectedFields(savedFields);
    }
  }, [data]);

  const handleFieldChange = (groupIndex, pageIndex, fieldIndex, newValue) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      const group = updatedData.payload.groups[groupIndex];
      const page = group?.pages[pageIndex];
      const field = page?.fields[fieldIndex];
  
      if (!field) {
        console.warn(`Field not found for indices: ${groupIndex}, ${pageIndex}, ${fieldIndex}`);
        return prevData;
      }
  
      field.val_new = newValue;
  
      setSelectedFields((prevSelected) => {
        const updatedSelected = [...prevSelected];
        const fieldIndexInSelected = updatedSelected.findIndex((item) => item.label === field.label);
  
        if (fieldIndexInSelected !== -1) {
          updatedSelected[fieldIndexInSelected].value = newValue;
        } else {
          updatedSelected.push({ label: field.label, value: newValue });
        }
  
        localStorage.setItem('selectedFields', JSON.stringify(updatedSelected));
        return updatedSelected;
      });
  
      return updatedData;
    });
  
    saveDebounced(groupIndex, pageIndex, fieldIndex, newValue);
  };  
  
  const saveDebounced = useMemo(
    () =>
      debounce((groupIndex, pageIndex, fieldIndex, newValue) => {
        const field = data.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
        localStorage.setItem(field.label, JSON.stringify({ ...field.val, new: newValue }));
      }, 500),
    []
  );  

  const findFieldByLabel = (label) => {
    for (const group of data?.payload.groups || []) {
      for (const page of group.pages || []) {
        const field = page.fields.find((field) => field.label === label);
        if (field) return field;
      }
    }
    return null;
  };  

  const handleSave = useCallback(() => {
    const selectedFieldValues = selectedFields.map(label => {
      const field = findFieldByLabel(label);
      return { label, value: field?.val };
    });
    localStorage.setItem('savedValues', JSON.stringify(selectedFieldValues));
  }, [selectedFields]);

  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(group);
    setCurrentPage(0); 
  }, []);

  const paginatedFields = useMemo(() => {
    if (!selectedGroup || !Array.isArray(selectedGroup.pages)) return [];
    const allFields = selectedGroup.pages.flatMap((page) => page.fields || []);
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
  
    return allFields.slice(start, end);
  }, [selectedGroup, currentPage]);
  

  const handleCheckboxChange = useCallback((groupIndex, pageIndex, fieldIndex, isChecked) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
  
      setSelectedFields((prevSelected) => {
        let updatedSelected;
        if (isChecked) {
          updatedSelected = [...prevSelected, { label: field.label, value: field.val }];
        } else {
          updatedSelected = prevSelected.filter((item) => item.label !== field.label);
        }
  
        localStorage.setItem('selectedFields', JSON.stringify(updatedSelected));
        return updatedSelected;
      });
  
      return updatedData;
    });
  }, []);

  if (!data) return <Typography variant="h6">Loading...</Typography>;
  const { payload } = data;
  const { groups } = payload;
  
  return (
      <MainCard style={{ width: '100%', display: 'flex', minHeight: '100vh', padding: '10px', position: 'relative', }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <LeftDrawer groups={groups} onGroupSelect={handleGroupSelect} />
        <div style={{ width: '100%', overflowY: 'auto', marginTop: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '430px' }}>
        { !selectedGroup || !Array.isArray(selectedGroup.pages) ? (
            <Typography variant="h6">No pages available for the selected group.</Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '80px', paddingLeft: '100px',
                }} >
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                  Editable values
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                  Active in system
                </Typography>
              </Box>
              {selectedGroup.pages.map((pageIndex) => (
                <Card key={pageIndex}>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {paginatedFields.map((field, fieldIndex) => {
                        const resolvedOptions =
                          Array.isArray(field.options) ? field.options :
                          field.options?.startsWith('$ref:') ? common.optionLists?.[field.options.split(':')[1]] : [];

                        return (
                          <div key={fieldIndex} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px',}}>
                            {/* Label */}
                            <Typography variant="body1" style={{ marginBottom: '5px', flex: 5, textAlign: 'right' }}>
                              {field.label}:
                            </Typography>
                            {/* Checkbox */}
                            <Checkbox checked={selectedFields.some((f) => f.label === field.label)} onChange={(e) => handleCheckboxChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.checked)}/>
                            {/* Editable Input */}
                            {field.type === 'select' ? (
                              <FormControl fullWidth size="small" style={{ flex: 6 }}>
                                <Select value={field.val?.new || field.default || ''} onChange={(e) => handleFieldChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.value)}>
                                  {resolvedOptions?.map((option, optIndex) => (
                                    <MenuItem key={optIndex} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            ) : (
                              <TextField variant="outlined" size="small" value={field.val?.new || field.default || ''} onChange={(e) => handleFieldChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.value)} fullWidth style={{ flex: 6 }}/>)}
                            {/* Active System Value */}
                            <TextField variant="outlined" size="small" value={field.val?.rt?.[0]?.val || ''} fullWidth style={{ flex: 6 }} disabled />
                            {/* State Chip */}
                            <Chip
                              label={
                                field.val?.state === 'R'
                                  ? 'Rejected'
                                  : field.val?.state === 'A'
                                  ? 'Applied'
                                  : field.val?.state === 'P'
                                  ? 'Pending'
                                  : 'Unknown'
                              }
                              color={
                                field.val?.state === 'R'
                                  ? 'error'
                                  : field.val?.state === 'A'
                                  ? 'success'
                                  : field.val?.state === 'P'
                                  ? 'warning'
                                  : 'default'
                              }
                              size="small"
                              style={{ flex: 2 }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Pagination Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
                <Button variant="contained" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}>
                  Previous
                </Button>
                <Button variant="contained" disabled={paginatedFields.length < ITEMS_PER_PAGE} onClick={() => setCurrentPage((prev) => prev + 1)}>
                  Next
                </Button>
              </Box>
              <Box sx={{ position: 'fixed', bottom: '65px', left: '260px', zIndex: 1000 }}>
                <Button color="primary" variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </>
          )
        }
        </div>
      </div>
      <div style={{ display: 'flex', height: '100%', marginTop: '60px' }}>
        <RightDrawer />
      </div>
    </MainCard>
  );
};

export default ConfigMain;
