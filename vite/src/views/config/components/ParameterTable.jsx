import React from 'react';
import { TableContainer, Paper, Button } from "@mui/material";
import DataTable from 'react-data-table-component';

function ParameterTable({ tableData, handleApply }) {
  const renderUsedInSystem = (valRt) => {
    if (valRt && valRt.length > 0) {
      return valRt.map(rt => `${rt.val} (App: ${rt.app_id})`).join(', ');
    }
    return "-unknown-";
  };

  const columns = [
    {
      name: 'Index',
      selector: row => row.index,
      width: '80px',
    },
    {
      name: 'Label',
      selector: row => row.label,
      width: '150px',
    },
    {
      name: 'New Value',
      cell: () => <input type="text" defaultValue="" />,
      width: '250px',
    },
    {
      name: 'Used in System',
      cell: row => renderUsedInSystem(row.val_rt),
      width: '200px',
    },
    {
      name: 'Status',
      cell: row => {
        const statusMap = {
          A: <div className="status-A">Applied</div>,
          P: <div className="status-P">Applying: {row.val_new_last}</div>,
          R: <div className="status-R">Rejected: {row.val_new_last}</div>,
          U: <div className="status-U">Waiting: {row.val_new_last || ""}</div>,
        };
        return statusMap[row.state] || "";
      },
      width: '250px',
    },
    {
      name: 'GK',
      selector: row => row.gk,
      width: '350px',
    },
  ];

  return (
    <>
      <style>
        {`
          .status-A { background-color: lightgreen; padding: 10px; border-radius: 5px; }
          .status-P { background-color: yellow; padding: 10px; border-radius: 5px;  }
          .status-R { background-color: lightcoral; padding: 10px; border-radius: 5px; }
          .status-U { background-color: lightgray; padding: 10px; border-radius: 5px; }
        `}
      </style>
      <TableContainer
        component={Paper}
        sx={{
          flexBasis: '85%',
          maxHeight: 'calc(90vh - 150px)',
          overflow: 'auto',
        }}
      >
        <DataTable
          columns={columns}
          data={tableData}
          fixedHeader
          fixedHeaderScrollHeight="calc(90vh - 150px)"
          highlightOnHover
          selectableRows
          pagination
          onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          size="large"
          id="apply-button"
          sx={{ margin: 2 }}
        >
          Apply
        </Button>
      </TableContainer>
    </>
  );
}

export default ParameterTable;


