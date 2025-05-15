import React, { useState, useCallback, useEffect, useMemo } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem, Typography, Checkbox } from "@mui/material";
import DataTable from "react-data-table-component";
import { Box } from "@mui/system";
import AdvancedSettings from "./AdvancedSettings";
import Clock from "./TimeConfig";

export function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs, groupLabel, pageLabel, onShowWaitingChange }) {
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

  const toggleState = (stateSetter, localStorageKey, currentValue, callback) => {
    const newValue = !currentValue;
    stateSetter(newValue);
    localStorage.setItem(localStorageKey, JSON.stringify(newValue));
    if (callback) callback(newValue);
  };

  const toggleAppId = () => toggleState(setShowAppId, "showAppId", showAppId);
  const toggleAllRTValues = () => toggleState(setShowAllRTValues, "showAllRTValues", showAllRTValues);
  const toggleShowWaiting = () => toggleState(setShowWaiting, "showWaiting", showWaiting, onShowWaitingChange);
  const toggleWaitingHint = () => toggleState(setShowWaitingHint, "showWaitingHint", showWaitingHint, onShowWaitingChange);
  const toggleGK = () => toggleState(setShowGK, "showGK", showGK);

  const getStatusText = useCallback((state) => {
    switch (state) {
      case 'A': return 'applied';
      case 'P': return 'applying';
      case 'R': return 'rejected';
      case 'U': return 'waiting';
    }
  });

  useEffect(() => {
    setFilteredData(tableData); 
  }, [tableData]);

  useEffect(() => {
    const handleSearch = async () => {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = tableData.filter((row) => {
        if (!showWaiting && row.state === 'U') {
          return false;
        }
        return (
          row.label.toLowerCase().includes(searchTermLower) ||
          row.index.toLowerCase().includes(searchTermLower) ||
          row.gk.toLowerCase().includes(searchTermLower) ||
          getStatusText(row.state).toLowerCase().includes(searchTermLower)
        );
      });
      setFilteredData((prevFilteredData) => {
        if (JSON.stringify(prevFilteredData) !== JSON.stringify(filtered)) {
          return filtered;
        }
        return prevFilteredData;
      });
    };

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 100); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, tableData, getStatusText, showWaiting]);

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem("searchTerm") || "";
    setSearchTerm(savedSearchTerm);
  }, []);

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    localStorage.setItem("searchTerm", newSearchTerm);
  };

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

  const columns = useMemo(() => [
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
        const listOptions = row.list || [];

        // conserve for later
        if (row.type === "list_mc") {
          const currentValues = row.val && row.val.rt ? row.val.rt.map(item => item.val) : [];

          return (
            <Select
              multiple
              value={currentValues}
              onChange={(e) => {
                const valueArray = e.target.value;

                const newValue = {
                  new: valueArray.join('|'),
                  rt: valueArray.map(val => {
                    const foundOption = listOptions.find(option => option.value === val);
                    return {
                      val: val,
                      app_id: foundOption ? foundOption.app_id || "" : ""
                    };
                  })
                };

                const foundIndex = tableData.findIndex(item => item.index === row.index);

                if (foundIndex !== -1) {
                  const updatedData = [...tableData];
                  updatedData[foundIndex].val = newValue;
                  handleInputChange(foundIndex, newValue);
                } else {
                  console.error("Invalid row index:", row.index);
                }
              }}
              variant="outlined"
              renderValue={(selected) => {
                console.log("Render value for selected:", selected);
                return selected.length > 0 ? selected.join(', ') : "Select values...";
              }}
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
              {listOptions.length > 0 ? (
                listOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={currentValues.includes(option.value)} />
                    {option.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No options available</MenuItem>
              )}
            </Select>
          );
        }
        
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
  ], [handleRowSelect, handleInputChange]).filter(Boolean);

  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => filteredData, [filteredData]);

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
        {filterType === "all" ? "All Parameters" : groupLabel}
      </Typography>
      {pageLabel && filterType !== "all" && (
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
              sx={{ width: "20%" }}
            />
            {filterType !== "selected" && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ width: "270px", marginRight: "20px", marginBottom: "20px"}}
                onClick={() => handleFilterChange("selected", { label: "Change" }, { label: "Selected to Change" })}
              >
                Preview Selected Changes
              </Button>
            )}
          </>
        )}
      </Box>
      {filterType !== "advanced" && filterType !== "time" && (
        <TableContainer
          component={Paper}
          sx={{ flexBasis: "70%"}}
        >
          <DataTable
            columns={memoizedColumns}
            data={memoizedData}
            pagination
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
          sx={{ width: "160px", alignSelf: "left", marginTop: "40px", backgroundColor: "#FFD700 !important", color: "black !important"}}
        >
          Apply Changes
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
    {filterType === "time" && (
      <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", maxHeight: "calc(100vh - 150px)", borderRadius: "10px", width: "80%"}}>
          <Clock />
      </Box>
    )}
  </>
  );
}

export default ParameterTable;
