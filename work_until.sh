#!/bin/bash

# Usage: ./work_until.sh TARGET_HOURS WORKED_HOURS [CURRENT_TIME]
# Example: ./work_until.sh 7.6 6.8        -> uses current time
#          ./work_until.sh 7.6 6.8 15:51  -> uses provided time

target_hours=$1
worked_hours=$2
current_time=${3:-$(date +"%H:%M")}

# Calculate remaining time in minutes
remaining_hours=$(echo "$target_hours - $worked_hours" | bc -l)
remaining_minutes=$(printf "%.0f" $(echo "$remaining_hours * 60" | bc -l))

# Parse current time into minutes
IFS=':' read -r hour minute <<< "$current_time"
total_current_minutes=$((hour * 60 + minute))

# Add remaining minutes
end_minutes=$((total_current_minutes + remaining_minutes))

# Convert back to HH:MM
end_hour=$((end_minutes / 60))
end_minute=$((end_minutes % 60))

# Handle 24-hour rollover
end_hour=$((end_hour % 24))

printf "You need to work until: %02d:%02d\n" "$end_hour" "$end_minute"
