import React, { useMemo, useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, FormControl, Select, MenuItem, TextField, Chip, Checkbox, Button } from '@mui/material';

const ITEMS_PER_PAGE = 10;

const ConfigCard = ({ selectedGroup, selectedPage, groups, optionLists, currentPage, setCurrentPage }) => {
    const [inputValues, setInputValues] = useState({});

    useEffect(() => {
        const storedValues = JSON.parse(localStorage.getItem('inputValues')) || {};
        setInputValues(storedValues);
    }, []);

    const paginatedFields = useMemo(() => {
        if (!selectedPage || !Array.isArray(selectedPage.fields)) return [];
        const start = currentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        return selectedPage.fields.slice(start, end);
    }, [selectedPage, currentPage]);

    const handleFieldChange = (groupIndex, pageIndex, fieldIndex, value, gk) => {
        setInputValues((prevValues) => {
            const key = `${groupIndex}-${pageIndex}-${fieldIndex}`;
            const updatedValues = {
                ...prevValues,
                [key]: { 
                gk, 
                val_new: value,
                val_rt: prevValues[key]?.val_rt || "" 
          },
            };

            localStorage.setItem('inputValues', JSON.stringify(updatedValues));

            return updatedValues;
        });
    };

    if (!selectedGroup || !selectedPage) {
        return <Typography variant="h6">No pages available.</Typography>;
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '80px', paddingLeft: '100px' }}>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                    Editable values
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#212121' }}>
                    Active in system
                </Typography>
            </Box>
            <Card>
                <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {paginatedFields.map((field, fieldIndex) => {
                            const resolvedOptions = Array.isArray(field.options)
                                ? field.options
                                : field.options?.startsWith('$ref:')
                                ? optionLists[field.options.replace('$ref:', '').trim()]
                                : [];

                            const editableValue =
                                inputValues[`${groups.indexOf(selectedGroup)}-${selectedGroup.pages.indexOf(selectedPage)}-${fieldIndex}`]?.val_new ||
                                (field.val?.new ?? field.default) ||
                                "";

                            return (
                                <div key={fieldIndex} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Typography variant="body1" style={{ marginBottom: '5px', flex: 5, textAlign: 'right' }}>
                                        {field.label}:
                                    </Typography>
                                    <Checkbox />
                                    {field.type === 'select' ? (
                                        <FormControl fullWidth size="small" style={{ flex: 6 }}>
                                            <Select
                                                value={editableValue}
                                                onChange={(e) =>
                                                    handleFieldChange(
                                                        groups.indexOf(selectedGroup),
                                                        selectedGroup.pages.indexOf(selectedPage),
                                                        fieldIndex,
                                                        e.target.value,
                                                        field.gk
                                                    )
                                                }
                                            >
                                                {resolvedOptions?.map((option, optIndex) => (
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
                                            value={editableValue}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    groups.indexOf(selectedGroup),
                                                    selectedGroup.pages.indexOf(selectedPage),
                                                    fieldIndex,
                                                    e.target.value,
                                                    field.gk
                                                )
                                            }
                                            fullWidth
                                            style={{ flex: 6 }}
                                        />
                                    )}
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        value={field.val?.rt?.[0]?.val || ''}
                                        fullWidth
                                        style={{ flex: 6 }}
                                        disabled
                                    />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
                <Button variant="contained" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}>
                    Previous
                </Button>
                <Button
                    variant="contained"
                    disabled={paginatedFields.length < ITEMS_PER_PAGE}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                    Next
                </Button>
            </Box>
        </>
    );
};

export default ConfigCard;
