import React, { useState, useCallback, useEffect, useMemo } from "react";
import { TableContainer, Paper, Button, TextField, Select, MenuItem, Typography, Checkbox, Card, CardContent, Box, useTheme } from "@mui/material";
import DataTable from "react-data-table-component";
import AdvancedSettings from "./AdvancedSettings";

export function MobileParameterTable({ tableData, handleApply, handleRowSelect, handleInputChange, filterType, handleFilterChange, refs, groupLabel, pageLabel, breadcrumbLabels = [], onShowWaitingChange }) {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTerm") || "");
  const [showWaitingHint, setShowWaitingHint] = useState(() => 
    JSON.parse(localStorage.getItem("showWaitingHint")) ?? true
  );  
  const [showAppId, setShowAppId] = useState(() => 
    JSON.parse(localStorage.getItem("showAppId")) ?? true
  );
  const [showAllRTValues, setShowAllRTValues] = useState(() => 
    JSON.parse(localStorage.getItem("showAllRTValues")) ?? true
  );
  const [showWaiting, setShowWaiting] = useState(() => 
    JSON.parse(localStorage.getItem("showWaiting")) ?? true
  );
  const [showGK, setShowGK] = useState(() => 
    JSON.parse(localStorage.getItem("showGK")) ?? true
  );
  const [filteredData, setFilteredData] = useState(tableData);

  const hasSelectedParameters = useMemo(() => {
    return tableData.some(row => row.selected);
  }, [tableData]);

  const displayedBreadcrumbs = useMemo(() => {
    if (breadcrumbLabels?.length) {
      return breadcrumbLabels;
    }
    if (filterType === "all") {
      return ["All Parameters"];
    }
    const fallbackParts = [groupLabel, pageLabel].filter(Boolean);
    if (fallbackParts.length) {
      return fallbackParts;
    }
    return ["Parameters"];
  }, [breadcrumbLabels, filterType, groupLabel, pageLabel]);

  const breadcrumbText = useMemo(() => displayedBreadcrumbs.join(' → '), [displayedBreadcrumbs]);

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
    if (valRt && valRt.length > 0) {
      return valRt.map(rt => 
        showAppId 
          ? `${getLabel(list, rt.val)} (app: ${rt.app_id})` 
          : `${getLabel(list, rt.val)}`
      ).join(", ");
    }
    return "-unknown-";
  }, [showAppId, getLabel]);

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

  const renderMobileCard = useCallback((row) => {
    const listOptions = row.list || [];
    const currentValues = row.val_new ? row.val_new.split('|') : [];

    return (
      <Card 
        key={row.index}
        sx={{ 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Checkbox
              checked={row.selected || false}
              onChange={() => handleRowSelect(row.index)}
              sx={{ mr: 1 }}
            />
            <Typography 
              variant="h6" 
              component="div"
              sx={{
                color: row.pagelabel ? '#3e4aec' : 'inherit'
              }}
            >
              {row.label}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Index: {row.index}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              New Value:
            </Typography>
            {row.type === "list_mc" ? (
              <Select
                multiple
                value={currentValues}
                onChange={(e) => {
                  const newValue = e.target.value.join('|');
                  handleInputChange(row.index, newValue);
                }}
                variant="outlined"
                fullWidth
                renderValue={(selected) => {
                  return selected.length > 0 
                    ? selected.map(val => {
                        const option = row.list.find(opt => opt.value === val);
                        return option ? option.label : val;
                      }).join(', ')
                    : "Select values...";
                }}
                sx={{ mt: 1 }}
              >
                {row.list.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={currentValues.includes(option.value)} />
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            ) : typeof row.list === "string" && row.list.startsWith("$ref:") ? (
              <Select
                value={row.val_new}
                onChange={(e) => handleInputChange(row.index, e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              >
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
                fullWidth
                sx={{ mt: 1 }}
              >
                {listOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            ) : row.type === "password" ? (
              <TextField
                type="password"
                value={row.val_new || ""}
                onChange={(e) => handleInputChange(row.index, e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              />
            ) : (
              <TextField
                value={row.val_new}
                onChange={(e) => handleInputChange(row.index, e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Used in System:
            </Typography>
            <Typography variant="body2">
              {renderUsedInSystem(row.val_rt, row.list)}
            </Typography>
          </Box>

          {showAllRTValues && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                All RT Values:
              </Typography>
              <Typography variant="body2">
                {row.val_rt && row.val_rt.length > 0 
                  ? row.val_rt.map(rt => 
                      `${rt.app_id}: ${Array.isArray(rt.val) 
                        ? rt.val.map(v => getLabel(row.list, v)).join(", ") 
                        : getLabel(row.list, rt.val)}`
                    ).join(", ")
                  : "-"}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Status:
            </Typography>
            <Box
              sx={{
                backgroundColor: 
                  row.state === 'A' ? 'lightgreen' :
                  row.state === 'P' ? 'yellow' :
                  row.state === 'R' ? 'lightcoral' :
                  'lightgray',
                p: 1,
                borderRadius: 1,
                mt: 0.5
              }}
            >
              <Typography variant="body2">
                {row.state === 'A' ? 'Applied' :
                 row.state === 'P' ? `Applying ${getLabel(row.list, row.val_new_last)}` :
                 row.state === 'R' ? `Rejected ${row.type === "list" ? getLabel(row.list, row.val_new_last) : row.val_new_last}` :
                 showWaiting ? `Waiting ${showWaitingHint ? row.val_new_last || "" : ""}` : ""}
              </Typography>
            </Box>
          </Box>

          {showGK && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                GK:
              </Typography>
              <Typography variant="body2">
                {row.gk}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }, [handleRowSelect, handleInputChange, showAllRTValues, showWaiting, showWaitingHint, showGK, getLabel, renderUsedInSystem]);

  const columns = useMemo(() => [{
    name: "Parameters",
    cell: renderMobileCard,
    width: "100%",
  }], [renderMobileCard]);

  const memoizedData = useMemo(() => filteredData, [filteredData]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: 'column',
        flexBasis: (filterType === "advanced" || filterType === "time") ? "0" : "100%",
        padding: "20px",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `10px`,
        position: "relative",
        minHeight: "100vh",
        boxSizing: "border-box"
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '20px', 
        marginTop: '10px',
        position: "relative"
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          {breadcrumbText}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", mb: 2 }}>
        {filterType !== "advanced" && filterType !== "time" &&(
          <>
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: "100%", maxWidth: "600px", mb: 2 }}
            />
            {filterType !== "selected" && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  width: "100%", 
                  maxWidth: "600px",
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
            width: "100%",
            boxShadow: 'none',
            '& .MuiPaper-root': {
              boxShadow: 'none',
              border: 'none',
              backgroundColor: 'transparent'
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
                  padding: '0',
                  width: '100%'
                },
              },
              headCells: {
                style: {
                  display: 'none',
                },
              },
              rows: {
                style: {
                  border: 'none',
                  '&:not(:last-of-type)': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                  width: '100%'
                },
              },
              table: {
                style: {
                  border: 'none',
                  width: '100%'
                },
              },
              tableWrapper: {
                style: {
                  border: 'none',
                  width: '100%'
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
          sx={{ width: "100%", mt: 2, backgroundColor: "#FFD700 !important", color: "black !important"}}
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
    </Box>
  );
}

export default MobileParameterTable; 