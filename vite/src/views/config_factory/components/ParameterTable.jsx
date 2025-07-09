import React, { useState, useCallback, useEffect, useMemo } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import DataTable from "react-data-table-component";
import { Box, useTheme } from "@mui/system";
import AdvancedSettings from "./AdvancedSettings";
import ValidationFeedback from "../../../components/ValidationFeedback";
import { validateInput } from "../../../utils/validationUtils";


export function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs, groupLabel, pageLabel }) {
  const theme = useTheme();
  
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
  const [validationStates, setValidationStates] = useState({});
  const [typingStates, setTypingStates] = useState({});

  const hasSelectedParameters = useMemo(() => {
    return tableData.some(row => row.selected);
  }, [tableData]);

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
    // Handle runtime values if they exist
    let usedInSystem = "";
    if (valRt && Array.isArray(valRt) && valRt.length > 0) {
      usedInSystem = valRt.map((rt, index) => {
        const label = getLabel(list, rt.val);
        return showAppId ? `${label} (app: ${rt.app_id})` : label;
      }).filter(Boolean).join(", ");
    }

    const originalValue = row.val_new_last || row.val_new;
    const normalizedValue = list && list.length > 0 && typeof list[0].value === 'number' 
      ? Number(originalValue) 
      : originalValue;
    const originalLabel = list?.find(opt => opt.value === normalizedValue)?.label || originalValue;

    // Just show the current value
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
    const handleSearch = () => {
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
  
      setFilteredData(filtered);
    };
  
    handleSearch();
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

  const handleValueChange = (rowIndex, newValue, rowType, row) => {
    if (!newValue || newValue === '') {
      setValidationStates(prev => ({ ...prev, [rowIndex]: { isValid: true, message: '' } }));
      setTypingStates(prev => ({ ...prev, [rowIndex]: false }));
    } else {
      const fieldValidation = row.validation || null;
      const validationResult = validateInput(newValue, rowType, fieldValidation);
      setValidationStates(prev => ({ ...prev, [rowIndex]: validationResult }));
      setTypingStates(prev => ({ ...prev, [rowIndex]: true }));
    }
    handleInputChange(rowIndex, newValue);
  };

  const hasInvalidValues = useMemo(() => {
    return Object.values(validationStates).some(state => !state.isValid);
  }, [validationStates]);

  const columns = useMemo(() => [
    {
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={() => handleRowSelect(row.index)}
        />
      ),
      width: "40px",
    },
    { 
      name: "Index", 
      selector: (row) => row.index, 
      width: "80px",
    },
    { 
      name: "Label", 
      selector: (row) => row.label, 
      width: "300px",
    },
    {
      name: "New Value",
      cell: (row) => {
        const listOptions = resolveList(row, refs);
        const validation = validationStates[row.index] || { isValid: true, message: '' };

        const handleCellValueChange = (newValue) => {
          handleValueChange(row.index, newValue, row.type, row);
        };

        const getCurrentValueLabel = (value) => {
          if (!value) return "";
          const option = listOptions.find(opt => opt.value === value);
          return option ? option.label : value;
        };

        const commonInputStyles = {
          width: "180px",
          height: "40px",
          fontSize: "14px",
          margin: "5px 0px",
          "& .MuiSelect-select": {
            padding: "5px",
            width: "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          },
          "& .MuiInputBase-root": {
            width: "180px",
            minWidth: "180px",
            maxWidth: "180px"
          }
        };

        if (typeof row.list === "string" && row.list.startsWith("$ref:") || row.type === "list") {
          return (
            <Box sx={{ width: "180px" }}>
              <Select
                value={row.val_new}
                onChange={(e) => handleCellValueChange(e.target.value)}
                variant="outlined"
                renderValue={(selected) => getCurrentValueLabel(selected)}
                sx={commonInputStyles}
              >
                {listOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <ValidationFeedback 
                {...validation} 
                hint={row.validation?.hint}
                isTyping={typingStates[row.index]}
              />
            </Box>
          );
        }
        
        return row.type === "password" ? (
          <Box sx={{ width: "180px" }}>
            <TextField
              type="password"
              value={row.val_new || ""}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              sx={{
                ...commonInputStyles,
                "& input": {
                  padding: "10px",
                  width: "180px",
                  minWidth: "180px",
                  maxWidth: "180px"
                }
              }}
            />
            <ValidationFeedback 
              {...validation} 
              hint={row.validation?.hint}
              isTyping={typingStates[row.index]}
            />
          </Box>
        ) : (
          <Box sx={{ width: "180px" }}>
            <TextField
              value={row.val_new}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              sx={{
                ...commonInputStyles,
                "& input": {
                  padding: "10px",
                  width: "180px",
                  minWidth: "180px",
                  maxWidth: "180px"
                }
              }}
            />
            <ValidationFeedback 
              {...validation} 
              hint={row.validation?.hint}
              isTyping={typingStates[row.index]}
            />
          </Box>
        );
      },
      width: "200px",
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
      width: "200px",
    },
    showGK && { 
      name: "GK", 
      selector: (row) => row.gk, 
      width: "300px",
    },
  ].filter(Boolean), [handleRowSelect, handleInputChange, showAllRTValues, showWaiting, showWaitingHint, showGK, getLabel, renderUsedInSystem, validationStates, typingStates]);

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
        flexBasis: (filterType === "advanced" || filterType === "time") ? "0" : "100%",
        marginLeft: "10px",
        padding: "20px",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `10px`,
        height: "calc(100vh - 100px)",
        overflow: "hidden",
        maxWidth: "87.5%",
        boxSizing: "border-box"
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "10px" }}>
        {filterType !== "advanced" && filterType !== "time" &&(
          <>
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: { xs: "100%", sm: "20%" } }}
            />
            {filterType !== "selected" && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  width: { xs: "100%", sm: "270px" }, 
                  marginRight: { xs: 0, sm: "20px" }, 
                  marginBottom: { xs: "10px", sm: "20px" },
                  ...(hasSelectedParameters && {
                    backgroundColor: "#FFD700 !important",
                    color: "black !important"
                  })
                }}
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
          sx={{ 
            flex: 1,
            overflow: "auto",
            width: "100%",
            boxSizing: "border-box",
            "& .MuiTableContainer-root": {
              height: "100%"
            }
          }}
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
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  padding: '8px',
                },
              },
              headCells: {
                style: {
                  fontSize: '16px',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  padding: '8px',
                },
              },
              table: {
                style: {
                  height: "100%",
                  width: "100%",
                }
              },
              tableWrapper: {
                style: {
                  overflowX: "auto",
                  width: "100%",
                }
              },
              responsiveWrapper: {
                style: {
                  overflowX: "auto",
                  width: "100%",
                }
              }
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
          disabled={hasInvalidValues}
          sx={{ 
            width: "160px", 
            alignSelf: "left", 
            marginTop: "40px", 
            backgroundColor: hasInvalidValues ? "#ccc !important" : "#FFD700 !important", 
            color: "black !important"
          }}
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
