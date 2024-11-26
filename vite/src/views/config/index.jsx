import React, { useEffect, useState } from 'react';
import { Typography, FormControl, Select, MenuItem, TextField, Button, Box, Card, CardContent, Chip, Checkbox, Tooltip} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RightDrawer from './drawers/RightDrawer';
import LeftDrawer from './drawers/LeftDrawer';

const ConfigMain = () => {
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://localhost/config');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
  
        jsonData.payload.groups.forEach(group => {
          group.pages.forEach(page => {
            page.fields.forEach(field => {
              const storedField = localStorage.getItem(field.label);
              if (storedField) {
                const fieldData = JSON.parse(storedField);
                field.isSelected = fieldData.isSelected || false;
              }
            });
          });
        });
  
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching the data:', error);
      }
    };
  
    fetchData();
  }, []);  

  const loadCheckboxState = () => {
    const updatedData = { ...data };
    updatedData.payload.groups.forEach(group => {
      group.pages.forEach(page => {
        page.fields.forEach(field => {
          const storedField = localStorage.getItem(field.label);
          if (storedField) {
            const fieldData = JSON.parse(storedField);
            field.isSelected = fieldData.isSelected || false;
          }
        });
      });
    });
    return updatedData;
  };

  useEffect(() => {
    if (data) {
      setData(loadCheckboxState());
    }
  }, [data]);

  if (!data) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const { payload } = data;
  const { common, groups } = payload;

  const handleFieldChange = (groupIndex, pageIndex, fieldIndex, newValue) => {
    setData(prevData => {
      const updatedData = { ...prevData };
      const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
      field.val = {
        ...field.val,
        new: newValue
      };
      localStorage.setItem(field.label, JSON.stringify({ ...field.val, isSelected: field.isSelected }));
      return updatedData;
    });
  };

  const handleSave = () => {
    console.log('Save button clicked');
  };

  const settingsGroup = groups.find(group => group.label === 'Settings');

  if (!settingsGroup) {
    return <Typography variant="h6">No settings group found.</Typography>;
  }

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleCheckboxChange = (groupIndex, pageIndex, fieldIndex, isChecked) => {
    setData(prevData => {
      const updatedData = JSON.parse(JSON.stringify(prevData)); // Avoid mutation
      const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
      field.isSelected = isChecked;
  
      localStorage.setItem(field.label, JSON.stringify({ ...field.val, isSelected: field.isSelected }));
  
      return updatedData;
    });
  };  

  // fetching for server later 
  const gatherAllValues = () => {
    const values = [];
    data.payload.groups.forEach(group => {
      group.pages.forEach(page => {
        page.fields.forEach(field => {
          const { isSelected, ...fieldWithoutIsSelected } = field;
          values.push(fieldWithoutIsSelected);
        });
      });
    });
  
    return values;
  };  

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
          {selectedGroup && (
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
                          checked={!!field.isSelected} 
                          onChange={(e) =>
                            handleCheckboxChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.checked)
                          }
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
                                field.options.map((option, optIndex) => {
                                  return (
                                    <MenuItem key={optIndex} value={option.val.new || option.label}>
                                      <div>
                                        <span>{option.label}</span>
                                      </div>
                                    </MenuItem>
                                  );
                                })
                              ) : field.options.startsWith('$ref:') ? (
                                (() => {
                                  const refKey = field.options.split(':')[1];
                                  const resolvedOptions = common.optionLists[refKey];
                                  if (Array.isArray(resolvedOptions)) {
                                    return resolvedOptions.map((option, optIndex) => {
                                      const rtVal = option.val?.rt?.[0]?.val;
                                      const rtTimestamp = option.val?.rt?.[0]?.ts;

                                      return (
                                        <MenuItem key={optIndex} value={option.val.new || option.label}>
                                          <div>
                                            <span>{option.label}</span>
                                            {rtVal && (
                                              <Tooltip title={`Last updated at: ${new Date(rtTimestamp).toLocaleString()}`} arrow>
                                                <Chip label={`RT: ${rtVal}`} size="small" style={{ marginLeft: '8px' }} />
                                              </Tooltip>
                                            )}
                                          </div>
                                        </MenuItem>
                                      );
                                    });
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
