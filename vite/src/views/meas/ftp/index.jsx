import React from 'react';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// Dummy data for the tables
const rows = [
    { col1: 'Row 1 Col 1', col2: 'Row 1 Col 2', col3: 'Row 1 Col 3', col4: 'Row 1 Col 4', col5: 'Row 1 Col 5', col6: 'Row 1 Col 6', col7: 'Row 1 Col 7' },
    { col1: 'Row 2 Col 1', col2: 'Row 2 Col 2', col3: 'Row 2 Col 3', col4: 'Row 2 Col 4', col5: 'Row 2 Col 5', col6: 'Row 2 Col 6', col7: 'Row 2 Col 7' },
    // Add more rows as needed
];

const FTPPage = () => (
    <MainCard title="Main Header in the Center">
        <Typography variant="h4" align="center" gutterBottom>
            Main Header
        </Typography>

        <Typography variant="h6" gutterBottom>
            Second Header - Table 1
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Column 1</TableCell>
                    <TableCell>Column 2</TableCell>
                    <TableCell>Column 3</TableCell>
                    <TableCell>Column 4</TableCell>
                    <TableCell>Column 5</TableCell>
                    <TableCell>Column 6</TableCell>
                    <TableCell>Column 7</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.col1}</TableCell>
                        <TableCell>{row.col2}</TableCell>
                        <TableCell>{row.col3}</TableCell>
                        <TableCell>{row.col4}</TableCell>
                        <TableCell>{row.col5}</TableCell>
                        <TableCell>{row.col6}</TableCell>
                        <TableCell>{row.col7}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Second Header - Table 2
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Column 1</TableCell>
                    <TableCell>Column 2</TableCell>
                    <TableCell>Column 3</TableCell>
                    <TableCell>Column 4</TableCell>
                    <TableCell>Column 5</TableCell>
                    <TableCell>Column 6</TableCell>
                    <TableCell>Column 7</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.col1}</TableCell>
                        <TableCell>{row.col2}</TableCell>
                        <TableCell>{row.col3}</TableCell>
                        <TableCell>{row.col4}</TableCell>
                        <TableCell>{row.col5}</TableCell>
                        <TableCell>{row.col6}</TableCell>
                        <TableCell>{row.col7}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </MainCard>
);

export default FTPPage;
