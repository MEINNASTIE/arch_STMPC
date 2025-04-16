import React from "react";
import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";

function AdvancedSettings({ 
  showWaitingHint, 
  showAppId, 
  showAllRTValues, 
  showWaiting,
  showGK,
  toggleWaitingHint, 
  toggleAppId, 
  toggleAllRTValues, 
  toggleShowWaiting,
  toggleGK 
}) {
  return (
    <>
    <Box>
      <Typography variant="h4" sx={{ paddingTop: 6}}>Advanced Settings</Typography>
    </Box>
    <Box sx={{ paddingTop: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <FormControlLabel
        control={<Checkbox checked={showWaitingHint} onChange={toggleWaitingHint} />}
        label="Show Waiting Last Value"
      />
      <FormControlLabel
        control={<Checkbox checked={showAppId} onChange={toggleAppId} />}
        label="Show (app: ID)"
      />
      <FormControlLabel
        control={<Checkbox checked={showAllRTValues} onChange={toggleAllRTValues} />}
        label="Show All RT Values"
      />
      <FormControlLabel
        control={<Checkbox checked={showWaiting} onChange={toggleShowWaiting} />}
        label="Show Waiting"
      />
      <FormControlLabel
        control={<Checkbox checked={showGK} onChange={toggleGK} />}
        label="Show GK"
      />
    </Box>
    </>
  );
}

export default AdvancedSettings;
