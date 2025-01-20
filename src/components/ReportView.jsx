import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import idb from "../idb/idb.js";
import Button from "@mui/material/Button";
import { PieChart } from "@mui/x-charts/PieChart";
import * as React from "react";
import { useState } from "react";
import dayjs from "dayjs";

export default function DatePickerViews() {
  const valueFormatter = (item) => `${item.value}$`;
  const [pieData, setPieData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const handleDatePicker = (date) => {
    const formattedDate = date ? date.format("MM/YYYY") : "";
    setSelectedDate(formattedDate);
  };

  const handleData = async (formatedDate) => {
    try {
      const data = await idb.getReport(formatedDate);
      console.log(`${JSON.stringify(data)}`);
      const formattedData = data.map((item) => ({
        label: ` ${item.category}`,
        value: item.sum,
      }));
      setPieData(formattedData);
    } catch (err) {
      alert(`error fetching chat: ${err}`);
    }
  };

  return (
    <>
      <h3>Select Month and Year:</h3>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            label={"Enter Month and Year"}
            views={["month", "year"]}
            value={selectedDate ? dayjs(selectedDate, "MM/YYYY") : null}
            onChange={handleDatePicker}
          />
        </DemoContainer>
      </LocalizationProvider>
      <div style={{ paddingTop: "20px" }}>
        <Button variant="outlined" onClick={() => handleData(selectedDate)}>
          View Report
        </Button>
      </div>
      <PieChart
        series={[
          {
            data: pieData,
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            valueFormatter,
          },
        ]}
        height={200}
      />
    </>
  );
}
