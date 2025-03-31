import React from "react";
import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";

function AdvancedSettings({ showWaitingHint, showAppId, showAllRTValues, toggleWaitingHint, toggleAppId, toggleAllRTValues }) {
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
    </Box>
    </>
  );
}

export default AdvancedSettings;
