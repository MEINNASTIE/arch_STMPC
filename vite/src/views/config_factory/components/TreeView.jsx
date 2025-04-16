import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, Collapse, Divider } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

function TreeView({ treeData, handleFilterChange }) {
  const [openGroups, setOpenGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const handleGroupClick = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
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

  const changeGroup = treeData.find(group => group.label === "Change");
  const otherGroups = treeData.filter(group => group.label !== "Change");

  return (
    <Box
      sx={{
        flexBasis: "15%",
        maxHeight: "calc(100vh - 150px)",
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
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
            <ListItem 
              button 
              onClick={() => handleGroupClick(groupIndex)}
              sx={{
                backgroundColor: selectedGroup === group ? '#9fa5f6' : 'inherit',
              }}
            >
              <ListItemText primary={group.label} primaryTypographyProps={{ fontWeight: "bold", color: "#00796b" }} />
              {openGroups[groupIndex] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Divider />
            <Collapse in={openGroups[groupIndex]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {group.pages?.map((page, pageIndex) => (
                  <ListItem 
                    key={pageIndex} 
                    button 
                    sx={{ 
                      pl: 4,
                      backgroundColor: selectedPage === page ? '#9fa5f6' : 'inherit',
                    }} 
                    onClick={() => handleSelection(group, page)}
                  >
                    <ListItemText primary={page.label} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
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
      </List>
    </Box>
  );
}

export default TreeView;
