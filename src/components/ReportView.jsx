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
  // added use states
  const [pieData, setPieData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [rawData, setRawData] = useState([]);

  //value formater for the piechart
  const valueFormatter = (item) => `${item.value}$`;

  const handleDatePicker = (date) => {
    const formattedDate = date ? date.format("MM/YYYY") : "";
    setSelectedDate(formattedDate);
  };

  //handle data for selected date
  const handleData = async (formatedDate) => {
    try {
      const detailData = await idb.getDetailedReport(formatedDate); //retrive data for the detailed data
      setRawData(detailData); //set detailed data for usestate

      const data = await idb.getReport(formatedDate); //retrive data for the piechart
      console.log(`${JSON.stringify(data)}`); //shows console.log the sum per category
      //formating the pie chart data in map per label and value
      const formattedData = data.map((item) => ({
        label: ` ${item.category}`,
        value: item.sum,
      }));
      setPieData(formattedData); //set the piedata using useState
    } catch (err) {
      alert(`error fetching chat: ${err}`);
    }
  };
  //return
  return (
    <>
      {/*date component*/}
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
          {/*select date handle*/}
          View Report
        </Button>
      </div>
      {/*piechart component*/}
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
      {/* Display raw data with all keys and values */}
      <div style={{ paddingTop: "20px" }}>
        <h4>Raw Data for {selectedDate}:</h4>
        <div>
          {rawData.length > 0 ? (
            rawData.map((entry, index) => (
              <div key={index}>
                <p>
                  <strong>Category:</strong> {entry.category}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {entry.description || "No description provided"}
                </p>
                <p>
                  <strong>Sum:</strong> ${entry.sum}
                </p>
                <p>
                  <strong>Date:</strong> {entry.date}
                </p>
                {/* Add other fields dynamically */}
                {Object.keys(entry).map((key) => {
                  if (
                    key !== "category" &&
                    key !== "description" &&
                    key !== "sum" &&
                    key !== "date"
                  ) {
                    return (
                      <p key={key}>
                        <strong>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </strong>{" "}
                        {entry[key]}
                      </p>
                    );
                  }
                  return null;
                })}
                <hr />
              </div>
            ))
          ) : (
            <p>No data for the selected month.</p>
          )}
        </div>
      </div>
    </>
  );
}
