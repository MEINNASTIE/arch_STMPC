import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Tabs, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
  const [sidebarOpen, setSidebarOpen] = useState(
    JSON.parse(localStorage.getItem("configSidebarOpen")) ?? true
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");


  const testData = {
    groups: [
      {
        id: "group_ST_SETTINGS",
        label: "ST SETTINGS",
        groups: [
          {
            id: "group_ST_RN",
            label: "Radionuclides",
            pages: [
              {
                id: "page_ST_RN0",
                label: "RN0",
                fields: [
                  {
                    gk: "GASS_SELECTED_RN.RN0_ID",
                    type: "text",
                    label: "Nuclide",
                    pagelabel: true
                  },
                  {
                    gk: "GASS_SELECTED_RN.RN0_UNIT",
                    type: "text",
                    label: "Quantity"
                  }]
              },
              {
                id: "page_ST_RN1",
                label: "RN1",
                fields: [
                  {
                    gk: "GASS_SELECTED_RN.RN1_ID",
                    type: "text",
                    label: "Nuclide",
                    pagelabel: true
                  },
                  {
                    gk: "GASS_SELECTED_RN.RN1_UNIT",
                    type: "text",
                    label: "Quantity",
                    pagelabel: true
                  }]
              }
            ]
          }
        ],
        pages: [
          {
            id: "MPC_SETTINGS",
            label: "Measurement Station Setting",
            fields: [
              {
                gk: "MPC.NAME",
                type: "text",
                label: "Meas. station Name"
              },
              {
                gk: "GASS.MEAS_LOCATION_NAME",
                type: "text",
                label: "Location name"
              }
            ]
          },
          {
            id: "page_2",
            label: "Page 2",
            pages: [
              {
                id: "page_2-1",
                label: "page_2-1",
                fields: []
              },
              {
                id: "page_2-2",
                label: "page_2-2",
                fields: []
              }
            ]     
          }
        ]
      }
    ]
  };

  // never forget for dist production to erase the address only leave after /api
  useEffect(() => {
    const fetchData = async () => {
      try {

        const TEST_MODE = false;
        
        if (TEST_MODE) {
          console.log("Using test data for multilevel grouping");
          const payload = { groups: testData.groups, refs: {} };
          processData(payload);
          setRefs(payload.refs);
          setShowWaiting(true);
          return;
        }

        const response = await fetch("/api/config/runtime-desc");
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

  // Recursive function to process nested groups and pages
  const processGroupForTree = (group, parentPath = []) => {
    const currentPath = [...parentPath, group.id || group.label];
    const groupItem = {
      label: group.label || "Unnamed Group",
      id: group.id,
      path: currentPath,
      groups: [],
      pages: [],
    };

    // Process nested groups
    if (group.groups && Array.isArray(group.groups)) {
      groupItem.groups = group.groups.map((nestedGroup) => 
        processGroupForTree(nestedGroup, currentPath)
      );
    }

    // Process pages (including nested pages)
    if (group.pages && Array.isArray(group.pages)) {
      groupItem.pages = group.pages.map((page) => {
        const pageItem = {
          label: page.label || "Unnamed Page",
          id: page.id,
          onClick: () => handleFilterChange(page.id, group, page),
        };

        // Handle nested pages
        if (page.pages && Array.isArray(page.pages)) {
          pageItem.pages = page.pages.map((nestedPage) => ({
            label: nestedPage.label || "Unnamed Page",
            id: nestedPage.id,
            onClick: () => handleFilterChange(nestedPage.id, group, nestedPage),
          }));
        }

        return pageItem;
      });
    }

    return groupItem;
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

    const groupItems = groups.map((group) => processGroupForTree(group));
    setTreeData([allItem, ...groupItems]);
  };

  const filterGroupsByVisibility = (groups, visibleGroupPaths) => {
    return groups
      .map(group => {
        const groupPath = group.id || group.label;
        const hasVisibleContent = visibleGroupPaths.some(path => 
          path.startsWith(groupPath) || groupPath === path.split(' > ')[0]
        );

        if (!hasVisibleContent) return null;

        const filteredGroup = {
          ...group,
          groups: group.groups ? filterGroupsByVisibility(group.groups, visibleGroupPaths) : undefined,
        };

        if (filteredGroup.groups && filteredGroup.groups.length === 0) {
          delete filteredGroup.groups;
        }

        return filteredGroup;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (tableData.length > 0) {
      const visibleGroupPaths = [];
      tableData.forEach(row => {
        if (showWaiting || row.state !== 'U') { 
          visibleGroupPaths.push(row.groupPage);
        }
      });
      
      const newVisibleGroups = new Set();
      visibleGroupPaths.forEach(path => {
        const groupLabel = path.split(' > ')[0];
        newVisibleGroups.add(groupLabel);
      });
      setVisibleGroups(newVisibleGroups);

      if (showWaiting) {
        setTreeData(prevTreeData => {
          const [allItem] = prevTreeData;
          const restoredGroups = originalGroups.map(group => processGroupForTree(group));
          return [allItem, ...restoredGroups];
        });
      } else {
        setTreeData(prevTreeData => {
          const [allItem] = prevTreeData;
          const filteredGroups = filterGroupsByVisibility(originalGroups, visibleGroupPaths);
          const filteredGroupItems = filteredGroups.map(group => processGroupForTree(group));
          return [allItem, ...filteredGroupItems];
        });
      }
    }
  }, [tableData, showWaiting]);

  const processPagesForTable = (pages, groupPath, pagePath = [], groupIndex = 0, pageIndexOffset = 0) => {
    const rows = [];
    let currentPageIndex = pageIndexOffset;

    pages.forEach((page, pageIndex) => {
      const currentPagePath = [...pagePath, page.id];
      const fullPagePath = currentPagePath.join(' > ');

      if (page.fields && Array.isArray(page.fields)) {
        page.fields.forEach((field, fieldIndex) => {
          rows.push({
            index: `${groupIndex + 1}.${currentPageIndex + 1}.${fieldIndex + 1}`,
            label: field.label,
            gk: field.gk,
            type: field.type,
            val_new: field.val?.new || "",
            val_rt: field.val?.rt || [],
            state: field.val?.state || "U",
            groupPage: `${groupPath.join(' > ')} > ${fullPagePath}`,
            pageId: page.id,
            pageLabelText: page.label || "",
            val_new_last: field.val?.new || '',
            validation: field.validation || null,
            list: field.options || field.list || [],
            pagelabel: field.pagelabel || false  
          });
        });
      }
  
      if (page.pages && Array.isArray(page.pages)) {
        const nestedRows = processPagesForTable(
          page.pages,
          groupPath,
          currentPagePath,
          groupIndex,
          currentPageIndex + 1
        );
        rows.push(...nestedRows);
        currentPageIndex += nestedRows.length > 0 ? Math.ceil(nestedRows.length / (page.pages.length || 1)) : 0;
      } else {
        currentPageIndex++;
      }
    });

    return rows;
  };

  const processGroupsForTable = (groups, groupPath = [], groupIndexOffset = 0) => {
    const rows = [];
    let currentGroupIndex = groupIndexOffset;

    groups.forEach((group, groupIndex) => {
      const currentGroupPath = [...groupPath, group.id || group.label];

      if (group.pages && Array.isArray(group.pages)) {
        const pageRows = processPagesForTable(group.pages, currentGroupPath, [], currentGroupIndex, 0);
        rows.push(...pageRows);
      }

      if (group.groups && Array.isArray(group.groups)) {
        const nestedRows = processGroupsForTable(group.groups, currentGroupPath, currentGroupIndex);
        rows.push(...nestedRows);
        currentGroupIndex += nestedRows.length > 0 ? Math.ceil(nestedRows.length / (group.groups.length || 1)) : 0;
      } else {
        currentGroupIndex++;
      }
    });

    return rows;
  };

  const populateTable = (groups) => {
    const rows = processGroupsForTable(groups);
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

  const getOptionLabel = (list, value) => {
    if (!Array.isArray(list) || value === undefined || value === null) {
      return value ?? "";
    }
    const option = list.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getPrimaryValue = (row) => {
    if (row.val_new !== undefined && row.val_new !== null && row.val_new !== "") {
      return row.val_new;
    }
    if (row.val_rt && row.val_rt.length > 0) {
      return row.val_rt[0]?.val ?? "";
    }
    return "";
  };

  const formatFieldValueForLabel = (row) => {
    if (!row) return "";
    const rawValue = getPrimaryValue(row);
    
    if (row.type === "list_mc") {
      const values = Array.isArray(rawValue)
        ? rawValue
        : typeof rawValue === "string"
          ? rawValue.split("|").map(val => val.trim()).filter(Boolean)
          : [];
      return values
        .map(value => getOptionLabel(row.list, value))
        .filter(Boolean)
        .join(", ");
    }

    if (Array.isArray(rawValue)) {
      return rawValue
        .map(value => getOptionLabel(row.list, value))
        .filter(Boolean)
        .join(", ");
    }

    const formattedValue = getOptionLabel(row.list, rawValue);
    if (typeof formattedValue === "number") {
      return String(formattedValue);
    }
    return formattedValue || "";
  };

  const pageLabelsMap = useMemo(() => {
    if (!Array.isArray(tableData) || tableData.length === 0) return {};

    const accumulator = {};

    tableData.forEach((row) => {
      if (!row.pageId) return;
      if (!accumulator[row.pageId]) {
        accumulator[row.pageId] = {
          baseLabel: row.pageLabelText || "",
          values: []
        };
      }
      if (row.pagelabel) {
        const formattedValue = formatFieldValueForLabel(row);
        if (formattedValue) {
          accumulator[row.pageId].values.push(formattedValue);
        }
      }
    });

    return Object.entries(accumulator).reduce((map, [pageId, data]) => {
      if (data.values.length === 0) return map;
      const combined = [data.baseLabel, ...data.values]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (combined) {
        map[pageId] = combined;
      }
      return map;
    }, {});
  }, [tableData]);

  const pageLabel = useMemo(() => {
    if (!selectedPage) return null;
    return pageLabelsMap[selectedPage.id] || selectedPage.label;
  }, [selectedPage, pageLabelsMap]);

  const findPageInPages = useCallback((pages, targetPageId, currentPath) => {
    if (!Array.isArray(pages)) return null;
    for (const page of pages) {
      const updatedPath = [...currentPath, page.label || "Unnamed Page"];
      if (page.id === targetPageId) {
        return updatedPath;
      }
      if (page.pages) {
        const nestedPath = findPageInPages(page.pages, targetPageId, updatedPath);
        if (nestedPath) return nestedPath;
      }
    }
    return null;
  }, []);

  const findPageBreadcrumb = useCallback((groups, targetPageId, currentPath = []) => {
    if (!Array.isArray(groups)) return null;
    for (const group of groups) {
      const groupLabel = group.label || group.id || "Unnamed Group";
      const updatedPath = [...currentPath, groupLabel];

      if (group.pages) {
        const pagePath = findPageInPages(group.pages, targetPageId, updatedPath);
        if (pagePath) return pagePath;
      }

      if (group.groups) {
        const nestedGroupPath = findPageBreadcrumb(group.groups, targetPageId, updatedPath);
        if (nestedGroupPath) return nestedGroupPath;
      }
    }
    return null;
  }, [findPageInPages]);

  const breadcrumbLabels = useMemo(() => {
    if (filterType === "all") return ["All Parameters"];
    if (filterType === "advanced") return ["Advanced User Settings"];
    if (filterType === "time") return ["Time Settings"];
    if (filterType === "selected") return ["Change", "Selected to Change"];
    if (filterType === "notApplied") return ["Change", "Not yet Applied"];

    if (!selectedPage) {
      const labels = [];
      if (selectedGroup?.label) {
        labels.push(selectedGroup.label);
      }
      if (pageLabel) {
        labels.push(pageLabel);
      } else if (selectedPage?.label) {
        labels.push(selectedPage.label);
      }
      return labels;
    }

    const basePath = findPageBreadcrumb(originalGroups, selectedPage.id) || [];
    const finalLabel = pageLabel || selectedPage.label || "";

    if (basePath.length > 0) {
      const updatedPath = [...basePath];
      updatedPath[updatedPath.length - 1] = finalLabel;
      return updatedPath;
    }

    const fallback = [];
    if (selectedGroup?.label) fallback.push(selectedGroup.label);
    if (finalLabel) fallback.push(finalLabel);
    return fallback;
  }, [filterType, selectedPage, selectedGroup, originalGroups, pageLabel, findPageBreadcrumb]);

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
        const restoredGroups = originalGroups.map(group => processGroupForTree(group));
        return [allItem, ...restoredGroups];
      });
    } else {
      const visibleGroupPaths = [];
      tableData.forEach(row => {
        if (row.state !== 'U') {
          visibleGroupPaths.push(row.groupPage);
        }
      });
      
      setTreeData(prevTreeData => {
        const [allItem, ...groupItems] = prevTreeData;
        const filteredGroups = filterGroupsByVisibility(originalGroups, visibleGroupPaths);
        const filteredGroupItems = filteredGroups.map(group => processGroupForTree(group));
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

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("configSidebarOpen", JSON.stringify(newState));
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
            <TreeView 
              treeData={treeData} 
              handleFilterChange={handleFilterChange}
              selectedGroup={selectedGroup}
              selectedPage={selectedPage}
              pageLabelsMap={pageLabelsMap}
            />
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
            pageLabel={pageLabel}
            breadcrumbLabels={breadcrumbLabels}
            onShowWaitingChange={handleShowWaitingChange}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
          />
        </Box>
      </Box>
      <ApplyMessage open={dialogOpen} onClose={() => setDialogOpen(false)} dialogMessage={dialogMessage} />
    </Box>
  );
}

export default ConfigMain;


