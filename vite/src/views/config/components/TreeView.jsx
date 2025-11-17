import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemText, Collapse, Divider, useMediaQuery, useTheme } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

function TreeView({ treeData, handleFilterChange, tableData, selectedGroup: propSelectedGroup, selectedPage: propSelectedPage, pageLabelsMap = {} }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openGroups, setOpenGroups] = useState({});
  const [openPages, setOpenPages] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(propSelectedGroup);
  const [selectedPage, setSelectedPage] = useState(propSelectedPage);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const isGroupInPath = (group, selectedPageToCheck) => {
    const pageToCheck = selectedPageToCheck || selectedPage;
    if (!pageToCheck) return false;
    
    if (group.pages) {
      const hasSelectedPage = group.pages.some(page => 
        page.id === pageToCheck.id || 
        (page.pages && page.pages.some(nestedPage => nestedPage.id === pageToCheck.id))
      );
      if (hasSelectedPage) return true;
    }

    if (group.groups) {
      return group.groups.some(nestedGroup => isGroupInPath(nestedGroup, pageToCheck));
    }
    
    return false;
  };

  const isPageInPath = (page, selectedPageToCheck) => {
    const pageToCheck = selectedPageToCheck || selectedPage;
    if (!pageToCheck) return false;
    
    if (page.id === pageToCheck.id) return true;
    
    if (page.pages) {
      return page.pages.some(nestedPage => nestedPage.id === pageToCheck.id);
    }
    
    return false;
  };

  useEffect(() => {
    setSelectedGroup(propSelectedGroup);
    setSelectedPage(propSelectedPage);
    
    if (propSelectedPage && treeData) {
      const expandPath = (groups) => {
        groups.forEach(group => {
          const containsSelected = isGroupInPath(group, propSelectedPage);
          if (containsSelected) {
            const groupId = group.id || group.label;
            setOpenGroups(prev => ({ ...prev, [groupId]: true }));
            
            if (group.pages) {
              group.pages.forEach(page => {
                if (isPageInPath(page, propSelectedPage)) {
                  const pageId = page.id;
                  setOpenPages(prev => ({ ...prev, [pageId]: true }));
                }
              });
            }
            
            if (group.groups) {
              expandPath(group.groups);
            }
          }
        });
      };
      
      const otherGroups = treeData.filter(group => group.label !== "Change");
      expandPath(otherGroups);
    }
  }, [propSelectedGroup, propSelectedPage, treeData]);

  const handleGroupClick = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handlePageClick = (pageId) => {
    setOpenPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  const handleSelection = (group, page) => {
    setSelectedGroup(group);
    setSelectedPage(page);
    setIsAllSelected(false);
    handleFilterChange(page.id, group, page);
  };

  const handleAllSelection = () => {
    setSelectedGroup(null);
    setSelectedPage(null);
    setIsAllSelected(true);
    handleFilterChange("all", null, null);
  };


  const getPageDisplayLabel = (page) => {
    if (!page) return "";
    if (page.id && pageLabelsMap[page.id]) {
      return pageLabelsMap[page.id];
    }
    return page.label;
  };

  const renderGroup = (group, groupKey, depth = 0, parentGroup = null) => {
    const paddingLeft = 4 + (depth * 2);
    const groupId = groupKey || group.id || group.label;
    const isInPath = isGroupInPath(group);

    return (
      <div key={groupId}>
        <ListItem 
          button 
          onClick={() => handleGroupClick(groupId)}
          sx={{
            backgroundColor: isInPath ? '#9fa5f6' : 'inherit',
            pl: paddingLeft,
          }}
        >
          <ListItemText 
            primary={group.label} 
            primaryTypographyProps={{ fontWeight: "bold", color: "#00796b" }} 
          />
          {(group.groups?.length > 0 || group.pages?.length > 0) && (
            openGroups[groupId] ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItem>
        <Collapse in={openGroups[groupId]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {group.groups?.map((nestedGroup, nestedIndex) => 
              renderGroup(nestedGroup, `${groupId}-${nestedIndex}`, depth + 1, group)
            )}
            {group.pages?.map((page, pageIndex) => {
              const pageId = page.id || `${groupId}-page-${pageIndex}`;
              const hasNestedPages = page.pages && page.pages.length > 0;
              const pageIsInPath = isPageInPath(page);

              return (
                <div key={pageId}>
                  <ListItem 
                    button 
                    sx={{ 
                      pl: paddingLeft + 2,
                      backgroundColor: pageIsInPath ? '#9fa5f6' : 'inherit',
                    }} 
                    onClick={() => {
                      if (hasNestedPages) {
                        handlePageClick(pageId);
                      } else {
                        handleSelection(group, page);
                      }
                    }}
                  >
                    <ListItemText primary={getPageDisplayLabel(page)} />
                    {hasNestedPages && (
                      openPages[pageId] ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItem>
                  {hasNestedPages && (
                    <Collapse in={openPages[pageId]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {page.pages.map((nestedPage, nestedPageIndex) => {
                          const nestedPageId = nestedPage.id || `${pageId}-${nestedPageIndex}`;
                          const nestedPageIsInPath = nestedPage.id === selectedPage?.id;
                          return (
                            <ListItem 
                              key={nestedPageId}
                              button 
                              sx={{ 
                                pl: paddingLeft + 4,
                                backgroundColor: nestedPageIsInPath ? '#9fa5f6' : 'inherit',
                              }} 
                              onClick={() => handleSelection(group, nestedPage)}
                            >
                              <ListItemText primary={getPageDisplayLabel(nestedPage)} />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </div>
              );
            })}
          </List>
        </Collapse>
      </div>
    );
  };

  const changeGroup = treeData.find(group => group.label === "Change");
  const otherGroups = treeData.filter(group => group.label !== "Change");

  return (
    <Box
      sx={{
        width: '100%',
        maxHeight: isMobile ? '300px' : "calc(100vh - 300px)",
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: 'white',
      }}
    >
      <List>
        <ListItem 
          button 
          onClick={handleAllSelection}
          sx={{
            backgroundColor: isAllSelected ? '#9fa5f6' : 'inherit',
          }}
        >
          <ListItemText
            primary="All"
            primaryTypographyProps={{ fontWeight: "bold", color: "#00796b" }}
          />
        </ListItem>
        <Divider />

        {otherGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {renderGroup(group, `group-${groupIndex}`, 0)}
            <Divider />
          </div>
        ))}

        {changeGroup && (
          <div>
            <ListItem 
              button 
              onClick={() => handleGroupClick('change')}
              sx={{ 
                backgroundColor: selectedGroup === changeGroup ? '#9fa5f6' : '#3e4aec',
                '& .MuiListItemText-primary': {
                  color: 'white',
                  fontWeight: 'bold'
                },
                '&:hover': {
                  backgroundColor: '#9fa5f6 !important'
                },
                marginTop: '40px'
              }}
            >
              <ListItemText primary={changeGroup.label} />
              {openGroups['change'] ? 
                <ExpandLess sx={{ color: "white" }} /> : 
                <ExpandMore sx={{ color: "white" }} />
              }
            </ListItem>
            <Divider />
            <Collapse in={openGroups['change']} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {changeGroup.pages?.map((page, pageIndex) => (
                  <ListItem 
                    key={pageIndex} 
                    button 
                    sx={{ 
                      pl: 4,
                      backgroundColor: selectedPage === page ? '#9fa5f6' : 'inherit',
                    }} 
                    onClick={() => handleSelection(changeGroup, page)}
                  >
                    <ListItemText primary={page.label} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        )}

        <ListItem 
          button 
          onClick={() => handleFilterChange("advanced", null, null)}
          sx={{ 
            backgroundColor: selectedGroup?.label === "Advanced User Settings" ? '#9fa5f6' : '#3e4aec',
            '& .MuiListItemText-primary': {
              color: 'white',
              fontWeight: 'bold'
            },
            '&:hover': {
              backgroundColor: '#3e4aec !important'
            }
          }}
        >
          <ListItemText primary="Advanced User Settings" />
        </ListItem>
        <Divider />
        <ListItem 
          button 
          onClick={() => handleFilterChange("time", null, null)}
          sx={{ 
            backgroundColor: selectedGroup?.label === "Time Settings" ? '#9fa5f6' : '#3e4aec',
            '& .MuiListItemText-primary': {
              color: 'white',
              fontWeight: 'bold'
            },
            '&:hover': {
              backgroundColor: '#3e4aec !important'
            }
          }}
        >
          <ListItemText primary="Time Settings" />
        </ListItem>
      </List>
    </Box>
  );
}

export default TreeView;
