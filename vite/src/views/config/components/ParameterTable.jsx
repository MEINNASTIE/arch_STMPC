import React, { useEffect, useRef } from 'react';
import { TableContainer, Paper, Button } from "@mui/material";
import $ from 'jquery';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

DataTable.use(DT);

function ParameterTable({ tableData, handleApply }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current && tableData.length > 0) {
      const table = $(tableRef.current).DataTable({
        paging: false,
        lengthChange: false,
        scrollY: 'calc(100vh - 200px)',
        scrollCollapse: true,
        responsive: true,
        data: tableData,
        columns: [
          { title: '', data: null, render: () => `<input type='checkbox' class='row-select' />`, orderable: true, className: 'column-checkbox', width: '50px' },
          { title: 'Index', data: 'index', className: 'column-index', width: '50px' },
          { title: 'Label', data: 'label', className: 'column-label', width: '150px' },
          { title: 'New Value', data: 'val_new', render: () => `<input type='text' value='' />`, className: 'column-new-value', width: '150px' },
          { title: 'Used in System', data: 'val_rt', render: (data) => data ? data.join('<br>') : '-unknown-', className: 'column-used-system', width: '200px' },
          {
            title: 'Status', data: 'state', className: 'column-status', width: '50px',
            render: (data, _, row) => {
              const statusMap = {
                A: `<div class='status-A'>Applied</div>`,
                P: `<div class='status-P'>Applying: ${row.val_new_last}</div>`,
                R: `<div class='status-R'>Rejected: ${row.val_new_last}</div>`,
                U: `<div class='status-U'>Waiting: ${row.val_new_last || ""}</div>`
              };
              return statusMap[data] || "";
            }
          },
          { title: 'gk', data: 'gk', className: 'column-gk', width: '50px' }
        ]
      });
      return () => table.destroy();
    }
  }, [tableData]);  

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
        <table ref={tableRef} className="display" style={{ width: '100%' }}></table>
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
