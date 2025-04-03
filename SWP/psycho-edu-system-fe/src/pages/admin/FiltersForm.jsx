/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Grid, TextField, Select, MenuItem, Button } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const FiltersForm = ({ tempFilters, setTempFilters, applyFilters }) => {
  return (
    <Grid container spacing={2} className="mb-6">
      <Grid item xs={12} sm={6} md={4}>
        <DatePicker
          label="Date"
          format="DD/MM/YYYY"
          value={tempFilters.day}
          onChange={(newValue) =>
            setTempFilters({ ...tempFilters, day: newValue })
          }
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Capacity"
          name="capacity"
          type="number"
          value={tempFilters.capacity}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, capacity: e.target.value })
          }
          variant="outlined"
          size="small"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TimePicker
          label="Time"
          value={tempFilters.time}
          onChange={(newValue) =>
            setTempFilters({ ...tempFilters, time: newValue })
          }
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Minimum Score"
          name="minPoint"
          type="number"
          value={tempFilters.minPoint}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, minPoint: e.target.value })
          }
          variant="outlined"
          size="small"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Select
          fullWidth
          value={tempFilters.dimensionName}
          onChange={(e) =>
            setTempFilters({
              ...tempFilters,
              dimensionName: e.target.value,
            })
          }
          displayEmpty
          size="small"
        >
          <MenuItem value="">Select Dimension Name</MenuItem>
          <MenuItem value="Lo Âu">Anxiety</MenuItem>
          <MenuItem value="Trầm Cảm">Depression</MenuItem>
          <MenuItem value="Căng Thẳng">Stress</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={applyFilters}
          fullWidth
        >
          Apply Filters
        </Button>
      </Grid>
    </Grid>
  );
};

export default FiltersForm;
