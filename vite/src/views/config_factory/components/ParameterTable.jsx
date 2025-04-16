import React, { useState, useCallback, useEffect } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import DataTable from "react-data-table-component";
import { Box } from "@mui/system";
import AdvancedSettings from "./AdvancedSettings";


export function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs, groupLabel, pageLabel }) {
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
  const [showWaiting, setShowWaiting] = useState(
    JSON.parse(localStorage.getItem("showWaiting")) ?? true
  );
  const [showGK, setShowGK] = useState(
    JSON.parse(localStorage.getItem("showGK")) ?? true
  );
  const [filteredData, setFilteredData] = useState(tableData);

  const getStatusText = useCallback((state) => {
    switch (state) {
      case 'A': return 'applied';
      case 'P': return 'applying';
      case 'R': return 'rejected';
      case 'U': return 'waiting';
      default: return '';
    }
  }, []);

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
      const refList = refs?.payload?.refs?.[refKey] || [];
      return Array.isArray(refList) ? refList : [];
    }
    return Array.isArray(row.list) ? row.list : [];
  };

  const transformData = (data) => {
    console.log("Transforming data:", data);
    if (!data) return [];
    
    return data.map(field => ({
      ...field,
      index: field.gk,
      val_new: field.val_new || '',
      val_new_last: field.val_new_last || '',
      val_rt: field.val_rt || [],
      state: field.state || 'A',
      selected: field.selected || false,
      list: field.list || [],
      type: field.type || 'text'
    }));
  };

  useEffect(() => {
    console.log("Table Data received:", tableData);
    console.log("Refs received:", refs);
    
    const handleSearch = async () => {
      const searchTermLower = searchTerm.toLowerCase();
      const transformedData = transformData(tableData);
      console.log("Transformed Data:", transformedData);
      
      const result = transformedData.filter((row) => {
        if (!showWaiting && row.state === 'U') {
          return false;
        }
        return (
          row.label.toLowerCase().includes(searchTermLower) ||
          row.index.toLowerCase().includes(searchTermLower) ||
          row.gk.toLowerCase().includes(searchTermLower) ||
          getStatusText(row.state).includes(searchTermLower)
        );
      });
      console.log("Filtered Data:", result);
      setFilteredData(result);
    };

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, tableData, getStatusText, showWaiting]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchBlur = () => {
    setSearchTerm("");
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

  const toggleShowWaiting = () => {
    const newValue = !showWaiting;
    setShowWaiting(newValue);
    localStorage.setItem("showWaiting", JSON.stringify(newValue));
  };

  const toggleGK = () => {
    const newValue = !showGK;
    setShowGK(newValue);
    localStorage.setItem("showGK", JSON.stringify(newValue));
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
          R: (
            <div className="status-R">
              Rejected {row.type === "list" ? getLabel(row.list, row.val_new_last) : row.val_new_last}
            </div>
          ),
          U: showWaiting ? (
            <div className="status-U">
              Waiting {showWaitingHint ? row.val_new_last || "" : ""}
            </div>
          ) : null, 
        };
        return statusMap[row.state] || "";
      },
      width: "200px",
    },    
    showGK && { name: "GK", selector: (row) => row.gk, width: "390px" },
  ].filter(Boolean);

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
        flexBasis: (filterType === "advanced" || filterType === "time") ? "0" : "80%",
        maxWidth: "1500px",
        marginLeft: "10px"
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', marginTop: '10px'}}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: "bold",
        }}
      >
        {groupLabel} 
      </Typography>
      {pageLabel && (
        <Typography 
          variant="h4" 
          sx={{ 
            color: "#666",
            marginTop: '1px'
          }}
        >
          {pageLabel}
        </Typography>
      )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {filterType !== "advanced" && filterType !== "time" &&(
          <>
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              sx={{ width: "20%" }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ width: "160px", marginRight: "20px" }}
              onClick={() => handleFilterChange("selected", { label: "Change" }, { label: "Selected to Change" })}
            >
              Show Selected
            </Button>
          </>
        )}
      </Box>
      {filterType !== "advanced" && filterType !== "time" && (
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
          sx={{ width: "100px", alignSelf: "left", marginTop: "-10px"}}
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
          showWaiting={showWaiting}
          showGK={showGK}
          toggleWaitingHint={toggleWaitingHint}
          toggleAppId={toggleAppId}
          toggleAllRTValues={toggleAllRTValues}
          toggleShowWaiting={toggleShowWaiting}
          toggleGK={toggleGK}
        />
      </Box>
      
    )}
  </>
  );
}

export default ParameterTable;
