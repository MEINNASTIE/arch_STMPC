import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, FormControl, Select, MenuItem, TextField, Button, Box, Card, CardContent, Chip, Checkbox } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RightDrawer from './drawers/RightDrawer';
import LeftDrawer from './drawers/LeftDrawer';
import { debounce, throttle } from 'lodash';
import { FixedSizeList as List } from 'react-window';

const ConfigMain = () => {
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/config/runtime-desc');
      if (!response.ok) throw new Error('Network response was not ok');

      const jsonData = await response.json();
      const groups = jsonData.payload?.payload?.groups || [];

      if (!Array.isArray(groups) || groups.length === 0) {
        throw new Error('Invalid or empty groups array');
      }

      const updatedGroups = groups.map(group => ({
        ...group,
        pages: group.pages.map(page => ({
          ...page,
          fields: page.fields.map(field => {
            const storedField = localStorage.getItem(field.label);
            let storedData = {};
            try {
              storedData = storedField ? JSON.parse(storedField) : {};
            } catch (error) {
              console.error(`Error parsing localStorage for ${field.label}:`, error);
            }
            return { ...field, val: storedData.val || field.val };
          })
        }))
      }));

      setData({ ...jsonData, payload: { ...jsonData.payload, groups: updatedGroups } });
      setSelectedGroup(updatedGroups[0]);
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
    const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
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

  const handleSave = useCallback(() => {
    const selectedFieldValues = selectedFields.map(label => {
      const field = findFieldByLabel(label);
      return { label, value: field?.val };
    });
    localStorage.setItem('savedValues', JSON.stringify(selectedFieldValues));
  }, [selectedFields]);

  const handleGroupSelect = useMemo(() => throttle(setSelectedGroup, 1000), []);

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

  // for later use
  // const gatherAllValues = useCallback(() => {
  //   const values = [];
  //   data?.payload.groups.forEach(group => {
  //     group.pages.forEach(page => {
  //       page.fields.forEach(field => {
  //         const { val, ...fieldWithoutVal } = field;
  //         values.push(fieldWithoutVal);
  //       });
  //     });
  //   });
  //   return values;
  // }, [data]);

  if (!data) return <Typography variant="h6">Loading...</Typography>;
  const { payload } = data;
  const { groups } = payload;

  const ROW_HEIGHT = 100;
  
  return (
      <MainCard
        style={{
          width: '100%',
          display: 'flex',
          minHeight: '100vh',
          padding: '10px',
          position: 'relative',
        }}
      >
      <div style={{ display: 'flex', height: '100%' }}>
        <LeftDrawer groups={groups} onGroupSelect={handleGroupSelect} />
        <div style={{ width: '100%', overflowY: 'auto', marginTop: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '430px' }}>
        {!selectedGroup || !Array.isArray(selectedGroup.pages) ? (
        <Typography variant="h6">No pages available for the selected group.</Typography>
        ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px', 
                  gap: '80px', 
                  paddingLeft: '100px'
                }}
              >
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                  Editable values
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                  Active in system
                </Typography>
              </Box>
              <List
                height={window.innerHeight - 200} 
                itemCount={selectedGroup.pages.length}
                itemSize={ROW_HEIGHT}
                width="100%"
              >
              {selectedGroup.pages.map((page, pageIndex) => (
              <Card key={pageIndex}>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {page.fields.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        style={{
                          marginBottom: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                        }}
                      >
                        {/* label section */}
                        <Typography variant="body1" style={{ marginBottom: '5px', flex: 5, textAlign: 'right' }}>
                          {field.label}:
                        </Typography>
                        {/* checkbox */}
                        <Checkbox
                          checked={selectedFields.includes(field.label)}
                          onChange={(e) => handleCheckboxChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.checked)}
                        />
                        {/* first input editable */}
                        {field.type === 'select' ? (
                          <FormControl fullWidth size="small" style={{ flex: 6 }}>
                            <Select
                              value={field.val?.new || field.default || ''}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                handleFieldChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, selectedValue);
                                const selectedOption = field.options.find(option => option.val.new === selectedValue || option.label === selectedValue);
                                if (selectedOption) {
                                  field.val.state = selectedOption.val.state;
                                }
                              }}
                            >
                            {Array.isArray(field.options) ? (
                                field.options.map((option, optIndex) => (
                                  <MenuItem key={optIndex} value={option.val.new || option.label}>
                                    <div>
                                      <span>{option.label}</span>
                                    </div>
                                  </MenuItem>
                                ))
                              ) : field.options?.startsWith('$ref:') ? (
                                (() => {
                                  const refKey = field.options.split(':')[1];
                                  const resolvedOptions = common.optionLists?.[refKey];
                                  if (Array.isArray(resolvedOptions)) {
                                    return resolvedOptions.map((option, optIndex) => (
                                      <MenuItem key={optIndex} value={option.val.new || option.label}>
                                        <div>
                                          <span>{option.label}</span>
                                        </div>
                                      </MenuItem>
                                    ));
                                  } else {
                                    console.error(`Invalid or missing reference: ${refKey}`);
                                    return [];
                                  }
                                })()
                              ) : (
                                console.error(`Invalid options format for field: ${field.label}`)
                              )}
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <TextField
                              variant="outlined"
                              size="small"
                              value={field.val?.new || field.default || ''}
                              onChange={(e) =>
                                handleFieldChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.value)
                              }
                              fullWidth
                              style={{ flex: 6 }}
                            />
                            {field.val?.rt && field.val.rt.length > 0 && (
                              <TextField
                                variant="outlined"
                                size="small"
                                value={field.val.rt[0].val || ''}
                                fullWidth
                                style={{ flex: 6 }}
                                disabled
                              />
                            )}
                          </>
                        )}
                        {/* second input active */} 
                        {field.type === 'select' && field.options.length > 0 && (
                          <TextField
                            variant="outlined"
                            size="small"
                            value={
                              field.options
                                .map((option) => option.val?.rt?.[0]?.val) 
                                .find((rtVal) => rtVal) || '' 
                            }
                            fullWidth
                            style={{ flex: 6 }}
                            disabled
                          />
                        )}
                        {/* chip status  */}
                        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              ))}   
              </List>
              <Box sx={{ position: 'fixed', bottom: '65px', left: '260px', zIndex: 1000 }}>
                <Button color="primary" variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', height: '100%' }}>
        <RightDrawer />
      </div>
    </MainCard>
  );
};

export default ConfigMain;

