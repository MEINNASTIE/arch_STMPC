import React, { useState, useEffect } from 'react';
import { Box, Tabs } from "@mui/material";
import runtimeDescData from './RuntimeConfigDesc_en.json';
import TreeView from './components/TreeView';
import ParameterTable from './components/ParameterTable';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

DataTable.use(DT);

function ConfigMain() {
  const [runtimeDesc, setRuntimeDesc] = useState('');
  const [tableData, setTableData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const data = runtimeDescData;
    setRuntimeDesc(JSON.stringify(data, null, 2));
    resolveRefs(data.payload);
    populateTree(data.payload.groups);
    populateTable(data.payload);
  }, []);

  const resolveRefs = (payload) => {
    const resolve = (root, path) => {
      const pathList = path.split('.');
      let current = root;
      pathList.forEach((p) => (current = current[p]));
      return current;
    };

    function traverse(root, obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('$ref:')) {
          const path = obj[key].replace('$ref:', '');
          obj[key] = resolve(root, path);
        } else if (typeof obj[key] === 'object') {
          traverse(root, obj[key]);
        }
      }
    }

    traverse(payload, payload);
  };

  const populateTree = (groups) => {
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
      label: group.label,
      pages: group.pages.map((page) => ({
        label: page.label,
        onClick: () => handlePageItemClick(group.id, page.id),
      })),
    }));

    setTreeData([allItem, ...groupItems]);
  };

  const populateTable = (payload) => {
    const rows = [];
    payload.groups.forEach((group) => {
      group.pages.forEach((page) => {
        page.fields.forEach((field, fieldIndex) => {
          rows.push({
            index: fieldIndex + 1,
            label: field.label,
            gk: field.gk,
            val_new: '',
            val_rt: field.val?.rt === null ? [] : field.val?.rt,
            state: field.val?.state || 'U',
            groupPage: `${group.id}.${page.id}`,
            val_new_last: field.val?.new === null ? '' : field.val?.new,
          });
        });
      });
    });
    setTableData(rows);
    setFilteredData(rows); 
  };

  const handleTreeItemClick = (type) => {
    console.log(`Tree item clicked: ${type}`);
    if (type === 'all') {
      setFilteredData(tableData);
    }
  };

  const handlePageItemClick = (groupId, pageId) => {
    console.log(`Page item clicked: Group ID - ${groupId}, Page ID - ${pageId}`);
    const filtered = tableData.filter(
      (row) => row.groupPage === `${groupId}.${pageId}`
    );
    console.log('Filtered Data:', filtered);
    setFilteredData(filtered);
  };

  const handleApply = () => {
    console.log("Apply clicked");
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
        <ParameterTable tableData={filteredData} handleApply={handleApply} />
      </Box>
    </Box>
  );
}

export default ConfigMain;
