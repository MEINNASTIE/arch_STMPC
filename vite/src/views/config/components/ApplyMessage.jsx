import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";

function ApplyMessage ({ open, onClose, dialogMessage }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Hey there,</DialogTitle>
      <DialogContent>
        <Typography>{dialogMessage}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyMessage;