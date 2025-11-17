import React, { useState, useEffect } from "react";
import { Box, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import TreeView from "./components/TreeView";
import ParameterTable from "./components/ParameterTable";

function ConfigMainFactory() {
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filterType, setFilterType] = useState("all"); 
  const [refs, setRefs] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(
    JSON.parse(localStorage.getItem("configFactorySidebarOpen")) ?? true
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/config/system-desc");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Loaded runtimeDescData:", data);

        resolveRefs(data.payload);
        populateTree(data.payload.groups);
        populateTable(data.payload.groups);
        setRefs(data.payload.refs);
      } catch (error) {
        console.error("Failed to fetch runtime description:", error);
      }
    };

    fetchData();
  }, []);

// useEffect(() => {
//   const data = runtimeDescData;
//   console.log("Loaded runtimeDescData:", data);

//   resolveRefs(data.payload);
//   populateTree(data.payload.groups);
//   populateTable(data.payload.groups);
//   setRefs(data.payload.refs);
// }, []);

  const resolveRefs = (payload) => {
    console.log("Resolving references in payload:", payload);

    const resolve = (root, path) => {
      return path.split(".").reduce((acc, key) => acc?.[key] ?? null, root);
    };

    const traverse = (root, obj) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string" && obj[key].startsWith("$ref:")) {
          obj[key] = resolve(root, obj[key].replace("$ref:", ""));
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          traverse(root, obj[key]);
        }
      });
    };

    traverse(payload, payload);
  };

  const populateTree = (groups) => {
    console.log("Populating tree with groups:", groups);

    const allItem = {
      label: "Change",
      isCollapsible: true,
      pages: [     
        { 
          label: "Selected to Change", 
          id: "selected",
          onClick: () => handleFilterChange("selected", { label: "Change" }, { label: "Selected to Change" })
        },
        { 
          label: "Not yet Applied", 
          id: "notApplied",
          onClick: () => handleFilterChange("notApplied", { label: "Change" }, { label: "Not yet Applied" })
        },
      ],
    };

    const groupItems = groups.map((group) => ({
      label: group.label || "Unnamed Group",
      pages: group.pages.map((page) => ({
        label: page.label || "Unnamed Page",
        id: page.id,
        onClick: () => handleFilterChange(page.id, group, page),
      })),
    }));

    setTreeData([allItem, ...groupItems]);
  };

  const populateTable = (groups) => {
    const rows = [];
    groups.forEach((group, groupIndex) => {
      group.pages.forEach((page, pageIndex) => {
        page.fields.forEach((field, fieldIndex) => {
          rows.push({
            index: (groupIndex+1)+'.'+(pageIndex+1)+'.'+(fieldIndex + 1),
            label: field.label,
            gk: field.gk,
            type: field.type,
            val_new: field.val || "",
            val_rt: [], 
            state: "U",
            groupPage: `${group.id}.${page.id}`,
            pageId: page.id,
            val_new_last: field.val || '',
            validation: field.validation || null,
            list: field.list || []
          });
        });
      });
    });
    setTableData(rows);
  };
  
  const getFilteredData = () => {
    if (filterType === "all") return tableData;
    
    switch (filterType) {
      case "selected":
        return tableData.filter((row) => row.selected);
      case "notApplied":
        return tableData.filter((row) => row.state !== "A");
      default:
        return tableData.filter((row) => row.pageId === filterType);
    }
  };
  
  const handleRowSelect = (rowIndex) => {
    setTableData((prev) => {
      const newData = prev.map((row) => {
        if (row.index === rowIndex) {
          const newSelected = !row.selected;
          const selectedParams = JSON.parse(localStorage.getItem('selectedParametersFactory') || '{}');
          
          if (newSelected) {
            selectedParams[rowIndex] = true;
            localStorage.setItem('selectedParametersFactory', JSON.stringify(selectedParams));
          } else {
            delete selectedParams[rowIndex];
            localStorage.setItem('selectedParametersFactory', JSON.stringify(selectedParams));
          }
          
          return { ...row, selected: newSelected };
        }
        return row;
      });
      return newData;
    });
  };

  const handleInputChange = (rowIndex, value) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.index === rowIndex
          ? { ...row, val_new: value, selected: true } 
          : row
      )
    );
  };

  const handleFilterChange = (pageId, group, page) => {
    if (pageId === "all") {
      setFilterType("all");
      setSelectedGroup(null);
      setSelectedPage(null);
      localStorage.removeItem("selectedGroup");
      localStorage.removeItem("selectedPage");
      return;
    }

    setFilterType(pageId);
    setSelectedGroup(group);
    setSelectedPage(page);
    
    if (group) {
      localStorage.setItem("selectedGroup", JSON.stringify(group));
    }
    if (page) {
      localStorage.setItem("selectedPage", JSON.stringify(page));
    }
  };  

  const handleApply = async () => {
    const selectedData = tableData
      .filter((row) => row.selected)
      .map((row) => ({
        gk: row.gk,
        val_rt: row.val_new,
      }));

    if (selectedData.length === 0) {
      setDialogMessage("No changes selected!");
      setDialogOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/config/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedData),
      });

      if (!response.ok) throw new Error("Failed to apply changes");

      setTableData((prev) =>
        prev.map((row) =>
          row.selected ? { ...row, selected: false, state: "A" } : row
        )
      );

      setDialogMessage("Changes were successfully applied!");
      setDialogOpen(true);
      handleFilterChange("notApplied", { label: "Change" }, { label: "Not yet Applied" });
    } catch (error) {
      console.error("Error applying changes:", error);
      setDialogMessage("Failed to apply changes.");
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    const savedGroup = localStorage.getItem("selectedGroup");
    const savedPage = localStorage.getItem("selectedPage");

    if (savedGroup && savedPage) {
      setSelectedGroup(JSON.parse(savedGroup));
      setSelectedPage(JSON.parse(savedPage));
      setFilterType(JSON.parse(savedPage).id);
    } else {
      setFilterType("all");
      setSelectedGroup(null);
      setSelectedPage(null);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem("selectedGroup", JSON.stringify(selectedGroup));
    }
    if (selectedPage) {
      localStorage.setItem("selectedPage", JSON.stringify(selectedPage));
    }
  }, [selectedGroup, selectedPage]);

  useEffect(() => {
    const selectedParams = JSON.parse(localStorage.getItem('selectedParametersFactory') || '{}');
    setTableData(prevData => 
      prevData.map(row => ({
        ...row,
        selected: selectedParams[row.index] === true
      }))
    );
  }, []);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("configFactorySidebarOpen", JSON.stringify(newState));
  };

  return (
    <Box
      sx={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: "30px 10px",
      }}
    >
      <Tabs value={0} centered></Tabs>
      <Box 
        display="flex" 
        flexGrow={1} 
        gap={2} 
        p={2}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          position: 'relative'
        }}
      >
        {/* Sidebar */}
        {sidebarOpen && (
          <Box sx={{ 
            width: { xs: '100%', sm: '25%', md: '20%' },
            minWidth: { xs: 'auto', sm: '200px' },
            maxWidth: { xs: '100%', sm: '300px' },
            overflow: 'auto',
            mb: { xs: 2, sm: 0 },
          }}>
            <TreeView treeData={treeData} handleFilterChange={handleFilterChange} />
          </Box>
        )}

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1,
          width: '100%',
          transition: 'margin-left 0.3s ease',
          marginLeft: sidebarOpen ? 0 : 0,
        }}>
          <ParameterTable 
            tableData={getFilteredData()} 
            handleApply={handleApply} 
            handleRowSelect={handleRowSelect} 
            handleInputChange={handleInputChange} 
            filterType={filterType} 
            handleFilterChange={handleFilterChange} 
            refs={refs}
            groupLabel={selectedGroup?.label}
            pageLabel={selectedPage?.label}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
          />
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Hey there,</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConfigMainFactory;


