import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useState } from "react";
import Button from "@mui/material/Button";
import idb from "../idb/idb.js";

//add costForm for the db
export const AddCostForm = () => {
  const [form, setForm] = useState({
    //useState for the text fields in the form
    category: "",
    description: "",
    sum: 0,
  });

  const handleSumChange = (e) => {
    //handler for the sum text fields so it will not be below 0 or string
    const value = e.target.value;
    if (!(value < 0)) {
      setForm({ ...form, sum: parseFloat(e.target.value) });
    }
  };

  const handleSubmit = async () => {
    //async handler for the submit button to save the data in the idb
    if (!form.category || !form.sum || form.sum === 0) {
      alert("didnt fill the form");
      return;
    }
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Add 1 because months are 0-indexed
    const year = now.getFullYear();
    const formattedDate = `${month}/${year}`;
    const data = {
      ...form,
      date: formattedDate,
    };

    try {
      //if success then we passing it through the idb
      await idb.addCost(data);
      alert("Cost added successfully!");
      setForm({ category: "", description: "", sum: 0 });
    } catch (error) {
      console.error("Failed to add cost:", error);
      alert("An error occurred while adding the cost.");
    }
  };

  return (
    //the jsx
    <Box
      component="form"
      sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
      noValidate
      autoComplete="off"
    >
      <Typography
        variant="h3"
        sx={{
          fontSize: "clamp(1.5rem, 5vw, 3rem)", // Font size will range between 1.5rem and 3rem, with 5vw as the preferred value
          textAlign: "center", // Center-align the text
        }}
      >
        Add new cost item:
      </Typography>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Category</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <MenuItem value="">
            <em>Category</em>
          </MenuItem>
          <MenuItem value={"category 1"}>category 1</MenuItem>
          <MenuItem value={"category 2"}>category 2</MenuItem>
          <MenuItem value={"category 3"}>category 3</MenuItem>
        </Select>
      </FormControl>
      <TextField
        id="standard-basic"
        label="description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        variant="standard"
        required
      />
      <TextField
        id="standard-basic"
        label="sum"
        variant="standard"
        required
        value={form.sum}
        type="number"
        onChange={handleSumChange}
      />
      <Button variant="outlined" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};
