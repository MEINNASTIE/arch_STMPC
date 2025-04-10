import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Button, TextField, Paper,Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, StaticTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AnalogClock from './AnalogClock';

const TimeConfig = () => {
  const [time, setTime] = useState(new Date());
  const [isAuto, setIsAuto] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [date, setDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(null);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  useEffect(() => {
    let interval;
    if (isAuto) {
      interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAuto]);

  const handleTimezoneChange = (event) => {
    setSelectedTimezone(event.target.value);
  };

  const handleModeChange = () => {
    setIsAuto(!isAuto);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeDialogClose = () => {
    setShowTimePicker(false);
    setTempTime(null);
  };

  const handleTimeConfirm = () => {
    if (tempTime) {
      setTime(tempTime);
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: selectedTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          
          <AnalogClock time={time} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            onClick={() => setShowDatePicker(true)}
            fullWidth
          >
            {format(date, 'MMMM d, yyyy')}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AccessTimeIcon />}
            onClick={() => setShowTimePicker(true)}
            fullWidth
          >
            {format(time, 'HH:mm:ss')}
          </Button>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={selectedTimezone}
            onChange={handleTimezoneChange}
            label="Timezone"
          >
            {timezones.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleModeChange}
          sx={{ mb: 2 }}
          fullWidth
        >
          {isAuto ? 'Switch to Manual' : 'Switch to Auto'}
        </Button>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
            <DialogTitle>Select Date</DialogTitle>
            <DialogContent>
              <DatePicker
                value={date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </DialogContent>
          </Dialog>

          <Dialog 
            open={showTimePicker} 
            onClose={handleTimeDialogClose}
            PaperProps={{
              sx: {
                '& .MuiDialogContent-root': {
                  padding: 0,
                },
              },
            }}
          >
            <DialogContent>
              <StaticTimePicker
                value={tempTime || time}
                onChange={setTempTime}
                ampm={true}
                orientation="portrait"
                views={['hours', 'minutes']}
                sx={{
                  '& .MuiPickersToolbar-root': {
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                  },
                  '& .MuiClock-pin': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiClockPointer-root': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiClockPointer-thumb': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                  },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleTimeDialogClose}>Cancel</Button>
              <Button onClick={handleTimeConfirm} color="primary">OK</Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default TimeConfig;
