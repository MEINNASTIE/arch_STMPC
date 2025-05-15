import React, { useState, useCallback, useEffect, useMemo } from "react";
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
  
  const renderUsedInSystem = (valRt, list, row) => {
    const usedInSystem = valRt && valRt.length > 0 
      ? valRt.map(rt => 
          showAppId 
            ? `${getLabel(list, rt.val)} (app: ${rt.app_id})` 
            : `${getLabel(list, rt.val)}`
        ).join(", ")
      : "";

    const originalValue = row.val_new_last || row.val; 
    const normalizedValue = list && list.length > 0 && typeof list[0].value === 'number' 
      ? Number(originalValue) 
      : originalValue;
    const originalLabel = list?.find(opt => opt.value === normalizedValue)?.label || originalValue;

    return usedInSystem ? `${usedInSystem}, ${originalLabel}` : `${originalLabel}`;
  };

  const resolveList = (row, refs) => {
    if (typeof row.list === "string" && row.list.startsWith("$ref:")) {
      const refKey = row.list.replace("$ref:", "").trim();
      const refList = refs?.payload?.refs?.[refKey] || [];
      return Array.isArray(refList) ? refList : [];
    }
    return Array.isArray(row.list) ? row.list : [];
  };

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

  const columns =  useMemo(() => [
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
        const currentValue = row.val_new;
        
        // keep this section in mind if changed
        const normalizedValue = listOptions && listOptions.length > 0 && typeof listOptions[0].value === 'number' 
          ? Number(currentValue) 
          : currentValue;
          
        const currentLabel = listOptions?.find(opt => opt.value === normalizedValue)?.label || currentValue;
    
        if (typeof row.list === "string" && row.list.startsWith("$ref:") || row.type === "list") {
          return (
            <Select
              value={normalizedValue}
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
          );
        }
        
        return (
          <TextField
            value={currentLabel}
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
      cell: (row) => {
        const usedInSystemValue = renderUsedInSystem(row.val_rt, row.list, row);
        
        if (usedInSystemValue.length > 30) {
          return (
            <div
              contentEditable
              suppressContentEditableWarning
              style={{
                width: "100%",
                minHeight: "40px",
                maxHeight: "40px",
                resize: "both",
                overflow: "auto",
                padding: "5px",
                margin: "5px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "transparent",
              }}
            >
              {usedInSystemValue}
            </div>
          );
        }
        
        return (
          <Typography variant="body2" sx={{ margin: "5px 0px" }}>
            {usedInSystemValue}
          </Typography>
        );
      },
      width: "350px"
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "82%" }}>
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
          sx={{ width: "160px", alignSelf: "left", marginTop: "40px",  backgroundColor: "#FFD700 !important", color: "black !important"}}
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
  </>
  );
}

export default ParameterTable;
