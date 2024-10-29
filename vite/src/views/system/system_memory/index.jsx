import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
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

  return (
    <MainCard title="Another Sample Page" style={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Main Header
      </Typography>
      
      <Typography variant="h6">Common Conditions:</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Condition</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Measurement Type Condition</TableCell>
              <TableCell>{JSON.stringify(common.conditions.measTypeCondition)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Option Lists</TableCell>
              <TableCell>{JSON.stringify(common.optionLists)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="center" spacing={3}>
        {groups.map((group, groupIndex) => (
          <Grid item xs={12} md={6} key={groupIndex}>
            <Typography variant="h6">{group.label}</Typography>
            {group.pages.map((page, pageIndex) => (
              <div key={pageIndex}>
                <Typography variant="subtitle1">{page.label}</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Default</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {page.fields.map((field, fieldIndex) => (
                        <TableRow key={fieldIndex}>
                          <TableCell>{field.label}</TableCell>
                          <TableCell>{field.default}</TableCell>
                          <TableCell>{field.description}</TableCell>
                          <TableCell>
                            <TextField
                              variant="outlined"
                              size="small"
                              value={field.val ? JSON.stringify(field.val) : ''}
                              onChange={(e) => {
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            ))}
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
};

export default SystemMemory;
