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
    { id: 'UTC', label: 'UTC', offset: 0 },
    { id: 'UTC-12', label: 'UTC-12:00', offset: -12 },
    { id: 'UTC-11', label: 'UTC-11:00', offset: -11 },
    { id: 'UTC-10', label: 'UTC-10:00', offset: -10 },
    { id: 'UTC-9', label: 'UTC-09:00', offset: -9 },
    { id: 'UTC-8', label: 'UTC-08:00', offset: -8 },
    { id: 'UTC-7', label: 'UTC-07:00', offset: -7 },
    { id: 'UTC-6', label: 'UTC-06:00', offset: -6 },
    { id: 'UTC-5', label: 'UTC-05:00', offset: -5 },
    { id: 'UTC-4', label: 'UTC-04:00', offset: -4 },
    { id: 'UTC-3', label: 'UTC-03:00', offset: -3 },
    { id: 'UTC-2', label: 'UTC-02:00', offset: -2 },
    { id: 'UTC-1', label: 'UTC-01:00', offset: -1 },
    { id: 'UTC+1', label: 'UTC+01:00', offset: 1 },
    { id: 'UTC+2', label: 'UTC+02:00', offset: 2 },
    { id: 'UTC+3', label: 'UTC+03:00', offset: 3 },
    { id: 'UTC+4', label: 'UTC+04:00', offset: 4 },
    { id: 'UTC+5', label: 'UTC+05:00', offset: 5 },
    { id: 'UTC+6', label: 'UTC+06:00', offset: 6 },
    { id: 'UTC+7', label: 'UTC+07:00', offset: 7 },
    { id: 'UTC+8', label: 'UTC+08:00', offset: 8 },
    { id: 'UTC+9', label: 'UTC+09:00', offset: 9 },
    { id: 'UTC+10', label: 'UTC+10:00', offset: 10 },
    { id: 'UTC+11', label: 'UTC+11:00', offset: 11 },
    { id: 'UTC+12', label: 'UTC+12:00', offset: 12 },
    { id: 'UTC+13', label: 'UTC+13:00', offset: 13 },
    { id: 'UTC+14', label: 'UTC+14:00', offset: 14 }
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
    if (!isAuto) {
      setTime(new Date());
    }
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
      const newTime = new Date(tempTime);
      setTime(newTime);
      if (isAuto) {
        setIsAuto(false);
      }
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  const getAdjustedTime = (date) => {
    if (selectedTimezone === 'UTC') {
      return date;
    }
    
    const timezone = timezones.find(tz => tz.id === selectedTimezone);
    if (!timezone) return date;
    
    const offset = timezone.offset;
    return new Date(date.getTime() + offset * 60 * 60 * 1000);
  };

  const formatTime = (date) => {
    const adjustedDate = getAdjustedTime(date);
    return format(adjustedDate, 'HH:mm:ss');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AnalogClock time={getAdjustedTime(time)} />
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
            {formatTime(time)}
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
              <MenuItem key={tz.id} value={tz.id}>
                {tz.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleModeChange}
          sx={{ mb: 2 }}
          fullWidth
          color={isAuto ? 'primary' : 'secondary'}
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
                onAccept={handleTimeConfirm}
                onClose={handleTimeDialogClose}
                sx={{
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
          </Dialog>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default TimeConfig;
