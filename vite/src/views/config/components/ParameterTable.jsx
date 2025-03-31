import React, { useState } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem } from "@mui/material";

import DataTable from "react-data-table-component";
import { Box } from "@mui/system";
import AdvancedSettings from "./AdvancedSettings";

export function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showWaitingHint, setShowWaitingHint] = useState(
    JSON.parse(localStorage.getItem("showWaitingHint")) ?? true
  );  
  const [showAppId, setShowAppId] = useState(
    JSON.parse(localStorage.getItem("showAppId")) ?? true
  );
  const [showAllRTValues, setShowAllRTValues] = useState(
    JSON.parse(localStorage.getItem("showAllRTValues")) ?? true
  );

  const filteredData = tableData.filter((row) => {
    return (
      row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.index.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.gk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getLabel = (list, value) => {
    const option = list.find(item => item.value === value);
    return option ? option.label : value;
  };
  
  const renderUsedInSystem = (valRt, list) => {
    if (valRt && valRt.length > 0) {
      return valRt.map(rt => 
        showAppId 
          ? `${getLabel(list, rt.val)} (app: ${rt.app_id})` 
          : `${getLabel(list, rt.val)}`
      ).join(", ");
    }
    return "-unknown-";
  };

  const resolveList = (row, refs) => {
    if (typeof row.list === "string" && row.list.startsWith("$ref:")) {
      const refKey = row.list.replace("$ref:", "").trim();
      return refs?.[refKey] || [];
    }
    return row.list || [];
  };

  const toggleWaitingHint = () => {
    const newValue = !showWaitingHint;
    setShowWaitingHint(newValue);
    localStorage.setItem("showWaitingHint", JSON.stringify(newValue));
  };  

  const toggleAppId = () => {
    const newValue = !showAppId;
    setShowAppId(newValue);
    localStorage.setItem("showAppId", JSON.stringify(newValue));
  };

  const toggleAllRTValues = () => {
    const newValue = !showAllRTValues;
    setShowAllRTValues(newValue);
    localStorage.setItem("showAllRTValues", JSON.stringify(newValue));
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
    { name: "Label", selector: (row) => row.label, width: "310px" },
    {
      name: "New Value",
      cell: (row) => {
        const listOptions = resolveList(row, refs);
    
        return typeof row.list === "string" && row.list.startsWith("$ref:") ? (
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
            onClick={() => handleOpenRefModal(row)} 
          >
            <MenuItem disabled>Select from List</MenuItem>
            {listOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : row.type === "list" ? (
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
            {listOptions.map((option) => (
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
        );
      },
      width: "250px",
    },
    {
      name: "Used in System", 
      cell: (row) => renderUsedInSystem(row.val_rt, row.list), 
      width: "150px"
    },
    showAllRTValues && { 
      name: "All RT Values", 
      cell: (row) => row.val_rt && row.val_rt.length > 0 
        ? row.val_rt.map(rt => 
            `${rt.app_id}: ${Array.isArray(rt.val) 
              ? rt.val.map(v => getLabel(row.list, v)).join(", ") 
              : getLabel(row.list, rt.val)}`
          ).join(<br />)
        : "-",
      width: "150px"
    },
    {
      name: "Status",
      cell: (row) => {
        const statusMap = {
          A: <div className="status-A">Applied</div>,
          P: <div className="status-P">Applying {getLabel(row.list, row.val_new_last)}</div>,
          R: <div className="status-R">Rejected {row.val_new_last}</div>,
          U: (
            <div className="status-U">
              Waiting {showWaitingHint ? row.val_new_last || "" : ""}
            </div>
          ),
        };
        return statusMap[row.state] || "";
      },
      width: "200px",
    },    
    { name: "GK", selector: (row) => row.gk, width: "380px" },
  ];

  return (
    <>
    <style>
      {`
        .status-A { background-color: lightgreen; padding: 10px; border-radius: 5px; }
        .status-P { background-color: yellow; padding: 10px; border-radius: 5px; }
        .status-R { background-color: lightcoral; padding: 10px; border-radius: 5px; }
        .status-U { background-color: lightgray; padding: 10px; border-radius: 5px; }
      `}
    </style>
    <Box
      sx={{
        display: "flex",
        flexDirection: 'column',
        flexBasis: filterType === "advanced" ? "0" : "80%", 
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {filterType !== "advanced" && (
          <>
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
              sx={{ width: "160px", marginRight: "20px" }}
              onClick={() => handleFilterChange("selected")}
            >
              Show Selected
            </Button>
          </>
        )}
      </Box>
      {filterType !== "advanced" && (
        <TableContainer
          component={Paper}
          sx={{ flexBasis: "70%", maxHeight: "calc(90vh - 150px)", overflow: "auto" }}
        >
          <DataTable
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="calc(90vh - 150px)"
            highlightOnHover
            customStyles={{
              cells: {
                style: {
                  fontSize: '14px',
                },
              },
              headCells: {
                style: {
                  fontSize: '16px',
                },
              },
            }}
          />
        </TableContainer>
      )}
  
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
  
    {filterType === "advanced" && (
      <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", maxHeight: "calc(100vh - 150px)", borderRadius: "10px" }}>
        <AdvancedSettings
          showWaitingHint={showWaitingHint}
          showAppId={showAppId}
          showAllRTValues={showAllRTValues}
          toggleWaitingHint={toggleWaitingHint}
          toggleAppId={toggleAppId}
          toggleAllRTValues={toggleAllRTValues}
        />
      </Box>
    )}
  </>
  );
}

export default ParameterTable;
