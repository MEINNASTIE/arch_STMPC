import React, { useState, useCallback, useEffect, useMemo } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem, Typography, Checkbox, useMediaQuery } from "@mui/material";
import DataTable from "react-data-table-component";
import { Box, useTheme } from "@mui/system";
import AdvancedSettings from "./AdvancedSettings";
import Clock from "./TimeConfig";
import MobileParameterTable from "./MobileParameterTable";
import ValidationFeedback from "../../../components/ValidationFeedback";
import { validateInput } from "../../../utils/validationUtils";

export function ParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs, groupLabel, pageLabel, onShowWaitingChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const toggleState = useCallback((stateSetter, localStorageKey, currentValue, callback) => {
    const newValue = !currentValue;
    stateSetter(newValue);
    localStorage.setItem(localStorageKey, JSON.stringify(newValue));
    if (callback) callback(newValue);
  }, []);

  const toggleAppId = useCallback(() => toggleState(setShowAppId, "showAppId", showAppId), [showAppId, toggleState]);
  const toggleAllRTValues = useCallback(() => toggleState(setShowAllRTValues, "showAllRTValues", showAllRTValues), [showAllRTValues, toggleState]);
  const toggleShowWaiting = useCallback(() => toggleState(setShowWaiting, "showWaiting", showWaiting, onShowWaitingChange), [showWaiting, toggleState, onShowWaitingChange]);
  const toggleWaitingHint = useCallback(() => toggleState(setShowWaitingHint, "showWaitingHint", showWaitingHint, onShowWaitingChange), [showWaitingHint, toggleState, onShowWaitingChange]);
  const toggleGK = useCallback(() => toggleState(setShowGK, "showGK", showGK), [showGK, toggleState]);

  const getStatusText = useCallback((state) => {
    switch (state) {
      case 'A': return 'applied';
      case 'P': return 'applying';
      case 'R': return 'rejected';
      case 'U': return 'waiting';
      default: return '';
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    localStorage.setItem("searchTerm", newSearchTerm);
  }, []);

  const getLabel = useCallback((list, value) => {
    const option = list.find(item => item.value === value);
    return option ? option.label : value;
  }, []);
  
  const renderUsedInSystem = useCallback((valRt, list) => {
    if (!valRt || !Array.isArray(valRt) || valRt.length === 0) {
      return "-unknown-";
    }

    return valRt.map((rt, index) => {
      const label = getLabel(list, rt.val);
      return showAppId ? `${label} (app: ${rt.app_id})` : label;
    }).filter(Boolean).join(", ");
  }, [showAppId, getLabel]);

  useEffect(() => {
    setFilteredData(tableData);
  }, [tableData]);

  useEffect(() => {
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
  }, [searchTerm, tableData, getStatusText, showWaiting]);

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem("searchTerm") || "";
    setSearchTerm(savedSearchTerm);
  }, []);

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
        const listOptions = row.list || [];
        const validation = validationStates[row.index] || { isValid: true, message: '' };

        const handleCellValueChange = (newValue) => {
          handleValueChange(row.index, newValue, row.type, row);
        };

        const getCurrentValueLabel = (value) => {
          if (!value) return "";
          const option = listOptions.find(opt => opt.value === value);
          return option ? option.label : value;
        };

        if (row.type === "list_mc") {
          const currentValues = row.val_new ? row.val_new.split('|') : [];
          const validationResult = validateInput(currentValues, row.type);

          return (
            <Box>
              <Select
                multiple
                value={currentValues}
                onChange={(e) => {
                  const newValue = e.target.value.join('|');
                  handleCellValueChange(newValue);
                }}
                variant="outlined"
                renderValue={(selected) => {
                  return selected.length > 0 
                    ? selected.map(val => {
                        const option = row.list.find(opt => opt.value === val);
                        return option ? option.label : val;
                      }).join(', ')
                    : "Select values...";
                }}
                sx={{
                  width: "180px",
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
                    <Checkbox checked={currentValues.includes(option.value)} />
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
        
        return typeof row.list === "string" && row.list.startsWith("$ref:") ? (
          <Box>
            <Select
              value={row.val_new}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              renderValue={(selected) => getCurrentValueLabel(selected)}
              sx={{
                width: "180px",
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
            <ValidationFeedback 
              {...validation} 
              hint={row.validation?.hint}
              isTyping={typingStates[row.index]}
            />
          </Box>
        ) : row.type === "list" ? (
          <Box>
            <Select
              value={row.val_new}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              renderValue={(selected) => getCurrentValueLabel(selected)}
              sx={{
                width: "180px",
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
            <ValidationFeedback 
              {...validation} 
              hint={row.validation?.hint}
              isTyping={typingStates[row.index]}
            />
          </Box>
        ) : row.type === "password" ? (
          <Box>
            <TextField
              type="password"
              value={row.val_new || ""}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              sx={{
                width: "180px",
                height: "40px",
                fontSize: "14px",
                margin: "8px 0px",
                "& input": {
                  padding: "10px",
                },
              }}
            />
            <ValidationFeedback 
              {...validation} 
              hint={row.validation?.hint}
              isTyping={typingStates[row.index]}
            />
          </Box>
        ) : (
          <Box>
            <TextField
              value={row.val_new}
              onChange={(e) => handleCellValueChange(e.target.value)}
              variant="outlined"
              sx={{
                width: "180px",
                height: "40px",
                fontSize: "14px",
                margin: "8px 0px",
                "& input": {
                  padding: "10px",
                },
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
      cell: (row) => renderUsedInSystem(row.val_rt, row.list), 
      width: "200px",
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
      width: "200px",
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
      width: "150px",
    },    
    showGK && { 
      name: "GK", 
      selector: (row) => row.gk, 
      width: "300px",
    },
  ].filter(Boolean), [handleRowSelect, handleInputChange, showAllRTValues, showWaiting, showWaitingHint, showGK, getLabel, renderUsedInSystem, validationStates, typingStates]);

  const memoizedData = useMemo(() => filteredData, [filteredData]);

  if (isMobile) {
    return (
      <MobileParameterTable
        tableData={tableData}
        handleApply={handleApply}
        handleRowSelect={handleRowSelect}
        handleInputChange={handleInputChange}
        filterType={filterType}
        handleFilterChange={handleFilterChange}
        refs={refs}
        groupLabel={groupLabel}
        pageLabel={pageLabel}
        onShowWaitingChange={onShowWaitingChange}
      />
    );
  }

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
          maxWidth: "100%",
          boxSizing: "border-box",
          position: "relative"
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
              position: "relative",
              "& .MuiTableContainer-root": {
                height: "100%"
              }
            }}
          >
            <DataTable
              columns={columns}
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
                    tableLayout: "fixed"
                  }
                },
                tableWrapper: {
                  style: {
                    overflowX: "auto",
                    width: "100%",
                    position: "relative"
                  }
                },
                responsiveWrapper: {
                  style: {
                    overflowX: "auto",
                    width: "100%",
                    position: "relative"
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
      </Box>
    </>
  );
}

export default ParameterTable;
