import React, { useEffect, useState } from 'react';
import { Typography, FormControl, Select, MenuItem, TextField, Button, Box, Card, CardContent, Drawer, List, ListItem, ListItemText, Chip, Checkbox, Tooltip} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/system';
import { IconClockHour5 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const ConfigMain = () => {
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const theme = useTheme();
  // const navigate = useNavigate(); 
  // check for later

  useEffect(() => {
    fetch('https://localhost/config')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => setData(jsonData))
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  useEffect(() => {
    if (data && data.payload.groups.length > 0) {
      setSelectedGroup(data.payload.groups[0]);
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
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: 80,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 360,
              boxSizing: 'border-box',
              borderRight: '2px solid rgb(15, 29, 232)',
              height: '100vh',
              marginTop: '82px',
            },
          }}
        >
          <List style={{ marginTop: 'px', marginLeft: '45px' }}>
          <Box sx={{ 
            mt: 2, 
            pl: 2,
            cursor: 'pointer',
            width: '80%',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
            '&:hover': {
              backgroundColor: '#3e4aec',
            }, 
          }}>
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption, color: 'white', }}
            display="block"
            gutterBottom
          >
            Restart
          </Typography>
          </Box>
         
            {groups.map((group, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleGroupSelect(group)}
                sx={{
                  borderRadius: '10px',
                  mb: '8px',
                  mt: 2,
                  width: '80%',
                  borderRadius: `${theme.customization?.borderRadius || 8}px`,
                  border: '2px solid transparent',
                  transition: 'background-color 0.4s ease', 
                  '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
                }}
              >
                <ListItemText primary={group.label} />
              </ListItem>
            ))}
           
            <Box sx={{ 
            mt: 2, 
            pl: 2,
            width: '80%',
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
            '&:hover': {
              backgroundColor: '#3e4aec',
            }, 
          }}>
            <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption, color: 'white', }}
            display="block"
            gutterBottom
          >
            Change Password
          </Typography>
          </Box>
          <Box sx={{ 
            mt: 2, 
            pl: 2,
            width: '80%',
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
            '&:hover': {
              backgroundColor: '#3e4aec',
            },  
          }}>
            <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
             }}
            display="block"
            gutterBottom
          >
            <IconClockHour5 stroke={1.5} size="1.9rem" />
            <p style={{margin: 0}}>Set Time</p>
          </Typography>
          </Box>
          </List>
        </Drawer>
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
                        <Typography variant="body1" style={{ marginBottom: '5px', flex: 5, textAlign: 'right' }}>
                          {field.label}:
                        </Typography>
                        <Checkbox
                          checked={field.isSelected || false}
                          onChange={(e) =>
                            handleCheckboxChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, e.target.checked)
                          }
                          inputProps={{ 'aria-label': `Select ${field.label}` }}
                          style={{ flex: 1 }}
                        />
                        {field.type === 'select' ? (
                          <FormControl fullWidth size="small" style={{ flex: 6 }}>
                            <Select
                              value={field.val?.new || field.default || ''}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                handleFieldChange(groups.indexOf(selectedGroup), pageIndex, fieldIndex, selectedValue);
                              }}
                            >
                              {Array.isArray(field.options) ? (
                                field.options.map((option, optIndex) => {
                                  const rtVal = option.val?.rt?.[0]?.val; 
                                  const rtTimestamp = option.val?.rt?.[0]?.ts;
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
                                style={{ flex: 6, opacity: 0.6 }}
                                disabled
                              />
                            )}
                          </>
                        )}

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
                            style={{ flex: 6, opacity: 0.6 }}
                            disabled
                            label="Newest RT Value"
                          />
                        )}

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
                                ? 'default'
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
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            width: 80,
            flexShrink: 0,
            zIndex: 0,
            '& .MuiDrawer-paper': {
              width: 360,
              boxSizing: 'border-box',
              borderLeft: '2px solid rgb(15, 29, 232)',
              height: '100vh',
              marginTop: '82px',
              display: 'flex',  
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: -1,
            },
          }}
        >
        <button
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1, 
            color: 'white',
            padding: '10px',
            width: '40%',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#3e4aec'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#87ceeb'}
        >
          Apply
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '100px'}}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '80px',
            }}
          >
            Some content
          </Box>
        </div>
        </Drawer>
      </div>
    </MainCard>
  );
};

export default ConfigMain;
