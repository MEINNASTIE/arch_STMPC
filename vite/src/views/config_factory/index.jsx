import React, { useState, useEffect } from "react";
import { Box, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import TreeView from "./components/TreeView";
import ParameterTable from "./components/ParameterTable";

// only for testing at home purposes
import runtimeDescData from './RuntimeConfigDesc_en.json'; 

function ConfigMainFactory() {
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filterType, setFilterType] = useState("all"); 
  const [refs, setRefs] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // never forget for dist production to erase the address only leave after /api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://192.168.164.158/api/config/system-desc");
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
    console.log("Populating table with payload:", groups);
    
    const rows = groups.flatMap((group, groupIdx) =>
      group.pages.flatMap((page, pageIdx) =>
        page.fields.map((field, fieldIdx) => ({
          index: field.gk,
          label: field.label,
          gk: field.gk,
          type: field.type,  
          list: field.list,
          val_new: field.val || '',
          val_rt: [],
          state: 'A',
          groupPage: `${group.label || "Unnamed Group"} > ${page.label || "Unnamed Page"}`,
          pageId: page.id,
          val_new_last: field.val || '',
          selected: false,
        }))
      )
    );
  
    console.log("Generated Table Data:", rows);
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
    setTableData((prev) =>
      prev.map((row) =>
        row.index === rowIndex ? { ...row, selected: !row.selected } : row
      )
    );
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

  const handleFilterChange = (filter, group, page) => {
    setFilterType(filter);
    setSelectedGroup(group);
    setSelectedPage(page);
  };  

  const handleApply = async () => {
    const selectedData = tableData
      .filter((row) => row.selected)
      .map((row) => ({
        gk: row.gk,
        val_new: row.val_new,
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

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: "30px 10px",
      }}
    >
      <Tabs value={0} centered></Tabs>
      <Box display="flex" flexGrow={1} gap={2} p={2}>
        <TreeView treeData={treeData} handleFilterChange={handleFilterChange} />
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
        />
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


