import React, { useState, useEffect, useCallback } from "react";
import { Box, Tabs } from "@mui/material";
import TreeView from "./components/TreeView";
import ParameterTable from "./components/ParameterTable";
import ApplyMessage from "./components/ApplyMessage";

function ConfigMain() {
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filterType, setFilterType] = useState("all"); 
  const [refs, setRefs] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [visibleGroups, setVisibleGroups] = useState(new Set());
  const [showWaiting, setShowWaiting] = useState(true);
  const [originalGroups, setOriginalGroups] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // never forget for dist production to erase the address only leave after /api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://192.168.163.165/api/config/runtime-desc");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const data = await response.json();
        console.log("Loaded runtimeDescData:", data);
  
        processData(data.payload); 
        setRefs(data.payload.refs);
      } catch (error) {
        console.error("Failed to fetch runtime description:", error);
      } finally {
        setShowWaiting(true);
      }
    };
  
    const processData = (payload) => {
      resolveRefs(payload);
      populateTree(payload.groups);
      populateTable(payload.groups);
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    if (tableData.length > 0) {
      const newVisibleGroups = new Set();
      tableData.forEach(row => {
        if (row.state !== 'U') { 
          const groupLabel = row.groupPage.split(' > ')[0];
          newVisibleGroups.add(groupLabel);
        }
      });
      setVisibleGroups(newVisibleGroups);
    }
  }, [tableData]);

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
    setOriginalGroups(groups);

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

  useEffect(() => {
    if (tableData.length > 0) {
      const newVisibleGroups = new Set();
      tableData.forEach(row => {
        if (showWaiting || row.state !== 'U') { 
          const groupLabel = row.groupPage.split(' > ')[0];
          newVisibleGroups.add(groupLabel);
        }
      });
      setVisibleGroups(newVisibleGroups);

      setTreeData(prevTreeData => {
        const [allItem, ...groupItems] = prevTreeData;
        const filteredGroupItems = groupItems.filter(group => 
          showWaiting || newVisibleGroups.has(group.label)
        );
        return [allItem, ...filteredGroupItems];
      });
    }
  }, [tableData, showWaiting]);

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
            val_new: field.val?.new || "",
            val_rt: field.val?.rt || [],
            state: field.val?.state || "U",
            groupPage: `${group.id}.${page.id}`,
            val_new_last: field.val?.new || '',
            validation: field.validation || null,
            list: field.options || field.list || []
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
        return tableData.filter((row) => {
          const [groupId, pageId] = row.groupPage.split('.');
          return pageId === filterType;
        });
    }
  };

  const handleRowSelect = (rowIndex) => {
    setTableData((prev) => {
      const newData = prev.map((row) => {
        if (row.index === rowIndex) {
          const newSelected = !row.selected;
          const selectedParams = JSON.parse(localStorage.getItem('selectedParameters') || '{}');
          
          if (newSelected) {
            selectedParams[rowIndex] = true;
            localStorage.setItem('selectedParameters', JSON.stringify(selectedParams));
          } else {
            delete selectedParams[rowIndex];
            localStorage.setItem('selectedParameters', JSON.stringify(selectedParams));
          }
          
          return { ...row, selected: newSelected };
        }
        return row;
      });
      return newData;
    });
  };

  useEffect(() => {
    const selectedParams = JSON.parse(localStorage.getItem('selectedParameters') || '{}');
    setTableData(prevData => 
      prevData.map(row => ({
        ...row,
        selected: selectedParams[row.index] === true
      }))
    );
  }, []);

  const handleInputChange = useCallback((rowIndex, value) => {
    setTableData((prev) => {
      const updatedData = prev.map((row) =>
        row.index === rowIndex
          ? {
              ...row,
              val_new: value,
              selected: true,
            }
          : row
      );
      return updatedData;
    });
  }, []);
  
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
    
    // Reset validation states when changing pages
    setValidationStates({});
    
    // Save to localStorage
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
            val_new: row.val_new  
        }));

    if (selectedData.length === 0) {
        setDialogMessage("No changes selected!");
        setDialogOpen(true);
        return;
    }

    try {
        const response = await fetch("/api/config/runtime", {
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

  const handleShowWaitingChange = (newValue) => {
    setShowWaiting(newValue);
  
    if (newValue) {
      setTreeData(prevTreeData => {
        const [allItem] = prevTreeData;
        const restoredGroups = originalGroups.map(group => ({
          label: group.label || "Unnamed Group",
          pages: group.pages.map(page => ({
            label: page.label || "Unnamed Page",
            id: page.id,
            onClick: () => handleFilterChange(page.id, group, page),
          })),
        }));
        return [allItem, ...restoredGroups];
      });
    } else {
      const newVisibleGroups = new Set();
      tableData.forEach(row => {
        if (row.state !== 'U') {
          const groupLabel = row.groupPage.split(' > ')[0];
          newVisibleGroups.add(groupLabel);
        }
      });
      
      setTreeData(prevTreeData => {
        const [allItem, ...groupItems] = prevTreeData;
        const filteredGroupItems = groupItems.filter(group => 
          newVisibleGroups.has(group.label)
        );
        return [allItem, ...filteredGroupItems];
      });
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
      if (selectedPage.id === "allParameters") {
        localStorage.removeItem("selectedPage");
      } else {
        localStorage.setItem("selectedPage", JSON.stringify(selectedPage));
      }
    }
  }, [selectedGroup, selectedPage]);

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
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Box sx={{ 
          width: { xs: '100%', sm: '25%', md: '20%' },
          minWidth: { xs: 'auto', sm: '200px' },
          maxWidth: { xs: '100%', sm: '300px' },
          overflow: 'auto',
          mb: { xs: 2, sm: 0 }
        }}>
          <TreeView treeData={treeData} handleFilterChange={handleFilterChange} />
        </Box>
        <Box sx={{ 
          flex: 1,
          width: '100%',
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
            onShowWaitingChange={handleShowWaitingChange}
          />
        </Box>
      </Box>
      <ApplyMessage open={dialogOpen} onClose={() => setDialogOpen(false)} dialogMessage={dialogMessage} />
    </Box>
  );
}

export default ConfigMain;


