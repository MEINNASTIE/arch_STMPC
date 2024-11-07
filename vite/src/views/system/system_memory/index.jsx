import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

const SystemMemory = () => {
  const [data, setData] = useState(null);

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

  if (!data) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const { payload } = data;
  const { common, groups } = payload;

  const handleFieldChange = (groupIndex, pageIndex, fieldIndex, newValue) => {
    setData(prevData => {
      const updatedData = { ...prevData };
      updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex].val.new = newValue;
      return updatedData;
    });
  };

  const settingsGroup = groups.find(group => group.label === 'Settings');

  if (!settingsGroup) {
    return <Typography variant="h6">No settings group found.</Typography>;
  }

  return (
    <MainCard title="Dynamic Configuration" style={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {settingsGroup.label}
      </Typography>

      {settingsGroup.pages.map((page, pageIndex) => (
        <div key={pageIndex} style={{ marginBottom: '20px' }}>
          <Typography variant="h6">{page.label}</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {page.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Typography style={{ minWidth: '150px' }}>{field.label}:</Typography>
                {field.type === 'select' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={field.val?.new || ''}
                      onChange={(e) =>
                        handleFieldChange(groups.indexOf(settingsGroup), pageIndex, fieldIndex, e.target.value)
                      }
                    >
                      {(() => {
                        if (Array.isArray(field.options)) {
                          return field.options;
                        }
                        if (typeof field.options === 'string' && field.options.startsWith('$ref:')) {
                          const refKey = field.options.split(':')[1];
                          const resolvedOptions = common.optionLists[refKey];
                          if (Array.isArray(resolvedOptions)) {
                            return resolvedOptions;
                          } else {
                            console.error(`Invalid or missing reference: ${refKey}`);
                            return [];
                          }
                        }
                        console.error(`Invalid options format for field: ${field.label}`);
                        return [];
                      })().map((option, optIndex) => (
                        <MenuItem key={optIndex} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    variant="outlined"
                    size="small"
                    value={field.val ? JSON.stringify(field.val.new) : ''}
                    onChange={(e) =>
                      handleFieldChange(groups.indexOf(settingsGroup), pageIndex, fieldIndex, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </MainCard>
  );
};

export default SystemMemory;
