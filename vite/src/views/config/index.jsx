import React, { useState, useEffect } from "react";
import { Box, Tabs } from "@mui/material";
import TreeView from "./components/TreeView";
import ParameterTable from "./components/ParameterTable";

function ConfigMain() {
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filterType, setFilterType] = useState("all"); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://192.168.164.158/api/config/runtime-desc");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Loaded runtimeDescData:", data);

        resolveRefs(data.payload);
        populateTree(data.payload.groups);
        populateTable(data.payload.groups);
      } catch (error) {
        console.error("Failed to fetch runtime description:", error);
      }
    };

    fetchData();
  }, []);

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
        
        { label: "Selected to Change", onClick: () => setFilterType("selected") },
        { label: "Not yet Applied", onClick: () => setFilterType("notApplied") },
      ],
    };

    const groupItems = groups.map((group) => ({
      label: group.label || "Unnamed Group",
      pages: group.pages.map((page) => ({
        label: page.label || "Unnamed Page",
        id: page.id,
        onClick: () => setFilterType(page.id),
      })),
    }));

    setTreeData([allItem, ...groupItems]);
  };

  const populateTable = (groups) => {
    console.log("Populating table with payload:", groups);
  
    const rows = groups.flatMap((group, groupIdx) =>
      group.pages.flatMap((page, pageIdx) =>
        page.fields.map((field, fieldIdx) => ({
          index: `${groupIdx + 1}.${pageIdx + 1}.${fieldIdx + 1}`, 
          label: field.label,
          gk: field.gk,
          type: field.type,  
          list: field.list || [],
          val_new: field.type === "list" ? (field.val?.new || "") : "", 
          val_rt: field.val?.rt || [],
          state: field.val?.state || "U",
          groupPage: `${group.label || "Unnamed Group"} > ${page.label || "Unnamed Page"}`,
          pageId: page.id,
          val_new_last: field.val?.new || "",
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

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };  

  const handleApply = async () => {
    const selectedData = tableData
      .filter((row) => row.selected)
      .map((row) => ({
        gk: row.gk,
        val_new: row.val_new,
      }));

    if (selectedData.length === 0) {
      alert("No changes selected!");
      return;
    }

    try {
      const response = await fetch("https://192.168.164.158/api/config/runtime", {
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

      alert("Changes successfully applied!");
    } catch (error) {
      console.error("Error applying changes:", error);
      alert("Failed to apply changes.");
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
        <TreeView treeData={treeData} />
        <ParameterTable tableData={getFilteredData()} handleApply={handleApply} handleRowSelect={handleRowSelect} handleInputChange={handleInputChange} filterType={filterType} handleFilterChange={handleFilterChange}/>
      </Box>
    </Box>
  );
}

export default ConfigMain;
