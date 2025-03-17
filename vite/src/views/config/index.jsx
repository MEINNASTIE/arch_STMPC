import React, { useState, useEffect } from 'react';
import { Box, Tabs } from "@mui/material";
import runtimeDescData from './RuntimeConfigDesc_en.json';
import TreeView from './components/TreeView';
import ParameterTable from './components/ParameterTable';

function ConfigMain() {
  const [runtimeDesc, setRuntimeDesc] = useState('');
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const data = runtimeDescData;
    console.log("Loaded runtimeDescData:", data);
    setRuntimeDesc(JSON.stringify(data, null, 2));
    resolveRefs(data.payload);
    populateTree(data.payload.groups);
    populateTable(data.payload);
  }, []);

  const resolveRefs = (payload) => {
    console.log("Resolving references in payload:", payload);
    const resolve = (root, path) => {
      const pathList = path.split('.');
      let current = root;
      pathList.forEach((p) => {
        if (current[p] !== undefined) {
          current = current[p];
        } else {
          console.warn(`Invalid reference path: ${path}`);
        }
      });
      return current;
    };

    function traverse(root, obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('$ref:')) {
          const path = obj[key].replace('$ref:', '');
          obj[key] = resolve(root, path);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(root, obj[key]);
        }
      }
    }

    traverse(payload, payload);
  };

  const populateTree = (groups) => {
    console.log("Populating tree with groups:", groups);
    const allItem = {
      label: 'All',
      isCollapsible: true,
      pages: [
        { label: 'All', onClick: () => handleTreeItemClick('all') },
        { label: 'Selected to Change', onClick: () => handleTreeItemClick('selected') },
        { label: 'Not yet Applied', onClick: () => handleTreeItemClick('noapplied') },
      ],
    };
  
    const groupItems = groups.map((group) => ({
      label: group.label || 'Unnamed Group',
      pages: group.pages.map((page) => ({
        label: page.label || 'Unnamed Page',
        id: page.id, 
        onClick: () => handlePageItemClick(page.id),
      })),
    }));
  
  
    console.log("Generated treeData:", [allItem, ...groupItems]);
    setTreeData([allItem, ...groupItems]);
  };

  const populateTable = (payload) => {
    console.log("Populating table with payload:", payload);
    const rows = payload.groups.flatMap((group) =>
      group.pages.flatMap((page) =>
        page.fields.map((field, fieldIndex) => ({
          index: fieldIndex + 1,
          label: field.label,
          gk: field.gk,
          val_new: '',
          val_rt: field.val?.rt || [],
          state: field.val?.state || 'U',
          groupPage: `${group.label || 'Unnamed Group'} > ${page.label || 'Unnamed Page'}`, 
          pageId: page.id, 
          val_new_last: field.val?.new || '',
          selected: false,
        }))
      )
    );
    console.log("Generated Table Data:", rows);
    setTableData(rows);
    setFilteredData(rows);
  };
  

  const handleTreeItemClick = (type) => {
    console.log(`Tree item clicked: ${type}`);
  
    if (type === 'all') {
      setFilteredData(tableData);
    } else if (type === 'selected') {
      setFilteredData(tableData.filter(row => row.selected));
    }
  };
  

  const handlePageItemClick = (pageId) => {
    console.log(`Page item clicked: ${pageId}`);
  
    const filtered = tableData.filter((row) => row.pageId === pageId);
  
    console.log("Filtered Data:", filtered);
  
    setFilteredData(filtered);
  
    if (filtered.length === 0) {
      console.warn("No data found for the selected page.");
    }
  };  

  const handleApply = () => {
    console.log("Apply clicked");
  };

  const handleRowSelect = (rowIndex) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.index === rowIndex ? { ...row, selected: !row.selected } : row
      )
    );
  };  

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: '30px 10px',
      }}
    >
      <Tabs value={0} centered></Tabs>
      <Box display="flex" flexGrow={1} gap={2} p={2}>
        <TreeView treeData={treeData} />
        <ParameterTable tableData={filteredData} handleApply={handleApply} setSelectedRows={setSelectedRows}  />
      </Box>
    </Box>
  );
}

export default ConfigMain;
