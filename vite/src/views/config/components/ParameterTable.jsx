import React, { useState } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import DataTable from "react-data-table-component";
import { Box } from "@mui/system";

function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = tableData.filter((row) => {
    return (
      row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.index.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.gk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderUsedInSystem = (valRt) => {
    if (valRt && valRt.length > 0) {
      return valRt.map((rt) => `${rt.val} (App: ${rt.app_id})`).join(", ");
    }
    return "-unknown-";
  };

  const columns = [
    {
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={() => handleRowSelect(row.index)}
        />
      ),
      width: "50px",
    },
    { name: "Index", selector: (row) => row.index, width: "80px" },
    { name: "Label", selector: (row) => row.label, width: "290px" },
    {
      name: "New Value",
      cell: (row) =>
        row.type === "list" ? (
          <Select
            value={row.val_new}
            onChange={(e) => handleInputChange(row.index, e.target.value)}
            variant="outlined"
            sx={{
              width: "100%",
              height: "40px",
              fontSize: "14px",
              margin: "5px 0px",
              "& .MuiSelect-select": {
                padding: "5px",
              },
            }}
          >
            {row.list.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <TextField
            value={row.val_new}
            onChange={(e) => handleInputChange(row.index, e.target.value)}
            variant="outlined"
            sx={{
              width: "100%",
              height: "40px",
              fontSize: "14px",
              margin: "8px 0px",
          
              "& input": {
                padding: "10px",
              },
            }}
          />
        ),
      width: "250px",
    },
    { name: "Used in System", cell: (row) => renderUsedInSystem(row.val_rt), width: "200px" },
    { 
      name: "All RT Values", 
      cell: (row) => row.val_rt && row.val_rt.length > 0 
        ? row.val_rt.map(rt => `${rt.app_id}: ${Array.isArray(rt.val) ? rt.val.join(", ") : rt.val}`).join(<br />)
        : "-",
      width: "150px"
    },
    {
      name: "Status",
      cell: (row) => {
        const statusMap = {
          A: <div className="status-A">Applied</div>,
          P: <div className="status-P">Applying {row.val_new_last}</div>,
          R: <div className="status-R">Rejected {row.val_new_last}</div>,
          U: <div className="status-U">Waiting {row.val_new_last || ""}</div>,
        };
        return statusMap[row.state] || "";
      },
      width: "150px",
    },
    { name: "GK", selector: (row) => row.gk, width: "350px" },
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
      <Box sx={{ display: "flex", flexDirection: 'column', flexBasis: "80%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "20%" }}
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ width: "100px", marginRight: "20px" }}
          onClick={() => handleFilterChange("selected")}
        >
          Selected
        </Button>
      </Box>
        <TableContainer component={Paper} sx={{ flexBasis: "72.5%", maxHeight: "calc(90vh - 150px)", overflow: "auto" }}>
          <DataTable
            columns={columns}
            data={filteredData} 
            fixedHeader
            fixedHeaderScrollHeight="calc(90vh - 150px)"
            highlightOnHover
          />
        </TableContainer>
        {filterType === "selected" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          size="large"
          sx={{ marginTop: 4, width: "100px", alignSelf: "left" }}
        >
          Apply
        </Button>
      )}
      </Box>
    </>
  );
}

export default ParameterTable;
