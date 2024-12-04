import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, FormControl, Select, MenuItem, TextField, Button, Box, Card, CardContent, Chip, Checkbox } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RightDrawer from './drawers/RightDrawer';
import LeftDrawer from './drawers/LeftDrawer';
import { debounce } from 'lodash';
import { FixedSizeList as List } from 'react-window';

const ROW_HEIGHT = 150; // Customize this based on your card's height

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

      setData({ ...jsonData, payload: { ...jsonData.payload, groups } });
      setSelectedGroup(groups[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFieldChange = (groupIndex, pageIndex, fieldIndex, newValue) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
      field.val_new = newValue;
      return updatedData;
    });
  };

  const renderRow = useCallback(
    ({ index, style }) => {
      const page = selectedGroup.pages[index];

      return (
        <div style={style} key={index}>
          <Card>
            <CardContent>
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
                    checked={selectedFields.includes(field.label)}
                    onChange={(e) =>
                      handleFieldChange(groups.indexOf(selectedGroup), index, fieldIndex, e.target.checked)
                    }
                  />
                  {field.type === 'select' ? (
                    <FormControl fullWidth size="small" style={{ flex: 6 }}>
                      <Select
                        value={field.val?.new || field.default || ''}
                        onChange={(e) => handleFieldChange(groups.indexOf(selectedGroup), index, fieldIndex, e.target.value)}
                      >
                        {field.options.map((option, optIndex) => (
                          <MenuItem key={optIndex} value={option.val.new || option.label}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      variant="outlined"
                      size="small"
                      value={field.val?.new || field.default || ''}
                      onChange={(e) => handleFieldChange(groups.indexOf(selectedGroup), index, fieldIndex, e.target.value)}
                      fullWidth
                      style={{ flex: 6 }}
                    />
                  )}
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
              ))}
            </CardContent>
          </Card>
        </div>
      );
    },
    [selectedFields, selectedGroup]
  );

  if (!data) return <Typography variant="h6">Loading...</Typography>;

  const { payload } = data;
  const { groups } = payload;

  return (
    <MainCard style={{ width: '100%', display: 'flex', minHeight: '100vh', padding: '10px', position: 'relative' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <LeftDrawer groups={groups} onGroupSelect={setSelectedGroup} />
        <div style={{ width: '100%', overflowY: 'auto', marginTop: '80px' }}>
          {!selectedGroup || !Array.isArray(selectedGroup.pages) ? (
            <Typography variant="h6">No pages available for the selected group.</Typography>
          ) : (
            <List
              height={window.innerHeight - 200} // Set appropriate height
              itemCount={selectedGroup.pages.length}
              itemSize={ROW_HEIGHT}
              width="100%"
            >
              {renderRow}
            </List>
          )}
        </div>
      </div>
      <RightDrawer />
    </MainCard>
  );
};

export default ConfigMain;

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